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
