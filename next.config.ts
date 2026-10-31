import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // profile pictures are stored on Cloudinary by the backend
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  experimental: {
    // profile picture upload goes through a server action (max 2MB image + overhead)
    serverActions: { bodySizeLimit: '3mb' },
  },
};

export default nextConfig;
