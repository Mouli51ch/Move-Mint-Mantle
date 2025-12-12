/**
 * Session Service for Workflow State Preservation
 * Handles session data persistence across navigation and page refresh
 */

import { DanceAnalysisResults } from '@/lib/types/api';

// Session data interfaces
export interface VideoUploadSession {
  videoId: string;
  fileName: string;
  fileSize: number;
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  uploadedAt: number;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface AnalysisSession {
  videoId: string;
  analysisResults: DanceAnalysisResults;
  analysisCompletedAt: number;
  qualityScore: number;
}

export interface LicenseSession {
  licenseId?: string;
  templateId?: string;
  customParams?: any;
  generatedLicense?: any;
  configuredAt: number;
}

export interface MintingSession {
  videoId: string;
  nftTitle: string;
  nftDescription?: string;
  tags?: string[];
  price?: string;
  isPrivate: boolean;
  licenseConfig: LicenseSession;
  transactionHash?: string;
  mintingStatus: 'idle' | 'preparing' | 'signing' | 'confirming' | 'complete' | 'error';
  mintedAt?: number;
  errorMessage?: string;
  canRetry: boolean;
}

export interface WorkflowSession {
  currentStep: 'upload' | 'analysis' | 'results' | 'license' | 'minting' | 'complete';
  startedAt: number;
  lastUpdatedAt: number;
  upload?: VideoUploadSession;
  analysis?: AnalysisSession;
  license?: LicenseSession;
  minting?: MintingSession;
}

// Session storage keys
const SESSION_KEYS = {
  WORKFLOW: 'movemint_workflow_session',
  VIDEO_UPLOAD: 'movemint_video_upload',
  ANALYSIS_RESULTS: 'movemint_analysis_results',
  LICENSE_CONFIG: 'movemint_license_config',
  MINTING_STATE: 'movemint_minting_state',
  CURRENT_VIDEO_ID: 'currentVideoId',
  ANALYSIS_RESULTS_LEGACY: 'analysisResults', // For backward compatibility
} as const;

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export class SessionService {
  private static instance: SessionService;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeCleanup();
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // ========================================
  // Workflow Session Management
  // ========================================

  /**
   * Get current workflow session
   */
  getWorkflowSession(): WorkflowSession | null {
    try {
      const sessionData = this.getItem(SESSION_KEYS.WORKFLOW);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as WorkflowSession;
      
      // Check if session has expired
      if (this.isExpired(session.lastUpdatedAt)) {
        this.clearWorkflowSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get workflow session:', error);
      this.clearWorkflowSession();
      return null;
    }
  }

  /**
   * Update workflow session
   */
  updateWorkflowSession(updates: Partial<WorkflowSession>): void {
    try {
      const currentSession = this.getWorkflowSession();
      const now = Date.now();

      const updatedSession: WorkflowSession = {
        currentStep: 'upload',
        startedAt: now,
        lastUpdatedAt: now,
        ...currentSession,
        ...updates,
        lastUpdatedAt: now,
      };

      this.setItem(SESSION_KEYS.WORKFLOW, JSON.stringify(updatedSession));
    } catch (error) {
      console.error('Failed to update workflow session:', error);
    }
  }

  /**
   * Clear workflow session
   */
  clearWorkflowSession(): void {
    try {
      this.removeItem(SESSION_KEYS.WORKFLOW);
      this.removeItem(SESSION_KEYS.VIDEO_UPLOAD);
      this.removeItem(SESSION_KEYS.ANALYSIS_RESULTS);
      this.removeItem(SESSION_KEYS.LICENSE_CONFIG);
      this.removeItem(SESSION_KEYS.MINTING_STATE);
      this.removeItem(SESSION_KEYS.CURRENT_VIDEO_ID);
      this.removeItem(SESSION_KEYS.ANALYSIS_RESULTS_LEGACY);
    } catch (error) {
      console.error('Failed to clear workflow session:', error);
    }
  }

  // ========================================
  // Video Upload Session
  // ========================================

  /**
   * Save video upload session
   */
  saveVideoUploadSession(session: VideoUploadSession): void {
    try {
      this.setItem(SESSION_KEYS.VIDEO_UPLOAD, JSON.stringify(session));
      this.setItem(SESSION_KEYS.CURRENT_VIDEO_ID, session.videoId);
      
      this.updateWorkflowSession({
        currentStep: 'upload',
        upload: session,
      });
    } catch (error) {
      console.error('Failed to save video upload session:', error);
    }
  }

  /**
   * Get video upload session
   */
  getVideoUploadSession(): VideoUploadSession | null {
    try {
      const sessionData = this.getItem(SESSION_KEYS.VIDEO_UPLOAD);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as VideoUploadSession;
      
      if (this.isExpired(session.uploadedAt)) {
        this.clearVideoUploadSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get video upload session:', error);
      return null;
    }
  }

  /**
   * Update video upload progress
   */
  updateVideoUploadProgress(videoId: string, progress: number, status: VideoUploadSession['uploadStatus']): void {
    try {
      const session = this.getVideoUploadSession();
      if (session && session.videoId === videoId) {
        session.uploadProgress = progress;
        session.uploadStatus = status;
        this.saveVideoUploadSession(session);
      }
    } catch (error) {
      console.error('Failed to update video upload progress:', error);
    }
  }

  /**
   * Clear video upload session
   */
  clearVideoUploadSession(): void {
    try {
      this.removeItem(SESSION_KEYS.VIDEO_UPLOAD);
      this.removeItem(SESSION_KEYS.CURRENT_VIDEO_ID);
    } catch (error) {
      console.error('Failed to clear video upload session:', error);
    }
  }

  // ========================================
  // Analysis Session
  // ========================================

  /**
   * Save analysis session
   */
  saveAnalysisSession(session: AnalysisSession): void {
    try {
      this.setItem(SESSION_KEYS.ANALYSIS_RESULTS, JSON.stringify(session.analysisResults));
      this.setItem(SESSION_KEYS.ANALYSIS_RESULTS_LEGACY, JSON.stringify(session.analysisResults));
      
      this.updateWorkflowSession({
        currentStep: 'results',
        analysis: session,
      });
    } catch (error) {
      console.error('Failed to save analysis session:', error);
    }
  }

  /**
   * Get analysis session
   */
  getAnalysisSession(): AnalysisSession | null {
    try {
      const sessionData = this.getItem(SESSION_KEYS.ANALYSIS_RESULTS);
      if (!sessionData) {
        // Try legacy format for backward compatibility
        const legacyData = this.getItem(SESSION_KEYS.ANALYSIS_RESULTS_LEGACY);
        if (legacyData) {
          const analysisResults = JSON.parse(legacyData) as DanceAnalysisResults;
          return {
            videoId: analysisResults.videoId,
            analysisResults,
            analysisCompletedAt: Date.now(),
            qualityScore: analysisResults.qualityMetrics.overall,
          };
        }
        return null;
      }

      const analysisResults = JSON.parse(sessionData) as DanceAnalysisResults;
      return {
        videoId: analysisResults.videoId,
        analysisResults,
        analysisCompletedAt: Date.now(),
        qualityScore: analysisResults.qualityMetrics.overall,
      };
    } catch (error) {
      console.error('Failed to get analysis session:', error);
      return null;
    }
  }

  /**
   * Clear analysis session
   */
  clearAnalysisSession(): void {
    try {
      this.removeItem(SESSION_KEYS.ANALYSIS_RESULTS);
      this.removeItem(SESSION_KEYS.ANALYSIS_RESULTS_LEGACY);
    } catch (error) {
      console.error('Failed to clear analysis session:', error);
    }
  }

  // ========================================
  // License Session
  // ========================================

  /**
   * Save license session
   */
  saveLicenseSession(session: LicenseSession): void {
    try {
      this.setItem(SESSION_KEYS.LICENSE_CONFIG, JSON.stringify(session));
      
      this.updateWorkflowSession({
        currentStep: 'license',
        license: session,
      });
    } catch (error) {
      console.error('Failed to save license session:', error);
    }
  }

  /**
   * Get license session
   */
  getLicenseSession(): LicenseSession | null {
    try {
      const sessionData = this.getItem(SESSION_KEYS.LICENSE_CONFIG);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as LicenseSession;
      
      if (this.isExpired(session.configuredAt)) {
        this.clearLicenseSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get license session:', error);
      return null;
    }
  }

  /**
   * Clear license session
   */
  clearLicenseSession(): void {
    try {
      this.removeItem(SESSION_KEYS.LICENSE_CONFIG);
    } catch (error) {
      console.error('Failed to clear license session:', error);
    }
  }

  // ========================================
  // Minting Session
  // ========================================

  /**
   * Save minting session
   */
  saveMintingSession(session: MintingSession): void {
    try {
      this.setItem(SESSION_KEYS.MINTING_STATE, JSON.stringify(session));
      
      this.updateWorkflowSession({
        currentStep: 'minting',
        minting: session,
      });
    } catch (error) {
      console.error('Failed to save minting session:', error);
    }
  }

  /**
   * Get minting session
   */
  getMintingSession(): MintingSession | null {
    try {
      const sessionData = this.getItem(SESSION_KEYS.MINTING_STATE);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as MintingSession;
      
      if (session.mintedAt && this.isExpired(session.mintedAt)) {
        this.clearMintingSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get minting session:', error);
      return null;
    }
  }

  /**
   * Update minting status
   */
  updateMintingStatus(
    status: MintingSession['mintingStatus'], 
    transactionHash?: string, 
    errorMessage?: string
  ): void {
    try {
      const session = this.getMintingSession();
      if (session) {
        session.mintingStatus = status;
        if (transactionHash) session.transactionHash = transactionHash;
        if (errorMessage) session.errorMessage = errorMessage;
        if (status === 'complete') session.mintedAt = Date.now();
        
        this.saveMintingSession(session);
      }
    } catch (error) {
      console.error('Failed to update minting status:', error);
    }
  }

  /**
   * Clear minting session
   */
  clearMintingSession(): void {
    try {
      this.removeItem(SESSION_KEYS.MINTING_STATE);
    } catch (error) {
      console.error('Failed to clear minting session:', error);
    }
  }

  // ========================================
  // Session Restoration
  // ========================================

  /**
   * Restore session after interruption
   */
  restoreSession(): WorkflowSession | null {
    try {
      const workflowSession = this.getWorkflowSession();
      if (!workflowSession) return null;

      // Validate session integrity
      if (!this.validateSessionIntegrity(workflowSession)) {
        console.warn('Session integrity check failed, clearing corrupted session');
        this.clearWorkflowSession();
        return null;
      }

      return workflowSession;
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearWorkflowSession();
      return null;
    }
  }

  /**
   * Validate session integrity
   */
  private validateSessionIntegrity(session: WorkflowSession): boolean {
    try {
      // Check required fields
      if (!session.currentStep || !session.startedAt || !session.lastUpdatedAt) {
        return false;
      }

      // Check step-specific data integrity
      switch (session.currentStep) {
        case 'upload':
          return session.upload ? this.validateVideoUploadSession(session.upload) : true;
        case 'analysis':
        case 'results':
          return session.analysis ? this.validateAnalysisSession(session.analysis) : true;
        case 'license':
          return session.license ? this.validateLicenseSession(session.license) : true;
        case 'minting':
          return session.minting ? this.validateMintingSession(session.minting) : true;
        default:
          return true;
      }
    } catch (error) {
      console.error('Session integrity validation error:', error);
      return false;
    }
  }

  private validateVideoUploadSession(session: VideoUploadSession): boolean {
    return !!(session.videoId && session.fileName && typeof session.uploadProgress === 'number');
  }

  private validateAnalysisSession(session: AnalysisSession): boolean {
    return !!(session.videoId && session.analysisResults && session.analysisResults.detectedMovements);
  }

  private validateLicenseSession(session: LicenseSession): boolean {
    return !!(session.configuredAt && (session.templateId || session.customParams));
  }

  private validateMintingSession(session: MintingSession): boolean {
    return !!(session.videoId && session.nftTitle && session.licenseConfig);
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Check if timestamp is expired
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > SESSION_TIMEOUT;
  }

  /**
   * Get current video ID (for backward compatibility)
   */
  getCurrentVideoId(): string | null {
    return this.getItem(SESSION_KEYS.CURRENT_VIDEO_ID);
  }

  /**
   * Set current video ID (for backward compatibility)
   */
  setCurrentVideoId(videoId: string): void {
    this.setItem(SESSION_KEYS.CURRENT_VIDEO_ID, videoId);
  }

  /**
   * Get session storage item safely
   */
  private getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get session item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set session storage item safely
   */
  private setItem(key: string, value: string): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set session item ${key}:`, error);
    }
  }

  /**
   * Remove session storage item safely
   */
  private removeItem(key: string): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove session item ${key}:`, error);
    }
  }

  /**
   * Initialize automatic cleanup
   */
  private initializeCleanup(): void {
    if (typeof window === 'undefined') return;

    // Clean up expired sessions every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanupExpiredSessions();
    });
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    try {
      const workflowSession = this.getWorkflowSession();
      if (workflowSession && this.isExpired(workflowSession.lastUpdatedAt)) {
        this.clearWorkflowSession();
      }
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  }

  /**
   * Destroy service instance (for cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();