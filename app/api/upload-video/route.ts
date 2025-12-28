import { NextRequest, NextResponse } from 'next/server';
import { parseFormDataSafely } from '@/lib/utils/formdata-parser';

// CORS and Security Headers
function addCorsHeaders(response: NextResponse) {
  // CORS Headers - match the frontend expectations
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Version, X-Client-Platform, Accept, User-Agent');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://surreal-base.vercel.app https://gateway.pinata.cloud");
  
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
    console.log('  - Content-Length:', request.headers.get('content-length'));
    console.log('  - URL:', request.url);
    console.log('  - Method:', request.method);
    
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('❌ [upload-video] Invalid content type:', contentType);
      const response = NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📦 [upload-video] Parsing FormData with custom parser...');
    
    let parsedData;
    try {
      parsedData = await parseFormDataSafely(request);
      console.log('✅ [upload-video] FormData parsed successfully');
      console.log('📋 [upload-video] Fields:', Object.keys(parsedData.fields));
      console.log('📋 [upload-video] Files:', Object.keys(parsedData.files));
    } catch (parseError) {
      console.error('❌ [upload-video] Custom FormData parsing failed:', parseError);
      const response = NextResponse.json(
        { error: 'Failed to parse video upload. Please try with a smaller file or different format.' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }
    
    const videoFile = parsedData.files.video;
    const metadataString = parsedData.fields.metadata || '{}';
    
    if (!videoFile) {
      const response = NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📹 [upload-video] Video file details:');
    console.log(`  - Name: ${videoFile.name}`);
    console.log(`  - Type: ${videoFile.type}`);
    console.log(`  - Size: ${videoFile.size} bytes`);

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
    
    console.log('📝 [upload-video] Creating response...');
    // Return successful response
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

    console.log('✅ [upload-video] Returning successful response');
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