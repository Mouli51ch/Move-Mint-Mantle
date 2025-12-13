#!/usr/bin/env node

/**
 * Test CORS configuration for Surreal Base API
 */

const https = require('https');

async function testCORS() {
  console.log('🧪 Testing CORS configuration for Surreal Base API...\n');

  const testEndpoints = [
    '/api/health',
    '/api/license-remixer?action=templates'
  ];

  for (const endpoint of testEndpoints) {
    console.log(`📡 Testing: ${endpoint}`);
    
    try {
      const response = await makeRequest('surreal-base.vercel.app', endpoint);
      console.log(`  ✅ Status: ${response.statusCode}`);
      console.log(`  📋 Headers:`);
      
      // Check for CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        if (response.headers[header]) {
          console.log(`    ${header}: ${response.headers[header]}`);
        } else {
          console.log(`    ${header}: ❌ NOT SET`);
        }
      });
      
      console.log('');
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }

  // Test preflight request
  console.log('🔍 Testing preflight (OPTIONS) request...');
  try {
    const preflightResponse = await makeOptionsRequest('surreal-base.vercel.app', '/api/license-remixer');
    console.log(`  ✅ Preflight Status: ${preflightResponse.statusCode}`);
    console.log(`  📋 Preflight Headers:`);
    
    Object.keys(preflightResponse.headers).forEach(header => {
      if (header.startsWith('access-control-')) {
        console.log(`    ${header}: ${preflightResponse.headers[header]}`);
      }
    });
  } catch (error) {
    console.error(`  ❌ Preflight Error: ${error.message}`);
  }
}

function makeRequest(hostname, path) {
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

function makeOptionsRequest(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
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

// Run the test
testCORS().catch(console.error);