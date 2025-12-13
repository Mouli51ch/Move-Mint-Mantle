#!/usr/bin/env node

/**
 * Test script for simplified minting process
 * Tests the complete flow: prepare-mint API -> Surreal Base -> transaction preparation
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
const TEST_USER_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

async function testSimplifiedMint() {
  console.log('🧪 Testing Simplified Mint Process');
  console.log('=====================================');

  try {
    // Test data - simple dance metadata
    const testData = {
      userAddress: TEST_USER_ADDRESS,
      title: 'Epic Hip Hop Routine',
      description: 'A high-energy hip hop dance with complex footwork and smooth transitions',
      danceStyle: 'Hip Hop',
      choreographer: 'Dance Master',
      duration: '2:45',
      analysisResults: {
        totalMoves: 42,
        uniqueSequences: 15,
        confidenceScore: 87,
        complexity: 'Advanced'
      }
    };

    console.log('📝 Test Data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    // Step 1: Test prepare-mint API
    console.log('🚀 Step 1: Calling /api/prepare-mint...');
    
    const response = await fetch(`${API_BASE}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', result);
      return;
    }

    console.log('✅ API Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Step 2: Validate response structure
    console.log('🔍 Step 2: Validating response structure...');
    
    const validations = [
      { check: result.success === true, name: 'success field' },
      { check: result.transaction, name: 'transaction object' },
      { check: result.transaction?.to, name: 'transaction.to address' },
      { check: result.transaction?.data, name: 'transaction.data' },
      { check: result.transaction?.value !== undefined, name: 'transaction.value' },
      { check: result.metadata, name: 'metadata object' },
      { check: result.metadata?.ipfsHash, name: 'IPFS hash for IP metadata' },
      { check: result.metadata?.nftIpfsHash, name: 'IPFS hash for NFT metadata' },
    ];

    let allValid = true;
    validations.forEach(({ check, name }) => {
      if (check) {
        console.log(`  ✅ ${name}`);
      } else {
        console.log(`  ❌ ${name}`);
        allValid = false;
      }
    });

    if (allValid) {
      console.log('');
      console.log('🎉 All validations passed!');
      console.log('');
      console.log('📋 Transaction Summary:');
      console.log(`  Contract: ${result.transaction.to}`);
      console.log(`  Gas Estimate: ${result.transaction.gasEstimate || 'Not provided'}`);
      console.log(`  IP Metadata IPFS: ${result.metadata.ipfsHash}`);
      console.log(`  NFT Metadata IPFS: ${result.metadata.nftIpfsHash}`);
      console.log('');
      console.log('✅ Ready for wallet signing!');
      console.log('');
      console.log('🔗 Next Steps:');
      console.log('  1. Connect wallet to Story Protocol Testnet (Aeneid)');
      console.log('  2. Use the transaction data to sign and broadcast');
      console.log('  3. Wait for confirmation to get IP Asset ID');
    } else {
      console.log('');
      console.log('❌ Some validations failed. Check the response structure.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testSimplifiedMint();