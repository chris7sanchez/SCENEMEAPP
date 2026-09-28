'use client';

import { Codigo, Fotograma, Nota, Perforado, useVentanilla } from '@/components/landing/tira';
import { Definicion } from '@/components/landing/definicion';

/*
 * El Método: tres tomas colgando de una sola tira que baja por la página.
 *
 * Cada toma tiene su propia forma —el book es vertical, la escena apaisada, el
 * self-tape en tres cuartos— porque cada medio tiene la suya. No son tres
 * tarjetas iguales, y no deben acabar siéndolo.
 *
 * Los precios salen de src/lib/data.ts y de step1-selection.tsx. Son los de
 * verdad. Donde no hay precio decidido, se dice que no lo hay.
 */

const TOMAS = [
    {
        id: 'book',
        codigo: 'Toma 01',
        titulo: 'El book',
        texto: 'Fotografía pensada para una dirección de casting, no para un perfil. Sales tú, y sale el personaje que de verdad puedes defender.',
        imagen: '/trabajos/web/1.webp',
        alt: 'Retrato de book actoral realizado en SCENE ME',
        proporcion: '4 / 5',
        enlace: '/booking',
        accion: 'Reservar el book',
        precios: [
            { que: 'Básico', detalle: '8 fotos retocadas, 2 cambios', cuanto: '150 €' },
            { que: 'Completo', detalle: '12-15 fotos, 2-3 cambios', cuanto: '299 €' },
            { que: 'Premium', detalle: 'Maquillaje y peluquería, reel en 4K', cuanto: '399 €' },
        ],
        nota: null,
    },
    {
        id: 'escena',
        codigo: 'Toma 02',
        titulo: 'La escena',
        texto: 'Hecha entera a tu medida: guion, tono y horario. Y cuando un director quiere verte hoy, la rodamos en cuarenta y ocho horas.',
        video: '/videos/MUDANZA-loop.mp4',
        poster: '/videos/MUDANZA-loop-poster.jpg',
        alt: 'Fotograma de una escena a medida rodada en SCENE ME',
        proporcion: '16 / 9',
        enlace: '/booking',
        accion: 'Reservar la escena',
        precios: [
            { que: 'Una escena', detalle: 'Guion, dirección y montaje', cuanto: '499 €' },
            { que: 'Dos escenas', detalle: 'Dos registros en la misma jornada', cuanto: '699 €' },
        ],
        nota: 'La escena EXPRESS en 48 h está todavía en el laboratorio.',
    },
    {
        id: 'selftape',
        codigo: 'Toma 03',
        titulo: 'El self-tape',
        texto: 'El que gana el papel: con dirección de casting delante. En packs de cinco y de diez, al mejor precio que vas a encontrar.',
        video: '/videos/Mel_cuban-loop.mp4',
        poster: '/videos/Mel_cuban-loop-poster.jpg',
        alt: 'Fotograma de un self-tape dirigido en SCENE ME',
        proporcion: '3 / 4',
        enlace: '/booking',
        accion: 'Pedir un self-tape',
        precios: [],
        nota: 'Los packs de 5 y de 10 aún no tienen precio cerrado. Se hacen hablando.',
    },
];

