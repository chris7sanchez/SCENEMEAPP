import type { Metadata } from 'next';
import Link from 'next/link';

import '@/components/landing/pelicula.css';
import { Hero } from '@/components/landing/hero';
import { Presentacion } from '@/components/landing/presentacion';
import { Metodo } from '@/components/landing/metodo';
import { Estudios } from '@/components/landing/estudios';
import { Laboratorio } from '@/components/landing/laboratorio';
import { Preguntas } from '@/components/landing/preguntas';
import { Cierre } from '@/components/landing/cierre';

export const metadata: Metadata = {
    title: 'SCENE ME — Un studio para el actor',
    description:
        'Book, escena a medida y self-tape con dirección de casting en Madrid. Y unos Estudios donde entrenar a diario: una escena al día, el guion entero con réplicas, y una comunidad que te devuelve otras miradas.',
};

/*
 * LA PORTADA.
 *
 * El mundo es una tira de 16 mm revelada a mano. La regla que lo ordena todo:
 * la emulsión vive en el soporte y nunca sobre la imagen. El grano, la raya y
 * la fuga de luz son del material fotográfico; lo que hay dentro del fotograma
 * es el trabajo del actor y sale limpio.
 *
 * El contrato de dirección está en .impeccable/surfaces/src-app-page-tsx.md.
 * La verdad del producto —qué existe y qué no, qué precios son reales, qué
 * está prohibido inventar— está en PRODUCT.md. Léelos antes de tocar esto.
 *
 * El landing anterior está entero en _PARKING/landing-anterior-2026-09-26/.
 */

export default function Portada() {
    return (
        <div className="pel min-h-screen">

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: 'SCENE ME',
                        image: 'https://www.scenemeapp.com/apple-touch-icon.png',
                        description:
                            'Studio para actores en Madrid. Book, escenas a medida y self-tapes con dirección de casting, y unos Estudios donde entrenar a diario con escenas, ensayo de guion con réplicas y comunidad.',
                        url: 'https://www.scenemeapp.com',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Madrid',
                            addressCountry: 'ES',
                        },
                        priceRange: '150€ - 699€',
                    }),
                }}
            />

            {/*
                La cabecera: el nombre se rueda delante de ti (vídeo de
                presentación, components/landing/presentacion.tsx) y debajo la
                fila de navegación. El icono ya no va aquí: el vídeo es el
                nombre, y el icono bajó a la portada como puerta a /login.
            */}
            <header className="relative z-30 border-b border-[var(--pel-sombra)]">
                <Presentacion />

                <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 sm:px-10 lg:px-14">
                    <a href="#metodo" className="pel-codigo">El Método</a>
                    <a href="#estudios" className="pel-codigo">Estudios</a>
                    <a href="#laboratorio" className="pel-codigo">Laboratorio</a>
                    <a href="#preguntas" className="pel-codigo">Preguntas</a>
                    <Link
                        href="/login"
                        className="pel-codigo pel-codigo--activo"
                        style={{ textDecoration: 'underline', textUnderlineOffset: '5px' }}
                    >
                        Entrar
                    </Link>
                </nav>
            </header>

            {/* Las barras del brazo de la claqueta del logo abren la página. */}
            <div className="pel-claqueta" aria-hidden="true" />

            <Hero />
            <Metodo />
            <Estudios />
            <Laboratorio />
            <Preguntas />
            <Cierre />
        </div>
    );
}
