/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API_URL vacío — las rutas en código ya incluyen /api/
  env: {
    NEXT_PUBLIC_API_URL: '',
  },
  // Reescribir /api/* al backend NestJS
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
