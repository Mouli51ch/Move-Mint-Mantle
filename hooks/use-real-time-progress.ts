/**
 * React Hook for Real-Time Progress Management
 * Provides easy integration with the enhanced progress tracker
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  progressTracker, 
  EnhancedProgressUpdate, 
  ProgressNotification,
  ProgressSubStage 
} from '@/lib/utils/progress-tracker';

export interface UseRealTimeProgressOptions {
  operationId: string;
  autoStart?: boolean;
  onComplete?: (operationId: string) => void;
  onError?: (operationId: string, error: string) => void;
  onProgress?: (progress: EnhancedProgressUpdate) => void;
}

export interface UseRealTimeProgressReturn {
  // Current state
  progress: EnhancedProgressUpdate | null;
  notifications: ProgressNotification[];
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isPaused: boolean;
  
  // Control methods
  start: (stage: string, message: string, options?: {
    totalItems?: number;
    canCancel?: boolean;
    canPause?: boolean;
    subStages?: ProgressSubStage[];
  }) => void;
  update: (updates: Partial<EnhancedProgressUpdate>) => void;
  setStage: (stage: string, message?: string) => void;
  setProgress: (percentage: number, message?: string) => void;
  setCurrentItem: (item: string) => void;
  incrementProcessed: (count?: number) => void;
  addWarning: (warning: string) => void;
  updateSubStage: (stageName: string, status: ProgressSubStage['status'], percentage?: number) => void;
  complete: (message?: string) => void;
  fail: (error: string, details?: Record<string, any>) => void;
  pause: () => void;
  resume: () => void;
  cancel: (reason?: string) => void;
  clear: () => void;
  
  // Utility methods
  getTimeElapsed: () => number;
  getEstimatedTimeRemaining: () => number | undefined;
  getThroughput: () => number | undefined;
}

export function useRealTimeProgress({
  operationId,
  autoStart = false,
  onComplete,
  onError,
  onProgress,
}: UseRealTimeProgressOptions): UseRealTimeProgressReturn {
  const [progressState, setProgressState] = useState<EnhancedProgressUpdate | null>(null);
  const [notifications, setNotifications] = useState<ProgressNotification[]>([]);
  const callbacksRef = useRef({ onComplete, onError, onProgress });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onComplete, onError, onProgress };
  }, [onComplete, onError, onProgress]);

  // Subscribe to progress updates
  useEffect(() => {
    const unsubscribe = progressTracker.subscribe(operationId, (update) => {
      const enhancedUpdate = update as EnhancedProgressUpdate;
      setProgressState(enhancedUpdate);
      
      // Update notifications
      const currentNotifications = progressTracker.getNotifications(operationId);
      setNotifications(currentNotifications);
      
      // Call callbacks
      callbacksRef.current.onProgress?.(enhancedUpdate);
      
      if (enhancedUpdate.stage === 'complete') {
        callbacksRef.current.onComplete?.(operationId);
      } else if (enhancedUpdate.stage === 'failed') {
        callbacksRef.current.onError?.(operationId, enhancedUpdate.message);
      }
    });

    // Load existing progress
    const existingProgress = progressTracker.getProgress(operationId);
    if (existingProgress) {
      setProgressState(existingProgress);
      const existingNotifications = progressTracker.getNotifications(operationId);
      setNotifications(existingNotifications);
    }

    return unsubscribe;
  }, [operationId]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !progressState) {
      start('initializing', 'Starting operation...');
    }
  }, [autoStart, progressState]);

  // Control methods
  const start = useCallback((
    stage: string, 
    message: string, 
    options?: {
      totalItems?: number;
      canCancel?: boolean;
      canPause?: boolean;
      subStages?: ProgressSubStage[];
    }
  ) => {
    progressTracker.start(operationId, stage, message, options);
  }, [operationId]);

  const update = useCallback((updates: Partial<EnhancedProgressUpdate>) => {
    const current = progressTracker.getProgress(operationId);
    if (current) {
      progressTracker.updateProgress(operationId, { ...current, ...updates });
    }
  }, [operationId]);

  const setStage = useCallback((stage: string, message?: string) => {
    const current = progressTracker.getProgress(operationId);
    if (current) {
      progressTracker.updateProgress(operationId, {
        ...current,
        stage,
        message: message || current.message,
      });
    }
  }, [operationId]);

  const setProgress = useCallback((percentage: number, message?: string) => {
    const current = progressTracker.getProgress(operationId);
    if (current) {
      progressTracker.updateProgress(operationId, {
        ...current,
        percentage: Math.max(0, Math.min(100, percentage)),
        message: message || current.message,
      });
    }
  }, [operationId]);

  const setCurrentItem = useCallback((item: string) => {
    update({ currentItem: item });
  }, [update]);

  const incrementProcessed = useCallback((count: number = 1) => {
    const current = progressTracker.getProgress(operationId);
    if (current) {
      const newProcessed = (current.processedItems || 0) + count;
      const percentage = current.totalItems 
        ? Math.min(100, (newProcessed / current.totalItems) * 100)
        : current.percentage;
      
      update({ 
        processedItems: newProcessed,
        percentage,
      });
    }
  }, [operationId, update]);

  const addWarning = useCallback((warning: string) => {
    progressTracker.addWarning(operationId, warning);
  }, [operationId]);

  const updateSubStage = useCallback((
    stageName: string, 
    status: ProgressSubStage['status'], 
    percentage?: number
  ) => {
    progressTracker.updateSubStage(operationId, stageName, status, percentage);
  }, [operationId]);

  const complete = useCallback((message?: string) => {
    progressTracker.complete(operationId, message);
  }, [operationId]);

  const fail = useCallback((error: string, details?: Record<string, any>) => {
    progressTracker.fail(operationId, error, details);
  }, [operationId]);

  const pause = useCallback(() => {
    progressTracker.pause(operationId);
  }, [operationId]);

  const resume = useCallback(() => {
    progressTracker.resume(operationId);
  }, [operationId]);

  const cancel = useCallback((reason?: string) => {
    progressTracker.cancel(operationId, reason);
  }, [operationId]);

  const clear = useCallback(() => {
    progressTracker.clear(operationId);
  }, [operationId]);

  // Utility methods
  const getTimeElapsed = useCallback((): number => {
    if (!progressState?.startTime) return 0;
    return Date.now() - progressState.startTime;
  }, [progressState?.startTime]);

  const getEstimatedTimeRemaining = useCallback((): number | undefined => {
    return progressState?.estimatedTimeRemaining;
  }, [progressState?.estimatedTimeRemaining]);

  const getThroughput = useCallback((): number | undefined => {
    return progressState?.throughput;
  }, [progressState?.throughput]);

  // Computed state
  const isActive = progressState ? progressState.percentage < 100 && progressState.stage !== 'failed' && progressState.stage !== 'cancelled' : false;
  const isCompleted = progressState?.stage === 'complete';
  const isFailed = progressState?.stage === 'failed';
  const isPaused = progressState?.isPaused || false;

  return {
    // Current state
    progress: progressState,
    notifications,
    isActive,
    isCompleted,
    isFailed,
    isPaused,
    
    // Control methods
    start,
    update,
    setStage,
    setProgress,
    setCurrentItem,
    incrementProcessed,
    addWarning,
    updateSubStage,
    complete,
    fail,
    pause,
    resume,
    cancel,
    clear,
    
    // Utility methods
    getTimeElapsed,
    getEstimatedTimeRemaining,
    getThroughput,
  };
}

// Hook for monitoring multiple operations
export interface UseGlobalProgressOptions {
  maxOperations?: number;
  filterCompleted?: boolean;
}

export function useGlobalProgress({
  maxOperations = 10,
  filterCompleted = true,
}: UseGlobalProgressOptions = {}) {
  const [operations, setOperations] = useState<EnhancedProgressUpdate[]>([]);

  useEffect(() => {
    const unsubscribe = progressTracker.subscribeGlobal((update) => {
      setOperations(current => {
        const filtered = current.filter(op => op.operationId !== update.operationId);
        
        // Filter completed operations if requested
        if (filterCompleted && (update.percentage >= 100 || update.stage === 'failed' || update.stage === 'cancelled')) {
          return filtered;
        }
        
        return [...filtered, update as EnhancedProgressUpdate].slice(-maxOperations);
      });
    });

    return unsubscribe;
  }, [maxOperations, filterCompleted]);

  const activeOperations = operations.filter(op => 
    op.percentage < 100 && op.stage !== 'failed' && op.stage !== 'cancelled'
  );

  const completedOperations = operations.filter(op => op.stage === 'complete');
  const failedOperations = operations.filter(op => op.stage === 'failed');

  return {
    operations,
    activeOperations,
    completedOperations,
    failedOperations,
    hasActiveOperations: activeOperations.length > 0,
    totalActiveOperations: activeOperations.length,
  };
}