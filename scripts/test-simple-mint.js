/**
 * Test Simple NFT Minting
 * This script tests basic NFT minting to see if we can get any minting working
 */

async function testSimpleMint() {
  console.log('🔍 Testing Simple NFT Minting...\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';
  
  console.log('📋 Configuration:');
  console.log('   Contract:', SPG_NFT_CONTRACT);
  console.log('   Wallet:', WALLET_ADDRESS);
  console.log('   RPC:', RPC_URL);
  console.log('');

  // First, let's see what functions this contract actually supports
  console.log('🔍 Step 1: Checking contract functions...');
  
  // Try common ERC-721 functions
  const commonFunctions = [
    { name: 'name()', sig: '0x06fdde03' },
    { name: 'symbol()', sig: '0x95d89b41' },
    { name: 'totalSupply()', sig: '0x18160ddd' },
    { name: 'owner()', sig: '0x8da5cb5b' },
    { name: 'balanceOf(address)', sig: '0x70a08231' },
  ];

  for (const func of commonFunctions) {
    try {
      let callData = func.sig;
      
      // For balanceOf, we need to pass an address parameter
      if (func.name.includes('balanceOf')) {
        callData = func.sig + '000000000000000000000000' + WALLET_ADDRESS.substring(2);
      }
      
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: SPG_NFT_CONTRACT,
            data: callData
          }, 'latest'],
          id: 1
        })
      });

      const data = await response.json();
      
      if (data.result && data.result !== '0x' && !data.error) {
        console.log(`   ✅ ${func.name}: ${data.result}`);
        
        // Try to decode some results
        if (func.name === 'name()' || func.name === 'symbol()') {
          try {
            const hex = data.result.substring(130); // Skip offset and length
            const bytes = hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
            const text = String.fromCharCode(...bytes.filter(b => b > 0 && b < 128));
            console.log(`      Decoded: "${text}"`);
          } catch (e) {
            // Ignore decode errors
          }
        } else if (func.name === 'totalSupply()' || func.name.includes('balanceOf')) {
          try {
            const value = parseInt(data.result, 16);
            console.log(`      Decoded: ${value}`);
          } catch (e) {
            // Ignore decode errors
          }
        }
      } else {
        console.log(`   ❌ ${func.name}: Not supported or error`);
      }
    } catch (error) {
      console.log(`   ❌ ${func.name}: ${error.message}`);
    }
  }

  console.log('');

  // Step 2: Try to find a working mint function
  console.log('🔍 Step 2: Testing potential mint functions...');
  
  // Common mint function signatures
  const mintFunctions = [
    { name: 'mint(address)', sig: '0x6a627842' },
    { name: 'mint(address,uint256)', sig: '0x40c10f19' },
    { name: 'mint(address,string)', sig: '0xd0def521' },
    { name: 'safeMint(address)', sig: '0x40d097c3' },
    { name: 'safeMint(address,uint256)', sig: '0xa1448194' },
    { name: 'mintTo(address)', sig: '0x449a52f8' },
  ];

  // Create simple test metadata
  const testMetadata = {
    name: "Test NFT",
    description: "Simple test",
    image: ""
  };
  
  const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(testMetadata)).toString('base64')}`;
  
  console.log('   📝 Test TokenURI:', tokenURI.substring(0, 50) + '...');
  console.log('   📝 TokenURI Length:', tokenURI.length);
  console.log('');

  for (const mintFunc of mintFunctions) {
    console.log(`   🧪 Testing ${mintFunc.name}...`);
    
    try {
      let callData = mintFunc.sig;
      
      // Encode parameters based on function signature
      if (mintFunc.name === 'mint(address)' || mintFunc.name === 'safeMint(address)' || mintFunc.name === 'mintTo(address)') {
        // Just address parameter
        callData += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
      } else if (mintFunc.name === 'mint(address,uint256)' || mintFunc.name === 'safeMint(address,uint256)') {
        // Address + token ID
        callData += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
        callData += '0000000000000000000000000000000000000000000000000000000000000001'; // Token ID 1
      } else if (mintFunc.name === 'mint(address,string)') {
        // Address + string (tokenURI)
        callData += '000000000000000000000000' + WALLET_ADDRESS.substring(2);
        callData += '0000000000000000000000000000000000000000000000000000000000000040'; // Offset to string
        
        // Encode string length and data
        const uriHex = Buffer.from(tokenURI).toString('hex');
        const length = tokenURI.length.toString(16).padStart(64, '0');
        const paddedHex = uriHex.padEnd(Math.ceil(uriHex.length / 64) * 64, '0');
        
        callData += length + paddedHex;
      }
      
      // Try to estimate gas for this function call
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
        console.log(`      ✅ Gas estimate: ${gasEstimate.toLocaleString()}`);
        console.log(`      📝 This function exists and can be called!`);
        
        // If gas estimation succeeds, this function exists and might work
        console.log(`      🎯 POTENTIAL WORKING FUNCTION: ${mintFunc.name}`);
        console.log(`      📋 Function signature: ${mintFunc.sig}`);
        console.log(`      📋 Encoded call data length: ${callData.length}`);
        
      } else {
        console.log(`      ❌ Gas estimation failed: ${gasData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 SUMMARY:');
  console.log('');
  console.log('If any functions showed successful gas estimation, those are');
  console.log('the functions we should try to use for actual minting.');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Use the working function signature in our API');
  console.log('2. Try actual transaction with the working function');
  console.log('3. If simple minting works, then work up to Story Protocol features');
}

// Run the test
testSimpleMint().catch(console.error);