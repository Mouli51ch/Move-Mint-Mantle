/**
 * React Hook for Session Management
 * Provides session state management and persistence across components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  sessionService, 
  WorkflowSession, 
  VideoUploadSession, 
  AnalysisSession, 
  LicenseSession, 
  MintingSession 
} from '@/lib/services/session-service';

export interface UseSessionReturn {
  // Current session state
  workflowSession: WorkflowSession | null;
  currentStep: WorkflowSession['currentStep'] | null;
  isSessionActive: boolean;
  
  // Session operations
  restoreSession: () => WorkflowSession | null;
  clearSession: () => void;
  updateWorkflowStep: (step: WorkflowSession['currentStep']) => void;
  
  // Video upload session
  videoUploadSession: VideoUploadSession | null;
  saveVideoUpload: (session: VideoUploadSession) => void;
  updateUploadProgress: (videoId: string, progress: number, status: VideoUploadSession['uploadStatus']) => void;
  clearVideoUpload: () => void;
  
  // Analysis session
  analysisSession: AnalysisSession | null;
  saveAnalysis: (session: AnalysisSession) => void;
  clearAnalysis: () => void;
  
  // License session
  licenseSession: LicenseSession | null;
  saveLicense: (session: LicenseSession) => void;
  clearLicense: () => void;
  
  // Minting session
  mintingSession: MintingSession | null;
  saveMinting: (session: MintingSession) => void;
  updateMintingStatus: (
    status: MintingSession['mintingStatus'], 
    transactionHash?: string, 
    errorMessage?: string
  ) => void;
  clearMinting: () => void;
  
  // Utility methods
  getCurrentVideoId: () => string | null;
  setCurrentVideoId: (videoId: string) => void;
  hasValidSession: () => boolean;
}

export function useSession(): UseSessionReturn {
  // State for session data
  const [workflowSession, setWorkflowSession] = useState<WorkflowSession | null>(null);
  const [videoUploadSession, setVideoUploadSession] = useState<VideoUploadSession | null>(null);
  const [analysisSession, setAnalysisSession] = useState<AnalysisSession | null>(null);
  const [licenseSession, setLicenseSession] = useState<LicenseSession | null>(null);
  const [mintingSession, setMintingSession] = useState<MintingSession | null>(null);

  // Initialize session on mount
  useEffect(() => {
    loadAllSessions();
  }, []);

  // Load all session data
  const loadAllSessions = useCallback(() => {
    try {
      setWorkflowSession(sessionService.getWorkflowSession());
      setVideoUploadSession(sessionService.getVideoUploadSession());
      setAnalysisSession(sessionService.getAnalysisSession());
      setLicenseSession(sessionService.getLicenseSession());
      setMintingSession(sessionService.getMintingSession());
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  // ========================================
  // Workflow Session Operations
  // ========================================

  const restoreSession = useCallback((): WorkflowSession | null => {
    try {
      const restored = sessionService.restoreSession();
      setWorkflowSession(restored);
      if (restored) {
        loadAllSessions();
      }
      return restored;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return null;
    }
  }, [loadAllSessions]);

  const clearSession = useCallback(() => {
    try {
      sessionService.clearWorkflowSession();
      setWorkflowSession(null);
      setVideoUploadSession(null);
      setAnalysisSession(null);
      setLicenseSession(null);
      setMintingSession(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  const updateWorkflowStep = useCallback((step: WorkflowSession['currentStep']) => {
    try {
      sessionService.updateWorkflowSession({ currentStep: step });
      setWorkflowSession(sessionService.getWorkflowSession());
    } catch (error) {
      console.error('Failed to update workflow step:', error);
    }
  }, []);

  // ========================================
  // Video Upload Session Operations
  // ========================================

  const saveVideoUpload = useCallback((session: VideoUploadSession) => {
    try {
      sessionService.saveVideoUploadSession(session);
      setVideoUploadSession(session);
      setWorkflowSession(sessionService.getWorkflowSession());
    } catch (error) {
      console.error('Failed to save video upload session:', error);
    }
  }, []);

  const updateUploadProgress = useCallback((
    videoId: string, 
    progress: number, 
    status: VideoUploadSession['uploadStatus']
  ) => {
    try {
      sessionService.updateVideoUploadProgress(videoId, progress, status);
      setVideoUploadSession(sessionService.getVideoUploadSession());
    } catch (error) {
      console.error('Failed to update upload progress:', error);
    }
  }, []);

  const clearVideoUpload = useCallback(() => {
    try {
      sessionService.clearVideoUploadSession();
      setVideoUploadSession(null);
    } catch (error) {
      console.error('Failed to clear video upload session:', error);
    }
  }, []);

  // ========================================
  // Analysis Session Operations
  // ========================================

  const saveAnalysis = useCallback((session: AnalysisSession) => {
    try {
      sessionService.saveAnalysisSession(session);
      setAnalysisSession(session);
      setWorkflowSession(sessionService.getWorkflowSession());
    } catch (error) {
      console.error('Failed to save analysis session:', error);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    try {
      sessionService.clearAnalysisSession();
      setAnalysisSession(null);
    } catch (error) {
      console.error('Failed to clear analysis session:', error);
    }
  }, []);

  // ========================================
  // License Session Operations
  // ========================================

  const saveLicense = useCallback((session: LicenseSession) => {
    try {
      sessionService.saveLicenseSession(session);
      setLicenseSession(session);
      setWorkflowSession(sessionService.getWorkflowSession());
    } catch (error) {
      console.error('Failed to save license session:', error);
    }
  }, []);

  const clearLicense = useCallback(() => {
    try {
      sessionService.clearLicenseSession();
      setLicenseSession(null);
    } catch (error) {
      console.error('Failed to clear license session:', error);
    }
  }, []);

  // ========================================
  // Minting Session Operations
  // ========================================

  const saveMinting = useCallback((session: MintingSession) => {
    try {
      sessionService.saveMintingSession(session);
      setMintingSession(session);
      setWorkflowSession(sessionService.getWorkflowSession());
    } catch (error) {
      console.error('Failed to save minting session:', error);
    }
  }, []);

  const updateMintingStatus = useCallback((
    status: MintingSession['mintingStatus'], 
    transactionHash?: string, 
    errorMessage?: string
  ) => {
    try {
      sessionService.updateMintingStatus(status, transactionHash, errorMessage);
      setMintingSession(sessionService.getMintingSession());
    } catch (error) {
      console.error('Failed to update minting status:', error);
    }
  }, []);

  const clearMinting = useCallback(() => {
    try {
      sessionService.clearMintingSession();
      setMintingSession(null);
    } catch (error) {
      console.error('Failed to clear minting session:', error);
    }
  }, []);

  // ========================================
  // Utility Methods
  // ========================================

  const getCurrentVideoId = useCallback((): string | null => {
    return sessionService.getCurrentVideoId();
  }, []);

  const setCurrentVideoId = useCallback((videoId: string) => {
    sessionService.setCurrentVideoId(videoId);
  }, []);

  const hasValidSession = useCallback((): boolean => {
    return workflowSession !== null && workflowSession.currentStep !== null;
  }, [workflowSession]);

  // Computed values
  const currentStep = workflowSession?.currentStep || null;
  const isSessionActive = workflowSession !== null;

  return {
    // Current session state
    workflowSession,
    currentStep,
    isSessionActive,
    
    // Session operations
    restoreSession,
    clearSession,
    updateWorkflowStep,
    
    // Video upload session
    videoUploadSession,
    saveVideoUpload,
    updateUploadProgress,
    clearVideoUpload,
    
    // Analysis session
    analysisSession,
    saveAnalysis,
    clearAnalysis,
    
    // License session
    licenseSession,
    saveLicense,
    clearLicense,
    
    // Minting session
    mintingSession,
    saveMinting,
    updateMintingStatus,
    clearMinting,
    
    // Utility methods
    getCurrentVideoId,
    setCurrentVideoId,
    hasValidSession,
  };
}

// Hook for session restoration on app initialization
export function useSessionRestore() {
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoredSession, setRestoredSession] = useState<WorkflowSession | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = sessionService.restoreSession();
        setRestoredSession(session);
      } catch (error) {
        console.error('Failed to restore session on app init:', error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  return {
    isRestoring,
    restoredSession,
    hasRestoredSession: restoredSession !== null,
  };
}