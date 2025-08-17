/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Proxy to API Gateway (restored to 3000)
      },
    ];
  },
};

module.exports = nextConfig;
