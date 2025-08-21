// Test script untuk menguji endpoint indexer turbo 0G Storage
const https = require('https');

async function testIndexerTurbo() {
  console.log('🧪 Testing 0G Storage Indexer Turbo Endpoint...\n');
  
  const endpoint = 'https://indexer-storage-testnet-turbo.0g.ai';
  
  return new Promise((resolve) => {
    console.log(`🔗 Testing: ${endpoint}`);
    
    const postData = JSON.stringify({
      "jsonrpc": "2.0",
      "method": "indexer_getShardedNodes",
      "id": 1
    });
    
    const options = {
      hostname: 'indexer-storage-testnet-turbo.0g.ai',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ Valid JSON response received');
            console.log('Response preview:', JSON.stringify(json, null, 2).substring(0, 200) + '...');
            resolve({ success: true, data: json });
          } catch (parseError) {
            console.log('❌ Invalid JSON response');
            console.log('Raw response:', data.substring(0, 200) + '...');
            resolve({ success: false, error: 'Invalid JSON' });
          }
        } else {
          console.log(`❌ Non-200 status: ${res.statusCode}`);
          console.log('Response:', data.substring(0, 200) + '...');
          resolve({ success: false, error: `Status ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ Request timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  const result = await testIndexerTurbo();
  
  console.log('\n📊 Result:');
  if (result.success) {
    console.log('✅ 0G Storage Indexer Turbo is working!');
    console.log('Upload ke 0G Storage dapat dilakukan.');
  } else {
    console.log('❌ 0G Storage Indexer Turbo tidak berfungsi');
    console.log(`Error: ${result.error}`);
  }
}

main().catch(console.error);