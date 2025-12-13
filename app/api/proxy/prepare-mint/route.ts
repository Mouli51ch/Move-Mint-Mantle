import { NextRequest, NextResponse } from 'next/server';

const SURREAL_BASE_URL = process.env.SURREAL_BASE_API_URL || 'https://surreal-base.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${SURREAL_BASE_URL}/api/prepare-mint`;

    console.log('🔄 [Proxy] Forwarding prepare-mint request to:', url);
    console.log('📦 [Proxy] Request body keys:', Object.keys(body));
    console.log('📦 [Proxy] Full request body:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoveMint-Frontend/1.0',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        console.error('❌ [Proxy] Surreal Base error:', response.status, errorText);
        
        // Try to parse as JSON to get more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ [Proxy] Parsed error:', errorJson);
        } catch (parseError) {
          console.error('❌ [Proxy] Raw error text:', errorText);
        }
      } catch (textError) {
        console.error('❌ [Proxy] Could not read error response:', textError);
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ [Proxy] prepare-mint request successful');
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ [Proxy] prepare-mint request failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Proxy request failed',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}