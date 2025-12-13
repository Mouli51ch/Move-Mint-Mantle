/**
 * Test New Contract Address
 * This script tests the new contract address to see if it works
 */

const { createPublicClient, http } = require('viem');

const aeneidChain = {
  id: 1315,
  name: 'Story Protocol Aeneid Testnet',
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
    },
  },
  testnet: true,
};

const NEW_CONTRACT = '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44';
const OLD_CONTRACT = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';

async function testContracts() {
  console.log('🔍 Testing contract addresses...\n');
  
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  const contracts = [
    { name: 'New Contract (from env)', address: NEW_CONTRACT },
    { name: 'Old Contract (problematic)', address: OLD_CONTRACT },
  ];

  for (const contract of contracts) {
    console.log(`📋 Testing ${contract.name}: ${contract.address}`);
    
    try {
      // Check if contract exists
      const bytecode = await publicClient.getBytecode({ address: contract.address });
      
      if (!bytecode || bytecode === '0x') {
        console.log('❌ No contract found at this address\n');
        continue;
      }
      
      console.log(`✅ Contract found, bytecode length: ${bytecode.length}`);
      
      // Test common ERC721 functions
      const tests = [
        { name: 'name()', data: '0x06fdde03' },
        { name: 'symbol()', data: '0x95d89b41' },
        { name: 'totalSupply()', data: '0x18160ddd' },
        { name: 'owner()', data: '0x8da5cb5b' },
      ];
      
      for (const test of tests) {
        try {
          const result = await publicClient.call({
            to: contract.address,
            data: test.data,
          });
          console.log(`  ✅ ${test.name}: Success`);
        } catch (e) {
          console.log(`  ❌ ${test.name}: ${e.message.split('.')[0]}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error testing contract: ${error.message}\n`);
    }
  }
  
  // Test our new wallet
  console.log('🔍 Testing new wallet address...');
  const newWallet = '0xdD02E4AF0f5465a8649B2f0A696dE8C56e5eEb31';
  
  try {
    const balance = await publicClient.getBalance({ address: newWallet });
    console.log(`Wallet ${newWallet}:`);
    console.log(`  Balance: ${balance.toString()} wei`);
    console.log(`  Balance: ${(Number(balance) / 1e18).toFixed(6)} IP`);
    
    if (balance === 0n) {
      console.log('  ⚠️  Wallet needs funding from https://faucet.story.foundation/');
    } else {
      console.log('  ✅ Wallet has funds');
    }
    
  } catch (error) {
    console.log(`❌ Error checking wallet balance: ${error.message}`);
  }
}

testContracts().catch(console.error);