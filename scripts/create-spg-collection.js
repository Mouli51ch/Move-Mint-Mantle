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

async function createSPGCollection() {
  console.log('🏗️ Creating Our Own SPG NFT Collection');
  console.log('='.repeat(50));

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

  // Check wallet balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('💰 Wallet balance:', (Number(balance) / 1e18).toFixed(6), 'IP');

  if (balance < BigInt('1000000000000000')) { // Less than 0.001 IP
    console.error('❌ Insufficient balance for contract deployment');
    return;
  }

  // RegistrationWorkflows contract address
  const REGISTRATION_WORKFLOWS = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';
  
  console.log('📋 RegistrationWorkflows contract:', REGISTRATION_WORKFLOWS);

  // ABI for createCollection function
  const createCollectionAbi = [{
    name: 'createCollection',
    type: 'function',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'baseURI', type: 'string' },
        { name: 'contractURI', type: 'string' },
        { name: 'maxSupply', type: 'uint32' },
        { name: 'mintFee', type: 'uint256' },
        { name: 'mintFeeToken', type: 'address' },
        { name: 'mintFeeRecipient', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'mintOpen', type: 'bool' },
        { name: 'isPublicMinting', type: 'bool' }
      ]
    }],
    outputs: [{ name: '', type: 'address' }]
  }];

  // Prepare collection parameters
  const collectionParams = {
    name: 'MoveMint Dance NFTs',
    symbol: 'MOVE',
    baseURI: '',
    contractURI: '',
    maxSupply: 10000,
    mintFee: 0,
    mintFeeToken: '0x0000000000000000000000000000000000000000', // Zero address for no fee token
    mintFeeRecipient: account.address,
    owner: account.address, // We will be the owner!
    mintOpen: true,
    isPublicMinting: true // Allow public minting
  };

  console.log('📝 Collection parameters:');
  console.log('   Name:', collectionParams.name);
  console.log('   Symbol:', collectionParams.symbol);
  console.log('   Max Supply:', collectionParams.maxSupply);
  console.log('   Owner:', collectionParams.owner);
  console.log('   Public Minting:', collectionParams.isPublicMinting);

  // Encode the function call
  const data = encodeFunctionData({
    abi: createCollectionAbi,
    functionName: 'createCollection',
    args: [collectionParams]
  });

  console.log('\n🧪 Estimating gas for collection creation...');
  
  try {
    const gasEstimate = await publicClient.estimateGas({
      account: account.address,
      to: REGISTRATION_WORKFLOWS,
      data,
    });
    
    console.log('⛽ Gas estimate:', gasEstimate.toString());
    
    // Add 20% buffer
    const gasWithBuffer = (gasEstimate * BigInt('120')) / BigInt('100');
    
    console.log('🚀 Creating SPG NFT Collection...');
    
    const hash = await walletClient.sendTransaction({
      to: REGISTRATION_WORKFLOWS,
      data,
      gas: gasWithBuffer,
    });

    console.log('📝 Transaction submitted:', hash);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // The collection address should be in the logs
    // For now, let's just show the transaction details
    console.log('🎉 SPG NFT Collection created successfully!');
    console.log('📋 Transaction details:');
    console.log('   Hash:', hash);
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas used:', receipt.gasUsed.toString());
    console.log('   Explorer:', `https://aeneid.storyscan.io/tx/${hash}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Check the transaction logs to get the new collection address');
    console.log('   2. Update your .env file with the new collection address');
    console.log('   3. Use this collection for minting IP Assets');

  } catch (error) {
    console.error('❌ Failed to create collection:', error.message);
    console.error('   Full error:', error);
  }

  console.log('\n' + '='.repeat(50));
}

createSPGCollection().catch(console.error);