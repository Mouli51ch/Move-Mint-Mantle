#!/usr/bin/env node

/**
 * Complete Minting Flow Debug Script
 * Tests every step of the minting process with detailed logging
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ADDRESS = '0x3b31d87804c345a7d39f0267d0d4ff1dcc9b1433';

// Test data
const testDanceData = {
  userAddress: TEST_USER_ADDRESS,
  title: 'Debug Test Dance',
  description: 'A test dance for debugging the complete minting flow',
  danceStyle: 'Hip Hop',
  choreographer: 'Debug Tester',
  duration: '2:30',
  analysisResults: {
    totalMoves: 25,
    uniqueSequences: 8,
    confidenceScore: 85,
    complexity: 'Intermediate'
  }
};

async function debugStep(stepName, asyncFn) {
  console.log(`\n🔍 [DEBUG] === ${stepName} ===`);
  try {
    const result = await asyncFn();
    console.log(`✅ [DEBUG] ${stepName} - SUCCESS`);
    return result;
  } catch (error) {
    console.error(`❌ [DEBUG] ${stepName} - FAILED:`, error.message);
    console.error(`❌ [DEBUG] Full error:`, error);
    throw error;
  }
}

async function testHealthEndpoint() {
  return debugStep('Health Check', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const result = await response.json();
    
    console.log(`📊 [DEBUG] Health status: ${response.status}`);
    console.log(`📊 [DEBUG] Health response:`, result);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return result;
  });
}

async function testPrepareMint() {
  return debugStep('Prepare Mint API', async () => {
    console.log(`📡 [DEBUG] Calling /api/prepare-mint with data:`, testDanceData);
    
    const response = await fetch(`${BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDanceData),
    });
    
    console.log(`📊 [DEBUG] Prepare-mint status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log(`📊 [DEBUG] Prepare-mint response:`, JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      throw new Error(`Prepare-mint failed: ${response.status} - ${JSON.stringify(result)}`);
    }
    
    if (!result.success) {
      throw new Error(`Prepare-mint returned success=false: ${JSON.stringify(result.error)}`);
    }
    
    // Validate response structure
    console.log(`🔍 [DEBUG] Validating response structure...`);
    console.log(`📋 [DEBUG] Has transaction: ${!!result.transaction}`);
    console.log(`📋 [DEBUG] Has metadata: ${!!result.metadata}`);
    console.log(`📋 [DEBUG] Has warning: ${!!result.warning}`);
    
    if (result.metadata) {
      console.log(`📋 [DEBUG] Metadata IPFS hash: ${result.metadata.ipfsHash}`);
      console.log(`📋 [DEBUG] NFT IPFS hash: ${result.metadata.nftIpfsHash}`);
    }
    
    if (result.transaction) {
      console.log(`📋 [DEBUG] Transaction to: ${result.transaction.to}`);
      console.log(`📋 [DEBUG] Transaction data length: ${result.transaction.data?.length || 0}`);
      console.log(`📋 [DEBUG] Transaction value: ${result.transaction.value}`);
    }
    
    return result;
  });
}

async function testExecuteStoryMint(metadata) {
  return debugStep('Execute Story Mint API', async () => {
    console.log(`📡 [DEBUG] Calling /api/execute-story-mint with metadata:`, metadata);
    
    const requestBody = {
      userAddress: TEST_USER_ADDRESS,
      metadata: metadata
    };
    
    console.log(`📋 [DEBUG] Request body:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/execute-story-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log(`📊 [DEBUG] Execute-story-mint status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log(`📊 [DEBUG] Execute-story-mint response:`, JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      throw new Error(`Execute-story-mint failed: ${response.status} - ${JSON.stringify(result)}`);
    }
    
    if (!result.success) {
      throw new Error(`Execute-story-mint returned success=false: ${JSON.stringify(result.error)}`);
    }
    
    // Validate response structure
    console.log(`🔍 [DEBUG] Validating execute-story-mint response...`);
    console.log(`📋 [DEBUG] Has transaction: ${!!result.transaction}`);
    console.log(`📋 [DEBUG] Has metadata: ${!!result.metadata}`);
    console.log(`📋 [DEBUG] Has fallbackMode: ${!!result.fallbackMode}`);
    console.log(`📋 [DEBUG] RPC endpoint: ${result.rpcEndpoint || 'N/A'}`);
    
    if (result.transaction) {
      console.log(`📋 [DEBUG] Transaction details:`);
      console.log(`  - From: ${result.transaction.from}`);
      console.log(`  - To: ${result.transaction.to}`);
      console.log(`  - Gas: ${result.transaction.gas}`);
      console.log(`  - Gas Price: ${result.transaction.gasPrice}`);
      console.log(`  - Nonce: ${result.transaction.nonce}`);
      console.log(`  - Data length: ${result.transaction.data?.length || 0}`);
    }
    
    if (result.debug) {
      console.log(`🐛 [DEBUG] Server debug info:`, result.debug);
    }
    
    return result;
  });
}

async function testRPCEndpoints() {
  return debugStep('RPC Endpoints Test', async () => {
    const rpcEndpoints = [
      'https://aeneid.storyrpc.io',
      'https://rpc.aeneid.testnet.story.foundation',
      'https://story-testnet-rpc.polkachu.com'
    ];
    
    const results = [];
    
    for (let i = 0; i < rpcEndpoints.length; i++) {
      const rpcUrl = rpcEndpoints[i];
      console.log(`🔄 [DEBUG] Testing RPC ${i + 1}/${rpcEndpoints.length}: ${rpcUrl}`);
      
      try {
        const startTime = Date.now();
        
        // Test chain ID
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        const chainId = parseInt(result.result, 16);
        
        console.log(`✅ [DEBUG] RPC ${i + 1} - Working`);
        console.log(`  - Response time: ${responseTime}ms`);
        console.log(`  - Chain ID: ${chainId} (expected: 1315)`);
        console.log(`  - Status: ${chainId === 1315 ? 'CORRECT CHAIN' : 'WRONG CHAIN'}`);
        
        results.push({
          url: rpcUrl,
          working: true,
          responseTime,
          chainId,
          correctChain: chainId === 1315
        });
        
      } catch (error) {
        console.error(`❌ [DEBUG] RPC ${i + 1} - Failed: ${error.message}`);
        results.push({
          url: rpcUrl,
          working: false,
          error: error.message
        });
      }
    }
    
    console.log(`\n📊 [DEBUG] RPC Summary:`);
    const workingRPCs = results.filter(r => r.working && r.correctChain);
    console.log(`  - Working RPCs: ${workingRPCs.length}/${results.length}`);
    console.log(`  - Fastest RPC: ${workingRPCs.length > 0 ? workingRPCs.sort((a, b) => a.responseTime - b.responseTime)[0].url : 'None'}`);
    
    return results;
  });
}

async function runCompleteDebug() {
  console.log('🚀 [DEBUG] Starting Complete Minting Flow Debug');
  console.log('🚀 [DEBUG] =====================================\n');
  
  try {
    // Step 1: Test health endpoint
    await testHealthEndpoint();
    
    // Step 2: Test RPC endpoints
    await testRPCEndpoints();
    
    // Step 3: Test prepare-mint
    const prepareMintResult = await testPrepareMint();
    
    // Step 4: Test execute-story-mint (if we have metadata)
    if (prepareMintResult.metadata) {
      await testExecuteStoryMint(prepareMintResult.metadata);
    } else {
      console.warn('⚠️ [DEBUG] No metadata from prepare-mint, skipping execute-story-mint test');
    }
    
    console.log('\n🎉 [DEBUG] =====================================');
    console.log('🎉 [DEBUG] Complete Debug Flow - SUCCESS');
    console.log('🎉 [DEBUG] All endpoints are working correctly');
    console.log('🎉 [DEBUG] =====================================');
    
  } catch (error) {
    console.error('\n💥 [DEBUG] =====================================');
    console.error('💥 [DEBUG] Complete Debug Flow - FAILED');
    console.error('💥 [DEBUG] Error:', error.message);
    console.error('💥 [DEBUG] =====================================');
    process.exit(1);
  }
}

// Run the debug if this script is executed directly
if (require.main === module) {
  runCompleteDebug();
}

module.exports = {
  runCompleteDebug,
  testHealthEndpoint,
  testPrepareMint,
  testExecuteStoryMint,
  testRPCEndpoints
};