import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
  outputFileTracingExcludes: {
    "**/*": [
      "node_modules/ffmpeg-static/**/*",
      "node_modules/@ffmpeg-installer/**/*",
      "src/data/exquisit/**/*",
      "public/videos/**/*",
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async redirects() {
    return [
      // /antigravity (antiguo nombre de Actorlogía) ya no redirige: Actorlogía
      // no vive en SCENE ME. Los assets de /public/antigravity/* siguen ahí.
    ];
  },
};

export default nextConfig;

