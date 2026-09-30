import type { Metadata } from 'next';
import { Hero3DSection } from '@/components/hero-3d/hero-3d-section';

/*
 * PÁGINA DE PRUEBA del hero 3D (30/09/2026). No está enlazada desde ningún
 * sitio ni la indexan los buscadores: es para que Christian la compare con la
 * portada de verdad antes de decidir si entra en ella.
 */

export const metadata: Metadata = {
    title: 'Hero 3D (prueba) · SCENE ME',
    robots: { index: false, follow: false },
};

export default function Hero3DPrueba() {
    return (
        <main className="bg-[#111111]">
            <Hero3DSection />
        </main>
    );
}
