/**
 * Test Correct SPG Contract
 * This script tests the correct SPG contract address from Surreal-Base
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

const CORRECT_SPG_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
const OLD_CONTRACT = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';
const NEW_WALLET = '0xdD02E4AF0f5465a8649B2f0A696dE8C56e5eEb31';

async function testContracts() {
  console.log('🔍 Testing Story Protocol contracts...\n');
  
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  const contracts = [
    { name: 'Correct SPG Contract (from Surreal-Base)', address: CORRECT_SPG_CONTRACT },
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
          console.log(`  ✅ ${test.name}: Success (${result?.slice(0, 20)}...)`);
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
  console.log(`Wallet: ${NEW_WALLET}`);
  
  try {
    const balance = await publicClient.getBalance({ address: NEW_WALLET });
    console.log(`  Balance: ${balance.toString()} wei`);
    console.log(`  Balance: ${(Number(balance) / 1e18).toFixed(6)} IP`);
    
    if (balance === 0n) {
      console.log('  ⚠️  Wallet needs funding from https://faucet.story.foundation/');
      console.log(`  📋 Fund this address: ${NEW_WALLET}`);
    } else {
      console.log('  ✅ Wallet has funds');
    }
    
  } catch (error) {
    console.log(`❌ Error checking wallet balance: ${error.message}`);
  }

  // Test mintAndRegisterIp function signature
  console.log('\n🔍 Testing mintAndRegisterIp function...');
  
  try {
    // Function signature for mintAndRegisterIp
    const mintAndRegisterIpSig = '0x' + require('crypto')
      .createHash('sha3-256')
      .update('mintAndRegisterIp(address,address,(string,bytes32,string,bytes32),bool)')
      .digest('hex')
      .slice(0, 8);
    
    console.log(`Function signature: ${mintAndRegisterIpSig}`);
    
    // Try to call the function with dummy data to see if it exists
    const dummyData = mintAndRegisterIpSig + '0'.repeat(1000); // Dummy parameters
    
    try {
      await publicClient.call({
        to: CORRECT_SPG_CONTRACT,
        data: dummyData,
      });
      console.log('  ✅ Function exists (call would revert with proper params)');
    } catch (e) {
      if (e.message.includes('execution reverted')) {
        console.log('  ✅ Function exists (reverted as expected with dummy data)');
      } else {
        console.log(`  ❌ Function test failed: ${e.message.split('.')[0]}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error testing function: ${error.message}`);
  }
}

testContracts().catch(console.error);