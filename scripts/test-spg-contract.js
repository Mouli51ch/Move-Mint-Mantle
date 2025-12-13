/**
 * Test SPG Contract Functions
 * This script tests the SPG NFT contract to verify available functions
 */

const { createPublicClient, http } = require('viem');

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

const SPG_NFT_CONTRACT = '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424';

async function testContract() {
  console.log('🔍 Testing SPG NFT Contract...');
  console.log('Contract Address:', SPG_NFT_CONTRACT);
  
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  try {
    // Check if contract exists
    const bytecode = await publicClient.getBytecode({ address: SPG_NFT_CONTRACT });
    console.log('✅ Contract exists, bytecode length:', bytecode?.length || 0);
    
    if (!bytecode || bytecode === '0x') {
      console.error('❌ Contract not found or has no bytecode');
      return;
    }

    // Try to call some common ERC721 functions to see what's available
    console.log('\n🔍 Testing common functions...');
    
    // Test name() function
    try {
      const nameData = '0x06fdde03'; // name()
      const nameResult = await publicClient.call({
        to: SPG_NFT_CONTRACT,
        data: nameData,
      });
      console.log('✅ name() function exists, result:', nameResult);
    } catch (e) {
      console.log('❌ name() function failed:', e.message);
    }

    // Test symbol() function
    try {
      const symbolData = '0x95d89b41'; // symbol()
      const symbolResult = await publicClient.call({
        to: SPG_NFT_CONTRACT,
        data: symbolData,
      });
      console.log('✅ symbol() function exists, result:', symbolResult);
    } catch (e) {
      console.log('❌ symbol() function failed:', e.message);
    }

    // Test totalSupply() function
    try {
      const totalSupplyData = '0x18160ddd'; // totalSupply()
      const totalSupplyResult = await publicClient.call({
        to: SPG_NFT_CONTRACT,
        data: totalSupplyData,
      });
      console.log('✅ totalSupply() function exists, result:', totalSupplyResult);
    } catch (e) {
      console.log('❌ totalSupply() function failed:', e.message);
    }

    // Test our mint function signature
    console.log('\n🔍 Testing mint function signatures...');
    
    // Test mint(address,string) - 0xd0def521
    console.log('Testing mint(address,string) signature: 0xd0def521');
    
    // Test safeMint(address,string) - 0xd204c45e
    console.log('Testing safeMint(address,string) signature: 0xd204c45e');
    
    // Test mintTo(address,string) - different signature
    console.log('Testing mintTo(address,string) signature: 0x755edd17');

    console.log('\n✅ Contract analysis complete');
    
  } catch (error) {
    console.error('❌ Contract test failed:', error);
  }
}

testContract().catch(console.error);