export function Metodo() {
    const { activo, registrar } = useVentanilla(TOMAS.length);

    return (
        <section id="metodo" className="relative">
            <div className="pel-grano" />

            <div className="relative z-10 flex">

                {/* La tira baja entera por el borde: una sola, no una por toma. */}
                <div className="sticky top-0 hidden h-screen shrink-0 md:flex">
                    <Perforado />
                    <div className="flex w-9 items-center justify-center">
                        <Codigo vertical>El Método Scene Me</Codigo>
                    </div>
                </div>

                <div className="min-w-0 flex-1 px-6 py-20 sm:px-10 lg:px-14 lg:py-28">

                    {/* Primero la promesa, centrada y en dos líneas, y debajo la
                        definición, que dice lo que la promesa quiere decir. Las dos
                        a media voz (Christian, 28/09/2026): aquí sólo presentan;
                        los titulares grandes son los de cada toma. */}
                    <div className="mb-16 flex flex-col items-center gap-6 text-center lg:mb-24">
                        {/* Más bajo que los nombres de las tomas que vienen
                            detrás: esto presenta, ellos son los titulares. */}
                        <h2 className="pel-titulo-seccion text-[clamp(1.25rem,2.4vw,2rem)]">
                            De actor a estrella<br />
                            <span className="normal-case">en 3 pasos</span>
                        </h2>
                        <Definicion />
                    </div>

                    {/* Cada toma es una banda a todo lo ancho, partida de la
                        siguiente por un filete del ámbar de la cabecera; la del
                        medio, teñida de ese ámbar, para que las tres se lean
                        como tres cosas (.pel-toma-banda en pelicula.css). */}
                    <div className="-mx-6 flex flex-col sm:-mx-10 lg:-mx-14">
                        {TOMAS.map((toma, i) => (
                            <article
                                key={toma.id}
                                id={toma.id}
                                aria-labelledby={`${toma.id}-titulo`}
                                className={`pel-toma-banda flex scroll-mt-16 flex-col gap-10 px-6 py-16 sm:px-10 lg:gap-14 lg:px-14 lg:py-24 ${
                                    i % 2 === 1 ? 'pel-toma-banda--tinte' : ''
                                }`}
                            >
                                {/* El nombre de la toma, centrado justo después del
                                    filete ámbar: es el titular de la banda, y va en
                                    el oro metálico de la cabecera (.pel-titulo-oro). */}
                                <h3
                                    id={`${toma.id}-titulo`}
                                    className="pel-titulo-seccion pel-titulo-oro text-center text-[clamp(2.5rem,5.5vw,4.75rem)]"
                                >
                                    {toma.titulo}
                                </h3>

                                <div
                                    className={`flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 ${
                                        i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                    }`}
                                >
                                    {/*
                                        El fotograma con su margen: el código va
                                        IMPRESO EN VERTICAL al lado, que es donde
                                        vive en la película. Encima del titular era
                                        un antetítulo, y eso está prohibido.
                                    */}
                                    <div
                                        ref={registrar(i)}
                                        className="flex w-full shrink-0 items-stretch lg:w-[48%]"
                                    >
                                        <div className="flex shrink-0 items-stretch gap-2 pr-3">
                                            <Perforado />
                                            <span className="flex items-center">
                                                <Codigo vertical activo={i === activo}>
                                                    {toma.codigo}
                                                </Codigo>
                                            </span>
                                        </div>
                                        <Fotograma
                                            video={toma.video}
                                            poster={toma.poster}
                                            imagen={toma.imagen}
                                            alt={toma.alt}
                                            activo={i === activo}
                                            style={{ aspectRatio: toma.proporcion }}
                                            className="min-w-0 flex-1"
                                        />
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col gap-5">
                                        <p className="pel-cuerpo max-w-[44ch]">{toma.texto}</p>

                                        {toma.precios.length > 0 && (
                                            <dl className="mt-2 flex flex-col border-t border-[var(--pel-sombra)]">
                                                {toma.precios.map((p) => (
                                                    <div
                                                        key={p.que}
                                                        className="flex items-baseline justify-between gap-6 border-b border-[var(--pel-sombra)] py-3"
                                                    >
                                                        <dt className="min-w-0">
                                                            <span className="block text-[1.0625rem] text-[var(--pel-emulsion)]">
                                                                {p.que}
                                                            </span>
                                                            <span className="block text-[0.9375rem] text-[var(--pel-emulsion)] opacity-75">
                                                                {p.detalle}
                                                            </span>
                                                        </dt>
                                                        <dd className="shrink-0 text-[1.125rem] tabular-nums text-[var(--pel-emulsion)]">
                                                            {p.cuanto}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        )}

                                        {toma.nota && <Nota className="mt-1">{toma.nota}</Nota>}

                                        <a href={toma.enlace} className="pel-enlace mt-3 w-fit text-[1.0625rem]">
                                            {toma.accion}
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
