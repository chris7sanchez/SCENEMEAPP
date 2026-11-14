'use client';

// El vídeo de ejemplo del selftape, en la reserva (/booking?service=selftape):
// lo que el actor está contratando, con los cuatro argumentos de venta.
//
// El vídeo es public/videos/selftapes-web.mp4 (sale de
// scripts/comprimir-selftape.mjs). Si todavía no está subido, el bloque se
// queda con los textos y sin el reproductor, en vez de enseñar un hueco negro.

import { useState } from 'react';
import { Video, Mic, Send } from 'lucide-react';

const VIDEO = '/videos/selftapes-web.mp4';
const POSTER = '/videos/selftapes-poster.jpg';

const PUNTOS = [
    { icono: Video, texto: <>Imagen y sonido <b className="text-white">PROFESIONAL</b></> },
    { icono: Mic, texto: <>Coaching actoral</> },
    { icono: Send, texto: <>Envío de material inmediato</> },
];

export default function EjemploSelftape() {
    const [sinVideo, setSinVideo] = useState(false);

    return (
        <section aria-labelledby="t-selftape" className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className={sinVideo ? '' : 'grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}>
                {!sinVideo && (
                    <div className="flex items-center justify-center bg-black">
                        <video
                            src={VIDEO}
                            poster={POSTER}
                            controls
                            playsInline
                            preload="metadata"
                            onError={() => setSinVideo(true)}
                            aria-label="Ejemplo de selftape grabado en SCENE ME"
                            className="max-h-[70vh] w-full object-contain"
                        />
                    </div>
                )}
                {/* En el móvil el texto va antes: un selftape vertical ocupa la pantalla entera. */}
                <div className="order-first flex flex-col justify-center gap-5 p-6 md:order-none md:p-8">
                    <h2 id="t-selftape" className="font-display font-black uppercase leading-[0.95] tracking-wide text-white">
                        <span className="block text-3xl text-primary md:text-4xl">Marca la diferencia</span>
                        <span className="mt-2 block text-lg text-zinc-200 md:text-xl">mandando <span className="text-white">el mejor selftape!</span></span>
                    </h2>
                    <ul className="space-y-3">
                        {PUNTOS.map(({ icono: Icono, texto }, i) => (
                            <li key={i} className="flex items-center gap-3 text-base text-zinc-200">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/60 text-primary">
                                    <Icono className="h-5 w-5" aria-hidden />
                                </span>
                                <span>{texto}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
