import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Images, MonitorPlay, Sparkles, Video, type LucideIcon } from 'lucide-react';
import { SALAS, destinoDe, type Sala } from '@/lib/estudios-nav';
import Tablon from '@/components/estudios/Tablon';
import Puntos from '@/components/estudios/Puntos';

export const metadata = {
    title: 'Los Estudios · Scene Me',
    description: 'Las salas donde entrenar a diario, las referencias de cine y el tablón de actores.',
};

/*
 * LOS ESTUDIOS, DENTRO DE LA APP.
 *
 * 10/11/2026 (Christian): la barra de abajo queda en Servicios · Studios ·
 * Perfil. Lo primero es comprar el material (Servicios); todo lo de entrenar
 * vive detrás de esta pestaña:
 *
 * - las tres salas (la lista es la de lib/estudios-nav.ts, la misma del patio);
 * - Fotogramas, que antes tenía pestaña propia;
 * - el tablón, que antes era la pestaña Talentos con perfiles de ejemplo y
 *   ahora se hace con los actores que comparten toma (lib/tablon.ts);
 * - los puntos que da esa actividad y sus descuentos (lib/puntos.ts);
 * - y, al final, los tres servicios como reclamo secundario.
 *
 * El patio (/backlot) sigue siendo la entrada de cine; esto es el índice.
 */

/*
 * 10/11/2026 (Christian): las tres salas se pintan como las tarjetas de
 * Servicios (steps/step0-intro.tsx), para que la app sea una sola cosa:
 *
 * - arriba, una franja con el nombre de la sala y, debajo y más pequeño, su
 *   stage; el símbolo va a la derecha del todo, como en Servicios;
 * - en el centro, la explicación con el mismo ritmo que allí: una línea
 *   pequeña, un titular grande de color y las palabras clave resaltadas;
 * - abajo, el botón de color. El Plató va en medio y destacado en oro.
 *
 * El fondo es la foto de su nave en el patio (public/backlot). Los textos son
 * de Christian.
 */
interface Cartel {
    foto: string;
    Icono: LucideIcon;
    boton: string;
    /** La del medio manda, como SCENE ME en Servicios. */
    protagonista?: boolean;
    tono: 'oro' | 'blanco' | 'azul';
    /** Recibe la clase de color de las palabras resaltadas. */
    explicacion: (acento: string) => ReactNode;
}

const TITULAR = 'block font-black uppercase leading-none tracking-tighter';
const LINEA = 'block text-sm font-medium leading-snug text-white/85';

const CARTELES: Record<Sala['id'], Cartel> = {
    produccion: {
        foto: '/backlot/nave2.jpg',
        Icono: Images,
        boton: 'Entrar en Mis Estudios',
        tono: 'blanco',
        explicacion: (acento) => (
            <>
                <span className="block text-sm font-bold uppercase tracking-wide text-white/85">Crea tu propio</span>
                <span className={`${TITULAR} text-4xl ${acento} drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]`}>Moodboard</span>
                <span className={LINEA}>
                    o <strong className={`font-black uppercase ${acento}`}>libro de referencias</strong>
                </span>
                <span className="block text-xs font-medium text-white/70">Personajes, escenas, películas y producciones.</span>
            </>
        ),
    },
    plato: {
        foto: '/backlot/nave1.jpg',
        Icono: Video,
        boton: 'Entrar en el Plató',
        protagonista: true,
        tono: 'oro',
        explicacion: (acento) => (
            <>
                <span className={`${TITULAR} text-5xl ${acento} drop-shadow-[0_0_15px_rgba(251,191,36,0.45)]`}>Réplica Star!</span>
                <span className={LINEA}>
                    Escoge cuántos <strong className={`font-black uppercase ${acento}`}>personajes</strong> intervienen y personaliza la voz y el ritmo de cada uno.
                </span>
                <span className={LINEA}>
                    Ensaya tus <strong className={`font-black uppercase ${acento}`}>escenas</strong> como en una verdadera{' '}
                    <strong className={`font-black uppercase ${acento}`}>lectura de guion</strong>.
                </span>
            </>
        ),
    },
    pantalla: {
        foto: '/backlot/nave3.jpg',
        Icono: MonitorPlay,
        boton: 'Entrar en la Sala',
        tono: 'azul',
        explicacion: (acento) => (
            <>
                <span className={`${TITULAR} text-4xl ${acento} drop-shadow-[0_2px_10px_rgba(0,0,0,1)]`}>Comparte</span>
                <span className={LINEA}>tus escenas con tu comunidad actoral.</span>
                <span className={LINEA}>
                    Recibe feedback y comenta para ganar{' '}
                    <strong className={`font-black uppercase ${acento}`}>descuentos y premios sorprendentes</strong> para mejorar tu material!
                </span>
            </>
        ),
    },
};

const TONOS = {
    blanco: {
        borde: 'border-white/15 hover:border-white/40',
        franja: 'bg-black/60 border-b border-white/10',
        nombre: 'text-white',
        stage: 'text-primary',
        icono: 'text-primary',
        acento: 'text-primary',
        boton: 'bg-white text-black',
    },
    oro: {
        borde: 'border-primary/60 hover:border-primary shadow-[0_0_50px_rgba(251,191,36,0.18)]',
        franja: 'bg-primary',
        nombre: 'text-black',
        stage: 'text-black/70',
        icono: 'text-black',
        acento: 'text-primary',
        boton: 'bg-primary text-black shadow-xl shadow-primary/30',
    },
    azul: {
        borde: 'border-blue-500/30 hover:border-blue-400/70',
        franja: 'bg-black/60 border-b border-white/10',
        nombre: 'text-white',
        stage: 'text-blue-400',
        icono: 'text-blue-400',
        acento: 'text-blue-400',
        boton: 'bg-blue-500 text-white shadow-xl shadow-blue-500/20',
    },
} as const;

