/**
 * Deployment configuration for different environments
 * Handles environment-specific settings and validation
 */

import { EnvironmentConfig } from './environment';

export interface DeploymentConfig {
  name: string;
  apiUrl: string;
  storyProtocolChainId: number;
  storyProtocolRpcUrl: string;
  enableDebugLogs: boolean;
  enableErrorReporting: boolean;
  enableAnalytics: boolean;
  corsOrigins: string[];
  securityHeaders: Record<string, string>;
}

/**
 * Deployment configurations for different environments
 */
export const deploymentConfigs: Record<string, DeploymentConfig> = {
  development: {
    name: 'Development',
    apiUrl: 'http://localhost:3001',
    storyProtocolChainId: 1513, // Story Protocol Testnet
    storyProtocolRpcUrl: 'https://testnet.storyrpc.io',
    enableDebugLogs: true,
    enableErrorReporting: false,
    enableAnalytics: false,
    corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN', // More permissive for development
      'X-XSS-Protection': '1; mode=block',
    },
  },

  staging: {
    name: 'Staging',
    apiUrl: 'https://staging-api.universalmintingengine.com',
    storyProtocolChainId: 1513, // Story Protocol Testnet
    storyProtocolRpcUrl: 'https://testnet.storyrpc.io',
    enableDebugLogs: true,
    enableErrorReporting: true,
    enableAnalytics: false,
    corsOrigins: ['https://staging.movemint.app'],
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    },
  },

  production: {
    name: 'Production',
    apiUrl: 'https://api.universalmintingengine.com',
    storyProtocolChainId: 1516, // Story Protocol Mainnet (when available)
    storyProtocolRpcUrl: 'https://rpc.storyrpc.io',
    enableDebugLogs: false,
    enableErrorReporting: true,
    enableAnalytics: true,
    corsOrigins: ['https://movemint.app', 'https://www.movemint.app'],
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.universalmintingengine.com https://rpc.storyrpc.io;",
    },
  },
};

/**
 * Get deployment configuration for current environment
 */
export function getDeploymentConfig(): DeploymentConfig {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';
  const config = deploymentConfigs[env];

  if (!config) {
    console.warn(`Unknown environment: ${env}. Falling back to development config.`);
    return deploymentConfigs.development;
  }

  return config;
}

/**
 * Validate deployment configuration
 */
export function validateDeploymentConfig(config: DeploymentConfig): void {
  const errors: string[] = [];

  // Validate API URL
  try {
    new URL(config.apiUrl);
  } catch {
    errors.push(`Invalid API URL: ${config.apiUrl}`);
  }

  // Validate RPC URL
  try {
    new URL(config.storyProtocolRpcUrl);
  } catch {
    errors.push(`Invalid RPC URL: ${config.storyProtocolRpcUrl}`);
  }

  // Validate chain ID
  if (config.storyProtocolChainId <= 0) {
    errors.push(`Invalid chain ID: ${config.storyProtocolChainId}`);
  }

  // Validate CORS origins
  config.corsOrigins.forEach((origin, index) => {
    try {
      new URL(origin);
    } catch {
      errors.push(`Invalid CORS origin at index ${index}: ${origin}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Deployment configuration validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Get Next.js configuration for current environment
 */
export function getNextConfig() {
  const deploymentConfig = getDeploymentConfig();
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';

  return {
    // Environment-specific settings
    env: {
      DEPLOYMENT_ENV: env,
      DEPLOYMENT_NAME: deploymentConfig.name,
    },

    // Security headers
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: Object.entries(deploymentConfig.securityHeaders).map(([key, value]) => ({
            key,
            value,
          })),
        },
      ];
    },

    // Redirects for production
    async redirects() {
      if (env === 'production') {
        return [
          {
            source: '/app',
            destination: '/app/dashboard',
            permanent: false,
          },
        ];
      }
      return [];
    },

    // Image optimization
    images: {
      domains: [
        'gateway.pinata.cloud',
        'ipfs.io',
        'cloudflare-ipfs.com',
      ],
      formats: ['image/webp', 'image/avif'],
    },

    // Webpack configuration
    webpack: (config: any, { dev, isServer }: any) => {
      // Production optimizations
      if (!dev && !isServer) {
        config.optimization.splitChunks.chunks = 'all';
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        };
      }

      return config;
    },

    // Experimental features
    experimental: {
      // Enable app directory (if using Next.js 13+)
      appDir: true,
      // Enable server components
      serverComponentsExternalPackages: ['@tensorflow/tfjs-node'],
    },

    // Output configuration for static export (if needed)
    ...(env === 'production' && process.env.NEXT_EXPORT === 'true' && {
      output: 'export',
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
    }),
  };
}

/**
 * Health check configuration
 */
export function getHealthCheckConfig() {
  const deploymentConfig = getDeploymentConfig();

  return {
    endpoints: [
      {
        name: 'Universal Minting Engine API',
        url: `${deploymentConfig.apiUrl}/health`,
        timeout: 5000,
      },
      {
        name: 'Story Protocol RPC',
        url: deploymentConfig.storyProtocolRpcUrl,
        timeout: 5000,
      },
    ],
    interval: 30000, // Check every 30 seconds
    retries: 3,
  };
}

/**
 * Monitoring configuration
 */
export function getMonitoringConfig() {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';

  return {
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: env,
      enabled: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
      tracesSampleRate: env === 'production' ? 0.1 : 1.0,
    },
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    },
    performance: {
      enableWebVitals: true,
      enableResourceTiming: env !== 'development',
    },
  };
}

/**
 * Log deployment configuration on startup
 */
export function logDeploymentConfig(): void {
  const deploymentConfig = getDeploymentConfig();
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';

  if (env === 'development') {
    console.group('🚀 Deployment Configuration');
    console.log('Environment:', deploymentConfig.name);
    console.log('API URL:', deploymentConfig.apiUrl);
    console.log('Chain ID:', deploymentConfig.storyProtocolChainId);
    console.log('RPC URL:', deploymentConfig.storyProtocolRpcUrl);
    console.log('Debug Logs:', deploymentConfig.enableDebugLogs);
    console.log('Error Reporting:', deploymentConfig.enableErrorReporting);
    console.log('Analytics:', deploymentConfig.enableAnalytics);
    console.groupEnd();
  }
}