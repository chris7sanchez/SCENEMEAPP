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
    listar, guardar, nuevoId, buscarPeliculas,
    type Coleccion, type Pelicula, type Personaje, type Escena, type Guion,
} from '@/lib/estudios-db';

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
            const [f, p, e, g] = await Promise.all([
                listar<Pelicula>(uid, 'favoritas'),
                listar<Personaje>(uid, 'moodboard'),
                listar<Escena>(uid, 'escenas'),
                listar<Guion>(uid, 'guiones'),
            ]);
            if (cancelado) return;
            setFavoritas(f); setPersonajes(p); setEscenas(e); setGuiones(g);
            setCargando(false);
        })();
        return () => { cancelado = true; };
    }, [uid]);

    const total = favoritas.length + personajes.length + escenas.length + guiones.length;

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/backlot" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 transition hover:text-amber-300">
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver al backlot
                </Link>

                <header className="mb-8">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-amber-400">Stage 5 · Edad de oro</p>
                    <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Mis Estudios</h1>
                    <p className="mt-3 max-w-2xl text-neutral-400">
                        Tu archivo de trabajo: las películas que te forman, los personajes que te
                        inspiran, las escenas que quieres volver a ver y los guiones que guardas.
                    </p>
                    {!uid && !cargando && (
                        <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
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
                                    activa ? 'border-amber-400/70 bg-amber-400/15 text-amber-200' : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/25 hover:text-neutral-200'}`}>
                                <Icono className="h-3.5 w-3.5" /> {label}
                                {n > 0 && <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[0.65rem] tabular-nums">{n}</span>}
                            </button>
                        );
                    })}
                </nav>

                {cargando ? (
                    <div className="flex items-center gap-3 py-24 text-neutral-500">
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
                                            <h3 className="font-serif text-lg text-white">{p.nombre}</h3>
                                            {p.pelicula && <p className="text-sm text-amber-300/80">{p.pelicula}</p>}
                                            {p.notas && <p className="mt-2 text-sm leading-relaxed text-neutral-400">{p.notas}</p>}
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
                                            <h3 className="font-serif text-lg text-white">{e.titulo}</h3>
                                            {e.pelicula && <p className="text-sm text-amber-300/80">{e.pelicula}</p>}
                                            {e.notas && <p className="mt-2 text-sm leading-relaxed text-neutral-400">{e.notas}</p>}
                                            {e.enlace && (
                                                <a href={e.enlace} target="_blank" rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-amber-300 hover:text-amber-200">
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
                                            <h3 className="font-serif text-lg text-white">{g.titulo}</h3>
                                            {g.autor && <p className="text-sm text-amber-300/80">{g.autor}</p>}
                                            {g.texto && <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-neutral-400">{g.texto}</p>}
                                            {g.enlace && (
                                                <a href={g.enlace} target="_blank" rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-amber-300 hover:text-amber-200">
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
                    <p className="mt-10 text-sm text-neutral-600">Empieza por buscar una película que te haya marcado.</p>
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

    const guardados = useMemo(() => new Set(items.map(i => i.id)), [items]);

    const buscar = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!q.trim()) return;
        setBuscando(true); setError(null);
        try {
            setResultados(await buscarPeliculas(q));
        } catch (err: any) {
            setError('No se pudo buscar ahora mismo. Inténtalo de nuevo.');
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
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca una película…"
                        aria-label="Buscar película"
                        className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400/60 focus:outline-none" />
                </div>
                <button type="submit" disabled={buscando}
                    className="rounded-full bg-amber-400 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-amber-300 disabled:opacity-50">
                    {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </button>
            </form>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            {resultados.length > 0 && (
                <section className="mb-10">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500">Resultados</h2>
                        <button type="button" onClick={() => setResultados([])} className="text-xs text-neutral-500 hover:text-neutral-300">Cerrar</button>
                    </div>
                    <Rejilla>
                        {resultados.map(p => (
                            <Poster key={p.id} p={p} onClick={() => abrirFicha(p)}
                                accion={guardados.has(p.id)
                                    ? <span className="text-[0.65rem] uppercase tracking-wider text-emerald-400">Guardada</span>
                                    : <button type="button" onClick={(e) => { e.stopPropagation(); anadir(p); }}
                                        className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-amber-300 hover:text-amber-200">
                                        <Plus className="h-3 w-3" /> Guardar
                                      </button>} />
                        ))}
                    </Rejilla>
                </section>
            )}

            <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">Tus películas</h2>
            {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-neutral-500">
                    Todavía no has guardado ninguna. Búscala arriba y dale a «Guardar».
                </p>
            ) : (
                <Rejilla>
                    {items.map(p => (
                        <Poster key={p.id} p={p} onClick={() => abrirFicha(p)}
                            accion={<button type="button" onClick={(e) => { e.stopPropagation(); quitar(p.id); }}
                                className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-neutral-500 hover:text-red-400">
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
        <div className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-amber-400/40">
            <button type="button" onClick={onClick} className="block w-full text-left" aria-label={`Ficha de ${p.titulo}`}>
                <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                    {p.poster
                        ? <img src={p.poster} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        : <div className="flex h-full items-center justify-center text-neutral-700"><Clapperboard className="h-8 w-8" /></div>}
                </div>
                <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-medium text-neutral-100">{p.titulo}</h3>
                    <p className="mt-0.5 text-xs text-neutral-500">{[p.anio, p.genero].filter(Boolean).join(' · ')}</p>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border border-white/10 bg-neutral-950 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-2xl text-white sm:text-3xl">{pelicula.titulo}</h2>
                        <p className="mt-1 text-sm text-amber-300/80">{[pelicula.anio, pelicula.genero].filter(Boolean).join(' · ')}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-neutral-500 hover:bg-white/10 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
                    {pelicula.poster && <img src={pelicula.poster} alt="" className="w-full rounded-xl" />}
                    <div>
                        {pelicula.sinopsis
                            ? <p className="text-sm leading-relaxed text-neutral-300">{pelicula.sinopsis}</p>
                            : <p className="text-sm text-neutral-500">Sin sinopsis disponible.</p>}
                        <div className="mt-5 flex flex-wrap gap-3">
                            {pelicula.trailer && (
                                <a href={pelicula.trailer} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 hover:bg-amber-300">
                                    <Play className="h-3.5 w-3.5" /> Ver tráiler
                                </a>
                            )}
                            {pelicula.verOnline && (
                                <a href={pelicula.verOnline} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-200 hover:border-amber-400 hover:text-amber-200">
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
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-400/20">
                <Plus className="h-3.5 w-3.5" /> Añadir
            </button>

            <AnimatePresence>
                {abierto && (
                    <motion.form onSubmit={anadir} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {campos.map(c => (
                                <label key={c.k} className={c.largo ? 'sm:col-span-2' : ''}>
                                    <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-neutral-400">
                                        {c.label}{c.requerido && <span className="text-amber-400"> *</span>}
                                    </span>
                                    {c.largo ? (
                                        <textarea rows={3} value={form[c.k] ?? ''} onChange={e => setForm({ ...form, [c.k]: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400/60 focus:outline-none" />
                                    ) : (
                                        <input value={form[c.k] ?? ''} onChange={e => setForm({ ...form, [c.k]: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400/60 focus:outline-none" />
                                    )}
                                </label>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button type="submit" className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 hover:bg-amber-300">Guardar</button>
                            <button type="button" onClick={() => setAbierto(false)} className="rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.16em] text-neutral-400 hover:text-neutral-200">Cancelar</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-neutral-500">{vacio}</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(item => (
                        <article key={item.id} className="relative rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
                            {render(item)}
                            <button type="button" onClick={() => quitar(item.id)} aria-label="Quitar"
                                className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-600 opacity-0 transition hover:bg-white/10 hover:text-red-400 focus:opacity-100 group-hover:opacity-100 sm:opacity-100">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
