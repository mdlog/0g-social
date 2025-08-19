/**
 * Debug script to test 0G Storage error detection accuracy
 */

// Simulate different error scenarios to test our improved detection logic
const errorScenarios = [
  // Network/Infrastructure errors (should be retryable, NOT insufficient funds)
  {
    name: "Storage Node Connection Error",
    error: { message: "Upload failed. Error: Network error connecting to storage node", code: "ECONNREFUSED" },
    expectedType: "network_error",
    expectedRetryable: true
  },
  {
    name: "503 Service Unavailable", 
    error: { message: "503 Service Temporarily Unavailable", code: "503" },
    expectedType: "network_error",
    expectedRetryable: true
  },
  {
    name: "Indexer Timeout",
    error: { message: "timeout connecting to indexer-storage-testnet-turbo.0g.ai", code: "ETIMEDOUT" },
    expectedType: "network_error", 
    expectedRetryable: true
  },
  // Actual insufficient funds errors (should NOT be retryable)
  {
    name: "Real Balance Issue",
    error: { message: "execution reverted: insufficient funds for gas", code: "CALL_EXCEPTION" },
    expectedType: "insufficient_funds",
    expectedRetryable: false
  },
  {
    name: "0G Chain Balance Error", 
    error: { message: "sender doesn't have enough funds to pay for gas", code: "INSUFFICIENT_FUNDS" },
    expectedType: "insufficient_funds",
    expectedRetryable: false
  },
  // 0G Storage specific errors (should be retryable, NOT insufficient funds)
  {
    name: "Data Already Exists",
    error: { message: "Upload failed: Data already exists", code: null },
    expectedType: "service_error",
    expectedRetryable: true
  },
  {
    name: "Storage Node Error", 
    error: { message: "Storage node returned error: unable to process request", code: null },
    expectedType: "service_error",
    expectedRetryable: true
  }
];

function analyzeError(error) {
  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || '';
  
  // Network errors (retryable, NOT balance issues)
  const isRetriableError = (
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'ECONNRESET' ||
    errorCode === 'ECONNREFUSED' ||
    errorMessage.includes('503') || 
    errorMessage.includes('502') ||
    errorMessage.includes('Service Temporarily Unavailable') || 
    errorMessage.includes('timeout') ||
    errorMessage.includes('Connection refused') ||
    errorMessage.includes('Network error')
  );

  // FIXED: More accurate insufficient funds detection - avoid false positives
  const isInsufficientFunds = (
    (errorMessage.toLowerCase().includes('insufficient funds') && 
     errorMessage.toLowerCase().includes('balance')) ||
    (errorMessage.toLowerCase().includes('not enough balance')) ||
    (errorMessage.toLowerCase().includes('execution reverted') && 
     errorMessage.toLowerCase().includes('gas')) ||
    (errorCode === 'INSUFFICIENT_FUNDS') ||
    // Check for specific 0G Chain balance errors
    (errorMessage.includes('sender doesn\'t have enough funds') ||
     errorMessage.includes('insufficient balance for transfer'))
  );

  // 0G Storage service errors (retryable, NOT balance issues)
  const isStorageServiceError = (
    errorMessage.includes('Upload failed') ||
    errorMessage.includes('Storage node') ||
    errorMessage.includes('Indexer') ||
    errorMessage.includes('Data already exists') ||
    (errorMessage.includes('Error') && !isInsufficientFunds && !isRetriableError)
  );

  if (isInsufficientFunds) {
    return { errorType: 'insufficient_funds', isRetryable: false };
  } else if (isRetriableError) {
    return { errorType: 'network_error', isRetryable: true };
  } else if (isStorageServiceError) {
    return { errorType: 'service_error', isRetryable: true };
  } else {
    return { errorType: 'unknown_error', isRetryable: false };
  }
}

console.log("🧪 Testing Error Detection Logic\n");

errorScenarios.forEach((scenario, index) => {
  console.log(`Test ${index + 1}: ${scenario.name}`);
  console.log(`Error: ${scenario.error.message}`);
  
  const result = analyzeError(scenario.error);
  
  const typeMatch = result.errorType === scenario.expectedType;
  const retryMatch = result.isRetryable === scenario.expectedRetryable;
  
  console.log(`Expected: ${scenario.expectedType}, ${scenario.expectedRetryable ? 'retryable' : 'not retryable'}`);
  console.log(`Actual: ${result.errorType}, ${result.isRetryable ? 'retryable' : 'not retryable'}`);
  console.log(`✅ ${typeMatch && retryMatch ? 'PASS' : '❌ FAIL'}`);
  console.log('---');
});

console.log("\n🎯 Fixed Issues:");
console.log("1. Network/Infrastructure errors no longer falsely detected as insufficient funds");
console.log("2. 0G Storage service errors properly classified as service_error, not balance issues");
console.log("3. Only genuine blockchain balance errors trigger insufficient_funds detection");
console.log("4. Improved retry logic - network errors are retryable, balance errors are not");