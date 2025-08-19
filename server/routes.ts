import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertFollowSchema, insertLikeSchema, insertCommentSchema, insertRepostSchema, updateUserProfileSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { generateAIInsights, generateTrendingTopics } from "./services/ai";
import { zgStorageService } from "./services/zg-storage";
import { zgComputeService } from "./services/zg-compute";
import { zgDAService } from "./services/zg-da";
import { zgChainService } from "./services/zg-chain";
import { verifyMessage } from "ethers";

// Helper function to get wallet connection from session
function getWalletConnection(req: any) {
  if (!req.session.walletConnection) {
    req.session.walletConnection = {
      connected: false,
      address: null,
      balance: null,
      network: null,
      chainId: null
    };
  }
  return req.session.walletConnection;
}

// WebSocket connection storage
const connectedClients = new Set<WebSocket>();

// Helper function to broadcast to all connected clients
function broadcastToAll(message: any) {
  const messageStr = JSON.stringify(message);
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server on /ws path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    connectedClients.add(ws);
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });
  
  // Auth/Users - Dynamic profile based on connected wallet
  app.get("/api/users/me", async (req, res) => {
    const walletConnection = getWalletConnection(req);
    
    if (!walletConnection.connected || !walletConnection.address) {
      // Return 401 when no wallet connected to indicate authentication required
      return res.status(401).json({
        message: "Wallet connection required",
        details: "Please connect your wallet to access user profile",
        code: "WALLET_NOT_CONNECTED"
      });
    }

    // Try to find existing user by wallet address
    let user = await storage.getUserByWalletAddress(walletConnection.address);
    
    if (!user) {
      // Create new user profile for this wallet address
      const walletShort = walletConnection.address.slice(0, 6) + '...' + walletConnection.address.slice(-4);
      user = await storage.createUser({
        username: `user_${walletShort.toLowerCase()}`,
        displayName: `0G User ${walletShort}`,
        email: null,
        bio: `Decentralized user on 0G Chain • Wallet: ${walletShort}`,
        avatar: null,
        walletAddress: walletConnection.address,
        isVerified: true, // Auto-verify wallet-connected users
        followingCount: 0,
        followersCount: 0,
        postsCount: 0
      });
      console.log(`Created new user for wallet ${walletConnection.address}: ${user.id}`);
    } else {
      console.log(`Found existing user for wallet ${walletConnection.address}: ${user.id}, avatar: ${user.avatar}`);
    }

    // Note: getUserByWalletAddress already recalculates post count for accuracy
    // Force no-cache for user data to ensure avatar updates are reflected immediately
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    console.log(`Returning user data with avatar field:`, JSON.stringify({ id: user.id, avatar: user.avatar }));
    res.json(user);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/search/:query", async (req, res) => {
    const users = await storage.searchUsers(req.params.query);
    res.json(users);
  });

  // Posts
  app.get("/api/posts", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const posts = await storage.getPosts(limit, offset);
    res.json(posts);
  });

  app.get("/api/posts/feed", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Use global feed for social media experience - show ALL posts from ALL users
    const walletData = req.session.walletConnection;
    const currentUserId = walletData?.address || undefined; // For like/repost status
    const posts = await storage.getGlobalFeed(currentUserId, limit, offset);
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    try {
      // Check if wallet is connected
      const walletData = req.session.walletConnection;
      if (!walletData || !walletData.connected || !walletData.address) {
        return res.status(401).json({ 
          message: "Wallet connection required",
          details: "You must connect your wallet to create posts",
          code: "WALLET_NOT_CONNECTED"
        });
      }

      const postData = insertPostSchema.parse(req.body);
      
      // Verify Web3 signature if provided
      if (postData.signature && postData.message && postData.address) {
        const ethers = await import('ethers');
        
        try {
          // Verify the signature matches the expected address
          const recoveredAddress = ethers.verifyMessage(postData.message, postData.signature);
          
          if (recoveredAddress.toLowerCase() !== postData.address.toLowerCase()) {
            return res.status(401).json({
              message: "Invalid signature",
              details: "Signature does not match the provided address"
            });
          }
          
          // Verify the signature is recent (within 5 minutes)
          const signatureAge = Date.now() - (postData.timestamp || 0);
          if (signatureAge > 5 * 60 * 1000) {
            return res.status(401).json({
              message: "Signature expired",
              details: "Signature must be created within the last 5 minutes"
            });
          }
          
          // Verify the signed message contains the post content
          if (!postData.message.includes(postData.content)) {
            return res.status(401).json({
              message: "Invalid signature content",
              details: "Signed message does not contain the post content"
            });
          }
          
          console.log(`✅ Valid signature verified for address: ${postData.address}`);
          
        } catch (signatureError: any) {
          return res.status(401).json({
            message: "Signature verification failed",
            details: signatureError.message
          });
        }
      }
      
      // Get user by wallet address to get their proper user ID
      const user = await storage.getUserByWalletAddress(walletData.address);
      if (!user) {
        return res.status(400).json({
          message: "User not found",
          details: "Please refresh the page and reconnect your wallet"
        });
      }

      // Store content on 0G Storage with wallet signature verification
      const storageResult = await zgStorageService.storeContent(postData.content, {
        type: 'post',
        userId: user.id
      });

      // Handle media upload if provided
      let mediaStorageHash = undefined;
      let mediaTransactionHash = undefined;
      
      if (postData.mediaURL) {
        try {
          const mediaResult = await zgStorageService.confirmMediaUpload(postData.mediaURL, {
            type: 'media',
            userId: user.id,
            originalName: postData.mediaName || 'uploaded_media',
            mimeType: postData.mediaType || 'image/jpeg'
          });
          
          if (mediaResult.success) {
            mediaStorageHash = mediaResult.hash;
            mediaTransactionHash = mediaResult.transactionHash;
          }
        } catch (mediaError) {
          console.warn('[Post Creation] Media upload failed but continuing with post:', mediaError);
        }
      }

      // Create the post in our system regardless of 0G Storage status (graceful degradation)
      const newPost = {
        content: postData.content,
        authorId: user.id, // Use proper user UUID, not wallet address
        imageUrl: postData.mediaURL || null,
        mediaType: postData.mediaType || null,
        mediaStorageHash,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isAiRecommended: Math.random() > 0.7,
        storageHash: storageResult.success ? storageResult.hash || undefined : undefined,
        transactionHash: storageResult.success ? storageResult.transactionHash || undefined : undefined,
        createdAt: new Date()
      };

      // Create the post with proper user reference
      const post = await storage.createPost(newPost);

      // Broadcast new post to all connected WebSocket clients for real-time updates
      broadcastToAll({
        type: 'new_post',
        data: post,
        timestamp: Date.now()
      });

      // If 0G Storage failed, still return success with helpful message
      if (!storageResult.success) {
        console.warn('[Post Creation] 0G Storage failed but post created in feed:', storageResult.error);
        
        return res.status(201).json({ 
          ...post,
          storageStatus: "pending",
          storageError: storageResult.error,
          message: "Post created successfully. 0G Storage upload will retry when network is available."
        });
      }
      
      // Record creation on 0G DA
      await zgDAService.recordInteraction('post', user.id, post.id, {
        content: postData.content,
        storageHash: storageResult.hash
      });
      
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/posts/search/:query", async (req, res) => {
    const posts = await storage.searchPosts(req.params.query);
    res.json(posts);
  });

  app.delete("/api/posts/:id", async (req, res) => {
    await storage.deletePost(req.params.id);
    res.json({ success: true });
  });

  // Follows
  app.post("/api/follows", async (req, res) => {
    try {
      const walletData = req.session.walletConnection;
      if (!walletData || !walletData.connected || !walletData.address) {
        return res.status(401).json({ 
          message: "Wallet connection required",
          details: "You must connect your wallet to follow users"
        });
      }

      const followData = insertFollowSchema.parse(req.body);
      const follow = await storage.followUser(walletData.address, followData.followingId);
      res.json(follow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/follows/:followingId", async (req, res) => {
    const walletData = req.session.walletConnection;
    if (!walletData || !walletData.connected || !walletData.address) {
      return res.status(401).json({ 
        message: "Wallet connection required",
        details: "You must connect your wallet to unfollow users"
      });
    }

    await storage.unfollowUser(walletData.address, req.params.followingId);
    res.json({ success: true });
  });

  app.get("/api/follows/following/:userId", async (req, res) => {
    const following = await storage.getFollowing(req.params.userId);
    res.json(following);
  });

  app.get("/api/follows/followers/:userId", async (req, res) => {
    const followers = await storage.getFollowers(req.params.userId);
    res.json(followers);
  });

  app.get("/api/follows/check/:followingId", async (req, res) => {
    const walletData = req.session.walletConnection;
    if (!walletData || !walletData.connected || !walletData.address) {
      return res.json({ isFollowing: false });
    }

    const isFollowing = await storage.isFollowing(walletData.address, req.params.followingId);
    res.json({ isFollowing });
  });

  // Likes
  app.post("/api/likes", async (req, res) => {
    try {
      const likeData = insertLikeSchema.parse(req.body);
      const like = await storage.likePost("user1", likeData.postId);
      
      // Record like on 0G DA
      await zgDAService.recordInteraction('like', "user1", likeData.postId, {
        action: 'like'
      });
      
      res.json(like);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/likes/:postId", async (req, res) => {
    await storage.unlikePost("user1", req.params.postId);
    
    // Record unlike on 0G DA (negative interaction)
    await zgDAService.recordInteraction('like', "user1", req.params.postId, {
      action: 'unlike'
    });
    
    res.json({ success: true });
  });

  // Comments
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({ ...commentData, authorId: "user1" });
      
      // Record comment on 0G DA
      await zgDAService.recordInteraction('comment', "user1", commentData.postId, {
        commentId: comment.id,
        content: commentData.content
      });
      
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/comments/:postId", async (req, res) => {
    const comments = await storage.getCommentsByPost(req.params.postId);
    res.json(comments);
  });

  // Reposts
  app.post("/api/reposts", async (req, res) => {
    try {
      const repostData = insertRepostSchema.parse(req.body);
      const repost = await storage.repostPost("user1", repostData.postId);
      
      // Record repost on 0G DA
      await zgDAService.recordInteraction('repost', "user1", repostData.postId, {
        action: 'repost',
        repostId: repost.id
      });
      
      res.json(repost);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/reposts/:postId", async (req, res) => {
    await storage.unrepostPost("user1", req.params.postId);
    
    // Record unrepost on 0G DA (negative interaction)
    await zgDAService.recordInteraction('repost', "user1", req.params.postId, {
      action: 'unrepost'
    });
    
    res.json({ success: true });
  });

  // AI Features
  app.get("/api/ai/insights", async (req, res) => {
    try {
      const insights = await generateAIInsights("user1");
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  app.get("/api/ai/trending", async (req, res) => {
    try {
      const trending = await generateTrendingTopics();
      res.json(trending);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate trending topics" });
    }
  });

  // Network Stats
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getNetworkStats();
    res.json(stats);
  });

  // 0G Chain Infrastructure Endpoints
  
  // 0G Storage
  app.get("/api/zg/storage/stats", async (req, res) => {
    const stats = await zgStorageService.getStorageStats();
    res.json(stats);
  });

  // 0G Storage Content Retrieval
  app.get("/api/zg/storage/content/:hash", async (req, res) => {
    try {
      const result = await zgStorageService.retrieveContent(req.params.hash);
      if (result.error) {
        return res.status(404).json({ message: result.error });
      }
      res.json({ content: result.content, metadata: result.metadata });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to retrieve content from 0G Storage" });
    }
  });

  // New endpoint to verify transaction on 0G Chain
  app.get("/api/zg/chain/transaction/:hash", async (req, res) => {
    try {
      const txHash = req.params.hash;
      
      // Verify transaction exists on 0G Chain
      const result = await zgChainService.getTransactionStatus(txHash);
      
      if (result.success) {
        res.json({
          transactionHash: txHash,
          status: result.status,
          blockNumber: result.blockNumber,
          confirmations: result.confirmations,
          timestamp: result.timestamp,
          verified: true
        });
      } else {
        res.status(404).json({ 
          message: "Transaction not found on 0G Chain",
          transactionHash: txHash,
          verified: false
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to verify transaction on 0G Chain",
        error: error.message
      });
    }
  });

  // Endpoint to check 0G Storage connectivity and status
  app.get("/api/zg/storage/status", async (req, res) => {
    try {
      // Check if 0G Storage service is properly configured
      const hasPrivateKey = !!process.env.ZG_PRIVATE_KEY;
      const rpcUrl = process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
      const indexerUrl = process.env.ZG_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai';
      
      // Try to test connection to indexer
      let indexerConnected = false;
      let indexerError = null;
      
      try {
        const response = await fetch(indexerUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        indexerConnected = response.ok || response.status < 500;
      } catch (error: any) {
        indexerError = error.message;
      }
      
      res.json({
        configured: hasPrivateKey,
        indexerConnected,
        indexerError,
        endpoints: {
          rpc: rpcUrl,
          indexer: indexerUrl
        },
        status: hasPrivateKey && indexerConnected ? 'operational' : 'degraded',
        issues: [
          ...(!hasPrivateKey ? ['No ZG_PRIVATE_KEY configured - storage operations will fail'] : []),
          ...(!indexerConnected ? [`Galileo indexer unavailable: ${indexerError || 'connection failed'}`] : [])
        ]
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to check 0G Storage status",
        error: error.message
      });
    }
  });

  // 0G Compute - User AI Management
  app.post("/api/zg/compute/deploy", async (req, res) => {
    try {
      const userId = "user1"; // In real app, get from session
      const config = {
        userId,
        algorithmType: req.body.algorithmType || 'engagement',
        preferences: req.body.preferences || {
          contentTypes: ['text', 'image'],
          topics: ['blockchain', 'ai', 'tech'],
          engagement_threshold: 5,
          recency_weight: 0.7,
          diversity_factor: 0.3
        }
      };
      
      const result = await zgComputeService.deployUserAI(userId, config);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/zg/compute/instance", async (req, res) => {
    const instance = await zgComputeService.getUserInstance("user1");
    res.json(instance);
  });

  app.get("/api/zg/compute/stats", async (req, res) => {
    const stats = await zgComputeService.getComputeStats();
    res.json(stats);
  });

  app.post("/api/zg/compute/feed", async (req, res) => {
    try {
      const userId = "user1";
      const posts = await storage.getPosts(50, 0); // Get posts for AI ranking
      const postIds = posts.map(p => p.id);
      
      const aiResult = await zgComputeService.generatePersonalizedFeed(userId, postIds);
      res.json(aiResult);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 0G Data Availability
  app.get("/api/zg/da/stats", async (req, res) => {
    const stats = await zgDAService.getDAStats();
    res.json(stats);
  });

  app.get("/api/zg/da/history", async (req, res) => {
    const userId = req.query.userId as string;
    const type = req.query.type as any;
    const targetId = req.query.targetId as string;
    
    const history = await zgDAService.getInteractionHistory(userId, targetId, type);
    res.json(history);
  });

  app.get("/api/zg/da/verify/:txId", async (req, res) => {
    const result = await zgDAService.verifyInteraction(req.params.txId);
    res.json(result);
  });

  // Demo endpoint to test DA recording
  app.post("/api/zg/da/demo", async (req, res) => {
    const { type, userId = "demo-user", targetId = "demo-target", data = {} } = req.body;
    
    const result = await zgDAService.recordInteraction(type, userId, targetId, data);
    res.json(result);
  });

  // Web3 Wallet Connection Management (Session-based)
  const getWalletConnection = (req: any) => {
    if (!req.session.walletConnection) {
      req.session.walletConnection = {
        connected: false,
        address: null,
        balance: null,
        network: null,
        chainId: null,
      };
    }
    return req.session.walletConnection;
  };

  app.get("/api/web3/status", async (req, res) => {
    try {
      const chainInfo = await zgChainService.getChainInfo();
      const walletConnection = getWalletConnection(req);
      
      res.json({
        // Infrastructure is connected when we can fetch blockchain data
        infrastructureConnected: true,
        // Wallet connection depends on user connecting MetaMask (per session)
        connected: walletConnection.connected,
        network: walletConnection.network || chainInfo.networkName,
        chainId: walletConnection.chainId || chainInfo.chainId,
        blockExplorer: chainInfo.blockExplorer,
        rpcUrl: chainInfo.rpcUrl,
        blockHeight: chainInfo.blockHeight,
        gasPrice: chainInfo.gasPrice,
      });
    } catch (error: any) {
      // Infrastructure connected, but wallet may not be
      const walletConnection = getWalletConnection(req);
      res.json({
        infrastructureConnected: true, // We can still connect to 0G Chain
        connected: walletConnection.connected,
        network: walletConnection.network || "0G-Galileo-Testnet",
        chainId: walletConnection.chainId || 16601,
        blockExplorer: "https://chainscan-newton.0g.ai",
        rpcUrl: "https://evmrpc-testnet.0g.ai",
        blockHeight: 5175740, // Latest known block
        gasPrice: "0.1 gwei",
      });
    }
  });

  app.get("/api/web3/wallet", (req, res) => {
    const walletConnection = getWalletConnection(req);
    
    if (!walletConnection.connected) {
      return res.status(404).json({
        connected: false,
        message: "No wallet connected"
      });
    }

    res.json({
      address: walletConnection.address,
      balance: walletConnection.balance || "0.000 0G",
      connected: walletConnection.connected,
      network: walletConnection.network,
      chainId: walletConnection.chainId,
    });
  });

  app.post("/api/web3/connect", async (req, res) => {
    try {
      const { address, chainId, network } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // Simulate fetching balance (in real app, you'd query the blockchain)
      const mockBalance = "0.000 0G"; // Could fetch real balance here

      const walletConnection = getWalletConnection(req);
      walletConnection.connected = true;
      walletConnection.address = address;
      walletConnection.balance = mockBalance;
      walletConnection.network = network || "0G-Galileo-Testnet";
      walletConnection.chainId = chainId || "16601";

      res.json({
        success: true,
        wallet: walletConnection
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/web3/disconnect", (req, res) => {
    const walletConnection = getWalletConnection(req);
    walletConnection.connected = false;
    walletConnection.address = null;
    walletConnection.balance = null;
    walletConnection.network = null;
    walletConnection.chainId = null;

    res.json({ success: true });
  });

  // Profile management endpoints
  app.put("/api/users/me", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);
      
      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          message: "Wallet connection required",
          details: "Please connect your wallet to update profile"
        });
      }

      // Validate request body
      const parseResult = updateUserProfileSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid profile data",
          errors: parseResult.error.errors 
        });
      }

      // Get current user
      let user = await storage.getUserByWalletAddress(walletConnection.address);
      
      if (!user) {
        return res.status(404).json({
          message: "User profile not found"
        });
      }

      // Update user profile
      const updatedUser = await storage.updateUserProfile(user.id, parseResult.data);
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Object storage endpoints for avatar upload
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Upload URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Media upload endpoints for posts
  app.post("/api/posts/upload-media", async (req, res) => {
    try {
      const walletData = req.session.walletConnection;
      if (!walletData || !walletData.connected || !walletData.address) {
        return res.status(401).json({ 
          message: "Wallet connection required",
          details: "Please connect your wallet to upload media files"
        });
      }

      // Get user by wallet address
      const user = await storage.getUserByWalletAddress(walletData.address);
      if (!user) {
        return res.status(400).json({
          message: "User not found",
          details: "Please refresh the page and reconnect your wallet"
        });
      }

      // Get upload URL for media file
      const uploadURL = await zgStorageService.getMediaUploadURL();
      
      res.json({ 
        uploadURL,
        message: "Upload URL generated successfully"
      });
    } catch (error: any) {
      console.error('[Media Upload] Failed to generate upload URL:', error);
      res.status(500).json({ 
        message: "Failed to generate media upload URL",
        error: error.message 
      });
    }
  });

  // Direct upload endpoint (simplified for development)
  app.put("/api/upload-direct/:objectId", async (req, res) => {
    try {
      // For development, we'll just confirm the upload
      // In production, this would handle the actual file storage
      const objectId = req.params.objectId;
      
      console.log(`[Media Upload] Direct upload received for object: ${objectId}`);
      
      res.json({ 
        success: true,
        objectId,
        message: "File uploaded successfully" 
      });
    } catch (error: any) {
      console.error('[Media Upload] Direct upload failed:', error);
      res.status(500).json({ 
        message: "Direct upload failed",
        error: error.message 
      });
    }
  });

  // Update avatar after upload
  app.put("/api/users/me/avatar", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);
      
      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          message: "Wallet connection required"
        });
      }

      if (!req.body.avatarURL) {
        return res.status(400).json({ error: "avatarURL is required" });
      }

      // Get current user
      let user = await storage.getUserByWalletAddress(walletConnection.address);
      
      if (!user) {
        return res.status(404).json({
          message: "User profile not found"
        });
      }

      // Normalize object path for storage and convert to /api/objects path
      const objectStorageService = new ObjectStorageService();
      let avatarPath = objectStorageService.normalizeObjectEntityPath(req.body.avatarURL);
      
      // Convert /objects/... to /api/objects/... for frontend consumption
      if (avatarPath.startsWith('/objects/')) {
        avatarPath = `/api${avatarPath}`;
      }

      // Update user avatar with additional logging
      console.log(`Updating avatar for user ${user.id} with path: ${avatarPath}`);
      const updatedUser = await storage.updateUserProfile(user.id, { 
        avatar: avatarPath 
      });
      
      console.log(`Avatar updated successfully. User avatar field:`, updatedUser.avatar);
      
      res.json({
        avatar: avatarPath,
        user: updatedUser
      });
    } catch (error) {
      console.error("Avatar update error:", error);
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });

  // Serve private objects (avatars) - moved to /api path to avoid Vite catch-all
  app.get("/api/objects/:objectPath(*)", async (req, res) => {
    console.log(`🔍 AVATAR REQUEST: ${req.method} ${req.path}`);
    console.log(`🔍 Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    try {
      const objectStorageService = new ObjectStorageService();
      // Convert /api/objects/... to /objects/... for object storage service
      const objectPath = req.path.replace('/api', '');
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      if (!objectFile) {
        console.error(`❌ Object file not found for path: ${objectPath}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      console.log(`✅ Successfully found object file, serving: ${objectPath}`);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("❌ Object download error:", error);
      console.error("❌ Request path:", req.path);
      console.error("❌ Object path:", req.path.replace('/api', ''));
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  return httpServer;
}
