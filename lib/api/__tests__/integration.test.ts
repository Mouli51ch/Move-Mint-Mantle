/**
 * Integration tests for Universal Minting Engine API
 * Tests complete workflows with mock responses
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { universalMintingEngineService } from '../service';
import { 
  mockVideoUploadResponse,
  mockAnalysisResults,
  mockLicenseDocument,
  mockMintTransactionResponse,
  mockNFTCollectionResponse,
  mockHealthResponse,
  simulateNetworkDelay,
} from '../mock-responses';

// Mock fetch globally
global.fetch = jest.fn();

describe('Universal Minting Engine API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Video Upload Workflow', () => {
    it('should successfully upload video and return processing info', async () => {
      // Mock successful upload response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockVideoUploadResponse,
      } as Response);

      const mockFile = new File(['video content'], 'dance.mp4', { type: 'video/mp4' });
      const metadata = {
        title: 'My Dance Video',
        description: 'A beautiful ballet performance',
        tags: ['ballet', 'classical'],
      };

      const result = await universalMintingEngineService.uploadVideo(mockFile, metadata);

      expect(result).toEqual(mockVideoUploadResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('should handle upload errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const mockFile = new File(['video content'], 'dance.mp4', { type: 'video/mp4' });
      const metadata = { title: 'Test Video' };

      await expect(
        universalMintingEngineService.uploadVideo(mockFile, metadata)
      ).rejects.toThrow('Network error');
    });

    it('should validate video file before upload', () => {
      // Test valid video file
      const validFile = new File(['content'], 'dance.mp4', { type: 'video/mp4' });
      const validResult = universalMintingEngineService.validateVideoFile(validFile);
      expect(validResult.valid).toBe(true);

      // Test invalid file type
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const invalidResult = universalMintingEngineService.validateVideoFile(invalidFile);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('file type');

      // Test file too large
      const largeFile = new File(['x'.repeat(600 * 1024 * 1024)], 'large.mp4', { type: 'video/mp4' });
      const largeResult = universalMintingEngineService.validateVideoFile(largeFile);
      expect(largeResult.valid).toBe(false);
      expect(largeResult.error).toContain('file size');
    });
  });

  describe('Analysis Results Workflow', () => {
    it('should fetch and return dance analysis results', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockAnalysisResults,
      } as Response);

      const result = await universalMintingEngineService.getAnalysisResults('video_12345');

      expect(result).toEqual(mockAnalysisResults);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analysis/video_12345'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle analysis not ready', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 202,
        json: async () => ({ message: 'Analysis in progress' }),
      } as Response);

      await expect(
        universalMintingEngineService.getAnalysisResults('video_12345')
      ).rejects.toThrow('Analysis in progress');
    });

    it('should poll video processing status', async () => {
      const statusResponses = [
        { status: 'processing', progress: 0.3, currentStage: 'extracting' },
        { status: 'processing', progress: 0.7, currentStage: 'analyzing' },
        { status: 'complete', progress: 1.0, currentStage: 'complete' },
      ];

      let callCount = 0;
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(async () => {
        const response = statusResponses[callCount++] || statusResponses[statusResponses.length - 1];
        return {
          ok: true,
          status: 200,
          json: async () => response,
        } as Response;
      });

      const result = await universalMintingEngineService.getVideoStatus('video_12345');

      expect(result.status).toBe('complete');
      expect(result.progress).toBe(1.0);
    });
  });

  describe('License Creation Workflow', () => {
    it('should create custom license document', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { licenseDocument: mockLicenseDocument } }),
      } as Response);

      const licenseParams = {
        templateId: 'cc-by-4.0',
        customParams: {
          attribution: true,
          commercialUse: true,
          derivatives: true,
        },
      };

      const result = await universalMintingEngineService.createLicense(licenseParams);

      expect(result.data.licenseDocument).toEqual(mockLicenseDocument);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/license-remixer'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(licenseParams),
        })
      );
    });

    it('should validate license parameters', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Invalid license parameters',
          errors: [{ field: 'templateId', message: 'Template ID is required' }],
        }),
      } as Response);

      const invalidParams = { customParams: {} };

      await expect(
        universalMintingEngineService.createLicense(invalidParams)
      ).rejects.toThrow('Invalid license parameters');
    });
  });

  describe('NFT Minting Workflow', () => {
    it('should prepare mint transaction', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMintTransactionResponse,
      } as Response);

      const mintRequest = {
        videoId: 'video_12345',
        metadata: {
          name: 'My Dance NFT',
          description: 'A beautiful performance',
          attributes: [],
          external_url: 'https://movemint.app',
          danceStyle: ['ballet'],
          difficulty: 'Intermediate',
          originalVideo: 'video_12345',
        },
        licenseId: 'license_12345',
        walletAddress: '0x1234567890123456789012345678901234567890',
      };

      const result = await universalMintingEngineService.prepareMint(mintRequest);

      expect(result).toEqual(mockMintTransactionResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/prepare-mint'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mintRequest),
        })
      );
    });

    it('should submit transaction to blockchain', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, transactionHash: '0xabcdef...' }),
      } as Response);

      const result = await universalMintingEngineService.submitTransaction(
        'tx_12345',
        '0xabcdef...'
      );

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0xabcdef...');
    });
  });

  describe('NFT Collection Management', () => {
    it('should fetch user NFT collection', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNFTCollectionResponse,
      } as Response);

      const result = await universalMintingEngineService.getNFTCollection(
        '0x1234567890123456789012345678901234567890'
      );

      expect(result).toEqual(mockNFTCollectionResponse);
      expect(result.nfts).toHaveLength(2);
      expect(result.nfts[0].danceStyle).toContain('Ballet');
    });

    it('should handle empty collection', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          nfts: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          hasMore: false,
        }),
      } as Response);

      const result = await universalMintingEngineService.getNFTCollection(
        '0x1234567890123456789012345678901234567890'
      );

      expect(result.nfts).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should support pagination and filtering', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNFTCollectionResponse,
      } as Response);

      await universalMintingEngineService.getNFTCollection(
        '0x1234567890123456789012345678901234567890',
        {
          page: 2,
          pageSize: 5,
          danceStyle: 'ballet',
          sortBy: 'created',
          sortOrder: 'desc',
        }
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&pageSize=5&danceStyle=ballet&sortBy=created&sortOrder=desc'),
        expect.any(Object)
      );
    });
  });

  describe('API Health and Performance', () => {
    it('should check API health status', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHealthResponse,
      } as Response);

      const result = await universalMintingEngineService.checkHealth();

      expect(result).toEqual(mockHealthResponse);
      expect(result.status).toBe('healthy');
      expect(result.services.database).toBe('healthy');
    });

    it('should handle API timeouts', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(
        universalMintingEngineService.checkHealth()
      ).rejects.toThrow('Request timeout');
    });

    it('should measure response times', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(async () => {
        await simulateNetworkDelay(100, 200);
        return {
          ok: true,
          status: 200,
          json: async () => mockHealthResponse,
        } as Response;
      });

      const startTime = Date.now();
      await universalMintingEngineService.checkHealth();
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeGreaterThan(100);
      expect(responseTime).toBeLessThan(300);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should retry failed requests', async () => {
      let callCount = 0;
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network error');
        }
        return {
          ok: true,
          status: 200,
          json: async () => mockHealthResponse,
        } as Response;
      });

      const result = await universalMintingEngineService.checkHealth();

      expect(result).toEqual(mockHealthResponse);
      expect(callCount).toBe(3); // Should have retried twice
    });

    it('should handle rate limiting', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'retry-after': '60' }),
        json: async () => ({ message: 'Too many requests' }),
      } as Response);

      await expect(
        universalMintingEngineService.checkHealth()
      ).rejects.toThrow('Too many requests');
    });

    it('should handle server errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      } as Response);

      await expect(
        universalMintingEngineService.checkHealth()
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full video-to-NFT workflow', async () => {
      // Mock all API calls in sequence
      const mockCalls = [
        mockVideoUploadResponse,
        { status: 'complete', progress: 1.0 },
        mockAnalysisResults,
        { data: { licenseDocument: mockLicenseDocument } },
        mockMintTransactionResponse,
        { success: true, transactionHash: '0xabcdef...' },
      ];

      let callIndex = 0;
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(async () => {
        const response = mockCalls[callIndex++];
        return {
          ok: true,
          status: 200,
          json: async () => response,
        } as Response;
      });

      // Step 1: Upload video
      const mockFile = new File(['video'], 'dance.mp4', { type: 'video/mp4' });
      const uploadResult = await universalMintingEngineService.uploadVideo(mockFile, {
        title: 'Test Dance',
      });
      expect(uploadResult.success).toBe(true);

      // Step 2: Wait for processing
      const statusResult = await universalMintingEngineService.getVideoStatus(uploadResult.videoId);
      expect(statusResult.status).toBe('complete');

      // Step 3: Get analysis results
      const analysisResult = await universalMintingEngineService.getAnalysisResults(uploadResult.videoId);
      expect(analysisResult.detectedMovements).toHaveLength(3);

      // Step 4: Create license
      const licenseResult = await universalMintingEngineService.createLicense({
        templateId: 'cc-by-4.0',
        customParams: { attribution: true },
      });
      expect(licenseResult.data.licenseDocument.id).toBe('license_12345');

      // Step 5: Prepare mint
      const mintResult = await universalMintingEngineService.prepareMint({
        videoId: uploadResult.videoId,
        metadata: {
          name: 'Test NFT',
          description: 'Test description',
          attributes: [],
          external_url: 'https://test.com',
          danceStyle: ['ballet'],
          difficulty: 'Beginner',
          originalVideo: uploadResult.videoId,
        },
        licenseId: licenseResult.data.licenseDocument.id,
        walletAddress: '0x1234567890123456789012345678901234567890',
      });
      expect(mintResult.success).toBe(true);

      // Step 6: Submit transaction
      const submitResult = await universalMintingEngineService.submitTransaction(
        mintResult.transactionId,
        '0xabcdef...'
      );
      expect(submitResult.success).toBe(true);

      // Verify all steps completed successfully
      expect(callIndex).toBe(6);
    });
  });
});