import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Generate mock analysis results based on video ID
    const mockAnalysisResults = {
      videoId,
      analysisComplete: true,
      timestamp: new Date().toISOString(),
      
      // Dance Metrics
      danceMetrics: {
        totalMoves: Math.floor(Math.random() * 50) + 20, // 20-70 moves
        uniqueSequences: Math.floor(Math.random() * 15) + 5, // 5-20 sequences
        confidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100%
        complexity: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        duration: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
        averageTempo: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
      },

      // Pose Analysis
      poseAnalysis: {
        keyPoses: [
          {
            name: 'Starting Position',
            timestamp: 0,
            confidence: 0.95,
            coordinates: { x: 320, y: 240 },
            description: 'Dancer in ready position'
          },
          {
            name: 'Jump Peak',
            timestamp: Math.random() * 30 + 10,
            confidence: 0.88,
            coordinates: { x: 315, y: 180 },
            description: 'High jump with extended arms'
          },
          {
            name: 'Spin Movement',
            timestamp: Math.random() * 30 + 40,
            confidence: 0.92,
            coordinates: { x: 330, y: 250 },
            description: 'Full body rotation'
          },
          {
            name: 'Final Pose',
            timestamp: Math.random() * 30 + 70,
            confidence: 0.90,
            coordinates: { x: 320, y: 240 },
            description: 'Ending position with arms raised'
          }
        ],
        bodyParts: {
          head: { accuracy: 0.95, movements: 12 },
          arms: { accuracy: 0.88, movements: 45 },
          torso: { accuracy: 0.92, movements: 28 },
          legs: { accuracy: 0.85, movements: 38 }
        },
        movementFlow: {
          smoothness: Math.random() * 0.3 + 0.7, // 0.7-1.0
          rhythm: Math.random() * 0.25 + 0.75, // 0.75-1.0
          coordination: Math.random() * 0.2 + 0.8 // 0.8-1.0
        }
      },

      // Style Analysis
      styleAnalysis: {
        detectedStyle: ['Hip Hop', 'Contemporary', 'Jazz', 'Ballet', 'Breakdance'][Math.floor(Math.random() * 5)],
        styleConfidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        characteristics: [
          'Dynamic movements',
          'Strong rhythm',
          'Creative expression',
          'Technical precision'
        ],
        influences: ['Street Dance', 'Classical Training', 'Modern Fusion']
      },

      // Technical Metrics
      technicalMetrics: {
        frameRate: 30,
        resolution: '1920x1080',
        totalFrames: Math.floor(Math.random() * 3000) + 900, // 900-3900 frames
        processedFrames: Math.floor(Math.random() * 3000) + 900,
        skippedFrames: Math.floor(Math.random() * 50),
        processingTime: Math.floor(Math.random() * 45) + 15, // 15-60 seconds
        modelVersion: '2.1.0',
        accuracy: Math.random() * 0.15 + 0.85 // 0.85-1.0
      },

      // Recommendations
      recommendations: {
        strengths: [
          'Excellent rhythm and timing',
          'Strong body control',
          'Creative choreography',
          'Good spatial awareness'
        ],
        improvements: [
          'Focus on arm extension',
          'Work on balance during turns',
          'Increase movement amplitude',
          'Enhance facial expression'
        ],
        nextSteps: [
          'Try more complex sequences',
          'Experiment with different styles',
          'Record in better lighting',
          'Add music synchronization'
        ]
      },

      // Metadata
      metadata: {
        processingVersion: '2.1.0',
        modelAccuracy: 0.94,
        confidenceThreshold: 0.7,
        analysisDate: new Date().toISOString(),
        processingNode: 'node-001',
        qualityScore: Math.random() * 0.2 + 0.8 // 0.8-1.0
      }
    };

    return NextResponse.json(mockAnalysisResults);
    
  } catch (error) {
    console.error('Analysis fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis results' },
      { status: 500 }
    );
  }
}