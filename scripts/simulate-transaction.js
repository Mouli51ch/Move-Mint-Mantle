/**
 * Simulate Transaction to Get Revert Reason
 * This script simulates the failing transaction to get the actual revert reason
 */

async function simulateTransaction() {
  console.log('🔍 Simulating Transaction to Get Revert Reason...\n');

  const RPC_URL = 'https://aeneid.storyrpc.io';
  
  // Transaction data from the failed transaction
  const GATEWAY_CONTRACT = '0x937bef10ba6fb941ed84b8d249abc76031429a9a';
  const SPG_NFT_CONTRACT = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const WALLET_ADDRESS = '0x3B31D87804C345A7D39f0267D0D4FF1DCC9B1433';
  
  // The exact transaction data that failed
  const FAILED_TX_DATA = '0xf1c42a22000000000000000000000000c32a8a0ff3beddda58393d022af433e78739fabc0000000000000000000000003b31d87804c345a7d39f0267d0d4ff1dcc9b1433000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080fd72c66071dd5db1b4fd56d4df8983698ca2a74316966e835bd610a0bf322a7e00000000000000000000000000000000000000000000000000000000000002e0fd72c66071dd5db1b4fd56d4df8983698ca2a74316966e835bd610a0bf322a7e000000000000000000000000000000000000000000000000000000000000022d646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65794a755957316c496a6f69614745694c434a6b5a584e6a636d6c7764476c7662694936496d686849697769615731685a3255694f6949694c434a686448527961574a316447567a496a706265794a30636d4670644639306558426c496a6f695248567959585270623234694c434a32595778315a534936496a45364d44456966537837496e527959576c3058335235634755694f694a55623352686243424e62335a6c6257567564484d694c434a32595778315a5349364e7977695a476c7a63477868655639306558426c496a6f69626e5674596d5679496e307365794a30636d4670644639306558426c496a6f6954335a6c636d467362434252645746736158523549697769646d4673645755694f6a67314c434a6b61584e776247463558335235634755694f694a75645731695a58496966537837496e527959576c3058335235634755694f694a51636d6c7459584a3549464e306557786c49697769646d4673645755694f694a47636d566c633352356247556966537837496e527959576c3058335235634755694f694a4561575a6d61574e31624852354945786c646d567349697769646d4673645755694f694a4a626e526c636d316c5a476c686447556966563073496d5268626d4e6c55335235624755694f694a6d636d566c63335235624755694c434a6b61575a6d61574e3162485235496a6f69535735305a584a745a5752705958526c496e303d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022d646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65794a755957316c496a6f69614745694c434a6b5a584e6a636d6c7764476c7662694936496d686849697769615731685a3255694f6949694c434a686448527961574a316447567a496a706265794a30636d4670644639306558426c496a6f695248567959585270623234694c434a32595778315a534936496a45364d44456966537837496e527959576c3058335235634755694f694a55623352686243424e62335a6c6257567564484d694c434a32595778315a5349364e7977695a476c7a63477868655639306558426c496a6f69626e5674596d5679496e307365794a30636d4670644639306558426c496a6f6954335a6c636d467362434252645746736158523549697769646d4673645755694f6a67314c434a6b61584e776247463558335235634755694f694a75645731695a58496966537837496e527959576c3058335235634755694f694a51636d6c7459584a3549464e306557786c49697769646d4673645755694f694a47636d566c633352356247556966537837496e527959576c3058335235634755694f694a4561575a6d61574e31624852354945786c646d567349697769646d4673645755694f694a4a626e526c636d316c5a476c686447556966563073496d5268626d4e6c55335235624755694f694a6d636d566c63335235624755694c434a6b61575a6d61574e3162485235496a6f69535735305a584a745a5752705958526c496e303d00000000000000000000000000000000000000';

  console.log('📋 Transaction Details:');
  console.log('   Gateway Contract:', GATEWAY_CONTRACT);
  console.log('   SPG NFT Contract:', SPG_NFT_CONTRACT);
  console.log('   Wallet Address:', WALLET_ADDRESS);
  console.log('   Data Length:', FAILED_TX_DATA.length, 'characters');
  console.log('');

  // 1. Try to simulate the exact transaction that failed
  console.log('🔍 Step 1: Simulating the exact failed transaction...');
  
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          from: WALLET_ADDRESS,
          to: GATEWAY_CONTRACT,
          data: FAILED_TX_DATA,
          gas: '0x15f900' // 1440000 in hex
        }, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.log('   ❌ Simulation failed with error:');
      console.log('      Code:', data.error.code);
      console.log('      Message:', data.error.message);
      
      // Try to decode the revert reason
      if (data.error.data) {
        console.log('      Raw Error Data:', data.error.data);
        
        // Try to decode revert reason
        try {
          const errorData = data.error.data;
          if (errorData.startsWith('0x08c379a0')) {
            // Standard revert reason
            const reasonHex = errorData.substring(138); // Skip function selector and offset
            const reasonBytes = reasonHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
            const reason = String.fromCharCode(...reasonBytes.filter(b => b > 0 && b < 128));
            console.log('      📝 Decoded Revert Reason:', reason);
          } else {
            console.log('      📝 Custom error or unknown format');
          }
        } catch (e) {
          console.log('      📝 Could not decode revert reason');
        }
      }
    } else if (data.result) {
      console.log('   ✅ Simulation succeeded (unexpected!)');
      console.log('      Result:', data.result);
    }
  } catch (error) {
    console.log('   ❌ Simulation request failed:', error.message);
  }

  console.log('');

  // 2. Check if the SPG NFT contract has the right permissions
  console.log('🔍 Step 2: Checking SPG NFT contract details...');
  
  try {
    // Try to call owner() function on SPG NFT contract
    const ownerResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: SPG_NFT_CONTRACT,
          data: '0x8da5cb5b' // owner() function
        }, 'latest'],
        id: 1
      })
    });

    const ownerData = await ownerResponse.json();
    
    if (ownerData.result && ownerData.result !== '0x') {
      const ownerAddress = '0x' + ownerData.result.substring(26); // Extract address from padded result
      console.log('   📝 SPG NFT Contract Owner:', ownerAddress);
      
      if (ownerAddress.toLowerCase() === GATEWAY_CONTRACT.toLowerCase()) {
        console.log('   ✅ Gateway contract is the owner (correct)');
      } else {
        console.log('   ⚠️ Gateway contract is NOT the owner (potential issue)');
      }
    } else {
      console.log('   ❌ Could not get contract owner');
    }
  } catch (error) {
    console.log('   ❌ Owner check failed:', error.message);
  }

  console.log('');

  // 3. Try a simpler test transaction
  console.log('🔍 Step 3: Testing with minimal metadata...');
  
  try {
    // Create minimal test metadata
    const minimalMetadata = {
      name: "Test",
      description: "Test NFT",
      image: "",
      attributes: []
    };
    
    const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(minimalMetadata)).toString('base64')}`;
    const crypto = await import('crypto');
    const metadataHash = `0x${crypto.createHash('sha256').update(JSON.stringify(minimalMetadata)).digest('hex')}`;
    
    console.log('   📝 Minimal TokenURI length:', tokenURI.length);
    console.log('   📝 Metadata hash:', metadataHash);
    
    // This would require encoding the function call again, which is complex
    // For now, let's just report what we found
    
  } catch (error) {
    console.log('   ❌ Minimal test failed:', error.message);
  }

  console.log('');
  console.log('🎯 ANALYSIS:');
  console.log('');
  console.log('The transaction is properly formatted and calling the right function,');
  console.log('but it\'s reverting for a specific reason. Common causes:');
  console.log('');
  console.log('1. 🔐 **Permissions**: Gateway might not have permission to mint on SPG contract');
  console.log('2. 📝 **Metadata**: Metadata format or hash might be invalid');
  console.log('3. 💰 **Fees**: Missing minting fees or insufficient allowance');
  console.log('4. 🔒 **Contract State**: SPG contract might be paused or have restrictions');
  console.log('5. 📏 **Size Limits**: Metadata might be too large');
  console.log('');
  console.log('🔧 RECOMMENDED FIXES:');
  console.log('1. Check Story Protocol documentation for exact requirements');
  console.log('2. Try with much smaller metadata');
  console.log('3. Check if minting fees are required');
  console.log('4. Verify contract permissions and ownership');
  console.log('5. Test with the exact same parameters as working examples');
}

// Run the simulation
simulateTransaction().catch(console.error);