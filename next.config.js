/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/prompt',
  assetPrefix: '/prompt/',
  distDir: 'out',
  cleanDistDir: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
