#!/usr/bin/env node

/**
 * Test the proxy endpoints to ensure they work correctly
 */

const http = require('http');

async function testProxyEndpoints() {
  console.log('🧪 Testing proxy endpoints...\n');

  // Test 1: License templates
  console.log('📡 Testing: /api/proxy/license-remixer?action=templates');
  try {
    const templatesResponse = await makeRequest('localhost', 3000, '/api/proxy/license-remixer?action=templates');
    console.log(`  ✅ Status: ${templatesResponse.statusCode}`);
    
    if (templatesResponse.statusCode === 200) {
      const data = JSON.parse(templatesResponse.data);
      console.log(`  📋 Response keys:`, Object.keys(data));
      if (data.data && data.data.templates) {
        console.log(`  🎯 Templates found:`, Object.keys(data.data.templates));
      }
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Custom license creation
  console.log('📡 Testing: /api/proxy/license-remixer (POST)');
  try {
    const licenseBody = {
      creatorAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      commercialUse: true,
      derivativesAllowed: true,
      revenueSharePercentage: 10,
      uploadToIPFS: true
    };

    const licenseResponse = await makePostRequest('localhost', 3000, '/api/proxy/license-remixer', licenseBody);
    console.log(`  ✅ Status: ${licenseResponse.statusCode}`);
    
    if (licenseResponse.statusCode === 200) {
      const data = JSON.parse(licenseResponse.data);
      console.log(`  📋 Response keys:`, Object.keys(data));
      if (data.data) {
        console.log(`  🎯 License data keys:`, Object.keys(data.data));
      }
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Prepare mint
  console.log('📡 Testing: /api/proxy/prepare-mint (POST)');
  try {
    const mintBody = {
      userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      ipMetadata: {
        title: "Test IP Asset",
        description: "Testing proxy",
        creators: [{
          name: "Test Creator",
          address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
          contributionPercent: 100
        }]
      },
      nftMetadata: {
        name: "Test NFT",
        description: "Test NFT for proxy"
      }
    };

    const mintResponse = await makePostRequest('localhost', 3000, '/api/proxy/prepare-mint', mintBody);
    console.log(`  ✅ Status: ${mintResponse.statusCode}`);
    
    if (mintResponse.statusCode === 200) {
      const data = JSON.parse(mintResponse.data);
      console.log(`  📋 Response keys:`, Object.keys(data));
      if (data.transaction) {
        console.log(`  🎯 Transaction keys:`, Object.keys(data.transaction));
      }
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

function makeRequest(hostname, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    
    req.end();
  });
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

// Check if Next.js dev server is running
console.log('🔍 Checking if Next.js dev server is running on localhost:3000...');

makeRequest('localhost', 3000, '/api/health')
  .then(() => {
    console.log('✅ Next.js dev server is running\n');
    return testProxyEndpoints();
  })
  .catch(() => {
    console.log('❌ Next.js dev server is not running on localhost:3000');
    console.log('Please start the dev server with: npm run dev');
    process.exit(1);
  });