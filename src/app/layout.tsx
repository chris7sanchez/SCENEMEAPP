import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
    themeColor: '#000000',
    // iOS PWA safe areas
    viewportFit: 'cover',
}

export const metadata: Metadata = {
    title: 'SCENE ME',
    description: 'Construye tu visión, cuadro por cuadro',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Scene Me',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/android-chrome-192x192.png',
        apple: '/apple-touch-icon.png',
        other: [
            {
                rel: 'apple-touch-icon-precomposed',
                url: '/apple-touch-icon.png',
            },
        ],
    },
};

import { SplashScreen } from '@/components/pwa/splash-screen';
import EntradaBacklot from '@/components/EntradaBacklot';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { BottomTabBar } from '@/components/bottom-tab-bar';
import { SceneMeProviders } from '@/components/SceneMeProviders';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // suppressHydrationWarning en <html>/<body>: extensiones del navegador (cupones,
    // dark mode, gestores de contraseñas) inyectan atributos antes de que React
    // hidrate; sin esto React aborta la hidratación (#418), re-monta la página y
    // BORRA lo que el usuario ya había escrito (p. ej. en el login).
    return (
        <html lang="es" className="dark" data-theme="dark" suppressHydrationWarning>
            <head>
                {/* Limpia cualquier service worker/caché viejo (PWA) para que los
                    despliegues nuevos lleguen siempre sin quedarse en versión cacheada. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}).catch(function(){});}if(window.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});}).catch(function(){});}}catch(e){}`,
                    }}
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Contrail+One&family=Encode+Sans+SC:wght@400;700&family=Faster+One&family=Limelight&family=Roboto+Condensed:wght@400;700&family=Trocchi&family=Caveat:wght@400;700&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700&family=Work+Sans:wght@400;500;600&family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <body className="font-body antialiased flex flex-col min-h-screen" style={{ backgroundColor: 'var(--sm-bg-base)', color: 'var(--sm-text-primary)' }} suppressHydrationWarning>
                <SceneMeProviders>
                    <SplashScreen />
                    {/* Llegada desde el backlot: la seccion nace sobre el ultimo
                        fotograma del paso. No pinta nada si no vienes de ahi. */}
                    <EntradaBacklot />
                    <GlobalErrorBoundary>
                        <main className="flex-1 pb-16 md:pb-0">
                            {children}
                        </main>
                    </GlobalErrorBoundary>
                    <BottomTabBar />
                </SceneMeProviders>
            </body>
        </html>
    );
}
