import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Mock NFT collection data
    const mockAssets = [
      {
        id: 'nft_001',
        tokenId: '1',
        title: 'Epic Hip-Hop Routine',
        description: 'High-energy urban dance with complex choreography',
        danceStyle: 'Hip-Hop',
        choreographer: 'Alex Chen',
        difficulty: 'Advanced',
        duration: '2:30',
        thumbnailUrl: '/api/placeholder/300/200',
        videoUrl: '/api/placeholder/video/dance1.mp4',
        mintedAt: '2024-01-15T10:30:00Z',
        owner: walletAddress || '0x1234...5678',
        
        analysisResults: {
          totalMoves: 45,
          uniqueSequences: 12,
          confidenceScore: 0.92,
          complexity: 'High'
        },
        
        license: {
          type: 'Creative Commons',
          commercial: true,
          derivatives: true,
          royaltyPercentage: 5.0
        },
        
        blockchain: {
          network: 'Story Protocol Testnet',
          contractAddress: '0xabcd...efgh',
          tokenStandard: 'ERC-721',
          ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        },
        
        stats: {
          views: 1250,
          likes: 89,
          remixes: 3,
          earnings: '0.15 ETH'
        }
      },
      
      {
        id: 'nft_002',
        tokenId: '2',
        title: 'Graceful Ballet Sequence',
        description: 'Classical ballet with modern interpretations',
        danceStyle: 'Ballet',
        choreographer: 'Maria Rodriguez',
        difficulty: 'Intermediate',
        duration: '3:15',
        thumbnailUrl: '/api/placeholder/300/200',
        videoUrl: '/api/placeholder/video/dance2.mp4',
        mintedAt: '2024-01-12T14:20:00Z',
        owner: walletAddress || '0x1234...5678',
        
        analysisResults: {
          totalMoves: 32,
          uniqueSequences: 8,
          confidenceScore: 0.88,
          complexity: 'Medium'
        },
        
        license: {
          type: 'Exclusive',
          commercial: false,
          derivatives: false,
          royaltyPercentage: 0
        },
        
        blockchain: {
          network: 'Story Protocol Testnet',
          contractAddress: '0xabcd...efgh',
          tokenStandard: 'ERC-721',
          ipfsHash: 'QmPwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH'
        },
        
        stats: {
          views: 890,
          likes: 67,
          remixes: 0,
          earnings: '0.08 ETH'
        }
      },
      
      {
        id: 'nft_003',
        tokenId: '3',
        title: 'Breakdance Power Moves',
        description: 'Explosive breakdancing with signature power moves',
        danceStyle: 'Breakdance',
        choreographer: 'DJ Spin',
        difficulty: 'Expert',
        duration: '1:45',
        thumbnailUrl: '/api/placeholder/300/200',
        videoUrl: '/api/placeholder/video/dance3.mp4',
        mintedAt: '2024-01-10T09:15:00Z',
        owner: walletAddress || '0x1234...5678',
        
        analysisResults: {
          totalMoves: 28,
          uniqueSequences: 15,
          confidenceScore: 0.95,
          complexity: 'Very High'
        },
        
        license: {
          type: 'Creative Commons',
          commercial: true,
          derivatives: true,
          royaltyPercentage: 10.0
        },
        
        blockchain: {
          network: 'Story Protocol Testnet',
          contractAddress: '0xabcd...efgh',
          tokenStandard: 'ERC-721',
          ipfsHash: 'QmRwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI'
        },
        
        stats: {
          views: 2100,
          likes: 156,
          remixes: 7,
          earnings: '0.32 ETH'
        }
      }
    ];
    
    // Apply pagination
    const paginatedAssets = mockAssets.slice(offset, offset + limit);
    
    const response = {
      success: true,
      assets: paginatedAssets,
      pagination: {
        total: mockAssets.length,
        limit,
        offset,
        hasMore: offset + limit < mockAssets.length
      },
      summary: {
        totalAssets: mockAssets.length,
        totalEarnings: '0.55 ETH',
        totalViews: mockAssets.reduce((sum, asset) => sum + asset.stats.views, 0),
        totalLikes: mockAssets.reduce((sum, asset) => sum + asset.stats.likes, 0)
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Get assets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed. Use GET to retrieve assets.'
  }, { status: 405 });
}