// Test script untuk menguji 0G Storage upload dengan endpoint terbaru
const { exec } = require('child_process');
const fs = require('fs');

// Test basic 0G Storage upload dengan SDK
async function testZGStorageUpload() {
  console.log('🧪 Testing 0G Storage Upload dengan endpoint terbaru...');
  
  // Create test file
  const testContent = JSON.stringify({
    type: 'test_post',
    content: 'Test post untuk 0G Storage',
    timestamp: Date.now(),
    author: 'test-user'
  });
  
  fs.writeFileSync('./temp/test-upload.json', testContent);
  
  console.log('Test content created:', testContent);
  
  // Test different endpoints
  const endpoints = [
    'https://indexer-storage-testnet.0g.ai',
    'https://rpc-storage-testnet.0g.ai', 
    'https://storage-testnet.0g.ai',
    'https://indexer-testnet.0g.ai'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 5000
      });
      
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      
      if (response.status === 200) {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

testZGStorageUpload().catch(console.error);