#!/usr/bin/env node

/**
 * Debug script to see exactly what error Surreal Base is returning
 */

const fetch = require('node-fetch');

const SURREAL_BASE_URL = 'https://surreal-base.vercel.app';

async function debugMintingRequest() {
  console.log('🔍 Debugging Minting Request to Surreal Base');
  console.log('============================================');

  const userAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  
  // Create the exact same request our API is sending
  const requestBody = {
    userAddress: userAddress,
    ipMetadata: {
      title: 'Test Production NFT',
      description: 'Testing full production minting flow with real blockchain',
      creators: [{
        name: 'MoveMint Creator',
        address: userAddress,
        contributionPercent: 100
      }],
      createdAt: new Date().toISOString(),
      imageHash: `0x${Date.now().toString(16)}`
    },
    nftMetadata: {
      name: 'Test Production NFT',
      description: 'Testing full production minting flow with real blockchain',
      attributes: [
        { key: 'Dance Style', value: 'Hip Hop' },
        { key: 'Difficulty', value: 'Advanced' },
        { key: 'Duration', value: '3:45' }
      ]
    },
    licenseTerms: {
      transferable: true,
      royaltyPolicy: "0x0000000000000000000000000000000000000000",
      defaultMintingFee: "100000000000000000",
      expiration: "0",
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: "0x0000000000000000000000000000000000000000",
      commercializerCheckerData: "0x",
      commercialRevShare: 10,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevShare: 10,
      currency: "0x0000000000000000000000000000000000000000",
      uri: "https://example.com/license-terms"
    }
  };

  console.log('\n📦 Request Body:');
  console.log(JSON.stringify(requestBody, null, 2));

  try {
    console.log('\n🚀 Sending request to Surreal Base...');
    
    const response = await fetch(`${SURREAL_BASE_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('\n📡 Response received:');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('\n📄 Raw Response:');
    console.log(responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('\n📋 Parsed Response:');
      console.log(JSON.stringify(responseJson, null, 2));
      
      if (!response.ok) {
        console.log('\n❌ Error Details:');
        console.log('- Error Code:', responseJson.error?.code);
        console.log('- Error Message:', responseJson.error?.message);
        console.log('- Error Details:', responseJson.error?.details);
      } else {
        console.log('\n✅ Success! Transaction prepared:');
        console.log('- Contract Address:', responseJson.transaction?.to);
        console.log('- Gas Estimate:', responseJson.transaction?.gasEstimate);
        console.log('- IPFS Hash:', responseJson.metadata?.ipfsHash);
      }
    } catch (parseError) {
      console.log('\n⚠️ Could not parse response as JSON');
      console.log('Parse Error:', parseError.message);
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

async function main() {
  await debugMintingRequest();
}

if (require.main === module) {
  main().catch(console.error);
}