import { ProgressUpdate, ProgressCallback } from '@/lib/types/api';

// Enhanced progress update interface for real-time feedback
export interface EnhancedProgressUpdate extends ProgressUpdate {
  operationId: string;
  startTime: number;
  lastUpdateTime: number;
  estimatedTimeRemaining?: number;
  throughput?: number; // items/bytes per second
  currentItem?: string; // current file/item being processed
  totalItems?: number;
  processedItems?: number;
  subStages?: ProgressSubStage[];
  canCancel?: boolean;
  canPause?: boolean;
  isPaused?: boolean;
  warnings?: string[];
  details?: Record<string, any>;
}

export interface ProgressSubStage {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  percentage: number;
  message?: string;
}

export interface ProgressNotification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  operationId: string;
  persistent?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

/**
 * Enhanced Progress tracking utility for long-running operations
 * Manages real-time progress updates and notifications for video processing, minting, etc.
 */
export class ProgressTracker {
  private listeners: Map<string, ProgressCallback[]> = new Map();
  private currentProgress: Map<string, EnhancedProgressUpdate> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private notifications: Map<string, ProgressNotification[]> = new Map();
  private globalListeners: ProgressCallback[] = [];

  /**
   * Subscribe to progress updates for a specific operation
   */
  subscribe(operationId: string, callback: ProgressCallback): () => void {
    const callbacks = this.listeners.get(operationId) || [];
    callbacks.push(callback);
    this.listeners.set(operationId, callbacks);

    // Send current progress if available
    const currentProgress = this.currentProgress.get(operationId);
    if (currentProgress) {
      callback(currentProgress);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(operationId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        if (callbacks.length === 0) {
          this.listeners.delete(operationId);
        } else {
          this.listeners.set(operationId, callbacks);
        }
      }
    };
  }

  /**
   * Update progress for an operation with enhanced real-time feedback
   */
  updateProgress(operationId: string, progress: ProgressUpdate | EnhancedProgressUpdate): void {
    const currentProgress = this.currentProgress.get(operationId);
    const now = Date.now();
    
    // Create enhanced progress update
    const enhancedProgress: EnhancedProgressUpdate = {
      operationId,
      startTime: currentProgress?.startTime || now,
      lastUpdateTime: now,
      ...progress,
    };

    // Calculate estimated time remaining if not provided
    if (!enhancedProgress.estimatedTimeRemaining && currentProgress) {
      const elapsedTime = now - enhancedProgress.startTime;
      enhancedProgress.estimatedTimeRemaining = ProgressUtils.estimateTimeRemaining(
        enhancedProgress.percentage,
        elapsedTime
      );
    }

    // Calculate throughput for data operations
    if (currentProgress && enhancedProgress.processedItems && enhancedProgress.processedItems > 0) {
      const elapsedSeconds = (now - enhancedProgress.startTime) / 1000;
      enhancedProgress.throughput = enhancedProgress.processedItems / elapsedSeconds;
    }

    this.currentProgress.set(operationId, enhancedProgress);
    
    // Notify operation-specific listeners
    const callbacks = this.listeners.get(operationId) || [];
    callbacks.forEach(callback => {
      try {
        callback(enhancedProgress);
      } catch (error) {
        console.error(`Progress callback error for ${operationId}:`, error);
      }
    });

    // Notify global listeners
    this.globalListeners.forEach(callback => {
      try {
        callback(enhancedProgress);
      } catch (error) {
        console.error(`Global progress callback error:`, error);
      }
    });

    // Auto-cleanup completed operations after 5 minutes
    if (enhancedProgress.percentage >= 100) {
      this.scheduleCleanup(operationId, 5 * 60 * 1000);
    }
  }

  /**
   * Start progress tracking with initial state and enhanced options
   */
  start(
    operationId: string, 
    initialStage: string, 
    initialMessage: string,
    options?: {
      totalItems?: number;
      canCancel?: boolean;
      canPause?: boolean;
      subStages?: ProgressSubStage[];
    }
  ): void {
    this.updateProgress(operationId, {
      stage: initialStage,
      percentage: 0,
      message: initialMessage,
      totalItems: options?.totalItems,
      processedItems: 0,
      canCancel: options?.canCancel || false,
      canPause: options?.canPause || false,
      isPaused: false,
      subStages: options?.subStages || [],
      warnings: [],
      details: {},
    });

    // Send start notification
    this.addNotification(operationId, {
      type: 'info',
      title: 'Operation Started',
      message: initialMessage,
      timestamp: Date.now(),
      operationId,
    });
  }

  /**
   * Complete an operation with success notification
   */
  complete(operationId: string, finalMessage: string = 'Operation completed'): void {
    const current = this.currentProgress.get(operationId);
    this.updateProgress(operationId, {
      stage: 'complete',
      percentage: 100,
      message: finalMessage,
      subStages: current?.subStages?.map(stage => ({ ...stage, status: 'completed' })),
    });

    this.addNotification(operationId, {
      type: 'success',
      title: 'Operation Completed',
      message: finalMessage,
      timestamp: Date.now(),
      operationId,
      persistent: true,
    });
  }

