/**
 * 0G Chat Service - Real implementation using 0G Compute Network
 * Integrates with existing DeSocialAI infrastructure for AI-powered chat
 */

import { ethers } from "ethers";
import {
  createZGComputeNetworkBroker,
  type ZGComputeNetworkBroker,
} from "@0glabs/0g-serving-broker";

export interface ChatMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  providerAddress?: string;
  model?: string;
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  ok: boolean;
  providerAddress?: string;
  model?: string;
  verified?: boolean;
  balance?: string;
  result?: any;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Configuration from environment variables
const {
  ZG_PRIVATE_KEY,
  ZG_RPC_URL = "https://evmrpc-testnet.0g.ai",
  ZG_PROVIDER_ADDRESS,
  ZG_MIN_BALANCE = "10.0",
  ZG_TOPUP_AMOUNT = "20.0",
} = process.env;

class ZGChatService {
  private broker: ZGComputeNetworkBroker | null = null;
  private isInitialized = false;
  private walletAddress: string | null = null;

  constructor() {
    console.log('[0G Chat] Service initialized');
  }

  /**
   * Set wallet address for current user session
   */
  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  /**
   * Initialize broker connection
   */
  private async initBroker(): Promise<ZGComputeNetworkBroker> {
    if (!ZG_PRIVATE_KEY) {
      throw new Error("Missing ZG_PRIVATE_KEY environment variable");
    }
    
    const provider = new ethers.JsonRpcProvider(ZG_RPC_URL);
    const wallet = new ethers.Wallet(ZG_PRIVATE_KEY, provider);
    
    console.log('[0G Chat] Initializing broker with wallet:', wallet.address);
    this.broker = await createZGComputeNetworkBroker(wallet);
    this.isInitialized = true;
    
    return this.broker;
  }

  /**
   * Ensure sufficient balance for compute operations
   */
  private async ensureBalance(broker: ZGComputeNetworkBroker): Promise<void> {
    try {
      const acct = await broker.ledger.getLedger();
      // Convert from wei to ETH using ethers
      const balanceInWei = acct.totalBalance.toString();
      const balanceInEth = parseFloat(ethers.formatEther(balanceInWei));
      const min = Number(ZG_MIN_BALANCE);
      
      console.log(`[0G Chat] Current balance: ${balanceInWei} wei (${balanceInEth} OG), minimum required: ${min} OG`);
      
      if (Number.isNaN(balanceInEth)) {
        throw new Error("Cannot parse ledger balance");
      }
      
      if (balanceInEth < min) {
        console.log(`[0G Chat] Balance too low (${balanceInEth} OG < ${min} OG), adding ${ZG_TOPUP_AMOUNT} OG`);
        await broker.ledger.depositFund(Number(ZG_TOPUP_AMOUNT));
        console.log('[0G Chat] ✅ Balance topped up successfully');
        
        // Get updated balance after top-up
        const updatedAcct = await broker.ledger.getLedger();
        const updatedWei = updatedAcct.totalBalance.toString();
        const updatedEth = parseFloat(ethers.formatEther(updatedWei));
        console.log(`[0G Chat] Updated balance after top-up: ${updatedWei} wei (${updatedEth} OG)`);
      }
    } catch (error: any) {
      console.error('[0G Chat] Balance check failed:', error.message);
      throw new Error(`Balance management failed: ${error.message}`);
    }
  }

  /**
   * Resolve service provider and model
   */
  private async resolveService(
    broker: ZGComputeNetworkBroker,
    preferredProvider?: string,
    preferredModel?: string
  ): Promise<{ providerAddress: string; endpoint: string; model: string }> {
    // Use preferred provider if specified
    if (preferredProvider) {
      const meta = await broker.inference.getServiceMetadata(preferredProvider);
      console.log(`[0G Chat] Using preferred provider: ${preferredProvider}, model: ${meta.model}`);
      return { 
        providerAddress: preferredProvider, 
        endpoint: meta.endpoint, 
        model: meta.model 
      };
    }

    // Discover available services
    const list = await broker.inference.listService();
    if (!list.length) {
      throw new Error("No 0G Compute services available");
    }

    // Prefer large language models for chat
    const pick = list.find(s => 
      /llama|deepseek|qwen|mixtral|claude|gpt/i.test(s.model)
    ) ?? list[0];

    const meta = await broker.inference.getServiceMetadata(pick.provider);
    
    console.log(`[0G Chat] Auto-selected provider: ${pick.provider}, model: ${meta.model}`);
    
    return { 
      providerAddress: pick.provider, 
      endpoint: meta.endpoint, 
      model: meta.model 
    };
  }

