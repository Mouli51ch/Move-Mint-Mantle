/**
 * Session Restore Banner Component
 * Shows a banner when a previous session is detected and allows restoration
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkflowSession } from '@/lib/services/session-service';
import { useRouter } from 'next/navigation';

interface SessionRestoreBannerProps {
  session: WorkflowSession;
  onRestore: () => void;
  onDismiss: () => void;
}

export function SessionRestoreBanner({ session, onRestore, onDismiss }: SessionRestoreBannerProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      onRestore();
      
      // Navigate to appropriate step
      const stepRoutes = {
        upload: '/app/upload',
        analysis: '/app/upload',
        results: '/app/results',
        license: '/app/mint',
        minting: '/app/mint',
        complete: '/app/dashboard',
      };
      
      const targetRoute = stepRoutes[session.currentStep] || '/app/upload';
      router.push(targetRoute);
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const getSessionDescription = () => {
    const stepDescriptions = {
      upload: 'video upload in progress',
      analysis: 'video being analyzed',
      results: 'analysis results ready',
      license: 'license configuration',
      minting: 'NFT minting process',
      complete: 'completed workflow',
    };

    const timeAgo = getTimeAgo(session.lastUpdatedAt);
    return `${stepDescriptions[session.currentStep]} from ${timeAgo}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  return (
    <div className="bg-gradient-to-r from-blue-950/30 to-blue-900/20 border border-blue-400/30 rounded-xl p-4 mb-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-400 text-xl mt-0.5">🔄</div>
          <div className="flex-1">
            <h3 className="text-blue-400 font-medium mb-1">Previous Session Found</h3>
            <p className="text-blue-300/80 text-sm mb-3">
              We found a {getSessionDescription()}. Would you like to continue where you left off?
            </p>
            
            {/* Session Details */}
            <div className="bg-blue-950/20 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-blue-300/60">Current Step:</span>
                  <span className="text-blue-200 ml-2 capitalize">{session.currentStep}</span>
                </div>
                <div>
                  <span className="text-blue-300/60">Last Updated:</span>
                  <span className="text-blue-200 ml-2">{getTimeAgo(session.lastUpdatedAt)}</span>
                </div>
                {session.upload && (
                  <div>
                    <span className="text-blue-300/60">Video:</span>
                    <span className="text-blue-200 ml-2">{session.upload.fileName}</span>
                  </div>
                )}
                {session.minting && (
                  <div>
                    <span className="text-blue-300/60">NFT Title:</span>
                    <span className="text-blue-200 ml-2">{session.minting.nftTitle}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleRestore}
                disabled={isRestoring}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 h-auto"
              >
                {isRestoring ? 'Restoring...' : 'Continue Session'}
              </Button>
              <Button
                onClick={onDismiss}
                disabled={isRestoring}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-2 h-auto"
              >
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          disabled={isRestoring}
          className="text-blue-300 hover:text-blue-200 flex-shrink-0 disabled:opacity-50"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Session restore provider component
interface SessionRestoreProviderProps {
  children: React.ReactNode;
}

export function SessionRestoreProvider({ children }: SessionRestoreProviderProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [restoredSession, setRestoredSession] = useState<WorkflowSession | null>(null);

  React.useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { sessionService } = await import('@/lib/services/session-service');
        const session = sessionService.getWorkflowSession();
        
        if (session && session.currentStep !== 'complete') {
          setRestoredSession(session);
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Failed to check for existing session:', error);
      }
    };

    checkSession();
  }, []);

  const handleRestore = () => {
    setShowBanner(false);
    // Session is already loaded, just hide the banner
  };

  const handleDismiss = async () => {
    try {
      const { sessionService } = await import('@/lib/services/session-service');
      sessionService.clearWorkflowSession();
      setShowBanner(false);
      setRestoredSession(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  return (
    <>
      {showBanner && restoredSession && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-2xl mx-auto">
          <SessionRestoreBanner
            session={restoredSession}
            onRestore={handleRestore}
            onDismiss={handleDismiss}
          />
        </div>
      )}
      {children}
    </>
  );
}