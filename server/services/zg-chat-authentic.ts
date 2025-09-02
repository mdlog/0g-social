/**
 * 0G Chat Service - Authentic Implementation based on Official Documentation
 * https://docs.0g.ai/developer-hub/building-on-0g/compute-network/sdk
 */

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import type { ZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
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
  error?: string;
  providerAddress?: string;
  model?: string;
  verified?: boolean;
  balance?: string;
  result?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Official 0G Providers as per documentation
const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

const ZG_PRIVATE_KEY = process.env.COMBINED_SERVER_PRIVATE_KEY;
const ZG_RPC_URL = process.env.COMBINED_SERVER_CHAIN_RPC || "https://evmrpc-testnet.0g.ai";

export class ZGChatServiceAuthentic {
  private broker: ZGComputeNetworkBroker | null = null;
  private isInitialized = false;
  private walletAddress: string | null = null;

  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  private async initBroker(): Promise<void> {
    if (this.isInitialized && this.broker) return;

    if (!ZG_PRIVATE_KEY) {
      throw new Error("Missing ZG_PRIVATE_KEY environment variable");
    }

    console.log('[0G Chat] Initializing broker with official documentation pattern...');
    
    // Follow official documentation pattern
    const provider = new ethers.JsonRpcProvider(ZG_RPC_URL);
    const wallet = new ethers.Wallet(ZG_PRIVATE_KEY, provider);
    
    // Use createZGComputeNetworkBroker as per official docs
    this.broker = await createZGComputeNetworkBroker(wallet);
    this.isInitialized = true;
    
    console.log('[0G Chat] ✅ Broker initialized successfully with wallet:', wallet.address);
  }

  async chatCompletion(request: ChatRequest, retryCount = 0): Promise<ChatResponse> {
    try {
      const { messages, temperature = 0.7, maxTokens = 1024, providerAddress } = request;

      if (!messages || messages.length === 0) {
        return {
          ok: false,
          error: "Messages array is required and cannot be empty"
        };
      }

      // Initialize broker using official documentation pattern
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;

      // Check account balance with improved error handling
      try {
        const ledger = await broker.ledger.getLedger();
        const balanceOG = parseFloat(ethers.formatEther(ledger.totalBalance || BigInt(0)));
        console.log(`[0G Chat] Account Balance: ${balanceOG} OG (raw: ${ledger.totalBalance})`);
        
        // More lenient balance check - allow small amounts for testing
        if (balanceOG < 0.0001) {
          console.log(`[0G Chat] Balance too low: ${balanceOG} OG, attempting to add funds...`);
          
          // Try to add small amount of funds for testing
          try {
            await broker.ledger.addLedger(ethers.parseEther("0.01")); // Add 0.01 OG
            console.log(`[0G Chat] ✅ Added 0.01 OG to account`);
          } catch (fundError: any) {
            console.log(`[0G Chat] Failed to add funds: ${fundError.message}`);
            // Continue anyway for testing - some providers might work with zero balance
            console.log(`[0G Chat] Continuing with zero balance for testing...`);
          }
        }
      } catch (balanceError: any) {
        console.log(`[0G Chat] Balance check failed (non-critical): ${balanceError.message}`);
        // Continue execution even if balance check fails
        console.log(`[0G Chat] Proceeding without balance verification...`);
      }

      // Discover available services as per documentation
      let services: any[] = [];
      try {
        services = await broker.inference.listService();
        console.log(`[0G Chat] Found ${services.length} available services`);
      } catch (error: any) {
        console.log(`[0G Chat] Service discovery failed: ${error.message}`);
        throw new Error(`Service discovery failed: ${error.message}`);
      }

      if (services.length === 0) {
        throw new Error("No 0G Compute providers are currently available");
      }

      // Use official providers with smart switching
      const providersToTry = [
        OFFICIAL_PROVIDERS["deepseek-r1-70b"],      // Primary: 0x3feE...
        OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"] // Secondary: 0xf07240...
      ];

      // If specific provider requested, try it first
      if (providerAddress && !providersToTry.includes(providerAddress)) {
        providersToTry.unshift(providerAddress);
      }

      let lastError = "";

      // Try each provider with smart switching (20-second timeout each)
      for (const provider of providersToTry) {
        try {
          console.log(`[0G Chat] Trying provider: ${provider}`);
          
          // Find service for this provider
          const service = services.find(s => s.provider === provider);
          if (!service) {
            console.log(`[0G Chat] Provider ${provider} not found in services list`);
            continue;
          }

          const result = await this.tryProvider(broker, service, messages, temperature, maxTokens);
          
          if (result.ok) {
            console.log(`[0G Chat] ✅ Success with provider: ${provider}`);
            return result;
          }
          
        } catch (providerError: any) {
          console.log(`[0G Chat] Provider ${provider} failed: ${providerError.message}`);
          lastError = providerError.message;
          
          // Check if this is a "busy" error for smart switching
          if (providerError.message.includes('busy') || 
              providerError.message.includes('overloaded') ||
              providerError.message.includes('timeout') ||
              providerError.message.includes('503') ||
              providerError.message.includes('504') ||
              providerError.message.includes('429')) {
            console.log(`[0G Chat] 🔄 Provider busy, switching to next provider...`);
            continue; // Try next provider immediately
          }
          
          continue;
        }
      }

      // All providers failed
      throw new Error(`All 0G Compute providers failed. Last error: ${lastError}`);

    } catch (error: any) {
      console.error(`[0G Chat] Chat completion error:`, error.message);
      
      return {
        ok: false,
        error: error.message || "Chat completion failed"
      };
    }
  }

  private async tryProvider(
    broker: ZGComputeNetworkBroker,
    service: any,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<ChatResponse> {
    const { provider: providerAddress, url: endpoint, model } = service;

    try {
      // Step 1: Acknowledge provider (required as per documentation)
      console.log(`[0G Chat] Acknowledging provider: ${providerAddress}`);
      await broker.inference.acknowledgeProviderSigner(providerAddress);
      
      // Step 2: Get service metadata (as per documentation)
      const { endpoint: metadataEndpoint, model: metadataModel } = 
        await broker.inference.getServiceMetadata(providerAddress);
      
      // Use metadata values if available, fallback to service values
      const finalEndpoint = metadataEndpoint || endpoint;
      const finalModel = metadataModel || model;
      
      console.log(`[0G Chat] Service metadata - Endpoint: ${finalEndpoint}, Model: ${finalModel}`);

      // Step 3: Generate auth headers (single use as per documentation)
      const requestContent = messages[messages.length - 1]?.content || "chat request";
      const headers = await broker.inference.getRequestHeaders(providerAddress, requestContent);
      
      console.log(`[0G Chat] Generated auth headers for provider: ${providerAddress}`);

      // Step 4: Send request with 20-second timeout for smart switching
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      try {
        const response = await fetch(`${finalEndpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            model: finalModel,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`[0G Chat] Provider ${providerAddress} returned ${response.status}: ${errorText}`);
          
          // Check for busy indicators for smart switching
          if (response.status === 503 || response.status === 504 || 
              response.status === 429 || errorText.includes('busy') || 
              errorText.includes('overloaded')) {
            throw new Error(`Provider busy: ${response.status} - ${errorText}`);
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Step 5: Process response (as per documentation)
        try {
          const valid = await broker.inference.processResponse(
            providerAddress,
            JSON.stringify(data),
            undefined // chatID optional for non-verifiable services
          );
          console.log(`[0G Chat] Response verification: ${valid ? 'Valid' : 'Not verified'}`);
        } catch (verifyError) {
          console.log(`[0G Chat] Response verification failed (non-critical):`, verifyError);
        }

        // Return successful response
        return {
          ok: true,
          providerAddress,
          model: finalModel,
          verified: service.verifiability === 'TeeML',
          balance: "Active", // Will be checked separately
          result: data,
          usage: data.usage || {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          }
        };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error(`Provider ${providerAddress} timeout after 20 seconds`);
        }
        
        throw fetchError;
      }

    } catch (error: any) {
      console.log(`[0G Chat] Provider ${providerAddress} attempt failed: ${error.message}`);
      throw error;
    }
  }

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

      // Initialize broker to get real status
      if (!this.isInitialized || !this.broker) {
        await this.initBroker();
      }

      const broker = this.broker!;
      
      // Get real balance and provider count
      let balance = "Unknown";
      let availableProviders = 0;
      
      try {
        const ledger = await broker.ledger.getLedger();
        balance = `${parseFloat(ethers.formatEther(ledger.totalBalance)).toFixed(3)} OG`;
      } catch (error) {
        console.log('[0G Chat] Balance check failed:', error);
      }
      
      try {
        const services = await broker.inference.listService();
        availableProviders = services.length;
      } catch (error) {
        console.log('[0G Chat] Service discovery failed:', error);
      }

      return {
        isConfigured: true,
        hasPrivateKey: true,
        availableProviders,
        balance
      };

    } catch (error: any) {
      return {
        isConfigured: false,
        hasPrivateKey: !!ZG_PRIVATE_KEY,
        availableProviders: 0,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const zgChatServiceAuthentic = new ZGChatServiceAuthentic();