  /**
   * Acknowledge provider (idempotent operation)
   */
  private async acknowledgeProvider(
    broker: ZGComputeNetworkBroker, 
    providerAddress: string
  ): Promise<void> {
    try {
      await broker.inference.acknowledgeProviderSigner(providerAddress);
      console.log(`[0G Chat] ✅ Provider acknowledged: ${providerAddress}`);
    } catch (error: any) {
      console.log(`[0G Chat] Provider acknowledgment: ${error.message}`);
      // Continue anyway as this might already be acknowledged
    }
  }

  /**
   * Main chat completion method
   */
  async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { messages, providerAddress, model, temperature = 0.7, maxTokens = 1024 } = request;

      if (!messages || messages.length === 0) {
        return {
          ok: false,
          error: "Messages array is required and cannot be empty"
        };
      }

      // Initialize broker if needed
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;

      // Check balance before making request and auto-fund if needed
      const initialAcct = await broker.ledger.getLedger();
      const initialBalanceWei = initialAcct.totalBalance.toString();  
      const initialBalanceEth = parseFloat(ethers.formatEther(initialBalanceWei));
      
      console.log(`[0G Chat] Pre-request balance check: ${initialBalanceWei} wei (${initialBalanceEth} OG)`);
      
      // According to 0G docs: 0.1 OG = ~10,000 requests (0.00001 OG per request)
      // Current balance 2.1 OG should be sufficient for 210,000 requests
      // Only auto-fund if balance is extremely low
      console.log(`[0G Chat] Balance ${initialBalanceEth} OG should support ${Math.floor(initialBalanceEth * 100000)} requests`);
      
      if (initialBalanceEth < 0.001) { // Very minimal threshold - only fund if absolutely necessary
        const neededAmount = Math.min(0.1, 0.1 - initialBalanceEth); // Target 0.1 OG based on documentation
        console.log(`[0G Chat] Balance ${initialBalanceEth} OG insufficient for chat (need ~0.001 OG), auto-funding ${neededAmount} OG...`);
        try {
          await broker.ledger.depositFund(neededAmount);
          console.log(`[0G Chat] ✅ Auto-funding successful: added ${neededAmount} OG`);
          
          // Verify new balance
          const newAcct = await broker.ledger.getLedger();
          const newBalanceWei = newAcct.totalBalance.toString();
          const newBalanceEth = parseFloat(ethers.formatEther(newBalanceWei));
          console.log(`[0G Chat] New balance after funding: ${newBalanceWei} wei (${newBalanceEth} OG)`);
          
          // Continue funding until we reach target (0.1 OG based on documentation)
          if (newBalanceEth < 0.05) {
            const secondFunding = Math.min(0.05, 0.1 - newBalanceEth);
            console.log(`[0G Chat] Still insufficient (${newBalanceEth} OG), second funding: ${secondFunding} OG`);
            await broker.ledger.depositFund(secondFunding);
            
            const finalAcct = await broker.ledger.getLedger();
            const finalBalanceEth = parseFloat(ethers.formatEther(finalAcct.totalBalance.toString()));
            console.log(`[0G Chat] Final balance after second funding: ${finalBalanceEth} OG`);
            
            // One more time if still needed
            if (finalBalanceEth < 0.05) {
              const thirdFunding = Math.min(0.05, 0.1 - finalBalanceEth);
              console.log(`[0G Chat] Third funding attempt: ${thirdFunding} OG`);
              await broker.ledger.depositFund(thirdFunding);
              
              const endAcct = await broker.ledger.getLedger();
              const endBalanceEth = parseFloat(ethers.formatEther(endAcct.totalBalance.toString()));
              console.log(`[0G Chat] End balance after third funding: ${endBalanceEth} OG`);
            }
          }
        } catch (fundError: any) {
          console.error('[0G Chat] Auto-funding failed:', fundError.message);
          throw new Error(`Auto-funding failed: ${fundError.message}`);
        }
      }

