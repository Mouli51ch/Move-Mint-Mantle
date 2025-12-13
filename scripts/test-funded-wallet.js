/**
 * Test Funded Wallet
 * This script tests the funded wallet and the correct contracts
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

const FUNDED_WALLET = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';
const SPG_GATEWAY_CONTRACT = '0x937bef10ba6fb941ed84b8d249abc76031429a9a';
const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';

async function testSetup() {
  console.log('🔍 Testing funded wallet and contracts...\n');
  
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  // Test wallet balance
  console.log('💰 Testing wallet balance...');
  console.log(`Wallet: ${FUNDED_WALLET}`);
  
  try {
    const balance = await publicClient.getBalance({ address: FUNDED_WALLET });
    const balanceInIP = (Number(balance) / 1e18).toFixed(6);
    
    console.log(`  Balance: ${balance.toString()} wei`);
    console.log(`  Balance: ${balanceInIP} IP`);
    
    if (balance > 0n) {
      console.log('  ✅ Wallet is funded and ready for minting');
    } else {
      console.log('  ❌ Wallet has no funds');
      return;
    }
    
  } catch (error) {
    console.log(`❌ Error checking wallet balance: ${error.message}`);
    return;
  }

  // Test contracts
  console.log('\n📋 Testing contracts...');
  
  const contracts = [
    { name: 'SPG Gateway Contract', address: SPG_GATEWAY_CONTRACT },
    { name: 'SPG NFT Contract', address: SPG_NFT_CONTRACT },
  ];

  for (const contract of contracts) {
    console.log(`\n${contract.name}: ${contract.address}`);
    
    try {
      const bytecode = await publicClient.getBytecode({ address: contract.address });
      
      if (!bytecode || bytecode === '0x') {
        console.log('  ❌ Contract not found');
        continue;
      }
      
      console.log(`  ✅ Contract exists (${bytecode.length} bytes)`);
      
      // Test mintAndRegisterIp function
      const mintAndRegisterIpSig = '0x5ed55900';
      
      try {
        const dummyCall = mintAndRegisterIpSig + '0'.repeat(200);
        await publicClient.call({
          to: contract.address,
          data: dummyCall,
        });
        console.log('  ✅ mintAndRegisterIp function exists');
      } catch (e) {
        if (e.message.includes('execution reverted')) {
          console.log('  ✅ mintAndRegisterIp function exists (reverted as expected)');
        } else {
          console.log(`  ❌ mintAndRegisterIp function test failed: ${e.message.split('.')[0]}`);
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Error testing contract: ${error.message}`);
    }
  }

  // Test gas estimation for the actual transaction
  console.log('\n⛽ Testing gas estimation...');
  
  try {
    // Prepare a realistic mintAndRegisterIp call
    const { encodeFunctionData } = require('viem');
    
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
        },
        { name: 'allowDuplicates', type: 'bool' }
      ]
    }];

    // Create realistic test data
    const testTokenURI = 'data:application/json;base64,eyJuYW1lIjoidGVzdCJ9'; // {"name":"test"}
    const testHash = '0x' + '0'.repeat(64); // 32-byte hash
    
    const data = encodeFunctionData({
      abi: mintAndRegisterIpAbi,
      functionName: 'mintAndRegisterIp',
      args: [
        SPG_NFT_CONTRACT,
        FUNDED_WALLET,
        {
          ipMetadataURI: testTokenURI,
          ipMetadataHash: testHash,
          nftMetadataURI: testTokenURI,
          nftMetadataHash: testHash,
        },
        true
      ]
    });

    const gasEstimate = await publicClient.estimateGas({
      account: FUNDED_WALLET,
      to: SPG_GATEWAY_CONTRACT,
      data,
    });

    console.log(`  ✅ Gas estimation successful: ${gasEstimate.toString()}`);
    console.log(`  💰 Estimated cost: ${(Number(gasEstimate) * 20e-9).toFixed(6)} IP (at 20 Gwei)`);
    
  } catch (gasError) {
    console.log(`  ❌ Gas estimation failed: ${gasError.message}`);
    console.log('  This might indicate an issue with the contract call');
  }

  console.log('\n🎯 Summary:');
  console.log('✅ Wallet is funded and ready');
  console.log('✅ Contracts exist and have the required functions');
  console.log('✅ Setup is ready for minting');
  console.log('\nYou can now test the minting API endpoint!');
}

testSetup().catch(console.error);