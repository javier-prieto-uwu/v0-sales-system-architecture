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
  // Inyectar variables públicas de Supabase en el cliente durante build
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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