      // Resolve service provider and model
      const { 
        providerAddress: selectedProvider, 
        endpoint, 
        model: selectedModel 
      } = await this.resolveService(
        broker, 
        providerAddress || ZG_PROVIDER_ADDRESS, 
        model
      );

      // Check balance before provider acknowledgment
      const preAckAcct = await broker.ledger.getLedger();
      const preAckBalanceWei = preAckAcct.totalBalance.toString();
      const preAckBalanceEth = parseFloat(ethers.formatEther(preAckBalanceWei));
      console.log(`[0G Chat] Balance before provider acknowledgment: ${preAckBalanceWei} wei (${preAckBalanceEth} OG)`);

      // Acknowledge provider
      await this.acknowledgeProvider(broker, selectedProvider);

      // Check balance after provider acknowledgment
      const postAckAcct = await broker.ledger.getLedger();
      const postAckBalanceWei = postAckAcct.totalBalance.toString();
      const postAckBalanceEth = parseFloat(ethers.formatEther(postAckBalanceWei));
      console.log(`[0G Chat] Balance after provider acknowledgment: ${postAckBalanceWei} wei (${postAckBalanceEth} OG)`);

      // Check balance right before request to detect any balance drops
      const preRequestAcct = await broker.ledger.getLedger();
      const preRequestBalanceWei = preRequestAcct.totalBalance.toString();
      const preRequestBalanceEth = parseFloat(ethers.formatEther(preRequestBalanceWei));
      console.log(`[0G Chat] Final balance before request: ${preRequestBalanceWei} wei (${preRequestBalanceEth} OG)`);

      // Generate nonce for request headers
      const nonce = messages[messages.length - 1]?.content?.slice(0, 64) || `nonce-${Date.now()}`;
      
      // Check balance right before getting auth headers (this might lock funds)
      const preAuthAcct = await broker.ledger.getLedger();
      const preAuthBalanceWei = preAuthAcct.totalBalance.toString();
      const preAuthBalanceEth = parseFloat(ethers.formatEther(preAuthBalanceWei));
      console.log(`[0G Chat] Balance before auth headers: ${preAuthBalanceWei} wei (${preAuthBalanceEth} OG)`);
      
      const authHeaders = await broker.inference.getRequestHeaders(selectedProvider, nonce);
      
      // Check balance after getting auth headers
      const postAuthAcct = await broker.ledger.getLedger();
      const postAuthBalanceWei = postAuthAcct.totalBalance.toString();
      const postAuthBalanceEth = parseFloat(ethers.formatEther(postAuthBalanceWei));
      console.log(`[0G Chat] Balance after auth headers: ${postAuthBalanceWei} wei (${postAuthBalanceEth} OG)`);
      
      if (preAuthBalanceEth !== postAuthBalanceEth) {
        console.log(`[0G Chat] ⚠️ Balance changed after auth headers: ${preAuthBalanceEth} → ${postAuthBalanceEth} OG`);
      }

      console.log(`[0G Chat] Sending request to ${endpoint}/chat/completions`);

      // Make request to compute provider
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        
        // Check balance after failed request to see if it changed
        const postFailAcct = await broker.ledger.getLedger();
        const postFailBalanceWei = postFailAcct.totalBalance.toString();
        const postFailBalanceEth = parseFloat(ethers.formatEther(postFailBalanceWei));
        console.log(`[0G Chat] Balance after failed request: ${postFailBalanceWei} wei (${postFailBalanceEth} OG)`);
        
        // Parse provider error to understand balance discrepancy
        if (errorText.includes("insufficient balance")) {
          const feeMatch = errorText.match(/total fee of (\d+)/);
          const availableMatch = errorText.match(/available balance of (\d+)/);
          if (feeMatch && availableMatch) {
            const reqFeeWei = feeMatch[1];
            const availWei = availableMatch[1];
            const reqFeeEth = parseFloat(ethers.formatEther(reqFeeWei));
            const availEth = parseFloat(ethers.formatEther(availWei));
            console.log(`[0G Chat] Provider sees - Required: ${reqFeeEth} OG, Available: ${availEth} OG`);
            console.log(`[0G Chat] Our balance: ${postFailBalanceEth} OG, Provider balance: ${availEth} OG`);
            console.log(`[0G Chat] Discrepancy: ${(postFailBalanceEth - availEth).toFixed(6)} OG`);
          }
        }
        
