import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const baseConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    return [
      {
        source: '/api/django/:path*',
        destination: `${apiUrl}/api/:path*` // Your Django API URL
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin();
const nextConfig = baseConfig;
export default withNextIntl(nextConfig);
