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
      // La antigua ruta /antigravity ahora se llama /actorlogia.
      // Solo la ruta EXACTA se redirige; los assets en /public/antigravity/*
      // (imágenes de fondo) se siguen sirviendo sin tocar.
      { source: '/antigravity', destination: '/actorlogia', permanent: true },
    ];
  },
};

export default nextConfig;

