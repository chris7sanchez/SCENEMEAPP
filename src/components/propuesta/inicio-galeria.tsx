'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import StickyScroll from '@/components/ui/sticky-scroll';
import { AnimatedText } from '@/components/ui/animated-shiny-text';
import { LazyVideo } from '@/components/landing/lazy-video';
import { BotonPelicula, Codigo } from '@/components/landing/tira';
import { ORO_BRILLO, ORO_DURACION } from '@/components/landing/oro';
import { icono } from '@/lib/iconos-version';

/*
 * PROPUESTA (30/09/2026): todo el principio de la portada dentro de la galería
 * con columna central fija (components/ui/sticky-scroll.tsx).
 *
 * - Primera pantalla, fija: el titular en oro («De actor a estrella / en 3
 *   pasos»), lo que se rueda aquí y la frase de la portada.
 * - Debajo, tres columnas: los lados suben mezclando FOTOS de book reales,
 *   VÍDEOS de escenas rodadas aquí y CAJAS con el texto de la portada (las dos
 *   puertas: «Aún no tengo material» y «El mío ya no me representa»). En el
 *   centro, fija mientras pasan, la llamada con los dos botones entre dos
 *   escenas: lo que tiene que quedarse a la vista.
 * - Al terminar, `final`: el marco de EL BOOK (book-opciones.tsx).
 */

const alto = 'h-64 md:h-96';

function Foto({ n, alt = 'Retrato de book actoral realizado en SCENE ME', alta = false }: { n: string; alt?: string; alta?: boolean }) {
    return (
        <figure className={`pel-fotograma w-full ${alta ? 'h-full min-h-64' : alto}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={'/trabajos/web/' + n + '.webp'} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </figure>
    );
}

function Video({ nombre, alta = false }: { nombre: string; alta?: boolean }) {
    return (
        <figure className={`pel-fotograma w-full ${alta ? 'h-full min-h-64' : alto}`} aria-hidden="true">
            <LazyVideo src={'/videos/' + nombre + '-loop.mp4'} poster={'/videos/' + nombre + '-loop-poster.jpg'} className="h-full w-full object-cover" />
        </figure>
    );
}

/** El texto de la portada, encajonado: una caja por idea. */
function Caja({ codigo, children, alta = false }: { codigo: string; children: ReactNode; alta?: boolean }) {
    return (
        <div
            className={`flex w-full flex-col justify-between gap-5 rounded-md border border-[var(--pel-sombra)] p-6 max-md:col-span-2 lg:p-8 ${alta ? '' : 'min-h-64 md:h-96'}`}
            style={{ backgroundColor: 'rgba(14, 15, 16, 0.82)' }}
        >
            <Codigo>{codigo}</Codigo>
            {children}
        </div>
    );
}

const intro = (
    <div className="pel-sobre-placa flex flex-col items-center gap-2 px-6 text-center">
        <AnimatedText
            as="h1"
            text={
                <>
                    De actor a estrella<br />
                    <span className="normal-case">en 3 pasos</span>
                </>
            }
            gradientColors={ORO_BRILLO}
            gradientAnimationDuration={ORO_DURACION}
            className="py-0"
            textClassName="pel-titulo-seccion pel-titulo-oro leading-[0.92] text-[clamp(2.5rem,6vw,5.5rem)] sm:text-[clamp(2.5rem,6vw,5.5rem)] md:text-[clamp(2.5rem,6vw,5.5rem)] lg:text-[clamp(2.5rem,6vw,5.5rem)] xl:text-[clamp(2.5rem,6vw,5.5rem)]"
        />
        <p className="pel-titulo-seccion whitespace-nowrap text-[clamp(0.9375rem,1.7vw,1.5rem)] text-[var(--pel-emulsion)]">
            Tu book, tu escena y tu self‑tape
        </p>
        {/* 17/10/2026 (Christian): la cabecera ocupa SOLO el titular, el
            subtítulo y esta frase, en letra pequeña. Fuera el «Baja y míralo». */}
        {/* !: .pel-cuerpo fija 1.0625rem en pelicula.css y pisaba la utilidad. */}
        <p className="pel-cuerpo max-w-[52ch] text-balance !text-[0.875rem] !leading-snug text-[var(--pel-margen)] lg:!text-[0.9375rem]">
            La forma más cómoda, rápida y profesional para rodar{' '}
            <strong className="font-semibold uppercase tracking-[0.02em] text-[var(--pel-emulsion)]">tu mejor</strong> material.
        </p>
    </div>
);

const izquierda = [
    <Foto key="f1" n="1" />,
    <Caja key="c1" codigo="Aún no tengo material">
        <p className="pel-titulo-seccion text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.02]">Empieza por el book</p>
        <p className="pel-cuerpo text-[0.9375rem]">Fotografía pensada para una dirección de casting, no para un perfil. Sales tú, y sale el personaje que de verdad puedes defender.</p>
        <a href="#book" className="pel-enlace w-fit text-[1rem]">Ver el book</a>
    </Caja>,
    <Video key="v1" nombre="SHOGUN" />,
    <Foto key="f2" n="6.2" />,
    <Caja key="c2" codigo="Mañana tienes prueba">
        <p className="pel-titulo-seccion text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.02]">El self‑tape</p>
        <p className="pel-cuerpo text-[0.9375rem]">El que gana el papel: con dirección de casting delante. En packs de cinco y de diez.</p>
        <a href="/booking" className="pel-enlace w-fit text-[1rem]">Pedir un self‑tape</a>
    </Caja>,
];

const centro = [
    <Video key="vc1" nombre="AMANDA" alta />,
    <Caja key="cc" codigo="Scene Me Studios" alta>
        <div className="flex items-center justify-between gap-4">
            <p className="pel-titulo-seccion text-[clamp(1.375rem,2vw,1.875rem)] leading-[1.02]">
                Empieza a creer en ti,
                <br />
                accede a Scene Me
            </p>
            <Link href="/login" aria-label="Entrar en SCENE ME" className="block w-[clamp(56px,6vw,88px)] shrink-0 rounded-[21%] transition-transform duration-300 hover:scale-[1.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icono('/android-chrome-192x192.png')} alt="" width={88} height={88} className="h-auto w-full rounded-[21%]" />
            </Link>
        </div>
        <div className="flex flex-wrap gap-3">
            <BotonPelicula href="/booking">Reservar sesión</BotonPelicula>
            <BotonPelicula href="/login" variante="secundario">Entrar a los Estudios</BotonPelicula>
        </div>
    </Caja>,
    <Video key="vc2" nombre="SILVIA" alta />,
];

const derecha = [
    <Video key="v2" nombre="SONIA_DORADO" />,
    <Foto key="f3" n="8" />,
    <Caja key="c3" codigo="El mío ya no me representa">
        <p className="pel-titulo-seccion text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.02]">Ve directo a la escena</p>
        <p className="pel-cuerpo text-[0.9375rem]">Hecha entera a tu medida: guion, tono y horario. Y cuando un director quiere verte hoy, la rodamos en cuarenta y ocho horas.</p>
        <a href="#escena" className="pel-enlace w-fit text-[1rem]">Ver la escena</a>
    </Caja>,
    <Video key="v3" nombre="OLIVER" />,
    <Foto key="f4" n="10" />,
];

export function InicioGaleria({ final }: { final?: ReactNode }) {
    // La caja del centro, a su medida; los dos vídeos se reparten el resto.
    return <StickyScroll intro={intro} izquierda={izquierda} centro={centro} derecha={derecha} final={final} filasCentro="minmax(0, 1fr) auto minmax(0, 1fr)" />;
}
