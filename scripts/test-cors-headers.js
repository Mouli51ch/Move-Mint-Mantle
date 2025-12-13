#!/usr/bin/env node

/**
 * Test CORS Headers
 * Tests if all API endpoints have proper CORS headers
 */

const FRONTEND_URL = 'http://localhost:3000';

async function testCorsHeaders(endpoint, method = 'GET') {
  console.log(`\n🔍 Testing CORS headers for ${method} ${endpoint}...`);
  
  try {
    const response = await fetch(`${FRONTEND_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001', // Different origin to test CORS
      },
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
      'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
      'X-Frame-Options': response.headers.get('X-Frame-Options'),
    };
    
    console.log(`  Status: ${response.status}`);
    console.log('  CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`    ${status} ${key}: ${value || 'Missing'}`);
    });
    
    // Check if all required CORS headers are present
    const requiredHeaders = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'];
    const missingHeaders = requiredHeaders.filter(header => !corsHeaders[header]);
    
    if (missingHeaders.length === 0) {
      console.log('  ✅ All required CORS headers present');
      return true;
    } else {
      console.log(`  ❌ Missing headers: ${missingHeaders.join(', ')}`);
      return false;
    }
    
  } catch (error) {
    console.log(`  ❌ Request failed: ${error.message}`);
    return false;
  }
}

async function testOptionsRequest(endpoint) {
  console.log(`\n🔍 Testing OPTIONS preflight for ${endpoint}...`);
  
  try {
    const response = await fetch(`${FRONTEND_URL}${endpoint}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    console.log(`  Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('  ✅ OPTIONS preflight successful');
      return true;
    } else {
      console.log('  ❌ OPTIONS preflight failed');
      return false;
    }
    
  } catch (error) {
    console.log(`  ❌ OPTIONS request failed: ${error.message}`);
    return false;
  }
}

async function runCorsTests() {
  console.log('🚀 Running CORS Headers Tests');
  console.log('===============================');
  
  const endpoints = [
    '/api/health',
    '/api/prepare-mint',
    '/api/license-remixer',
    '/api/get-assets',
  ];
  
  const results = {
    corsHeaders: {},
    optionsRequests: {}
  };
  
  // Test CORS headers
  for (const endpoint of endpoints) {
    results.corsHeaders[endpoint] = await testCorsHeaders(endpoint);
  }
  
  // Test OPTIONS preflight requests
  for (const endpoint of endpoints) {
    results.optionsRequests[endpoint] = await testOptionsRequest(endpoint);
  }
  
  console.log('\n📊 CORS Test Results Summary');
  console.log('==============================');
  
  const corsHeadersPassed = Object.values(results.corsHeaders).filter(Boolean).length;
  const optionsPassed = Object.values(results.optionsRequests).filter(Boolean).length;
  const totalEndpoints = endpoints.length;
  
  console.log(`CORS Headers: ${corsHeadersPassed}/${totalEndpoints} endpoints passed`);
  console.log(`OPTIONS Preflight: ${optionsPassed}/${totalEndpoints} endpoints passed`);
  
  endpoints.forEach(endpoint => {
    const corsStatus = results.corsHeaders[endpoint] ? '✅' : '❌';
    const optionsStatus = results.optionsRequests[endpoint] ? '✅' : '❌';
    console.log(`${corsStatus}${optionsStatus} ${endpoint}`);
  });
  
  const allPassed = corsHeadersPassed === totalEndpoints && optionsPassed === totalEndpoints;
  
  if (allPassed) {
    console.log('\n🎉 All CORS tests passed!');
    console.log('✅ CORS headers properly configured');
    console.log('✅ OPTIONS preflight requests working');
  } else {
    console.log('\n⚠️  Some CORS tests failed. Check the logs above for details.');
  }
  
  return allPassed;
}

// Run tests if called directly
if (require.main === module) {
  runCorsTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('CORS test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runCorsTests };