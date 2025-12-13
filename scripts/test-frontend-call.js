#!/usr/bin/env node

/**
 * Test script to simulate exactly what the frontend is calling
 */

const fetch = require('node-fetch');

const LOCAL_API_BASE = 'http://localhost:3000';

async function testFrontendCall() {
  console.log('🧪 Testing Exact Frontend API Call');
  console.log('==================================');

  try {
    // Simulate the exact call the frontend makes
    console.log('\n📞 Calling /api/mint-ip-asset (same as frontend)...');
    
    const response = await fetch(`${LOCAL_API_BASE}/api/mint-ip-asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          name: 'Test Frontend Call',
          description: 'Testing exact frontend call to mint-ip-asset',
          attributes: [
            { trait_type: 'Test', value: 'Frontend Call' }
          ]
        },
        recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      })
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('\n📄 Full Response:');
    console.log(JSON.stringify(result, null, 2));

    // Check for demo indicators
    console.log('\n🔍 Checking for Demo Indicators:');
    console.log('- Transaction Hash:', result.transactionHash);
    console.log('- Contains "demo":', result.transactionHash?.includes('demo') ? '❌ YES' : '✅ NO');
    console.log('- Mode field:', result.mode || 'not set');
    console.log('- Status:', result.status);
    console.log('- Message:', result.message);

    if (result.transactionHash?.includes('demo')) {
      console.log('\n❌ DEMO TRANSACTION DETECTED!');
      console.log('   This means the API is still returning demo/mock data');
      return false;
    } else {
      console.log('\n✅ Real transaction data returned');
      return true;
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Frontend API Call...\n');

  const success = await testFrontendCall();

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Frontend API Call: ${success ? '✅ REAL DATA' : '❌ DEMO DATA'}`);

  if (!success) {
    console.log('\n⚠️  The frontend is still receiving demo transaction hashes');
    console.log('   - Check if the correct API endpoint is being called');
    console.log('   - Verify no demo/mock logic is active');
    console.log('   - Ensure Surreal Base is returning real data');
  }

  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}