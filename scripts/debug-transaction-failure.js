/**
 * Debug Transaction Failure
 * This script investigates why Story Protocol minting transactions are reverting
 */

async function debugTransactionFailure() {
  console.log('🔍 Debugging Transaction Failure...\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  const FAILED_TX = '0x28b1bb94790b6f5f391bb4b46a247cddb9399a751bcf55951abd8bb6a54ba7ba';
  
  // Story Protocol contracts we're using
  const GATEWAY_CONTRACT = '0x937bef10ba6fb941ed84b8d249abc76031429a9a';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';

  console.log('📋 Configuration Check:');
  console.log('   Gateway Contract:', GATEWAY_CONTRACT);
  console.log('   SPG NFT Contract:', SPG_NFT_CONTRACT);
  console.log('   Wallet Address:', WALLET_ADDRESS);
  console.log('');

  // 1. Check if contracts exist
  console.log('🔍 Step 1: Checking if contracts exist...');
  
  const contracts = [
    { name: 'Gateway Contract', address: GATEWAY_CONTRACT },
    { name: 'SPG NFT Contract', address: SPG_NFT_CONTRACT }
  ];

  for (const contract of contracts) {
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [contract.address, 'latest'],
          id: 1
        })
      });

      const data = await response.json();
      const code = data.result;
      
      if (code && code !== '0x' && code.length > 2) {
        console.log(`   ✅ ${contract.name}: EXISTS (${code.length} bytes)`);
      } else {
        console.log(`   ❌ ${contract.name}: NOT FOUND (no bytecode)`);
      }
    } catch (error) {
      console.log(`   ❌ ${contract.name}: ERROR - ${error.message}`);
    }
  }

  console.log('');

  // 2. Check wallet balance
  console.log('🔍 Step 2: Checking wallet balance...');
  
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [WALLET_ADDRESS, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    const balanceWei = data.result;
    const balanceIP = parseInt(balanceWei, 16) / 1e18;
    
    console.log(`   💰 Wallet Balance: ${balanceIP.toFixed(6)} IP`);
    
    if (balanceIP < 0.01) {
      console.log(`   ⚠️ Low balance! Minting may fail due to insufficient gas fees.`);
    } else {
      console.log(`   ✅ Balance sufficient for minting`);
    }
  } catch (error) {
    console.log(`   ❌ Balance check failed: ${error.message}`);
  }

  console.log('');

  // 3. Analyze the failed transaction
  console.log('🔍 Step 3: Analyzing failed transaction...');
  
  try {
    // Get transaction details
    const txResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [FAILED_TX],
        id: 1
      })
    });

    const txData = await txResponse.json();
    const tx = txData.result;

    if (tx) {
      console.log(`   📋 Transaction Details:`);
      console.log(`      From: ${tx.from}`);
      console.log(`      To: ${tx.to}`);
      console.log(`      Value: ${parseInt(tx.value, 16)} wei`);
      console.log(`      Gas: ${parseInt(tx.gas, 16).toLocaleString()}`);
      console.log(`      Gas Price: ${parseInt(tx.gasPrice, 16)} wei`);
      console.log(`      Data: ${tx.input.substring(0, 20)}... (${tx.input.length} chars)`);
      
      // Check if we're calling the right contract
      if (tx.to.toLowerCase() === GATEWAY_CONTRACT.toLowerCase()) {
        console.log(`   ✅ Calling correct Gateway contract`);
      } else {
        console.log(`   ❌ Calling wrong contract! Expected: ${GATEWAY_CONTRACT}, Got: ${tx.to}`);
      }

      // Check function signature
      const functionSig = tx.input.substring(0, 10);
      console.log(`   📝 Function signature: ${functionSig}`);
      
      // mintAndRegisterIp function signature should be 0x...
      // Let's see what function we're actually calling
      
    } else {
      console.log(`   ❌ Transaction not found`);
    }
  } catch (error) {
    console.log(`   ❌ Transaction analysis failed: ${error.message}`);
  }

  console.log('');

  // 4. Test a simple contract call
  console.log('🔍 Step 4: Testing simple contract interaction...');
  
  try {
    // Try to call a simple view function to see if the contract is responsive
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: '0x06fdde03' // name() function
        }, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    
    if (data.result && data.result !== '0x') {
      console.log(`   ✅ SPG NFT Contract is responsive`);
      
      // Try to decode the name
      try {
        const nameHex = data.result.substring(130); // Skip the offset and length
        const nameBytes = nameHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
        const name = String.fromCharCode(...nameBytes.filter(b => b > 0));
        console.log(`   📝 Contract name: "${name}"`);
      } catch (e) {
        console.log(`   📝 Contract responded but name decode failed`);
      }
    } else {
      console.log(`   ❌ SPG NFT Contract not responsive or no name function`);
    }
  } catch (error) {
    console.log(`   ❌ Contract test failed: ${error.message}`);
  }

  console.log('');
  console.log('🎯 DIAGNOSIS:');
  console.log('');
  console.log('The transactions are reverting, which means:');
  console.log('1. ❌ The contract call is failing on-chain');
  console.log('2. ❌ Either wrong function signature, wrong parameters, or contract issue');
  console.log('3. ❌ Need to fix the contract interaction in /api/mint-ip-asset');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Verify the correct function signature for mintAndRegisterIp');
  console.log('2. Check if we need different parameters');
  console.log('3. Test with a simpler contract call first');
  console.log('4. Check Story Protocol documentation for correct usage');
}

// Run the debug
debugTransactionFailure().catch(console.error);