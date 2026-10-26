'use client';

// FOTOGRAMAS — biblioteca de planos de cine para buscar referencias, guardarlas
// en decks y compartirlas. Gratis: búsqueda por título/género y 1 deck de 12
// planos. Pro: todos los filtros, decks ilimitados, compartir y descarga original.

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2, Lock, Plus, Trash2, Share2, Download, X, Check, Crown } from 'lucide-react';
import {
    GENEROS, IDIOMAS, LIMITES, urlImagen, motivoParaNoAnadir, puedeCrearDeck,
    type Filtros, type Plan, type Plano, type Deck,
} from '@/lib/fotogramas';
import { listarDecks, guardarDecks, leerPlan, conSesion } from '@/lib/fotogramas-db';

interface Resultado { id: string; titulo: string; anio?: string; poster: string | null; fondo: string | null }
interface Sugerencia { id: number; nombre: string; detalle?: string }

const ORDENES: { v: NonNullable<Filtros['orden']>; t: string }[] = [
    { v: 'populares', t: 'Más populares' }, { v: 'recientes', t: 'Más recientes' }, { v: 'mejor_valoradas', t: 'Mejor valoradas' },
];

const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const deckNuevo = (nombre: string): Deck => ({ id: nuevoId(), nombre, planos: [], creado: Date.now() });

const entrada = 'rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-amber-400 focus:outline-none';

