import { useState, useCallback } from 'react';
import { universalMintingEngineService } from '@/lib/api';
import { progressTracker, ProgressUtils } from '@/lib/utils/progress-tracker';
import { VideoMetadata, VideoUploadResponse, ProgressUpdate } from '@/lib/types/api';
import { useSession } from '@/hooks/use-session';

export interface UseVideoUploadOptions {
  onUploadComplete?: (videoId: string) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: ProgressUpdate) => void;
}

export interface UseVideoUploadReturn {
  // State
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: ProgressUpdate | null;
  error: string | null;
  
  // Actions
  setSelectedFile: (file: File | null) => void;
  uploadVideo: (metadata: VideoMetadata) => Promise<void>;
  clearError: () => void;
  validateFile: (file: File) => { valid: boolean; error?: string };
}

export function useVideoUpload(options: UseVideoUploadOptions = {}): UseVideoUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Session management
  const { 
    saveVideoUpload, 
    updateUploadProgress, 
    videoUploadSession,
    updateWorkflowStep 
  } = useSession();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback((file: File) => {
    return universalMintingEngineService.validateVideoFile(file);
  }, []);

  const uploadVideo = useCallback(async (metadata: VideoMetadata, providedOperationId?: string) => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    // Validate file before upload
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setError(null);

    const uploadOperationId = providedOperationId || `upload_${Date.now()}`;
    
    try {
      // Set up progress tracking
      const unsubscribe = progressTracker.subscribe(uploadOperationId, (progress) => {
        setUploadProgress(progress);
        options.onProgress?.(progress);
      });

      // Start enhanced progress tracking with sub-stages
      progressTracker.start(uploadOperationId, 'validating', 'Validating video file...', {
        totalItems: 1,
        canCancel: true,
        canPause: false,
        subStages: [
          { name: 'File Validation', status: 'active', percentage: 0 },
          { name: 'Upload to Server', status: 'pending', percentage: 0 },
          { name: 'Frame Extraction', status: 'pending', percentage: 0 },
          { name: 'Pose Detection', status: 'pending', percentage: 0 },
          { name: 'Analysis Complete', status: 'pending', percentage: 0 },
        ]
      });

      // Validation stage
      progressTracker.updateSubStage(uploadOperationId, 'File Validation', 'active');
      progressTracker.updateProgress(uploadOperationId, {
        stage: 'validating',
        percentage: 5,
        message: 'Validating video file format and size...',
        currentItem: selectedFile.name,
      });

      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      progressTracker.updateSubStage(uploadOperationId, 'File Validation', 'completed', 100);
      progressTracker.updateSubStage(uploadOperationId, 'Upload to Server', 'active');

      // Upload stage
      progressTracker.updateProgress(uploadOperationId, {
        stage: 'uploading',
        percentage: 15,
        message: 'Uploading video to server...',
        currentItem: selectedFile.name,
      });

      const response: VideoUploadResponse = await universalMintingEngineService.uploadVideo(
        selectedFile,
        metadata
      );

      // Update progress based on response
      if (response.success) {
        progressTracker.updateSubStage(uploadOperationId, 'Upload to Server', 'completed', 100);
        progressTracker.updateSubStage(uploadOperationId, 'Frame Extraction', 'active');

        // Save video upload session
        saveVideoUpload({
          videoId: response.videoId,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          uploadProgress: 30,
          uploadStatus: 'processing',
          uploadedAt: Date.now(),
          metadata: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
          },
        });

        progressTracker.updateProgress(uploadOperationId, {
          stage: 'processing',
          percentage: 35,
          message: 'Extracting frames from video...',
          estimatedTimeRemaining: response.estimatedProcessingTime,
          processedItems: 1,
        });

        // Start polling for processing status
        await pollProcessingStatus(response.videoId, operationId);

        // Update session to completed
        updateUploadProgress(response.videoId, 100, 'completed');
        updateWorkflowStep('analysis');

        // Complete the upload
        progressTracker.complete(operationId, 'Video analysis complete!');
        
        options.onUploadComplete?.(response.videoId);
      } else {
        throw new Error('Upload failed');
      }

      // Cleanup
      unsubscribe();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      progressTracker.fail(operationId, errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, options, validateFile]);

  // Poll processing status
  const pollProcessingStatus = async (videoId: string, operationId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await universalMintingEngineService.getVideoStatus(videoId);
        
        // Update progress based on status
        const progressPercentage = Math.min(30 + (status.progress * 0.6), 90);
        
        progressTracker.updateProgress(operationId, {
          stage: status.currentStage || 'processing',
          percentage: progressPercentage,
          message: getStatusMessage(status.status, status.currentStage),
          estimatedTimeRemaining: status.estimatedTimeRemaining,
        });

        // Update session progress
        updateUploadProgress(videoId, progressPercentage, 'processing');

        if (status.status === 'complete') {
          progressTracker.updateProgress(operationId, {
            stage: 'complete',
            percentage: 100,
            message: 'Video analysis complete!',
          });
          break;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Video processing failed');
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
        
      } catch (err) {
        if (attempts >= maxAttempts - 1) {
          throw err;
        }
        // Continue polling on temporary errors
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Processing timeout - please check back later');
    }
  };

  return {
    selectedFile,
    isUploading,
    uploadProgress,
    error,
    setSelectedFile,
    uploadVideo,
    clearError,
    validateFile,
  };
}

// Helper function to get user-friendly status messages
function getStatusMessage(status: string, stage?: string): string {
  switch (status) {
    case 'uploading':
      return 'Uploading video...';
    case 'processing':
      switch (stage) {
        case 'extracting':
          return 'Extracting video frames...';
        case 'analyzing':
          return 'Analyzing dance movements...';
        case 'finalizing':
          return 'Finalizing analysis...';
        default:
          return 'Processing video...';
      }
    case 'complete':
      return 'Analysis complete!';
    case 'failed':
      return 'Processing failed';
    default:
      return 'Processing video...';
  }
}