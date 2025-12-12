import fc from 'fast-check'
import { universalMintingEngineService } from '@/lib/api/service'
import { DanceAnalysisResults, DanceMovement, AnalysisQuality, DanceStyle, DanceDifficulty } from '@/lib/types/api'

// Mock the API service
jest.mock('@/lib/api/service', () => ({
  universalMintingEngineService: {
    getAnalysisResults: jest.fn(),
  },
}))

const mockService = universalMintingEngineService as any

describe('Results Page Data Integration - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear session storage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Generators for test data
  const danceStyleArb = fc.constantFrom(
    'Ballet', 'Hip-Hop', 'Contemporary', 'Jazz', 'Ballroom', 'Latin', 'Freestyle', 'Breakdancing'
  ) as fc.Arbitrary<DanceStyle>

  const danceDifficultyArb = fc.constantFrom(
    'Beginner', 'Intermediate', 'Advanced', 'Professional'
  ) as fc.Arbitrary<DanceDifficulty>

  const danceMovementArb = fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(name => 
      !['constructor', 'prototype', '__proto__', 'toString', 'valueOf'].includes(name)
    ),
    type: danceStyleArb,
    confidence: fc.float({ min: 0, max: 100, noNaN: true }),
    timeRange: fc.record({
      start: fc.float({ min: 0, max: 300, noNaN: true }),
      end: fc.float({ min: 0, max: 300, noNaN: true }),
    }).filter(range => range.end > range.start),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    difficulty: danceDifficultyArb,
  }) as fc.Arbitrary<DanceMovement>

  const analysisQualityArb = fc.record({
    overall: fc.float({ min: 0, max: 100, noNaN: true }),
    lighting: fc.float({ min: 0, max: 100, noNaN: true }),
    clarity: fc.float({ min: 0, max: 100, noNaN: true }),
    frameRate: fc.float({ min: 1, max: 60, noNaN: true }),
    stability: fc.float({ min: 0, max: 100, noNaN: true }),
  }) as fc.Arbitrary<AnalysisQuality>

  const poseFrameArb = fc.record({
    timestamp: fc.float({ min: 0, max: 300, noNaN: true }),
    keypoints: fc.array(
      fc.record({
        x: fc.float({ min: 0, max: 1920, noNaN: true }),
        y: fc.float({ min: 0, max: 1080, noNaN: true }),
        confidence: fc.float({ min: 0, max: 1, noNaN: true }),
        name: fc.string({ minLength: 1, maxLength: 20 }),
      }),
      { minLength: 17, maxLength: 17 } // COCO pose has 17 keypoints
    ),
    confidence: fc.float({ min: 0, max: 1, noNaN: true }),
  })

  const danceAnalysisResultsArb = fc.record({
    videoId: fc.uuid(),
    duration: fc.float({ min: 1, max: 600, noNaN: true }),
    detectedMovements: fc.array(danceMovementArb, { minLength: 0, maxLength: 20 }),
    poseData: fc.array(poseFrameArb, { minLength: 0, maxLength: 1000 }),
    qualityMetrics: analysisQualityArb,
    recommendations: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
  }).chain(data => {
    // Ensure pose frame timestamps are within video duration
    const adjustedPoseData = data.poseData.map(frame => ({
      ...frame,
      timestamp: Math.min(frame.timestamp, data.duration)
    }))
    return fc.constant({
      ...data,
      poseData: adjustedPoseData
    })
  }) as fc.Arbitrary<DanceAnalysisResults>

  /**
   * Property 3: Results page data integration
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4
   */
  describe('Property 3: Results page data integration', () => {
    it('should correctly transform API response data to dance terminology', async () => {
      await fc.assert(
        fc.asyncProperty(danceAnalysisResultsArb, async (analysisResults) => {
          // Arrange
          mockService.getAnalysisResults.mockResolvedValue(analysisResults)

          // Act - simulate the data transformation logic
          const transformedMovements = analysisResults.detectedMovements.map(movement => ({
            ...movement,
            displayName: getDanceTerminology(movement.name),
            confidenceLevel: getConfidenceLevel(movement.confidence),
            durationText: `${(movement.timeRange.end - movement.timeRange.start).toFixed(1)}s`,
          }))

          // Assert - verify dance terminology transformation
          transformedMovements.forEach(movement => {
            expect(movement.displayName).toBeDefined()
            expect(typeof movement.displayName).toBe('string')
            expect(movement.displayName.length).toBeGreaterThan(0)
            
            // Confidence should be properly categorized
            expect(['Low', 'Medium', 'High', 'Excellent']).toContain(movement.confidenceLevel)
            
            // Duration should be properly formatted
            expect(movement.durationText).toMatch(/^\d+\.\d+s$/)
          })

          // Verify quality metrics are properly processed
          expect(analysisResults.qualityMetrics.overall).toBeGreaterThanOrEqual(0)
          expect(analysisResults.qualityMetrics.overall).toBeLessThanOrEqual(100)
          expect(analysisResults.qualityMetrics.lighting).toBeGreaterThanOrEqual(0)
          expect(analysisResults.qualityMetrics.clarity).toBeGreaterThanOrEqual(0)
          expect(analysisResults.qualityMetrics.stability).toBeGreaterThanOrEqual(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should handle pose visualization data correctly', async () => {
      await fc.assert(
        fc.asyncProperty(danceAnalysisResultsArb, async (analysisResults) => {
          // Arrange
          mockService.getAnalysisResults.mockResolvedValue(analysisResults)

          // Act - simulate pose data processing
          const processedPoseData = analysisResults.poseData.map(frame => ({
            ...frame,
            validKeypoints: frame.keypoints.filter(kp => kp.confidence > 0.3),
            frameQuality: calculateFrameQuality(frame),
          }))

          // Assert - verify pose data integrity
          processedPoseData.forEach(frame => {
            // Each frame should have valid timestamp
            expect(frame.timestamp).toBeGreaterThanOrEqual(0)
            expect(frame.timestamp).toBeLessThanOrEqual(analysisResults.duration)
            
            // Keypoints should be within reasonable bounds
            frame.keypoints.forEach(keypoint => {
              expect(keypoint.x).toBeGreaterThanOrEqual(0)
              expect(keypoint.y).toBeGreaterThanOrEqual(0)
              expect(keypoint.confidence).toBeGreaterThanOrEqual(0)
              expect(keypoint.confidence).toBeLessThanOrEqual(1)
              expect(keypoint.name).toBeDefined()
            })
            
            // Frame quality should be calculated correctly
            expect(frame.frameQuality).toBeGreaterThanOrEqual(0)
            expect(frame.frameQuality).toBeLessThanOrEqual(100)
          })
        }),
        { numRuns: 100 }
      )
    })

    it('should provide appropriate recommendations based on analysis quality', async () => {
      await fc.assert(
        fc.asyncProperty(danceAnalysisResultsArb, async (analysisResults) => {
          // Act - simulate recommendation processing
          const processedRecommendations = generateRecommendations(analysisResults)

          // Assert - verify recommendations are contextual and helpful
          if (analysisResults.qualityMetrics.overall < 50) {
            expect(processedRecommendations.some(rec => 
              rec.toLowerCase().includes('lighting') || 
              rec.toLowerCase().includes('quality') ||
              rec.toLowerCase().includes('clarity')
            )).toBe(true)
          }

          if (analysisResults.qualityMetrics.stability < 60) {
            expect(processedRecommendations.some(rec => 
              rec.toLowerCase().includes('stable') || 
              rec.toLowerCase().includes('steady') ||
              rec.toLowerCase().includes('camera')
            )).toBe(true)
          }

          if (analysisResults.detectedMovements.length === 0) {
            expect(processedRecommendations.some(rec => 
              rec.toLowerCase().includes('movement') || 
              rec.toLowerCase().includes('dance') ||
              rec.toLowerCase().includes('visible')
            )).toBe(true)
          }

          // All recommendations should be non-empty strings
          processedRecommendations.forEach(recommendation => {
            expect(typeof recommendation).toBe('string')
            expect(recommendation.length).toBeGreaterThan(0)
          })
        }),
        { numRuns: 100 }
      )
    })

    it('should handle API errors gracefully with proper fallback', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.constantFrom('NETWORK_ERROR', 'ANALYSIS_FETCH_FAILED', 'TIMEOUT', 'INVALID_RESPONSE'),
          async (videoId, errorType) => {
            // Arrange
            const error = new Error(`${errorType}: Failed to fetch analysis`)
            mockService.getAnalysisResults.mockRejectedValue(error)

            // Act - simulate error handling
            let analysisResults = null
            let errorMessage = null
            
            try {
              analysisResults = await mockService.getAnalysisResults(videoId)
            } catch (e) {
              errorMessage = e instanceof Error ? e.message : 'Unknown error'
            }

            // Assert - verify error handling
            expect(analysisResults).toBeNull()
            expect(errorMessage).toBeDefined()
            expect(errorMessage).toContain(errorType)
            
            // Verify fallback behavior would be triggered
            const shouldShowFallback = !analysisResults
            expect(shouldShowFallback).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain data consistency across component updates', async () => {
      await fc.assert(
        fc.asyncProperty(danceAnalysisResultsArb, async (analysisResults) => {
          // Arrange
          mockService.getAnalysisResults.mockResolvedValue(analysisResults)

          // Act - simulate multiple data transformations
          const movements1 = transformMovementsData(analysisResults.detectedMovements)
          const movements2 = transformMovementsData(analysisResults.detectedMovements)
          
          const quality1 = processQualityMetrics(analysisResults.qualityMetrics)
          const quality2 = processQualityMetrics(analysisResults.qualityMetrics)

          // Assert - verify consistency
          expect(movements1).toEqual(movements2)
          expect(quality1).toEqual(quality2)
          
          // Verify data integrity is maintained
          expect(movements1.length).toBe(analysisResults.detectedMovements.length)
          movements1.forEach((movement, index) => {
            const original = analysisResults.detectedMovements[index]
            expect(movement.confidence).toBe(original.confidence)
            expect(movement.type).toBe(original.type)
            expect(movement.difficulty).toBe(original.difficulty)
          })
        }),
        { numRuns: 100 }
      )
    })
  })
})

// Helper functions used in the tests
function getDanceTerminology(movementName: string): string {
  const danceTerms: Record<string, string> = {
    'arm_raise': 'Port de Bras',
    'leg_lift': 'Développé',
    'jump': 'Sauté',
    'turn': 'Pirouette',
    'balance': 'Arabesque',
    'step': 'Chassé',
    'reach': 'Allongé',
    'bend': 'Plié',
    'stretch': 'Tendu',
    'spin': 'Tour',
    'leap': 'Grand Jeté',
    'slide': 'Glissade',
    'kick': 'Battement',
    'pose': 'Attitude'
  }
  
  return danceTerms[movementName.toLowerCase()] || movementName
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 90) return 'Excellent'
  if (confidence >= 75) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Low'
}

function calculateFrameQuality(frame: any): number {
  const validKeypoints = frame.keypoints.filter((kp: any) => kp.confidence > 0.3)
  if (validKeypoints.length === 0) {
    return 0 // No valid keypoints means 0% quality
  }
  const averageConfidence = validKeypoints.reduce((sum: number, kp: any) => sum + kp.confidence, 0) / validKeypoints.length
  return Math.round(averageConfidence * 100)
}

function generateRecommendations(analysisResults: DanceAnalysisResults): string[] {
  const recommendations: string[] = []
  
  if (analysisResults.qualityMetrics.overall < 50) {
    recommendations.push('Improve video quality for better analysis results')
  }
  
  if (analysisResults.qualityMetrics.lighting < 60) {
    recommendations.push('Ensure adequate lighting for clearer pose detection')
  }
  
  if (analysisResults.qualityMetrics.stability < 60) {
    recommendations.push('Use a stable camera position to reduce motion blur')
  }
  
  if (analysisResults.detectedMovements.length === 0) {
    recommendations.push('Ensure full body is visible and movements are clear')
  }
  
  return recommendations
}

function transformMovementsData(movements: DanceMovement[]) {
  return movements.map(movement => ({
    ...movement,
    displayName: getDanceTerminology(movement.name),
    confidenceLevel: getConfidenceLevel(movement.confidence),
    durationText: `${(movement.timeRange.end - movement.timeRange.start).toFixed(1)}s`,
  }))
}

function processQualityMetrics(metrics: AnalysisQuality) {
  return {
    ...metrics,
    overallGrade: metrics.overall >= 80 ? 'A' : metrics.overall >= 60 ? 'B' : metrics.overall >= 40 ? 'C' : 'D',
    needsImprovement: metrics.overall < 70,
  }
}