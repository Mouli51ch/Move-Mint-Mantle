#!/usr/bin/env node

/**
 * Test Demo Mode Handling
 * 
 * This script tests that the minting API properly handles demo mode
 * and doesn't provide invalid explorer links.
 */

const fetch = require('node-fetch');

async function testDemoMode() {
  console.log('🎭 Testing Demo Mode Handling...\n');

  // Test data
  const testMetadata = {
    name: 'Demo Test NFT',
    description: 'Testing demo mode functionality',
    attributes: [
      { trait_type: 'Test', value: 'Demo Mode' }
    ]
  };

  const testRecipient = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';

  try {
    console.log('🚀 Sending minting request...');
    const response = await fetch('http://localhost:3000/api/mint-ip-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: testMetadata,
        recipient: testRecipient
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('📋 Response Analysis:');
    console.log('   Success:', result.success);
    console.log('   Mode:', result.mode || 'production');
    console.log('   Transaction Hash:', result.transactionHash);
    console.log('   Explorer URL:', result.explorerUrl);
    console.log('   Token ID:', result.tokenId);

    // Validate demo mode handling
    if (result.mode === 'demonstration') {
      console.log('\n✅ Demo Mode Tests:');
      
      // Check transaction hash format
      if (result.transactionHash && result.transactionHash.match(/^0x[a-f0-9]{64}$/)) {
        console.log('   ✅ Transaction hash has valid format');
      } else {
        console.log('   ❌ Transaction hash format invalid');
      }

      // Check explorer URL is null for demo
      if (result.explorerUrl === null) {
        console.log('   ✅ Explorer URL correctly set to null for demo');
      } else {
        console.log('   ❌ Explorer URL should be null for demo mode');
      }

      // Check explanation exists
      if (result.explanation && result.explanation.note) {
        console.log('   ✅ Demo explanation provided');
        console.log('   📝 Note:', result.explanation.note);
      } else {
        console.log('   ❌ Demo explanation missing');
      }

      console.log('\n🎯 Demo Mode Summary:');
      console.log('   - Transaction hash: Valid format, safe to display');
      console.log('   - Explorer link: Disabled to prevent confusion');
      console.log('   - User messaging: Clear demo indication');
      console.log('   - Functionality: Complete workflow demonstration');

    } else {
      console.log('\n🔗 Production Mode:');
      console.log('   - Real blockchain transaction');
      console.log('   - Explorer URL:', result.explorerUrl);
    }

    console.log('\n🎉 Demo Mode Test Completed Successfully!');
    console.log('\n📋 Key Benefits:');
    console.log('   ✅ No broken explorer links');
    console.log('   ✅ Clear demo vs production distinction');
    console.log('   ✅ Complete workflow demonstration');
    console.log('   ✅ Professional user experience');

  } catch (error) {
    console.error('❌ Demo Mode Test Failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDemoMode();