import { NextRequest, NextResponse } from 'next/server';

// CORS and Security Headers
function addCorsHeaders(response: NextResponse) {
  // CORS Headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Version, X-Client-Platform');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  
  return response;
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎥 [upload-video] POST request received');
    console.log('  - Content-Type:', request.headers.get('content-type'));
    console.log('  - URL:', request.url);
    console.log('  - Method:', request.method);
    console.log('  - Headers:', Object.fromEntries(request.headers.entries()));
    
    console.log('📦 [upload-video] Parsing FormData...');
    const formData = await request.formData();
    
    console.log('📋 [upload-video] FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  - ${key}: ${typeof value === 'string' ? value.substring(0, 100) + '...' : value}`);
      }
    }
    const videoFile = formData.get('video') as File;
    const metadataString = formData.get('metadata') as string;
    
    if (!videoFile) {
      const response = NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Parse metadata
    let metadata = {};
    if (metadataString) {
      try {
        metadata = JSON.parse(metadataString);
      } catch (e) {
        console.warn('Invalid metadata JSON:', e);
      }
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(videoFile.type)) {
      const response = NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, WebM, MOV, or AVI files.' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > maxSize) {
      const response = NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Generate video ID
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    console.log('🆔 [upload-video] Generated video ID:', videoId);
    
    // In a real implementation, you would:
    // 1. Upload to cloud storage (AWS S3, Google Cloud, etc.)
    // 2. Queue for video processing
    // 3. Extract frames and analyze poses
    // 4. Store results in database
    
    console.log('📝 [upload-video] Creating mock response...');
    // For now, return a mock successful response
    const response = {
      success: true,
      videoId,
      fileName: videoFile.name,
      fileSize: videoFile.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      estimatedProcessingTime: Math.max(30, Math.floor(videoFile.size / (1024 * 1024)) * 2), // 2 seconds per MB, min 30s
      metadata,
      processingStages: [
        { name: 'upload', status: 'completed', percentage: 100 },
        { name: 'extraction', status: 'pending', percentage: 0 },
        { name: 'analysis', status: 'pending', percentage: 0 },
        { name: 'finalization', status: 'pending', percentage: 0 }
      ]
    };

    console.log('✅ [upload-video] Returning successful response:', response);
    const jsonResponse = NextResponse.json(response);
    return addCorsHeaders(jsonResponse);
    
  } catch (error) {
    console.error('❌ [upload-video] Error occurred:', error);
    console.error('  - Error type:', error?.constructor?.name);
    console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    const response = NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET() {
  const response = NextResponse.json({
    endpoint: 'upload-video',
    status: 'active',
    description: 'Uploads video files for dance analysis',
    methods: ['POST'],
    maxFileSize: '500MB',
    supportedFormats: ['MP4', 'WebM', 'MOV', 'AVI']
  });
  return addCorsHeaders(response);
}