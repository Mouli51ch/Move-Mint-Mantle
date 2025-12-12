#!/usr/bin/env node

/**
 * Quick RPC Status Checker
 * Run with: node check-rpc.js
 */

const https = require('https');

const RPC_ENDPOINTS = [
  { name: 'Aeneid Primary', url: 'https://rpc.aeneid.testnet.story.foundation' },
  { name: 'Testnet Fallback', url: 'https://testnet.storyrpc.io' },
];

const checkRPC = (rpc) => {
  return new Promise((resolve) => {
    const url = new URL(rpc.url);
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.result) {
            const blockNumber = parseInt(result.result, 16);
            resolve({
              status: 'online',
              blockNumber,
              name: rpc.name,
              url: rpc.url
            });
          } else {
            resolve({ status: 'error', name: rpc.name, url: rpc.url });
          }
        } catch (e) {
          resolve({ status: 'error', name: rpc.name, url: rpc.url, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 'offline', name: rpc.name, url: rpc.url, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'timeout', name: rpc.name, url: rpc.url });
    });

    req.write(postData);
    req.end();
  });
};

async function main() {
  console.log('\n🔍 Checking Story Protocol RPC Endpoints...\n');

  const results = await Promise.all(RPC_ENDPOINTS.map(checkRPC));

  results.forEach((result) => {
    const statusEmoji = result.status === 'online' ? '✅' : '❌';
    console.log(`${statusEmoji} ${result.name}`);
    console.log(`   URL: ${result.url}`);

    if (result.status === 'online') {
      console.log(`   Status: ONLINE`);
      console.log(`   Block: #${result.blockNumber.toLocaleString()}`);
      console.log(`   ✨ Ready to mint!\n`);
    } else {
      console.log(`   Status: ${result.status.toUpperCase()}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log(`   ⚠️  Cannot mint yet\n`);
    }
  });

  const anyOnline = results.some(r => r.status === 'online');

  console.log('─'.repeat(60));
  if (anyOnline) {
    console.log('✅ At least one RPC is online - you can mint now!');
    console.log('   Go to: http://localhost:3000/app/mint');
    console.log('   Click "Mint NFT" and it should work!');
  } else {
    console.log('❌ All RPCs are currently down');
    console.log('   This is a network-wide issue');
    console.log('   Wait 2-5 minutes and run this script again');
    console.log('   Command: node check-rpc.js');
  }
  console.log('─'.repeat(60) + '\n');
}

main().catch(console.error);
