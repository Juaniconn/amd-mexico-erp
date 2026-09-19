/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NO inyectar NEXT_PUBLIC_API_URL — las rutas hardcodeadas ya incluyen /api/
  env: {
    NEXT_PUBLIC_API_URL: '/api',
  },
};

module.exports = nextConfig;