const SERVICIOS = [
    { nombre: 'Book', que: 'Fotos para presentarte a la industria.', href: '/creator?flow=photo&step=1' },
    { nombre: 'Scene Me', que: 'Una escena escrita y rodada a tu medida.', href: '/creator?flow=scene&step=1' },
    { nombre: 'Self-tape', que: 'Tu prueba grabada con dirección de casting.', href: '/booking?service=selftape' },
];

const TARJETA =
    'group flex min-h-11 flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-amber-400/40 hover:bg-white/[0.06]';
const ROTULO = 'text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/70';

export default function LosEstudiosPage() {
    return (
        <main className="min-h-screen bg-[hsl(var(--sm-bg-base))] text-zinc-200">
            <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 sm:pt-14">
                <header className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/70">SCENE ME Studios</p>
                    <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">Los Estudios</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                        El material se compra; el actor se entrena. Aquí se entrena: a diario, desde casa y en sesiones cortas.
                    </p>
                    {/* El patio es HTML estático fuera del router: enlace normal. */}
                    <a
                        href="/backlot"
                        className="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/70 transition-colors hover:border-amber-400/40 hover:text-white"
                    >
                        Entrar por el patio
                    </a>
                </header>

                <section aria-labelledby="salas">
                    <h2 id="salas" className={ROTULO}>Las salas</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3 md:items-stretch">
                        {SALAS.map((s, i) => {
                            const c = CARTELES[s.id];
                            const t = TONOS[c.tono];
                            return (
                                <Link
                                    key={s.id}
                                    href={destinoDe(i)}
                                    className={`group relative isolate flex flex-col overflow-hidden rounded-[2rem] border-2 bg-black transition-all duration-500 md:min-h-[480px] ${c.protagonista ? 'md:-my-2' : ''} ${t.borde}`}
                                >
                                    {/* La foto de la nave, y encima un velo para que el texto se lea siempre. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={c.foto}
                                        alt=""
                                        loading="lazy"
                                        className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                    />
                                    <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/90 to-black/70" />

                                    {/* Nombre y stage a la izquierda; el símbolo, a la derecha del todo. */}
                                    <span className={`flex items-center justify-between gap-3 px-5 py-3 ${t.franja}`}>
                                        <span className="min-w-0">
                                            <span className={`block text-xl font-black uppercase leading-none tracking-tight ${t.nombre}`}>{s.sala}</span>
                                            <span className={`mt-1.5 block text-[11px] font-black uppercase tracking-[0.3em] ${t.stage}`}>{s.stage}</span>
                                        </span>
                                        <span className={`relative shrink-0 ${t.icono}`}>
                                            <c.Icono className={c.protagonista ? 'h-9 w-9 animate-clapper motion-reduce:animate-none' : 'h-7 w-7'} aria-hidden="true" />
                                            {c.protagonista && (
                                                <Sparkles className="absolute -right-2 -top-2 h-4 w-4 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
                                            )}
                                        </span>
                                    </span>

                                    <span className="flex flex-1 flex-col items-center justify-center gap-2.5 px-5 py-7 text-center">
                                        {c.explicacion(t.acento)}
                                    </span>

                                    <span className="px-5 pb-5">
                                        <span className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] ${t.boton}`}>
                                            {c.boton} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <Puntos />

                <section aria-labelledby="referencias" className="mt-12">
                    <h2 id="referencias" className={ROTULO}>Referencias</h2>
                    <Link href="/fotogramas" className={`${TARJETA} mt-4 md:flex-row md:items-center md:justify-between md:gap-6`}>
                        <span>
                            <span className="block text-lg font-bold text-white">Fotogramas</span>
                            <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-zinc-400">
                                Referencias de cine para preparar un personaje: pides lo que buscas, ves la escena y guardas tus capturas en un deck privado.
                            </span>
                        </span>
                        <span className="mt-4 shrink-0 text-[11px] font-black uppercase tracking-[0.15em] text-amber-300 md:mt-0">Abrir ▶</span>
                    </Link>
                </section>

                <section id="tablon" aria-labelledby="tablon-titulo" className="mt-12 scroll-mt-6">
                    <h2 id="tablon-titulo" className={ROTULO}>El tablón</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                        Quién está entrenando en los Estudios. Aparece quien comparte una toma en la Sala de visionado, y de aquí salen los compañeros que puedes proponer cuando encargas una escena.
                    </p>
                    <div className="mt-4">
                        <Tablon modo="ver" />
                    </div>
                </section>

                {/* Reclamo secundario: lo principal aquí es entrenar. */}
                <section aria-labelledby="rodar" className="mt-14 border-t border-white/10 pt-8">
                    <h2 id="rodar" className={ROTULO}>Rueda tu material</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                        Cuando lo entrenado pida cámara: los tres servicios de SCENE ME, rodados en Madrid.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {SERVICIOS.map(s => (
                            <Link
                                key={s.nombre}
                                href={s.href}
                                className="flex min-h-11 flex-col rounded-2xl border border-amber-400/30 bg-amber-500/[0.06] px-4 py-3 transition-colors hover:bg-amber-500/15"
                            >
                                <span className="text-sm font-black uppercase tracking-[0.1em] text-amber-300">{s.nombre}</span>
                                <span className="mt-1 text-xs leading-relaxed text-zinc-400">{s.que}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
