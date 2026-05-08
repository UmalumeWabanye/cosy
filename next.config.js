/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@mui/styled-engine': require.resolve('@mui/styled-engine-sc'),
    };
    return config;
  },
};

module.exports = nextConfig;
