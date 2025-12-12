# MoveMint Frontend - Backend Integration Guide

## Overview

This document provides comprehensive guidance for integrating backend functionality with the MoveMint frontend application. MoveMint is a Next.js application that allows users to upload/record dance videos, analyze movements using AI, and mint them as NFTs on Story Protocol.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [User Flow & API Integration Points](#user-flow--api-integration-points)
4. [API Endpoints Specification](#api-endpoints-specification)
5. [Data Models](#data-models)
6. [File Upload & Processing](#file-upload--processing)
7. [AI/ML Integration](#aiml-integration)
8. [Story Protocol Integration](#story-protocol-integration)
9. [Authentication & Security](#authentication--security)
10. [Error Handling](#error-handling)
11. [Performance Considerations](#performance-considerations)
12. [Testing Strategy](#testing-strategy)

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Story Protocol │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   Blockchain    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Storage  │    │   Database      │    │   IPFS Storage  │
│   (AWS S3/CDN)  │    │   (PostgreSQL)  │    │   (Metadata)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AI/ML Service │    │   Analytics     │
│   (TensorFlow)  │    │   (Tracking)    │
└─────────────────┘    └─────────────────┘
```

## Tech Stack

### Frontend (Current)
- **Framework**: Next.js 16.0.10 with React 19.2.0
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **AI/ML**: TensorFlow.js 4.15.0 + MediaPipe Pose 0.5.x
- **State Management**: React Hooks + SessionStorage
- **Forms**: React Hook Form 7.60.0 + Zod validation
- **Analytics**: Vercel Analytics

### Backend (Recommended)
- **Runtime**: Node.js 18+ or Python 3.9+
- **Framework**: Express.js/Fastify or FastAPI/Django
- **Database**: PostgreSQL 14+ with Prisma/SQLAlchemy
- **File Storage**: AWS S3 or Google Cloud Storage
- **AI/ML**: TensorFlow/PyTorch for server-side processing
- **Blockchain**: Story Protocol SDK
- **Queue**: Redis + Bull/Celery for background jobs
- **Cache**: Redis for session/data caching

## User Flow & API Integration Points

### 1. Landing Page → Upload Flow
```
Landing Page → Upload Page → Results Page → Mint Page → Dashboard
     │              │             │            │           │
     │              │             │            │           │
     ▼              ▼             ▼            ▼           ▼
   Static      File Upload    AI Analysis   NFT Minting  Data Fetch
```

### 2. Key Integration Points

| Page | Current State | Backend Integration Needed |
|------|---------------|----------------------------|
| **Landing** | Static analytics | Real-time platform stats API |
| **Upload** | File selection only | File upload + validation API |
| **Record** | Client-side recording | Video processing + storage API |
| **Results** | Mock data display | AI analysis results API |
| **Mint** | Form submission only | NFT minting + Story Protocol API |
| **Dashboard** | Static mock data | User NFTs + analytics API |

## API Endpoints Specification

### Authentication Endpoints

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  walletAddress?: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
```

### Video Upload & Processing

```typescript
// POST /api/videos/upload
// Content-Type: multipart/form-data
interface VideoUploadRequest {
  video: File; // Max 100MB, formats: mp4, mov, avi
  title?: string;
  description?: string;
}

interface VideoUploadResponse {
  videoId: string;
  uploadUrl: string; // S3 presigned URL
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedProcessingTime: number; // seconds
}

// GET /api/videos/{videoId}/status
interface VideoStatusResponse {
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  results?: AnalysisResults;
  error?: string;
}

// POST /api/videos/analyze
interface AnalyzeVideoRequest {
  videoId: string;
  analysisType: 'pose' | 'movement' | 'full';
}
```

### AI Analysis Results

```typescript
// GET /api/analysis/{videoId}
interface AnalysisResults {
  videoId: string;
  duration: number; // seconds
  frameRate: number;
  totalFrames: number;
  poseData: {
    frames: PoseFrame[];
    confidence: number; // 0-100
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  movements: DetectedMovement[];
  metadata: {
    resolution: string;
    fileSize: number;
    processedAt: string;
    processingTime: number;
  };
}

interface PoseFrame {
  frameIndex: number;
  timestamp: number;
  keypoints: Keypoint[];
  confidence: number;
}

interface Keypoint {
  x: number;
  y: number;
  confidence: number;
  name: string; // 'nose', 'left_shoulder', etc.
}

interface DetectedMovement {
  name: string;
  type: 'ballet' | 'contemporary' | 'hip-hop' | 'jazz' | 'other';
  confidence: number;
  startFrame: number;
  endFrame: number;
  duration: number;
  repetitions: number;
  quality: number; // 0-100
}
```

### NFT Minting & Story Protocol

```typescript
// POST /api/nft/mint
interface MintNFTRequest {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  price?: number; // in IP tokens
  isPrivate: boolean;
  royaltyPercentage: number; // 0-10
}

interface MintNFTResponse {
  nftId: string;
  transactionHash: string;
  storyProtocolId: string;
  ipfsHash: string;
  mintingStatus: 'pending' | 'confirmed' | 'failed';
  estimatedConfirmationTime: number;
}

// GET /api/nft/{nftId}/status
interface NFTStatusResponse {
  nftId: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  error?: string;
}
```

### User Dashboard & Analytics

```typescript
// GET /api/user/dashboard
interface DashboardData {
  user: User;
  stats: {
    totalNFTs: number;
    totalViews: number;
    totalEarnings: number; // in IP tokens
    followers: number;
  };
  recentNFTs: NFT[];
  analytics: {
    viewsOverTime: TimeSeriesData[];
    earningsOverTime: TimeSeriesData[];
    topPerformingNFTs: NFT[];
  };
}

// GET /api/user/nfts
interface UserNFTsResponse {
  nfts: NFT[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// GET /api/platform/stats
interface PlatformStatsResponse {
  totalUsers: number;
  totalNFTs: number;
  totalMovesDetected: number;
  countriesUsing: number;
  platformRating: number;
  recentActivity: Activity[];
}
```

## Data Models

### Core Models

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  walletAddress?: string;
  profileImage?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalNFTs: number;
    totalViews: number;
    totalEarnings: number;
    followers: number;
    following: number;
  };
}

interface Video {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  duration: number;
  resolution: string;
  frameRate: number;
  uploadUrl: string;
  thumbnailUrl?: string;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface NFT {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  price?: number;
  isPrivate: boolean;
  royaltyPercentage: number;
  
  // Blockchain data
  tokenId: string;
  contractAddress: string;
  transactionHash: string;
  storyProtocolId: string;
  ipfsHash: string;
  
  // Analytics
  views: number;
  likes: number;
  shares: number;
  earnings: number;
  
  // Timestamps
  mintedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Analysis {
  id: string;
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: AnalysisResults;
  error?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## File Upload & Processing

### 1. Frontend Implementation

```typescript
// app/app/upload/page.tsx - Enhanced upload handler
const handleUpload = async (file: File) => {
  setIsLoading(true);
  
  try {
    // Step 1: Get upload URL
    const uploadResponse = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        filename: file.name,
        fileSize: file.size,
        contentType: file.type
      })
    });
    
    const { videoId, uploadUrl } = await uploadResponse.json();
    
    // Step 2: Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    // Step 3: Trigger analysis
    await fetch('/api/videos/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ videoId })
    });
    
    // Step 4: Redirect to results with polling
    router.push(`/app/results?videoId=${videoId}`);
    
  } catch (error) {
    console.error('Upload failed:', error);
    setError('Upload failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Backend Processing Pipeline

```typescript
// Backend processing flow
class VideoProcessor {
  async processVideo(videoId: string) {
    const video = await this.getVideo(videoId);
    
    try {
      // Update status
      await this.updateVideoStatus(videoId, 'processing');
      
      // Step 1: Download video from S3
      const videoBuffer = await this.downloadVideo(video.uploadUrl);
      
      // Step 2: Extract frames
      const frames = await this.extractFrames(videoBuffer);
      
      // Step 3: Run pose detection
      const poseData = await this.detectPoses(frames);
      
      // Step 4: Analyze movements
      const movements = await this.analyzeMovements(poseData);
      
      // Step 5: Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(videoBuffer);
      
      // Step 6: Save results
      await this.saveAnalysisResults(videoId, {
        poseData,
        movements,
        thumbnailUrl
      });
      
      await this.updateVideoStatus(videoId, 'analyzed');
      
    } catch (error) {
      await this.updateVideoStatus(videoId, 'failed');
      throw error;
    }
  }
}
```

## AI/ML Integration

### 1. Pose Detection Service

```typescript
// AI service for pose detection
class PoseDetectionService {
  private model: any;
  
  async initialize() {
    // Load TensorFlow model
    this.model = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );
  }
  
  async detectPoses(frames: ImageData[]): Promise<PoseFrame[]> {
    const results: PoseFrame[] = [];
    
    for (let i = 0; i < frames.length; i++) {
      const poses = await this.model.estimatePoses(frames[i]);
      
      if (poses.length > 0) {
        results.push({
          frameIndex: i,
          timestamp: i / 30, // Assuming 30 FPS
          keypoints: poses[0].keypoints,
          confidence: this.calculateConfidence(poses[0])
        });
      }
    }
    
    return results;
  }
  
  private calculateConfidence(pose: any): number {
    const validKeypoints = pose.keypoints.filter(kp => kp.score > 0.3);
    return (validKeypoints.length / pose.keypoints.length) * 100;
  }
}
```

### 2. Movement Analysis

```typescript
// Movement recognition service
class MovementAnalysisService {
  async analyzeMovements(poseData: PoseFrame[]): Promise<DetectedMovement[]> {
    const movements: DetectedMovement[] = [];
    
    // Analyze for different movement types
    movements.push(...await this.detectBalletMovements(poseData));
    movements.push(...await this.detectHipHopMovements(poseData));
    movements.push(...await this.detectContemporaryMovements(poseData));
    
    return movements.sort((a, b) => b.confidence - a.confidence);
  }
  
  private async detectBalletMovements(poseData: PoseFrame[]): Promise<DetectedMovement[]> {
    // Implement ballet-specific movement detection
    // Look for patterns like:
    // - Pirouettes (spinning motion)
    // - Grand jetés (jumping with leg extension)
    // - Arabesques (balance on one leg)
    // - Pliés (knee bending)
    
    return [];
  }
}
```

## Story Protocol Integration

### 1. NFT Minting Service

```typescript
// Story Protocol integration
class StoryProtocolService {
  private client: any;
  
  constructor(privateKey: string, rpcUrl: string) {
    this.client = new StoryProtocolClient({
      privateKey,
      rpcUrl
    });
  }
  
  async mintNFT(nftData: MintNFTRequest): Promise<MintNFTResponse> {
    try {
      // Step 1: Upload metadata to IPFS
      const metadata = {
        name: nftData.title,
        description: nftData.description,
        image: nftData.thumbnailUrl,
        animation_url: nftData.videoUrl,
        attributes: [
          { trait_type: "Duration", value: nftData.duration },
          { trait_type: "Movements", value: nftData.movements.join(", ") },
          { trait_type: "Quality", value: nftData.quality },
          ...nftData.tags.map(tag => ({ trait_type: "Tag", value: tag }))
        ]
      };
      
      const ipfsHash = await this.uploadToIPFS(metadata);
      
      // Step 2: Mint NFT on Story Protocol
      const mintResult = await this.client.nft.mint({
        to: nftData.userWalletAddress,
        tokenURI: `ipfs://${ipfsHash}`,
        royaltyPercentage: nftData.royaltyPercentage
      });
      
      // Step 3: Register IP on Story Protocol
      const ipResult = await this.client.ip.register({
        tokenId: mintResult.tokenId,
        ipMetadata: {
          title: nftData.title,
          description: nftData.description,
          ipType: "Dance Movement NFT"
        }
      });
      
      return {
        nftId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        storyProtocolId: ipResult.ipId,
        ipfsHash,
        mintingStatus: 'pending',
        estimatedConfirmationTime: 60
      };
      
    } catch (error) {
      throw new Error(`Minting failed: ${error.message}`);
    }
  }
  
  private async uploadToIPFS(metadata: any): Promise<string> {
    // Upload to IPFS via Pinata or similar service
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify(metadata)
    });
    
    const result = await response.json();
    return result.IpfsHash;
  }
}
```

## Authentication & Security

### 1. JWT Authentication

```typescript
// Authentication middleware
class AuthService {
  generateTokens(user: User) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return await this.getUserById(decoded.userId);
    } catch (error) {
      return null;
    }
  }
}

// Frontend auth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      fetchUser(storedToken);
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data;
  };
  
  return { user, token, login, logout };
}
```

### 2. File Upload Security

```typescript
// File validation
const validateVideoFile = (file: File): string | null => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
  
  if (file.size > maxSize) {
    return 'File size must be less than 100MB';
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Only MP4, MOV, and AVI files are allowed';
  }
  
  return null;
};

// Backend file validation
const multerConfig = multer({
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});
```

## Error Handling

### 1. Frontend Error Handling

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Something went wrong</h1>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// API error handling hook
function useApiError() {
  const [error, setError] = useState<string | null>(null);
  
  const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      setError('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      setError('Server error. Please try again later.');
    } else {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };
  
  return { error, handleApiError, clearError: () => setError(null) };
}
```

### 2. Backend Error Handling

```typescript
// Global error handler
class ErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.details
      });
    }
    
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid credentials'
      });
    }
    
    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        error: 'Authorization Error',
        message: 'Insufficient permissions'
      });
    }
    
    // Default server error
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
}
```

## Performance Considerations

### 1. Frontend Optimizations

```typescript
// Lazy loading for heavy components
const Dashboard = lazy(() => import('./app/dashboard/page'));
const Results = lazy(() => import('./app/results/page'));

// Image optimization
const OptimizedVideo = ({ src, ...props }) => (
  <video
    {...props}
    preload="metadata"
    loading="lazy"
    onLoadStart={() => console.log('Video loading started')}
  >
    <source src={src} type="video/mp4" />
  </video>
);

// Debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 2. Backend Optimizations

```typescript
// Database query optimization
class NFTRepository {
  async getUserNFTs(userId: string, page: number = 1, limit: number = 20) {
    return await this.db.nft.findMany({
      where: { userId },
      include: {
        video: {
          select: {
            duration: true,
            thumbnailUrl: true
          }
        },
        _count: {
          select: {
            likes: true,
            views: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
  }
}

// Caching strategy
class CacheService {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  // Cache user dashboard data for 5 minutes
  async getUserDashboard(userId: string) {
    const cacheKey = `dashboard:${userId}`;
    let data = await this.get(cacheKey);
    
    if (!data) {
      data = await this.fetchDashboardData(userId);
      await this.set(cacheKey, data, 300); // 5 minutes
    }
    
    return data;
  }
}
```

## Testing Strategy

### 1. Frontend Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Upload } from '../app/upload/page';

describe('Upload Component', () => {
  test('handles file upload successfully', async () => {
    const mockFile = new File(['video content'], 'test.mp4', {
      type: 'video/mp4'
    });
    
    render(<Upload />);
    
    const fileInput = screen.getByLabelText(/upload video/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    const uploadButton = screen.getByRole('button', { name: /analyze video/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });
});

// API integration testing
describe('API Integration', () => {
  test('uploads video and receives analysis', async () => {
    const mockVideo = new File([''], 'test.mp4', { type: 'video/mp4' });
    
    // Mock fetch responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          videoId: 'test-id',
          uploadUrl: 'https://s3.amazonaws.com/test'
        })
      })
      .mockResolvedValueOnce({
        ok: true
      });
    
    const result = await uploadVideo(mockVideo);
    expect(result.videoId).toBe('test-id');
  });
});
```

### 2. Backend Testing

```typescript
// API endpoint testing
describe('Video Upload API', () => {
  test('POST /api/videos/upload creates upload URL', async () => {
    const response = await request(app)
      .post('/api/videos/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        filename: 'test.mp4',
        fileSize: 1024000,
        contentType: 'video/mp4'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('videoId');
    expect(response.body).toHaveProperty('uploadUrl');
  });
});

// AI service testing
describe('Pose Detection Service', () => {
  test('detects poses in video frames', async () => {
    const mockFrames = [/* mock image data */];
    const poseService = new PoseDetectionService();
    await poseService.initialize();
    
    const results = await poseService.detectPoses(mockFrames);
    
    expect(results).toHaveLength(mockFrames.length);
    expect(results[0]).toHaveProperty('keypoints');
    expect(results[0]).toHaveProperty('confidence');
  });
});
```

## Implementation Checklist

### Phase 1: Core Backend Setup
- [ ] Set up Node.js/Express server with TypeScript
- [ ] Configure PostgreSQL database with Prisma
- [ ] Implement JWT authentication system
- [ ] Set up AWS S3 for file storage
- [ ] Create basic API endpoints for user management

### Phase 2: Video Processing
- [ ] Implement video upload with presigned URLs
- [ ] Set up background job processing with Redis/Bull
- [ ] Integrate TensorFlow for pose detection
- [ ] Create video analysis pipeline
- [ ] Implement progress tracking for long-running jobs

### Phase 3: AI/ML Integration
- [ ] Deploy pose detection models
- [ ] Implement movement recognition algorithms
- [ ] Create confidence scoring system
- [ ] Add thumbnail generation
- [ ] Optimize processing performance

### Phase 4: Story Protocol Integration
- [ ] Set up Story Protocol SDK
- [ ] Implement NFT minting functionality
- [ ] Create IPFS metadata upload
- [ ] Add transaction monitoring
- [ ] Implement royalty management

### Phase 5: Frontend Integration
- [ ] Update upload component with real API calls
- [ ] Implement real-time progress tracking
- [ ] Add authentication flows
- [ ] Connect dashboard to real data
- [ ] Add error handling and loading states

### Phase 6: Production Readiness
- [ ] Add comprehensive error handling
- [ ] Implement rate limiting and security measures
- [ ] Set up monitoring and logging
- [ ] Add automated testing
- [ ] Configure CI/CD pipeline
- [ ] Performance optimization and caching

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/movemint"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="movemint-videos"

# Story Protocol
STORY_PROTOCOL_RPC_URL="https://rpc.story.foundation"
STORY_PROTOCOL_PRIVATE_KEY="your-private-key"

# IPFS
PINATA_JWT="your-pinata-jwt"

# Redis
REDIS_URL="redis://localhost:6379"

# External APIs
OPENAI_API_KEY="your-openai-key" # For advanced movement analysis
```

## Conclusion

This guide provides a comprehensive roadmap for integrating backend functionality with the MoveMint frontend. The implementation should be done in phases, starting with core functionality and gradually adding advanced features like AI analysis and Story Protocol integration.

Key considerations:
- **Security**: Implement proper authentication and file validation
- **Performance**: Use caching and background processing for heavy operations
- **Scalability**: Design for horizontal scaling with microservices architecture
- **User Experience**: Provide real-time feedback and error handling
- **Testing**: Comprehensive testing at all levels

For questions or clarifications, refer to the specific sections above or consult the respective technology documentation.