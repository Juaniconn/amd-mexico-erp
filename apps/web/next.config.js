/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Same-origin via nginx: paths in code already include `/api/...`.
  // Force empty so CI/Deploy cannot bake NEXT_PUBLIC_API_URL=/api → /api/api/...
  env: {
    NEXT_PUBLIC_API_URL: '',
  },
  // Dev-only: proxy /api to Nest when not behind nginx
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:3001/api/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
