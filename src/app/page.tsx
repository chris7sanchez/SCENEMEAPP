import type { Metadata } from 'next';
import Link from 'next/link';
import { icono } from '@/lib/iconos-version';

import '@/components/landing/pelicula.css';
import { Hero } from '@/components/landing/hero';
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
                La cabecera: la claqueta pegada a la izquierda, casi tan alta
                como la propia banda, y el nombre centrado de verdad. El logo va
                en posición absoluta a propósito: así el nombre queda centrado
                respecto a la PÁGINA y no respecto al hueco que deja el logo.

                En pantalla estrecha no cabe al lado, así que vuelve a ponerse
                arriba y centrado. No se encoge hasta lo ilegible.
            */}
            <header className="relative z-30 border-b border-[var(--pel-sombra)] px-6 py-8 sm:px-10 lg:px-14">
                <div className="relative flex flex-col items-center justify-center gap-5 sm:min-h-[8.5rem] lg:min-h-[10.5rem]">

                    <Link
                        href="/"
                        aria-label="SCENE ME Studios — ir al inicio"
                        className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={icono('/android-chrome-512x512.png')}
                            alt=""
                            width={168}
                            height={168}
                            className="h-20 w-20 rounded-[18px] sm:h-[8.5rem] sm:w-[8.5rem] sm:rounded-[30px] lg:h-[10.5rem] lg:w-[10.5rem] lg:rounded-[36px]"
                        />
                    </Link>

                    <span className="pel-display text-[clamp(2.5rem,7vw,4.5rem)]">
                        Scene Me
                    </span>

                    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
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
                </div>
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
