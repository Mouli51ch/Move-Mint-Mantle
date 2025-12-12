/**
 * Universal Minting Engine API Integration
 * Main exports for API client, service, and utilities
 */

// Core API client and service
export { APIClient, APIError, APIErrorHandler, apiClient } from './client';
export { UniversalMintingEngineService, universalMintingEngineService } from './service';

// Configuration and environment
export { 
  getEnvironmentConfig, 
  isDevelopment, 
  isProduction, 
  isDebugEnabled,
  getCORSConfig,
  getSecurityHeaders,
  logConfiguration,
  environmentConfig,
  type EnvironmentConfig 
} from '../config/environment';

// Progress tracking
export { 
  ProgressTracker, 
  ProgressUtils, 
  progressTracker 
} from '../utils/progress-tracker';

// Type definitions
export * from '../types/api';

// Re-export commonly used types for convenience
export type {
  APIResponse,
  VideoMetadata,
  VideoUploadResponse,
  DanceAnalysisResults,
  LicenseResponse,
  TransactionResponse,
  NFTMetadata,
  ProgressUpdate,
  ProgressCallback,
  SessionData,
  WalletConnection,
} from '../types/api';