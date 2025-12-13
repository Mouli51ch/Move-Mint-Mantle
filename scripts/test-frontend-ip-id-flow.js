#!/usr/bin/env node

/**
 * Test Frontend IP ID Flow
 * Simulates the exact frontend flow to identify where IP ID gets lost
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFrontendIPIDFlow() {
  console.log('🎯 [TEST] Simulating exact frontend IP ID flow...\n');
  
  try {
    // Simulate frontend state
    let ipId = null;
    let transactionHash = null;
    let mintResult = null;
    
    const userAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4';
    
    console.log('📝 [Step 1] Simulating handleMint() start...');
    console.log('🔄 [State] Initial state:', { ipId, transactionHash, mintResult });
    
    // Reset state (like in handleMint)
    ipId = null;
    transactionHash = null;
    mintResult = null;
    console.log('🔄 [State] After reset:', { ipId, transactionHash, mintResult });
    
    // Step 1: Call prepare-mint
    console.log('\n📡 [Step 2] Calling /api/prepare-mint...');
    
    const prepareMintResponse = await fetch(`${BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: userAddress,
        title: 'Test Dance',
        description: 'Testing IP ID flow',
        danceStyle: 'Hip Hop',
        choreographer: 'Test User',
        duration: '2:30',
        analysisResults: {
          totalMoves: 25,
          uniqueSequences: 8,
          confidenceScore: 85,
          complexity: 'Intermediate'
        }
      })
    });
    
    const result = await prepareMintResponse.json();
    console.log('📊 [Result] Prepare-mint success:', result.success);
    console.log('📊 [Result] Has warning:', !!result.warning);
    console.log('📊 [Result] Has transaction:', !!result.transaction);
    
    if (!result.success) {
      console.error('❌ [ERROR] Prepare-mint failed');
      return;
    }
    
    mintResult = result;
    console.log('🔄 [State] After prepare-mint:', { ipId, transactionHash, mintResult: !!mintResult });
    
    // Step 2: Check for warning (fallback required)
    if (result.warning && result.warning.fallbackRequired) {
      console.log('\n⚠️ [Step 3] Warning detected - using handleStoryProtocolMint...');
      
      // Simulate handleStoryProtocolMint call
      console.log('📡 [Calling] /api/execute-story-mint...');
      
      const executeResponse = await fetch(`${BASE_URL}/api/execute-story-mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userAddress,
          metadata: result.metadata
        })
      });
      
      const executeResult = await executeResponse.json();
      console.log('📊 [Execute] Success:', executeResult.success);
      console.log('📊 [Execute] Has transaction:', !!executeResult.transaction);
      console.log('📊 [Execute] Has IP ID:', !!executeResult.ipId);
      console.log('📊 [Execute] Fallback mode:', !!executeResult.fallbackMode);
      
      if (executeResult.success) {
        if (executeResult.transaction) {
          console.log('📝 [Flow] Transaction path - would sign transaction');
          console.log('🆔 [Flow] Setting IP ID from server:', executeResult.ipId);
          
          // Simulate setIpId(result.ipId)
          ipId = executeResult.ipId;
          transactionHash = 'simulated-tx-hash'; // Would be from MetaMask
          
          console.log('🔄 [State] After transaction path:', { ipId, transactionHash });
          
        } else if (executeResult.fallbackMode) {
          console.log('📝 [Flow] Fallback mode path');
          console.log('🆔 [Flow] Setting fallback IP ID:', executeResult.ipId);
          
          // Simulate fallback mode
          transactionHash = 'ipfs-success';
          ipId = executeResult.ipId;
          
          console.log('🔄 [State] After fallback path:', { ipId, transactionHash });
        }
      }
    }
    
    // Step 3: Check final UI state
    console.log('\n🎨 [Step 4] Final UI state check...');
    console.log('📊 [Final State]:', { 
      transactionHash, 
      ipId,
      shouldShowSuccess: !!(transactionHash && ipId),
      ipIdFormat: ipId ? {
        startsWithOx: ipId.startsWith('0x'),
        length: ipId.length,
        isValidHex: /^0x[a-fA-F0-9]+$/.test(ipId)
      } : null
    });
    
    // Step 4: Simulate success display rendering
    if (transactionHash) {
      console.log('\n✅ [UI] Success display would render');
      console.log('🎯 [UI] Transaction hash display:', transactionHash);
      
      if (ipId) {
        console.log('🆔 [UI] IP ID display would show:', ipId);
        console.log('📝 [UI] IP ID label:', ipId.startsWith('0x') ? 'Story Protocol IP Asset ID' : 'Dance NFT Reference');
        console.log('✅ [SUCCESS] IP ID should be visible in UI');
      } else {
        console.log('❌ [PROBLEM] IP ID is missing - would not display');
      }
    } else {
      console.log('❌ [PROBLEM] No transaction hash - success display would not render');
    }
    
    // Step 5: Identify potential issues
    console.log('\n🔍 [Step 5] Issue analysis...');
    
    const issues = [];
    
    if (!transactionHash) {
      issues.push('Transaction hash not set');
    }
    
    if (!ipId) {
      issues.push('IP ID not set');
    }
    
    if (ipId && !ipId.startsWith('0x')) {
      issues.push('IP ID format may be incorrect (not hex)');
    }
    
    if (issues.length > 0) {
      console.log('❌ [Issues Found]:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ [No Issues] Flow appears correct');
    }
    
    console.log('\n🎯 [Summary] Frontend IP ID flow test complete');
    
  } catch (error) {
    console.error('❌ [ERROR] Test failed:', error.message);
    console.error('📊 [ERROR] Stack:', error.stack);
  }
}

// Run the test
testFrontendIPIDFlow();