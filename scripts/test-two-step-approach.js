const { createWalletClient, createPublicClient, http, encodeFunctionData } = require('viem');
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

async function testTwoStepApproach() {
  console.log('🧪 Testing Two-Step Approach: Mint NFT + Register IP');
  console.log('='.repeat(60));

  // Create clients
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  const privateKey = process.env.STORY_PROTOCOL_PRIVATE_KEY || 'your_private_key_here_replace_this';
  if (privateKey === 'your_private_key_here_replace_this') {
    console.error('❌ Please set STORY_PROTOCOL_PRIVATE_KEY environment variable');
    return;
  }

  const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);
  
  const walletClient = createWalletClient({
    account,
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  console.log('👤 Using wallet:', account.address);

  // Use the public SPG NFT contract (from the SDK examples)
  const PUBLIC_SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const IP_ASSET_REGISTRY = '0x77319B4031e6eF1250907aa00018B8B1c67a244b';

  console.log('📋 Contract addresses:');
  console.log('   Public SPG NFT:', PUBLIC_SPG_NFT_CONTRACT);
  console.log('   IP Asset Registry:', IP_ASSET_REGISTRY);

  // Check wallet balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('💰 Wallet balance:', (Number(balance) / 1e18).toFixed(6), 'IP');

  // Step 1: Try to mint an NFT directly from the SPG contract
  console.log('\n🎯 Step 1: Minting NFT from SPG contract...');
  
  const mintAbi = [{
    name: 'mint',
    type: 'function',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }];

  const mintData = encodeFunctionData({
    abi: mintAbi,
    functionName: 'mint',
    args: [account.address]
  });

  try {
    // Test gas estimation for minting
    const mintGasEstimate = await publicClient.estimateGas({
      account: account.address,
      to: PUBLIC_SPG_NFT_CONTRACT,
      data: mintData,
    });
    
    console.log('✅ NFT minting gas estimate successful:', mintGasEstimate.toString());
    
    // Actually mint the NFT
    console.log('🚀 Minting NFT...');
    const mintHash = await walletClient.sendTransaction({
      to: PUBLIC_SPG_NFT_CONTRACT,
      data: mintData,
      gas: (mintGasEstimate * BigInt('120')) / BigInt('100'), // 20% buffer
    });

    console.log('📝 Mint transaction submitted:', mintHash);
    
    const mintReceipt = await publicClient.waitForTransactionReceipt({
      hash: mintHash,
      confirmations: 1,
    });

    console.log('✅ NFT minted successfully in block:', mintReceipt.blockNumber);
    
    // Get the token ID from the logs (simplified - we'll assume it's the next token ID)
    const totalSupplyAbi = [{ name: 'totalSupply', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint256' }] }];
    const totalSupply = await publicClient.readContract({
      address: PUBLIC_SPG_NFT_CONTRACT,
      abi: totalSupplyAbi,
      functionName: 'totalSupply',
    });
    
    const tokenId = totalSupply; // The newly minted token should be the current total supply
    console.log('🎯 Minted token ID:', tokenId.toString());

    // Step 2: Register the NFT as an IP Asset
    console.log('\n🎯 Step 2: Registering NFT as IP Asset...');
    
    const registerAbi = [{
      name: 'register',
      type: 'function',
      inputs: [
        { name: 'chainid', type: 'uint256' },
        { name: 'tokenContract', type: 'address' },
        { name: 'tokenId', type: 'uint256' }
      ],
      outputs: [{ name: 'id', type: 'address' }]
    }];

    const registerData = encodeFunctionData({
      abi: registerAbi,
      functionName: 'register',
      args: [
        BigInt(aeneidChain.id), // chain ID
        PUBLIC_SPG_NFT_CONTRACT, // token contract
        tokenId // token ID
      ]
    });

    // Test gas estimation for registration
    const registerGasEstimate = await publicClient.estimateGas({
      account: account.address,
      to: IP_ASSET_REGISTRY,
      data: registerData,
    });
    
    console.log('✅ IP registration gas estimate successful:', registerGasEstimate.toString());
    
    // Actually register the IP
    console.log('🚀 Registering IP Asset...');
    const registerHash = await walletClient.sendTransaction({
      to: IP_ASSET_REGISTRY,
      data: registerData,
      gas: (registerGasEstimate * BigInt('120')) / BigInt('100'), // 20% buffer
    });

    console.log('📝 Registration transaction submitted:', registerHash);
    
    const registerReceipt = await publicClient.waitForTransactionReceipt({
      hash: registerHash,
      confirmations: 1,
    });

    console.log('✅ IP Asset registered successfully in block:', registerReceipt.blockNumber);
    
    console.log('\n🎉 SUCCESS! Two-step approach worked!');
    console.log('📋 Summary:');
    console.log('   NFT Contract:', PUBLIC_SPG_NFT_CONTRACT);
    console.log('   Token ID:', tokenId.toString());
    console.log('   Mint Tx:', mintHash);
    console.log('   Register Tx:', registerHash);
    console.log('   Mint Explorer:', `https://aeneid.storyscan.io/tx/${mintHash}`);
    console.log('   Register Explorer:', `https://aeneid.storyscan.io/tx/${registerHash}`);
    
    console.log('\n💡 This proves that minting DOES work!');
    console.log('   We can now implement this approach in our API.');

  } catch (error) {
    console.error('❌ Two-step approach failed:', error.message);
    console.error('   Full error:', error);
  }

  console.log('\n' + '='.repeat(60));
}

testTwoStepApproach().catch(console.error);