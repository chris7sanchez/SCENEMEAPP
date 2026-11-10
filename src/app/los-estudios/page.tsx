import Link from 'next/link';
import { SALAS, destinoDe, type Sala } from '@/lib/estudios-nav';
import Tablon from '@/components/estudios/Tablon';

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
 * - y, al final, los tres servicios como reclamo secundario.
 *
 * El patio (/backlot) sigue siendo la entrada de cine; esto es el índice.
 */

const QUE_SE_HACE: Record<Sala['id'], string> = {
    produccion: 'Tu archivo de trabajo: tus películas, tus personajes, tus escenas y tus guiones.',
    plato: 'La escena del día y el ensayo de un guion entero, con las réplicas de los demás personajes.',
    pantalla: 'Las tomas que otros actores han querido enseñar. Mira, aplaude y comenta.',
};

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
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {SALAS.map((s, i) => (
                            <Link key={s.id} href={destinoDe(i)} className={TARJETA}>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{s.stage}</span>
                                <span className="mt-1 text-lg font-bold text-white">{s.sala}</span>
                                <span className="mt-2 text-sm leading-relaxed text-zinc-400">{QUE_SE_HACE[s.id]}</span>
                                <span className="mt-4 text-[11px] font-black uppercase tracking-[0.15em] text-amber-300">Entrar ▶</span>
                            </Link>
                        ))}
                    </div>
                </section>

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
