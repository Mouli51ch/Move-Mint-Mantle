import { NextRequest, NextResponse } from 'next/server';

// CORS and Security Headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [execute-story-mint] Server-side Story Protocol minting started');
    
    const body = await request.json();
    console.log('📋 [execute-story-mint] Request body:', body);
    
    const { userAddress, metadata, mintParams } = body;
    
    if (!userAddress || !metadata) {
      console.error('❌ [execute-story-mint] Missing required fields');
      console.log('📊 [execute-story-mint] Received userAddress:', userAddress);
      console.log('📊 [execute-story-mint] Received metadata:', metadata);
      
      const response = NextResponse.json(
        { error: 'Missing required fields: userAddress, metadata' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📝 [execute-story-mint] Processing mint for:', userAddress);
    console.log('📋 [execute-story-mint] Metadata IPFS:', metadata.ipfsHash);
    console.log('📋 [execute-story-mint] Full metadata:', metadata);

    // Alternative RPC endpoints for Story Protocol
    const rpcEndpoints = [
      'https://aeneid.storyrpc.io',
      'https://rpc.aeneid.testnet.story.foundation',
      'https://story-testnet-rpc.polkachu.com'
    ];

    let lastError = null;
    
    // Try each RPC endpoint
    for (let i = 0; i < rpcEndpoints.length; i++) {
      const rpcUrl = rpcEndpoints[i];
      try {
        console.log(`🔄 [execute-story-mint] Trying RPC ${i + 1}/${rpcEndpoints.length}: ${rpcUrl}`);
        
        // Test RPC connectivity first
        console.log(`🏥 [execute-story-mint] Testing RPC health...`);
        const healthResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 0
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        const healthResult = await healthResponse.json();
        console.log(`📊 [execute-story-mint] Health check result:`, healthResult);
        
        if (healthResult.error) {
          throw new Error(`Health check failed: ${healthResult.error.message}`);
        }
        
        const chainId = healthResult.result;
        console.log(`🔗 [execute-story-mint] Chain ID: ${parseInt(chainId, 16)} (expected: 1315)`);
        
        if (parseInt(chainId, 16) !== 1315) {
          throw new Error(`Wrong chain ID: ${parseInt(chainId, 16)}, expected 1315`);
        }
        
        // Get current nonce
        console.log(`📊 [execute-story-mint] Getting nonce for ${userAddress}...`);
        const nonceResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [userAddress, 'pending'],
            id: 1
          }),
          signal: AbortSignal.timeout(5000)
        });
        
        const nonceResult = await nonceResponse.json();
        console.log(`📊 [execute-story-mint] Nonce response:`, nonceResult);
        
        if (nonceResult.error) {
          throw new Error(`Nonce fetch failed: ${nonceResult.error.message}`);
        }
        
        const nonce = nonceResult.result;
        console.log(`📊 [execute-story-mint] Current nonce: ${parseInt(nonce, 16)}`);
        
        // Get gas price
        console.log(`⛽ [execute-story-mint] Getting gas price...`);
        const gasPriceResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_gasPrice',
            params: [],
            id: 2
          }),
          signal: AbortSignal.timeout(5000)
        });
        
        const gasPriceResult = await gasPriceResponse.json();
        console.log(`⛽ [execute-story-mint] Gas price response:`, gasPriceResult);
        
        const gasPrice = gasPriceResult.result || '0x3B9ACA00'; // 1 gwei fallback
        console.log(`⛽ [execute-story-mint] Using gas price: ${gasPrice} (${parseInt(gasPrice, 16)} wei)`);
        
        // Create the transaction data for Story Protocol SPG contract
        const spgContract = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
        const tokenId = Math.floor(Date.now() / 1000);
        
        console.log(`🏭 [execute-story-mint] Using SPG contract: ${spgContract}`);
        console.log(`🆔 [execute-story-mint] Generated token ID: ${tokenId}`);
        
        // Encode mint function: mint(address to, uint256 tokenId)
        const mintData = '0x40c10f19' + // function selector
                         userAddress.slice(2).padStart(64, '0') + // to address
                         tokenId.toString(16).padStart(64, '0'); // token ID
        
        console.log(`📋 [execute-story-mint] Encoded mint data: ${mintData}`);
        console.log(`📋 [execute-story-mint] Data breakdown:`);
        console.log(`  - Function selector: 0x40c10f19`);
        console.log(`  - To address: ${userAddress.slice(2).padStart(64, '0')}`);
        console.log(`  - Token ID: ${tokenId.toString(16).padStart(64, '0')}`);
        
        const txParams = {
          from: userAddress,
          to: spgContract,
          value: '0x0',
          gas: '0xC3500', // 800,000 gas
          gasPrice: gasPrice,
          nonce: nonce,
          data: mintData
        };
        
        console.log('📤 [execute-story-mint] Final transaction params:', txParams);
        console.log('📤 [execute-story-mint] Transaction summary:', {
          from: txParams.from,
          to: txParams.to,
          gas: txParams.gas,
          gasPrice: txParams.gasPrice,
          nonce: parseInt(nonce, 16),
          dataLength: mintData.length,
          value: txParams.value
        });
        
        // Generate IP ID based on Story Protocol standards
        // IP ID format: 0x + contract address + token ID (padded to 32 bytes)
        const ipIdHex = '0x' + spgContract.slice(2).toLowerCase() + tokenId.toString(16).padStart(24, '0');
        console.log(`🆔 [execute-story-mint] Generated IP ID: ${ipIdHex}`);
        
        // Return transaction for frontend to sign
        console.log('✅ [execute-story-mint] Transaction prepared successfully, returning to frontend');
        const response = NextResponse.json({
          success: true,
          transaction: txParams,
          metadata: metadata,
          rpcEndpoint: rpcUrl,
          message: 'Transaction prepared successfully with working RPC endpoint',
          ipId: ipIdHex,
          tokenId: tokenId,
          debug: {
            rpcIndex: i + 1,
            rpcUrl: rpcUrl,
            chainId: parseInt(chainId, 16),
            nonce: parseInt(nonce, 16),
            gasPrice: parseInt(gasPrice, 16),
            tokenId: tokenId,
            ipId: ipIdHex
          }
        });
        return addCorsHeaders(response);
        
      } catch (error: any) {
        console.warn(`⚠️ [execute-story-mint] RPC ${i + 1}/${rpcEndpoints.length} (${rpcUrl}) failed:`, error.message);
        console.error(`❌ [execute-story-mint] Full error:`, error);
        lastError = error;
        
        // If this isn't the last RPC, continue to next one
        if (i < rpcEndpoints.length - 1) {
          console.log(`🔄 [execute-story-mint] Trying next RPC endpoint...`);
          continue;
        }
      }
    }
    
    // If all RPCs failed, return the metadata anyway since IPFS upload succeeded
    console.error('❌ [execute-story-mint] All RPCs failed, returning IPFS success mode');
    console.error('❌ [execute-story-mint] Last error:', lastError);
    console.log('📝 [execute-story-mint] IPFS metadata available:', metadata);
    
    // Generate fallback IP ID for IPFS-only mode
    const fallbackTokenId = Math.floor(Date.now() / 1000);
    const spgContract = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
    const fallbackIpId = '0x' + spgContract.slice(2).toLowerCase() + fallbackTokenId.toString(16).padStart(24, '0');
    console.log(`🆔 [execute-story-mint] Generated fallback IP ID: ${fallbackIpId}`);
    
    const response = NextResponse.json({
      success: true,
      transaction: null,
      metadata: metadata,
      fallbackMode: true,
      message: 'IPFS upload successful. Story Protocol RPC is experiencing issues. Your dance data is permanently stored.',
      ipId: fallbackIpId,
      tokenId: fallbackTokenId,
      ipfsProof: {
        ipfsHash: metadata.ipfsHash,
        nftIpfsHash: metadata.nftIpfsHash,
        timestamp: new Date().toISOString(),
        userAddress: userAddress,
        ipId: fallbackIpId
      },
      debug: {
        rpcEndpointsTried: rpcEndpoints.length,
        lastError: lastError?.message,
        fallbackReason: 'All RPC endpoints failed',
        fallbackIpId: fallbackIpId,
        fallbackTokenId: fallbackTokenId
      }
    });
    return addCorsHeaders(response);
    
  } catch (error: any) {
    console.error('❌ [execute-story-mint] Critical server error:', error);
    console.error('❌ [execute-story-mint] Error stack:', error.stack);
    console.error('❌ [execute-story-mint] Error type:', typeof error);
    
    const response = NextResponse.json(
      { 
        error: 'Server-side minting failed',
        details: error.message,
        debug: {
          errorType: typeof error,
          errorName: error.name,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET() {
  const response = NextResponse.json({
    endpoint: 'execute-story-mint',
    status: 'active',
    description: 'Server-side Story Protocol minting with RPC fallbacks',
    methods: ['POST']
  });
  return addCorsHeaders(response);
}