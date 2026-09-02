'use client';

// MIS ESTUDIOS — el archivo personal del actor, al estilo de una ficha de
// IMDb/FilmAffinity pero centrado en lo que a ti te sirve para trabajar:
// tus películas, tu moodboard de personajes, tus escenas y tus guiones.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Star, Users, Clapperboard, FileText, Plus, Trash2,
    Play, ExternalLink, X, Loader2, ArrowLeft,
} from 'lucide-react';
import {
    listar, guardar, nuevoId, buscarPeliculas, SinClaveError,
    type Coleccion, type Pelicula, type Personaje, type Escena, type Guion,
} from '@/lib/estudios-db';

const PIEL = `
.cinemateca{
    --cin-bg:#F4EFE4; --cin-card:#FBF8F1; --cin-input:#FFFDF8;
    --cin-ink:#14120F; --cin-body:#211E19; --cin-dim:#6B6357;
    --cin-line:#DED5C4;
    --cin-accent:#3F6B5C; --cin-accent-dark:#35594D;
    --cin-accent-soft:rgba(63,107,92,.10); --cin-accent-soft2:rgba(63,107,92,.18);
    --cin-on-accent:#F7F4EC; --cin-sello:#9C4526;
    font-family:"Work Sans",system-ui,-apple-system,sans-serif;
}
.cin-display{ font-family:"Bodoni Moda",Georgia,"Times New Roman",serif; font-weight:700; letter-spacing:-0.012em }
`;

const PESTANAS: { id: Coleccion; label: string; icono: React.ElementType }[] = [
    { id: 'favoritas', label: 'Películas', icono: Star },
    { id: 'moodboard', label: 'Personajes', icono: Users },
    { id: 'escenas', label: 'Escenas', icono: Clapperboard },
    { id: 'guiones', label: 'Guiones', icono: FileText },
];

