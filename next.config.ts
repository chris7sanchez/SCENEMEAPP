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
  async rewrites() {
    return {
      // La raiz sirve la landing del backlot (HTML estatico en public/backlot),
      // manteniendo la URL limpia: scenemeapp.com, sin /backlot en la barra.
      // Va en beforeFiles para ganar a la ruta /  de la app.
      beforeFiles: [
        { source: '/', destination: '/backlot/index.html' },
      ],
    };
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

