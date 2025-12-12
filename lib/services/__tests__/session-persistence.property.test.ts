/**
 * Property-Based Tests for Session Persistence
 * 
 * **Feature: universal-minting-engine-integration, Property 9: Session persistence**
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
 * 
 * Tests session management and persistence across navigation and page refresh,
 * including session restoration after interruptions and corrupted data handling.
 */

import { jest } from '@jest/globals';
import * as fc from 'fast-check';
import { 
  SessionService, 
  WorkflowSession, 
  VideoUploadSession, 
  AnalysisSession, 
  LicenseSession, 
  MintingSession 
} from '../session-service';

// Mock sessionStorage
const mockSessionStorage = {
  store: new Map<string, string>(),
  getItem: jest.fn((key: string) => mockSessionStorage.store.get(key) || null),
  setItem: jest.fn((key: string, value: string) => {
    mockSessionStorage.store.set(key, value);
  }),
  removeItem: jest.fn((key: string) => {
    mockSessionStorage.store.delete(key);
  }),
  clear: jest.fn(() => {
    mockSessionStorage.store.clear();
  }),
};

// Mock window.sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Session Persistence Property-Based Tests', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    // Clear mock storage
    mockSessionStorage.store.clear();
    jest.clearAllMocks();
    
    // Create fresh session service instance
    sessionService = SessionService.getInstance();
  });

  /**
   * Property 9: Session persistence
   * For any workflow session data, the service should persist it across navigation 
   * and page refresh, restore it after interruptions, and handle corrupted data gracefully
   * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
   */
  describe('Property 9: Session persistence', () => {
    it('should persist and restore workflow sessions consistently', () => {
      fc.assert(
        fc.property(
          // Generate workflow session variations
          fc.record({
            currentStep: fc.constantFrom('upload', 'analysis', 'results', 'license', 'minting', 'complete'),
            startedAt: fc.integer({ min: Date.now() - 86400000, max: Date.now() }), // Last 24 hours
            lastUpdatedAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }), // Last hour
            upload: fc.option(fc.record({
              videoId: fc.string({ minLength: 10, maxLength: 50 }),
              fileName: fc.string({ minLength: 5, maxLength: 100 }),
              fileSize: fc.integer({ min: 1024, max: 500 * 1024 * 1024 }),
              uploadProgress: fc.integer({ min: 0, max: 100 }),
              uploadStatus: fc.constantFrom('idle', 'uploading', 'processing', 'completed', 'error'),
              uploadedAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
            })),
            analysis: fc.option(fc.record({
              videoId: fc.string({ minLength: 10, maxLength: 50 }),
              analysisResults: fc.record({
                videoId: fc.string({ minLength: 10, maxLength: 50 }),
                duration: fc.integer({ min: 30, max: 600 }),
                detectedMovements: fc.array(fc.record({
                  name: fc.string({ minLength: 3, maxLength: 30 }),
                  type: fc.constantFrom('Ballet', 'Hip-Hop', 'Contemporary', 'Jazz'),
                  confidence: fc.float({ min: 0.5, max: 1.0 }),
                }), { minLength: 1, maxLength: 10 }),
                qualityMetrics: fc.record({
                  overall: fc.integer({ min: 50, max: 100 }),
                  lighting: fc.integer({ min: 50, max: 100 }),
                  clarity: fc.integer({ min: 50, max: 100 }),
                  frameRate: fc.integer({ min: 50, max: 100 }),
                  stability: fc.integer({ min: 50, max: 100 }),
                }),
                poseData: fc.array(fc.record({
                  keypoints: fc.array(fc.record({
                    x: fc.float({ min: 0, max: 1920 }),
                    y: fc.float({ min: 0, max: 1080 }),
                    confidence: fc.float({ min: 0, max: 1 }),
                  })),
                  confidence: fc.float({ min: 0, max: 1 }),
                })),
                recommendations: fc.array(fc.string()),
              }),
              analysisCompletedAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
              qualityScore: fc.integer({ min: 50, max: 100 }),
            })),
            minting: fc.option(fc.record({
              videoId: fc.string({ minLength: 10, maxLength: 50 }),
              nftTitle: fc.string({ minLength: 1, maxLength: 60 }),
              nftDescription: fc.option(fc.string({ maxLength: 500 })),
              tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }))),
              price: fc.option(fc.string()),
              isPrivate: fc.boolean(),
              licenseConfig: fc.record({
                templateId: fc.option(fc.string()),
                customParams: fc.option(fc.object()),
                configuredAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
              }),
              mintingStatus: fc.constantFrom('idle', 'preparing', 'signing', 'confirming', 'complete', 'error'),
              canRetry: fc.boolean(),
            })),
          }),
          (sessionData) => {
            // Save workflow session
            sessionService.updateWorkflowSession(sessionData);

            // Verify session was saved
            const savedSession = sessionService.getWorkflowSession();
            expect(savedSession).not.toBeNull();
            expect(savedSession!.currentStep).toBe(sessionData.currentStep);

            // Simulate page refresh by creating new service instance
            const newSessionService = SessionService.getInstance();
            
            // Restore session
            const restoredSession = newSessionService.restoreSession();
            
            if (restoredSession) {
              expect(restoredSession.currentStep).toBe(sessionData.currentStep);
              expect(restoredSession.startedAt).toBe(sessionData.startedAt);
              
              // Verify sub-sessions are restored correctly
              if (sessionData.upload) {
                expect(restoredSession.upload).toBeDefined();
                expect(restoredSession.upload!.videoId).toBe(sessionData.upload.videoId);
              }
              
              if (sessionData.analysis) {
                expect(restoredSession.analysis).toBeDefined();
                expect(restoredSession.analysis!.videoId).toBe(sessionData.analysis.videoId);
              }
              
              if (sessionData.minting) {
                expect(restoredSession.minting).toBeDefined();
                expect(restoredSession.minting!.nftTitle).toBe(sessionData.minting.nftTitle);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle video upload session persistence consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            videoId: fc.string({ minLength: 10, maxLength: 50 }),
            fileName: fc.string({ minLength: 5, maxLength: 100 }),
            fileSize: fc.integer({ min: 1024, max: 500 * 1024 * 1024 }),
            uploadProgress: fc.integer({ min: 0, max: 100 }),
            uploadStatus: fc.constantFrom('idle', 'uploading', 'processing', 'completed', 'error'),
            uploadedAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
            metadata: fc.option(fc.record({
              title: fc.option(fc.string({ minLength: 1, maxLength: 60 })),
              description: fc.option(fc.string({ maxLength: 500 })),
              tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }))),
            })),
          }),
          (uploadSession) => {
            // Save upload session
            sessionService.saveVideoUploadSession(uploadSession);

            // Verify session was saved
            const savedSession = sessionService.getVideoUploadSession();
            expect(savedSession).not.toBeNull();
            expect(savedSession!.videoId).toBe(uploadSession.videoId);
            expect(savedSession!.fileName).toBe(uploadSession.fileName);
            expect(savedSession!.uploadStatus).toBe(uploadSession.uploadStatus);

            // Update progress
            const newProgress = Math.min(uploadSession.uploadProgress + 10, 100);
            const newStatus = newProgress === 100 ? 'completed' : 'processing';
            
            sessionService.updateVideoUploadProgress(uploadSession.videoId, newProgress, newStatus);

            // Verify progress was updated
            const updatedSession = sessionService.getVideoUploadSession();
            expect(updatedSession).not.toBeNull();
            expect(updatedSession!.uploadProgress).toBe(newProgress);
            expect(updatedSession!.uploadStatus).toBe(newStatus);

            // Clear session
            sessionService.clearVideoUploadSession();
            
            // Verify session was cleared
            const clearedSession = sessionService.getVideoUploadSession();
            expect(clearedSession).toBeNull();
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should handle analysis session persistence consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            videoId: fc.string({ minLength: 10, maxLength: 50 }),
            analysisResults: fc.record({
              videoId: fc.string({ minLength: 10, maxLength: 50 }),
              duration: fc.integer({ min: 30, max: 600 }),
              detectedMovements: fc.array(fc.record({
                name: fc.string({ minLength: 3, maxLength: 30 }),
                type: fc.constantFrom('Ballet', 'Hip-Hop', 'Contemporary', 'Jazz'),
                confidence: fc.float({ min: 0.5, max: 1.0 }),
              }), { minLength: 1, maxLength: 5 }),
              qualityMetrics: fc.record({
                overall: fc.integer({ min: 50, max: 100 }),
                lighting: fc.integer({ min: 50, max: 100 }),
                clarity: fc.integer({ min: 50, max: 100 }),
                frameRate: fc.integer({ min: 50, max: 100 }),
                stability: fc.integer({ min: 50, max: 100 }),
              }),
              poseData: fc.array(fc.record({
                keypoints: fc.array(fc.record({
                  x: fc.float({ min: 0, max: 1920 }),
                  y: fc.float({ min: 0, max: 1080 }),
                  confidence: fc.float({ min: 0, max: 1 }),
                })),
                confidence: fc.float({ min: 0, max: 1 }),
              })),
              recommendations: fc.array(fc.string()),
            }),
            analysisCompletedAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
            qualityScore: fc.integer({ min: 50, max: 100 }),
          }),
          (analysisSession) => {
            // Save analysis session
            sessionService.saveAnalysisSession(analysisSession);

            // Verify session was saved
            const savedSession = sessionService.getAnalysisSession();
            expect(savedSession).not.toBeNull();
            expect(savedSession!.videoId).toBe(analysisSession.videoId);
            expect(savedSession!.analysisResults.duration).toBe(analysisSession.analysisResults.duration);
            expect(savedSession!.qualityScore).toBe(analysisSession.qualityScore);

            // Verify analysis results structure
            expect(savedSession!.analysisResults.detectedMovements).toHaveLength(
              analysisSession.analysisResults.detectedMovements.length
            );

            // Clear session
            sessionService.clearAnalysisSession();
            
            // Verify session was cleared
            const clearedSession = sessionService.getAnalysisSession();
            expect(clearedSession).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should handle minting session persistence consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            videoId: fc.string({ minLength: 10, maxLength: 50 }),
            nftTitle: fc.string({ minLength: 1, maxLength: 60 }),
            nftDescription: fc.option(fc.string({ maxLength: 500 })),
            tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }))),
            price: fc.option(fc.string()),
            isPrivate: fc.boolean(),
            licenseConfig: fc.record({
              templateId: fc.option(fc.string()),
              customParams: fc.option(fc.object()),
              configuredAt: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
            }),
            mintingStatus: fc.constantFrom('idle', 'preparing', 'signing', 'confirming', 'complete', 'error'),
            canRetry: fc.boolean(),
            transactionHash: fc.option(fc.string({ minLength: 64, maxLength: 66 })),
            errorMessage: fc.option(fc.string()),
          }),
          (mintingSession) => {
            // Save minting session
            sessionService.saveMintingSession(mintingSession);

            // Verify session was saved
            const savedSession = sessionService.getMintingSession();
            expect(savedSession).not.toBeNull();
            expect(savedSession!.videoId).toBe(mintingSession.videoId);
            expect(savedSession!.nftTitle).toBe(mintingSession.nftTitle);
            expect(savedSession!.mintingStatus).toBe(mintingSession.mintingStatus);
            expect(savedSession!.canRetry).toBe(mintingSession.canRetry);

            // Update minting status
            const newStatus = mintingSession.mintingStatus === 'idle' ? 'preparing' : 'complete';
            const newTxHash = newStatus === 'complete' ? '0x1234567890abcdef' : undefined;
            
            sessionService.updateMintingStatus(newStatus, newTxHash);

            // Verify status was updated
            const updatedSession = sessionService.getMintingSession();
            expect(updatedSession).not.toBeNull();
            expect(updatedSession!.mintingStatus).toBe(newStatus);
            if (newTxHash) {
              expect(updatedSession!.transactionHash).toBe(newTxHash);
            }

            // Clear session
            sessionService.clearMintingSession();
            
            // Verify session was cleared
            const clearedSession = sessionService.getMintingSession();
            expect(clearedSession).toBeNull();
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should handle corrupted session data gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid json'),
            fc.constant('{"incomplete": true}'),
            fc.constant('null'),
            fc.constant('undefined'),
            fc.constant(''),
            fc.constant('{}'),
          ),
          (corruptedData) => {
            // Manually set corrupted data in storage
            mockSessionStorage.store.set('movemint_workflow_session', corruptedData);

            // Attempt to restore session
            const restoredSession = sessionService.restoreSession();

            // Should handle corruption gracefully
            expect(restoredSession).toBeNull();

            // Storage should be cleaned up
            expect(mockSessionStorage.store.has('movemint_workflow_session')).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should handle session timeout correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            currentStep: fc.constantFrom('upload', 'analysis', 'results', 'license', 'minting'),
            startedAt: fc.integer({ min: Date.now() - 86400000 * 2, max: Date.now() - 86400000 - 1 }), // More than 24 hours ago
            lastUpdatedAt: fc.integer({ min: Date.now() - 86400000 * 2, max: Date.now() - 86400000 - 1 }),
          }),
          (expiredSessionData) => {
            // Save expired session
            sessionService.updateWorkflowSession(expiredSessionData);

            // Attempt to restore expired session
            const restoredSession = sessionService.restoreSession();

            // Should return null for expired session
            expect(restoredSession).toBeNull();

            // Storage should be cleaned up
            const currentSession = sessionService.getWorkflowSession();
            expect(currentSession).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should maintain session integrity across operations', () => {
      fc.assert(
        fc.property(
          fc.record({
            videoId: fc.string({ minLength: 10, maxLength: 50 }),
            fileName: fc.string({ minLength: 5, maxLength: 100 }),
            nftTitle: fc.string({ minLength: 1, maxLength: 60 }),
          }),
          (sessionData) => {
            // Create a complete workflow session
            const uploadSession: VideoUploadSession = {
              videoId: sessionData.videoId,
              fileName: sessionData.fileName,
              fileSize: 1024 * 1024,
              uploadProgress: 100,
              uploadStatus: 'completed',
              uploadedAt: Date.now(),
            };

            const analysisSession: AnalysisSession = {
              videoId: sessionData.videoId,
              analysisResults: {
                videoId: sessionData.videoId,
                duration: 120,
                detectedMovements: [
                  { name: 'Pirouette', type: 'Ballet', confidence: 0.95 }
                ],
                qualityMetrics: { overall: 85, lighting: 90, clarity: 80, frameRate: 85, stability: 85 },
                poseData: [],
                recommendations: [],
              },
              analysisCompletedAt: Date.now(),
              qualityScore: 85,
            };

            const mintingSession: MintingSession = {
              videoId: sessionData.videoId,
              nftTitle: sessionData.nftTitle,
              isPrivate: false,
              licenseConfig: {
                templateId: 'standard',
                configuredAt: Date.now(),
              },
              mintingStatus: 'idle',
              canRetry: true,
            };

            // Save all sessions
            sessionService.saveVideoUploadSession(uploadSession);
            sessionService.saveAnalysisSession(analysisSession);
            sessionService.saveMintingSession(mintingSession);

            // Verify all sessions are accessible
            expect(sessionService.getVideoUploadSession()).not.toBeNull();
            expect(sessionService.getAnalysisSession()).not.toBeNull();
            expect(sessionService.getMintingSession()).not.toBeNull();

            // Verify workflow session reflects all steps
            const workflowSession = sessionService.getWorkflowSession();
            expect(workflowSession).not.toBeNull();
            expect(workflowSession!.upload).toBeDefined();
            expect(workflowSession!.analysis).toBeDefined();
            expect(workflowSession!.minting).toBeDefined();

            // Clear entire workflow
            sessionService.clearWorkflowSession();

            // Verify all sessions are cleared
            expect(sessionService.getVideoUploadSession()).toBeNull();
            expect(sessionService.getAnalysisSession()).toBeNull();
            expect(sessionService.getMintingSession()).toBeNull();
            expect(sessionService.getWorkflowSession()).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});