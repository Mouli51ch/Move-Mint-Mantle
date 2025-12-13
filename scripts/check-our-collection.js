const { createPublicClient, http } = require('viem');

// Story Protocol Aeneid Testnet Configuration
const aeneidChain = {
  id: 1315,
  name: 'Story Protocol Aeneid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
    },
  },
  testnet: true,
};

async function checkOurCollection() {
  console.log('🔍 Checking Our SPG NFT Collection Functions');
  console.log('='.repeat(50));

  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  const OUR_COLLECTION = '0x2da69432ad077637d174a94ad5169482cd5dba10';
  console.log('📋 Our collection:', OUR_COLLECTION);

  // Test various functions that might be available
  const testFunctions = [
    { name: 'name', abi: [{ name: 'name', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] }] },
    { name: 'symbol', abi: [{ name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] }] },
    { name: 'totalSupply', abi: [{ name: 'totalSupply', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint256' }] }] },
    { name: 'owner', abi: [{ name: 'owner', type: 'function', inputs: [], outputs: [{ name: '', type: 'address' }] }] },
    { name: 'mintOpen', abi: [{ name: 'mintOpen', type: 'function', inputs: [], outputs: [{ name: '', type: 'bool' }] }] },
    { name: 'isPublicMinting', abi: [{ name: 'isPublicMinting', type: 'function', inputs: [], outputs: [{ name: '', type: 'bool' }] }] },
    { name: 'mintFee', abi: [{ name: 'mintFee', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint256' }] }] },
    { name: 'maxSupply', abi: [{ name: 'maxSupply', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint32' }] }] }
  ];

  console.log('🧪 Testing available functions:');

  for (const func of testFunctions) {
    try {
      const result = await publicClient.readContract({
        address: OUR_COLLECTION,
        abi: func.abi,
        functionName: func.name,
      });
      console.log(`   ✅ ${func.name}():`, result.toString());
    } catch (error) {
      console.log(`   ❌ ${func.name}(): Not available or reverted`);
    }
  }

  // Since we created this collection, let's try to test gas estimation directly
  console.log('\n🧪 Testing gas estimation with our collection...');
  
  const { privateKeyToAccount } = require('viem/accounts');
  const { encodeFunctionData } = require('viem');
  
  const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY || 'your_private_key_here_replace_this';
  if (privateKey === 'your_private_key_here_replace_this') {
    console.error('❌ Please set STORY_PROTOCOL_PRIVATE_KEY environment variable');
    return;
  }

  const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);
  
  const REGISTRATION_WORKFLOWS = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';
  
  // Prepare simple test metadata
  const testMetadata = { name: 'Test', description: 'Test' };
  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(testMetadata)).toString('base64')}`;
  const crypto = require('crypto');
  const hash = `0x${crypto.createHash('sha256').update(JSON.stringify(testMetadata)).digest('hex')}`;

  const mintAndRegisterIpAbi = [{
    name: 'mintAndRegisterIp',
    type: 'function',
    inputs: [
      { name: 'spgNftContract', type: 'address' },
      { name: 'recipient', type: 'address' },
      {
        name: 'ipMetadata', type: 'tuple', components: [
          { name: 'ipMetadataURI', type: 'string' },
          { name: 'ipMetadataHash', type: 'bytes32' },
          { name: 'nftMetadataURI', type: 'string' },
          { name: 'nftMetadataHash', type: 'bytes32' }
        ]
      }
    ]
  }];

  const data = encodeFunctionData({
    abi: mintAndRegisterIpAbi,
    functionName: 'mintAndRegisterIp',
    args: [
      OUR_COLLECTION,
      account.address,
      {
        ipMetadataURI: tokenURI,
        ipMetadataHash: hash,
        nftMetadataURI: tokenURI,
        nftMetadataHash: hash,
      }
    ]
  });

  try {
    const gasEstimate = await publicClient.estimateGas({
      account: account.address,
      to: REGISTRATION_WORKFLOWS,
      data,
    });
    
    console.log('🎉 GAS ESTIMATION SUCCESS!');
    console.log('   Estimated gas:', gasEstimate.toString());
    console.log('   This means minting will work!');
    
  } catch (error) {
    console.log('❌ Gas estimation failed:', error.message);
    
    // Let's check if the issue is with our collection or something else
    if (error.message.includes('revert')) {
      console.log('\n🔍 Analyzing revert reason...');
      console.log('   This could be due to:');
      console.log('   - Collection not properly configured');
      console.log('   - Missing permissions');
      console.log('   - Invalid metadata format');
    }
  }

  console.log('\n' + '='.repeat(50));
}

checkOurCollection().catch(console.error);