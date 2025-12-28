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
    console.log('📡 [UniversalMintingEngineService] uploadVideo called');
    console.log('  - File:', file.name, file.type, file.size, 'bytes');
    console.log('  - Metadata:', JSON.stringify(metadata, null, 2));
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    console.log('📦 [UniversalMintingEngineService] FormData prepared');
    console.log('  - FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`    ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`    ${key}: ${typeof value === 'string' ? value.substring(0, 100) + '...' : value}`);
      }
    }

    console.log('🌐 [UniversalMintingEngineService] Making API request...');
    console.log('  - Endpoint: /api/upload-video-simple');
    console.log('  - Method: POST');
    console.log('  - Timeout: 120000ms');

    let response;
    try {
      response = await apiClient.request<VideoUploadResponse>({
        endpoint: '/api/upload-video-simple',
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
        },
        timeout: 120000, // 2 minutes for video upload
      });
      
      console.log('📨 [UniversalMintingEngineService] Raw API response received:', response);
    } catch (apiError) {
      console.error('❌ [UniversalMintingEngineService] API request failed:', apiError);
      console.error('  - Error type:', apiError?.constructor?.name);
      console.error('  - Error message:', apiError instanceof Error ? apiError.message : 'Unknown');
      console.error('  - Error details:', apiError);
      throw apiError;
    }
    
    console.log('📨 [UniversalMintingEngineService] API response received:', response);

    if (!response.success || !response.data) {
      console.error('❌ [UniversalMintingEngineService] Upload failed - API client error');
      console.error('  - Response success:', response.success);
      console.error('  - Response data:', response.data);
      console.error('  - Response error:', response.error);
      
      throw new APIError(
        'UPLOAD_FAILED',
        'Video upload failed - API client error',
        response.error,
        true,
        500
      );
    }

    // Check the actual upload response inside the data wrapper
    const uploadResponse = response.data;
    if (!uploadResponse.success) {
      console.error('❌ [UniversalMintingEngineService] Upload failed - upload endpoint error');
      console.error('  - Upload response:', uploadResponse);
      
      throw new APIError(
        'UPLOAD_FAILED',
        'Video upload failed - upload endpoint error',
        uploadResponse.error || 'Unknown upload error',
        true,
        500
      );
    }

    console.log('✅ [UniversalMintingEngineService] Upload successful, returning data:', uploadResponse);
    return uploadResponse;
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
   * Get available license templates from Surreal Base
   */
  async getLicenseTemplates(): Promise<LicenseTemplate[]> {
    try {
      console.log('🔍 Fetching license templates from Surreal Base...');
      const surrealBaseUrl = process.env.NEXT_PUBLIC_SURREAL_BASE_API_URL || 'https://surreal-base.vercel.app';
      const response = await fetch(`${surrealBaseUrl}/api/license-remixer?action=templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MoveMint-Frontend/1.0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ License templates fetched successfully');
      
      if (!result.success || !result.data) {
        throw new APIError(
          'TEMPLATES_FETCH_FAILED',
          'Failed to fetch license templates from Surreal Base',
          result.error,
          true,
          response.status
        );
      }
      
      // Handle Surreal Base format
      const templatesData = result.data.templates;
      
      if (!templatesData) {
        throw new APIError(
          'TEMPLATES_FORMAT_ERROR',
          'Invalid templates format from Surreal Base',
          { received: result.data },
          false,
          500
        );
      }
      
      // Convert Surreal Base format to our format
      return Object.entries(templatesData).map(([id, template]: [string, any]) => ({
        id,
        name: template.name || id,
        description: template.description || '',
        commercial: template.commercialUse ?? false,
        derivatives: template.derivativesAllowed ?? false,
        royaltyPercentage: template.revenueSharePercentage || 0,
        category: template.category || 'general',
        isPopular: template.isPopular ?? false,
        features: [
          `Commercial use: ${template.commercialUse ? 'Allowed' : 'Not allowed'}`,
          `Derivatives: ${template.derivativesAllowed ? 'Allowed' : 'Not allowed'}`,
          `Revenue share: ${template.revenueSharePercentage || 0}%`,
          `Use case: ${template.category || 'General'}`
        ]
      }));
      
    } catch (error) {
      console.error('❌ Failed to fetch license templates:', error);
      throw new APIError(
        'TEMPLATES_FETCH_FAILED',
        'Failed to fetch license templates',
        error instanceof Error ? error.message : 'Unknown error',
        true,
        500
      );
    }
  }

  /**
   * Create custom license using Surreal Base
   */
  async createCustomLicense(params: CustomLicenseParams): Promise<LicenseResponse> {
    const surrealBaseUrl = process.env.NEXT_PUBLIC_SURREAL_BASE_API_URL || 'https://surreal-base.vercel.app';
    
    // Transform params to match Surreal Base API format
    const requestBody = {
      creatorAddress: params.creatorAddress,
      creatorName: params.creatorName || "Creator",
      commercialUse: params.commercialUse,
      derivativesAllowed: params.derivativesAllowed,
      revenueSharePercentage: params.revenueSharePercentage,
      prohibitedUses: params.prohibitedUses || [],
      territory: params.territory || 'Worldwide',
      duration: params.duration || 'Perpetual',
      uploadToIPFS: true,
      format: 'both'
    };

    try {
      const response = await fetch(`${surrealBaseUrl}/api/license-remixer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MoveMint-Frontend/1.0',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new APIError(
          'LICENSE_CREATION_FAILED',
          'Failed to create custom license',
          result.error,
          true,
          response.status
        );
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('❌ Failed to create custom license:', error);
      throw new APIError(
        'LICENSE_CREATION_FAILED',
        'Failed to create custom license',
        error instanceof Error ? error.message : 'Unknown error',
        true,
        500
      );
    }
  }

  // ========================================
  // NFT Minting Methods
  // ========================================

  /**
   * Prepare NFT minting transaction using Surreal Base directly
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
console.log('🏭 [Service] Creating UniversalMintingEngineService instance...');
export const universalMintingEngineService = new UniversalMintingEngineService();
console.log('✅ [Service] UniversalMintingEngineService instance created');