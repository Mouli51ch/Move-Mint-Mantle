import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock license templates for development
    const licenseTemplates = [
      {
        id: 'cc-by-sa',
        name: 'Creative Commons BY-SA',
        description: 'Allows others to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator.',
        type: 'Creative Commons',
        commercial: true,
        derivatives: true,
        attribution: true,
        shareAlike: true,
        royaltyPercentage: 0,
        
        features: [
          'Commercial use allowed',
          'Derivatives allowed',
          'Attribution required',
          'Share-alike required'
        ],
        
        storyProtocol: {
          licenseTemplate: 'CC-BY-SA',
          commercialUse: true,
          derivativeWorks: true,
          royaltyPolicy: 'NONE'
        },
        
        popular: true,
        recommended: false
      },
      
      {
        id: 'cc-by-nc',
        name: 'Creative Commons BY-NC',
        description: 'Allows others to download, share and build upon your work, but they cannot use it commercially and any new works must credit you.',
        type: 'Creative Commons',
        commercial: false,
        derivatives: true,
        attribution: true,
        shareAlike: false,
        royaltyPercentage: 0,
        
        features: [
          'Non-commercial use only',
          'Derivatives allowed',
          'Attribution required',
          'No share-alike requirement'
        ],
        
        storyProtocol: {
          licenseTemplate: 'CC-BY-NC',
          commercialUse: false,
          derivativeWorks: true,
          royaltyPolicy: 'NONE'
        },
        
        popular: true,
        recommended: true
      },
      
      {
        id: 'commercial-royalty',
        name: 'Commercial with Royalty',
        description: 'Allows commercial use and derivatives with a percentage royalty paid to the original creator.',
        type: 'Commercial',
        commercial: true,
        derivatives: true,
        attribution: true,
        shareAlike: false,
        royaltyPercentage: 5.0,
        
        features: [
          'Commercial use allowed',
          'Derivatives allowed',
          'Attribution required',
          '5% royalty on commercial use'
        ],
        
        storyProtocol: {
          licenseTemplate: 'COMMERCIAL_ROYALTY',
          commercialUse: true,
          derivativeWorks: true,
          royaltyPolicy: 'PERCENTAGE',
          royaltyRate: 5.0
        },
        
        popular: false,
        recommended: true
      },
      
      {
        id: 'exclusive-rights',
        name: 'Exclusive Rights',
        description: 'Full exclusive rights reserved. No commercial use, derivatives, or redistribution without explicit permission.',
        type: 'Exclusive',
        commercial: false,
        derivatives: false,
        attribution: true,
        shareAlike: false,
        royaltyPercentage: 0,
        
        features: [
          'No commercial use',
          'No derivatives',
          'Attribution required',
          'All rights reserved'
        ],
        
        storyProtocol: {
          licenseTemplate: 'EXCLUSIVE',
          commercialUse: false,
          derivativeWorks: false,
          royaltyPolicy: 'NONE'
        },
        
        popular: false,
        recommended: false
      },
      
      {
        id: 'custom-royalty-high',
        name: 'High Royalty Commercial',
        description: 'Commercial use allowed with higher royalty percentage for premium content.',
        type: 'Commercial',
        commercial: true,
        derivatives: true,
        attribution: true,
        shareAlike: false,
        royaltyPercentage: 15.0,
        
        features: [
          'Commercial use allowed',
          'Derivatives allowed',
          'Attribution required',
          '15% royalty on commercial use'
        ],
        
        storyProtocol: {
          licenseTemplate: 'COMMERCIAL_ROYALTY',
          commercialUse: true,
          derivativeWorks: true,
          royaltyPolicy: 'PERCENTAGE',
          royaltyRate: 15.0
        },
        
        popular: false,
        recommended: false
      },
      
      {
        id: 'dance-education',
        name: 'Dance Education License',
        description: 'Specifically designed for educational use of dance content with limited commercial applications.',
        type: 'Educational',
        commercial: false,
        derivatives: true,
        attribution: true,
        shareAlike: true,
        royaltyPercentage: 0,
        
        features: [
          'Educational use only',
          'Derivatives for education allowed',
          'Attribution required',
          'Share educational derivatives'
        ],
        
        storyProtocol: {
          licenseTemplate: 'EDUCATIONAL',
          commercialUse: false,
          derivativeWorks: true,
          royaltyPolicy: 'NONE'
        },
        
        popular: true,
        recommended: true
      }
    ];

    // Return templates array directly (expected by client)
    return NextResponse.json(licenseTemplates);
    
  } catch (error) {
    console.error('License templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license templates' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed. Use GET to retrieve license templates.'
  }, { status: 405 });
}