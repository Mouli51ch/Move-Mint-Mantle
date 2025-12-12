import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { type, commercial, derivatives, royaltyPercentage } = body;
    
    if (!type || typeof commercial !== 'boolean' || typeof derivatives !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: type, commercial, derivatives' },
        { status: 400 }
      );
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

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('License remixer error:', error);
    return NextResponse.json(
      { error: 'Failed to create license configuration' },
      { status: 500 }
    );
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
  return NextResponse.json({
    endpoint: 'license-remixer',
    status: 'active',
    description: 'Creates and configures IP licenses for dance NFTs',
    methods: ['POST'],
    supportedLicenseTypes: ['Creative Commons', 'Custom', 'Exclusive']
  });
}