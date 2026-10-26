import type { Metadata } from 'next';

// Los decks compartidos se ven con el enlace, pero no se indexan en buscadores.
export const metadata: Metadata = {
    title: 'Deck de referencias · SCENE ME',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
