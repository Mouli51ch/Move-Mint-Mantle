/**
 * Real-Time Progress Feedback Component
 * Provides comprehensive progress tracking with notifications and detailed feedback
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  progressTracker, 
  EnhancedProgressUpdate, 
  ProgressNotification, 
  ProgressSubStage 
} from '@/lib/utils/progress-tracker';

interface RealTimeProgressProps {
  operationId: string;
  title?: string;
  showNotifications?: boolean;
  showSubStages?: boolean;
  showThroughput?: boolean;
  showTimeRemaining?: boolean;
  allowCancel?: boolean;
  allowPause?: boolean;
  onComplete?: (operationId: string) => void;
  onError?: (operationId: string, error: string) => void;
  onCancel?: (operationId: string) => void;
  className?: string;
}

export function RealTimeProgress({
  operationId,
  title,
  showNotifications = true,
  showSubStages = true,
  showThroughput = false,
  showTimeRemaining = true,
  allowCancel = false,
  allowPause = false,
  onComplete,
  onError,
  onCancel,
  className = '',
}: RealTimeProgressProps) {
  const [progress, setProgress] = useState<EnhancedProgressUpdate | null>(null);
  const [notifications, setNotifications] = useState<ProgressNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Subscribe to progress updates
  useEffect(() => {
    const unsubscribe = progressTracker.subscribe(operationId, (update) => {
      const enhancedUpdate = update as EnhancedProgressUpdate;
      setProgress(enhancedUpdate);
      
      // Handle completion and errors
      if (enhancedUpdate.stage === 'complete' && onComplete) {
        onComplete(operationId);
      } else if (enhancedUpdate.stage === 'failed' && onError) {
        onError(operationId, enhancedUpdate.message);
      }
    });

    // Load initial progress if exists
    const initialProgress = progressTracker.getProgress(operationId);
    if (initialProgress) {
      setProgress(initialProgress);
    }

    // Load notifications
    const initialNotifications = progressTracker.getNotifications(operationId);
    setNotifications(initialNotifications);

    return unsubscribe;
  }, [operationId, onComplete, onError]);

  // Update notifications when progress changes
  useEffect(() => {
    if (progress) {
      const currentNotifications = progressTracker.getNotifications(operationId);
      setNotifications(currentNotifications);
    }
  }, [progress, operationId]);

  const handleCancel = useCallback(() => {
    progressTracker.cancel(operationId, 'Cancelled by user');
    onCancel?.(operationId);
  }, [operationId, onCancel]);

  const handlePause = useCallback(() => {
    if (progress?.isPaused) {
      progressTracker.resume(operationId);
    } else {
      progressTracker.pause(operationId);
    }
  }, [operationId, progress?.isPaused]);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatThroughput = (throughput: number): string => {
    if (throughput < 1) return `${(throughput * 1000).toFixed(0)} items/s`;
    if (throughput < 1000) return `${throughput.toFixed(1)} items/s`;
    return `${(throughput / 1000).toFixed(1)}K items/s`;
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'complete': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'cancelled': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getSubStageIcon = (status: ProgressSubStage['status']): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'failed': return '✗';
      case 'active': return '⟳';
      default: return '○';
    }
  };

  if (!progress) {
    return null;
  }

  return (
    <div className={`bg-black border border-green-900/30 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-lg ${getStageColor(progress.stage)}`}>
            {progress.stage === 'complete' ? '✓' : 
             progress.stage === 'failed' ? '✗' : 
             progress.stage === 'cancelled' ? '⚠' : '⟳'}
          </div>
          <div>
            <h3 className="text-white font-medium">
              {title || `Operation ${operationId.slice(0, 8)}...`}
            </h3>
            <p className="text-gray-400 text-sm">{progress.message}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Controls */}
          {allowPause && progress.canPause && progress.stage !== 'complete' && progress.stage !== 'failed' && (
            <Button
              onClick={handlePause}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {progress.isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          {allowCancel && progress.canCancel && progress.stage !== 'complete' && progress.stage !== 'failed' && (
            <Button
              onClick={handleCancel}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel
            </Button>
          )}
          
          {/* Expand/Collapse */}
          {(showSubStages || showNotifications) && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress.percentage)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 relative overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              progress.stage === 'complete' ? 'bg-green-500' :
              progress.stage === 'failed' ? 'bg-red-500' :
              progress.isPaused ? 'bg-yellow-500' :
              'bg-gradient-to-r from-green-400 to-green-600'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, progress.percentage))}%` }}
          />
          {progress.isPaused && (
            <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Status Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 mb-4">
        {showTimeRemaining && progress.estimatedTimeRemaining && (
          <div>
            <span className="block text-gray-500">Time Remaining</span>
            <span className="text-white">{formatTimeRemaining(progress.estimatedTimeRemaining)}</span>
          </div>
        )}
        
        {progress.processedItems !== undefined && progress.totalItems && (
          <div>
            <span className="block text-gray-500">Items</span>
            <span className="text-white">{progress.processedItems} / {progress.totalItems}</span>
          </div>
        )}
        
        {showThroughput && progress.throughput && (
          <div>
            <span className="block text-gray-500">Throughput</span>
            <span className="text-white">{formatThroughput(progress.throughput)}</span>
          </div>
        )}
        
        {progress.currentItem && (
          <div>
            <span className="block text-gray-500">Current</span>
            <span className="text-white truncate">{progress.currentItem}</span>
          </div>
        )}
      </div>

      {/* Warnings */}
      {progress.warnings && progress.warnings.length > 0 && (
        <div className="mb-4">
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400">⚠</span>
              <span className="text-yellow-400 text-sm font-medium">Warnings</span>
            </div>
            {progress.warnings.map((warning, index) => (
              <p key={index} className="text-yellow-300 text-xs mb-1 last:mb-0">
                {warning}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Sub-stages */}
          {showSubStages && progress.subStages && progress.subStages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Sub-stages</h4>
              <div className="space-y-2">
                {progress.subStages.map((subStage, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className={`w-4 text-center ${
                      subStage.status === 'completed' ? 'text-green-400' :
                      subStage.status === 'failed' ? 'text-red-400' :
                      subStage.status === 'active' ? 'text-blue-400' :
                      'text-gray-500'
                    }`}>
                      {getSubStageIcon(subStage.status)}
                    </span>
                    <span className="flex-1 text-gray-300">{subStage.name}</span>
                    <span className="text-gray-400">{Math.round(subStage.percentage)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {showNotifications && notifications.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Activity Log</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {notifications.slice(-10).reverse().map((notification, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 ${
                      notification.type === 'success' ? 'text-green-400' :
                      notification.type === 'error' ? 'text-red-400' :
                      notification.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {notification.type === 'success' ? '✓' :
                       notification.type === 'error' ? '✗' :
                       notification.type === 'warning' ? '⚠' : 'ℹ'}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-300">{notification.message}</p>
                      <p className="text-gray-500">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Global progress monitor component
interface GlobalProgressMonitorProps {
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export function GlobalProgressMonitor({
  maxVisible = 3,
  position = 'top-right',
  className = '',
}: GlobalProgressMonitorProps) {
  const [activeOperations, setActiveOperations] = useState<EnhancedProgressUpdate[]>([]);

  useEffect(() => {
    const unsubscribe = progressTracker.subscribeGlobal((update) => {
      setActiveOperations(current => {
        const filtered = current.filter(op => op.operationId !== update.operationId);
        
        // Only show active operations (not completed or failed)
        if (update.percentage < 100 && update.stage !== 'failed' && update.stage !== 'cancelled') {
          return [...filtered, update as EnhancedProgressUpdate].slice(-maxVisible);
        }
        
        return filtered;
      });
    });

    return unsubscribe;
  }, [maxVisible]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  if (activeOperations.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 max-w-sm ${className}`}>
      {activeOperations.map((operation) => (
        <RealTimeProgress
          key={operation.operationId}
          operationId={operation.operationId}
          showNotifications={false}
          showSubStages={false}
          className="animate-slide-in-right"
        />
      ))}
    </div>
  );
}