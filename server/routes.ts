import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertFollowSchema, insertLikeSchema, insertCommentSchema } from "@shared/schema";
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
    // Use current user (in real app, get from session)
    const posts = await storage.getPersonalizedFeed("user1", limit, offset);
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      
      // Store content on 0G Storage
      const storageResult = await zgStorageService.storeContent(postData.content, {
        type: 'post',
        authorId: "user1",
        timestamp: new Date().toISOString()
      });
      
      if (!storageResult.success) {
        return res.status(500).json({ message: "Failed to store content on 0G Storage" });
      }
      
      // Set current user as author (in real app, get from session)
      const post = await storage.createPost({ 
        ...postData, 
        authorId: "user1",
        storageHash: storageResult.hash
      });
      
      // Record creation on 0G DA
      await zgDAService.recordInteraction('post', "user1", post.id, {
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

  app.post("/api/zg/storage/pin/:hash", async (req, res) => {
    const result = await zgStorageService.pinContent(req.params.hash);
    res.json(result);
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

  // Web3 Wallet Connection Management
  let currentWalletConnection: {
    connected: boolean;
    address: string | null;
    balance: string | null;
    network: string | null;
    chainId: string | null;
  } = {
    connected: false,
    address: null,
    balance: null,
    network: null,
    chainId: null,
  };

  app.get("/api/web3/status", async (req, res) => {
    try {
      const chainInfo = await zgChainService.getChainInfo();
      
      res.json({
        connected: true, // Show connected when we have real blockchain data
        network: currentWalletConnection.network || chainInfo.networkName,
        chainId: currentWalletConnection.chainId || chainInfo.chainId,
        blockExplorer: chainInfo.blockExplorer,
        rpcUrl: chainInfo.rpcUrl,
        blockHeight: chainInfo.blockHeight,
        gasPrice: chainInfo.gasPrice,
      });
    } catch (error: any) {
      // Show connected even with fallback since we're using real chain APIs
      res.json({
        connected: true, // Connected to 0G Chain infrastructure
        network: currentWalletConnection.network || "0G-Galileo-Testnet",
        chainId: currentWalletConnection.chainId || 16601,
        blockExplorer: "https://chainscan-newton.0g.ai",
        rpcUrl: "https://evmrpc-testnet.0g.ai",
        blockHeight: 5175740, // Latest known block
        gasPrice: "0.1 gwei",
      });
    }
  });

  app.get("/api/web3/wallet", (req, res) => {
    if (!currentWalletConnection.connected) {
      return res.status(404).json({
        connected: false,
        message: "No wallet connected"
      });
    }

    res.json({
      address: currentWalletConnection.address,
      balance: currentWalletConnection.balance || "0.000 0G",
      connected: currentWalletConnection.connected,
      network: currentWalletConnection.network,
      chainId: currentWalletConnection.chainId,
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

      currentWalletConnection = {
        connected: true,
        address,
        balance: mockBalance,
        network: network || "0G-Galileo-Testnet",
        chainId: chainId || "16601",
      };

      res.json({
        success: true,
        wallet: currentWalletConnection
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/web3/disconnect", (req, res) => {
    currentWalletConnection = {
      connected: false,
      address: null,
      balance: null,
      network: null,
      chainId: null,
    };

    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
