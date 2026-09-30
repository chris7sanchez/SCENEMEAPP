'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ScrollPortraitWall } from '@/components/ui/scroll-portrait-wall';
import { HeroScrollAnimation } from '@/components/ui/hero-scroll-animation';
import { AnimatedText } from '@/components/ui/animated-shiny-text';
import { Codigo } from '@/components/landing/tira';
import { ORO_BRILLO, ORO_DURACION } from '@/components/landing/oro';

/*
 * PROPUESTA (30/09/2026): EL BOOK dentro de un MARCO que sube al terminar la
 * galería del principio: un hueco encuadrado, con las esquinas redondeadas y
 * relieve (canto oscuro por debajo y filo ámbar arriba), que entra inclinado
 * hacia atrás y se endereza al llegar. Dentro, tres maneras de enseñar los
 * books, para compararlas (?book=1, 2 o 3):
 *   1. Muro de retratos: el titular fijo en el centro y las fotos que crecen
 *      y se van a su paso (Scroll Portrait Wall, GSAP).
 *   2. Páginas: cada pantalla es una página con dos fotos de la misma persona
 *      una al lado de otra (sus dos cambios), y la siguiente se apila encima
 *      (a la manera de Story Scroll).
 *   3. Relevo: una pantalla con el titular sobre una foto se encoge y gira, y
 *      por encima sube la rejilla de fotos (hero-scroll-animation).
 * Las fotos son los 28 retratos de book reales de public/trabajos/web.
 */

const TODAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '1.2', '2.2', '4.2', '5.2', '6.2', '8.2', '9.2', '10.2', '11.2', '1.3', '2.3', '4.3', '6.3', '8.3', '9.3', '10.3', '11.3'];
const ruta = (n: string) => '/trabajos/web/' + n + '.webp';
const ALT = 'Retrato de book actoral realizado en SCENE ME';

/** Las opciones del book, sin precio: los precios, dentro de la app. */
function OpcionesBook() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
            <ul className="grid w-full gap-3 sm:grid-cols-3">
                {[
                    ['Básico', '8 fotos retocadas, 2 cambios'],
                    ['Completo', '12-15 fotos, 2-3 cambios'],
                    ['Premium', 'Maquillaje y peluquería, reel en 4K'],
                ].map(([que, detalle]) => (
                    <li key={que} className="rounded-md border border-[var(--pel-sombra)] p-5 text-left" style={{ backgroundColor: 'rgba(14, 15, 16, 0.82)' }}>
                        <span className="block text-[1.0625rem] text-[var(--pel-emulsion)]">{que}</span>
                        <span className="block text-[0.9375rem] text-[var(--pel-emulsion)] opacity-75">{detalle}</span>
                    </li>
                ))}
            </ul>
            <a href="/booking" className="pel-enlace text-[1.0625rem]">Ver precios y reservar el book</a>
        </div>
    );
}

function TituloOro({ children, className = '' }: { children: ReactNode; className?: string }) {
    // Clases escritas enteras (Tailwind sólo genera las que ve literales); se
    // repiten por tamaño porque AnimatedText trae las suyas en sm/md/lg/xl.
    return (
        <AnimatedText
            as="h2"
            text={children}
            gradientColors={ORO_BRILLO}
            gradientAnimationDuration={ORO_DURACION}
            className={`py-0 ${className}`}
            textClassName="pel-titulo-seccion pel-titulo-oro leading-[0.9] text-[clamp(3rem,9vw,8rem)] sm:text-[clamp(3rem,9vw,8rem)] md:text-[clamp(3rem,9vw,8rem)] lg:text-[clamp(3rem,9vw,8rem)] xl:text-[clamp(3rem,9vw,8rem)]"
        />
    );
}

/* ---------------- 1. Muro de retratos ---------------- */

function OpcionMuro() {
    return (
        <>
            <ScrollPortraitWall
                title="El book"
                date="Toma 01 · Fotografía para una dirección de casting"
                hint="Baja: son books de verdad"
                speakers={TODAS.map((n) => ({ name: ALT, role: '', src: ruta(n) }))}
                columns={4}
                showCaptions={false}
                grayscale={false}
                titleClassName="pel-titulo-seccion"
                className="text-[var(--pel-emulsion)]"
            />
            <OpcionesBook />
        </>
    );
}

