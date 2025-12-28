// Pinata IPFS Service for uploading videos and metadata
export class PinataService {
  private static readonly PINATA_API_URL = 'https://api.pinata.cloud';
  private static readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';
  
  // These should be in environment variables in production
  private static readonly PINATA_JWT = process.env.PINATA_JWT || 'your-pinata-jwt-token';
  private static readonly PINATA_API_KEY = process.env.PINATA_API_KEY || 'your-pinata-api-key';
  private static readonly PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || 'your-pinata-secret-key';

  /**
   * Upload video file to IPFS via Pinata
   */
  static async uploadVideo(videoFile: File, videoId: string): Promise<{
    success: boolean;
    ipfsHash?: string;
    ipfsUrl?: string;
    error?: string;
  }> {
    try {
      console.log('📤 [Pinata] Uploading video to IPFS:', videoFile.name, videoFile.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', videoFile);
      
      // Add metadata for the file
      const pinataMetadata = JSON.stringify({
        name: `${videoId}_video.${videoFile.name.split('.').pop()}`,
        keyvalues: {
          videoId: videoId,
          uploadedAt: new Date().toISOString(),
          fileType: 'video',
          originalName: videoFile.name
        }
      });
      formData.append('pinataMetadata', pinataMetadata);
      
      // Add options
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 1 },
            { id: 'NYC1', desiredReplicationCount: 1 }
          ]
        }
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.PINATA_JWT}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Pinata] Video upload failed:', response.status, errorText);
        throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Pinata] Video uploaded successfully:', result.IpfsHash);

      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `${this.PINATA_GATEWAY}/${result.IpfsHash}`
      };

    } catch (error) {
      console.error('❌ [Pinata] Video upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Upload NFT metadata to IPFS via Pinata
   */
  static async uploadMetadata(metadata: any, videoId: string): Promise<{
    success: boolean;
    ipfsHash?: string;
    ipfsUrl?: string;
    error?: string;
  }> {
    try {
      console.log('📤 [Pinata] Uploading metadata to IPFS for:', videoId);
      
      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${videoId}_metadata.json`,
            keyvalues: {
              videoId: videoId,
              uploadedAt: new Date().toISOString(),
              fileType: 'metadata'
            }
          },
          pinataOptions: {
            cidVersion: 1,
            customPinPolicy: {
              regions: [
                { id: 'FRA1', desiredReplicationCount: 1 },
                { id: 'NYC1', desiredReplicationCount: 1 }
              ]
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Pinata] Metadata upload failed:', response.status, errorText);
        throw new Error(`Pinata metadata upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Pinata] Metadata uploaded successfully:', result.IpfsHash);

      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `${this.PINATA_GATEWAY}/${result.IpfsHash}`
      };

    } catch (error) {
      console.error('❌ [Pinata] Metadata upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Test Pinata connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.PINATA_JWT}`,
        }
      });

      const result = await response.json();
      console.log('🔗 [Pinata] Connection test:', result);
      
      return response.ok && result.message === 'Congratulations! You are communicating with the Pinata API!';
    } catch (error) {
      console.error('❌ [Pinata] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get file info from IPFS hash
   */
  static async getFileInfo(ipfsHash: string): Promise<any> {
    try {
      const response = await fetch(`${this.PINATA_GATEWAY}/${ipfsHash}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Failed to fetch file info: ${response.status}`);
    } catch (error) {
      console.error('❌ [Pinata] Failed to get file info:', error);
      throw error;
    }
  }
}