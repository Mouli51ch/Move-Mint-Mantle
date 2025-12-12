#!/usr/bin/env node

/**
 * API Endpoints Test
 * Tests the minting API endpoints directly
 */

const http = require('http');

console.log('🔧 Testing MoveMint API Endpoints\n');

// Test data for API calls
const testData = {
  prepareMint: {
    title: "Test Dance Routine",
    description: "Testing the minting API",
    danceStyle: "Hip-Hop",
    choreographer: "Test User",
    analysisResults: {
      totalMoves: 25,
      confidenceScore: 0.85
    }
  },
  
  licenseRemixer: {
    type: "Creative Commons",
    commercial: true,
    derivatives: true,
    royaltyPercentage: 5.0
  }
};

// Function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test endpoints
async function testEndpoints() {
  const tests = [
    {
      name: 'Health Check',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET'
      }
    },
    {
      name: 'Prepare Mint API',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/api/prepare-mint',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      data: testData.prepareMint
    },
    {
      name: 'License Remixer API',
      options: {
        hostname: 'localhost',
        port: 3000,
        path: '/api/license-remixer',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      data: testData.licenseRemixer
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      const result = await makeRequest(test.options, test.data);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`  ✅ Success (${result.status})`);
        if (result.data && typeof result.data === 'object') {
          console.log(`  📄 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`  ⚠️  Status: ${result.status}`);
        console.log(`  📄 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run tests
testEndpoints().then(() => {
  console.log('🎯 API endpoint testing complete!');
  console.log('\nIf all endpoints are working, you can proceed with:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Test the complete minting workflow');
  console.log('3. Connect your wallet and mint an IP NFT');
}).catch(console.error);