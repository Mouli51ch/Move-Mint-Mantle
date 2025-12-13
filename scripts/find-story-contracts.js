/**
 * Find Story Protocol Contracts
 * This script searches for the correct Story Protocol contracts by checking known addresses
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

// Known Story Protocol contract addresses from various sources
const KNOWN_CONTRACTS = {
  // From Surreal-Base config
  'SPG NFT (Surreal-Base)': '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
  'NFT (Surreal-Base)': '0x937bef10ba6fb941ed84b8d249abc76031429a9a',
  
  // From our failed attempts
  'Old SPG Contract': '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424',
  
  // Common Story Protocol addresses (from docs)
  'Story Protocol Gateway': '0x69415CE984A79a3Cfbe3F51024C63b6C107331e3',
  'IP Asset Registry': '0x292639452A975630802C17c9267169D5c960a2E8',
  'License Registry': '0x1fcAd0219d4D3E87b66A0E8c2f7E3B6dA4a0c5e8',
  
  // Registration Workflows (from transaction)
  'Registration Workflows': '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433',
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
      
      // Test for mintAndRegisterIp function
      const mintAndRegisterIpSig = '0x5ed55900'; // From our previous test
      
      try {
        // Try calling with minimal dummy data
        const dummyCall = mintAndRegisterIpSig + '0'.repeat(200);
        await publicClient.call({
          to: address,
          data: dummyCall,
        });
        console.log('  ✅ mintAndRegisterIp: Function exists');
      } catch (e) {
        if (e.message.includes('execution reverted')) {
          console.log('  ✅ mintAndRegisterIp: Function exists (reverted as expected)');
        } else if (e.message.includes('function selector was not recognized')) {
          console.log('  ❌ mintAndRegisterIp: Function not found');
        } else {
          console.log(`  ⚠️  mintAndRegisterIp: ${e.message.split('.')[0]}`);
        }
      }
      
      // Test for mint function (simple NFT mint)
      const mintSig = '0xd0def521'; // mint(address,string)
      
      try {
        const dummyMintCall = mintSig + '0'.repeat(200);
        await publicClient.call({
          to: address,
          data: dummyMintCall,
        });
        console.log('  ✅ mint(address,string): Function exists');
      } catch (e) {
        if (e.message.includes('execution reverted')) {
          console.log('  ✅ mint(address,string): Function exists (reverted as expected)');
        } else if (e.message.includes('function selector was not recognized')) {
          console.log('  ❌ mint(address,string): Function not found');
        } else {
          console.log(`  ⚠️  mint(address,string): ${e.message.split('.')[0]}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error testing contract: ${error.message}\n`);
    }
  }
  
  // Check recent transactions to see what contracts are being used
  console.log('🔍 Checking recent transactions for contract usage...');
  
  try {
    const latestBlock = await publicClient.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);
    
    // Look at recent blocks for Story Protocol transactions
    for (let i = 0; i < 10; i++) {
      const blockNumber = latestBlock - BigInt(i);
      try {
        const block = await publicClient.getBlock({ 
          blockNumber,
          includeTransactions: true 
        });
        
        if (block.transactions.length > 0) {
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