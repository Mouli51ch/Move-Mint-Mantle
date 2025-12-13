#!/usr/bin/env node

/**
 * Debug IP ID Display Issue
 * Tests the complete minting flow to see where IP ID gets lost
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function debugIPIDDisplay() {
  console.log('🔍 [DEBUG] Testing IP ID display issue...\n');
  
  try {
    // Step 1: Test prepare-mint API
    console.log('📡 [Step 1] Testing /api/prepare-mint...');
    
    const prepareMintResponse = await fetch(`${BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
        title: 'Debug Test Dance',
        description: 'Testing IP ID display',
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
    
    const prepareMintResult = await prepareMintResponse.json();
    console.log('📊 [Step 1] Prepare-mint response:', JSON.stringify(prepareMintResult, null, 2));
    
    if (!prepareMintResult.success) {
      console.error('❌ [Step 1] Prepare-mint failed');
      return;
    }
    
    // Step 2: Test execute-story-mint API
    console.log('\n📡 [Step 2] Testing /api/execute-story-mint...');
    
    const executeResponse = await fetch(`${BASE_URL}/api/execute-story-mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
        metadata: prepareMintResult.metadata
      })
    });
    
    const executeResult = await executeResponse.json();
    console.log('📊 [Step 2] Execute-story-mint response:', JSON.stringify(executeResult, null, 2));
    
    // Step 3: Analyze IP ID generation
    console.log('\n🆔 [Step 3] Analyzing IP ID generation...');
    
    if (executeResult.success) {
      if (executeResult.ipId) {
        console.log('✅ [IP ID] Found in execute response:', executeResult.ipId);
        console.log('📋 [IP ID] Format check:', {
          startsWithOx: executeResult.ipId.startsWith('0x'),
          length: executeResult.ipId.length,
          expectedLength: 66, // 0x + 40 chars (contract) + 24 chars (token ID)
          isValidHex: /^0x[a-fA-F0-9]+$/.test(executeResult.ipId)
        });
      } else {
        console.warn('⚠️ [IP ID] Missing from execute response');
      }
      
      if (executeResult.tokenId) {
        console.log('🆔 [Token ID] Found:', executeResult.tokenId);
        
        // Manually generate IP ID to verify
        const spgContract = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
        const manualIpId = '0x' + spgContract.slice(2).toLowerCase() + executeResult.tokenId.toString(16).padStart(24, '0');
        console.log('🔧 [Manual IP ID] Generated:', manualIpId);
        console.log('🔍 [Comparison] Match:', executeResult.ipId === manualIpId);
      }
    }
    
    // Step 4: Test frontend flow simulation
    console.log('\n🖥️ [Step 4] Simulating frontend flow...');
    
    let frontendIpId = null;
    let frontendTxHash = null;
    
    // Simulate what happens in the frontend
    if (executeResult.success) {
      if (executeResult.transaction) {
        console.log('📝 [Frontend] Would get transaction to sign');
        console.log('🆔 [Frontend] IP ID from server:', executeResult.ipId);
        frontendIpId = executeResult.ipId;
        frontendTxHash = 'simulated-tx-hash';
      } else if (executeResult.fallbackMode) {
        console.log('📝 [Frontend] Fallback mode detected');
        console.log('🆔 [Frontend] Fallback IP ID:', executeResult.ipId);
        frontendIpId = executeResult.ipId;
        frontendTxHash = 'ipfs-success';
      }
    }
    
    // Step 5: Check UI state simulation
    console.log('\n🎨 [Step 5] UI State Simulation...');
    console.log('📊 [UI State] Transaction Hash:', frontendTxHash);
    console.log('📊 [UI State] IP ID:', frontendIpId);
    console.log('📊 [UI State] Should show success:', !!(frontendTxHash && frontendIpId));
    
    if (frontendTxHash && frontendIpId) {
      console.log('✅ [UI] Success display should show with IP ID');
      console.log('🎯 [UI] IP ID display text:', frontendIpId.startsWith('0x') ? 'Story Protocol IP Asset ID' : 'Dance NFT Reference');
    } else {
      console.log('❌ [UI] Success display missing data');
      console.log('🔍 [Debug] Missing:', {
        transactionHash: !frontendTxHash,
        ipId: !frontendIpId
      });
    }
    
    // Step 6: Common issues check
    console.log('\n🔧 [Step 6] Common Issues Check...');
    
    const issues = [];
    
    if (!executeResult.ipId) {
      issues.push('Server not returning IP ID');
    }
    
    if (executeResult.ipId && !executeResult.ipId.startsWith('0x')) {
      issues.push('IP ID format incorrect (should start with 0x)');
    }
    
    if (executeResult.ipId && executeResult.ipId.length !== 66) {
      issues.push(`IP ID length incorrect (${executeResult.ipId.length}, should be 66)`);
    }
    
    if (issues.length > 0) {
      console.log('❌ [Issues Found]:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ [No Issues] IP ID generation appears correct');
    }
    
    console.log('\n🎯 [Summary] Debug complete');
    
  } catch (error) {
    console.error('❌ [ERROR] Debug failed:', error.message);
    console.error('📊 [ERROR] Stack:', error.stack);
  }
}

// Run the debug
debugIPIDDisplay();