#!/usr/bin/env node

/**
 * Test the complete mint flow to debug the issue
 */

const http = require('http');

async function testMintFlow() {
  console.log('🧪 Testing complete mint flow...\n');

  // Simulate the metadata that would come from the frontend
  const frontendMetadata = {
    name: "Test Dance NFT",
    description: "A test dance performance NFT",
    image: "",
    animation_url: "",
    attributes: [
      { trait_type: 'Duration', value: '2:30' },
      { trait_type: 'Primary Style', value: 'Hip-Hop' },
      { trait_type: 'Difficulty Level', value: 'Beginner' }
    ],
    danceStyle: ['Hip-Hop'],
    primaryDanceStyle: 'Hip-Hop',
    difficulty: 'Beginner'
  };

  const requestBody = {
    metadata: frontendMetadata,
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  };

  try {
    console.log('📡 Testing: /api/mint-ip-asset');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await makePostRequest('localhost', 3000, '/api/mint-ip-asset', requestBody);
    console.log(`  ✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('📋 Response keys:', Object.keys(data));
      console.log('✅ Minting successful!');
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

testMintFlow();