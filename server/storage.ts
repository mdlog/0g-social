import { type User, type Post, type Follow, type Like, type Comment, type Repost, type InsertUser, type InsertPost, type InsertFollow, type InsertLike, type InsertComment, type InsertRepost, type PostWithAuthor, type UserProfile, type UpdateUserProfile } from "@shared/schema";
import { db } from "./db";
import { users, posts, follows, likes, comments, reposts } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress?(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  
  // Posts
  createPost(post: InsertPost & { storageHash?: string; transactionHash?: string; authorId: string }): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByUser(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  getPersonalizedFeed(userId: string, limit?: number, offset?: number): Promise<PostWithAuthor[]>;
  getGlobalFeed(currentUserId?: string, limit?: number, offset?: number): Promise<PostWithAuthor[]>;
  deletePost(id: string): Promise<void>;
  
  // Follows
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowing(userId: string): Promise<User[]>;
  getFollowers(userId: string): Promise<User[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // Likes
  likePost(userId: string, postId: string): Promise<Like>;
  unlikePost(userId: string, postId: string): Promise<void>;
  isPostLiked(userId: string, postId: string): Promise<boolean>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  
  // Reposts
  repostPost(userId: string, postId: string): Promise<Repost>;
  unrepostPost(userId: string, postId: string): Promise<void>;
  isPostReposted(userId: string, postId: string): Promise<boolean>;
  
  // Search
  searchPosts(query: string): Promise<Post[]>;
  
  // Stats
  getNetworkStats(): Promise<{
    activeUsers: number;
    postsToday: number;
    aiInteractions: number;
    dataStored: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Database storage - no initialization needed
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    
    // Migration: Convert old /objects/... paths to /api/objects/... for existing users
    if (user && user.avatar && user.avatar.startsWith('/objects/')) {
      console.log(`Migrating avatar path for user ${user.id}: ${user.avatar} -> /api${user.avatar}`);
      const migratedPath = `/api${user.avatar}`;
      // Update database with new path
      await db.update(users).set({ avatar: migratedPath }).where(eq(users.id, user.id));
      user.avatar = migratedPath;
    }
    
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    const allUsers = await db.select().from(users);
    const lowerQuery = query.toLowerCase();
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(lowerQuery) ||
      user.displayName.toLowerCase().includes(lowerQuery)
    );
  }

  // Post methods
  async createPost(insertPost: InsertPost & { storageHash?: string; transactionHash?: string; authorId: string }): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    const result = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
    return result;
  }

  async getPostsByUser(userId: string, limit = 10, offset = 0): Promise<Post[]> {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async getPersonalizedFeed(userId: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    return this.getGlobalFeed(userId, limit, offset);
  }

  async getGlobalFeed(currentUserId?: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    const allPosts = await this.getPosts(limit, offset);
    const postsWithAuthor: PostWithAuthor[] = [];
    
    for (const post of allPosts) {
      let author = await this.getUser(post.authorId);
      
      // If no user found, try to find by wallet address or create a temp profile for wallet-based posts
      if (!author && post.authorId.startsWith('0x')) {
        author = await this.getUserByWalletAddress(post.authorId);
        
        if (!author) {
          // Create a temp profile for display purposes
          author = {
            id: post.authorId,
            username: `user_${post.authorId.substring(0, 6)}...${post.authorId.substring(post.authorId.length - 4)}`,
            displayName: `User ${post.authorId.substring(0, 6)}...${post.authorId.substring(post.authorId.length - 4)}`,
            email: null,
            bio: null,
            avatar: null,
            walletAddress: post.authorId,
            isVerified: false,
            followingCount: 0,
            followersCount: 0,
            postsCount: 0,
            createdAt: new Date(),
          };
        }
      }
      
      if (author) {
        const isLiked = currentUserId ? await this.isPostLiked(currentUserId, post.id) : false;
        const isReposted = currentUserId ? await this.isPostReposted(currentUserId, post.id) : false;
        
        postsWithAuthor.push({
          ...post,
          author,
          isLiked,
          isReposted,
        });
      }
    }
    
    return postsWithAuthor;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Follow methods
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingIds = await db.select().from(follows).where(eq(follows.followerId, userId));
    const followingUsers = [];
    for (const follow of followingIds) {
      const user = await this.getUser(follow.followingId);
      if (user) followingUsers.push(user);
    }
    return followingUsers;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerIds = await db.select().from(follows).where(eq(follows.followingId, userId));
    const followerUsers = [];
    for (const follow of followerIds) {
      const user = await this.getUser(follow.followerId);
      if (user) followerUsers.push(user);
    }
    return followerUsers;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }

  // Like methods
  async likePost(userId: string, postId: string): Promise<Like> {
    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const result = await db.select().from(comments).where(eq(comments.postId, postId));
    return result;
  }

  // Repost methods
  async repostPost(userId: string, postId: string): Promise<Repost> {
    const [repost] = await db.insert(reposts).values({ userId, postId }).returning();
    return repost;
  }

  async unrepostPost(userId: string, postId: string): Promise<void> {
    await db.delete(reposts).where(and(eq(reposts.userId, userId), eq(reposts.postId, postId)));
  }

  async isPostReposted(userId: string, postId: string): Promise<boolean> {
    const [repost] = await db
      .select()
      .from(reposts)
      .where(and(eq(reposts.userId, userId), eq(reposts.postId, postId)));
    return !!repost;
  }

  // Search methods
  async searchPosts(query: string): Promise<Post[]> {
    const allPosts = await db.select().from(posts);
    const lowerQuery = query.toLowerCase();
    return allPosts.filter(post =>
      post.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Stats
  async getNetworkStats(): Promise<{
    activeUsers: number;
    postsToday: number;
    aiInteractions: number;
    dataStored: string;
  }> {
    const allUsers = await db.select().from(users);
    const allPosts = await db.select().from(posts);
    
    return {
      activeUsers: allUsers.length,
      postsToday: allPosts.length,
      aiInteractions: 12500,
      dataStored: "2.5 PB",
    };
  }
}

export const storage = new DatabaseStorage();