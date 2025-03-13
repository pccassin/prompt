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
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/index.html': { page: '/' },
    };
  },
};

module.exports = nextConfig;
