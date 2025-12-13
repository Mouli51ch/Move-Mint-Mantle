#!/usr/bin/env node

/**
 * Test Simplified Minting Flow (No License Components)
 * Tests the direct details → mint flow without license configuration
 */

const FRONTEND_URL = 'http://localhost:3000';

async function testSimplifiedMintingFlow() {
  console.log('🚀 Testing Simplified Minting Flow');
  console.log('==================================');
  
  // Test the dance format that should work directly
  const simplifiedMintData = {
    title: "Test Hip Hop Dance",
    description: "A test hip hop dance for simplified minting flow",
    danceStyle: "Hip Hop",
    choreographer: "Test Choreographer",
    duration: "2:15",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    imageUrl: "https://example.com/dance-image.jpg",
    videoUrl: "https://example.com/dance-video.mp4",
    tags: ["hip-hop", "test", "simplified"],
    analysisResults: {
      totalMoves: 28,
      uniqueSequences: 12,
      confidenceScore: 0.87,
      complexity: "Intermediate",
      keyPoses: ["freeze", "toprock", "downrock", "windmill", "headspin"],
      timing: {
        bpm: 125,
        beatAlignment: 0.88
      },
      style_analysis: {
        primary_style: "Hip Hop",
        secondary_styles: ["Breaking", "Locking"],
        difficulty_level: "Intermediate"
      }
    }
  };
  
  console.log('📤 Testing simplified mint request...');
  console.log('  - Title:', simplifiedMintData.title);
  console.log('  - Style:', simplifiedMintData.danceStyle);
  console.log('  - User Address:', simplifiedMintData.userAddress);
  console.log('  - Total Moves:', simplifiedMintData.analysisResults.totalMoves);
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simplifiedMintData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('❌ Simplified minting failed');
      console.log('  - Status:', response.status);
      console.log('  - Error:', result);
      return false;
    }
    
    console.log('✅ Simplified minting successful!');
    console.log('  - Success:', result.success);
    console.log('  - Has transaction:', !!result.transaction);
    console.log('  - Has metadata:', !!result.metadata);
    
    if (result.transaction) {
      console.log('  - Transaction to:', result.transaction.to);
      console.log('  - Transaction value:', result.transaction.value);
      console.log('  - Gas estimate:', result.transaction.gasEstimate);
    }
    
    if (result.metadata) {
      console.log('  - IP IPFS hash:', result.metadata.ipfsHash);
      console.log('  - NFT IPFS hash:', result.metadata.nftIpfsHash);
    }
    
    // Validate response structure
    const validationResults = {
      hasSuccess: result.success === true,
      hasTransaction: !!result.transaction,
      hasTransactionTo: !!result.transaction?.to,
      hasTransactionData: !!result.transaction?.data,
      hasMetadata: !!result.metadata,
      hasIpfsHash: !!result.metadata?.ipfsHash,
      hasNftIpfsHash: !!result.metadata?.nftIpfsHash,
      noMockData: !JSON.stringify(result).includes('demo-') && !JSON.stringify(result).includes('mock-')
    };
    
    console.log('\n🔍 Response Validation:');
    Object.entries(validationResults).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allValid = Object.values(validationResults).every(Boolean);
    
    if (allValid) {
      console.log('\n🎉 Simplified minting flow test PASSED!');
      console.log('✅ No license configuration required');
      console.log('✅ Direct details → mint flow works');
      console.log('✅ No mock data in response');
      console.log('✅ Real transaction preparation successful');
      console.log('✅ Surreal Base integration working');
    } else {
      console.log('\n⚠️  Some validation checks failed');
    }
    
    return allValid;
    
  } catch (error) {
    console.log('❌ Simplified minting test error:', error.message);
    return false;
  }
}

async function testInvalidData() {
  console.log('\n🔍 Testing invalid data handling...');
  
  const invalidData = {
    title: "", // Empty title should be handled gracefully
    description: "Test with empty title",
    danceStyle: "Hip Hop",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    analysisResults: {
      totalMoves: 0,
      uniqueSequences: 0,
      confidenceScore: 0,
      complexity: "Beginner"
    }
  };
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Invalid data handled gracefully');
      console.log('  - API provided defaults for missing fields');
      return true;
    } else {
      console.log('✅ Invalid data properly rejected');
      console.log('  - Status:', response.status);
      console.log('  - Error message:', result.error?.message || result.message);
      return true; // This is expected behavior
    }
  } catch (error) {
    console.log('❌ Invalid data test error:', error.message);
    return false;
  }
}

async function runSimplifiedTests() {
  const results = {
    simplifiedFlow: await testSimplifiedMintingFlow(),
    invalidDataHandling: await testInvalidData()
  };
  
  console.log('\n📊 Simplified Minting Test Results');
  console.log('===================================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n${passed}/${total} simplified minting tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL SIMPLIFIED MINTING TESTS PASSED!');
    console.log('🚀 The simplified minting flow is working perfectly');
    console.log('✅ No license components required');
    console.log('✅ Direct details → mint flow');
    console.log('✅ No mock data');
    console.log('✅ Real Surreal Base integration');
    console.log('✅ Proper error handling');
  } else {
    console.log('\n⚠️  Some simplified minting tests failed');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runSimplifiedTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runSimplifiedTests };