/* ---------------- 2. Páginas de dos fotos ---------------- */

const PAREJAS: [string, string][] = [['1', '1.2'], ['2', '2.2'], ['4', '4.2'], ['6', '6.2'], ['9', '9.2'], ['10', '10.2'], ['11', '11.2']];

function Pagina({ par, i, total }: { par: [string, string]; i: number; total: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const quieto = useReducedMotion();
    // Al taparla la siguiente, la página se aleja un poco y se apaga.
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const brillo = useTransform(scrollYProgress, [0, 1], [1, 0.45]);
    const filter = useTransform(brillo, (b) => `brightness(${b})`);

    return (
        <div ref={ref} className="sticky top-0 h-screen">
            <motion.div
                style={quieto ? undefined : { scale, filter }}
                className="flex h-full flex-col items-center justify-center gap-5 px-4 py-10"
            >
                <div className="flex w-full max-w-5xl items-baseline justify-between">
                    <Codigo>El book</Codigo>
                    <Codigo activo>{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</Codigo>
                </div>
                <div className="grid w-full max-w-5xl grid-cols-2 gap-3 sm:gap-5">
                    {par.map((n) => (
                        <figure key={n} className="pel-fotograma aspect-[4/5] max-h-[70vh] w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ruta(n)} alt={ALT} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        </figure>
                    ))}
                </div>
                <p className="pel-cuerpo text-[0.9375rem]">Dos cambios, la misma persona: el que eres y el que puedes defender.</p>
            </motion.div>
        </div>
    );
}

function OpcionPaginas() {
    return (
        <>
            <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <TituloOro>El book</TituloOro>
                <p className="pel-cuerpo max-w-[44ch]">Fotografía pensada para una dirección de casting, no para un perfil. Pasa las páginas.</p>
            </div>
            {PAREJAS.map((par, i) => (
                <Pagina key={par[0]} par={par} i={i} total={PAREJAS.length} />
            ))}
            <OpcionesBook />
        </>
    );
}

/* ---------------- 3. Relevo ---------------- */

function OpcionRelevo() {
    return (
        <>
            <HeroScrollAnimation
                primera={
                    <div className="relative grid h-full place-items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ruta('5')} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14, 15, 16, 0.72)' }} />
                        <div className="relative flex flex-col items-center gap-4 px-6 text-center">
                            <TituloOro>El book</TituloOro>
                            <p className="pel-cuerpo max-w-[44ch] text-[var(--pel-emulsion)]">Fotografía pensada para una dirección de casting, no para un perfil. Sales tú, y sale el personaje que de verdad puedes defender.</p>
                        </div>
                    </div>
                }
                segunda={
                    <div className="grid h-full grid-cols-2 gap-2 p-2 sm:grid-cols-4">
                        {TODAS.slice(0, 8).map((n) => (
                            <figure key={n} className="pel-fotograma aspect-[4/5] w-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ruta(n)} alt={ALT} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                            </figure>
                        ))}
                    </div>
                }
                claseSegunda="bg-[var(--pel-leader)]"
            />
            <OpcionesBook />
        </>
    );
}

/* ---------------- El marco ---------------- */

export function MarcoBook({ opcion }: { opcion: 1 | 2 | 3 }) {
    const ref = useRef<HTMLElement>(null);
    const quieto = useReducedMotion();
    // Entra un poco pequeño y más abajo, y crece hasta su sitio al llegar
    // arriba. (Se probó a inclinarlo en 3D, pero un marco tan alto, girado,
    // se sale de la perspectiva por abajo y las fotos salen del revés.)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
    const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

    return (
        <div className="relative z-10 px-2 pb-2 md:px-4 md:pb-4">
            <motion.section
                ref={ref}
                id="book"
                style={quieto ? undefined : { scale, y, transformOrigin: '50% 0%' }}
                className="pel-marco relative rounded-[32px] md:rounded-[44px]"
            >
                {opcion === 1 && <OpcionMuro />}
                {opcion === 2 && <OpcionPaginas />}
                {opcion === 3 && <OpcionRelevo />}
            </motion.section>
        </div>
    );
}
