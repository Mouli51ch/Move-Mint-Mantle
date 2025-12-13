#!/usr/bin/env node

/**
 * Quick verification script for NFT minting setup
 * Tests all critical components without requiring wallet interaction
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
const STORY_PROTOCOL_TESTNET = {
  chainId: 1315,
  rpcUrl: 'https://aeneid.storyrpc.io',
  spgContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc'
};

async function verifySetup() {
  console.log('🔍 Verifying NFT Minting Setup');
  console.log('================================');

  const results = {
    apiEndpoints: [],
    rpcHealth: [],
    contractStatus: null,
    overallStatus: 'unknown'
  };

  // 1. Test API Endpoints
  console.log('\n📡 Testing API Endpoints...');
  
  const endpoints = [
    { name: 'Health Check', path: '/api/health', method: 'GET' },
    { name: 'Prepare Mint', path: '/api/prepare-mint', method: 'POST' },
    { name: 'Execute Story Mint', path: '/api/execute-story-mint', method: 'POST' }
  ];

  for (const endpoint of endpoints) {
    try {
      const testData = endpoint.method === 'GET' ? null : {
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        title: 'Test Dance',
        danceStyle: 'Hip Hop',
        metadata: { ipfsHash: 'QmTest123', nftIpfsHash: 'QmTest456' }
      };

      const response = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: testData ? JSON.stringify(testData) : null
      });

      const result = await response.json();
      const status = response.ok ? 'success' : 'error';
      
      results.apiEndpoints.push({
        name: endpoint.name,
        status,
        code: response.status,
        message: status === 'success' ? 'OK' : (result.error || 'Failed')
      });

      console.log(`  ${status === 'success' ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);

    } catch (error) {
      results.apiEndpoints.push({
        name: endpoint.name,
        status: 'error',
        code: 'N/A',
        message: error.message
      });
      console.log(`  ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // 2. Test RPC Health
  console.log('\n🔗 Testing RPC Endpoints...');
  
  const rpcEndpoints = [
    'https://aeneid.storyrpc.io',
    'https://rpc.aeneid.testnet.story.foundation',
    'https://story-testnet-rpc.polkachu.com'
  ];

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        }),
        timeout: 5000
      });

      const result = await response.json();
      const chainId = parseInt(result.result, 16);
      const isCorrect = chainId === STORY_PROTOCOL_TESTNET.chainId;
      
      results.rpcHealth.push({
        url: rpcUrl,
        status: isCorrect ? 'success' : 'warning',
        chainId,
        message: isCorrect ? 'Correct chain' : `Wrong chain (${chainId})`
      });

      console.log(`  ${isCorrect ? '✅' : '⚠️'} ${rpcUrl}: Chain ${chainId}`);

    } catch (error) {
      results.rpcHealth.push({
        url: rpcUrl,
        status: 'error',
        chainId: null,
        message: error.message
      });
      console.log(`  ❌ ${rpcUrl}: ${error.message}`);
    }
  }

  // 3. Test Contract Existence (via working RPC)
  console.log('\n📄 Testing Smart Contract...');
  
  const workingRPC = results.rpcHealth.find(rpc => rpc.status === 'success');
  
  if (workingRPC) {
    try {
      const response = await fetch(workingRPC.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [STORY_PROTOCOL_TESTNET.spgContract, 'latest'],
          id: 2
        })
      });

      const result = await response.json();
      const hasCode = result.result && result.result !== '0x';
      
      results.contractStatus = {
        address: STORY_PROTOCOL_TESTNET.spgContract,
        status: hasCode ? 'success' : 'error',
        bytecodeLength: result.result ? result.result.length - 2 : 0,
        message: hasCode ? 'Contract deployed' : 'Contract not found'
      };

      console.log(`  ${hasCode ? '✅' : '❌'} SPG Contract: ${hasCode ? 'Deployed' : 'Not found'}`);
      console.log(`     Address: ${STORY_PROTOCOL_TESTNET.spgContract}`);
      console.log(`     Bytecode: ${results.contractStatus.bytecodeLength} bytes`);

    } catch (error) {
      results.contractStatus = {
        address: STORY_PROTOCOL_TESTNET.spgContract,
        status: 'error',
        message: error.message
      };
      console.log(`  ❌ Contract check failed: ${error.message}`);
    }
  } else {
    results.contractStatus = {
      status: 'error',
      message: 'No working RPC to check contract'
    };
    console.log('  ❌ Cannot check contract - no working RPC');
  }

  // 4. Overall Assessment
  console.log('\n📊 Overall Assessment');
  console.log('=====================');

  const apiSuccess = results.apiEndpoints.filter(api => api.status === 'success').length;
  const rpcSuccess = results.rpcHealth.filter(rpc => rpc.status === 'success').length;
  const contractOk = results.contractStatus?.status === 'success';

  console.log(`APIs Working: ${apiSuccess}/${endpoints.length}`);
  console.log(`RPCs Working: ${rpcSuccess}/${rpcEndpoints.length}`);
  console.log(`Contract Status: ${contractOk ? 'Deployed ✅' : 'Issues ❌'}`);

  if (apiSuccess === endpoints.length && rpcSuccess > 0 && contractOk) {
    results.overallStatus = 'ready';
    console.log('\n🎉 READY FOR MINTING!');
    console.log('All systems operational. You can proceed with NFT minting.');
  } else if (apiSuccess > 0 && rpcSuccess > 0) {
    results.overallStatus = 'partial';
    console.log('\n⚠️ PARTIAL FUNCTIONALITY');
    console.log('Some components working. Minting may work with fallbacks.');
  } else {
    results.overallStatus = 'issues';
    console.log('\n❌ ISSUES DETECTED');
    console.log('Critical components not working. Please check configuration.');
  }

  // 5. Recommendations
  console.log('\n💡 Recommendations');
  console.log('==================');

  if (results.overallStatus === 'ready') {
    console.log('✅ Open debug dashboard: http://localhost:3000/debug-minting-dashboard.html');
    console.log('✅ Test complete minting flow with MetaMask');
    console.log('✅ Ready for production deployment');
  } else {
    if (apiSuccess < endpoints.length) {
      console.log('🔧 Fix API endpoints that are failing');
    }
    if (rpcSuccess === 0) {
      console.log('🔧 Check network connectivity and RPC endpoints');
    }
    if (!contractOk) {
      console.log('🔧 Verify contract address and deployment');
    }
    console.log('🔧 Use debug dashboard for detailed troubleshooting');
  }

  console.log('\n🔗 Useful Links');
  console.log('===============');
  console.log('Debug Dashboard: http://localhost:3000/debug-minting-dashboard.html');
  console.log('Mint Page: http://localhost:3000/app/mint');
  console.log('Story Explorer: https://aeneid.storyscan.io');
  console.log('Surreal Base Demo: https://surreal-base.vercel.app/demo');

  return results;
}

// Run verification
verifySetup().catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});