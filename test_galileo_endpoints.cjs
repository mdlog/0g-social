// Test script untuk menguji 0G Galileo testnet endpoints
const https = require('https');

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🔗 Testing ${description}: ${url}`);
    
    const options = {
      timeout: 10000,
      method: 'GET'
    };
    
    const req = https.get(url, options, (res) => {
      console.log(`✅ ${description} - Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.length > 0) {
          console.log(`Response: ${data.substring(0, 200)}...`);
        }
        resolve({ success: true, status: res.statusCode });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${description} - Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testGalileoInfrastructure() {
  console.log('🧪 Testing 0G Galileo Testnet Infrastructure...\n');
  
  const endpoints = [
    { url: 'https://evmrpc-testnet.0g.ai', desc: '0G Galileo RPC' },
    { url: 'https://indexer-storage-testnet.0g.ai', desc: '0G Galileo Storage Indexer' },
    { url: 'https://rpc-testnet.0g.ai', desc: '0G Alternative RPC' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.desc);
    results.push({ ...endpoint, ...result });
  }
  
  console.log('\n📊 Summary:');
  results.forEach(result => {
    const status = result.success ? '✅ Working' : '❌ Failed';
    console.log(`${status} - ${result.desc}`);
  });
  
  const workingEndpoints = results.filter(r => r.success);
  console.log(`\n🎯 ${workingEndpoints.length}/${results.length} endpoints are working`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n✅ 0G Galileo Storage infrastructure is accessible!');
    console.log('Switching to Galileo testnet untuk upload 0G Storage.');
  } else {
    console.log('\n❌ No working endpoints found');
    console.log('0G Galileo Storage infrastructure might be under maintenance.');
  }
}

testGalileoInfrastructure().catch(console.error);