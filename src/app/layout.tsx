import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
    themeColor: '#000000',
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

import { SiteFooter } from '@/components/site-footer';
import { SplashScreen } from '@/components/pwa/splash-screen';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Contrail+One&family=Encode+Sans+SC:wght@400;700&family=Faster+One&family=Limelight&family=Roboto+Condensed:wght@400;700&family=Trocchi&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <body className="font-body antialiased flex flex-col min-h-screen">
                <SplashScreen />
                <GlobalErrorBoundary>
                    <main className="flex-1">
                        {children}
                    </main>
                </GlobalErrorBoundary>
                <SiteFooter />
            </body>
        </html>
    );
}
