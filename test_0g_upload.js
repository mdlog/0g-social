// Test script untuk menguji 0G Storage upload dengan endpoint indexer turbo
const { ZgStorageService } = require('./server/services/zg-storage.ts');

async function testUpload() {
  console.log('🧪 Testing 0G Storage Upload dengan endpoint indexer turbo...');
  
  const zgStorage = new ZgStorageService();
  const testContent = "Test post untuk 0G Storage dengan indexer turbo";
  
  try {
    const result = await zgStorage.storeContent(testContent, {
      type: 'post',
      author: 'test-user',
      title: 'Test Upload'
    });
    
    console.log('✅ Upload berhasil!');
    console.log('Hash:', result.hash);
    console.log('Transaction Hash:', result.transactionHash);
    console.log('Success:', result.success);
  } catch (error) {
    console.error('❌ Upload gagal:', error.message);
    console.error('Error details:', error);
  }
}

testUpload();