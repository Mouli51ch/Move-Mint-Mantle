import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    console.log('🎬 [video-serve] Serving video:', videoId);
    
    // Path to uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    const metadataPath = join(uploadsDir, `${videoId}.json`);
    
    // Check if metadata file exists
    if (!existsSync(metadataPath)) {
      console.log('❌ [video-serve] Video metadata not found:', videoId);
      return NextResponse.json({
        error: 'Video not found',
        videoId,
        message: 'The requested video does not exist or has been removed'
      }, { status: 404 });
    }
    
    // Read metadata
    const metadataContent = await readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    
    // Path to actual video file
    const videoPath = join(uploadsDir, metadata.fileName);
    
    // Check if video file exists
    if (!existsSync(videoPath)) {
      console.log('❌ [video-serve] Video file not found:', metadata.fileName);
      return NextResponse.json({
        error: 'Video file not found',
        videoId,
        message: 'Video metadata exists but file is missing'
      }, { status: 404 });
    }
    
    console.log('✅ [video-serve] Found video file:', metadata.fileName);
    
    // Read video file
    const videoBuffer = await readFile(videoPath);
    
    // Create response with proper headers for video streaming
    const response = new NextResponse(videoBuffer);
    
    // Set appropriate headers for video content
    response.headers.set('Content-Type', metadata.contentType || 'video/mp4');
    response.headers.set('Content-Length', videoBuffer.length.toString());
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    response.headers.set('Content-Disposition', `inline; filename="${metadata.originalName}"`);
    
    // CORS headers for video access
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    
    console.log('🎥 [video-serve] Serving video successfully');
    return response;
    
  } catch (error) {
    console.error('❌ [video-serve] Error serving video:', error);
    return NextResponse.json(
      { error: 'Failed to serve video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Range, Content-Type');
  return response;
}