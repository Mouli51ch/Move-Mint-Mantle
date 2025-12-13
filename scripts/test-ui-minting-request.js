#!/usr/bin/env node

/**
 * Test UI Minting Request
 * Mimics exactly what the UI is sending to debug the 500 error
 */

const FRONTEND_URL = 'http://localhost:3000';

async function testUIMintingRequest() {
  console.log('🧪 Testing UI Minting Request (Exact Format)');
  console.log('=============================================');
  
  // This mimics the exact format the UI is sending based on the error logs
  const uiMintData = {
    title: "Test Dance NFT",
    description: "A dance NFT created with MoveMint",
    danceStyle: "freestyle", // This is what primaryStyle defaults to
    choreographer: "MoveMint Creator",
    duration: "0:00", // This is what happens when analysisResults?.duration is undefined
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    imageUrl: "", // Empty string from metadata.image
    videoUrl: "", // Empty string from metadata.animation_url
    tags: [], // Empty array when no tags
    analysisResults: {
      totalMoves: 0, // When detectedMovements is undefined
      uniqueSequences: 1, // Default when styleDistribution is empty
      confidenceScore: 0.8, // Default value
      complexity: "Beginner", // Default value
      keyPoses: ["Basic Move", "Dance Step", "Transition"], // Default fallback
      timing: {
        bpm: 120,
        beatAlignment: 0.9
      },
      style_analysis: {
        primary_style: "freestyle",
        secondary_styles: [], // Empty when styleDistribution is empty
        difficulty_level: "Beginner"
      }
    }
  };
  
  console.log('📤 Sending UI-format request:');
  console.log(JSON.stringify(uiMintData, null, 2));
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uiMintData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📥 Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ UI minting request successful!');
      console.log('  - Transaction prepared');
      console.log('  - Metadata uploaded to IPFS');
      return true;
    } else {
      console.log('❌ UI minting request failed');
      console.log('  - Status:', response.status);
      console.log('  - Error:', result.error?.message || result.message || 'Unknown error');
      
      // Check for specific error patterns
      if (result.error?.details) {
        console.log('  - Error details:', JSON.stringify(result.error.details, null, 2));
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ Request error:', error.message);
    return false;
  }
}

async function testWithRealSessionData() {
  console.log('\n🧪 Testing with realistic session data...');
  
  // This mimics what might be in the actual session storage
  const sessionMintData = {
    title: "Hip Hop Dance",
    description: "A hip hop dance performance",
    danceStyle: "Hip Hop",
    choreographer: "MoveMint Creator",
    duration: "2:30",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    imageUrl: "",
    videoUrl: "",
    tags: ["hip-hop", "dance"],
    analysisResults: {
      // This might be what's actually in the session
      videoId: "video-1765618449929",
      duration: 150,
      detectedMovements: [
        {
          name: "Hip Hop Step",
          type: "Hip Hop",
          confidence: 0.9,
          timeRange: { start: 0, end: 2 },
          description: "Basic hip hop movement",
          difficulty: "Beginner"
        }
      ],
      qualityMetrics: {
        overall: 0.85,
        technical: 0.80,
        artistic: 0.90
      },
      primaryStyle: "Hip Hop",
      styleDistribution: [
        { style: "Hip Hop", displayName: "Hip Hop", percentage: 100 }
      ],
      danceMetrics: {
        averageDifficulty: "Intermediate",
        uniqueStyles: 1,
        technicalComplexity: 0.75,
        artisticExpression: 0.80
      }
    }
  };
  
  // Transform to the format the UI sends
  const transformedData = {
    title: sessionMintData.title,
    description: sessionMintData.description,
    danceStyle: sessionMintData.analysisResults.primaryStyle || sessionMintData.danceStyle,
    choreographer: sessionMintData.choreographer,
    duration: sessionMintData.duration,
    userAddress: sessionMintData.userAddress,
    imageUrl: sessionMintData.imageUrl,
    videoUrl: sessionMintData.videoUrl,
    tags: sessionMintData.tags,
    analysisResults: {
      totalMoves: sessionMintData.analysisResults.detectedMovements?.length || 0,
      uniqueSequences: sessionMintData.analysisResults.styleDistribution?.length || 1,
      confidenceScore: sessionMintData.analysisResults.qualityMetrics?.overall || 0.8,
      complexity: sessionMintData.analysisResults.danceMetrics?.averageDifficulty || 'Beginner',
      keyPoses: sessionMintData.analysisResults.detectedMovements?.slice(0, 5).map(m => m.name) || ['Basic Move'],
      timing: {
        bpm: 120,
        beatAlignment: 0.9
      },
      style_analysis: {
        primary_style: sessionMintData.analysisResults.primaryStyle,
        secondary_styles: sessionMintData.analysisResults.styleDistribution?.slice(1).map(s => s.style) || [],
        difficulty_level: sessionMintData.analysisResults.danceMetrics?.averageDifficulty || 'Beginner'
      }
    }
  };
  
  console.log('📤 Sending session-based request:');
  console.log(JSON.stringify(transformedData, null, 2));
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData)
    });
    
    const result = await response.json();
    
    console.log('📥 Session-based response status:', response.status);
    
    if (response.ok && result.success) {
      console.log('✅ Session-based minting successful!');
      return true;
    } else {
      console.log('❌ Session-based minting failed');
      console.log('  - Error:', result.error?.message || result.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Session-based request error:', error.message);
    return false;
  }
}

async function runUITests() {
  const results = {
    uiFormat: await testUIMintingRequest(),
    sessionFormat: await testWithRealSessionData()
  };
  
  console.log('\n📊 UI Minting Test Results');
  console.log('============================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n${passed}/${total} UI minting tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All UI minting tests passed!');
    console.log('✅ The 500 error is not from the API format');
    console.log('🔍 Check browser console for client-side errors');
  } else {
    console.log('\n⚠️  UI minting tests failed');
    console.log('🔧 The 500 error is likely from the API');
  }
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runUITests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runUITests };