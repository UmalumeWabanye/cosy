/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;
