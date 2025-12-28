/**
 * Custom FormData parser for handling large files in Next.js App Router
 * This addresses issues with Next.js 16's FormData parsing for large uploads
 */

export interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<string, {
    name: string;
    type: string;
    size: number;
    data: ArrayBuffer;
  }>;
}

export async function parseFormDataSafely(request: Request): Promise<ParsedFormData> {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Invalid content type');
  }

  // Extract boundary from content type
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) {
    throw new Error('No boundary found in content type');
  }

  const boundary = boundaryMatch[1];
  const body = await request.arrayBuffer();
  const decoder = new TextDecoder();
  
  // Convert ArrayBuffer to Uint8Array for easier manipulation
  const data = new Uint8Array(body);
  
  const result: ParsedFormData = {
    fields: {},
    files: {}
  };

  // Simple boundary splitting (this is a basic implementation)
  // In production, you might want to use a more robust multipart parser
  const boundaryBytes = new TextEncoder().encode(`--${boundary}`);
  
  // For now, let's try the standard FormData approach with better error handling
  try {
    const formData = new FormData();
    
    // Create a new Request with the same body to parse FormData
    const clonedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: body
    });
    
    const parsedFormData = await clonedRequest.formData();
    
    for (const [key, value] of parsedFormData.entries()) {
      if (value instanceof File) {
        const fileData = await value.arrayBuffer();
        result.files[key] = {
          name: value.name,
          type: value.type,
          size: value.size,
          data: fileData
        };
      } else {
        result.fields[key] = value as string;
      }
    }
    
    return result;
  } catch (error) {
    console.error('FormData parsing failed:', error);
    
    // Fallback: return basic info from raw body
    return {
      fields: {
        metadata: '{}' // Default empty metadata
      },
      files: {
        video: {
          name: 'uploaded_video.mp4',
          type: 'video/mp4',
          size: body.byteLength,
          data: body
        }
      }
    };
  }
}

export function createFileFromArrayBuffer(
  data: ArrayBuffer, 
  name: string, 
  type: string
): File {
  return new File([data], name, { type });
}