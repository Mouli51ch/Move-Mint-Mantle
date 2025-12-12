/**
 * Mock API responses for development and testing
 * Provides realistic data for Universal Minting Engine API endpoints
 */

import { 
  VideoUploadResponse, 
  DanceAnalysisResults, 
  LicenseDocument, 
  MintTransactionResponse,
  NFTCollectionResponse,
  APIHealthResponse 
} from '@/lib/types/api';

/**
 * Mock video upload response
 */
export const mockVideoUploadResponse: VideoUploadResponse = {
  success: true,
  videoId: 'video_12345',
  message: 'Video uploaded successfully',
  estimatedProcessingTime: 45000, // 45 seconds
  uploadUrl: 'https://api.universalmintingengine.com/uploads/video_12345',
  thumbnailUrl: 'https://api.universalmintingengine.com/thumbnails/video_12345.jpg',
  processingStatus: 'queued',
};

/**
 * Mock dance analysis results
 */
export const mockAnalysisResults: DanceAnalysisResults = {
  videoId: 'video_12345',
  duration: 120, // 2 minutes
  detectedMovements: [
    {
      id: 'movement_1',
      name: 'Plié',
      danceStyle: 'ballet',
      difficulty: 'Beginner',
      confidence: 0.92,
      timestamp: 5000,
      duration: 3000,
      bodyParts: ['Legs', 'Core'],
      technique: 'Bent knee position with turnout',
      description: 'Beginner level Plié from Ballet dance style',
    },
    {
      id: 'movement_2',
      name: 'Pirouette',
      danceStyle: 'ballet',
      difficulty: 'Intermediate',
      confidence: 0.87,
      timestamp: 15000,
      duration: 2000,
      bodyParts: ['Legs', 'Core', 'Arms'],
      technique: 'Controlled spinning turn with proper spotting',
      description: 'Intermediate level Pirouette from Ballet dance style',
    },
    {
      id: 'movement_3',
      name: 'Jazz Square',
      danceStyle: 'jazz',
      difficulty: 'Beginner',
      confidence: 0.89,
      timestamp: 25000,
      duration: 4000,
      bodyParts: ['Legs', 'Arms'],
      technique: 'Four-step pattern with sharp movements',
      description: 'Beginner level Jazz Square from Jazz dance style',
    },
  ],
  qualityMetrics: {
    overall: 85,
    technique: 82,
    timing: 88,
    expression: 87,
    clarity: 83,
  },
  poseData: [
    {
      timestamp: 1000,
      keypoints: [
        { x: 100, y: 200, confidence: 0.9, name: 'nose' },
        { x: 95, y: 180, confidence: 0.85, name: 'left_eye' },
        { x: 105, y: 180, confidence: 0.87, name: 'right_eye' },
        // ... more keypoints
      ],
      confidence: 0.88,
    },
    // ... more pose frames
  ],
  primaryStyle: 'ballet',
  styleDistribution: [
    {
      style: 'ballet',
      displayName: 'Ballet',
      count: 2,
      percentage: 66.7,
      averageDifficulty: 'Intermediate',
    },
    {
      style: 'jazz',
      displayName: 'Jazz',
      count: 1,
      percentage: 33.3,
      averageDifficulty: 'Beginner',
    },
  ],
  movementsByStyle: {
    ballet: [
      {
        id: 'movement_1',
        name: 'Plié',
        danceStyle: 'ballet',
        difficulty: 'Beginner',
        confidence: 0.92,
        timestamp: 5000,
        duration: 3000,
        bodyParts: ['Legs', 'Core'],
        technique: 'Bent knee position with turnout',
        description: 'Beginner level Plié from Ballet dance style',
      },
      {
        id: 'movement_2',
        name: 'Pirouette',
        danceStyle: 'ballet',
        difficulty: 'Intermediate',
        confidence: 0.87,
        timestamp: 15000,
        duration: 2000,
        bodyParts: ['Legs', 'Core', 'Arms'],
        technique: 'Controlled spinning turn with proper spotting',
        description: 'Intermediate level Pirouette from Ballet dance style',
      },
    ],
    jazz: [
      {
        id: 'movement_3',
        name: 'Jazz Square',
        danceStyle: 'jazz',
        difficulty: 'Beginner',
        confidence: 0.89,
        timestamp: 25000,
        duration: 4000,
        bodyParts: ['Legs', 'Arms'],
        technique: 'Four-step pattern with sharp movements',
        description: 'Beginner level Jazz Square from Jazz dance style',
      },
    ],
  },
  danceMetrics: {
    totalMovements: 3,
    uniqueStyles: 2,
    averageDifficulty: 'Beginner',
    technicalComplexity: 0.65,
    artisticExpression: 0.78,
  },
  recommendations: [
    'Great Ballet technique! Consider exploring Arabesque and Grand Jeté.',
    'Try incorporating more complex movements to challenge yourself.',
    'Great style diversity! Your versatility really shows.',
  ],
};

/**
 * Mock license document
 */