  /**
   * Mark an operation as failed with error notification
   */
  fail(operationId: string, errorMessage: string, details?: Record<string, any>): void {
    const current = this.currentProgress.get(operationId);
    this.updateProgress(operationId, {
      stage: 'failed',
      percentage: current?.percentage || 0,
      message: errorMessage,
      details: { ...current?.details, ...details },
      subStages: current?.subStages?.map(stage => 
        stage.status === 'active' ? { ...stage, status: 'failed' } : stage
      ),
    });

    this.addNotification(operationId, {
      type: 'error',
      title: 'Operation Failed',
      message: errorMessage,
      timestamp: Date.now(),
      operationId,
      persistent: true,
      actionLabel: 'Retry',
    });
    
    // Cleanup failed operations after 5 minutes (longer for user to see error)
    this.scheduleCleanup(operationId, 5 * 60 * 1000);
  }

  /**
   * Get current progress for an operation
   */
  getProgress(operationId: string): EnhancedProgressUpdate | null {
    return this.currentProgress.get(operationId) || null;
  }

  /**
   * Subscribe to global progress updates (all operations)
   */
  subscribeGlobal(callback: ProgressCallback): () => void {
    this.globalListeners.push(callback);
    
    // Send current progress for all active operations
    this.currentProgress.forEach(progress => {
      callback(progress);
    });

    return () => {
      const index = this.globalListeners.indexOf(callback);
      if (index > -1) {
        this.globalListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add a notification for an operation
   */
  addNotification(operationId: string, notification: ProgressNotification): void {
    const notifications = this.notifications.get(operationId) || [];
    notifications.push(notification);
    this.notifications.set(operationId, notifications);

    // Limit notifications per operation to prevent memory leaks
    if (notifications.length > 50) {
      notifications.splice(0, notifications.length - 50);
    }
  }

  /**
   * Get notifications for an operation
   */
  getNotifications(operationId: string): ProgressNotification[] {
    return this.notifications.get(operationId) || [];
  }

  /**
   * Clear notifications for an operation
   */
  clearNotifications(operationId: string): void {
    this.notifications.delete(operationId);
  }

  /**
   * Add warning to current operation
   */
  addWarning(operationId: string, warning: string): void {
    const current = this.currentProgress.get(operationId);
    if (current) {
      const warnings = [...(current.warnings || []), warning];
      this.updateProgress(operationId, { ...current, warnings });
      
      this.addNotification(operationId, {
        type: 'warning',
        title: 'Warning',
        message: warning,
        timestamp: Date.now(),
        operationId,
      });
    }
  }

  /**
   * Update sub-stage status
   */
  updateSubStage(operationId: string, stageName: string, status: ProgressSubStage['status'], percentage?: number): void {
    const current = this.currentProgress.get(operationId);
    if (current && current.subStages) {
      const subStages = current.subStages.map(stage => 
        stage.name === stageName 
          ? { ...stage, status, percentage: percentage ?? stage.percentage }
          : stage
      );
      this.updateProgress(operationId, { ...current, subStages });
    }
  }

  /**
   * Pause an operation
   */
  pause(operationId: string): void {
    const current = this.currentProgress.get(operationId);
    if (current && current.canPause) {
      this.updateProgress(operationId, { ...current, isPaused: true });
      
      this.addNotification(operationId, {
        type: 'info',
        title: 'Operation Paused',
        message: 'The operation has been paused',
        timestamp: Date.now(),
        operationId,
      });
    }
  }

  /**
   * Resume a paused operation
   */
  resume(operationId: string): void {
    const current = this.currentProgress.get(operationId);
    if (current && current.isPaused) {
      this.updateProgress(operationId, { ...current, isPaused: false });
      
      this.addNotification(operationId, {
        type: 'info',
        title: 'Operation Resumed',
        message: 'The operation has been resumed',
        timestamp: Date.now(),
        operationId,
      });
    }
  }

  /**
   * Cancel an operation
   */
  cancel(operationId: string, reason?: string): void {
    const current = this.currentProgress.get(operationId);
    if (current && current.canCancel) {
      this.updateProgress(operationId, {
        ...current,
        stage: 'cancelled',
        percentage: 0,
        message: reason || 'Operation cancelled by user',
      });
      
      this.addNotification(operationId, {
        type: 'warning',
        title: 'Operation Cancelled',
        message: reason || 'The operation was cancelled',
        timestamp: Date.now(),
        operationId,
      });

      // Cleanup after 1 minute
      this.scheduleCleanup(operationId, 60 * 1000);
    }
  }

  /**
   * Check if an operation is in progress
   */
  isInProgress(operationId: string): boolean {
    const progress = this.currentProgress.get(operationId);
    return progress ? progress.percentage < 100 && progress.stage !== 'failed' : false;
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): string[] {
    return Array.from(this.currentProgress.keys()).filter(id => this.isInProgress(id));
  }

  /**
   * Clear progress data for an operation
   */
  clear(operationId: string): void {
    this.currentProgress.delete(operationId);
    this.listeners.delete(operationId);
    this.notifications.delete(operationId);
    
    const timer = this.timers.get(operationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(operationId);
    }
  }

  /**
   * Clear all progress data
   */
  clearAll(): void {
    this.currentProgress.clear();
    this.listeners.clear();
    this.notifications.clear();
    this.globalListeners.length = 0;
    
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Schedule cleanup of operation data
   */
  private scheduleCleanup(operationId: string, delay: number): void {
    // Clear existing timer if any
    const existingTimer = this.timers.get(operationId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new cleanup
    const timer = setTimeout(() => {
      this.clear(operationId);
    }, delay);
    
    this.timers.set(operationId, timer);
  }

  /**
   * Create a progress updater function for an operation
   */
  createUpdater(operationId: string) {
    return {
      start: (stage: string, message: string) => this.start(operationId, stage, message),
      update: (progress: Partial<ProgressUpdate>) => {
        const current = this.getProgress(operationId);
        if (current) {
          this.updateProgress(operationId, { ...current, ...progress });
        }
      },
      setStage: (stage: string, message?: string) => {
        const current = this.getProgress(operationId);
        if (current) {
          this.updateProgress(operationId, {
            ...current,
            stage,
            message: message || current.message,
          });
        }
      },
      setProgress: (percentage: number, message?: string) => {
        const current = this.getProgress(operationId);
        if (current) {
          this.updateProgress(operationId, {
            ...current,
            percentage: Math.max(0, Math.min(100, percentage)),
            message: message || current.message,
          });
        }
      },
      complete: (message?: string) => this.complete(operationId, message),
      fail: (message: string) => this.fail(operationId, message),
    };
  }
}

/**
 * Utility functions for common progress patterns
 */
export class ProgressUtils {
  /**
   * Create progress stages for video upload workflow
   */
  static createVideoUploadStages() {
    return [
      { stage: 'validating', message: 'Validating video file...', percentage: 0 },
      { stage: 'uploading', message: 'Uploading video...', percentage: 10 },
      { stage: 'processing', message: 'Processing video...', percentage: 30 },
      { stage: 'extracting', message: 'Extracting frames...', percentage: 50 },
      { stage: 'analyzing', message: 'Analyzing dance movements...', percentage: 70 },
      { stage: 'finalizing', message: 'Finalizing analysis...', percentage: 90 },
      { stage: 'complete', message: 'Analysis complete!', percentage: 100 },
    ];
  }

  /**
   * Create progress stages for NFT minting workflow
   */
  static createMintingStages() {
    return [
      { stage: 'preparing', message: 'Preparing NFT metadata...', percentage: 0 },
      { stage: 'uploading', message: 'Uploading to IPFS...', percentage: 20 },
      { stage: 'licensing', message: 'Processing license terms...', percentage: 40 },
      { stage: 'transaction', message: 'Preparing blockchain transaction...', percentage: 60 },
      { stage: 'signing', message: 'Waiting for wallet signature...', percentage: 70 },
      { stage: 'submitting', message: 'Submitting to blockchain...', percentage: 80 },
      { stage: 'confirming', message: 'Waiting for confirmation...', percentage: 90 },
      { stage: 'complete', message: 'NFT minted successfully!', percentage: 100 },
    ];
  }

  /**
   * Create progress stages for license creation workflow
   */
  static createLicenseStages() {
    return [
      { stage: 'validating', message: 'Validating license parameters...', percentage: 0 },
      { stage: 'generating', message: 'Generating license document...', percentage: 30 },
      { stage: 'uploading', message: 'Uploading to IPFS...', percentage: 60 },
      { stage: 'registering', message: 'Registering with Story Protocol...', percentage: 80 },
      { stage: 'complete', message: 'License created successfully!', percentage: 100 },
    ];
  }

  /**
   * Estimate time remaining based on current progress and elapsed time
   */
  static estimateTimeRemaining(
    currentPercentage: number, 
    elapsedMs: number
  ): number | undefined {
    if (currentPercentage <= 0 || currentPercentage >= 100) {
      return undefined;
    }

    const progressRate = currentPercentage / elapsedMs; // percentage per ms
    const remainingPercentage = 100 - currentPercentage;
    const estimatedRemainingMs = remainingPercentage / progressRate;

    return Math.round(estimatedRemainingMs / 1000); // return seconds
  }

  /**
   * Format time remaining for display
   */
  static formatTimeRemaining(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }
}

// Create default progress tracker instance
export const progressTracker = new ProgressTracker();