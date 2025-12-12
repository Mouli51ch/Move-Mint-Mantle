import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressUpdate } from '@/lib/types/api';
import { ProgressUtils } from '@/lib/utils/progress-tracker';

interface UploadProgressProps {
  progress: ProgressUpdate;
  fileName?: string;
  className?: string;
}

export function UploadProgress({ progress, fileName, className }: UploadProgressProps) {
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return null;
    return ProgressUtils.formatTimeRemaining(seconds);
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'validating':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'uploading':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'processing':
      case 'extracting':
      case 'analyzing':
        return (
          <svg className="w-5 h-5 text-yellow-400 animate-spin" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'complete':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        );
    }
  };

  const getProgressColor = (stage: string, percentage: number) => {
    if (stage === 'failed') return 'bg-red-500';
    if (stage === 'complete') return 'bg-green-500';
    if (percentage < 30) return 'bg-blue-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={`border-green-900/30 bg-black/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* File info */}
          {fileName && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{fileName}</p>
                <p className="text-gray-400 text-sm">Video file</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStageIcon(progress.stage)}
                <span className="text-white font-medium capitalize">
                  {progress.stage.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {Math.round(progress.percentage)}%
              </span>
            </div>
            
            <div className="relative">
              <Progress 
                value={progress.percentage} 
                className="h-2 bg-gray-800"
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.stage, progress.percentage)}`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Status message */}
          <div className="flex items-center justify-between">
            <p className="text-gray-300 text-sm">{progress.message}</p>
            {progress.estimatedTimeRemaining && (
              <p className="text-gray-400 text-xs">
                ~{formatTimeRemaining(progress.estimatedTimeRemaining)} remaining
              </p>
            )}
          </div>

          {/* Stage indicators */}
          <div className="flex items-center gap-2 pt-2">
            {['validating', 'uploading', 'processing', 'analyzing', 'complete'].map((stage, index) => {
              const isActive = progress.stage === stage;
              const isCompleted = ['validating', 'uploading', 'processing', 'analyzing'].indexOf(progress.stage) > index;
              
              return (
                <div
                  key={stage}
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-green-400 animate-pulse'
                      : isCompleted
                      ? 'bg-green-600'
                      : 'bg-gray-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}