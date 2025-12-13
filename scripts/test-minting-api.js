/**
 * Test Minting API with Real Dance Analysis Data
 * This script tests the actual minting API endpoint with realistic dance analysis data
 * like what would be generated from the results page after analyzing a dance video
 */

async function testMintingAPI() {
  console.log('🎨 Testing Story Protocol Minting API with Real Dance Data...\n');

  const API_URL = 'http://localhost:3000/api/mint-ip-asset';
  
  // Real dance analysis data structure (like what comes from the results page)
  const realDanceAnalysis = {
    videoId: 'video-1734087553123',
    duration: 8.5,
    detectedMovements: [
      {
        id: 'movement_1',
        name: 'Port de bras',
        danceStyle: 'ballet',
        difficulty: 'Intermediate',
        confidence: 0.85,
        timestamp: 1200,
        duration: 800,
        startTime: 1.2,
        endTime: 2.0,
        timeRange: { start: 1.2, end: 2.0 },
        bodyParts: ['Arms', 'Shoulders'],
        technique: 'Graceful port de bras with extended arms',
        description: 'Intermediate level Port de bras from ballet dance style'
      },
      {
        id: 'movement_2',
        name: 'Plié',
        danceStyle: 'ballet',
        difficulty: 'Intermediate',
        confidence: 0.9,
        timestamp: 2500,
        duration: 1000,
        startTime: 2.5,
        endTime: 3.5,
        timeRange: { start: 2.5, end: 3.5 },
        bodyParts: ['Legs', 'Core'],
        technique: 'Bent knee position with turnout and proper alignment',
        description: 'Intermediate level Plié from ballet dance style'
      },
      {
        id: 'movement_3',
        name: 'Sauté',
        danceStyle: 'ballet',
        difficulty: 'Advanced',
        confidence: 0.88,
        timestamp: 4000,
        duration: 600,
        startTime: 4.0,
        endTime: 4.6,
        timeRange: { start: 4.0, end: 4.6 },
        bodyParts: ['Legs', 'Core', 'Full Body'],
        technique: 'Explosive upward movement with pointed toes',
        description: 'Advanced level Sauté from ballet dance style'
      }
    ],
    qualityMetrics: {
      overall: 87,
      technique: 82,
      timing: 85,
      expression: 80,
      clarity: 84
    },
    primaryStyle: 'ballet',
    styleDistribution: [
      {
        style: 'ballet',
        displayName: 'Ballet',
        count: 3,
        percentage: 100,
        averageDifficulty: 'Intermediate'
      }
    ],
    danceMetrics: {
      totalMovements: 3,
      uniqueStyles: 1,
      averageDifficulty: 'Intermediate',
      technicalComplexity: 0.6,
      artisticExpression: 0.7
    },
    recommendations: [
      'Excellent ballet technique! Consider exploring Arabesque and Grand Jeté',
      'Keep practicing ballet to further refine your technique'
    ]
  };

  // Create NFT metadata based on the dance analysis (like the results page would)
  const testData = {
    metadata: {
      name: `${realDanceAnalysis.primaryStyle.charAt(0).toUpperCase() + realDanceAnalysis.primaryStyle.slice(1)} Dance Performance`,
      description: `A ${realDanceAnalysis.duration}s ${realDanceAnalysis.primaryStyle} dance performance featuring ${realDanceAnalysis.detectedMovements.length} detected movements including ${realDanceAnalysis.detectedMovements.map(m => m.name).join(', ')}. Quality score: ${realDanceAnalysis.qualityMetrics.overall}/100.`,
      image: 'https://example.com/dance-thumbnail.jpg',
      attributes: [
        {
          key: 'Primary Dance Style',
          value: realDanceAnalysis.primaryStyle.charAt(0).toUpperCase() + realDanceAnalysis.primaryStyle.slice(1)
        },
        {
          key: 'Duration',
          value: `${realDanceAnalysis.duration}s`
        },
        {
          key: 'Movements Detected',
          value: realDanceAnalysis.detectedMovements.length.toString()
        },
        {
          key: 'Overall Quality',
          value: `${realDanceAnalysis.qualityMetrics.overall}/100`
        },
        {
          key: 'Average Difficulty',
          value: realDanceAnalysis.danceMetrics.averageDifficulty
        },
        {
          key: 'Technical Complexity',
          value: Math.round(realDanceAnalysis.danceMetrics.technicalComplexity * 100).toString()
        },
        {
          key: 'Artistic Expression',
          value: Math.round(realDanceAnalysis.danceMetrics.artisticExpression * 100).toString()
        },
        {
          key: 'Featured Movements',
          value: realDanceAnalysis.detectedMovements.slice(0, 3).map(m => m.name).join(', ')
        }
      ],
      danceStyle: [realDanceAnalysis.primaryStyle],
      primaryDanceStyle: realDanceAnalysis.primaryStyle,
      difficulty: realDanceAnalysis.danceMetrics.averageDifficulty,
      analysisData: realDanceAnalysis
    },
    recipient: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433' // Same as minting wallet for testing
  };

  console.log('📋 Real Dance Analysis Data:');
  console.log('   Video ID:', realDanceAnalysis.videoId);
  console.log('   Duration:', realDanceAnalysis.duration + 's');
  console.log('   Primary Style:', realDanceAnalysis.primaryStyle);
  console.log('   Movements Detected:', realDanceAnalysis.detectedMovements.length);
  console.log('   Quality Score:', realDanceAnalysis.qualityMetrics.overall + '/100');
  console.log('   Movements:', realDanceAnalysis.detectedMovements.map(m => m.name).join(', '));
  console.log('');
  
  console.log('📋 Generated NFT Metadata:');
  console.log('   Name:', testData.metadata.name);
  console.log('   Description:', testData.metadata.description.substring(0, 100) + '...');
  console.log('   Attributes Count:', testData.metadata.attributes.length);
  console.log('   Recipient:', testData.recipient);
  console.log('   API URL:', API_URL);
  console.log('');

  try {
    console.log('🚀 Sending request to minting API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Minting API call successful!');
      console.log('');
      console.log('📋 Response Data:');
      console.log('   Success:', responseData.success);
      console.log('   Transaction Hash:', responseData.transactionHash);
      console.log('   Token ID:', responseData.tokenId);
      console.log('   Block Number:', responseData.blockNumber);
      console.log('   Gas Used:', responseData.gasUsed);
      console.log('   Explorer URL:', responseData.explorerUrl);
      
      if (responseData.ipAsset) {
        console.log('');
        console.log('🎯 IP Asset Details:');
        console.log('   Contract Address:', responseData.ipAsset.contractAddress);
        console.log('   Gateway Contract:', responseData.ipAsset.gatewayContract);
        console.log('   Owner:', responseData.ipAsset.owner);
        console.log('   Network:', responseData.ipAsset.network);
      }
      
      console.log('');
      console.log('🎉 SUCCESS! IP Asset minted successfully on Story Protocol!');
      console.log('');
      console.log('🔍 Next Steps:');
      console.log('1. Check the transaction on the explorer:', responseData.explorerUrl);
      console.log('2. Verify the NFT was minted');
      console.log('3. Test the frontend integration');
      
    } else {
      console.log('❌ Minting API call failed');
      console.log('');
      console.log('📋 Error Response:');
      console.log('   Error:', responseData.error);
      console.log('   User Message:', responseData.userMessage);
      console.log('   Details:', responseData.details);
      
      if (responseData.suggestion) {
        console.log('   Suggestion:', responseData.suggestion);
      }
      
      if (responseData.walletAddress) {
        console.log('   Wallet Address:', responseData.walletAddress);
      }
      
      if (responseData.fundingUrl) {
        console.log('   Funding URL:', responseData.fundingUrl);
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('💡 Make sure the development server is running:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   yarn dev');
    }
  }
}

// Run the test
testMintingAPI().catch(console.error);