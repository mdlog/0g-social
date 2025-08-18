import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertFollowSchema, insertLikeSchema, insertCommentSchema } from "@shared/schema";
import { generateAIInsights, generateTrendingTopics } from "./services/ai";

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
      // Set current user as author (in real app, get from session)
      const post = await storage.createPost({ ...postData, authorId: "user1" });
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
      res.json(like);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/likes/:postId", async (req, res) => {
    await storage.unlikePost("user1", req.params.postId);
    res.json({ success: true });
  });

  // Comments
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({ ...commentData, authorId: "user1" });
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

  // Web3 Mock Endpoints
  app.get("/api/web3/status", (req, res) => {
    res.json({
      connected: true,
      network: "Newton v2",
      blockHeight: 2847392 + Math.floor(Math.random() * 100),
      gasPrice: "0.1 gwei",
    });
  });

  app.get("/api/web3/wallet", (req, res) => {
    res.json({
      address: "0x742d35Cc1234567890123456789012345678901234",
      balance: "1.234 ETH",
      connected: true,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