export default function EstudiosPage() {
    const [uid, setUid] = useState<string | null>(null);
    const [pestana, setPestana] = useState<Coleccion>('favoritas');
    const [favoritas, setFavoritas] = useState<Pelicula[]>([]);
    const [personajes, setPersonajes] = useState<Personaje[]>([]);
    const [escenas, setEscenas] = useState<Escena[]>([]);
    const [guiones, setGuiones] = useState<Guion[]>([]);
    const [ficha, setFicha] = useState<Pelicula | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        import('@/lib/auth').then(async ({ auth }) => {
            const user = await auth.getCurrentUser();
            setUid(user?.uid ?? null);
        }).catch(() => setUid(null));
    }, []);

    // Carga inicial. Sin sesión también funciona: tira de localStorage.
    useEffect(() => {
        let cancelado = false;
        (async () => {
            try {
                const [f, p, e, g] = await Promise.all([
                    listar<Pelicula>(uid, 'favoritas'),
                    listar<Personaje>(uid, 'moodboard'),
                    listar<Escena>(uid, 'escenas'),
                    listar<Guion>(uid, 'guiones'),
                ]);
                if (cancelado) return;
                setFavoritas(f); setPersonajes(p); setEscenas(e); setGuiones(g);
            } catch (err) {
                console.warn('[estudios] no se pudo abrir el archivo:', err);
            } finally {
                // Pase lo que pase, la página deja de decir "Abriendo tu archivo".
                if (!cancelado) setCargando(false);
            }
        })();
        return () => { cancelado = true; };
    }, [uid]);

    const total = favoritas.length + personajes.length + escenas.length + guiones.length;

    return (
        <main className="cinemateca min-h-screen bg-[var(--cin-bg)] text-[var(--cin-body)]">
            <style>{PIEL}</style>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/backlot" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--cin-dim)] transition hover:text-[var(--cin-accent)]">
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver al backlot
                </Link>

                <header className="mb-8">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-[var(--cin-accent)]">Stage 5 · Edad de oro</p>
                    <h1 className="mt-2 cin-display text-4xl tracking-tight sm:text-5xl">Mis Estudios</h1>
                    <p className="mt-3 max-w-2xl text-[var(--cin-dim)]">
                        Tu archivo de trabajo: las películas que te forman, los personajes que te
                        inspiran, las escenas que quieres volver a ver y los guiones que guardas.
                    </p>
                    {!uid && !cargando && (
                        <p className="mt-4 rounded-lg border border-[var(--cin-accent)] bg-[var(--cin-accent-soft)] px-4 py-3 text-sm text-[var(--cin-body)]">
                            Estás sin iniciar sesión: todo se guarda <strong>en este navegador</strong>.{' '}
                            <Link href="/login" className="underline underline-offset-4">Inicia sesión</Link> para sincronizarlo.
                        </p>
                    )}
                </header>

                <nav className="mb-8 flex flex-wrap gap-2" aria-label="Secciones">
                    {PESTANAS.map(({ id, label, icono: Icono }) => {
                        const activa = pestana === id;
                        const n = id === 'favoritas' ? favoritas.length : id === 'moodboard' ? personajes.length : id === 'escenas' ? escenas.length : guiones.length;
                        return (
                            <button key={id} type="button" onClick={() => setPestana(id)} aria-current={activa ? 'page' : undefined}
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                                    activa ? 'border-[var(--cin-accent)] bg-[var(--cin-accent-soft)] text-[var(--cin-accent)]' : 'border-[var(--cin-line)] bg-[var(--cin-card)] text-[var(--cin-dim)] hover:border-[var(--cin-accent)] hover:text-[var(--cin-ink)]'}`}>
                                <Icono className="h-3.5 w-3.5" /> {label}
                                {n > 0 && <span className="rounded-full bg-[rgba(20,18,15,.14)] px-1.5 py-0.5 text-[0.65rem] tabular-nums">{n}</span>}
                            </button>
                        );
                    })}
                </nav>

                {cargando ? (
                    <div className="flex items-center gap-3 py-24 text-[var(--cin-dim)]">
                        <Loader2 className="h-4 w-4 animate-spin" /> Abriendo tu archivo…
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div key={pestana} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                            {pestana === 'favoritas' && (
                                <Peliculas uid={uid} items={favoritas} setItems={setFavoritas} abrirFicha={setFicha} />
                            )}
                            {pestana === 'moodboard' && (
                                <Fichas<Personaje> uid={uid} coleccion="moodboard" items={personajes} setItems={setPersonajes}
                                    vacio="Aún no hay personajes en tu moodboard."
                                    campos={[
                                        { k: 'nombre', label: 'Personaje', requerido: true },
                                        { k: 'pelicula', label: 'De qué película' },
                                        { k: 'imagen', label: 'URL de la imagen' },
                                        { k: 'notas', label: 'Qué te inspira', largo: true },
                                    ]}
                                    render={(p) => (
                                        <>
                                            {p.imagen && <img src={p.imagen} alt="" className="mb-3 h-44 w-full rounded-lg object-cover" loading="lazy" />}
                                            <h3 className="cin-display text-lg text-[var(--cin-ink)]">{p.nombre}</h3>
                                            {p.pelicula && <p className="text-sm text-[var(--cin-accent)]">{p.pelicula}</p>}
                                            {p.notas && <p className="mt-2 text-sm leading-relaxed text-[var(--cin-dim)]">{p.notas}</p>}
                                        </>
                                    )} />
                            )}
                            {pestana === 'escenas' && (
                                <Fichas<Escena> uid={uid} coleccion="escenas" items={escenas} setItems={setEscenas}
                                    vacio="Guarda aquí las escenas que quieras volver a estudiar."
                                    campos={[
                                        { k: 'titulo', label: 'Escena', requerido: true },
                                        { k: 'pelicula', label: 'Película' },
                                        { k: 'enlace', label: 'Enlace (YouTube, Apple TV…)' },
                                        { k: 'notas', label: 'Por qué la guardas', largo: true },
                                    ]}
                                    render={(e) => (
                                        <>
                                            <h3 className="cin-display text-lg text-[var(--cin-ink)]">{e.titulo}</h3>
                                            {e.pelicula && <p className="text-sm text-[var(--cin-accent)]">{e.pelicula}</p>}
                                            {e.notas && <p className="mt-2 text-sm leading-relaxed text-[var(--cin-dim)]">{e.notas}</p>}
                                            {e.enlace && (
                                                <a href={e.enlace} target="_blank" rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--cin-accent)] hover:text-[var(--cin-accent-dark)]">
                                                    <Play className="h-3.5 w-3.5" /> Ver escena
                                                </a>
                                            )}
                                        </>
                                    )} />
                            )}
                            {pestana === 'guiones' && (
                                <Fichas<Guion> uid={uid} coleccion="guiones" items={guiones} setItems={setGuiones}
                                    vacio="Ningún guion guardado todavía."
                                    campos={[
                                        { k: 'titulo', label: 'Título', requerido: true },
                                        { k: 'autor', label: 'Autor' },
                                        { k: 'enlace', label: 'Enlace al PDF o web' },
                                        { k: 'texto', label: 'Fragmento o notas', largo: true },
                                    ]}
                                    render={(g) => (
                                        <>
                                            <h3 className="cin-display text-lg text-[var(--cin-ink)]">{g.titulo}</h3>
                                            {g.autor && <p className="text-sm text-[var(--cin-accent)]">{g.autor}</p>}
                                            {g.texto && <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-[var(--cin-dim)]">{g.texto}</p>}
                                            {g.enlace && (
                                                <a href={g.enlace} target="_blank" rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--cin-accent)] hover:text-[var(--cin-accent-dark)]">
                                                    <ExternalLink className="h-3.5 w-3.5" /> Abrir guion
                                                </a>
                                            )}
                                        </>
                                    )} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                {total === 0 && !cargando && (
                    <p className="mt-10 text-sm text-[var(--cin-dim)]">Empieza por buscar una película que te haya marcado.</p>
                )}
            </div>

            <AnimatePresence>
                {ficha && <FichaPelicula pelicula={ficha} onClose={() => setFicha(null)} />}
            </AnimatePresence>
        </main>
    );
}

/* ---------------- Películas: buscador + rejilla de pósters ---------------- */

function Peliculas({ uid, items, setItems, abrirFicha }: {
    uid: string | null; items: Pelicula[];
    setItems: React.Dispatch<React.SetStateAction<Pelicula[]>>;
    abrirFicha: (p: Pelicula) => void;
}) {
    const [q, setQ] = useState('');
    const [resultados, setResultados] = useState<Pelicula[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manual, setManual] = useState(false);
    const [nueva, setNueva] = useState<Record<string, string>>({});

    const guardados = useMemo(() => new Set(items.map(i => i.id)), [items]);

    const buscar = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!q.trim()) return;
        setBuscando(true); setError(null);
        try {
            setResultados(await buscarPeliculas(q));
        } catch (err: any) {
            setError(err instanceof SinClaveError
                ? 'La búsqueda automática necesita una clave de TMDB (gratuita). Mientras tanto puedes añadir películas a mano.'
                : 'No se pudo buscar ahora mismo. Inténtalo de nuevo.');
            setManual(true);
            console.warn('[estudios] búsqueda:', err);
        } finally {
            setBuscando(false);
        }
    }, [q]);

    const anadir = async (p: Pelicula) => {
        if (guardados.has(p.id)) return;
        const nuevos = [{ ...p, creado: Date.now() }, ...items];
        setItems(nuevos);
        await guardar(uid, 'favoritas', nuevos);
    };
    const quitar = async (id: string) => {
        const nuevos = items.filter(i => i.id !== id);
        setItems(nuevos);
        await guardar(uid, 'favoritas', nuevos);
    };

    return (
        <div>
            <form onSubmit={buscar} className="mb-6 flex gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cin-dim)]" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca una película…"
                        aria-label="Buscar película"
                        className="w-full rounded-full border border-[var(--cin-line)] bg-[var(--cin-card)] py-3 pl-10 pr-4 text-sm text-[var(--cin-body)] placeholder:text-[var(--cin-dim)] focus:border-[var(--cin-accent)] focus:outline-none" />
                </div>
                <button type="submit" disabled={buscando}
                    className="rounded-full bg-[var(--cin-accent)] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cin-on-accent)] transition hover:bg-[var(--cin-accent-dark)] disabled:opacity-50">
                    {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </button>
            </form>

            {error && <p className="mb-4 rounded-lg border border-[var(--cin-accent)] bg-[var(--cin-accent-soft)] px-4 py-3 text-sm text-[var(--cin-body)]">{error}</p>}

            <button type="button" onClick={() => setManual(v => !v)}
                className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)] hover:text-[var(--cin-accent)]">
                <Plus className="h-3.5 w-3.5" /> {manual ? 'Ocultar alta manual' : 'Añadir película a mano'}
            </button>

            <AnimatePresence>
                {manual && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!nueva.titulo?.trim()) return;
                            const p: Pelicula = {
                                id: nuevoId(), titulo: nueva.titulo.trim(), anio: nueva.anio || undefined,
                                genero: nueva.genero || undefined, sinopsis: nueva.sinopsis || undefined,
                                poster: nueva.poster || undefined, trailer: nueva.trailer || undefined,
                                verOnline: nueva.verOnline || undefined, creado: Date.now(),
                            };
                            const nuevos = [p, ...items];
                            setItems(nuevos); setNueva({}); setManual(false);
                            await guardar(uid, 'favoritas', nuevos);
                        }}
                        className="mb-8 overflow-hidden rounded-xl border border-[var(--cin-line)] bg-[var(--cin-card)] p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[['titulo', 'Título *'], ['anio', 'Año'], ['genero', 'Género'], ['poster', 'URL del póster'],
                              ['trailer', 'Enlace del tráiler'], ['verOnline', 'Dónde verla']].map(([k, label]) => (
                                <label key={k}>
                                    <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)]">{label}</span>
                                    <input value={nueva[k] ?? ''} onChange={e => setNueva({ ...nueva, [k]: e.target.value })}
                                        className="w-full rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] px-3 py-2 text-sm text-[var(--cin-body)] focus:border-[var(--cin-accent)] focus:outline-none" />
                                </label>
                            ))}
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)]">Sinopsis o por qué te importa</span>
                                <textarea rows={3} value={nueva.sinopsis ?? ''} onChange={e => setNueva({ ...nueva, sinopsis: e.target.value })}
                                    className="w-full rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] px-3 py-2 text-sm text-[var(--cin-body)] focus:border-[var(--cin-accent)] focus:outline-none" />
                            </label>
                        </div>
                        <button type="submit" className="mt-4 rounded-full bg-[var(--cin-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cin-on-accent)] hover:bg-[var(--cin-accent-dark)]">Guardar película</button>
                    </motion.form>
                )}
            </AnimatePresence>

            {resultados.length > 0 && (
                <section className="mb-10">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-[var(--cin-dim)]">Resultados</h2>
                        <button type="button" onClick={() => setResultados([])} className="text-xs text-[var(--cin-dim)] hover:text-[var(--cin-ink)]">Cerrar</button>
                    </div>
                    <Rejilla>
                        {resultados.map(p => (
                            <Poster key={p.id} p={p} onClick={() => abrirFicha(p)}
                                accion={guardados.has(p.id)
                                    ? <span className="text-[0.65rem] uppercase tracking-wider text-[var(--cin-accent)]">Guardada</span>
                                    : <button type="button" onClick={(e) => { e.stopPropagation(); anadir(p); }}
                                        className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-[var(--cin-accent)] hover:text-[var(--cin-accent-dark)]">
                                        <Plus className="h-3 w-3" /> Guardar
                                      </button>} />
                        ))}
                    </Rejilla>
                </section>
            )}

            <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--cin-dim)]">Tus películas</h2>
            {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--cin-line)] px-6 py-12 text-center text-sm text-[var(--cin-dim)]">
                    Todavía no has guardado ninguna. Búscala arriba y dale a «Guardar».
                </p>
            ) : (
                <Rejilla>
                    {items.map(p => (
                        <Poster key={p.id} p={p} onClick={() => abrirFicha(p)}
                            accion={<button type="button" onClick={(e) => { e.stopPropagation(); quitar(p.id); }}
                                className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-[var(--cin-dim)] hover:text-[var(--cin-sello)]">
                                <Trash2 className="h-3 w-3" /> Quitar
                            </button>} />
                    ))}
                </Rejilla>
            )}
        </div>
    );
}

function Rejilla({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{children}</div>;
}

function Poster({ p, onClick, accion }: { p: Pelicula; onClick: () => void; accion: React.ReactNode }) {
    return (
        <div className="group overflow-hidden rounded-xl border border-[var(--cin-line)] bg-[var(--cin-card)] transition hover:border-[var(--cin-accent)]">
            <button type="button" onClick={onClick} className="block w-full text-left" aria-label={`Ficha de ${p.titulo}`}>
                <div className="aspect-[2/3] w-full overflow-hidden bg-[var(--cin-input)]">
                    {p.poster
                        ? <img src={p.poster} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        : <div className="flex h-full items-center justify-center text-[var(--cin-line)]"><Clapperboard className="h-8 w-8" /></div>}
                </div>
                <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-medium text-[var(--cin-body)]">{p.titulo}</h3>
                    <p className="mt-0.5 text-xs text-[var(--cin-dim)]">{[p.anio, p.genero].filter(Boolean).join(' · ')}</p>
                </div>
            </button>
            <div className="px-3 pb-3">{accion}</div>
        </div>
    );
}

/* ---------------- Ficha con sinopsis, tráiler y dónde verla ---------------- */

function FichaPelicula({ pelicula, onClose }: { pelicula: Pelicula; onClose: () => void }) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        addEventListener('keydown', esc);
        return () => removeEventListener('keydown', esc);
    }, [onClose]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} role="dialog" aria-modal="true" aria-label={pelicula.titulo}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,18,15,.55)] p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border border-[var(--cin-line)] bg-[var(--cin-card)] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="cin-display text-2xl text-[var(--cin-ink)] sm:text-3xl">{pelicula.titulo}</h2>
                        <p className="mt-1 text-sm text-[var(--cin-accent)]">{[pelicula.anio, pelicula.genero].filter(Boolean).join(' · ')}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[var(--cin-dim)] hover:bg-[var(--cin-accent-soft)] hover:text-[var(--cin-ink)]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
                    {pelicula.poster && <img src={pelicula.poster} alt="" className="w-full rounded-xl" />}
                    <div>
                        {pelicula.sinopsis
                            ? <p className="text-sm leading-relaxed text-[var(--cin-body)]">{pelicula.sinopsis}</p>
                            : <p className="text-sm text-[var(--cin-dim)]">Sin sinopsis disponible.</p>}
                        <div className="mt-5 flex flex-wrap gap-3">
                            {pelicula.trailer && (
                                <a href={pelicula.trailer} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-[var(--cin-accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cin-on-accent)] hover:bg-[var(--cin-accent-dark)]">
                                    <Play className="h-3.5 w-3.5" /> Ver tráiler
                                </a>
                            )}
                            {pelicula.verOnline && (
                                <a href={pelicula.verOnline} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-[var(--cin-line)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cin-body)] hover:border-[var(--cin-accent)] hover:text-[var(--cin-accent-dark)]">
                                    <ExternalLink className="h-3.5 w-3.5" /> Verla online
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ---------------- Fichas genéricas: personajes, escenas y guiones ---------------- */

interface Campo { k: string; label: string; requerido?: boolean; largo?: boolean }

function Fichas<T extends { id: string; creado: number }>({ uid, coleccion, items, setItems, campos, render, vacio }: {
    uid: string | null; coleccion: Coleccion; items: T[];
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    campos: Campo[]; render: (item: T) => React.ReactNode; vacio: string;
}) {
    const [abierto, setAbierto] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({});

    const anadir = async (e: React.FormEvent) => {
        e.preventDefault();
        const req = campos.find(c => c.requerido);
        if (req && !form[req.k]?.trim()) return;
        const item = { ...form, id: nuevoId(), creado: Date.now() } as unknown as T;
        const nuevos = [item, ...items];
        setItems(nuevos); setForm({}); setAbierto(false);
        await guardar(uid, coleccion, nuevos as any);
    };
    const quitar = async (id: string) => {
        const nuevos = items.filter(i => i.id !== id);
        setItems(nuevos);
        await guardar(uid, coleccion, nuevos as any);
    };

    return (
        <div>
            <button type="button" onClick={() => setAbierto(v => !v)}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cin-accent)] bg-[var(--cin-accent-soft)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cin-accent)] hover:bg-[var(--cin-accent-soft2)]">
                <Plus className="h-3.5 w-3.5" /> Añadir
            </button>

            <AnimatePresence>
                {abierto && (
                    <motion.form onSubmit={anadir} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden rounded-xl border border-[var(--cin-line)] bg-[var(--cin-card)] p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {campos.map(c => (
                                <label key={c.k} className={c.largo ? 'sm:col-span-2' : ''}>
                                    <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)]">
                                        {c.label}{c.requerido && <span className="text-[var(--cin-accent)]"> *</span>}
                                    </span>
                                    {c.largo ? (
                                        <textarea rows={3} value={form[c.k] ?? ''} onChange={e => setForm({ ...form, [c.k]: e.target.value })}
                                            className="w-full rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] px-3 py-2 text-sm text-[var(--cin-body)] focus:border-[var(--cin-accent)] focus:outline-none" />
                                    ) : (
                                        <input value={form[c.k] ?? ''} onChange={e => setForm({ ...form, [c.k]: e.target.value })}
                                            className="w-full rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] px-3 py-2 text-sm text-[var(--cin-body)] focus:border-[var(--cin-accent)] focus:outline-none" />
                                    )}
                                </label>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button type="submit" className="rounded-full bg-[var(--cin-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cin-on-accent)] hover:bg-[var(--cin-accent-dark)]">Guardar</button>
                            <button type="button" onClick={() => setAbierto(false)} className="rounded-full border border-[var(--cin-line)] px-5 py-2 text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)] hover:text-[var(--cin-ink)]">Cancelar</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--cin-line)] px-6 py-12 text-center text-sm text-[var(--cin-dim)]">{vacio}</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(item => (
                        <article key={item.id} className="relative rounded-xl border border-[var(--cin-line)] bg-[var(--cin-card)] p-4 transition hover:border-[var(--cin-ink)]">
                            {render(item)}
                            <button type="button" onClick={() => quitar(item.id)} aria-label="Quitar"
                                className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--cin-dim)] opacity-0 transition hover:bg-[var(--cin-accent-soft)] hover:text-[var(--cin-sello)] focus:opacity-100 group-hover:opacity-100 sm:opacity-100">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
