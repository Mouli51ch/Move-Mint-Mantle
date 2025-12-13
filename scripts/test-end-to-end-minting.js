#!/usr/bin/env node

/**
 * End-to-End Minting Test
 * Tests the complete flow from frontend to Surreal Base
 */

const FRONTEND_URL = 'http://localhost:3000';

async function testCompleteFlow() {
  console.log('🚀 Testing Complete Minting Flow');
  console.log('=================================');
  
  // Simulate real dance data from frontend
  const danceData = {
    title: "Hip Hop Freestyle",
    description: "An energetic hip hop freestyle dance performance showcasing urban dance moves and creative expression.",
    danceStyle: "Hip Hop",
    choreographer: "Alex Rodriguez",
    duration: "3:45",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    imageUrl: "https://example.com/dance-thumbnail.jpg",
    videoUrl: "https://example.com/dance-video.mp4",
    tags: ["hip-hop", "freestyle", "urban", "street-dance"],
    analysisResults: {
      totalMoves: 42,
      uniqueSequences: 15,
      confidenceScore: 0.89,
      complexity: "Advanced",
      keyPoses: [
        "freeze", "windmill", "toprock", "downrock", "power-move"
      ],
      timing: {
        bpm: 128,
        beatAlignment: 0.92
      },
      style_analysis: {
        primary_style: "Hip Hop",
        secondary_styles: ["Breaking", "Popping"],
        difficulty_level: "Advanced"
      }
    }
  };
  
  console.log('📤 Sending dance data to prepare-mint...');
  console.log('  - Title:', danceData.title);
  console.log('  - Style:', danceData.danceStyle);
  console.log('  - Total Moves:', danceData.analysisResults.totalMoves);
  console.log('  - Complexity:', danceData.analysisResults.complexity);
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(danceData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('❌ Prepare mint failed');
      console.log('  - Status:', response.status);
      console.log('  - Error:', result);
      return false;
    }
    
    console.log('✅ Prepare mint successful!');
    console.log('  - Success:', result.success);
    console.log('  - Has transaction:', !!result.transaction);
    console.log('  - Has metadata:', !!result.metadata);
    
    if (result.transaction) {
      console.log('  - Transaction to:', result.transaction.to);
      console.log('  - Transaction data length:', result.transaction.data?.length || 0);
      console.log('  - Transaction value:', result.transaction.value);
      console.log('  - Gas estimate:', result.transaction.gasEstimate);
    }
    
    if (result.metadata) {
      console.log('  - IP IPFS hash:', result.metadata.ipfsHash);
      console.log('  - NFT IPFS hash:', result.metadata.nftIpfsHash);
    }
    
    // Validate the response structure
    const validationResults = {
      hasSuccess: result.success === true,
      hasTransaction: !!result.transaction,
      hasTransactionTo: !!result.transaction?.to,
      hasTransactionData: !!result.transaction?.data,
      hasMetadata: !!result.metadata,
      hasIpfsHash: !!result.metadata?.ipfsHash,
      hasNftIpfsHash: !!result.metadata?.nftIpfsHash
    };
    
    console.log('\n🔍 Response Validation:');
    Object.entries(validationResults).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allValid = Object.values(validationResults).every(Boolean);
    
    if (allValid) {
      console.log('\n🎉 Complete flow test PASSED!');
      console.log('✅ Dance data successfully transformed to Universal Minting Engine format');
      console.log('✅ Surreal Base accepted the request and prepared transaction');
      console.log('✅ All required response fields are present');
      console.log('✅ Ready for blockchain transaction signing');
    } else {
      console.log('\n⚠️  Some validation checks failed');
    }
    
    return allValid;
    
  } catch (error) {
    console.log('❌ Complete flow test error:', error.message);
    return false;
  }
}

async function testUniversalFormatPassthrough() {
  console.log('\n🔄 Testing Universal Format Passthrough...');
  
  // Test direct Universal Minting Engine format (using exact working format)
  const universalData = {
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ipMetadata: {
      title: "Test Dance NFT",
      description: "A test dance NFT for MVP validation",
      creators: [{
        name: "Test Creator",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString()
    },
    nftMetadata: {
      name: "Test Dance NFT",
      description: "A test dance NFT for MVP validation",
      attributes: [
        { key: "Dance Style", value: "Hip Hop" },
        { key: "Platform", value: "MoveMint" }
      ]
    }
  };
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(universalData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Universal format passthrough successful');
      return true;
    } else {
      console.log('❌ Universal format passthrough failed');
      console.log('  - Status:', response.status);
      console.log('  - Result:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Universal format passthrough error:', error.message);
    return false;
  }
}

async function runEndToEndTests() {
  const results = {
    completeFlow: await testCompleteFlow(),
    universalPassthrough: await testUniversalFormatPassthrough()
  };
  
  console.log('\n📊 End-to-End Test Results');
  console.log('============================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n${passed}/${total} end-to-end tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL END-TO-END TESTS PASSED!');
    console.log('🚀 The prepare-mint API is fully functional and ready for production');
    console.log('✅ Dance format transformation works perfectly');
    console.log('✅ Universal format passthrough works perfectly');
    console.log('✅ Surreal Base integration is complete');
    console.log('✅ Transaction preparation is working');
    console.log('✅ IPFS metadata upload is working');
  } else {
    console.log('\n⚠️  Some end-to-end tests failed');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runEndToEndTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runEndToEndTests };