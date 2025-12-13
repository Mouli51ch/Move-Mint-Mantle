#!/usr/bin/env node

/**
 * Compare the two requests to see what's different
 */

const SURREAL_BASE_URL = 'https://surreal-base.vercel.app';

async function testFailingRequest() {
  console.log('🔍 Testing failing request directly to Surreal Base...');
  
  const failingData = {
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ipMetadata: {
      title: "Direct Universal Format Test",
      description: "Testing direct Universal Minting Engine format passthrough",
      creators: [{
        name: "Test Creator",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString()
    },
    nftMetadata: {
      name: "Direct Universal Format Test",
      description: "Testing direct Universal Minting Engine format passthrough",
      attributes: [
        { key: "Format", value: "Universal" },
        { key: "Test", value: "Passthrough" }
      ]
    }
  };
  
  try {
    const response = await fetch(`${SURREAL_BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoveMint-Frontend/1.0',
      },
      body: JSON.stringify(failingData)
    });
    
    const result = await response.json();
    
    console.log('📥 Failing request result:');
    console.log('  - Status:', response.status);
    console.log('  - Success:', result.success);
    
    if (!response.ok) {
      console.log('  - Error:', JSON.stringify(result, null, 2));
    }
    
    return response.ok;
  } catch (error) {
    console.log('❌ Failing request error:', error.message);
    return false;
  }
}

async function testWorkingRequest() {
  console.log('\n🔍 Testing working request directly to Surreal Base...');
  
  const workingData = {
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
    }
  };
  
  try {
    const response = await fetch(`${SURREAL_BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoveMint-Frontend/1.0',
      },
      body: JSON.stringify(workingData)
    });
    
    const result = await response.json();
    
    console.log('📥 Working request result:');
    console.log('  - Status:', response.status);
    console.log('  - Success:', result.success);
    
    if (!response.ok) {
      console.log('  - Error:', JSON.stringify(result, null, 2));
    }
    
    return response.ok;
  } catch (error) {
    console.log('❌ Working request error:', error.message);
    return false;
  }
}

async function runComparison() {
  console.log('🚀 Comparing Requests to Surreal Base');
  console.log('=====================================');
  
  const results = {
    failing: await testFailingRequest(),
    working: await testWorkingRequest()
  };
  
  console.log('\n📊 Comparison Results');
  console.log('======================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  if (results.failing && results.working) {
    console.log('\n🤔 Both requests work directly - issue might be in our API route');
  } else if (!results.failing && results.working) {
    console.log('\n💡 The failing request has an issue with its data format');
  } else if (results.failing && !results.working) {
    console.log('\n🤔 The working request has an issue - unexpected!');
  } else {
    console.log('\n❌ Both requests fail - Surreal Base might be having issues');
  }
}

// Run comparison if called directly
if (require.main === module) {
  runComparison()
    .catch(error => {
      console.error('Comparison error:', error);
      process.exit(1);
    });
}

module.exports = { runComparison };