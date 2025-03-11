/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/prompt' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/prompt/' : '',
};

module.exports = nextConfig;
