import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SceneMe VIP Terminal',
    manifest: '/manifest-admin.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'SceneVIP',
    }
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
