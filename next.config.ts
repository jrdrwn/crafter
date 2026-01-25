import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

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

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
