/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  /**
   * Enable static exports
   */
  output: 'export',

  /**
   * Set base path for staging and production
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

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

  assetPrefix: process.env.NODE_ENV === 'production' ? '/prompt/' : '',
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
