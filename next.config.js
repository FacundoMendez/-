/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: false,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: 'file-loader',
      },
    });
    return config;
  },
  publicRuntimeConfig: {
    ASSET_PREFIX: process.env.ASSET_PREFIX || '',
  },
};

module.exports = nextConfig;
