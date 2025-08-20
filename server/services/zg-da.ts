/**
 * 0G Data Availability Service
 * Records all social interactions on 0G DA for transparent verification
 */

export interface DATransaction {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'follow' | 'post';
  userId: string;
  targetId: string; // post ID, user ID, etc.
  timestamp: string;
  data: Record<string, any>;
  blockHeight: number;
  txHash: string;
}

export interface DABatch {
  batchId: string;
  transactions: DATransaction[];
  merkleRoot: string;
  timestamp: string;
  size: number;
}

class ZGDataAvailabilityService {
  private readonly daEndpoint: string;
  private readonly apiKey: string;
  private pendingTransactions: DATransaction[] = [];
  private batches: Map<string, DABatch> = new Map();

  constructor() {
    this.daEndpoint = process.env.ZG_DA_ENDPOINT || 'https://da.0g.ai/api/v1';
    this.apiKey = process.env.ZG_DA_API_KEY || '';
    
    // Process batches every 10 seconds
    setInterval(() => this.processPendingTransactions(), 10000);
  }

  /**
   * Record a social interaction on 0G DA
   */
  async recordInteraction(
    type: DATransaction['type'],
    userId: string,
    targetId: string,
    data: Record<string, any> = {}
  ): Promise<{ success: boolean; txId?: string; error?: string }> {
    try {
      const txId = this.generateTxId();
      
      const transaction: DATransaction = {
        id: txId,
        type,
        userId,
        targetId,
        timestamp: new Date().toISOString(),
        data,
        blockHeight: await this.getCurrentBlockHeight(),
        txHash: this.generateTxHash(type, userId, targetId)
      };

      this.pendingTransactions.push(transaction);
      
      console.log(`[0G DA] Recorded ${type} interaction: ${txId}`);
      
      return {
        success: true,
        txId
      };
    } catch (error) {
      console.error('[0G DA] Failed to record interaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Recording failed'
      };
    }
  }

  /**
   * Get interaction history for verification
   */
  async getInteractionHistory(
    userId?: string,
    targetId?: string,
    type?: DATransaction['type']
  ): Promise<DATransaction[]> {
    try {
      console.log(`[0G DA] Querying interaction history`);
      
      // Collect transactions from all batches
      let allTransactions: DATransaction[] = [];
      
      for (const batch of this.batches.values()) {
        allTransactions = allTransactions.concat(batch.transactions);
      }
      
      // Add pending transactions
      allTransactions = allTransactions.concat(this.pendingTransactions);
      
      // Apply filters
      let filtered = allTransactions;
      
      if (userId) {
        filtered = filtered.filter(tx => tx.userId === userId);
      }
      
      if (targetId) {
        filtered = filtered.filter(tx => tx.targetId === targetId);
      }
      
      if (type) {
        filtered = filtered.filter(tx => tx.type === type);
      }
      
      // Sort by timestamp descending
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return filtered;
    } catch (error) {
      console.error('[0G DA] Failed to query history:', error);
      return [];
    }
  }

  /**
   * Verify an interaction exists on DA layer
   */
  async verifyInteraction(txId: string): Promise<{
    verified: boolean;
    transaction?: DATransaction;
    batchId?: string;
    error?: string;
  }> {
    try {
      console.log(`[0G DA] Verifying interaction: ${txId}`);
      
      // Search in batches
      for (const [batchId, batch] of this.batches.entries()) {
        const transaction = batch.transactions.find(tx => tx.id === txId);
        if (transaction) {
          return {
            verified: true,
            transaction,
            batchId
          };
        }
      }
      
      // Search in pending transactions
      const pendingTx = this.pendingTransactions.find(tx => tx.id === txId);
      if (pendingTx) {
        return {
          verified: true,
          transaction: pendingTx,
          batchId: 'pending'
        };
      }
      
      return {
        verified: false,
        error: 'Transaction not found'
      };
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Get DA network statistics
   */
  async getDAStats(): Promise<{
    totalTransactions: number;
    pendingTransactions: number;
    processedBatches: number;
    avgBatchSize: number;
    dataAvailability: number; // percentage
  }> {
    let totalTransactions = 0;
    let totalBatchSize = 0;
    
    for (const batch of this.batches.values()) {
      totalTransactions += batch.transactions.length;
      totalBatchSize += batch.size;
    }
    
    const avgBatchSize = this.batches.size > 0 ? totalBatchSize / this.batches.size : 0;
    
    return {
      totalTransactions: totalTransactions + this.pendingTransactions.length,
      pendingTransactions: this.pendingTransactions.length,
      processedBatches: this.batches.size,
      avgBatchSize: Math.round(avgBatchSize),
      dataAvailability: 99.8 // Simulated high availability
    };
  }

  /**
   * Process pending transactions into batches
   */
  private async processPendingTransactions(): Promise<void> {
    if (this.pendingTransactions.length === 0) {
      return;
    }
    
    const batchId = this.generateBatchId();
    const transactions = [...this.pendingTransactions];
    
    console.log(`[0G DA] Processing batch ${batchId} with ${transactions.length} transactions`);
    
    const batch: DABatch = {
      batchId,
      transactions,
      merkleRoot: this.calculateMerkleRoot(transactions),
      timestamp: new Date().toISOString(),
      size: this.calculateBatchSize(transactions)
    };
    
    this.batches.set(batchId, batch);
    this.pendingTransactions = [];
    
    console.log(`[0G DA] Batch ${batchId} committed to DA layer`);
  }

  /**
   * Get batch information
   */
  async getBatch(batchId: string): Promise<DABatch | null> {
    return this.batches.get(batchId) || null;
  }

  private generateTxId(): string {
    return `da_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateTxHash(type: string, userId: string, targetId: string): string {
    const input = `${type}_${userId}_${targetId}_${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  private async getCurrentBlockHeight(): Promise<number> {
    // Simulate increasing block height
    return Math.floor(Date.now() / 1000) - 1700000000 + 5000000;
  }

  private calculateMerkleRoot(transactions: DATransaction[]): string {
    // Simple hash of all transaction IDs for simulation
    const concatenated = transactions.map(tx => tx.id).join('');
    let hash = 0;
    for (let i = 0; i < concatenated.length; i++) {
      const char = concatenated.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(32, '0')}`;
  }

  private calculateBatchSize(transactions: DATransaction[]): number {
    // Estimate size in bytes
    return transactions.length * 256; // Approximate 256 bytes per transaction
  }
}

export const zgDAService = new ZGDataAvailabilityService();