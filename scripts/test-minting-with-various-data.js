#!/usr/bin/env node

/**
 * Test Minting with Various Data Formats
 * Tests how the minting handles different analysis result structures
 */

const FRONTEND_URL = 'http://localhost:3000';

async function testWithCompleteData() {
  console.log('🧪 Testing with complete analysis data...');
  
  const completeData = {
    title: "Complete Data Test",
    description: "Testing with full analysis results",
    danceStyle: "Hip Hop",
    choreographer: "Test Choreographer",
    duration: "2:30",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    imageUrl: "https://example.com/image.jpg",
    videoUrl: "https://example.com/video.mp4",
    tags: ["hip-hop", "complete", "test"],
    analysisResults: {
      totalMoves: 15,
      uniqueSequences: 8,
      confidenceScore: 0.92,
      complexity: "Advanced",
      keyPoses: ["freeze", "windmill", "toprock", "downrock", "headspin"],
      timing: {
        bpm: 128,
        beatAlignment: 0.95
      },
      style_analysis: {
        primary_style: "Hip Hop",
        secondary_styles: ["Breaking", "Popping"],
        difficulty_level: "Advanced"
      }
    }
  };
  
  return await testMintRequest(completeData, 'Complete Data');
}

async function testWithMinimalData() {
  console.log('\n🧪 Testing with minimal analysis data...');
  
  const minimalData = {
    title: "Minimal Data Test",
    description: "Testing with minimal analysis results",
    danceStyle: "Ballet",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    analysisResults: {
      totalMoves: 0,
      uniqueSequences: 0,
      confidenceScore: 0,
      complexity: "Beginner"
    }
  };
  
  return await testMintRequest(minimalData, 'Minimal Data');
}

async function testWithMalformedData() {
  console.log('\n🧪 Testing with malformed analysis data...');
  
  const malformedData = {
    title: "Malformed Data Test",
    description: "Testing with malformed analysis results",
    danceStyle: "Contemporary",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    analysisResults: {
      // Missing expected fields
      someRandomField: "random value",
      totalMoves: "not a number", // Wrong type
      keyPoses: "not an array" // Wrong type
    }
  };
  
  return await testMintRequest(malformedData, 'Malformed Data');
}

async function testWithNullData() {
  console.log('\n🧪 Testing with null/undefined analysis data...');
  
  const nullData = {
    title: "Null Data Test",
    description: "Testing with null analysis results",
    danceStyle: "Jazz",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    analysisResults: null
  };
  
  return await testMintRequest(nullData, 'Null Data');
}

async function testMintRequest(data, testName) {
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ ${testName} test PASSED`);
      console.log(`  - Status: ${response.status}`);
      console.log(`  - Success: ${result.success}`);
      console.log(`  - Has transaction: ${!!result.transaction}`);
      console.log(`  - Has metadata: ${!!result.metadata}`);
      return true;
    } else {
      console.log(`❌ ${testName} test FAILED`);
      console.log(`  - Status: ${response.status}`);
      console.log(`  - Error: ${result.error?.message || result.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${testName} test ERROR: ${error.message}`);
    return false;
  }
}

async function runVariousDataTests() {
  console.log('🚀 Testing Minting with Various Data Formats');
  console.log('=============================================');
  
  const results = {
    completeData: await testWithCompleteData(),
    minimalData: await testWithMinimalData(),
    malformedData: await testWithMalformedData(),
    nullData: await testWithNullData()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n${passed}/${total} data format tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL DATA FORMAT TESTS PASSED!');
    console.log('✅ Minting handles complete data correctly');
    console.log('✅ Minting handles minimal data gracefully');
    console.log('✅ Minting handles malformed data safely');
    console.log('✅ Minting handles null data defensively');
    console.log('🛡️  Robust error handling implemented');
  } else {
    console.log('\n⚠️  Some data format tests failed');
    console.log('🔧 Check error handling for edge cases');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runVariousDataTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runVariousDataTests };