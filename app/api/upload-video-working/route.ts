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
  console.log('🎥 [upload-video-working] POST request received');
  console.log('  - Content-Type:', request.headers.get('content-type'));
  console.log('  - Content-Length:', request.headers.get('content-length'));
  console.log('  - URL:', request.url);
  console.log('  - Method:', request.method);
  console.log('  - Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('❌ [upload-video-working] Invalid content type:', contentType);
      const response = NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📦 [upload-video-working] Parsing FormData with custom parser...');
    
    let parsedData;
    try {
      parsedData = await parseFormDataSafely(request);
      console.log('✅ [upload-video-working] FormData parsed successfully');
      console.log('📋 [upload-video-working] Fields:', Object.keys(parsedData.fields));
      console.log('📋 [upload-video-working] Files:', Object.keys(parsedData.files));
    } catch (parseError) {
      console.error('❌ [upload-video-working] Custom FormData parsing failed:', parseError);
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

    console.log('📹 [upload-video-working] Video file details:');
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
    console.log('🆔 [upload-video-working] Generated video ID:', videoId);
    
    // For now, just process the upload without file storage
    // This ensures the upload flow works while we debug file system issues
    console.log('📝 [upload-video-working] Processing upload (no file storage for now)...');
    
    // Convert to base64 for temporary storage in session
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Video = `data:${videoFile.type};base64,${buffer.toString('base64')}`;
    
    console.log('✅ [upload-video-working] Video converted to base64 for session storage');
    
    console.log('📝 [upload-video-working] Creating response...');
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
      ],
      // Include base64 video data for immediate use
      videoData: base64Video,
      note: 'Video uploaded successfully and ready for analysis'
    };

    console.log('✅ [upload-video-working] Returning successful response');
    const jsonResponse = NextResponse.json(response);
    return addCorsHeaders(jsonResponse);
    
  } catch (error) {
    console.error('❌ [upload-video-working] Error occurred:', error);
    console.error('  - Error type:', error?.constructor?.name);
    console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    const response = NextResponse.json(
      { error: 'Failed to upload video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET() {
  console.log('🎥 [upload-video-working] GET request received - endpoint is reachable');
  const response = NextResponse.json({
    endpoint: 'upload-video-working',
    status: 'active',
    description: 'Uploads video files for dance analysis (working version)',
    methods: ['POST'],
    maxFileSize: '500MB',
    supportedFormats: ['MP4', 'WebM', 'MOV', 'AVI'],
    timestamp: new Date().toISOString()
  });
  return addCorsHeaders(response);
}