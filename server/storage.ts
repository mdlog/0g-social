import { type User, type Post, type Follow, type Like, type Comment, type Repost, type InsertUser, type InsertPost, type InsertFollow, type InsertLike, type InsertComment, type InsertRepost, type PostWithAuthor, type UserProfile, type UpdateUserProfile, type Share, type CommentLike, type Bookmark, type Collection, type InsertShare, type InsertCommentLike, type InsertBookmark, type InsertCollection } from "@shared/schema";
import { db } from "./db";
import { users, posts, follows, likes, comments, reposts, shares, commentLikes, bookmarks, collections } from "@shared/schema";
import { eq, desc, and, sql, isNull } from "drizzle-orm";
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
  getPostLikes(postId: string): Promise<Like[]>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  getPostComments(postId: string): Promise<Comment[]>;
  
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

  // Trending topics functionality
  getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>>;

  // Wave 2: Advanced Social Features Interface
  // Communities
  getCommunities(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
  }): Promise<any[]>;
  createCommunity(data: any, creatorId: string): Promise<any>;
  joinCommunity(communityId: string, userId: string): Promise<void>;
  leaveCommunity(communityId: string, userId: string): Promise<void>;

  // Hashtags & Content Discovery
  getTrendingHashtags(limit: number, userId?: string): Promise<any[]>;
  getPostsByHashtag(hashtagName: string, page: number, limit: number, userId?: string): Promise<any[]>;

  // Bookmarks & Collections
  getUserBookmarks(userId: string, page: number, limit: number, collectionId?: string): Promise<any[]>;
  createBookmark(data: any, userId: string): Promise<any>;
  removeBookmark(postId: string, userId: string): Promise<void>;
  getUserCollections(userId: string, includeBookmarks?: boolean): Promise<any[]>;
  createCollection(data: any, userId: string): Promise<any>;

  // Creator Economy - Tips & Subscriptions
  createTip(data: any, senderId: string): Promise<any>;
  getReceivedTips(userId: string, page: number, limit: number): Promise<any[]>;
  getSentTips(userId: string, page: number, limit: number): Promise<any[]>;

  // Advanced Interaction Features
  // Thread Comments
  getComment(commentId: string): Promise<Comment | undefined>;
  updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment>;
  getThreadedComments(postId: string, page: number, limit: number): Promise<any[]>;
  getPostCommentsCount(postId: string): Promise<number>;

  // Comment Likes
  createCommentLike(data: { userId: string; commentId: string }): Promise<any>;
  deleteCommentLike(userId: string, commentId: string): Promise<void>;
  getCommentLike(userId: string, commentId: string): Promise<any>;
  getCommentLikesCount(commentId: string): Promise<number>;

  // Content Sharing
  createShare(data: any): Promise<any>;
  getPostShares(postId: string, page: number, limit: number): Promise<any[]>;
  getPostSharesCount(postId: string): Promise<number>;

  // Bookmarks & Collections (enhanced)
  getBookmark(userId: string, postId: string): Promise<any>;
  deleteBookmark(userId: string, postId: string): Promise<void>;
  createCollection(data: any): Promise<any>;
  updateCollection(collectionId: string, updates: any): Promise<any>;
  getCollectionBookmarksCount(collectionId: string): Promise<number>;

  // Update methods for counters
  updatePost(postId: string, updates: Partial<Post>): Promise<Post>;
  
  // Notification methods
  getNotifications(userId: string): Promise<any[]>;
  createNotification(data: any): Promise<any>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Database storage - no initialization needed
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) return undefined;
    
    // Recalculate actual post count based on posts that still exist in database
    const userPosts = await db.select().from(posts).where(eq(posts.authorId, user.id));
    const actualPostCount = userPosts.length;
    
    // Update user's postsCount if it doesn't match the actual count
    if (user.postsCount !== actualPostCount) {
      console.log(`Updating post count for user ${user.id}: ${user.postsCount} -> ${actualPostCount}`);
      await db.update(users).set({ postsCount: actualPostCount }).where(eq(users.id, user.id));
      user.postsCount = actualPostCount;
    }
    
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    
    if (!user) return undefined;
    
    // Migration: Convert old /objects/... paths to /api/objects/... for existing users
    if (user.avatar && user.avatar.startsWith('/objects/')) {
      console.log(`Migrating avatar path for user ${user.id}: ${user.avatar} -> /api${user.avatar}`);
      const migratedPath = `/api${user.avatar}`;
      // Update database with new path
      await db.update(users).set({ avatar: migratedPath }).where(eq(users.id, user.id));
      user.avatar = migratedPath;
    }
    
    // Recalculate actual post count based on posts that still exist in database
    const userPosts = await db.select().from(posts).where(eq(posts.authorId, user.id));
    const actualPostCount = userPosts.length;
    
    // Update user's postsCount if it doesn't match the actual count
    if (user.postsCount !== actualPostCount) {
      console.log(`Updating post count for user ${user.id}: ${user.postsCount} -> ${actualPostCount}`);
      await db.update(users).set({ postsCount: actualPostCount }).where(eq(users.id, user.id));
      user.postsCount = actualPostCount;
    }
    
    return user;
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
    
    // Increment the author's posts count
    await db
      .update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, insertPost.authorId));
    
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

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<void> {
    await db.update(posts).set(updates).where(eq(posts.id, id));
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
    
    // Update likes count in posts table
    await db.update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
    
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    // Update likes count in posts table
    await db.update(posts)
      .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
      .where(eq(posts.id, postId));
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!like;
  }

  async getPostLikes(postId: string): Promise<Like[]> {
    const result = await db.select().from(likes).where(eq(likes.postId, postId));
    return result;
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values({
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content
    }).returning();
    
    // Update comments count in posts table
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<any[]> {
    const result = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        content: comments.content,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
          walletAddress: users.walletAddress
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
    
    return result.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author
    }));
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    const result = await db.select().from(comments).where(eq(comments.postId, postId));
    return result;
  }

  // Repost methods
  async repostPost(userId: string, postId: string): Promise<Repost> {
    const [repost] = await db.insert(reposts).values({ userId, postId }).returning();
    
    // Update shares count in posts table
    await db.update(posts)
      .set({ sharesCount: sql`${posts.sharesCount} + 1` })
      .where(eq(posts.id, postId));
    
    return repost;
  }

  async unrepostPost(userId: string, postId: string): Promise<void> {
    await db.delete(reposts).where(and(eq(reposts.userId, userId), eq(reposts.postId, postId)));
    
    // Update shares count in posts table
    await db.update(posts)
      .set({ sharesCount: sql`GREATEST(${posts.sharesCount} - 1, 0)` })
      .where(eq(posts.id, postId));
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

  // Wave 2: Advanced Social Features Implementation (Stub methods for now)
  async getCommunities(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
  }): Promise<any[]> {
    // TODO: Implement communities fetching with database queries
    return [];
  }

  async createCommunity(data: any, creatorId: string): Promise<any> {
    // TODO: Implement community creation
    throw new Error("Community creation not yet implemented");
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    // TODO: Implement join community
    throw new Error("Join community not yet implemented");
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    // TODO: Implement leave community
    throw new Error("Leave community not yet implemented");
  }

  async getTrendingHashtags(limit: number, userId?: string): Promise<any[]> {
    // TODO: Implement trending hashtags based on recent usage
    return [
      {
        id: "1",
        name: "0GChain",
        postsCount: 127,
        trendingScore: 95.5,
        isFollowing: false
      },
      {
        id: "2", 
        name: "DeSocialAI",
        postsCount: 89,
        trendingScore: 87.2,
        isFollowing: true
      },
      {
        id: "3",
        name: "BlockchainSocial",
        postsCount: 56,
        trendingScore: 76.8,
        isFollowing: false
      }
    ];
  }

  async getPostsByHashtag(hashtagName: string, page: number, limit: number, userId?: string): Promise<any[]> {
    // TODO: Implement hashtag post filtering
    return [];
  }

  async getUserBookmarks(userId: string, page: number, limit: number, collectionId?: string): Promise<any[]> {
    // TODO: Implement user bookmarks fetching
    return [];
  }

  async createBookmark(data: any, userId: string): Promise<any> {
    // TODO: Implement bookmark creation
    throw new Error("Bookmark creation not yet implemented");
  }

  async removeBookmark(postId: string, userId: string): Promise<void> {
    // TODO: Implement bookmark removal
    throw new Error("Remove bookmark not yet implemented");
  }

  async getUserCollections(userId: string, includeBookmarks?: boolean): Promise<any[]> {
    // TODO: Implement user collections fetching
    return [];
  }

  async createCollection(data: any, userId: string): Promise<any> {
    // TODO: Implement collection creation
    throw new Error("Collection creation not yet implemented");
  }

  async createTip(data: any, senderId: string): Promise<any> {
    // TODO: Implement tip creation with 0G Chain transaction
    throw new Error("Tip creation not yet implemented");
  }

  async getReceivedTips(userId: string, page: number, limit: number): Promise<any[]> {
    // TODO: Implement received tips fetching
    return [];
  }

  async getSentTips(userId: string, page: number, limit: number): Promise<any[]> {
    // TODO: Implement sent tips fetching
    return [];
  }

  // Wave 2: Advanced Interaction Features Implementation
  
  async getComment(commentId: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId));
    return comment || undefined;
  }

  async updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment> {
    const [comment] = await db.update(comments).set(updates).where(eq(comments.id, commentId)).returning();
    if (!comment) throw new Error("Comment not found");
    return comment;
  }

  async getThreadedComments(postId: string, page: number, limit: number): Promise<any[]> {
    const offset = (page - 1) * limit;
    
    // Get top-level comments first
    const topLevelComments = await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId)))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    const commentsWithAuthor = [];
    
    for (const comment of topLevelComments) {
      const author = await this.getUser(comment.authorId);
      if (author) {
        // Get replies for this comment
        const replies = await this.getCommentReplies(comment.id);
        
        commentsWithAuthor.push({
          ...comment,
          author: {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar
          },
          replies
        });
      }
    }

    return commentsWithAuthor;
  }

  async getCommentReplies(parentCommentId: string): Promise<any[]> {
    const replies = await db
      .select()
      .from(comments)
      .where(eq(comments.parentCommentId, parentCommentId))
      .orderBy(desc(comments.createdAt));

    const repliesWithAuthor = [];
    
    for (const reply of replies) {
      const author = await this.getUser(reply.authorId);
      if (author) {
        // Recursively get nested replies
        const nestedReplies = await this.getCommentReplies(reply.id);
        
        repliesWithAuthor.push({
          ...reply,
          author: {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar
          },
          replies: nestedReplies
        });
      }
    }

    return repliesWithAuthor;
  }

  async getPostCommentsCount(postId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.postId, postId));
    
    return result[0]?.count || 0;
  }

  async createCommentLike(data: { userId: string; commentId: string }): Promise<any> {
    const [like] = await db.insert(commentLikes).values(data).returning();
    return like;
  }

  async deleteCommentLike(userId: string, commentId: string): Promise<void> {
    await db.delete(commentLikes).where(
      and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId))
    );
  }

  async getCommentLike(userId: string, commentId: string): Promise<any> {
    const [like] = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)));
    
    return like || null;
  }

  async getCommentLikesCount(commentId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));
    
    return result[0]?.count || 0;
  }

  async createShare(data: any): Promise<any> {
    const [share] = await db.insert(shares).values(data).returning();
    return share;
  }

  async getPostShares(postId: string, page: number, limit: number): Promise<any[]> {
    const offset = (page - 1) * limit;
    
    const postShares = await db
      .select()
      .from(shares)
      .where(eq(shares.postId, postId))
      .orderBy(desc(shares.createdAt))
      .limit(limit)
      .offset(offset);

    const sharesWithDetails = [];
    
    for (const share of postShares) {
      const user = await this.getUser(share.userId);
      const post = await this.getPost(share.postId);
      
      if (user && post) {
        const postAuthor = await this.getUser(post.authorId);
        
        sharesWithDetails.push({
          ...share,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar
          },
          post: {
            ...post,
            author: postAuthor ? {
              id: postAuthor.id,
              username: postAuthor.username,
              displayName: postAuthor.displayName,
              avatar: postAuthor.avatar
            } : null
          }
        });
      }
    }

    return sharesWithDetails;
  }

  async getPostSharesCount(postId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(shares)
      .where(eq(shares.postId, postId));
    
    return result[0]?.count || 0;
  }

  async getBookmark(userId: string, postId: string): Promise<any> {
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
    
    return bookmark || null;
  }

  async deleteBookmark(userId: string, postId: string): Promise<void> {
    await db.delete(bookmarks).where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId))
    );
  }

  async createCollection(data: any): Promise<any> {
    const [collection] = await db.insert(collections).values(data).returning();
    return collection;
  }

  async updateCollection(collectionId: string, updates: any): Promise<any> {
    const [collection] = await db.update(collections).set(updates).where(eq(collections.id, collectionId)).returning();
    if (!collection) throw new Error("Collection not found");
    return collection;
  }

  async getCollectionBookmarksCount(collectionId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(eq(bookmarks.collectionId, collectionId));
    
    return result[0]?.count || 0;
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    const [post] = await db.update(posts).set(updates).where(eq(posts.id, postId)).returning();
    if (!post) throw new Error("Post not found");
    return post;
  }

  async getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>> {
    // TODO: Implement trending topics analysis
    return [
      { topic: "0G Chain", count: 42, sentiment: "positive" },
      { topic: "DeSocialAI", count: 38, sentiment: "positive" },
      { topic: "Decentralization", count: 29, sentiment: "positive" },
    ];
  }

  // Notification methods
  async getNotifications(userId: string): Promise<any[]> {
    // For now, return mock notifications since we need to implement the database structure
    return [
      {
        id: '1',
        userId,
        type: 'like',
        title: 'Your post received a like',
        message: 'Someone liked your post about 0G Chain',
        isRead: false,
        createdAt: new Date().toISOString(),
        metadata: {
          postPreview: '0G Chain is revolutionizing decentralized infrastructure...'
        }
      },
      {
        id: '2',
        userId,
        type: 'comment',
        title: 'New comment on your post',
        message: 'Someone commented on your post',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        metadata: {
          postPreview: 'DeSocialAI represents the future of social media...'
        }
      }
    ];
  }

  async createNotification(data: any): Promise<any> {
    // Mock implementation - in real app, this would create a notification in the database
    return { id: randomUUID(), ...data, createdAt: new Date().toISOString() };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    // Mock implementation - would update notification as read in database
    console.log(`Marked notification ${notificationId} as read for user ${userId}`);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    // Mock implementation - would mark all user notifications as read
    console.log(`Marked all notifications as read for user ${userId}`);
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }
}

export const storage = new DatabaseStorage();