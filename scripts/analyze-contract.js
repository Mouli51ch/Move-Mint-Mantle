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

async function analyzeContract() {
  console.log('🔍 Analyzing Contract at 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc');
  console.log('='.repeat(60));

  // Create public client
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  const CONTRACT_ADDRESS = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';

  // Try basic ERC721 functions
  const erc721Abi = [
    { name: 'name', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] },
    { name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] },
    { name: 'totalSupply', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'owner', type: 'function', inputs: [], outputs: [{ name: '', type: 'address' }] },
    { name: 'balanceOf', type: 'function', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }
  ];

  console.log('📋 Basic Contract Information:');
  
  try {
    const name = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: erc721Abi,
      functionName: 'name',
    });
    console.log('   Name:', name);
  } catch (error) {
    console.log('   Name: ❌ Function not available');
  }

  try {
    const symbol = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: erc721Abi,
      functionName: 'symbol',
    });
    console.log('   Symbol:', symbol);
  } catch (error) {
    console.log('   Symbol: ❌ Function not available');
  }

  try {
    const totalSupply = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: erc721Abi,
      functionName: 'totalSupply',
    });
    console.log('   Total Supply:', totalSupply.toString());
  } catch (error) {
    console.log('   Total Supply: ❌ Function not available');
  }

  // Check if contract exists
  try {
    const code = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
    if (code && code !== '0x') {
      console.log('   Contract exists: ✅ YES');
      console.log('   Bytecode length:', code.length);
    } else {
      console.log('   Contract exists: ❌ NO - This is not a contract address!');
      return;
    }
  } catch (error) {
    console.log('   Contract check failed:', error.message);
  }

  // Let's try to see what functions this contract actually has by checking if it's an SPG NFT
  console.log('\n🔍 Checking SPG NFT specific functions:');
  
  const spgAbi = [
    { name: 'mintOpen', type: 'function', inputs: [], outputs: [{ name: '', type: 'bool' }] },
    { name: 'isPublicMinting', type: 'function', inputs: [], outputs: [{ name: '', type: 'bool' }] },
    { name: 'mintFee', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'mint', type: 'function', inputs: [{ name: 'to', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }
  ];

  for (const func of spgAbi) {
    try {
      if (func.inputs.length === 0) {
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: [func],
          functionName: func.name,
        });
        console.log(`   ${func.name}():`, result.toString());
      } else {
        console.log(`   ${func.name}(): ⏭️ Skipped (requires parameters)`);
      }
    } catch (error) {
      console.log(`   ${func.name}(): ❌ Not available`);
    }
  }

  // Check the blockchain explorer for more info
  console.log('\n🌐 Blockchain Explorer:');
  console.log('   View on explorer: https://aeneid.storyscan.io/address/' + CONTRACT_ADDRESS);
  
  console.log('\n💡 RECOMMENDATION:');
  console.log('   Since this contract seems to have issues, we should:');
  console.log('   1. Create our own SPG NFT collection');
  console.log('   2. Use the RegistrationWorkflows.createCollection() function');
  console.log('   3. Then use mintAndRegisterIp on our own collection');

  console.log('\n' + '='.repeat(60));
}

analyzeContract().catch(console.error);