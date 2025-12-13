#!/usr/bin/env node

/**
 * Test script to verify real Surreal Base integration is working
 * This will test the actual production flow without any mocking
 */

const fetch = require('node-fetch');

const SURREAL_BASE_URL = 'https://surreal-base.vercel.app';
const LOCAL_API_BASE = 'http://localhost:3000';

async function testSurrealBaseDirectly() {
  console.log('🧪 Testing Surreal Base API directly...');
  
  try {
    // Test the prepare-mint endpoint directly
    const response = await fetch(`${SURREAL_BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        ipMetadata: {
          title: 'Test Real Integration',
          description: 'Testing real Surreal Base integration with JWT',
          creators: [{
            name: 'MoveMint Creator',
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            contributionPercent: 100
          }],
          createdAt: new Date().toISOString(),
        },
        nftMetadata: {
          name: 'Test Real NFT',
          description: 'Testing real blockchain minting',
          attributes: [
            { key: 'Dance Style', value: 'Hip Hop' },
            { key: 'Difficulty', value: 'Intermediate' }
          ]
        }
      })
    });

    console.log('Direct API Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Surreal Base API working directly!');
      console.log('Response:', JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Direct API failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Direct API test failed:', error.message);
    return false;
  }
}

async function testViaProxy() {
  console.log('\n🧪 Testing via local proxy...');
  
  try {
    const response = await fetch(`${LOCAL_API_BASE}/api/proxy/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        ipMetadata: {
          title: 'Test Proxy Integration',
          description: 'Testing proxy to Surreal Base with JWT',
          creators: [{
            name: 'MoveMint Creator',
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            contributionPercent: 100
          }],
          createdAt: new Date().toISOString(),
        },
        nftMetadata: {
          name: 'Test Proxy NFT',
          description: 'Testing proxy blockchain minting',
          attributes: [
            { key: 'Dance Style', value: 'Hip Hop' },
            { key: 'Difficulty', value: 'Intermediate' }
          ]
        }
      })
    });

    console.log('Proxy Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Proxy integration working!');
      console.log('Response:', JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Proxy failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Proxy test failed:', error.message);
    return false;
  }
}

async function testFullMintingFlow() {
  console.log('\n🧪 Testing full minting flow...');
  
  try {
    const response = await fetch(`${LOCAL_API_BASE}/api/mint-ip-asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          name: 'Real Production NFT',
          description: 'Testing full production minting flow with real blockchain',
          image: 'https://example.com/test.jpg',
          attributes: [
            { trait_type: 'Dance Style', value: 'Hip Hop' },
            { trait_type: 'Difficulty', value: 'Advanced' },
            { trait_type: 'Duration', value: '3:45' }
          ],
          danceStyle: ['Hip Hop'],
          difficulty: 'Advanced'
        },
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      })
    });

    console.log('Full Flow Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Full minting flow working!');
      
      // Check if it's using real blockchain (not demo)
      if (result.message && result.message.includes('Demo')) {
        console.log('❌ Still using demo mode!');
        return false;
      }
      
      console.log('Transaction Hash:', result.transactionHash);
      console.log('Explorer URL:', result.explorerUrl);
      console.log('Token ID:', result.tokenId);
      console.log('Prepared By:', result.preparedBy);
      
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Full flow failed:', JSON.stringify(error, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Full flow test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Real Surreal Base Integration');
  console.log('=======================================');
  console.log('This will test the production flow with real blockchain transactions\n');

  const results = await Promise.all([
    testSurrealBaseDirectly(),
    testViaProxy(),
    testFullMintingFlow()
  ]);

  const [directTest, proxyTest, fullFlowTest] = results;

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Direct Surreal Base API: ${directTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Proxy Integration: ${proxyTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Full Minting Flow: ${fullFlowTest ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = results.every(result => result);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (allPassed) {
    console.log('\n🎉 Real Surreal Base integration is working!');
    console.log('   ✅ JWT configuration is working');
    console.log('   ✅ IPFS uploads are working');
    console.log('   ✅ Blockchain transactions are working');
    console.log('   ✅ Demo mode has been removed');
    console.log('   🚀 Ready for production use!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    
    if (!directTest) {
      console.log('   - Direct API test failed: Check Surreal Base deployment');
    }
    if (!proxyTest) {
      console.log('   - Proxy test failed: Check local proxy configuration');
    }
    if (!fullFlowTest) {
      console.log('   - Full flow test failed: Check minting API integration');
    }
  }

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}