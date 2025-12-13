/**
 * Test Frontend Minting Integration
 * This script tests the complete frontend minting flow by simulating
 * what happens when a user clicks "Mint NFT" on the frontend
 */

async function testFrontendMinting() {
  console.log('🎭 Testing Frontend Minting Integration...\n');

  const API_URL = 'http://localhost:3000/api/mint-ip-asset';
  
  // Simulate real dance analysis data from the results page
  const analysisResults = {
    videoId: 'video-1734087553123',
    duration: 12.3,
    detectedMovements: [
      {
        id: 'movement_1',
        name: 'Pirouette',
        danceStyle: 'ballet',
        difficulty: 'Advanced',
        confidence: 0.92,
        timestamp: 2000,
        duration: 1500,
        startTime: 2.0,
        endTime: 3.5,
        timeRange: { start: 2.0, end: 3.5 },
        bodyParts: ['Legs', 'Core', 'Arms'],
        technique: 'Multiple turns on one foot with controlled balance',
        description: 'Advanced level Pirouette from ballet dance style'
      },
      {
        id: 'movement_2',
        name: 'Grand Jeté',
        danceStyle: 'ballet',
        difficulty: 'Advanced',
        confidence: 0.88,
        timestamp: 5000,
        duration: 800,
        startTime: 5.0,
        endTime: 5.8,
        timeRange: { start: 5.0, end: 5.8 },
        bodyParts: ['Legs', 'Full Body'],
        technique: 'Large traveling jump with extended legs',
        description: 'Advanced level Grand Jeté from ballet dance style'
      },
      {
        id: 'movement_3',
        name: 'Arabesque',
        danceStyle: 'ballet',
        difficulty: 'Intermediate',
        confidence: 0.95,
        timestamp: 8000,
        duration: 2000,
        startTime: 8.0,
        endTime: 10.0,
        timeRange: { start: 8.0, end: 10.0 },
        bodyParts: ['Legs', 'Core', 'Arms'],
        technique: 'Standing on one leg with the other extended behind',
        description: 'Intermediate level Arabesque from ballet dance style'
      }
    ],
    qualityMetrics: {
      overall: 94,
      technique: 91,
      timing: 96,
      expression: 89,
      clarity: 97
    },
    primaryStyle: 'ballet',
    styleDistribution: [
      {
        style: 'ballet',
        displayName: 'Ballet',
        count: 3,
        percentage: 100,
        averageDifficulty: 'Advanced'
      }
    ],
    danceMetrics: {
      totalMovements: 3,
      uniqueStyles: 1,
      averageDifficulty: 'Advanced',
      technicalComplexity: 0.85,
      artisticExpression: 0.89
    },
    recommendations: [
      'Outstanding ballet technique! Your pirouettes and grand jetés show excellent control',
      'Consider exploring more contemporary ballet fusion styles'
    ]
  };

  // Simulate user input from the frontend form
  const userInput = {
    title: 'Advanced Ballet Showcase',
    description: 'A stunning ballet performance featuring advanced techniques including pirouettes, grand jetés, and arabesques. This piece demonstrates exceptional technical skill and artistic expression.',
    tags: 'ballet, advanced, pirouette, grand jeté, arabesque, classical',
    price: '0.1',
    isPrivate: false
  };

  // Create the metadata exactly as the frontend would
  const primaryStyle = analysisResults.primaryStyle;
  const danceMetrics = analysisResults.danceMetrics;
  const styleDistribution = analysisResults.styleDistribution;
  
  const metadata = {
    name: userInput.title,
    description: userInput.description || `${primaryStyle.charAt(0).toUpperCase() + primaryStyle.slice(1)} dance NFT featuring ${analysisResults.detectedMovements.length} movements with ${danceMetrics.averageDifficulty || 'Beginner'} difficulty`,
    image: '', // Will be set by API
    animation_url: '', // Will be set by API
    attributes: [
      // Basic metrics
      { trait_type: 'Duration', value: `${Math.floor(analysisResults.duration / 60)}:${String(Math.floor(analysisResults.duration % 60)).padStart(2, '0')}` },
      { trait_type: 'Total Movements', value: analysisResults.detectedMovements.length, display_type: 'number' },
      { trait_type: 'Overall Quality', value: Math.round(analysisResults.qualityMetrics.overall), display_type: 'number' },
      
      // Dance-specific attributes
      { trait_type: 'Primary Style', value: primaryStyle.charAt(0).toUpperCase() + primaryStyle.slice(1) },
      { trait_type: 'Difficulty Level', value: danceMetrics.averageDifficulty || 'Beginner' },
      { trait_type: 'Style Diversity', value: danceMetrics.uniqueStyles || 1, display_type: 'number' },
      { trait_type: 'Technical Complexity', value: Math.round((danceMetrics.technicalComplexity || 0) * 100), display_type: 'number' },
      { trait_type: 'Artistic Expression', value: Math.round((danceMetrics.artisticExpression || 0) * 100), display_type: 'number' },
      
      // Style distribution (top 3 styles)
      ...styleDistribution.slice(0, 3).map((style, index) => ({
        trait_type: `Style ${index + 1}`,
        value: `${style.displayName} (${Math.round(style.percentage)}%)`
      })),
      
      // User tags
      ...userInput.tags.split(',').filter(tag => tag.trim()).map(tag => ({ trait_type: 'Tag', value: tag.trim() }))
    ],
    external_url: 'http://localhost:3000',
    
    // Enhanced dance-specific fields
    danceStyle: styleDistribution.map(style => style.style),
    primaryDanceStyle: primaryStyle,
    choreographer: '', // Could be added to form later
    musicInfo: undefined, // Could be extracted from analysis
    difficulty: danceMetrics.averageDifficulty || 'Beginner',
    technicalComplexity: danceMetrics.technicalComplexity || 0,
    artisticExpression: danceMetrics.artisticExpression || 0,
    styleDistribution: styleDistribution,
    movementsByStyle: analysisResults.movementsByStyle || {},
    recommendations: analysisResults.recommendations || [],
    originalVideo: analysisResults.videoId,
    analysisData: analysisResults,
    licenseTerms: {
      id: 'creative-commons',
      title: 'Creative Commons License',
      content: 'Creative Commons licensing terms',
      parameters: {
        commercialUse: true,
        derivativesAllowed: true,
        revenueSharePercentage: 5
      },
      ipfsHash: '',
      storyProtocolParams: {
        licenseTemplate: 'creative-commons',
        licenseTerms: {
          commercialUse: true,
          derivativesAllowed: true,
          revenueSharePercentage: 5
        },
        royaltyPolicy: 'default',
        mintingFee: '0.05'
      }
    }
  };

  // Test data to send to API (exactly as frontend would)
  const testData = {
    metadata,
    recipient: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433' // Use server wallet for testing
  };

  console.log('📋 Frontend Simulation Data:');
  console.log('   User Title:', userInput.title);
  console.log('   User Description:', userInput.description.substring(0, 80) + '...');
  console.log('   User Tags:', userInput.tags);
  console.log('   User Price:', userInput.price + ' IP');
  console.log('   Private:', userInput.isPrivate ? 'Yes' : 'No');
  console.log('');
  
  console.log('📊 Analysis Data:');
  console.log('   Video ID:', analysisResults.videoId);
  console.log('   Duration:', analysisResults.duration + 's');
  console.log('   Primary Style:', analysisResults.primaryStyle);
  console.log('   Movements:', analysisResults.detectedMovements.length);
  console.log('   Quality Score:', analysisResults.qualityMetrics.overall + '/100');
  console.log('   Difficulty:', analysisResults.danceMetrics.averageDifficulty);
  console.log('   Featured Moves:', analysisResults.detectedMovements.map(m => m.name).join(', '));
  console.log('');
  
  console.log('🎯 Generated NFT Metadata:');
  console.log('   Name:', metadata.name);
  console.log('   Attributes Count:', metadata.attributes.length);
  console.log('   Primary Dance Style:', metadata.primaryDanceStyle);
  console.log('   Technical Complexity:', Math.round(metadata.technicalComplexity * 100) + '%');
  console.log('   Artistic Expression:', Math.round(metadata.artisticExpression * 100) + '%');
  console.log('   Recipient:', testData.recipient);
  console.log('');

  try {
    console.log('🚀 Sending minting request (simulating frontend)...');
    
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
      console.log('✅ Frontend Minting Integration Successful!');
      console.log('');
      console.log('📋 Minting Results:');
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
      console.log('🎉 SUCCESS! Frontend → API → Story Protocol Integration Complete!');
      console.log('');
      console.log('🔗 Links:');
      console.log('   Transaction:', responseData.explorerUrl);
      console.log('   Frontend App:', 'http://localhost:3000/app/mint');
      console.log('   Dashboard:', 'http://localhost:3000/app/dashboard');
      console.log('');
      console.log('✨ The minting page is now fully integrated and working!');
      
    } else {
      console.log('❌ Frontend Minting Integration Failed');
      console.log('');
      console.log('📋 Error Response:');
      console.log('   Error:', responseData.error);
      console.log('   User Message:', responseData.userMessage);
      console.log('   Details:', responseData.details);
      
      if (responseData.suggestion) {
        console.log('   Suggestion:', responseData.suggestion);
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('💡 Make sure the development server is running:');
      console.log('   npm run dev');
      console.log('   Then visit: http://localhost:3000');
    }
  }
}

// Run the test
testFrontendMinting().catch(console.error);