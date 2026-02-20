/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable for Docker self-hosted deploy (standalone server)
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
};

module.exports = nextConfig;
