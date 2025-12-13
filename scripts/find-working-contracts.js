/**
 * Find Working Story Protocol Contracts
 * This script tries to find working Story Protocol contracts on Aeneid testnet
 */

async function findWorkingContracts() {
  console.log('🔍 Finding Working Story Protocol Contracts...\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  
  // Known Story Protocol contract addresses from various sources
  const POTENTIAL_CONTRACTS = [
    // Current addresses we're using
    { name: 'Current Gateway', address: '0x937bef10ba6fb941ed84b8d249abc76031429a9a' },
    { name: 'Current SPG NFT', address: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' },
    
    // From error messages and documentation
    { name: 'Old SPG Contract', address: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424' },
    { name: 'Env Contract', address: '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44' },
    
    // Common Story Protocol addresses (from docs/examples)
    { name: 'Story Gateway 1', address: '0x69415CE984A79a3Cfbe3F51024C63b6C107331e3' },
    { name: 'Story Gateway 2', address: '0x1fcAd0219d4D3E87b66A0E8c2f7E3B6dA4a0c5e8' },
    { name: 'Registration Workflows', address: '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433' },
    
    // Try some common deployment addresses
    { name: 'Common Deploy 1', address: '0x742d35Cc6634C0532925a3b8D4C9db96590e4265' },
    { name: 'Common Deploy 2', address: '0x456789abcdef0123456789abcdef0123456789ab' },
  ];

  console.log('📋 Checking contract existence and functionality...\n');

  const workingContracts = [];

  for (const contract of POTENTIAL_CONTRACTS) {
    console.log(`🔍 Checking: ${contract.name} (${contract.address})`);
    
    try {
      // Check if contract exists
      const codeResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [contract.address, 'latest'],
          id: 1
        })
      });

      const codeData = await codeResponse.json();
      const code = codeData.result;
      
      if (!code || code === '0x' || code.length <= 2) {
        console.log(`   ❌ No contract found`);
        continue;
      }

      console.log(`   ✅ Contract exists (${code.length} bytes)`);
      
      // Try to call a common function to see if it responds
      const functions = [
        { name: 'name()', sig: '0x06fdde03' },
        { name: 'owner()', sig: '0x8da5cb5b' },
        { name: 'symbol()', sig: '0x95d89b41' },
        { name: 'totalSupply()', sig: '0x18160ddd' }
      ];

      let responsive = false;
      for (const func of functions) {
        try {
          const callResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: contract.address,
                data: func.sig
              }, 'latest'],
              id: 1
            })
          });

          const callData = await callResponse.json();
          
          if (callData.result && callData.result !== '0x' && !callData.error) {
            console.log(`   📞 Responds to ${func.name}: ${callData.result.substring(0, 20)}...`);
            responsive = true;
            break;
          }
        } catch (e) {
          // Continue to next function
        }
      }

      if (responsive) {
        console.log(`   ✅ Contract is responsive`);
        workingContracts.push(contract);
      } else {
        console.log(`   ⚠️ Contract exists but not responsive to common functions`);
      }

    } catch (error) {
      console.log(`   ❌ Error checking contract: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 WORKING CONTRACTS FOUND:');
  console.log('='.repeat(60));
  
  if (workingContracts.length === 0) {
    console.log('❌ No working contracts found!');
    console.log('');
    console.log('🔧 RECOMMENDATIONS:');
    console.log('1. Check Story Protocol documentation for current testnet addresses');
    console.log('2. Verify we\'re on the right network (Aeneid testnet)');
    console.log('3. Try deploying our own simple NFT contract for testing');
    console.log('4. Check if Story Protocol testnet is operational');
  } else {
    workingContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.name}`);
      console.log(`   Address: ${contract.address}`);
      console.log(`   Status: ✅ Working`);
      console.log('');
    });
    
    console.log('🔧 NEXT STEPS:');
    console.log('1. Try using these working contracts in our minting API');
    console.log('2. Test with simpler function calls first');
    console.log('3. Check if these contracts support the functions we need');
  }

  // Also check our wallet to make sure it's working
  console.log('💰 WALLET CHECK:');
  console.log('='.repeat(60));
  
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';
  
  try {
    const balanceResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [WALLET_ADDRESS, 'latest'],
        id: 1
      })
    });

    const balanceData = await balanceResponse.json();
    const balanceWei = balanceData.result;
    const balanceIP = parseInt(balanceWei, 16) / 1e18;
    
    console.log(`Wallet: ${WALLET_ADDRESS}`);
    console.log(`Balance: ${balanceIP.toFixed(6)} IP`);
    
    if (balanceIP > 0.1) {
      console.log('✅ Wallet has sufficient funds');
    } else {
      console.log('⚠️ Wallet has low funds - may need more IP tokens');
    }
  } catch (error) {
    console.log(`❌ Could not check wallet balance: ${error.message}`);
  }
}

// Run the search
findWorkingContracts().catch(console.error);