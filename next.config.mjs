/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure packages that need to be transpiled
  transpilePackages: [
    '@tensorflow/tfjs',
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-converter',
    '@tensorflow-models/pose-detection',
  ],
  // Configure external packages for server components (updated for Next.js 16)
  serverExternalPackages: [],
  // Configure body size limits for API routes
  experimental: {
    // Add any experimental features here if needed
  },
  // Turbopack configuration for Next.js 16
  turbopack: {
    // Empty config to silence the warning and use default Turbopack settings
  },
  webpack: (config, { isServer }) => {
    // Handle TensorFlow.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }

      // Ignore MediaPipe module since we're only using MoveNet
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mediapipe/pose': false,
      }
    }

    return config
  },
}

export default nextConfig
