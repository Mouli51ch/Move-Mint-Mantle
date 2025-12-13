#!/usr/bin/env node

/**
 * Test CORS fix by making requests to both direct and proxy endpoints
 */

const https = require('https');
const http = require('http');

async function testCORSFix() {
  console.log('🧪 Testing CORS fix...\n');

  // Test 1: Direct request to Surreal Base (should fail with CORS in browser)
  console.log('📡 Testing direct request to Surreal Base API...');
  try {
    const directResponse = await makeHttpsRequest('surreal-base.vercel.app', '/api/license-remixer?action=templates');
    console.log(`  ✅ Direct request status: ${directResponse.statusCode}`);
    console.log(`  📋 CORS headers present: ${!!directResponse.headers['access-control-allow-origin']}`);
  } catch (error) {
    console.error(`  ❌ Direct request error: ${error.message}`);
  }

  console.log('');

  // Test 2: Proxy request (should work)
  console.log('📡 Testing proxy request...');
  try {
    const proxyResponse = await makeHttpRequest('localhost', 3000, '/api/proxy/license-remixer?action=templates');
    console.log(`  ✅ Proxy request status: ${proxyResponse.statusCode}`);
    console.log(`  📋 CORS headers present: ${!!proxyResponse.headers['access-control-allow-origin']}`);
    
    if (proxyResponse.statusCode === 200) {
      const data = JSON.parse(proxyResponse.data);
      console.log(`  🎯 Response structure:`, Object.keys(data));
    }
  } catch (error) {
    console.error(`  ❌ Proxy request error: ${error.message}`);
  }

  console.log('');

  // Test 3: Browser simulation (fetch with CORS)
  console.log('📡 Simulating browser fetch request...');
  try {
    const browserResponse = await makeHttpRequest('localhost', 3000, '/api/proxy/license-remixer?action=templates', {
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/app/mint'
    });
    console.log(`  ✅ Browser simulation status: ${browserResponse.statusCode}`);
    console.log(`  📋 CORS allow origin: ${browserResponse.headers['access-control-allow-origin']}`);
  } catch (error) {
    console.error(`  ❌ Browser simulation error: ${error.message}`);
  }
}

function makeHttpsRequest(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'User-Agent': 'CORS-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

function makeHttpRequest(hostname, port, path, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders
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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Check if Next.js dev server is running
console.log('🔍 Checking if Next.js dev server is running...');

makeHttpRequest('localhost', 3000, '/api/health')
  .then(() => {
    console.log('✅ Next.js dev server is running\n');
    return testCORSFix();
  })
  .catch(() => {
    console.log('❌ Next.js dev server is not running on localhost:3000');
    console.log('Please start the dev server with: npm run dev');
    console.log('\nTesting direct Surreal Base API only...\n');
    return testCORSFix();
  });