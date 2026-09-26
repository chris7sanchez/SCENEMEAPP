'use client';

import { BotonPelicula, Codigo, Fotograma, Perforado } from '@/components/landing/tira';

/*
 * La otra mitad: lo que pasa entre rodaje y rodaje.
 *
 * Aquí NO hay tres tarjetas. Es un listado, como el pie de una hoja de
 * montaje: columna de código, qué es, qué hace, y a dónde lleva. Los tres
 * destinos son distintos y existen los tres.
 */

const ENTRADAS = [
    {
        titulo: 'Una escena al día',
        texto: 'Trabaja a tu actor todos los días con escenas nuevas. Lo que era una clase suelta al mes ahora es un hábito.',
        enlace: '/estudios',
        accion: 'Abrir mis Estudios',
    },
    {
        titulo: 'El guion entero, con réplicas',
        texto: 'Subes el guion completo y cada personaje te contesta con su voz. Se calla en tus líneas. Nunca te lo habían ofrecido así.',
        enlace: '/studio',
        accion: 'Probar el ensayo',
    },
    {
        titulo: 'Otras miradas sobre lo tuyo',
        texto: 'Compartes tu grabación del día y recibes opiniones que suman. Siempre desde el respeto y la evolución.',
        enlace: '/comunidad',
        accion: 'Ver la comunidad',
    },
];

export function Estudios() {
    return (
        <section id="estudios" className="relative">
            <div className="pel-grano" />

            {/* La tira cruza en horizontal: aquí la película va tumbada. */}
            <Perforado horizontal />

            <div className="relative z-10 px-6 py-20 sm:px-10 lg:px-14 lg:py-28">

                <div className="mb-14 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <h2 className="pel-titulo-seccion max-w-[34ch] text-[clamp(2.25rem,4.6vw,4rem)]" style={{ textWrap: 'balance' }}>
                        El material se compra.
                        <br />
                        El actor se entrena.
                    </h2>
                    <p className="pel-cuerpo max-w-[42ch]">
                        Lo que pasa entre rodaje y rodaje es lo que de verdad te cambia. Y eso
                        pasa en los Estudios, todos los días.
                    </p>
                </div>

                <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">

                    {/* Un solo fotograma grande: el actor trabajando. */}
                    <div className="w-full shrink-0 lg:w-[38%]">
                        <Fotograma
                            video="/videos/OLIVER-loop.mp4"
                            poster="/videos/OLIVER-loop-poster.jpg"
                            alt="Un actor trabajando una escena en los Estudios SCENE ME"
                            activo
                            style={{ aspectRatio: '4 / 5' }}
                            className="w-full"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <Codigo>Estudios Scene Me</Codigo>
                            <Codigo activo>En marcha</Codigo>
                        </div>
                    </div>

                    {/* El listado. Filas, no cajas. */}
                    <div className="min-w-0 flex-1">
                        <ul className="flex flex-col border-t border-[var(--pel-sombra)]">
                            {ENTRADAS.map((e) => (
                                <li
                                    key={e.titulo}
                                    className="flex flex-col gap-4 border-b border-[var(--pel-sombra)] py-8"
                                >
                                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                                        <h3 className="pel-titulo-seccion text-[clamp(1.5rem,2.6vw,2rem)]">
                                            {e.titulo}
                                        </h3>
                                        <p className="pel-cuerpo max-w-[52ch]">{e.texto}</p>
                                        <a href={e.enlace} className="pel-enlace w-fit text-[1.0625rem]">
                                            {e.accion}
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10">
                            <BotonPelicula href="/login">Entrar gratis a los Estudios</BotonPelicula>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