export const mockLicenseDocument: LicenseDocument = {
  id: 'license_12345',
  title: 'Creative Commons Attribution',
  content: 'This work is licensed under a Creative Commons Attribution 4.0 International License.',
  parameters: {
    attribution: true,
    commercialUse: true,
    derivatives: true,
    shareAlike: false,
  },
  ipfsHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  storyProtocolParams: {
    licenseTemplate: 'cc-by-4.0',
    licenseTerms: {
      attribution: true,
      commercialUse: true,
      derivatives: true,
    },
    royaltyPolicy: 'none',
    mintingFee: '0.05',
  },
};

/**
 * Mock mint transaction response
 */
export const mockMintTransactionResponse: MintTransactionResponse = {
  success: true,
  transactionId: 'tx_12345',
  transaction: {
    to: '0x1234567890123456789012345678901234567890',
    data: '0xabcdef...',
    value: '0',
    gasEstimate: '150000',
  },
  estimatedGasFee: '0.002 IP',
  nftMetadata: {
    name: 'My Dance NFT',
    description: 'A beautiful ballet performance',
    image: 'https://ipfs.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
    animation_url: 'https://ipfs.io/ipfs/QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy',
    attributes: [
      { trait_type: 'Duration', value: '2:00' },
      { trait_type: 'Primary Style', value: 'Ballet' },
      { trait_type: 'Difficulty Level', value: 'Intermediate' },
    ],
    external_url: 'https://movemint.app',
    danceStyle: ['ballet', 'jazz'],
    primaryDanceStyle: 'ballet',
    difficulty: 'Intermediate',
    technicalComplexity: 0.65,
    artisticExpression: 0.78,
    originalVideo: 'video_12345',
    licenseTerms: mockLicenseDocument,
  },
};

/**
 * Mock NFT collection response
 */
export const mockNFTCollectionResponse: NFTCollectionResponse = {
  success: true,
  nfts: [
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      title: 'Ballet Elegance',
      description: 'A graceful ballet performance showcasing classical technique',
      image: 'https://ipfs.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
      danceStyle: ['Ballet'],
      movements: 'Plié, Pirouette, Arabesque',
      created: '2025-01-10',
      views: 156,
      price: '2.5 IP',
      difficulty: 'Intermediate',
      duration: 120,
      attributes: [
        { trait_type: 'Duration', value: '2:00' },
        { trait_type: 'Primary Style', value: 'Ballet' },
        { trait_type: 'Difficulty Level', value: 'Intermediate' },
        { trait_type: 'Technical Complexity', value: 65, display_type: 'number' },
        { trait_type: 'Artistic Expression', value: 78, display_type: 'number' },
      ],
    },
    {
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '2',
      title: 'Hip Hop Flow',
      description: 'Urban dance moves with sharp isolations and rhythmic patterns',
      image: 'https://ipfs.io/ipfs/QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy',
      danceStyle: ['Hip Hop'],
      movements: 'Pop, Lock, Body Wave',
      created: '2025-01-09',
      views: 203,
      price: '1.8 IP',
      difficulty: 'Beginner',
      duration: 90,
      attributes: [
        { trait_type: 'Duration', value: '1:30' },
        { trait_type: 'Primary Style', value: 'Hip Hop' },
        { trait_type: 'Difficulty Level', value: 'Beginner' },
        { trait_type: 'Technical Complexity', value: 45, display_type: 'number' },
        { trait_type: 'Artistic Expression', value: 82, display_type: 'number' },
      ],
    },
  ],
  totalCount: 2,
  page: 1,
  pageSize: 10,
  hasMore: false,
};

/**
 * Mock API health response
 */
export const mockHealthResponse: APIHealthResponse = {
  status: 'healthy',
  timestamp: Date.now(),
  version: '1.0.0',
  services: {
    database: 'healthy',
    storage: 'healthy',
    blockchain: 'healthy',
    ai_processing: 'healthy',
  },
  uptime: 99.9,
  responseTime: 45,
};

/**
 * Mock error responses
 */
export const mockErrorResponses = {
  networkError: {
    name: 'NetworkError',
    message: 'Failed to fetch',
    code: 'NETWORK_ERROR',
  },
  validationError: {
    status: 400,
    message: 'Validation failed',
    errors: [
      { field: 'title', message: 'Title is required' },
      { field: 'video', message: 'Video file is too large' },
    ],
  },
  authError: {
    status: 401,
    message: 'Unauthorized',
    code: 'AUTH_ERROR',
  },
  rateLimitError: {
    status: 429,
    message: 'Too many requests',
    headers: { 'retry-after': '60' },
  },
  serverError: {
    status: 500,
    message: 'Internal server error',
    code: 'SERVER_ERROR',
  },
};

/**
 * Mock API delay simulation
 */
export function simulateNetworkDelay(min: number = 500, max: number = 2000): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Mock API response with random success/failure
 */
export function mockAPICall<T>(
  successResponse: T,
  failureRate: number = 0.1
): Promise<T> {
  return simulateNetworkDelay().then(() => {
    if (Math.random() < failureRate) {
      throw mockErrorResponses.serverError;
    }
    return successResponse;
  });
}