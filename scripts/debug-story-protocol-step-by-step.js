/**
 * Debug Story Protocol Step by Step
 * This script systematically debugs the Story Protocol minting process
 * to find the exact issue and working solution
 */

async function debugStoryProtocolStepByStep() {
  console.log('🔍 Story Protocol Step-by-Step Debug Analysis\n');
  console.log('Goal: Find why 3,931 NFTs were minted successfully but our calls fail\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  const GATEWAY_CONTRACT = '0x937bef10ba6fb941ed84b8d249abc76031429a9a';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';

  // Step 1: Analyze the successful NFTs to understand the pattern
  console.log('📊 STEP 1: Analyzing successful NFT minting patterns...');
  console.log('='.repeat(70));
  
  try {
    // Get recent successful transactions to the SPG contract
    console.log('🔍 Checking recent successful mints on SPG NFT contract...');
    
    // Check total supply and recent activity
    const totalSupplyResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: '0x18160ddd' // totalSupply()
        }, 'latest'],
        id: 1
      })
    });

    const totalSupplyData = await totalSupplyResponse.json();
    if (totalSupplyData.result) {
      const totalSupply = parseInt(totalSupplyData.result, 16);
      console.log(`   📈 Total NFTs minted: ${totalSupply.toLocaleString()}`);
      console.log(`   ✅ This confirms minting IS working on this contract!`);
    }

    // Try to get the owner of a recent NFT to see the minting pattern
    const ownerResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: '0x6352211e' + '0000000000000000000000000000000000000000000000000000000000000001' // ownerOf(1)
        }, 'latest'],
        id: 1
      })
    });

    const ownerData = await ownerResponse.json();
    if (ownerData.result && ownerData.result !== '0x') {
      const owner = '0x' + ownerData.result.substring(26);
      console.log(`   👤 Owner of NFT #1: ${owner}`);
    }

  } catch (error) {
    console.log(`   ❌ Error analyzing NFTs: ${error.message}`);
  }

  console.log('\n');

  // Step 2: Test different function signatures that might work
  console.log('🧪 STEP 2: Testing different minting function signatures...');
  console.log('='.repeat(70));

  // Create minimal test data
  const testMetadata = { name: "Test", description: "Test", image: "" };
  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(testMetadata)).toString('base64')}`;
  const crypto = await import('crypto');
  const metadataHash = `0x${crypto.createHash('sha256').update(JSON.stringify(testMetadata)).digest('hex')}`;

  console.log(`   📝 Test TokenURI: ${tokenURI.substring(0, 50)}...`);
  console.log(`   📝 Metadata Hash: ${metadataHash}`);
  console.log('');

  // Test different function signatures that might exist on the Gateway
  const testFunctions = [
    {
      name: 'mintAndRegisterIp (current)',
      sig: '0xf1c42a22',
      description: 'Our current approach - complex IP registration'
    },
    {
      name: 'mint (simple)',
      sig: '0x6a627842', 
      description: 'Simple mint with just address'
    },
    {
      name: 'mint (address, string)',
      sig: '0xd0def521',
      description: 'Simple mint with address and tokenURI'
    },
    {
      name: 'safeMint',
      sig: '0x40d097c3',
      description: 'Safe mint function'
    },
    {
      name: 'mintTo',
      sig: '0x449a52f8',
      description: 'Mint to specific address'
    },
    {
      name: 'createIpAsset',
      sig: '0x1234abcd', // This might be wrong, but let's test
      description: 'Alternative IP asset creation'
    }
  ];

  for (const func of testFunctions) {
    console.log(`🧪 Testing: ${func.name}`);
    console.log(`   Description: ${func.description}`);
    
    try {
      let callData = func.sig;
      
      // Add parameters based on function type
      if (func.name.includes('address') || func.name === 'mint (simple)' || func.name === 'safeMint' || func.name === 'mintTo') {
        // Just address parameter
        callData += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
      } else if (func.name === 'mint (address, string)') {
        // Address + string
        callData += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
        callData += '0000000000000000000000000000000000000000000000000000000000000040';
        const uriHex = Buffer.from(tokenURI).toString('hex');
        const length = tokenURI.length.toString(16).padStart(64, '0');
        const paddedHex = uriHex.padEnd(Math.ceil(uriHex.length / 64) * 64, '0');
        callData += length + paddedHex;
      }
      
      // Test on Gateway contract
      const gasResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [{
            from: WALLET_ADDRESS,
            to: GATEWAY_CONTRACT,
            data: callData
          }],
          id: 1
        })
      });

      const gasData = await gasResponse.json();
      
      if (gasData.result && !gasData.error) {
        const gasEstimate = parseInt(gasData.result, 16);
        console.log(`   ✅ SUCCESS! Gas estimate: ${gasEstimate.toLocaleString()}`);
        console.log(`   🎯 This function exists and might work!`);
        console.log(`   📋 Function signature: ${func.sig}`);
        console.log(`   📋 Call data: ${callData.substring(0, 50)}...`);
        
        // If we find a working function, let's try it on the SPG contract too
        const spgGasResponse = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_estimateGas',
            params: [{
              from: WALLET_ADDRESS,
              to: SPG_NFT_CONTRACT,
              data: callData
            }],
            id: 1
          })
        });

        const spgGasData = await spgGasResponse.json();
        if (spgGasData.result && !spgGasData.error) {
          const spgGasEstimate = parseInt(spgGasData.result, 16);
          console.log(`   🎯 ALSO works on SPG contract! Gas: ${spgGasEstimate.toLocaleString()}`);
        }
        
      } else {
        console.log(`   ❌ Failed: ${gasData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  // Step 3: Check if there are any required setup steps or permissions
  console.log('🔐 STEP 3: Checking permissions and setup requirements...');
  console.log('='.repeat(70));

  try {
    // Check if Gateway has minter role on SPG contract
    console.log('🔍 Checking if Gateway has permission to mint on SPG contract...');
    
    // Try to call a role-checking function (common patterns)
    const roleChecks = [
      { name: 'hasRole(MINTER_ROLE, gateway)', data: '0x91d14854' + 'a49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775' + '000000000000000000000000' + GATEWAY_CONTRACT.substring(2) },
      { name: 'isMinter(gateway)', data: '0xaa271e1a' + '000000000000000000000000' + GATEWAY_CONTRACT.substring(2) },
      { name: 'minters(gateway)', data: '0xf46eccc4' + '000000000000000000000000' + GATEWAY_CONTRACT.substring(2) },
    ];

    for (const check of roleChecks) {
      try {
        const response = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: SPG_NFT_CONTRACT,
              data: check.data
            }, 'latest'],
            id: 1
          })
        });

        const data = await response.json();
        if (data.result && data.result !== '0x') {
          console.log(`   📝 ${check.name}: ${data.result}`);
          
          // Try to decode boolean result
          if (data.result === '0x0000000000000000000000000000000000000000000000000000000000000001') {
            console.log(`   ✅ Gateway HAS permission!`);
          } else if (data.result === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            console.log(`   ❌ Gateway does NOT have permission`);
          }
        }
      } catch (e) {
        // Continue to next check
      }
    }

    // Check if contracts are paused
    console.log('');
    console.log('🔍 Checking if contracts are paused...');
    
    const pauseChecks = [
      { contract: 'Gateway', address: GATEWAY_CONTRACT },
      { contract: 'SPG NFT', address: SPG_NFT_CONTRACT }
    ];

    for (const check of pauseChecks) {
      try {
        const response = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: check.address,
              data: '0x5c975abb' // paused()
            }, 'latest'],
            id: 1
          })
        });

        const data = await response.json();
        if (data.result && data.result !== '0x') {
          if (data.result === '0x0000000000000000000000000000000000000000000000000000000000000001') {
            console.log(`   ⚠️ ${check.contract} is PAUSED!`);
          } else {
            console.log(`   ✅ ${check.contract} is not paused`);
          }
        }
      } catch (e) {
        console.log(`   ❓ ${check.contract}: Cannot check pause status`);
      }
    }

  } catch (error) {
    console.log(`   ❌ Error checking permissions: ${error.message}`);
  }

  console.log('\n');

  // Step 4: Try to find the exact working approach
  console.log('🎯 STEP 4: Recommendations based on findings...');
  console.log('='.repeat(70));

  console.log('Based on the analysis above:');
  console.log('');
  console.log('1. 📊 The SPG NFT contract HAS minted 3,931+ NFTs successfully');
  console.log('2. 🔍 We need to find which function signature actually works');
  console.log('3. 🔐 Check if there are permission issues between Gateway and SPG');
  console.log('4. ⚠️ Verify if contracts are paused or have restrictions');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Use any working function signatures found above');
  console.log('2. If permissions are missing, try direct minting on SPG contract');
  console.log('3. If contracts are paused, wait for them to be unpaused');
  console.log('4. Consider using a simpler minting approach that bypasses IP registration');
  console.log('');
  console.log('💡 KEY INSIGHT:');
  console.log('Since 3,931 NFTs exist, minting DOES work - we just need the right approach!');
}

// Run the debug analysis
debugStoryProtocolStepByStep().catch(console.error);