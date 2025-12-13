#!/usr/bin/env node

/**
 * Test Surreal Base API directly to understand expected format
 */

const SURREAL_BASE_URL = 'https://surreal-base.vercel.app';

async function testSurrealBaseDirect() {
  console.log('🔍 Testing Surreal Base API directly...');
  
  // Test the exact format from our Universal format test
  const testData = {
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ipMetadata: {
      title: "Test Dance NFT",
      description: "A test dance NFT for MVP validation",
      creators: [{
        name: "Test Creator",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString()
    },
    nftMetadata: {
      name: "Test Dance NFT",
      description: "A test dance NFT for MVP validation",
      attributes: [
        { key: "Dance Style", value: "Hip Hop" },
        { key: "Platform", value: "MoveMint" }
      ]
    },
    licenseTerms: {
      transferable: true,
      royaltyPolicy: "0x0000000000000000000000000000000000000000",
      defaultMintingFee: "100000000000000000",
      expiration: "0",
      commercialUse: true,
      commercialAttribution: false,
      commercializerChecker: "0x0000000000000000000000000000000000000000",
      commercializerCheckerData: "0x",
      commercialRevShare: 10,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevShare: 10,
      currency: "0x0000000000000000000000000000000000000000",
      uri: "https://example.com/license"
    }
  };
  
  try {
    console.log('📤 Sending request to Surreal Base...');
    console.log('  - URL:', `${SURREAL_BASE_URL}/api/prepare-mint`);
    console.log('  - Data keys:', Object.keys(testData));
    
    const response = await fetch(`${SURREAL_BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoveMint-Frontend/1.0',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Surreal Base direct call successful');
      console.log('  - Response keys:', Object.keys(result));
      console.log('  - Success:', result.success);
      if (result.transaction) {
        console.log('  - Transaction keys:', Object.keys(result.transaction));
      }
      if (result.metadata) {
        console.log('  - Metadata keys:', Object.keys(result.metadata));
      }
    } else {
      console.log('❌ Surreal Base direct call failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', JSON.stringify(result, null, 2));
      
      // Try to understand what's wrong
      if (result.error && result.error.details) {
        console.log('  - Error details:', JSON.stringify(result.error.details, null, 2));
      }
    }
    
    return response.ok;
  } catch (error) {
    console.log('❌ Surreal Base direct call error:', error.message);
    return false;
  }
}

async function testMinimalFormat() {
  console.log('\n🔍 Testing minimal format...');
  
  const minimalData = {
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ipMetadata: {
      title: "Test",
      description: "Test description",
      creators: [{
        name: "Test Creator",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        contributionPercent: 100
      }]
    },
    nftMetadata: {
      name: "Test",
      description: "Test description"
    }
  };
  
  try {
    const response = await fetch(`${SURREAL_BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoveMint-Frontend/1.0',
      },
      body: JSON.stringify(minimalData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Minimal format successful');
      console.log('  - Response keys:', Object.keys(result));
    } else {
      console.log('❌ Minimal format failed');
      console.log('  - Status:', response.status);
      console.log('  - Response:', JSON.stringify(result, null, 2));
    }
    
    return response.ok;
  } catch (error) {
    console.log('❌ Minimal format error:', error.message);
    return false;
  }
}

async function runDirectTests() {
  console.log('🚀 Testing Surreal Base API Directly');
  console.log('====================================');
  
  const results = {
    fullFormat: await testSurrealBaseDirect(),
    minimalFormat: await testMinimalFormat()
  };
  
  console.log('\n📊 Direct Test Results');
  console.log('=======================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n${passed}/${total} direct tests passed`);
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runDirectTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runDirectTests };