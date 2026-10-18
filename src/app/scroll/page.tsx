import type { Metadata } from 'next';
import ScrollCine from '@/components/scroll-cine/ScrollCine';

// Propuesta de portada con scroll cinematográfico. Es una ruta aparte (no toca
// la portada) y no se indexa mientras se prueba.
export const metadata: Metadata = {
    title: 'SCENE ME — Scroll cinematográfico',
    robots: { index: false, follow: false },
};

export default function ScrollPage() {
    return (
        <main style={{ background: '#0E0A04' }}>
            <ScrollCine />
            <div style={{ height: '40vh', background: '#0E0A04' }} aria-hidden="true" />
        </main>
    );
}
