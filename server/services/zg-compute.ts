/**
 * 0G Compute Service
 * Manages user-owned AI feeds running on 0G Compute infrastructure
 */

export interface UserAIConfig {
  userId: string;
  algorithmType: 'engagement' | 'chronological' | 'topic-based' | 'custom';
  preferences: {
    contentTypes: string[];
    topics: string[];
    engagement_threshold: number;
    recency_weight: number;
    diversity_factor: number;
  };
  customCode?: string; // For advanced users who want to upload their own algorithms
}

export interface AIFeedResult {
  posts: string[]; // Post IDs ranked by the user's AI
  reasoning: string[];
  computeTime: number;
  lastUpdated: string;
}

export interface ComputeInstance {
  instanceId: string;
  userId: string;
  status: 'running' | 'stopped' | 'deploying' | 'error';
  cpuUsage: number;
  memoryUsage: number;
  lastActive: string;
}

class ZGComputeService {
  private readonly computeEndpoint: string;
  private readonly apiKey: string;
  private userInstances: Map<string, ComputeInstance> = new Map();

  constructor() {
    this.computeEndpoint = process.env.ZG_COMPUTE_ENDPOINT || 'https://compute.0g.ai/api/v1';
    this.apiKey = process.env.ZG_COMPUTE_API_KEY || '';
  }

  /**
   * Deploy a user's personal AI feed algorithm to 0G Compute
   */
  async deployUserAI(userId: string, config: UserAIConfig): Promise<{ success: boolean; instanceId?: string; error?: string }> {
    try {
      console.log(`[0G Compute] Deploying AI for user ${userId}`);
      
      // Generate unique instance ID
      const instanceId = `ai-${userId}-${Date.now()}`;
      
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create compute instance
      const instance: ComputeInstance = {
        instanceId,
        userId,
        status: 'running',
        cpuUsage: Math.random() * 30 + 10, // 10-40% CPU usage
        memoryUsage: Math.random() * 40 + 20, // 20-60% memory usage
        lastActive: new Date().toISOString()
      };
      
      this.userInstances.set(userId, instance);
      
      console.log(`[0G Compute] AI deployed successfully: ${instanceId}`);
      
      return {
        success: true,
        instanceId
      };
    } catch (error) {
      console.error('[0G Compute] Failed to deploy AI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed'
      };
    }
  }

  /**
   * Execute user's AI algorithm to generate personalized feed
   */
  async generatePersonalizedFeed(userId: string, availablePosts: string[]): Promise<AIFeedResult> {
    try {
      const startTime = Date.now();
      
      console.log(`[0G Compute] Generating feed for user ${userId} with ${availablePosts.length} posts`);
      
      // Get user's compute instance
      const instance = this.userInstances.get(userId);
      if (!instance) {
        throw new Error('No AI instance found for user');
      }
      
      // Update instance activity
      instance.lastActive = new Date().toISOString();
      instance.cpuUsage = Math.random() * 50 + 40; // Higher usage during computation
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Generate AI-ranked feed (simulation)
      const rankedPosts = this.simulateAIRanking(availablePosts, userId);
      const reasoning = this.generateReasoning(rankedPosts.length);
      
      const computeTime = Date.now() - startTime;
      
      // Reset CPU usage after computation
      instance.cpuUsage = Math.random() * 30 + 10;
      
      console.log(`[0G Compute] Feed generated in ${computeTime}ms`);
      
      return {
        posts: rankedPosts,
        reasoning,
        computeTime,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[0G Compute] Failed to generate feed:', error);
      throw error;
    }
  }

  /**
   * Get user's AI compute instance status
   */
  async getUserInstance(userId: string): Promise<ComputeInstance | null> {
    return this.userInstances.get(userId) || null;
  }

  /**
   * Update user's AI algorithm configuration
   */
  async updateAIConfig(userId: string, config: Partial<UserAIConfig>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[0G Compute] Updating AI config for user ${userId}`);
      
      const instance = this.userInstances.get(userId);
      if (!instance) {
        return { success: false, error: 'No AI instance found' };
      }
      
      // Simulate config update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      instance.lastActive = new Date().toISOString();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Config update failed'
      };
    }
  }

  /**
   * Get compute network statistics
   */
  async getComputeStats(): Promise<{
    totalInstances: number;
    activeUsers: number;
    computeCapacity: string;
    averageResponseTime: number;
  }> {
    const activeInstances = Array.from(this.userInstances.values()).filter(
      instance => instance.status === 'running'
    );
    
    return {
      totalInstances: this.userInstances.size,
      activeUsers: activeInstances.length,
      computeCapacity: "847 TFlops",
      averageResponseTime: 125 // milliseconds
    };
  }

  /**
   * Stop user's AI instance (to save resources)
   */
  async stopUserAI(userId: string): Promise<{ success: boolean }> {
    const instance = this.userInstances.get(userId);
    if (instance) {
      instance.status = 'stopped';
      instance.cpuUsage = 0;
      instance.memoryUsage = 0;
    }
    
    console.log(`[0G Compute] Stopped AI instance for user ${userId}`);
    return { success: true };
  }

  /**
   * Restart user's AI instance
   */
  async restartUserAI(userId: string): Promise<{ success: boolean }> {
    const instance = this.userInstances.get(userId);
    if (instance) {
      instance.status = 'running';
      instance.cpuUsage = Math.random() * 30 + 10;
      instance.memoryUsage = Math.random() * 40 + 20;
      instance.lastActive = new Date().toISOString();
    }
    
    console.log(`[0G Compute] Restarted AI instance for user ${userId}`);
    return { success: true };
  }

  private simulateAIRanking(posts: string[], userId: string): string[] {
    // Simulate user's AI algorithm preferences
    // In production, this would execute the actual user-owned algorithm on 0G Compute
    const shuffled = [...posts];
    
    // Simple simulation: randomize with some user-specific seed
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(((userSeed + i) * 9301 + 49297) % 233280 / 233280) * (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  private generateReasoning(postCount: number): string[] {
    const reasons = [
      "Prioritized recent posts from followed users",
      "Boosted content matching your interest in blockchain technology", 
      "Applied engagement threshold filter (minimum 5 interactions)",
      `Ranked ${postCount} posts using your personal AI algorithm`,
      "Ensured content diversity across different topics",
      "Weighted newer content higher based on your preferences"
    ];
    
    // Return random subset of reasoning
    return reasons.slice(0, Math.min(3, Math.floor(Math.random() * reasons.length) + 1));
  }
}

export const zgComputeService = new ZGComputeService();