/**
 * Direct test of 0G Compute Network using official SDK
 * This bypasses session management to test the core functionality
 */

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

// Configuration
const ZG_PRIVATE_KEY = process.env.COMBINED_SERVER_PRIVATE_KEY;
const ZG_RPC_URL = "https://evmrpc-testnet.0g.ai";

// Official providers from documentation
const PROVIDERS = {
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
};

async function testZGCompute() {
  console.log('🧪 Testing 0G Compute Network with official SDK...');
  
  if (!ZG_PRIVATE_KEY) {
    console.log('❌ Missing COMBINED_SERVER_PRIVATE_KEY');
    return;
  }

  try {
    // Step 1: Initialize broker (as per documentation)
    console.log('[1/6] Initializing broker...');
    const provider = new ethers.JsonRpcProvider(ZG_RPC_URL);
    const wallet = new ethers.Wallet(ZG_PRIVATE_KEY, provider);
    const broker = await createZGComputeNetworkBroker(wallet);
    console.log(`✅ Broker initialized for wallet: ${wallet.address}`);

    // Step 2: Check balance
    console.log('[2/6] Checking account balance...');
    try {
      const ledger = await broker.ledger.getLedger();
      const balance = parseFloat(ethers.formatEther(ledger.totalBalance || BigInt(0)));
      console.log(`✅ Balance: ${balance} OG`);
      
      if (balance < 0.01) {
        console.log('⚠️ Low balance, adding funds to ledger...');
        try {
          await broker.ledger.addLedger(ethers.parseEther("0.1"));
          console.log('✅ Added 0.1 OG to internal ledger');
        } catch (addError) {
          console.log('⚠️ Failed to add funds:', addError.message);
        }
      }
    } catch (error) {
      console.log('⚠️ Balance check failed (continuing anyway):', error.message);
    }

    // Step 3: Discover services
    console.log('[3/6] Discovering available services...');
    const services = await broker.inference.listService();
    console.log(`✅ Found ${services.length} services`);
    
    if (services.length === 0) {
      console.log('❌ No services available');
      return;
    }
    
    // Show available services
    services.forEach((service, index) => {
      console.log(`  Service ${index + 1}: ${service.provider} (${service.model})`);
    });

    // Step 4: Try first available provider
    const service = services[0];
    const { provider: providerAddress, model } = service;
    
    console.log(`[4/6] Testing with provider: ${providerAddress}`);
    console.log(`     Model: ${model}`);

    // Step 5: Acknowledge provider (required)
    console.log('[5/6] Acknowledging provider...');
    await broker.inference.acknowledgeProviderSigner(providerAddress);
    console.log('✅ Provider acknowledged');

    // Step 6: Make test request
    console.log('[6/6] Making test request...');
    
    // Get service metadata
    const { endpoint } = await broker.inference.getServiceMetadata(providerAddress);
    console.log(`     Endpoint: ${endpoint}`);
    
    // Generate auth headers
    const testMessage = "What is blockchain?";
    const headers = await broker.inference.getRequestHeaders(providerAddress, testMessage);
    console.log('✅ Auth headers generated');
    
    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: testMessage }],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Request failed: ${response.status} - ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Response received:');
    console.log('   Model:', data.model);
    console.log('   Content:', data.choices[0]?.message?.content?.substring(0, 100) + '...');
    console.log('   Usage:', data.usage);
    
    // Process response (optional verification)
    try {
      const valid = await broker.inference.processResponse(
        providerAddress,
        JSON.stringify(data)
      );
      console.log(`✅ Response verification: ${valid ? 'Valid' : 'Not verified'}`);
    } catch (error) {
      console.log('⚠️ Response verification failed (non-critical):', error.message);
    }
    
    console.log('\n🎉 0G Compute Network test completed successfully!');
    console.log('    - Broker initialization: ✅');
    console.log('    - Service discovery: ✅');
    console.log('    - Provider acknowledgment: ✅');
    console.log('    - Authentication: ✅');
    console.log('    - Request/Response: ✅');

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log('   Stack:', error.stack);
  }
}

// Run test
testZGCompute().catch(console.error);