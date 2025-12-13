#!/usr/bin/env node

/**
 * Real-time RPC status checker for Story Protocol testnet
 * Helps users understand current network conditions
 */

const fetch = require('node-fetch');

const RPC_ENDPOINTS = [
  { name: 'Primary RPC', url: 'https://aeneid.storyrpc.io' },
  { name: 'Secondary RPC', url: 'https://rpc.aeneid.testnet.story.foundation' },
  { name: 'Tertiary RPC', url: 'https://story-testnet-rpc.polkachu.com' }
];

const EXPECTED_CHAIN_ID = 1315;

async function checkRPCStatus() {
  console.log('🔍 Story Protocol Testnet RPC Status Check');
  console.log('==========================================');
  console.log(`Expected Chain ID: ${EXPECTED_CHAIN_ID}`);
  console.log('');

  let workingRPCs = 0;
  let totalRPCs = RPC_ENDPOINTS.length;

  for (const rpc of RPC_ENDPOINTS) {
    try {
      console.log(`Testing ${rpc.name}...`);
      
      const startTime = Date.now();
      
      // Test basic connectivity
      const response = await fetch(rpc.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        }),
        timeout: 10000 // 10 second timeout
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`RPC Error: ${result.error.message}`);
      }

      const chainId = parseInt(result.result, 16);
      const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
      
      if (isCorrectChain) {
        workingRPCs++;
        console.log(`  ✅ ${rpc.name}: Working (${responseTime}ms)`);
        console.log(`     Chain ID: ${chainId} ✓`);
        console.log(`     Response Time: ${responseTime}ms`);
        
        // Test transaction count (more intensive test)
        try {
          const txCountResponse = await fetch(rpc.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionCount',
              params: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'latest'],
              id: 2
            }),
            timeout: 5000
          });
          
          const txCountResult = await txCountResponse.json();
          if (txCountResult.error) {
            console.log(`     ⚠️ Advanced functions may be limited`);
          } else {
            console.log(`     ✅ Full functionality available`);
          }
        } catch (txError) {
          console.log(`     ⚠️ Advanced functions may be limited`);
        }
        
      } else {
        console.log(`  ❌ ${rpc.name}: Wrong chain (${chainId}, expected ${EXPECTED_CHAIN_ID})`);
      }

    } catch (error) {
      console.log(`  ❌ ${rpc.name}: ${error.message}`);
      
      if (error.message.includes('timeout')) {
        console.log(`     Reason: Network timeout (>10s)`);
      } else if (error.message.includes('ENOTFOUND')) {
        console.log(`     Reason: DNS resolution failed`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`     Reason: Connection refused`);
      } else if (error.message.includes('too many errors')) {
        console.log(`     Reason: RPC rate limiting/overload`);
      }
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 Summary');
  console.log('==========');
  console.log(`Working RPCs: ${workingRPCs}/${totalRPCs}`);
  
  if (workingRPCs === 0) {
    console.log('🔴 Status: All RPCs Down');
    console.log('');
    console.log('💡 Recommendations:');
    console.log('   • Wait 5-10 minutes and try again');
    console.log('   • Use IPFS-only mode (metadata will be stored)');
    console.log('   • Try the official Surreal Base demo: https://surreal-base.vercel.app/demo');
    console.log('   • Check Story Protocol status: https://status.story.foundation');
  } else if (workingRPCs < totalRPCs) {
    console.log('🟡 Status: Partial Availability');
    console.log('');
    console.log('💡 Recommendations:');
    console.log('   • Minting should work but may be slower');
    console.log('   • Retry if first attempt fails');
    console.log('   • IPFS fallback available if needed');
  } else {
    console.log('🟢 Status: All Systems Operational');
    console.log('');
    console.log('💡 Recommendations:');
    console.log('   • Perfect time for minting!');
    console.log('   • All RPCs responding normally');
    console.log('   • Full blockchain functionality available');
  }

  console.log('');
  console.log('🔗 Useful Links:');
  console.log('   • Mint Page: http://localhost:3000/app/mint');
  console.log('   • Debug Dashboard: http://localhost:3000/debug-minting-dashboard.html');
  console.log('   • Story Explorer: https://aeneid.storyscan.io');
  console.log('   • Surreal Base Demo: https://surreal-base.vercel.app/demo');

  return {
    workingRPCs,
    totalRPCs,
    status: workingRPCs === 0 ? 'down' : workingRPCs < totalRPCs ? 'partial' : 'operational'
  };
}

// Auto-refresh mode
async function monitorRPCs() {
  console.log('🔄 Starting RPC monitoring (press Ctrl+C to stop)');
  console.log('');
  
  while (true) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] Checking RPC status...`);
    
    await checkRPCStatus();
    
    console.log('');
    console.log('⏳ Waiting 30 seconds before next check...');
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

// Command line arguments
const args = process.argv.slice(2);
const isMonitorMode = args.includes('--monitor') || args.includes('-m');

if (isMonitorMode) {
  monitorRPCs().catch(error => {
    console.error('Monitor error:', error.message);
    process.exit(1);
  });
} else {
  checkRPCStatus().catch(error => {
    console.error('Check failed:', error.message);
    process.exit(1);
  });
}