export default function FotogramasPage() {
    const [uid, setUid] = useState<string | null>(null);
    const [plan, setPlan] = useState<Plan>('gratis');
    const [cobroListo, setCobroListo] = useState(false);
    const [f, setF] = useState<Filtros>({});
    const [persona, setPersona] = useState('');
    const [palabra, setPalabra] = useState('');
    const [sugs, setSugs] = useState<{ tipo: 'persona' | 'palabra'; items: Sugerencia[] } | null>(null);
    const [resultados, setResultados] = useState<Resultado[]>([]);
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [buscando, setBuscando] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);
    const [pelicula, setPelicula] = useState<Resultado | null>(null);
    const [planos, setPlanos] = useState<{ ruta: string; ancho?: number; alto?: number }[] | null>(null);
    const [grande, setGrande] = useState<Plano | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [activo, setActivo] = useState<string | null>(null);

    const esPro = plan === 'pro';
    const deckActivo = decks.find(d => d.id === activo) ?? null;

    // Sesión + plan + decks
    useEffect(() => {
        (async () => {
            try {
                const { auth } = await import('@/lib/auth');
                setUid((await auth.getCurrentUser())?.uid ?? null);
            } catch { setUid(null); }
        })();
    }, []);
    useEffect(() => {
        leerPlan().then(p => { setPlan(p.plan); setCobroListo(p.cobroListo); });
        let vivo = true;
        listarDecks(uid).then(d => { if (vivo) { setDecks(d); setActivo(a => a ?? d[0]?.id ?? null); } });
        return () => { vivo = false; };
    }, [uid]);

    const persistir = useCallback((nuevos: Deck[]) => { setDecks(nuevos); guardarDecks(uid, nuevos); }, [uid]);

    const buscar = useCallback(async (filtros: Filtros, pag = 1) => {
        setBuscando(true); setAviso(null);
        const p = new URLSearchParams();
        Object.entries(filtros).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
        p.set('pagina', String(pag));
        try {
            const res = await fetch(`/api/fotogramas?${p}`, await conSesion());
            if (res.status === 402) { setAviso('Esos filtros son del plan Pro.'); setResultados([]); return; }
            if (res.status === 503) { setAviso('El buscador necesita la clave de TMDB en el servidor (variable TMDB_KEY).'); return; }
            if (!res.ok) throw new Error(String(res.status));
            const d = await res.json();
            setResultados(d.resultados); setPagina(d.pagina); setPaginas(d.paginas);
            if (d.resultados.length === 0) setAviso('Sin resultados con esos filtros.');
        } catch { setAviso('No se pudo buscar ahora mismo. Inténtalo de nuevo.'); }
        finally { setBuscando(false); }
    }, []);

    // Al entrar, un escaparate: lo más popular.
    useEffect(() => { const t = setTimeout(() => buscar({}), 0); return () => clearTimeout(t); }, [buscar]);

    const sugerir = async (tipo: 'persona' | 'palabra', texto: string) => {
        tipo === 'persona' ? setPersona(texto) : setPalabra(texto);
        if (texto.trim().length < 3 || !esPro) { setSugs(null); return; }
        try {
            const res = await fetch(`/api/fotogramas?sugerir=${encodeURIComponent(texto)}&tipo=${tipo}`, await conSesion());
            if (res.ok) setSugs({ tipo, items: (await res.json()).sugerencias });
        } catch { /* sin sugerencias */ }
    };

    const abrirPelicula = async (r: Resultado) => {
        setPelicula(r); setPlanos(null);
        try {
            const res = await fetch(`/api/fotogramas?pelicula=${r.id}`);
            setPlanos(res.ok ? (await res.json()).planos : []);
        } catch { setPlanos([]); }
    };

    const planoDe = (r: Resultado, ruta: string, ancho?: number, alto?: number): Plano =>
        ({ ruta, peliculaId: r.id, titulo: r.titulo, anio: r.anio, ancho, alto });

    const anadir = (pl: Plano) => {
        let d = deckActivo;
        let lista = decks;
        if (!d) {
            if (!puedeCrearDeck(plan, decks.length)) { setAviso('El plan gratis incluye 1 deck. Hazte Pro para crear más.'); return; }
            d = deckNuevo('Mi primer deck');
            lista = [...decks, d]; setActivo(d.id);
        }
        const motivo = motivoParaNoAnadir(plan, d, pl);
        if (motivo === 'duplicado') { setAviso('Ese plano ya está en el deck.'); return; }
        if (motivo === 'limite_planos') { setAviso(`El plan gratis admite ${LIMITES.gratis.planosPorDeck} planos por deck. Con Pro no hay tope.`); return; }
        persistir(lista.map(x => x.id === d!.id ? { ...x, planos: [...x.planos, pl] } : x));
        setAviso(null);
    };

    const quitar = (pl: Plano) => deckActivo &&
        persistir(decks.map(x => x.id === deckActivo.id ? { ...x, planos: x.planos.filter(p => !(p.ruta === pl.ruta && p.peliculaId === pl.peliculaId)) } : x));

    const nuevoDeck = () => {
        if (!puedeCrearDeck(plan, decks.length)) { setAviso('El plan gratis incluye 1 deck. Hazte Pro para crear más.'); return; }
        const nombre = window.prompt('Nombre del deck');
        if (!nombre?.trim()) return;
        const d = deckNuevo(nombre.trim().slice(0, 80));
        persistir([...decks, d]); setActivo(d.id);
    };

    const borrarDeck = () => {
        if (!deckActivo || !window.confirm(`¿Borrar el deck «${deckActivo.nombre}»?`)) return;
        const resto = decks.filter(d => d.id !== deckActivo.id);
        persistir(resto); setActivo(resto[0]?.id ?? null);
    };

    const compartir = async () => {
        if (!deckActivo) return;
        if (!esPro) { setAviso('Compartir decks es del plan Pro.'); return; }
        try {
            const res = await fetch('/api/fotogramas/deck', await conSesion({
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deckActivo.compartido, nombre: deckActivo.nombre, planos: deckActivo.planos }),
            }));
            if (!res.ok) throw new Error(String(res.status));
            const { id } = await res.json();
            persistir(decks.map(d => d.id === deckActivo.id ? { ...d, compartido: id } : d));
            const url = `${location.origin}/fotogramas/d/${id}`;
            try { await navigator.clipboard.writeText(url); setAviso('Enlace copiado: ' + url); } catch { setAviso('Enlace: ' + url); }
        } catch { setAviso('No se pudo crear el enlace. Inténtalo de nuevo.'); }
    };

    const hacerPro = async (portal = false) => {
        try {
            const res = await fetch(`/api/fotogramas/checkout${portal ? '?portal=1' : ''}`, await conSesion({ method: 'POST' }));
            if (res.status === 401) { setAviso('Inicia sesión para suscribirte.'); return; }
            if (res.status === 503) { setAviso('El cobro todavía no está activado.'); return; }
            const { url } = await res.json();
            if (url) location.href = url; else throw new Error('sin url');
        } catch { setAviso('No se pudo abrir el pago. Inténtalo de nuevo.'); }
    };

    const aplicar = (e: React.FormEvent) => { e.preventDefault(); setSugs(null); buscar(f, 1); };
    const ponerFiltro = (cambio: Partial<Filtros>) => setF(prev => ({ ...prev, ...cambio }));
    const bloqueado = !esPro;

    const enDeck = new Set(deckActivo?.planos.map(p => p.peliculaId + p.ruta));

    return (
        <main className="min-h-screen bg-[#100E0B] text-[#F6EFE0]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <Link href="/estudios" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D9CFBD] hover:text-amber-400">
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver a Mis Estudios
                </Link>

                <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-amber-400">Referencias de cine</p>
                        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Fotogramas</h1>
                        <p className="mt-2 max-w-xl text-[#D9CFBD]">Busca planos de miles de películas, guárdalos en decks y enséñaselos a tu director o a tu representante.</p>
                    </div>
                    {esPro ? (
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400"><Crown className="h-3.5 w-3.5" /> Pro</span>
                            <button type="button" onClick={() => hacerPro(true)} className="text-xs uppercase tracking-wider text-[#D9CFBD] underline hover:text-white">Gestionar suscripción</button>
                        </div>
                    ) : cobroListo ? (
                        <button type="button" onClick={() => hacerPro()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-400 px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#140F06] hover:bg-amber-300">
                            <Crown className="h-4 w-4" /> Hazte Pro
                        </button>
                    ) : null}
                </header>

                {aviso && (
                    <p role="status" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-amber-400 bg-amber-400/10 px-4 py-3 text-sm text-[#F6EFE0]">
                        <span className="break-all">{aviso}</span>
                        <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)} className="min-h-6 min-w-6"><X className="h-4 w-4" /></button>
                    </p>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <section>
                        <form onSubmit={aplicar} className="mb-6 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                                    <input value={f.q ?? ''} onChange={e => ponerFiltro({ q: e.target.value })} placeholder="Título de la película…"
                                        aria-label="Título" className={`${entrada} w-full py-3 pl-10`} />
                                </div>
                                <button type="submit" disabled={buscando} className="min-h-11 rounded-full bg-amber-400 px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#140F06] hover:bg-amber-300 disabled:opacity-60">
                                    {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <select aria-label="Género" value={f.genero ?? ''} onChange={e => ponerFiltro({ genero: e.target.value ? Number(e.target.value) : undefined })} className={entrada}>
                                    <option value="">Cualquier género</option>
                                    {Object.entries(GENEROS).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
                                </select>

                                <select aria-label="Idioma original" disabled={bloqueado} value={f.idioma ?? ''} onChange={e => ponerFiltro({ idioma: e.target.value || undefined })} className={`${entrada} disabled:opacity-60`}>
                                    <option value="">{bloqueado ? '🔒 Idioma (Pro)' : 'Cualquier idioma'}</option>
                                    {Object.entries(IDIOMAS).map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                                </select>

                                <select aria-label="Ordenar por" disabled={bloqueado} value={f.orden ?? 'populares'} onChange={e => ponerFiltro({ orden: e.target.value as Filtros['orden'] })} className={`${entrada} disabled:opacity-60`}>
                                    {ORDENES.map(o => <option key={o.v} value={o.v}>{bloqueado && o.v !== 'populares' ? '🔒 ' : ''}{o.t}</option>)}
                                </select>

                                <input type="number" aria-label="Desde el año" placeholder={bloqueado ? '🔒 Desde año (Pro)' : 'Desde año'} disabled={bloqueado}
                                    min={1888} max={2100} value={f.desde ?? ''} onChange={e => ponerFiltro({ desde: e.target.value ? Number(e.target.value) : undefined })} className={`${entrada} disabled:opacity-60`} />
                                <input type="number" aria-label="Hasta el año" placeholder={bloqueado ? '🔒 Hasta año (Pro)' : 'Hasta año'} disabled={bloqueado}
                                    min={1888} max={2100} value={f.hasta ?? ''} onChange={e => ponerFiltro({ hasta: e.target.value ? Number(e.target.value) : undefined })} className={`${entrada} disabled:opacity-60`} />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {(['persona', 'palabra'] as const).map(tipo => (
                                    <div key={tipo} className="relative">
                                        <input value={tipo === 'persona' ? persona : palabra} disabled={bloqueado}
                                            onChange={e => sugerir(tipo, e.target.value)}
                                            aria-label={tipo === 'persona' ? 'Director o actor' : 'Palabra clave'}
                                            placeholder={bloqueado ? (tipo === 'persona' ? '🔒 Director o actor (Pro)' : '🔒 Palabra clave: neo-noir… (Pro)')
                                                : (tipo === 'persona' ? 'Director o actor: Villeneuve…' : 'Palabra clave: neo-noir…')}
                                            className={`${entrada} w-full disabled:opacity-60`} />
                                        {sugs?.tipo === tipo && sugs.items.length > 0 && (
                                            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-white/15 bg-[#1A1713] shadow-xl">
                                                {sugs.items.map(s => (
                                                    <li key={s.id}>
                                                        <button type="button" className="block min-h-11 w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                                                            onClick={() => {
                                                                ponerFiltro(tipo === 'persona' ? { persona: s.id } : { palabra: s.id });
                                                                tipo === 'persona' ? setPersona(s.nombre) : setPalabra(s.nombre);
                                                                setSugs(null);
                                                            }}>
                                                            {s.nombre}{s.detalle ? <span className="text-white/70"> · {s.detalle}</span> : null}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                {bloqueado ? (
                                    <p className="flex items-center gap-1.5 text-xs text-[#D9CFBD]"><Lock className="h-3.5 w-3.5" /> Época, idioma, orden, director/actor y palabras clave son del plan Pro.</p>
                                ) : <span />}
                                <button type="button" onClick={() => { setF({}); setPersona(''); setPalabra(''); setSugs(null); buscar({}); }} className="text-xs uppercase tracking-wider text-[#D9CFBD] underline hover:text-white">Limpiar filtros</button>
                            </div>
                        </form>

                        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {resultados.map(r => (
                                <li key={r.id}>
                                    <button type="button" onClick={() => abrirPelicula(r)} className="group block w-full text-left">
                                        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                                            {r.poster && <img src={urlImagen(r.poster, 'w780')} alt={`Póster de ${r.titulo}`} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-white">{r.titulo}</p>
                                        <p className="text-xs text-[#D9CFBD]">{r.anio}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {paginas > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                                <button type="button" disabled={pagina <= 1 || buscando} onClick={() => buscar(f, pagina - 1)} className="min-h-11 rounded-full border border-white/20 px-4 disabled:opacity-50">Anterior</button>
                                <span className="text-[#D9CFBD]">{pagina} / {paginas}</span>
                                <button type="button" disabled={pagina >= paginas || buscando} onClick={() => buscar(f, pagina + 1)} className="min-h-11 rounded-full border border-white/20 px-4 disabled:opacity-50">Siguiente</button>
                            </div>
                        )}
                    </section>

                    <aside aria-label="Mis decks" className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Mis decks</h2>
                            <button type="button" onClick={nuevoDeck} className="inline-flex min-h-11 items-center gap-1 text-xs uppercase tracking-wider text-[#F6EFE0] hover:text-amber-400"><Plus className="h-3.5 w-3.5" /> Nuevo</button>
                        </div>

                        {decks.length > 0 && (
                            <select aria-label="Deck activo" value={activo ?? ''} onChange={e => setActivo(e.target.value)} className={`${entrada} mb-3 w-full`}>
                                {decks.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.planos.length})</option>)}
                            </select>
                        )}

                        {deckActivo ? (
                            <>
                                <p className="mb-2 text-xs text-[#D9CFBD]">
                                    {deckActivo.planos.length}{esPro ? '' : ` / ${LIMITES.gratis.planosPorDeck}`} planos
                                </p>
                                {deckActivo.planos.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-white/20 px-3 py-6 text-center text-sm text-[#D9CFBD]">Abre una película y pulsa «Añadir» en los planos que te sirvan.</p>
                                ) : (
                                    <ul className="grid grid-cols-3 gap-2">
                                        {deckActivo.planos.map(p => (
                                            <li key={p.peliculaId + p.ruta} className="group relative">
                                                <button type="button" onClick={() => setGrande(p)} aria-label={`Ver plano de ${p.titulo}`}>
                                                    <img src={urlImagen(p.ruta, 'w780')} alt={`Plano de ${p.titulo}`} loading="lazy" className="aspect-video w-full rounded object-cover" />
                                                </button>
                                                <button type="button" onClick={() => quitar(p)} aria-label="Quitar del deck" className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-700"><X className="h-3 w-3" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button type="button" onClick={compartir} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-amber-400 px-4 text-xs font-bold uppercase tracking-wider text-[#140F06] hover:bg-amber-300">
                                        {esPro ? <Share2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} {deckActivo.compartido ? 'Copiar enlace' : 'Compartir'}
                                    </button>
                                    <button type="button" onClick={borrarDeck} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 px-4 text-xs uppercase tracking-wider text-[#F6EFE0] hover:border-red-500"><Trash2 className="h-3.5 w-3.5" /> Borrar</button>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-[#D9CFBD]">Aún no tienes ningún deck. Crea uno o añade un plano y se crea solo.</p>
                        )}

                        {!esPro && (
                            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-[#D9CFBD]">
                                Plan gratis: 1 deck, 12 planos, sin compartir ni descarga original.
                                {!cobroListo && <> El plan Pro aún no está activado.</>}
                            </p>
                        )}
                    </aside>
                </div>

                <p className="mt-12 text-xs text-[#D9CFBD]">Datos e imágenes de <a className="underline" href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a>. Fotogramas no está afiliado a TMDB ni a ShotDeck.</p>
            </div>

            {pelicula && (
                <div role="dialog" aria-modal="true" aria-label={`Planos de ${pelicula.titulo}`} className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 sm:p-8">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold">{pelicula.titulo} <span className="text-base font-normal text-[#D9CFBD]">{pelicula.anio}</span></h2>
                            <button type="button" aria-label="Cerrar" onClick={() => setPelicula(null)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:border-amber-400"><X className="h-5 w-5" /></button>
                        </div>
                        {planos === null ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-400" /> :
                            planos.length === 0 ? <p className="text-[#D9CFBD]">TMDB no tiene planos de esta película.</p> : (
                            <ul className="grid gap-4 sm:grid-cols-2">
                                {planos.map(p => {
                                    const pl = planoDe(pelicula, p.ruta, p.ancho, p.alto);
                                    const dentro = enDeck.has(pl.peliculaId + pl.ruta);
                                    return (
                                        <li key={p.ruta} className="overflow-hidden rounded-lg bg-white/5">
                                            <button type="button" onClick={() => setGrande(pl)} aria-label="Ver plano grande" className="block w-full">
                                                <img src={urlImagen(p.ruta, 'w780')} alt={`Plano de ${pelicula.titulo}`} loading="lazy" className="aspect-video w-full object-cover" />
                                            </button>
                                            <div className="flex items-center justify-between px-3 py-2 text-xs text-[#D9CFBD]">
                                                <span>{p.ancho && p.alto ? `${p.ancho}×${p.alto}` : ''}</span>
                                                <button type="button" disabled={dentro} onClick={() => anadir(pl)} className="inline-flex min-h-11 items-center gap-1 font-bold uppercase tracking-wider text-amber-400 disabled:text-[#D9CFBD]">
                                                    {dentro ? <><Check className="h-3.5 w-3.5" /> En el deck</> : <><Plus className="h-3.5 w-3.5" /> Añadir</>}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {grande && (
                <div role="dialog" aria-modal="true" aria-label="Plano ampliado" className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 p-4">
                    <button type="button" aria-label="Cerrar" onClick={() => setGrande(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:border-amber-400"><X className="h-5 w-5" /></button>
                    <img src={urlImagen(grande.ruta, 'w1280')} alt={`Plano de ${grande.titulo}`} className="max-h-[80vh] max-w-full rounded" />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <p className="text-sm text-[#F6EFE0]">{grande.titulo} {grande.anio && `(${grande.anio})`}</p>
                        {esPro ? (
                            <a href={urlImagen(grande.ruta, 'original')} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-amber-400 px-4 text-xs font-bold uppercase tracking-wider text-[#140F06]"><Download className="h-3.5 w-3.5" /> Original</a>
                        ) : (
                            <span className="inline-flex min-h-11 items-center gap-1.5 text-xs text-[#D9CFBD]"><Lock className="h-3.5 w-3.5" /> Descarga original: Pro</span>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
