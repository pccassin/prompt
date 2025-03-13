/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  /**
   * Enable static exports
   */
  output: 'export',

  /**
   * Set base path and asset prefix based on environment
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  /**
   * Disable server-based image optimization
   */
  images: {
    unoptimized: true,
  },

  /**
   * Add trailing slash to match GitHub Pages behavior
   */
  trailingSlash: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
};

module.exports = nextConfig;
