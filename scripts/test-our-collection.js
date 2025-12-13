const { createPublicClient, http, encodeFunctionData } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

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

async function testOurCollection() {
  console.log('🧪 Testing OUR SPG NFT Collection');
  console.log('='.repeat(50));

  // Create public client
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  // Create account from private key
  const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY || 'your_private_key_here_replace_this';
  if (privateKey === 'your_private_key_here_replace_this') {
    console.error('❌ Please set STORY_PROTOCOL_PRIVATE_KEY environment variable');
    return;
  }

  const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);
  console.log('👤 Using wallet:', account.address);

  // OUR contract addresses
  const REGISTRATION_WORKFLOWS_CONTRACT = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';
  const OUR_SPG_NFT_CONTRACT = '0x2da69432ad077637d174a94ad5169482cd5dba10'; // Our own collection!

  console.log('📋 Contract addresses:');
  console.log('   RegistrationWorkflows:', REGISTRATION_WORKFLOWS_CONTRACT);
  console.log('   OUR SPG NFT Contract:', OUR_SPG_NFT_CONTRACT);

  // Verify we own this collection
  const ownerAbi = [{ name: 'owner', type: 'function', inputs: [], outputs: [{ name: '', type: 'address' }] }];
  
  try {
    const owner = await publicClient.readContract({
      address: OUR_SPG_NFT_CONTRACT,
      abi: ownerAbi,
      functionName: 'owner',
    });

    console.log('👑 Collection owner:', owner);
    console.log('🤔 Are we the owner?', owner.toLowerCase() === account.address.toLowerCase() ? '✅ YES!' : '❌ NO');

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      console.error('❌ We are not the owner of this collection!');
      return;
    }

  } catch (error) {
    console.error('❌ Could not check collection owner:', error.message);
    return;
  }

  // Check wallet balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('💰 Wallet balance:', (Number(balance) / 1e18).toFixed(6), 'IP');

  // Prepare test metadata
  const testMetadata = {
    name: 'Test Dance NFT - Our Collection',
    description: 'Testing with our own SPG NFT collection',
    attributes: []
  };

  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(testMetadata)).toString('base64')}`;
  
  // Generate metadata hashes
  const crypto = require('crypto');
  const ipMetadataHash = `0x${crypto.createHash('sha256').update(JSON.stringify(testMetadata)).digest('hex')}`;
  const nftMetadataHash = `0x${crypto.createHash('sha256').update(JSON.stringify(testMetadata)).digest('hex')}`;

  console.log('📝 Prepared metadata:');
  console.log('   TokenURI length:', tokenURI.length);
  console.log('   IP Metadata Hash:', ipMetadataHash);

  // CORRECT ABI for RegistrationWorkflows.mintAndRegisterIp
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

  // Encode function call
  const data = encodeFunctionData({
    abi: mintAndRegisterIpAbi,
    functionName: 'mintAndRegisterIp',
    args: [
      OUR_SPG_NFT_CONTRACT, // Our own collection!
      account.address,
      {
        ipMetadataURI: tokenURI,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: tokenURI,
        nftMetadataHash: nftMetadataHash,
      }
    ]
  });

  console.log('📝 Function call prepared:');
  console.log('   Target contract:', REGISTRATION_WORKFLOWS_CONTRACT);
  console.log('   SPG NFT contract:', OUR_SPG_NFT_CONTRACT);
  console.log('   Function: mintAndRegisterIp');
  console.log('   Data length:', data.length);

  // Test gas estimation
  console.log('\n🧪 Testing gas estimation...');
  try {
    const gasEstimate = await publicClient.estimateGas({
      account: account.address,
      to: REGISTRATION_WORKFLOWS_CONTRACT,
      data,
    });
    
    console.log('🎉 SUCCESS! Gas estimation worked!');
    console.log('   Estimated gas:', gasEstimate.toString());
    console.log('   Gas cost:', (Number(gasEstimate) * 20e-9).toFixed(6), 'IP'); // Assuming 20 gwei gas price
    
    console.log('\n🚀 BREAKTHROUGH! Our own collection works!');
    console.log('   This means real minting will succeed now!');
    console.log('   The API should now work without fallback mode!');
    
  } catch (error) {
    console.log('❌ Gas estimation failed:', error.message);
    console.log('   Error details:', error);
  }

  console.log('\n' + '='.repeat(50));
}

testOurCollection().catch(console.error);