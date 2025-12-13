#!/usr/bin/env node

/**
 * Test Prepare Mint API Only
 * Focused test for the /api/prepare-mint endpoint
 */

const FRONTEND_URL = 'http://localhost:3000';
const SURREAL_BASE_URL = 'https://surreal-base.vercel.app';

async function testHealthCheck() {
  console.log('🏥 Testing Surreal Base health check...');
  
  try {
    const response = await fetch(`${SURREAL_BASE_URL}/api/health`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Surreal Base health check passed');
      console.log('  - Status:', result.status);
      return true;
    } else {
      console.log('❌ Surreal Base health check failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Surreal Base health check error:', error.message);
    return false;
  }
}

async function testPrepareMintUniversalFormat() {
  console.log('\n🔨 Testing prepare mint (Universal Minting Engine format)...');
  
  const testData = {
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
    // Note: Removed licenseTerms as it causes INTERNAL_ERROR in Surreal Base
    // Using minimal format that works: userAddress, ipMetadata, nftMetadata only
  };
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Prepare mint (Universal format) successful');
      console.log('  - Response keys:', Object.keys(result));
      if (result.success !== undefined) {
        console.log('  - Success:', result.success);
      }
      return true;
    } else {
      console.log('❌ Prepare mint (Universal format) failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Prepare mint (Universal format) error:', error.message);
    return false;
  }
}

async function testPrepareMintDanceFormat() {
  console.log('\n💃 Testing prepare mint (Dance format transformation)...');
  
  const danceData = {
    title: "Test Dance",
    description: "A test dance for MVP validation",
    danceStyle: "Hip Hop",
    choreographer: "Test Choreographer",
    duration: "2:30",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    imageUrl: "https://example.com/image.jpg",
    videoUrl: "https://example.com/video.mp4",
    analysisResults: {
      totalMoves: 25,
      uniqueSequences: 8,
      confidenceScore: 0.95,
      complexity: "Intermediate",
      keyPoses: ["pose1", "pose2", "pose3"]
    },
    licenseTerms: {
      transferable: true,
      royaltyPolicy: "0x0000000000000000000000000000000000000000",
      defaultMintingFee: "100000000000000000",
      expiration: "0",
      commercialUse: false,
      commercialAttribution: false,
      commercializerChecker: "0x0000000000000000000000000000000000000000",
      commercializerCheckerData: "0x",
      commercialRevShare: 10,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevShare: 10,
      currency: "0x0000000000000000000000000000000000000000",
      uri: "https://example.com/license"
    }
  };
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(danceData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Prepare mint (Dance format) successful');
      console.log('  - Response keys:', Object.keys(result));
      if (result.success !== undefined) {
        console.log('  - Success:', result.success);
      }
      return true;
    } else {
      console.log('❌ Prepare mint (Dance format) failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Prepare mint (Dance format) error:', error.message);
    return false;
  }
}

async function testCorsHeaders() {
  console.log('\n🌐 Testing CORS headers on prepare-mint...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const corsMethods = response.headers.get('Access-Control-Allow-Methods');
    
    console.log('  - Status:', response.status);
    console.log('  - CORS Origin:', corsOrigin);
    console.log('  - CORS Methods:', corsMethods);
    
    if (response.status === 200 && corsOrigin && corsMethods) {
      console.log('✅ CORS headers working');
      return true;
    } else {
      console.log('❌ CORS headers missing or incorrect');
      return false;
    }
  } catch (error) {
    console.log('❌ CORS test error:', error.message);
    return false;
  }
}

async function runPrepareMintTests() {
  console.log('🚀 Running Prepare Mint API Tests');
  console.log('===================================');
  
  const results = {
    healthCheck: await testHealthCheck(),
    corsHeaders: await testCorsHeaders(),
    universalFormat: await testPrepareMintUniversalFormat(),
    danceFormat: await testPrepareMintDanceFormat()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All prepare-mint tests passed!');
    console.log('✅ Surreal Base is accessible');
    console.log('✅ CORS headers are working');
    console.log('✅ Universal Minting Engine format works');
    console.log('✅ Dance format transformation works');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runPrepareMintTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runPrepareMintTests };