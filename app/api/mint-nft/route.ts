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
    console.log('🎯 [mint-nft] Processing NFT minting request');
    
    const body = await request.json();
    const { userAddress, title, description, danceStyle, choreographer, duration, analysisResults } = body;
    
    // Validate required fields
    if (!userAddress || !title || !danceStyle) {
      const response = NextResponse.json(
        { error: 'Missing required fields: userAddress, title, danceStyle' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📝 [mint-nft] Creating NFT metadata');
    
    // Create metadata for IPFS
    const metadata = {
      name: title,
      description: description || `A ${danceStyle} dance performance`,
      attributes: [
        { trait_type: "Dance Style", value: danceStyle },
        { trait_type: "Choreographer", value: choreographer || "Unknown" },
        { trait_type: "Duration", value: duration || "0:00" },
        { trait_type: "Platform", value: "MoveMint" },
        { trait_type: "Total Moves", value: analysisResults?.totalMoves || 0 },
        { trait_type: "Unique Sequences", value: analysisResults?.uniqueSequences || 0 },
        { trait_type: "Confidence Score", value: analysisResults?.confidenceScore || 0 },
        { trait_type: "Complexity", value: analysisResults?.complexity || "Beginner" }
      ],
      external_url: "https://movemint.app",
      animation_url: "", // Could be added later for video content
      created_at: new Date().toISOString(),
      creator: userAddress,
      dance_data: {
        style: danceStyle,
        choreographer: choreographer || "Unknown",
        duration: duration || "0:00",
        analysis: analysisResults || {
          totalMoves: 0,
          uniqueSequences: 0,
          confidenceScore: 0,
          complexity: "Beginner"
        },
        platform: "MoveMint",
        version: "1.0"
      }
    };

    // Generate a mock IPFS hash for now (in production, upload to actual IPFS)
    const metadataString = JSON.stringify(metadata, null, 2);
    const mockIpfsHash = `Qm${Buffer.from(metadataString).toString('hex').slice(0, 44)}`;
    
    // Add the IPFS hash to metadata
    const finalMetadata = {
      ...metadata,
      ipfsHash: mockIpfsHash
    };

    // For now, we'll return the metadata and let the frontend handle IPFS upload
    // In a production setup, you might want to upload to IPFS here
    console.log('✅ [mint-nft] Metadata prepared successfully');
    
    const response = NextResponse.json({
      success: true,
      metadata: finalMetadata,
      contractAddress: process.env.NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS || '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073',
      chainId: 5003,
      message: 'Metadata prepared for Mantle NFT minting'
    });
    
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ [mint-nft] Error:', error);
    const response = NextResponse.json(
      { error: 'Failed to prepare NFT metadata' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET() {
  const response = NextResponse.json({
    endpoint: 'mint-nft',
    status: 'active',
    description: 'Prepares dance metadata for NFT minting on Mantle',
    methods: ['POST'],
    contract: process.env.NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS || '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073',
    network: 'Mantle Sepolia Testnet'
  });
  return addCorsHeaders(response);
}