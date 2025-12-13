import { NextRequest, NextResponse } from 'next/server';

// CORS and Security Headers
function addCorsHeaders(response: NextResponse) {
  // CORS Headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Version, X-Client-Platform');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  
  return response;
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { type, commercial, derivatives, royaltyPercentage } = body;
    
    if (!type || typeof commercial !== 'boolean' || typeof derivatives !== 'boolean') {
      const response = NextResponse.json(
        { error: 'Missing required fields: type, commercial, derivatives' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Generate license configuration
    const licenseConfig = {
      type,
      commercial,
      derivatives,
      attribution: body.attribution !== false, // Default to true
      royaltyPercentage: royaltyPercentage || 0,
      shareAlike: body.shareAlike || false,
      
      // Story Protocol specific fields
      storyProtocol: {
        licenseTemplate: type === 'Creative Commons' ? 'CC-BY-SA' : 'CUSTOM',
        commercialUse: commercial,
        derivativeWorks: derivatives,
        royaltyPolicy: royaltyPercentage > 0 ? 'PERCENTAGE' : 'NONE',
        royaltyRate: royaltyPercentage || 0
      },
      
      // Generated license terms
      terms: generateLicenseTerms(type, commercial, derivatives, royaltyPercentage),
      
      // IPFS metadata
      ipfsMetadata: {
        name: `${type} License`,
        description: `Dance IP license with ${royaltyPercentage}% royalty`,
        attributes: [
          { trait_type: 'License Type', value: type },
          { trait_type: 'Commercial Use', value: commercial ? 'Allowed' : 'Not Allowed' },
          { trait_type: 'Derivatives', value: derivatives ? 'Allowed' : 'Not Allowed' },
          { trait_type: 'Royalty Rate', value: `${royaltyPercentage}%` }
        ]
      }
    };

    // Mock IPFS upload
    const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    
    const response = {
      success: true,
      licenseId: `license_${Date.now()}`,
      ipfsHash: mockIpfsHash,
      licenseConfig,
      storyProtocolParams: licenseConfig.storyProtocol,
      createdAt: new Date().toISOString()
    };

    const jsonResponse = NextResponse.json(response);
    return addCorsHeaders(jsonResponse);
    
  } catch (error) {
    console.error('License remixer error:', error);
    const response = NextResponse.json(
      { error: 'Failed to create license configuration' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

function generateLicenseTerms(type: string, commercial: boolean, derivatives: boolean, royalty: number) {
  const terms = [];
  
  terms.push(`This work is licensed under a ${type} license.`);
  
  if (commercial) {
    terms.push('Commercial use is permitted.');
    if (royalty > 0) {
      terms.push(`A royalty of ${royalty}% must be paid to the original creator for commercial use.`);
    }
  } else {
    terms.push('Commercial use is not permitted.');
  }
  
  if (derivatives) {
    terms.push('Derivative works are permitted.');
  } else {
    terms.push('No derivative works are permitted.');
  }
  
  terms.push('Attribution to the original creator is required.');
  
  return terms;
}

export async function GET() {
  const response = NextResponse.json({
    endpoint: 'license-remixer',
    status: 'active',
    description: 'Creates and configures IP licenses for dance NFTs',
    methods: ['POST'],
    supportedLicenseTypes: ['Creative Commons', 'Custom', 'Exclusive']
  });
  return addCorsHeaders(response);
}