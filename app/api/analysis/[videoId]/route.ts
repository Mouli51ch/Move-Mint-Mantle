import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    
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
      duration: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
      
      // Detected movements in the format expected by the transformer
      detectedMovements: [
        {
          id: 'move_1',
          name: 'Arm raise',
          type: 'arm_raise',
          confidence: 0.95,
          timestamp: 1000,
          duration: 2000,
          startTime: 1,
          endTime: 3,
          bodyParts: ['arms', 'shoulders'],
          characteristics: ['controlled', 'precise'],
          intensity: 0.7
        },
        {
          id: 'move_2', 
          name: 'Jump',
          type: 'jump',
          confidence: 0.88,
          timestamp: 5000,
          duration: 1500,
          startTime: 5,
          endTime: 6.5,
          bodyParts: ['legs', 'feet'],
          characteristics: ['energetic', 'explosive'],
          intensity: 0.9
        },
        {
          id: 'move_3',
          name: 'Turn',
          type: 'turn', 
          confidence: 0.92,
          timestamp: 8000,
          duration: 3000,
          startTime: 8,
          endTime: 11,
          bodyParts: ['torso', 'legs'],
          characteristics: ['fluid', 'controlled'],
          intensity: 0.8
        }
      ],

      // Quality metrics in the expected format
      qualityMetrics: {
        overall: Math.floor(Math.random() * 30) + 70, // 70-100
        technique: Math.floor(Math.random() * 25) + 75, // 75-100
        creativity: Math.floor(Math.random() * 35) + 65, // 65-100
        execution: Math.floor(Math.random() * 20) + 80, // 80-100
        rhythm: Math.floor(Math.random() * 30) + 70, // 70-100
        expression: Math.floor(Math.random() * 40) + 60 // 60-100
      },

      // Recommendations
      recommendations: [
        'Excellent rhythm and timing throughout the performance',
        'Strong body control and spatial awareness',
        'Consider adding more dynamic level changes',
        'Work on extending lines for better visual impact'
      ],

      // Pose data for visualization
      poseData: Array.from({ length: 30 }, (_, i) => ({
        timestamp: i * 1000,
        keypoints: Array.from({ length: 17 }, (_, j) => ({
          x: 320 + Math.sin(i * 0.1 + j) * 50,
          y: 240 + Math.cos(i * 0.1 + j) * 30,
          z: 0,
          confidence: 0.8 + Math.random() * 0.2,
          name: ['nose','left_eye','right_eye','left_ear','right_ear','left_shoulder','right_shoulder','left_elbow','right_elbow','left_wrist','right_wrist','left_hip','right_hip','left_knee','right_knee','left_ankle','right_ankle'][j]
        })),
        confidence: 0.85 + Math.random() * 0.15
      })),

      // Legacy fields for backward compatibility
      danceMetrics: {
        totalMoves: Math.floor(Math.random() * 50) + 20,
        uniqueSequences: Math.floor(Math.random() * 15) + 5,
        confidenceScore: Math.floor(Math.random() * 30) + 70,
        complexity: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        duration: Math.floor(Math.random() * 180) + 30,
        averageTempo: Math.floor(Math.random() * 60) + 80,
      },

      // Technical metadata
      metadata: {
        processingVersion: '2.1.0',
        modelAccuracy: 0.94,
        confidenceThreshold: 0.7,
        analysisDate: new Date().toISOString(),
        processingNode: 'node-001',
        qualityScore: Math.random() * 0.2 + 0.8
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