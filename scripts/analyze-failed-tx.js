/**
 * Analyze Failed Transaction
 * This script analyzes the failed minting transaction to understand what went wrong
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

const FAILED_TX_HASH = '0xa92a56569ee93025647b36e3b18b4e46abbf21ec2f9c78d38ace121ca3b56f26';

async function analyzeTx() {
  console.log('🔍 Analyzing failed transaction...');
  console.log('TX Hash:', FAILED_TX_HASH);
  
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  try {
    // Get transaction details
    const tx = await publicClient.getTransaction({ hash: FAILED_TX_HASH });
    console.log('\n📋 Transaction Details:');
    console.log('From:', tx.from);
    console.log('To:', tx.to);
    console.log('Value:', tx.value.toString());
    console.log('Gas:', tx.gas.toString());
    console.log('Gas Price:', tx.gasPrice?.toString());
    console.log('Data length:', tx.input.length);
    console.log('Data (first 100 chars):', tx.input.slice(0, 100));
    
    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({ hash: FAILED_TX_HASH });
    console.log('\n📋 Transaction Receipt:');
    console.log('Status:', receipt.status);
    console.log('Gas Used:', receipt.gasUsed.toString());
    console.log('Block Number:', receipt.blockNumber.toString());
    console.log('Logs count:', receipt.logs.length);
    
    // Analyze the input data
    console.log('\n🔍 Analyzing transaction input data...');
    const functionSelector = tx.input.slice(0, 10);
    console.log('Function Selector:', functionSelector);
    
    // Common function selectors
    const knownSelectors = {
      '0xd0def521': 'mint(address,string)',
      '0xd204c45e': 'safeMint(address,string)', 
      '0x755edd17': 'mintTo(address,string)',
      '0x4cc157df': 'mintAndRegisterIpAssetWithPilTerms(...)',
      '0xa0712d68': 'mint(uint256)',
      '0x40c10f19': 'mint(address,uint256)',
    };
    
    const functionName = knownSelectors[functionSelector] || 'Unknown function';
    console.log('Function:', functionName);
    
    // Check what contract was called
    console.log('\n🔍 Contract Analysis:');
    const contractBytecode = await publicClient.getBytecode({ address: tx.to });
    console.log('Contract exists:', !!contractBytecode && contractBytecode !== '0x');
    console.log('Bytecode length:', contractBytecode?.length || 0);
    
    // Try to understand why it reverted
    console.log('\n🔍 Revert Analysis:');
    if (receipt.status === 'reverted') {
      console.log('❌ Transaction reverted');
      
      // Try to simulate the transaction to get revert reason
      try {
        await publicClient.call({
          to: tx.to,
          from: tx.from,
          data: tx.input,
          value: tx.value,
        });
      } catch (simulationError) {
        console.log('Simulation error:', simulationError.message);
        
        if (simulationError.data) {
          console.log('Revert data:', simulationError.data);
        }
      }
    }
    
    // Check if this is the correct contract address
    console.log('\n🔍 Contract Verification:');
    console.log('Target contract:', tx.to);
    
    // Let's see if we can find the actual SPG contracts
    const possibleSPGAddresses = [
      '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424', // Current
      '0x69415CE984A79a3Cfbe3F51024C63b6C107331e3', // Alternative
      '0x1fcAd0219d4D3E87b66A0E8c2f7E3B6dA4a0c5e8', // Alternative
    ];
    
    for (const addr of possibleSPGAddresses) {
      try {
        const code = await publicClient.getBytecode({ address: addr });
        console.log(`${addr}: ${code ? 'EXISTS' : 'NOT FOUND'} (${code?.length || 0} bytes)`);
      } catch (e) {
        console.log(`${addr}: ERROR - ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeTx().catch(console.error);