        throw new Error(`Provider error ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();

      // Verify response for TEE services (optional)
      let verified: boolean | undefined;
      try {
        verified = await broker.inference.processResponse(selectedProvider, data);
      } catch (error) {
        console.log('[0G Chat] Response verification not available or failed');
      }

      // Get updated balance
      const acct = await broker.ledger.getLedger();

      console.log('[0G Chat] ✅ Chat completion successful');

      return {
        ok: true,
        providerAddress: selectedProvider,
        model: selectedModel,
        verified: verified ?? false,
        balance: acct.totalBalance.toString(),
        result: data,
        usage: data.usage
      };

    } catch (error: any) {
      console.error('[0G Chat] Chat completion failed:', error.message);
      return {
        ok: false,
        error: error.message || "Unknown error occurred"
      };
    }
  }

  /**
   * Get service status and available providers
   */
  async getServiceStatus(): Promise<{
    isConfigured: boolean;
    hasPrivateKey: boolean;
    availableProviders: number;
    balance?: string;
    error?: string;
  }> {
    try {
      if (!ZG_PRIVATE_KEY) {
        return {
          isConfigured: false,
          hasPrivateKey: false,
          availableProviders: 0,
          error: "No private key configured"
        };
      }

      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;
      
      // Get available services
      const services = await broker.inference.listService();
      
      // Get balance
      let balance = "0";
      try {
        const acct = await broker.ledger.getLedger();
        balance = acct.totalBalance.toString();
      } catch (error) {
        console.log('[0G Chat] Could not fetch balance:', error);
      }

      return {
        isConfigured: true,
        hasPrivateKey: true,
        availableProviders: services.length,
        balance
      };

    } catch (error: any) {
      return {
        isConfigured: false,
        hasPrivateKey: Boolean(ZG_PRIVATE_KEY),
        availableProviders: 0,
        error: error.message
      };
    }
  }

  /**
   * Create ledger account if it doesn't exist
   */
  async createAccount(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;
      if (!this.walletAddress) {
        throw new Error('Wallet address not set. Please ensure wallet is connected.');
      }
      
      console.log(`[0G Chat] Creating ledger account for wallet: ${this.walletAddress}`);
      
      // Create account with initial funding using addLedger
      const tx = await broker.ledger.addLedger(10.0);
      
      console.log(`[0G Chat] ✅ Account created with 10.0 OG initial funding`);
      
      return {
        success: true,
        txHash: typeof tx === 'object' && tx ? (tx as any).hash || (tx as any).transactionHash : undefined
      };

    } catch (error: any) {
      console.error('[0G Chat] Failed to create account:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add funds to the compute account
   */
  async addFunds(amount: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;
      
      // Check if account exists first
      try {
        await broker.ledger.getLedger();
        console.log('[0G Chat] Account exists, adding funds...');
      } catch (ledgerError: any) {
        if (ledgerError.message.includes('Account does not exist') || ledgerError.reason === 'LedgerNotExists(address)') {
          console.log('[0G Chat] Account does not exist, creating account first...');
          const createResult = await this.createAccount();
          if (!createResult.success) {
            return createResult;
          }
          
          // If requested amount is more than initial 10.0, add the difference
          const requestedAmount = parseFloat(amount);
          if (requestedAmount > 10.0) {
            const additionalAmount = requestedAmount - 10.0;
            console.log(`[0G Chat] Adding additional ${additionalAmount} OG...`);
            const tx = await broker.ledger.addLedger(additionalAmount);
            return {
              success: true,
              txHash: typeof tx === 'object' && tx ? (tx as any).hash || (tx as any).transactionHash : undefined
            };
          }
          
          return createResult;
        }
        throw ledgerError;
      }
      
      // Account exists, add funds using depositFund for existing accounts
      console.log(`[0G Chat] Adding ${amount} OG to existing account...`);
      const tx = await broker.ledger.depositFund(parseFloat(amount));
      
      console.log(`[0G Chat] ✅ Added ${amount} OG to compute account`);
      
      return {
        success: true,
        txHash: typeof tx === 'object' && tx ? (tx as any).hash || (tx as any).transactionHash : undefined
      };

    } catch (error: any) {
      console.error('[0G Chat] Failed to add funds:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const zgChatService = new ZGChatService();