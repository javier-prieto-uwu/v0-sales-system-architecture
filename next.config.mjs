/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Permitir acceso desde dispositivos móviles en la red local
  allowedDevOrigins: [
    '192.168.1.*',
    '192.168.0.*',
    '10.0.0.*',
    '172.16.*',
    'localhost',
    '127.0.0.1'
  ],
}

export default nextConfig