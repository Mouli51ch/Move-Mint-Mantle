#!/usr/bin/env node

/**
 * Test with frontend-like complex metadata to debug the issue
 */

const http = require('http');

async function testFrontendLikeRequest() {
  console.log('🧪 Testing frontend-like request...\n');

  // Simulate the complex metadata that comes from the frontend
  const complexMetadata = {
    name: "Test Dance NFT",
    description: "A test dance performance NFT with complex metadata",
    image: "", // Empty string that was causing issues
    animation_url: "",
    attributes: [
      { trait_type: 'Duration', value: '2:30' },
      { trait_type: 'Total Movements', value: 15, display_type: 'number' },
      { trait_type: 'Overall Quality', value: 85, display_type: 'number' },
      { trait_type: 'Primary Style', value: 'Hip-Hop' },
      { trait_type: 'Difficulty Level', value: 'Beginner' },
      { trait_type: 'Style Diversity', value: 3, display_type: 'number' },
      { trait_type: 'Technical Complexity', value: 75, display_type: 'number' },
      { trait_type: 'Artistic Expression', value: 80, display_type: 'number' },
      { trait_type: 'Style 1', value: 'Hip-Hop (60%)' },
      { trait_type: 'Style 2', value: 'Freestyle (25%)' },
      { trait_type: 'Style 3', value: 'Contemporary (15%)' },
      { trait_type: 'Tag', value: 'dance' },
      { trait_type: 'Tag', value: 'performance' }
    ],
    external_url: 'http://localhost:3000',
    danceStyle: ['Hip-Hop', 'Freestyle'],
    primaryDanceStyle: 'Hip-Hop',
    choreographer: '',
    musicInfo: undefined,
    difficulty: 'Beginner',
    technicalComplexity: 0.75,
    artisticExpression: 0.8,
    styleDistribution: [
      { style: 'Hip-Hop', displayName: 'Hip-Hop', percentage: 60 },
      { style: 'Freestyle', displayName: 'Freestyle', percentage: 25 },
      { style: 'Contemporary', displayName: 'Contemporary', percentage: 15 }
    ],
    movementsByStyle: {
      'Hip-Hop': ['bounce', 'pop', 'lock'],
      'Freestyle': ['flow', 'improvisation']
    },
    recommendations: ['Great energy!', 'Nice flow'],
    originalVideo: 'video-123',
    analysisData: {
      videoId: 'video-123',
      duration: 150,
      detectedMovements: [
        { name: 'bounce', confidence: 0.9 },
        { name: 'pop', confidence: 0.8 }
      ],
      qualityMetrics: { overall: 85 }
    },
    licenseTerms: {
      id: 'default',
      title: 'Standard License',
      content: 'Standard licensing terms',
      parameters: {},
      ipfsHash: '',
      storyProtocolParams: {
        licenseTemplate: 'standard',
        licenseTerms: {},
        royaltyPolicy: 'default',
        mintingFee: '0.05'
      }
    }
  };

  const requestBody = {
    metadata: complexMetadata,
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  };

  try {
    console.log('📡 Testing: /api/mint-ip-asset with complex metadata');
    console.log('📦 Metadata keys:', Object.keys(complexMetadata));
    console.log('📦 Attributes count:', complexMetadata.attributes.length);
    
    const response = await makePostRequest('localhost', 3000, '/api/mint-ip-asset', requestBody);
    console.log(`  ✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('📋 Response keys:', Object.keys(data));
      console.log('✅ Minting successful with complex metadata!');
    } else {
      console.log('❌ Error response:');
      try {
        const errorData = JSON.parse(response.data);
        console.log(JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log(response.data);
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

function makePostRequest(hostname, port, path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    
    const options = {
      hostname,
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

testFrontendLikeRequest();