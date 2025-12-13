#!/usr/bin/env node

/**
 * Test with minimal data to see what works
 */

const http = require('http');

async function testMinimalRequest() {
  console.log('🧪 Testing minimal request...\n');

  // Absolute minimal metadata
  const minimalMetadata = {
    name: "Minimal Test NFT",
    description: "Minimal test description",
    attributes: []
  };

  const requestBody = {
    metadata: minimalMetadata,
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  };

  try {
    console.log('📡 Testing: /api/mint-ip-asset with minimal metadata');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await makePostRequest('localhost', 3000, '/api/mint-ip-asset', requestBody);
    console.log(`  ✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('📋 Response keys:', Object.keys(data));
      console.log('✅ Minimal minting successful!');
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

testMinimalRequest();