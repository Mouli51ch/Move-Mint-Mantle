/**
 * Test Minimal Story Protocol Minting
 * This script tests Story Protocol minting with the absolute minimum parameters
 */

async function testMinimalStoryMint() {
  console.log('🔍 Testing Minimal Story Protocol Minting...\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  const GATEWAY_CONTRACT = '0x937bef10ba6fb941ed84b8d249abc76031429a9a';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';
  
  console.log('📋 Configuration:');
  console.log('   Gateway:', GATEWAY_CONTRACT);
  console.log('   SPG NFT:', SPG_NFT_CONTRACT);
  console.log('   Wallet:', WALLET_ADDRESS);
  console.log('');

  // Create the absolute minimal metadata
  const minimalMetadata = {
    name: "Test",
    description: "Test",
    image: ""
  };
  
  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(minimalMetadata)).toString('base64')}`;
  
  console.log('📝 Minimal Metadata:');
  console.log('   JSON:', JSON.stringify(minimalMetadata));
  console.log('   TokenURI Length:', tokenURI.length);
  console.log('   TokenURI:', tokenURI);
  console.log('');

  // Create metadata hash
  const crypto = await import('crypto');
  const metadataHash = `0x${crypto.createHash('sha256').update(JSON.stringify(minimalMetadata)).digest('hex')}`;
  
  console.log('📝 Metadata Hash:', metadataHash);
  console.log('');

  // Test 1: Try with the exact same parameters but minimal data
  console.log('🧪 Test 1: mintAndRegisterIp with minimal data...');
  
  try {
    // Import viem for encoding
    const { encodeFunctionData } = await import('viem');
    
    // The exact ABI we're using
    const mintAndRegisterIpAbi = [{
      name: 'mintAndRegisterIp',
      type: 'function',
      inputs: [
        { name: 'spgNftContract', type: 'address' },
        { name: 'recipient', type: 'address' },
        {
          name: 'ipMetadata', type: 'tuple', components: [
            { name: 'ipMetadataURI', type: 'string' },
            { name: 'ipMetadataHash', type: 'bytes32' },
            { name: 'nftMetadataURI', type: 'string' },
            { name: 'nftMetadataHash', type: 'bytes32' }
          ]
        },
        { name: 'allowDuplicates', type: 'bool' }
      ]
    }];

    const data = encodeFunctionData({
      abi: mintAndRegisterIpAbi,
      functionName: 'mintAndRegisterIp',
      args: [
        SPG_NFT_CONTRACT,
        WALLET_ADDRESS,
        {
          ipMetadataURI: tokenURI,
          ipMetadataHash: metadataHash,
          nftMetadataURI: tokenURI,
          nftMetadataHash: metadataHash,
        },
        true
      ]
    });

    console.log('   📝 Encoded data length:', data.length);
    console.log('   📝 Function signature:', data.substring(0, 10));
    
    // Try gas estimation
    const gasResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [{
          from: WALLET_ADDRESS,
          to: GATEWAY_CONTRACT,
          data: data,
          gas: '0x15f900' // 1440000
        }],
        id: 1
      })
    });

    const gasData = await gasResponse.json();
    
    if (gasData.result && !gasData.error) {
      const gasEstimate = parseInt(gasData.result, 16);
      console.log(`   ✅ Gas estimate: ${gasEstimate.toLocaleString()}`);
      console.log(`   🎯 This should work! Let's try the actual transaction.`);
      
      // If gas estimation works, the function call should work
      return { success: true, data, gasEstimate };
      
    } else {
      console.log(`   ❌ Gas estimation failed:`);
      console.log(`      Error: ${gasData.error?.message || 'Unknown'}`);
      console.log(`      Code: ${gasData.error?.code || 'N/A'}`);
      console.log(`      Data: ${gasData.error?.data || 'N/A'}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Try even simpler - just check if the function exists
  console.log('🧪 Test 2: Check if mintAndRegisterIp function exists...');
  
  try {
    // Try calling with invalid parameters to see if we get a different error
    const testData = '0xf1c42a22'; // Just the function selector
    
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          from: WALLET_ADDRESS,
          to: GATEWAY_CONTRACT,
          data: testData
        }, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.log(`   📝 Function call error: ${data.error.message}`);
      
      if (data.error.message.includes('invalid opcode') || data.error.message.includes('function not found')) {
        console.log(`   ❌ Function doesn't exist on this contract`);
      } else {
        console.log(`   ✅ Function exists but parameters are wrong`);
      }
    } else {
      console.log(`   ✅ Function call succeeded (unexpected with no params)`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Check what functions the Gateway contract actually has
  console.log('🧪 Test 3: Checking Gateway contract functions...');
  
  // Common function signatures to test
  const commonFunctions = [
    { name: 'mintAndRegisterIp', sig: '0xf1c42a22' },
    { name: 'mint', sig: '0x6a627842' },
    { name: 'register', sig: '0x82fbdc9c' },
    { name: 'owner', sig: '0x8da5cb5b' },
    { name: 'paused', sig: '0x5c975abb' },
  ];

  for (const func of commonFunctions) {
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: GATEWAY_CONTRACT,
            data: func.sig
          }, 'latest'],
          id: 1
        })
      });

      const data = await response.json();
      
      if (data.error) {
        if (data.error.message.includes('invalid opcode') || data.error.message.includes('function not found')) {
          console.log(`   ❌ ${func.name}: Function not found`);
        } else {
          console.log(`   ✅ ${func.name}: Function exists (${data.error.message})`);
        }
      } else {
        console.log(`   ✅ ${func.name}: Function exists and returned: ${data.result}`);
      }
    } catch (error) {
      console.log(`   ❌ ${func.name}: ${error.message}`);
    }
  }

  console.log('');
  console.log('🎯 DIAGNOSIS:');
  console.log('');
  console.log('Based on the tests above, we can determine:');
  console.log('1. Whether the mintAndRegisterIp function exists');
  console.log('2. Whether our parameters are correct');
  console.log('3. What the actual issue is with our minting');
  console.log('');
  console.log('If the function exists but gas estimation fails,');
  console.log('the issue is likely with our parameters or contract state.');

  return { success: false };
}

// Run the test
testMinimalStoryMint().catch(console.error);