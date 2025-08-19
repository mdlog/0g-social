import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertFollowSchema, insertLikeSchema, insertCommentSchema, insertRepostSchema } from "@shared/schema";
import { generateAIInsights, generateTrendingTopics } from "./services/ai";
import { zgStorageService } from "./services/zg-storage";
import { zgComputeService } from "./services/zg-compute";
import { zgDAService } from "./services/zg-da";
import { zgChainService } from "./services/zg-chain";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth/Users
  app.get("/api/users/me", async (req, res) => {
    // Mock current user (in real app, get from session/auth)
    const user = await storage.getUser("user1");
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
    
    // Use connected wallet address for personalized feed, fallback to general feed
    const walletData = req.session.walletConnection;
    const userId = walletData?.address || "general";
    const posts = await storage.getPersonalizedFeed(userId, limit, offset);
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
      
      // Store content on 0G Storage with wallet signature verification
      const storageResult = await zgStorageService.storeContent(postData.content, {
        type: 'post',
        userId: walletData.address
      });

      // Create the post in our system regardless of 0G Storage status (graceful degradation)
      const newPost = {
        id: Date.now().toString(),
        content: postData.content,
        authorId: walletData.address,
        imageUrl: null,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isAiRecommended: Math.random() > 0.7,
        storageHash: storageResult.success ? storageResult.hash : null,
        transactionHash: storageResult.success ? storageResult.transactionHash : null,
        createdAt: new Date()
      };

      // Use connected wallet address as author
      const post = await storage.createPost(newPost);

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
      await zgDAService.recordInteraction('post', walletData.address, post.id, {
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
      const followData = insertFollowSchema.parse(req.body);
      // Set current user as follower (in real app, get from session)
      const follow = await storage.followUser("user1", followData.followingId);
      res.json(follow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/follows/:followingId", async (req, res) => {
    await storage.unfollowUser("user1", req.params.followingId);
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
    const isFollowing = await storage.isFollowing("user1", req.params.followingId);
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

  const httpServer = createServer(app);
  return httpServer;
}
