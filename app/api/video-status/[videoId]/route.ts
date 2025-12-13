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

    // In a real implementation, you would fetch the actual status from your database
    // For now, we'll simulate processing stages
    
    // Simulate processing progress based on time elapsed
    const now = Date.now();
    const videoTimestamp = parseInt(videoId.split('_')[1]) || now;
    const elapsedSeconds = Math.floor((now - videoTimestamp) / 1000);
    
    let status = 'processing';
    let progress = 0;
    let currentStage = 'extraction';
    let estimatedTimeRemaining = 60;
    
    if (elapsedSeconds < 10) {
      // First 10 seconds: extraction
      currentStage = 'extraction';
      progress = Math.min(elapsedSeconds * 10, 100);
      estimatedTimeRemaining = 60 - elapsedSeconds;
    } else if (elapsedSeconds < 30) {
      // Next 20 seconds: analysis
      currentStage = 'analysis';
      progress = Math.min((elapsedSeconds - 10) * 5, 100);
      estimatedTimeRemaining = 60 - elapsedSeconds;
    } else if (elapsedSeconds < 45) {
      // Next 15 seconds: finalization
      currentStage = 'finalization';
      progress = Math.min((elapsedSeconds - 30) * 6.67, 100);
      estimatedTimeRemaining = 60 - elapsedSeconds;
    } else {
      // After 45 seconds: complete
      status = 'complete';
      progress = 100;
      currentStage = 'complete';
      estimatedTimeRemaining = 0;
    }

    const response = {
      videoId,
      status,
      progress: Math.round(progress),
      currentStage,
      estimatedTimeRemaining: Math.max(0, estimatedTimeRemaining),
      processingStages: [
        { 
          name: 'extraction', 
          status: elapsedSeconds >= 10 ? 'completed' : (elapsedSeconds > 0 ? 'active' : 'pending'),
          percentage: elapsedSeconds >= 10 ? 100 : Math.min(elapsedSeconds * 10, 100)
        },
        { 
          name: 'analysis', 
          status: elapsedSeconds >= 30 ? 'completed' : (elapsedSeconds > 10 ? 'active' : 'pending'),
          percentage: elapsedSeconds >= 30 ? 100 : Math.max(0, Math.min((elapsedSeconds - 10) * 5, 100))
        },
        { 
          name: 'finalization', 
          status: elapsedSeconds >= 45 ? 'completed' : (elapsedSeconds > 30 ? 'active' : 'pending'),
          percentage: elapsedSeconds >= 45 ? 100 : Math.max(0, Math.min((elapsedSeconds - 30) * 6.67, 100))
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Video status error:', error);
    return NextResponse.json(
      { error: 'Failed to get video status' },
      { status: 500 }
    );
  }
}