import type { Metadata } from 'next';
import Link from 'next/link';
import '@/components/landing/pelicula.css';
import { Presentacion } from '@/components/landing/presentacion';
import { ClaquetaMenu } from '@/components/landing/claqueta-menu';
import { Cierre } from '@/components/landing/cierre';
import { InicioGaleria } from '@/components/propuesta/inicio-galeria';
import { MarcoBook } from '@/components/propuesta/book-opciones';

/*
 * PÁGINA DE PRUEBA (30/09/2026): la portada con el principio en galería fija
 * (sticky-scroll) y EL BOOK en un marco, en tres opciones (?book=1, 2 o 3).
 * No está enlazada ni la indexan los buscadores: es para comparar con la
 * portada de verdad antes de decidir qué entra.
 */

export const metadata: Metadata = {
    title: 'Propuesta de portada · SCENE ME',
    robots: { index: false, follow: false },
};

const OPCIONES = [
    { n: 1, nombre: 'Muro de retratos' },
    { n: 2, nombre: 'Páginas de 2 fotos' },
    { n: 3, nombre: 'Relevo' },
] as const;

export default async function Propuesta({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
    const { book } = await searchParams;
    const opcion = (['1', '2', '3'].includes(book ?? '') ? Number(book) : 1) as 1 | 2 | 3;

    return (
        <div className="pel min-h-screen">
            <header className="relative z-30">
                <Presentacion />
                <ClaquetaMenu />
            </header>

            <InicioGaleria final={<MarcoBook opcion={opcion} />} />

            <Cierre />

            {/* Para comparar: las tres opciones de EL BOOK. */}
            <nav
                aria-label="Opciones de EL BOOK"
                className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--pel-sombra)] p-1 text-[0.8125rem] shadow-lg backdrop-blur-md"
                style={{ backgroundColor: 'rgba(14, 15, 16, 0.85)' }}
            >
                <span className="px-2 text-[var(--pel-margen)] sm:hidden">El book:</span>
                {OPCIONES.map((o) => (
                    <Link
                        key={o.n}
                        href={`/propuesta?book=${o.n}#book`}
                        aria-current={o.n === opcion ? 'page' : undefined}
                        className={`rounded-full px-3 py-2 font-semibold transition-colors ${o.n === opcion ? 'bg-[var(--pel-oro)] text-[var(--pel-leader)]' : 'text-[var(--pel-emulsion)] hover:text-white'}`}
                    >
                        {o.n}<span className="hidden sm:inline"> · {o.nombre}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
