#!/usr/bin/env node

/**
 * Debug Universal Format Issue
 */

const FRONTEND_URL = 'http://localhost:3000';

async function debugUniversalFormat() {
  console.log('🔍 Debugging Universal Format Issue...');
  
  // This is the exact data from the end-to-end test that's failing
  const universalData = {
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
  
  console.log('📤 Request data:');
  console.log('  - Keys:', Object.keys(universalData));
  console.log('  - userAddress:', universalData.userAddress);
  console.log('  - ipMetadata keys:', Object.keys(universalData.ipMetadata));
  console.log('  - nftMetadata keys:', Object.keys(universalData.nftMetadata));
  console.log('  - Has title?', 'title' in universalData);
  console.log('  - Has danceStyle?', 'danceStyle' in universalData);
  console.log('  - Has analysisResults?', 'analysisResults' in universalData);
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(universalData)
    });
    
    const result = await response.json();
    
    console.log('\n📥 Response:');
    console.log('  - Status:', response.status);
    console.log('  - Success:', result.success);
    
    if (!response.ok) {
      console.log('  - Error:', JSON.stringify(result, null, 2));
    } else {
      console.log('  - Response keys:', Object.keys(result));
    }
    
  } catch (error) {
    console.log('❌ Request error:', error.message);
  }
}

// Test the working format from the basic test
async function testWorkingFormat() {
  console.log('\n🔍 Testing working format from basic test...');
  
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
  
  console.log('📤 Working data:');
  console.log('  - Keys:', Object.keys(workingData));
  console.log('  - Has title?', 'title' in workingData);
  console.log('  - Has danceStyle?', 'danceStyle' in workingData);
  console.log('  - Has analysisResults?', 'analysisResults' in workingData);
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workingData)
    });
    
    const result = await response.json();
    
    console.log('\n📥 Working format response:');
    console.log('  - Status:', response.status);
    console.log('  - Success:', result.success);
    
    if (!response.ok) {
      console.log('  - Error:', JSON.stringify(result, null, 2));
    } else {
      console.log('  - Response keys:', Object.keys(result));
    }
    
  } catch (error) {
    console.log('❌ Working format error:', error.message);
  }
}

async function runDebug() {
  await debugUniversalFormat();
  await testWorkingFormat();
}

// Run debug if called directly
if (require.main === module) {
  runDebug()
    .catch(error => {
      console.error('Debug error:', error);
      process.exit(1);
    });
}

module.exports = { runDebug };