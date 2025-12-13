#!/usr/bin/env node

/**
 * Test the prepare-mint proxy to debug the 500 error
 */

const http = require('http');

async function testPrepareMintProxy() {
  console.log('🧪 Testing prepare-mint proxy...\n');

  const testBody = {
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ipMetadata: {
      title: "Test IP Asset",
      description: "Testing proxy",
      creators: [{
        name: "Test Creator",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString()
    },
    nftMetadata: {
      name: "Test NFT",
      description: "Test NFT for proxy",
      attributes: []
    }
  };

  try {
    console.log('📡 Testing: /api/proxy/prepare-mint');
    console.log('📦 Request body:', JSON.stringify(testBody, null, 2));
    
    const response = await makePostRequest('localhost', 3000, '/api/proxy/prepare-mint', testBody);
    console.log(`  ✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('📋 Response keys:', Object.keys(data));
      if (data.transaction) {
        console.log('🎯 Transaction keys:', Object.keys(data.transaction));
      }
    } else {
      console.log('❌ Error response:', response.data);
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
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

testPrepareMintProxy();