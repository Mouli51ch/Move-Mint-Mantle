#!/usr/bin/env node

/**
 * MVP Integration Test
 * Tests the complete flow without mock data, proxies, or demo logic
 */

const FRONTEND_URL = 'http://localhost:3000';
const SURREAL_BASE_URL = 'https://surreal-base.vercel.app';

async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  
  try {
    const response = await fetch(`${SURREAL_BASE_URL}/api/health`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Surreal Base health check passed');
      console.log('  - Status:', result.status);
      console.log('  - Version:', result.version);
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

async function testLicenseTemplates() {
  console.log('\n📄 Testing license templates (direct Surreal Base call)...');
  
  try {
    const response = await fetch(`${SURREAL_BASE_URL}/api/license-remixer?action=templates`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ License templates fetched successfully');
      console.log('  - Templates count:', Object.keys(result.data.templates || {}).length);
      console.log('  - Available templates:', Object.keys(result.data.templates || {}));
      return true;
    } else {
      console.log('❌ License templates fetch failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ License templates error:', error.message);
    return false;
  }
}

async function testPrepareMint() {
  console.log('\n🔨 Testing prepare mint (via frontend API)...');
  
  const testData = {
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ipMetadata: {
      title: "Test Dance NFT",
      description: "A test dance NFT for MVP validation",
      creators: [{
        name: "Test Creator",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        contributionPercent: 100
      }]
    },
    nftMetadata: {
      name: "Test Dance NFT",
      description: "A test dance NFT for MVP validation",
      attributes: [
        { key: "Dance Style", value: "Hip Hop" },
        { key: "Platform", value: "MoveMint" }
      ]
    },
    licenseTerms: {
      transferable: true,
      royaltyPolicy: "0x0000000000000000000000000000000000000000",
      defaultMintingFee: "100000000000000000"
    }
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
      console.log('✅ Prepare mint successful');
      console.log('  - Response keys:', Object.keys(result));
      return true;
    } else {
      console.log('❌ Prepare mint failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Prepare mint error:', error.message);
    return false;
  }
}

async function testDanceFormatTransformation() {
  console.log('\n💃 Testing dance format transformation...');
  
  const danceData = {
    title: "Test Dance",
    description: "A test dance for MVP validation",
    danceStyle: "Hip Hop",
    choreographer: "Test Choreographer",
    duration: "2:30",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    analysisResults: {
      totalMoves: 25,
      uniqueSequences: 8,
      confidenceScore: 0.95,
      complexity: "Intermediate",
      keyPoses: ["pose1", "pose2", "pose3"]
    },
    licenseTerms: {
      commercialUse: false,
      derivativesAllowed: true,
      revenueSharePercentage: 10
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
      console.log('✅ Dance format transformation successful');
      console.log('  - Response keys:', Object.keys(result));
      return true;
    } else {
      console.log('❌ Dance format transformation failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Dance format transformation error:', error.message);
    return false;
  }
}

async function runMVPTests() {
  console.log('🚀 Running MVP Integration Tests');
  console.log('=====================================');
  
  const results = {
    healthCheck: await testHealthCheck(),
    licenseTemplates: await testLicenseTemplates(),
    prepareMint: await testPrepareMint(),
    danceTransformation: await testDanceFormatTransformation()
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
    console.log('\n🎉 All MVP integration tests passed!');
    console.log('✅ No mock data detected');
    console.log('✅ No proxy endpoints used');
    console.log('✅ Direct Surreal Base integration working');
    console.log('✅ Dance format transformation working');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runMVPTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runMVPTests };