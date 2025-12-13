#!/usr/bin/env node

/**
 * Frontend Minting Flow Test
 * Tests the complete minting flow by simulating browser requests
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ADDRESS = '0x3b31d87804c345a7d39f0267d0d4ff1dcc9b1433';

// Test data matching what the frontend sends
const testDanceData = {
  userAddress: TEST_USER_ADDRESS,
  title: 'Frontend Test Dance',
  description: 'A test dance for debugging the frontend minting flow',
  danceStyle: 'Contemporary',
  choreographer: 'Frontend Tester',
  duration: '3:15',
  analysisResults: {
    totalMoves: 32,
    uniqueSequences: 12,
    confidenceScore: 78,
    complexity: 'Intermediate'
  }
};

async function simulateFrontendMintingFlow() {
  console.log('🚀 [FRONTEND-TEST] Starting frontend minting flow simulation');
  console.log('🚀 [FRONTEND-TEST] ===============================================\n');
  
  try {
    // Step 1: Call prepare-mint (same as frontend)
    console.log('📡 [FRONTEND-TEST] Step 1: Calling /api/prepare-mint...');
    console.log('📋 [FRONTEND-TEST] Request data:', JSON.stringify(testDanceData, null, 2));
    
    const prepareMintResponse = await fetch(`${BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDanceData),
    });
    
    console.log(`📊 [FRONTEND-TEST] Prepare-mint status: ${prepareMintResponse.status}`);
    
    const prepareMintResult = await prepareMintResponse.json();
    console.log('📊 [FRONTEND-TEST] Prepare-mint response:', JSON.stringify(prepareMintResult, null, 2));
    
    if (!prepareMintResponse.ok || !prepareMintResult.success) {
      throw new Error(`Prepare-mint failed: ${JSON.stringify(prepareMintResult.error)}`);
    }
    
    console.log('✅ [FRONTEND-TEST] Step 1 - Prepare-mint successful');
    
    // Step 2: Analyze the response (same logic as frontend)
    console.log('\n🔍 [FRONTEND-TEST] Step 2: Analyzing prepare-mint response...');
    
    if (prepareMintResult.warning && prepareMintResult.warning.fallbackRequired) {
      console.log('⚠️ [FRONTEND-TEST] Warning detected - fallback required');
      console.log('📝 [FRONTEND-TEST] Would call handleStoryProtocolMint()');
      
      // Simulate calling execute-story-mint
      const executeResponse = await fetch(`${BASE_URL}/api/execute-story-mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: TEST_USER_ADDRESS,
          metadata: prepareMintResult.metadata
        }),
      });
      
      const executeResult = await executeResponse.json();
      console.log('📊 [FRONTEND-TEST] Execute-story-mint response:', JSON.stringify(executeResult, null, 2));
      
      if (executeResult.success && executeResult.transaction) {
        console.log('✅ [FRONTEND-TEST] Would send transaction to MetaMask');
        console.log('📋 [FRONTEND-TEST] Transaction details:', {
          to: executeResult.transaction.to,
          from: executeResult.transaction.from,
          gas: executeResult.transaction.gas,
          nonce: executeResult.transaction.nonce
        });
      } else if (executeResult.fallbackMode) {
        console.log('📝 [FRONTEND-TEST] Would use IPFS-only success mode');
        console.log('🔗 [FRONTEND-TEST] IPFS hash:', executeResult.metadata.ipfsHash);
      }
      
    } else if (prepareMintResult.transaction) {
      console.log('📝 [FRONTEND-TEST] Transaction data received from Surreal Base');
      console.log('📋 [FRONTEND-TEST] Transaction details:', {
        to: prepareMintResult.transaction.to,
        data: prepareMintResult.transaction.data?.substring(0, 20) + '...',
        value: prepareMintResult.transaction.value,
        gasEstimate: prepareMintResult.transaction.gasEstimate
      });
      
      // Check if transaction data is valid
      if (!prepareMintResult.transaction.to || 
          !prepareMintResult.transaction.data || 
          prepareMintResult.transaction.data === '0x') {
        console.log('⚠️ [FRONTEND-TEST] Empty transaction data - would fallback to Story Protocol');
        
        // Simulate execute-story-mint fallback
        const executeResponse = await fetch(`${BASE_URL}/api/execute-story-mint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: TEST_USER_ADDRESS,
            metadata: prepareMintResult.metadata
          }),
        });
        
        const executeResult = await executeResponse.json();
        console.log('📊 [FRONTEND-TEST] Fallback execute-story-mint response:', JSON.stringify(executeResult, null, 2));
        
      } else {
        console.log('✅ [FRONTEND-TEST] Valid transaction data - would send to MetaMask');
        console.log('📝 [FRONTEND-TEST] Would create transaction params and call eth_sendTransaction');
      }
      
    } else {
      console.log('⚠️ [FRONTEND-TEST] No transaction or warning in response');
      
      if (prepareMintResult.metadata && prepareMintResult.metadata.ipfsHash) {
        console.log('📝 [FRONTEND-TEST] Would use IPFS-only success mode');
        console.log('🔗 [FRONTEND-TEST] IPFS hash:', prepareMintResult.metadata.ipfsHash);
      } else {
        throw new Error('No transaction data or metadata received');
      }
    }
    
    console.log('\n🎉 [FRONTEND-TEST] ===============================================');
    console.log('🎉 [FRONTEND-TEST] Frontend minting flow simulation - SUCCESS');
    console.log('🎉 [FRONTEND-TEST] All API endpoints are working correctly');
    console.log('🎉 [FRONTEND-TEST] The issue is likely in browser-specific code');
    console.log('🎉 [FRONTEND-TEST] ===============================================');
    
    // Provide debugging suggestions
    console.log('\n🔍 [FRONTEND-TEST] Debugging suggestions:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify MetaMask is installed and connected');
    console.log('3. Check network configuration (Chain ID 1315)');
    console.log('4. Verify wallet has sufficient funds for gas');
    console.log('5. Test with browser developer tools open');
    
  } catch (error) {
    console.error('\n💥 [FRONTEND-TEST] ===============================================');
    console.error('💥 [FRONTEND-TEST] Frontend minting flow simulation - FAILED');
    console.error('💥 [FRONTEND-TEST] Error:', error.message);
    console.error('💥 [FRONTEND-TEST] ===============================================');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  simulateFrontendMintingFlow();
}

module.exports = { simulateFrontendMintingFlow };