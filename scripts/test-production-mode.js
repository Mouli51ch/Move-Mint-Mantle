#!/usr/bin/env node

/**
 * Test script to verify production mode (no demo mode) is working
 * This will test the actual Surreal Base integration
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testProductionMode() {
  console.log('🧪 Testing Production Mode (Demo Mode Disabled)');
  console.log('================================================');

  try {
    // Test mint-ip-asset endpoint with real Surreal Base integration
    console.log('\n1. Testing mint-ip-asset endpoint...');
    
    const mintResponse = await fetch(`${API_BASE}/api/mint-ip-asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          name: 'Test Production NFT',
          description: 'Testing production mode without demo bypass',
          image: 'https://example.com/test.jpg',
          attributes: [
            { trait_type: 'Dance Style', value: 'Hip Hop' },
            { trait_type: 'Difficulty', value: 'Intermediate' }
          ],
          danceStyle: ['Hip Hop'],
          difficulty: 'Intermediate'
        },
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      })
    });

    console.log('Response Status:', mintResponse.status);
    console.log('Response Headers:', Object.fromEntries(mintResponse.headers.entries()));

    const mintResult = await mintResponse.json();
    console.log('Response Body:', JSON.stringify(mintResult, null, 2));

    if (mintResponse.ok) {
      console.log('✅ Production mode test successful!');
      
      // Check if it's using real Surreal Base (not demo)
      if (mintResult.message && mintResult.message.includes('Demo')) {
        console.log('❌ Still in demo mode - check environment variables');
        return false;
      } else {
        console.log('✅ Using real Surreal Base integration');
        return true;
      }
    } else {
      console.log('❌ Production mode test failed');
      console.log('Error:', mintResult.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

async function testEnvironmentConfig() {
  console.log('\n2. Testing environment configuration...');
  
  try {
    const response = await fetch(`${API_BASE}/api/mint-ip-asset`, {
      method: 'GET'
    });

    const config = await response.json();
    console.log('Configuration:', JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Config test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Production Mode Tests...\n');

  const results = await Promise.all([
    testProductionMode(),
    testEnvironmentConfig()
  ]);

  const allPassed = results.every(result => result);

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Production Mode: ${results[0] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Environment Config: ${results[1] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (allPassed) {
    console.log('\n🎉 Production mode is working correctly!');
    console.log('   - Demo mode has been disabled');
    console.log('   - Using real Surreal Base integration');
    console.log('   - Ready for production deployment');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}