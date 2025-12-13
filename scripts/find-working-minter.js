/**
 * Find Working Minter
 * This script finds who actually has permission to mint on the SPG contract
 * and creates a working minting solution
 */

async function findWorkingMinter() {
  console.log('🔍 Finding Who Can Actually Mint on SPG Contract...\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';

  console.log('📋 Configuration:');
  console.log('   SPG NFT Contract:', SPG_NFT_CONTRACT);
  console.log('   Our Wallet:', WALLET_ADDRESS);
  console.log('');

  // Step 1: Check if our wallet has minting permission
  console.log('🔍 STEP 1: Checking if our wallet has minting permission...');
  
  try {
    // Check if our wallet has MINTER_ROLE
    const minterRoleHash = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'; // keccak256("MINTER_ROLE")
    const hasRoleData = '0x91d14854' + minterRoleHash.substring(2) + '000000000000000000000000' + WALLET_ADDRESS.substring(2);
    
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: hasRoleData
        }, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    if (data.result === '0x0000000000000000000000000000000000000000000000000000000000000001') {
      console.log('   ✅ Our wallet HAS minting permission!');
    } else {
      console.log('   ❌ Our wallet does NOT have minting permission');
    }
  } catch (error) {
    console.log('   ❌ Error checking wallet permission:', error.message);
  }

  console.log('');

  // Step 2: Check if the contract has an owner who can mint
  console.log('🔍 STEP 2: Checking contract owner and admin roles...');
  
  try {
    // Check owner
    const ownerResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: '0x8da5cb5b' // owner()
        }, 'latest'],
        id: 1
      })
    });

    const ownerData = await ownerResponse.json();
    if (ownerData.result && ownerData.result !== '0x') {
      const owner = '0x' + ownerData.result.substring(26);
      console.log('   👤 Contract Owner:', owner);
      
      // Check if owner is our wallet
      if (owner.toLowerCase() === WALLET_ADDRESS.toLowerCase()) {
        console.log('   🎯 WE ARE THE OWNER! We should be able to mint!');
      } else {
        console.log('   ❌ We are not the owner');
      }
    }

    // Check DEFAULT_ADMIN_ROLE
    const adminRoleHash = '0x0000000000000000000000000000000000000000000000000000000000000000'; // DEFAULT_ADMIN_ROLE
    const hasAdminRoleData = '0x91d14854' + adminRoleHash.substring(2) + '000000000000000000000000' + WALLET_ADDRESS.substring(2);
    
    const adminResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: hasAdminRoleData
        }, 'latest'],
        id: 1
      })
    });

    const adminData = await adminResponse.json();
    if (adminData.result === '0x0000000000000000000000000000000000000000000000000000000000000001') {
      console.log('   ✅ Our wallet HAS admin role!');
    } else {
      console.log('   ❌ Our wallet does NOT have admin role');
    }

  } catch (error) {
    console.log('   ❌ Error checking owner/admin:', error.message);
  }

  console.log('');

  // Step 3: Try different minting approaches that might work
  console.log('🧪 STEP 3: Testing direct minting approaches on SPG contract...');
  
  const testMetadata = { name: "Test", description: "Test", image: "" };
  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(testMetadata)).toString('base64')}`;
  
  // Test functions that might work directly on the SPG contract
  const directMintFunctions = [
    {
      name: 'mint(address)',
      sig: '0x6a627842',
      encode: () => '0x6a627842' + '000000000000000000000000' + WALLET_ADDRESS.substring(2)
    },
    {
      name: 'mint(address,uint256)',
      sig: '0x40c10f19',
      encode: () => '0x40c10f19' + '000000000000000000000000' + WALLET_ADDRESS.substring(2) + '0000000000000000000000000000000000000000000000000000000000000001'
    },
    {
      name: 'mint(address,string)',
      sig: '0xd0def521',
      encode: () => {
        let data = '0xd0def521';
        data += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
        data += '0000000000000000000000000000000000000000000000000000000000000040';
        const uriHex = Buffer.from(tokenURI).toString('hex');
        const length = tokenURI.length.toString(16).padStart(64, '0');
        const paddedHex = uriHex.padEnd(Math.ceil(uriHex.length / 64) * 64, '0');
        return data + length + paddedHex;
      }
    },
    {
      name: 'safeMint(address)',
      sig: '0x40d097c3',
      encode: () => '0x40d097c3' + '000000000000000000000000' + WALLET_ADDRESS.substring(2)
    },
    {
      name: 'safeMint(address,uint256)',
      sig: '0xa1448194',
      encode: () => '0xa1448194' + '000000000000000000000000' + WALLET_ADDRESS.substring(2) + '0000000000000000000000000000000000000000000000000000000000000001'
    },
    {
      name: 'safeMint(address,string)',
      sig: '0x8832e6e3',
      encode: () => {
        let data = '0x8832e6e3';
        data += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
        data += '0000000000000000000000000000000000000000000000000000000000000040';
        const uriHex = Buffer.from(tokenURI).toString('hex');
        const length = tokenURI.length.toString(16).padStart(64, '0');
        const paddedHex = uriHex.padEnd(Math.ceil(uriHex.length / 64) * 64, '0');
        return data + length + paddedHex;
      }
    }
  ];

  for (const func of directMintFunctions) {
    console.log(`🧪 Testing: ${func.name} directly on SPG contract`);
    
    try {
      const callData = func.encode();
      
      const gasResponse = await fetch(RPC_URL, {
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

      const gasData = await gasResponse.json();
      
      if (gasData.result && !gasData.error) {
        const gasEstimate = parseInt(gasData.result, 16);
        console.log(`   ✅ SUCCESS! Gas estimate: ${gasEstimate.toLocaleString()}`);
        console.log(`   🎯 This function works! We can mint directly!`);
        console.log(`   📋 Function: ${func.name}`);
        console.log(`   📋 Signature: ${func.sig}`);
        console.log(`   📋 Call data length: ${callData.length}`);
        
        // This is our working solution!
        console.log(`   🚀 WORKING SOLUTION FOUND!`);
        return {
          success: true,
          function: func.name,
          signature: func.sig,
          callData: callData,
          gasEstimate: gasEstimate
        };
        
      } else {
        console.log(`   ❌ Failed: ${gasData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 SUMMARY:');
  console.log('');
  console.log('If we found a working function above, we can:');
  console.log('1. Update our API to use direct minting on the SPG contract');
  console.log('2. Bypass the Gateway contract entirely');
  console.log('3. Use the working function signature and parameters');
  console.log('');
  console.log('This explains why 3,931 NFTs were minted - they used direct minting!');

  return { success: false };
}

// Run the search
findWorkingMinter().catch(console.error);