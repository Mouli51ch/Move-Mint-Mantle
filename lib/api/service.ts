import { apiClient, APIError } from './client';
import {
  VideoMetadata,
  VideoUploadResponse,
  VideoStatusResponse,
  DanceAnalysisResults,
  LicenseTemplate,
  LicenseResponse,
  CustomLicenseParams,
  MintRequest,
  TransactionResponse,
  AssetsResponse,
  NFTsResponse,
  APIResponse,
} from '@/lib/types/api';

/**
 * Universal Minting Engine API Service
 * Provides high-level methods for interacting with the API
 */
export class UniversalMintingEngineService {
  
  // ========================================
  // Video Processing Methods
  // ========================================

  /**
   * Upload video for dance analysis and processing
   */
  async uploadVideo(file: File, metadata: VideoMetadata): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.request<VideoUploadResponse>({
      endpoint: '/api/prepare-mint',
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      timeout: 120000, // 2 minutes for video upload
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'UPLOAD_FAILED',
        'Video upload failed',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get video processing status
   */
  async getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
    const response = await apiClient.request<VideoStatusResponse>({
      endpoint: `/api/video-status/${videoId}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'STATUS_FETCH_FAILED',
        'Failed to fetch video status',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get dance analysis results
   */
  async getAnalysisResults(videoId: string): Promise<DanceAnalysisResults> {
    const response = await apiClient.request<DanceAnalysisResults>({
      endpoint: `/api/analysis/${videoId}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'ANALYSIS_FETCH_FAILED',
        'Failed to fetch analysis results',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  // ========================================
  // License Management Methods
  // ========================================

  /**
   * Get available license templates
   */
  async getLicenseTemplates(): Promise<LicenseTemplate[]> {
    const response = await apiClient.request<LicenseTemplate[]>({
      endpoint: '/api/license-templates',
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'TEMPLATES_FETCH_FAILED',
        'Failed to fetch license templates',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Create custom license using License Remixer
   */
  async createCustomLicense(params: CustomLicenseParams): Promise<LicenseResponse> {
    const response = await apiClient.request<LicenseResponse>({
      endpoint: '/api/license-remixer',
      method: 'POST',
      body: params,
      timeout: 60000, // 1 minute for license generation
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'LICENSE_CREATION_FAILED',
        'Failed to create custom license',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get license by ID
   */
  async getLicense(licenseId: string): Promise<LicenseResponse> {
    const response = await apiClient.request<LicenseResponse>({
      endpoint: `/api/license/${licenseId}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'LICENSE_FETCH_FAILED',
        'Failed to fetch license',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  // ========================================
  // NFT Minting Methods
  // ========================================

  /**
   * Prepare NFT minting transaction
   */
  async prepareMint(mintData: MintRequest): Promise<TransactionResponse> {
    const response = await apiClient.request<TransactionResponse>({
      endpoint: '/api/prepare-mint',
      method: 'POST',
      body: mintData,
      timeout: 60000, // 1 minute for transaction preparation
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'MINT_PREPARATION_FAILED',
        'Failed to prepare minting transaction',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Submit signed transaction to blockchain
   */
  async submitTransaction(transactionHash: string, signedTransaction: string): Promise<{ success: boolean; txHash: string }> {
    const response = await apiClient.request<{ success: boolean; txHash: string }>({
      endpoint: '/api/submit-transaction',
      method: 'POST',
      body: {
        transactionHash,
        signedTransaction,
      },
      timeout: 120000, // 2 minutes for blockchain submission
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'TRANSACTION_SUBMISSION_FAILED',
        'Failed to submit transaction to blockchain',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<{ status: string; confirmations: number; blockNumber?: number }> {
    const response = await apiClient.request<{ status: string; confirmations: number; blockNumber?: number }>({
      endpoint: `/api/transaction-status/${txHash}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'TRANSACTION_STATUS_FAILED',
        'Failed to get transaction status',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  // ========================================
  // Collection Management Methods
  // ========================================

  /**
   * Get user's assets/NFTs
   */
  async getAssets(address: string, page: number = 1, limit: number = 20): Promise<AssetsResponse> {
    const response = await apiClient.request<AssetsResponse>({
      endpoint: `/api/get-assets?address=${encodeURIComponent(address)}&page=${page}&limit=${limit}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'ASSETS_FETCH_FAILED',
        'Failed to fetch user assets',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get user's NFTs with detailed metadata
   */
  async getNFTs(address: string, page: number = 1, limit: number = 20): Promise<NFTsResponse> {
    const response = await apiClient.request<NFTsResponse>({
      endpoint: `/api/get-nfts?address=${encodeURIComponent(address)}&page=${page}&limit=${limit}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'NFTS_FETCH_FAILED',
        'Failed to fetch user NFTs',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get NFT by token ID
   */
  async getNFTById(contractAddress: string, tokenId: string): Promise<any> {
    const response = await apiClient.request({
      endpoint: `/api/nft/${contractAddress}/${tokenId}`,
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'NFT_FETCH_FAILED',
        'Failed to fetch NFT details',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  // ========================================
  // Health and Status Methods
  // ========================================

  /**
   * Check API health status
   */
  async getHealthStatus(): Promise<{ status: string; version: string; uptime: number }> {
    const response = await apiClient.request<{ status: string; version: string; uptime: number }>({
      endpoint: '/api/health',
      method: 'GET',
      timeout: 5000, // 5 seconds for health check
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'HEALTH_CHECK_FAILED',
        'API health check failed',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  /**
   * Get API service status
   */
  async getServiceStatus(): Promise<{ 
    videoProcessing: boolean; 
    licenseRemixer: boolean; 
    blockchain: boolean; 
    ipfs: boolean; 
  }> {
    const response = await apiClient.request<{ 
      videoProcessing: boolean; 
      licenseRemixer: boolean; 
      blockchain: boolean; 
      ipfs: boolean; 
    }>({
      endpoint: '/api/service-status',
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new APIError(
        'SERVICE_STATUS_FAILED',
        'Failed to get service status',
        response.error,
        true,
        500
      );
    }

    return response.data;
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Validate file before upload
   */
  validateVideoFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload MP4, WebM, MOV, or AVI files.',
      };
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 500MB.',
      };
    }

    // Check minimum file size (1MB)
    const minSize = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size < minSize) {
      return {
        valid: false,
        error: 'File too small. Minimum size is 1MB.',
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Estimate processing time based on video duration and file size
   */
  estimateProcessingTime(fileSizeBytes: number, durationSeconds?: number): number {
    // Base processing time: 2 seconds per MB + 1 second per minute of video
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    const baseTime = fileSizeMB * 2; // 2 seconds per MB
    
    const durationTime = durationSeconds ? (durationSeconds / 60) * 1 : 0; // 1 second per minute
    
    return Math.max(30, baseTime + durationTime); // Minimum 30 seconds
  }
}

// Create default service instance
export const universalMintingEngineService = new UniversalMintingEngineService();