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

async function testCorrectContract() {
  console.log('🧪 Testing CORRECT Story Protocol Contract Implementation');
  console.log('='.repeat(60));

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

  // CORRECT contract addresses from Story Protocol documentation
  const REGISTRATION_WORKFLOWS_CONTRACT = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';

  console.log('📋 Contract addresses:');
  console.log('   RegistrationWorkflows:', REGISTRATION_WORKFLOWS_CONTRACT);
  console.log('   SPG NFT Contract:', SPG_NFT_CONTRACT);

  // Check wallet balance
  try {
    const balance = await publicClient.getBalance({ address: account.address });
    console.log('💰 Wallet balance:', (Number(balance) / 1e18).toFixed(6), 'IP');
    
    if (balance === BigInt('0')) {
      console.error('❌ Wallet has no IP tokens. Please fund it at https://faucet.story.foundation/');
      return;
    }
  } catch (error) {
    console.error('❌ Could not check wallet balance:', error.message);
    return;
  }

  // Prepare test metadata
  const testMetadata = {
    name: 'Test Dance NFT',
    description: 'Testing correct contract implementation',
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
      SPG_NFT_CONTRACT,
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
    
    console.log('✅ SUCCESS! Gas estimation worked!');
    console.log('   Estimated gas:', gasEstimate.toString());
    console.log('   Gas cost:', (Number(gasEstimate) * 20e-9).toFixed(6), 'IP'); // Assuming 20 gwei gas price
    
    console.log('\n🎉 BREAKTHROUGH! The correct contract works!');
    console.log('   This means minting will actually succeed now!');
    
  } catch (error) {
    console.log('❌ Gas estimation failed:', error.message);
    console.log('   Error details:', error);
    
    // Check if it's a revert error
    if (error.message.includes('revert') || error.message.includes('execution reverted')) {
      console.log('\n🔍 This is a revert error - the transaction would fail');
      console.log('   Possible causes:');
      console.log('   - Contract permissions');
      console.log('   - Invalid parameters');
      console.log('   - Contract state issues');
    }
  }

  console.log('\n' + '='.repeat(60));
}

testCorrectContract().catch(console.error);