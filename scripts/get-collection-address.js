const { createPublicClient, http, decodeEventLog } = require('viem');

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

async function getCollectionAddress() {
  console.log('🔍 Extracting Collection Address from Transaction');
  console.log('='.repeat(50));

  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  // Transaction hash from the previous step
  const txHash = '0x6a2d2bf6b9c38afb7b710595e294ce905389a42ca8532469094583cb3298842f';
  
  console.log('📝 Transaction hash:', txHash);

  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    
    console.log('📋 Transaction receipt:');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Status:', receipt.status);
    console.log('   Logs count:', receipt.logs.length);

    // Look for logs that might contain the collection address
    console.log('\n🔍 Analyzing logs...');
    
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`\n📄 Log ${i + 1}:`);
      console.log('   Address:', log.address);
      console.log('   Topics:', log.topics.length);
      
      // The collection address is likely to be one of the addresses in the logs
      // Let's check if any log address looks like a newly created contract
      if (log.address !== '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424') {
        console.log('   🎯 Potential collection address:', log.address);
        
        // Let's verify this is actually an NFT contract
        try {
          const nameAbi = [{ name: 'name', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] }];
          const name = await publicClient.readContract({
            address: log.address,
            abi: nameAbi,
            functionName: 'name',
          });
          
          console.log('   ✅ Contract name:', name);
          
          if (name === 'MoveMint Dance NFTs') {
            console.log('\n🎉 FOUND OUR COLLECTION!');
            console.log('   Collection Address:', log.address);
            console.log('   Name:', name);
            
            // Get more details
            const symbolAbi = [{ name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] }];
            const symbol = await publicClient.readContract({
              address: log.address,
              abi: symbolAbi,
              functionName: 'symbol',
            });
            
            console.log('   Symbol:', symbol);
            
            console.log('\n📝 UPDATE YOUR .ENV FILE:');
            console.log(`   Replace the SPG_NFT_CONTRACT with: ${log.address}`);
            
            return log.address;
          }
          
        } catch (error) {
          console.log('   ❌ Not a valid NFT contract');
        }
      }
    }
    
    console.log('\n⚠️ Could not automatically identify the collection address.');
    console.log('   Please check the transaction on the explorer:');
    console.log('   https://aeneid.storyscan.io/tx/' + txHash);

  } catch (error) {
    console.error('❌ Failed to get transaction receipt:', error.message);
  }

  console.log('\n' + '='.repeat(50));
}

getCollectionAddress().catch(console.error);