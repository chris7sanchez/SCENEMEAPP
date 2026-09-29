'use client';

import { Codigo, Fotograma, Nota, Perforado, useVentanilla } from '@/components/landing/tira';
import { AnimatedText } from '@/components/ui/animated-shiny-text';
import { ORO_BRILLO, ORO_DURACION } from '@/components/landing/oro';
import { EsquemaEscena } from '@/components/landing/esquema-escena';
import { MuroBook } from '@/components/landing/muro-book';

/*
 * El Método: tres tomas colgando de una sola tira que baja por la página.
 *
 * Cada toma tiene su propia forma —el book es vertical, la escena apaisada, el
 * self-tape en tres cuartos— porque cada medio tiene la suya. No son tres
 * tarjetas iguales, y no deben acabar siéndolo.
 *
 * SIN PRECIOS (Christian, 28/09/2026): aquí se enseñan las opciones, y los
 * precios se ven dentro de la app. Las opciones salen de src/lib/data.ts y de
 * step1-selection.tsx; no se inventa ninguna. La escena lleva además su
 * esquema (esquema-escena.tsx): los pasos de la app para diseñarla.
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
        accion: 'Ver precios y reservar el book',
        opciones: [
            { que: 'Básico', detalle: '8 fotos retocadas, 2 cambios' },
            { que: 'Completo', detalle: '12-15 fotos, 2-3 cambios' },
            { que: 'Premium', detalle: 'Maquillaje y peluquería, reel en 4K' },
        ],
        nota: null,
        esquema: false,
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
        accion: 'Ver precios y reservar la escena',
        // Una o dos escenas es el primer paso del esquema: no se repite aquí.
        opciones: [] as { que: string; detalle: string }[],
        nota: 'La escena EXPRESS en 48 h está todavía en el laboratorio.',
        esquema: true,
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
        accion: 'Ver precios y pedir un self-tape',
        opciones: [
            { que: 'Pack de 5', detalle: 'Cinco self-tapes con dirección de casting' },
            { que: 'Pack de 10', detalle: 'Diez self-tapes con dirección de casting' },
        ],
        nota: null,
        esquema: false,
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

                <div className="min-w-0 flex-1 px-6 pb-20 sm:px-10 lg:px-14 lg:pb-28">

                    {/* La presentación del Método («De actor a estrella en 3
                        pasos») es ahora el primer titular de la portada, y la
                        definición es la cita del vídeo de cabecera: aquí se va
                        directo a las tomas (Christian, 28/09/2026). */}
                    <h2 className="sr-only">El Método: de actor a estrella en 3 pasos</h2>

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
                                    filete ámbar: es el titular de la banda. Oro
                                    en movimiento (AnimatedText): un degradado
                                    radial de centro ancho y suave que va y viene
                                    por dentro de las letras (oro.ts). */}
                                <AnimatedText
                                    as="h3"
                                    text={toma.titulo}
                                    textId={`${toma.id}-titulo`}
                                    gradientColors={ORO_BRILLO}
                                    gradientAnimationDuration={ORO_DURACION}
                                    className="py-0"
                                    textClassName="pel-titulo-seccion pel-titulo-oro text-center leading-[0.92] text-[clamp(2.5rem,5.5vw,4.75rem)] sm:text-[clamp(2.5rem,5.5vw,4.75rem)] md:text-[clamp(2.5rem,5.5vw,4.75rem)] lg:text-[clamp(2.5rem,5.5vw,4.75rem)] xl:text-[clamp(2.5rem,5.5vw,4.75rem)]"
                                />

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
                                        {toma.id === 'book' ? (
                                            <MuroBook
                                                style={{ aspectRatio: toma.proporcion }}
                                                className="min-w-0 flex-1"
                                            />
                                        ) : (
                                            <Fotograma
                                                video={toma.video}
                                                poster={toma.poster}
                                                imagen={toma.imagen}
                                                alt={toma.alt}
                                                activo={i === activo}
                                                style={{ aspectRatio: toma.proporcion }}
                                                className="min-w-0 flex-1"
                                            />
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col gap-5">
                                        <p className="pel-cuerpo max-w-[44ch]">{toma.texto}</p>

                                        {/* Las opciones, sin precio: los precios, dentro de la app. */}
                                        {toma.opciones.length > 0 && (
                                        <ul className="mt-2 flex flex-col border-t border-[var(--pel-sombra)]">
                                            {toma.opciones.map((o) => (
                                                <li key={o.que} className="border-b border-[var(--pel-sombra)] py-3">
                                                    <span className="block text-[1.0625rem] text-[var(--pel-emulsion)]">{o.que}</span>
                                                    <span className="block text-[0.9375rem] text-[var(--pel-emulsion)] opacity-75">{o.detalle}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        )}

                                        {toma.nota && <Nota className="mt-1">{toma.nota}</Nota>}

                                        <a href={toma.enlace} className="pel-enlace mt-3 w-fit text-[1.0625rem]">
                                            {toma.accion}
                                        </a>
                                    </div>
                                </div>

                                {toma.esquema && <EsquemaEscena />}
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
