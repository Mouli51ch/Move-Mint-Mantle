/**
 * Find Story Protocol Contracts
 * This script searches for the correct SPG contracts on Aeneid testnet
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

// Known Story Protocol contract addresses from documentation
const KNOWN_CONTRACTS = {
  'SPG NFT (old)': '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424',
  'Registration Workflows': '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433',
  'Story Protocol Gateway': '0x69415CE984A79a3Cfbe3F51024C63b6C107331e3', // Common SPG address
  'PIL License Registry': '0x1fcAd0219d4D3E87b66A0E8c2f7E3B6dA4a0c5e8', // Example
  'IP Asset Registry': '0x292639452A975630802C17c9267169D5c960a2E8', // Example
};

async function findContracts() {
  console.log('🔍 Searching for Story Protocol contracts on Aeneid testnet...\n');
  
  const publicClient = createPublicClient({
    chain: aeneidChain,
    transport: http('https://aeneid.storyrpc.io'),
  });

  for (const [name, address] of Object.entries(KNOWN_CONTRACTS)) {
    console.log(`📋 Testing ${name}: ${address}`);
    
    try {
      // Check if contract exists
      const bytecode = await publicClient.getBytecode({ address });
      
      if (!bytecode || bytecode === '0x') {
        console.log('❌ No contract found at this address\n');
        continue;
      }
      
      console.log(`✅ Contract found, bytecode length: ${bytecode.length}`);
      
      // Try to determine contract type by testing common functions
      const tests = [
        { name: 'name()', data: '0x06fdde03' },
        { name: 'symbol()', data: '0x95d89b41' },
        { name: 'totalSupply()', data: '0x18160ddd' },
        { name: 'owner()', data: '0x8da5cb5b' },
        { name: 'mint(address,string)', data: '0xd0def521' + '0'.repeat(128) }, // with dummy params
      ];
      
      for (const test of tests) {
        try {
          const result = await publicClient.call({
            to: address,
            data: test.data,
          });
          console.log(`  ✅ ${test.name}: ${result?.slice(0, 20)}...`);
        } catch (e) {
          console.log(`  ❌ ${test.name}: ${e.message.split('.')[0]}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error testing contract: ${error.message}\n`);
    }
  }
  
  // Let's also try to find the correct SPG contract by looking at recent transactions
  console.log('🔍 Looking for recent SPG transactions...');
  
  try {
    // Get latest block
    const latestBlock = await publicClient.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);
    
    // Look at recent blocks for SPG-related transactions
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlock - BigInt(i);
      try {
        const block = await publicClient.getBlock({ 
          blockNumber,
          includeTransactions: true 
        });
        
        console.log(`Block ${blockNumber}: ${block.transactions.length} transactions`);
        
        // Look for transactions to known contracts
        const relevantTxs = block.transactions.filter(tx => 
          Object.values(KNOWN_CONTRACTS).includes(tx.to?.toLowerCase())
        );
        
        if (relevantTxs.length > 0) {
          console.log(`  Found ${relevantTxs.length} relevant transactions`);
          relevantTxs.forEach(tx => {
            const contractName = Object.entries(KNOWN_CONTRACTS)
              .find(([, addr]) => addr.toLowerCase() === tx.to?.toLowerCase())?.[0];
            console.log(`    ${tx.hash} -> ${contractName} (${tx.to})`);
          });
        }
        
      } catch (blockError) {
        console.log(`  Error reading block ${blockNumber}: ${blockError.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error analyzing recent blocks: ${error.message}`);
  }
}

findContracts().catch(console.error);