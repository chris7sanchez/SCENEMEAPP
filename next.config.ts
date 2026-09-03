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
      // La raiz SIRVE la landing sin cambiar la URL: scenemeapp.com muestra el
      // backlot y la barra sigue diciendo scenemeapp.com.
      //
      // El destino es '/backlot' y no '/backlot/index.html': Vercel sirve los
      // .html de public/ con URL limpia y devuelve 308 desde la ruta con
      // extension. Un rewrite no sigue redirecciones, asi que apuntar al
      // index.html dejaba la raiz en 404.
      //
      // Va en beforeFiles para ganar a la ruta '/' de la app.
      beforeFiles: [
        { source: '/', destination: '/backlot' },
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

