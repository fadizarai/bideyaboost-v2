import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  output: 'standalone',
  async rewrites() {
    const backendBase =
      process.env.BACKEND_INTERNAL_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'http://backend:3001/api'
        : 'http://localhost:3001/api');
    const normalized = backendBase.replace(/\/$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${normalized}/:path*`,
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
