const { createPublicClient, http } = require('viem');
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

async function checkSPGOwnership() {
  console.log('🔍 Checking SPG NFT Contract Ownership');
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
  console.log('👤 Our wallet:', account.address);

  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  console.log('📋 SPG NFT Contract:', SPG_NFT_CONTRACT);

  // Check contract owner using standard ERC721 owner() function
  const ownerAbi = [{
    name: 'owner',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }];

  try {
    const owner = await publicClient.readContract({
      address: SPG_NFT_CONTRACT,
      abi: ownerAbi,
      functionName: 'owner',
    });

    console.log('👑 Contract owner:', owner);
    console.log('🤔 Are we the owner?', owner.toLowerCase() === account.address.toLowerCase() ? '✅ YES' : '❌ NO');

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      console.log('\n🚨 PROBLEM IDENTIFIED!');
      console.log('   The mintAndRegisterIp function requires the caller to be the owner of the SPG NFT contract.');
      console.log('   Our wallet is NOT the owner of this contract.');
      console.log('   This is why the transaction reverts!');
      
      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Create our own SPG NFT collection (recommended)');
      console.log('   2. Use a different approach (register existing NFT)');
      console.log('   3. Find a public SPG NFT contract that allows public minting');
    } else {
      console.log('\n✅ We are the owner! The issue must be something else.');
    }

  } catch (error) {
    console.error('❌ Could not check contract owner:', error.message);
    
    // Try to check if it's a public minting contract
    console.log('\n🔍 Checking if public minting is enabled...');
    
    const publicMintingAbi = [{
      name: 'isPublicMinting',
      type: 'function',
      inputs: [],
      outputs: [{ name: '', type: 'bool' }]
    }];

    try {
      const isPublicMinting = await publicClient.readContract({
        address: SPG_NFT_CONTRACT,
        abi: publicMintingAbi,
        functionName: 'isPublicMinting',
      });

      console.log('🌍 Public minting enabled:', isPublicMinting ? '✅ YES' : '❌ NO');
      
      if (!isPublicMinting) {
        console.log('\n🚨 PROBLEM CONFIRMED!');
        console.log('   This SPG NFT contract does NOT allow public minting.');
        console.log('   Only the owner can mint from this contract.');
      }

    } catch (publicMintError) {
      console.error('❌ Could not check public minting status:', publicMintError.message);
    }
  }

  console.log('\n' + '='.repeat(50));
}

checkSPGOwnership().catch(console.error);