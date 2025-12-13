#!/usr/bin/env node

/**
 * Test script to verify the license remixer proxy is working
 */

const fetch = require('node-fetch');

const LOCAL_API_BASE = 'http://localhost:3000';

async function testLicenseProxy() {
  console.log('🧪 Testing License Remixer Proxy');
  console.log('================================');

  try {
    // Test the proxy endpoint for templates
    console.log('\n1. Testing GET /api/proxy/license-remixer?action=templates');
    
    const response = await fetch(`${LOCAL_API_BASE}/api/proxy/license-remixer?action=templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ License proxy working!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ License proxy failed');
      console.log('Error:', errorText);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

async function testDirectSurrealBase() {
  console.log('\n2. Testing direct Surreal Base API');
  
  try {
    const response = await fetch('https://surreal-base.vercel.app/api/license-remixer?action=templates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Direct API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct Surreal Base API working!');
      console.log('Templates available:', Object.keys(data.data?.templates || {}));
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Direct API failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Direct API test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting License Proxy Tests...\n');

  const results = await Promise.all([
    testLicenseProxy(),
    testDirectSurrealBase()
  ]);

  const [proxyTest, directTest] = results;

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`License Proxy: ${proxyTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Direct Surreal Base: ${directTest ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = results.every(result => result);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (allPassed) {
    console.log('\n🎉 License integration is working!');
    console.log('   ✅ Proxy endpoint is functional');
    console.log('   ✅ Surreal Base API is accessible');
    console.log('   🚀 Frontend should be able to load license templates');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    
    if (!proxyTest) {
      console.log('   - Proxy test failed: Check local proxy configuration');
    }
    if (!directTest) {
      console.log('   - Direct API test failed: Check Surreal Base deployment');
    }
  }

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}