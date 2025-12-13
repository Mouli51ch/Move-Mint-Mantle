#!/usr/bin/env node

/**
 * Test Surreal-Base Universal Minting Engine Integration
 * 
 * This script tests the integration with the working Surreal-Base
 * Universal Minting Engine endpoints.
 */

const fetch = require('node-fetch');

async function testSurrealBaseIntegration() {
  console.log('🔗 Testing Surreal-Base Universal Minting Engine Integration...\n');

  // First, find the Surreal-Base engine
  const possiblePorts = [3001, 3002, 4000, 8000];
  let workingPort = null;

  console.log('🔍 Looking for Surreal-Base Universal Minting Engine...');
  for (const port of possiblePorts) {
    try {
      const healthUrl = `http://localhost:${port}/api/health`;
      console.log(`   Trying port ${port}...`);
      
      const healthResponse = await fetch(healthUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`   ✅ Found Surreal-Base on port ${port}`);
        console.log(`   Status: ${healthData.status}`);
        console.log(`   Network: ${healthData.config?.network}`);
        workingPort = port;
        break;
      }
    } catch (error) {
      console.log(`   ❌ Port ${port} not available`);
    }
  }

  if (!workingPort) {
    console.log('\n❌ Surreal-Base Universal Minting Engine not found!');
    console.log('Please start the Surreal-Base Universal Minting Engine first.');
    console.log('Expected endpoints:');
    possiblePorts.forEach(port => {
      console.log(`   http://localhost:${port}/api/health`);
    });
    return;
  }

  console.log(`\n🚀 Testing prepare-mint endpoint on port ${workingPort}...`);

  // Test the prepare-mint endpoint
  const prepareUrl = `http://localhost:${workingPort}/api/prepare-mint`;
  const testData = {
    userAddress: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433',
    ipMetadata: {
      title: 'MoveMint Dance NFT',
      description: 'A dance NFT created through MoveMint platform using Surreal-Base Universal Minting Engine',
      creators: [{
        name: 'MoveMint Creator',
        address: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433',
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString(),
    },
    nftMetadata: {
      name: 'MoveMint Dance NFT',
      description: 'A dance NFT created through MoveMint platform',
      attributes: [
        { key: 'Platform', value: 'MoveMint' },
        { key: 'Type', value: 'Dance Performance' },
        { key: 'Engine', value: 'Surreal-Base Universal Minting' }
      ]
    }
  };

  try {
    console.log('📤 Sending prepare-mint request...');
    const prepareResponse = await fetch(prepareUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response Status: ${prepareResponse.status} ${prepareResponse.statusText}`);

    if (!prepareResponse.ok) {
      const errorText = await prepareResponse.text();
      console.log('❌ Prepare-mint failed:');
      console.log('   Error:', errorText);
      return;
    }

    const prepareResult = await prepareResponse.json();
    console.log('✅ Prepare-mint successful!');
    console.log('\n📋 Transaction Data:');
    console.log('   To:', prepareResult.transaction?.to);
    console.log('   Data length:', prepareResult.transaction?.data?.length);
    console.log('   Value:', prepareResult.transaction?.value);
    console.log('   Gas Estimate:', prepareResult.transaction?.gasEstimate);

    console.log('\n📋 Metadata:');
    console.log('   IP IPFS Hash:', prepareResult.metadata?.ipfsHash);
    console.log('   NFT IPFS Hash:', prepareResult.metadata?.nftIpfsHash);
    console.log('   IP Hash:', prepareResult.metadata?.ipHash);
    console.log('   NFT Hash:', prepareResult.metadata?.nftHash);

    if (prepareResult.uploadedFiles && prepareResult.uploadedFiles.length > 0) {
      console.log('\n📋 Uploaded Files:');
      prepareResult.uploadedFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.filename} -> ${file.ipfsHash}`);
      });
    }

    console.log('\n🎉 Surreal-Base Integration Test Successful!');
    console.log('\n📋 Next Steps:');
    console.log('   1. The transaction data is ready for signing');
    console.log('   2. MoveMint can now use this prepared transaction');
    console.log('   3. Real blockchain minting is ready!');

    // Now test our MoveMint API integration
    console.log('\n🔗 Testing MoveMint API integration...');
    const moveMintResponse = await fetch('http://localhost:3000/api/mint-ip-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          name: 'MoveMint Integration Test',
          description: 'Testing MoveMint integration with Surreal-Base Universal Minting Engine',
          attributes: [
            { trait_type: 'Integration', value: 'Surreal-Base' },
            { trait_type: 'Test', value: 'Real Blockchain' }
          ]
        },
        recipient: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433'
      })
    });

    console.log(`📡 MoveMint API Status: ${moveMintResponse.status} ${moveMintResponse.statusText}`);

    if (moveMintResponse.ok) {
      const moveMintResult = await moveMintResponse.json();
      console.log('✅ MoveMint API integration successful!');
      console.log('   Success:', moveMintResult.success);
      console.log('   Transaction Hash:', moveMintResult.transactionHash);
      console.log('   Method:', moveMintResult.preparedBy || moveMintResult.method);
      console.log('   Explorer URL:', moveMintResult.explorerUrl);
    } else {
      const errorData = await moveMintResponse.json();
      console.log('❌ MoveMint API integration failed:');
      console.log('   Error:', errorData.error);
      console.log('   Details:', errorData.details);
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

// Run the test
testSurrealBaseIntegration().catch(console.error);