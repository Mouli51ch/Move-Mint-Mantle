/**
 * Network Status Component
 * Shows connection status and handles offline scenarios
 */

import React, { useState, useEffect } from 'react';
import { networkMonitor } from '@/lib/utils/error-handler';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
  className?: string;
}

export function NetworkStatus({ showWhenOnline = false, className = '' }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Initial status
    setIsOnline(networkMonitor.getStatus());

    // Subscribe to network changes
    const unsubscribe = networkMonitor.subscribe((online) => {
      setIsOnline(online);
      
      // Show status temporarily when coming back online
      if (online && !showWhenOnline) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    });

    return unsubscribe;
  }, [showWhenOnline]);

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !showStatus) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isOnline
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
            : 'bg-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-white' : 'bg-white animate-ping'
            }`}
          />
          {isOnline ? 'Connected' : 'No Internet Connection'}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(networkMonitor.getStatus());

    const unsubscribe = networkMonitor.subscribe((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}

/**
 * Offline fallback component
 */
export function OfflineFallback({ children }: { children: React.ReactNode }) {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">You're Offline</h2>
          <p className="text-gray-400 mb-6">
            Please check your internet connection and try again. Some features may not work while offline.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium px-6 py-3 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}