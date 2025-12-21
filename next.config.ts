import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'cdn.prod.website-files.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'images.pexels.com' },
      { hostname: 'picsum.photos' },
      { hostname: 'ik.imagekit.io' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
