// Test script untuk menguji 0G Newton testnet connectivity
const https = require('https');
const http = require('http');

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🔗 Testing ${description}: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    const options = {
      timeout: 10000,
      method: 'GET'
    };
    
    const req = client.get(url, options, (res) => {
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

async function testZGInfrastructure() {
  console.log('🧪 Testing 0G Newton Testnet Infrastructure...\n');
  
  const endpoints = [
    { url: 'https://rpc-testnet.0g.ai', desc: '0G Newton RPC' },
    { url: 'http://storagescan-newton.0g.ai', desc: '0G Newton Storage Scan' },
    { url: 'https://0g-api-testnet.tech-coha05.xyz', desc: '0G Community API' },
    { url: 'https://0g-testnet-rpc.tech-coha05.xyz', desc: '0G Community RPC' }
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
    console.log('\n✅ 0G Storage infrastructure is accessible!');
    console.log('Post upload ke 0G Storage dapat dilakukan.');
  } else {
    console.log('\n❌ No working endpoints found');
    console.log('0G Storage infrastructure might be under maintenance.');
  }
}

testZGInfrastructure().catch(console.error);