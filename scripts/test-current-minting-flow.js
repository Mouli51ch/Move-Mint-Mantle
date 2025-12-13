/**
 * Test Current Minting Flow
 * This script tests what API endpoint is actually being called by the current minting page
 */

async function testCurrentMintingFlow() {
  console.log('🔍 Testing Current Minting Flow...\n');

  // Test the correct API endpoint that should be called
  const CORRECT_API_URL = 'http://localhost:3000/api/mint-ip-asset';
  const WRONG_API_URL = 'http://localhost:3000/api/mint-nft';
  
  // Simple test data
  const testData = {
    metadata: {
      name: 'Test NFT',
      description: 'Test description',
      image: '',
      attributes: []
    },
    recipient: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433'
  };

  console.log('🎯 Testing CORRECT API endpoint: /api/mint-ip-asset');
  try {
    const response = await fetch(CORRECT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORRECT API working!');
      console.log('   Transaction Hash:', data.transactionHash);
      console.log('   Contract Used:', data.ipAsset?.contractAddress);
      console.log('   Gateway Used:', data.ipAsset?.gatewayContract);
    } else {
      const errorData = await response.json();
      console.log('❌ CORRECT API failed:', errorData.error);
    }
  } catch (error) {
    console.log('❌ CORRECT API error:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  console.log('🎯 Testing WRONG API endpoint: /api/mint-nft');
  try {
    const wrongTestData = {
      to: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433',
      tokenURI: 'data:application/json;base64,eyJuYW1lIjoiVGVzdCJ9'
    };

    const response = await fetch(WRONG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wrongTestData)
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('⚠️ WRONG API is working (this might be the problem!)');
      console.log('   Transaction Hash:', data.transactionHash);
      console.log('   Contract Used:', data.nft?.blockchain?.contractAddress);
    } else {
      const errorData = await response.json();
      console.log('✅ WRONG API correctly failed:', errorData.error);
    }
  } catch (error) {
    console.log('✅ WRONG API correctly errored:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Check which endpoints are available
  console.log('🔍 Checking available API endpoints...');
  
  const endpoints = [
    '/api/mint-ip-asset',
    '/api/mint-nft',
    '/api/prepare-mint',
    '/api/execute-transaction'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${data.status || 'active'} - ${data.description || 'No description'}`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎯 CONCLUSION:');
  console.log('   - The CORRECT endpoint is: /api/mint-ip-asset');
  console.log('   - This uses Story Protocol Gateway: 0x937bef10ba6fb941ed84b8d249abc76031429a9a');
  console.log('   - This uses SPG NFT Contract: 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc');
  console.log('   - The minting page should call /api/mint-ip-asset');
  console.log('');
  console.log('🔍 If you see failed transactions with contract 0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424,');
  console.log('   it means something is still calling the old /api/mint-nft endpoint!');
}

// Run the test
testCurrentMintingFlow().catch(console.error);