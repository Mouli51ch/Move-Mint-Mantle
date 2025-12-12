/**
 * Environment configuration for Universal Minting Engine integration
 * Handles environment variables and configuration validation
 */

export interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;
  apiKey?: string;
  
  // Story Protocol Configuration
  storyProtocolChainId: number;
  storyProtocolRpcUrl: string;
  
  // Application Configuration
  appEnv: 'development' | 'staging' | 'production';
  enableDebugLogs: boolean;
  
  // Feature Flags
  enableVideoProcessing: boolean;
  enableLicenseRemixer: boolean;
  enableNFTMinting: boolean;
  
  // Performance Configuration
  apiTimeout: number;
  maxRetryAttempts: number;
  uploadChunkSize: number;
}

/**
 * Get environment configuration with validation
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // Validate required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default configuration. Some features may not work correctly.');
  }

  const config: EnvironmentConfig = {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL || 'https://api.universalmintingengine.com',
    apiKey: process.env.NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_KEY,
    
    // Story Protocol Configuration
    storyProtocolChainId: parseInt(process.env.NEXT_PUBLIC_STORY_PROTOCOL_CHAIN_ID || '1513'),
    storyProtocolRpcUrl: process.env.NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL || 'https://testnet.storyrpc.io',
    
    // Application Configuration
    appEnv: (process.env.NEXT_PUBLIC_APP_ENV as any) || 'development',
    enableDebugLogs: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true',
    
    // Feature Flags (default to true for development)
    enableVideoProcessing: process.env.NEXT_PUBLIC_ENABLE_VIDEO_PROCESSING !== 'false',
    enableLicenseRemixer: process.env.NEXT_PUBLIC_ENABLE_LICENSE_REMIXER !== 'false',
    enableNFTMinting: process.env.NEXT_PUBLIC_ENABLE_NFT_MINTING !== 'false',
    
    // Performance Configuration
    apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    maxRetryAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS || '3'),
    uploadChunkSize: parseInt(process.env.NEXT_PUBLIC_UPLOAD_CHUNK_SIZE || '1048576'), // 1MB
  };

  // Validate configuration
  validateConfig(config);

  return config;
}

/**
 * Validate configuration values
 */
function validateConfig(config: EnvironmentConfig): void {
  const errors: string[] = [];

  // Validate API URL
  try {
    new URL(config.apiUrl);
  } catch {
    errors.push('Invalid API URL format');
  }

  // Validate Story Protocol RPC URL
  try {
    new URL(config.storyProtocolRpcUrl);
  } catch {
    errors.push('Invalid Story Protocol RPC URL format');
  }

  // Validate chain ID
  if (config.storyProtocolChainId <= 0) {
    errors.push('Invalid Story Protocol chain ID');
  }

  // Validate timeout values
  if (config.apiTimeout < 1000) {
    errors.push('API timeout must be at least 1000ms');
  }

  // Validate retry attempts
  if (config.maxRetryAttempts < 0 || config.maxRetryAttempts > 10) {
    errors.push('Max retry attempts must be between 0 and 10');
  }

  // Validate upload chunk size
  if (config.uploadChunkSize < 64 * 1024 || config.uploadChunkSize > 10 * 1024 * 1024) {
    errors.push('Upload chunk size must be between 64KB and 10MB');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    throw new Error(`Invalid configuration: ${errors.join(', ')}`);
  }
}

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironmentConfig().appEnv === 'development';
}

/**
 * Check if we're running in production mode
 */
export function isProduction(): boolean {
  return getEnvironmentConfig().appEnv === 'production';
}

/**
 * Check if debug logging is enabled
 */
export function isDebugEnabled(): boolean {
  return getEnvironmentConfig().enableDebugLogs;
}

/**
 * Get CORS configuration for API requests
 */
export function getCORSConfig() {
  const config = getEnvironmentConfig();
  
  return {
    // Allow requests to the API domain
    allowedOrigins: [
      config.apiUrl,
      'https://ipfs.io',
      'https://gateway.pinata.cloud',
    ],
    
    // Required headers for API communication
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Client-Version',
      'X-Client-Platform',
    ],
    
    // Allow credentials for authenticated requests
    credentials: false, // Set to false for security with API keys
  };
}

/**
 * Get security headers for API requests
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}

/**
 * Log configuration on startup (development only)
 */
export function logConfiguration(): void {
  if (!isDevelopment() || !isDebugEnabled()) {
    return;
  }

  const config = getEnvironmentConfig();
  
  console.group('🔧 Universal Minting Engine Configuration');
  console.log('API URL:', config.apiUrl);
  console.log('Story Protocol Chain ID:', config.storyProtocolChainId);
  console.log('Story Protocol RPC:', config.storyProtocolRpcUrl);
  console.log('Environment:', config.appEnv);
  console.log('Features:', {
    videoProcessing: config.enableVideoProcessing,
    licenseRemixer: config.enableLicenseRemixer,
    nftMinting: config.enableNFTMinting,
  });
  console.log('Performance:', {
    timeout: `${config.apiTimeout}ms`,
    retries: config.maxRetryAttempts,
    chunkSize: `${Math.round(config.uploadChunkSize / 1024)}KB`,
  });
  console.groupEnd();
}

// Export singleton instance
export const environmentConfig = getEnvironmentConfig();