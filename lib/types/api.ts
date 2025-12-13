// API Client Configuration Types
export interface APIClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
}

// API Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  statusCode: number;
}

export interface UserFriendlyError {
  message: string;
  action: 'retry' | 'fix' | 'contact_support';
  field?: string;
  retryable?: boolean;
  retryAfter?: number;
}

// Request/Response Types
export interface APIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Video Upload Types
export interface VideoMetadata {
  title: string;
  description?: string;
  tags?: string[];
  danceStyle?: string[];
  choreographer?: string;
  musicInfo?: MusicMetadata;
}

export interface MusicMetadata {
  title?: string;
  artist?: string;
  genre?: string;
  bpm?: number;
  duration?: number;
}

export interface VideoUploadResponse {
  success: boolean;
  videoId: string;
  uploadUrl: string;
  processingStatus: ProcessingStatus;
  estimatedProcessingTime: number;
}

export type ProcessingStatus = 
  | 'idle' 
  | 'uploading' 
  | 'processing' 
  | 'analyzing' 
  | 'complete' 
  | 'failed';

export interface VideoStatusResponse {
  videoId: string;
  status: ProcessingStatus;
  progress: number;
  currentStage: string;
  estimatedTimeRemaining?: number;
  error?: string;
}

// Dance Analysis Types
export interface DanceAnalysisResults {
  videoId: string;
  duration: number;
  detectedMovements: DanceMovement[];
  poseData: PoseFrame[];
  qualityMetrics: AnalysisQuality;
  recommendations: string[];
  primaryStyle?: string;
  danceMetrics?: {
    averageDifficulty?: string;
    uniqueStyles?: number;
    technicalComplexity?: number;
    artisticExpression?: number;
  };
  styleDistribution?: Array<{
    style: string;
    displayName: string;
    percentage: number;
  }>;
  movementsByStyle?: Record<string, any>;
}

export interface DanceMovement {
  name: string; // Dance terminology: "Pirouette", "Grand Jeté", etc.
  type: DanceStyle;
  confidence: number;
  timeRange: { start: number; end: number };
  description: string;
  difficulty: DanceDifficulty;
}

export interface PoseFrame {
  timestamp: number;
  keypoints: Keypoint[];
  confidence: number;
}

export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
  name: string;
}

export interface AnalysisQuality {
  overall: number;
  lighting: number;
  clarity: number;
  frameRate: number;
  stability: number;
}

export type DanceStyle = 
  | 'Ballet' 
  | 'Hip-Hop' 
  | 'Contemporary' 
  | 'Jazz' 
  | 'Ballroom' 
  | 'Latin' 
  | 'Freestyle' 
  | 'Breakdancing';

export type DanceDifficulty = 
  | 'Beginner' 
  | 'Intermediate' 
  | 'Advanced' 
  | 'Professional';

// License Types
export interface LicenseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  commercial: boolean;
  derivatives: boolean;
  royaltyPercentage: number;
  features: string[];
  parameters?: LicenseParameter[];
}

export interface LicenseParameter {
  name: string;
  type: 'boolean' | 'number' | 'string' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description: string;
}

export interface CustomLicenseParams {
  creatorAddress?: string;
  creatorName?: string;
  commercialUse: boolean;
  derivativesAllowed: boolean;
  revenueSharePercentage: number;
  prohibitedUses: string[];
  territory: string;
  duration: string;
}

export interface LicenseDocument {
  id: string;
  title: string;
  content: string;
  parameters: Record<string, any>;
  ipfsHash: string;
  storyProtocolParams: StoryProtocolParams;
}

export interface StoryProtocolParams {
  licenseTemplate: string;
  licenseTerms: Record<string, any>;
  royaltyPolicy: string;
  mintingFee: string;
}

export interface IPFSData {
  hash: string;
  url: string;
  gateway: string;
}

export interface LicenseResponse {
  success: boolean;
  data: {
    licenseDocument: LicenseDocument;
    storyProtocolParameters: StoryProtocolParams;
    ipfs: IPFSData;
    markdown: string;
  };
}

// NFT Minting Types
export interface MintRequest {
  videoId: string;
  metadata: NFTMetadata;
  licenseId?: string;
  walletAddress: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: NFTAttribute[];
  external_url?: string;
  danceStyle: DanceStyle[];
  primaryDanceStyle?: string;
  choreographer?: string;
  musicInfo?: MusicMetadata;
  difficulty: DanceDifficulty;
  technicalComplexity?: number;
  artisticExpression?: number;
  styleDistribution?: any[];
  movementsByStyle?: Record<string, any>;
  recommendations?: string[];
  originalVideo: string;
  analysisData: DanceAnalysisResults;
  licenseTerms: LicenseDocument;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
}

export interface TransactionResponse {
  success: boolean;
  transaction: {
    to: string;
    data: string;
    value: string;
    gasEstimate: string;
  };
  metadata: {
    ipfsHash: string;
    ipHash: string;
    nftIpfsHash: string;
    nftHash: string;
  };
}

export type MintingStatus = 
  | 'configuring' 
  | 'preparing' 
  | 'signing' 
  | 'submitting' 
  | 'confirming' 
  | 'complete' 
  | 'failed';

// Collection Types
export interface AssetsResponse {
  success: boolean;
  assets: NFTAsset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface NFTsResponse {
  success: boolean;
  nfts: NFTData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface NFTAsset {
  id: string;
  tokenId: string;
  contractAddress: string;
  metadata: NFTMetadata;
  owner: string;
  createdAt: string;
  transactionHash: string;
}

export interface NFTData {
  id: string;
  tokenId: string;
  contractAddress: string;
  metadata: NFTMetadata;
  owner: string;
  createdAt: string;
  lastSale?: {
    price: string;
    currency: string;
    date: string;
  };
}

// Progress Tracking Types
export interface ProgressUpdate {
  stage: string;
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export type ProgressCallback = (progress: ProgressUpdate) => void;

// Session Management Types
export interface SessionData {
  currentStep: WorkflowStep;
  videoId?: string;
  analysisResults?: DanceAnalysisResults;
  licenseConfig?: LicenseConfiguration;
  nftMetadata?: Partial<NFTMetadata>;
  walletAddress?: string;
  timestamp: number;
}

export type WorkflowStep = 
  | 'upload' 
  | 'processing' 
  | 'results' 
  | 'licensing' 
  | 'minting' 
  | 'complete';

export interface LicenseConfiguration {
  useTemplate: boolean;
  templateId?: string;
  customParams?: CustomLicenseParams;
  generatedLicense?: LicenseResponse;
}

// Wallet Integration Types
export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider: any;
  signer: any;
}

export interface TransactionRequest {
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  confirmations: number;
}