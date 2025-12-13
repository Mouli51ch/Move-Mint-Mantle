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
    console.log('📝 [prepare-mint] Processing minting request');
    
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

    console.log('🔄 [prepare-mint] Creating Universal Minting Engine format');
    
    // Create simplified Universal Minting Engine format
    const universalMintData = {
      userAddress,
      ipMetadata: {
        title,
        description: description || `A ${danceStyle} dance performance`,
        creators: [{
          name: choreographer || "Dance Creator",
          address: userAddress,
          contributionPercent: 100
        }],
        createdAt: new Date().toISOString(),
        // Store dance data as JSON in metadata
        danceData: {
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
      },
      nftMetadata: {
        name: title,
        description: description || `A ${danceStyle} dance performance`,
        attributes: [
          { key: "Dance Style", value: danceStyle },
          { key: "Choreographer", value: choreographer || "Unknown" },
          { key: "Duration", value: duration || "0:00" },
          { key: "Platform", value: "MoveMint" }
        ]
      }
    };

    console.log('🚀 [prepare-mint] Sending to Surreal Base');
    
    // Forward to Surreal Base
    const surrealBaseUrl = process.env.SURREAL_BASE_API_URL || 'https://surreal-base.vercel.app';
    const surrealResponse = await fetch(`${surrealBaseUrl}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoveMint-MVP/1.0',
      },
      body: JSON.stringify(universalMintData),
    });
    
    const surrealResult = await surrealResponse.json();
    
    if (!surrealResponse.ok) {
      console.error('❌ [prepare-mint] Surreal Base error:', surrealResult);
      const response = NextResponse.json(surrealResult, { status: surrealResponse.status });
      return addCorsHeaders(response);
    }
    
    // Check if transaction data is properly encoded
    if (surrealResult.success && surrealResult.transaction) {
      if (!surrealResult.transaction.data || surrealResult.transaction.data === '0x') {
        console.warn('⚠️ [prepare-mint] Surreal Base returned empty transaction data');
        
        // Return error with helpful message
        const response = NextResponse.json({
          success: false,
          error: {
            code: 'TRANSACTION_ENCODING_FAILED',
            message: 'Transaction encoding failed on Surreal Base. This is a known issue with the Story SDK gas estimation.',
            details: {
              surrealBaseResponse: surrealResult,
              suggestion: 'The metadata was uploaded to IPFS successfully, but transaction encoding failed. You may need to use the Surreal Base demo page directly.',
              surrealBaseDemoUrl: 'https://surreal-base.vercel.app/demo'
            },
            retryable: true
          }
        }, { status: 500 });
        return addCorsHeaders(response);
      }
    }
    
    console.log('✅ [prepare-mint] Success - transaction prepared');
    const response = NextResponse.json(surrealResult);
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ [prepare-mint] Error:', error);
    const response = NextResponse.json(
      { error: 'Failed to prepare mint transaction' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET() {
  const response = NextResponse.json({
    endpoint: 'prepare-mint',
    status: 'active',
    description: 'Prepares dance metadata for NFT minting via Surreal Base',
    methods: ['POST']
  });
  return addCorsHeaders(response);
}