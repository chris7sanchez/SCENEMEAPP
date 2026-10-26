'use client';

// FOTOGRAMAS — referencias de cine para el actor.
//  1. Pides lo que buscas y la IA propone películas y escenas.
//  2. Ves el clip incrustado de YouTube o abres Google Imágenes con la búsqueda hecha.
//  3. Haces captura y la pegas (o arrastras, o subes) en tu deck privado.
//  4. Con Pro, la IA etiqueta cada captura: plano, ángulo, luz, color, emoción.
// La app no trae imágenes de nadie: ver la explicación en src/lib/fotogramas.ts.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Sparkles, Loader2, Lock, Plus, Trash2, Share2, X, Crown, Play,
    ImagePlus, Search, ExternalLink, Clipboard,
} from 'lucide-react';
import {
    LIMITES, motivoParaNoAnadir, puedeCrearDeck, coincide, urlGoogleImagenes, urlBusquedaYoutube, urlEmbedYoutube,
    type Plan, type Plano, type Deck, type Idea, type Etiquetas,
} from '@/lib/fotogramas';
import {
    listarDecks, guardarDecks, leerPlan, conSesion, comprimir, aDataUrl, subirCaptura, borrarCaptura, etiquetar,
} from '@/lib/fotogramas-db';

interface Video { id: string; titulo: string; canal: string; miniatura: string | null }
interface Captura { blob: Blob; vista: string; pelicula: string; anio: string; nota: string; fuente: string }

const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const deckNuevo = (nombre: string): Deck => ({ id: nuevoId(), nombre, planos: [], creado: Date.now() });

const entrada = 'rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-amber-400 focus:outline-none';
const botonOro = 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-amber-400 px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#140F06] hover:bg-amber-300 disabled:opacity-60';
const botonLinea = 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/25 px-4 text-xs font-semibold uppercase tracking-wider text-[#F6EFE0] hover:border-amber-400';

const ETIQUETAS: [keyof Etiquetas, string][] = [
    ['plano', 'Plano'], ['angulo', 'Ángulo'], ['luz', 'Luz'], ['color', 'Color'], ['emocion', 'Emoción'], ['composicion', 'Composición'],
];

export default function FotogramasPage() {
    const [uid, setUid] = useState<string | null>(null);
    const [sesionLista, setSesionLista] = useState(false);
    const [plan, setPlan] = useState<Plan>('gratis');
    const [cobroListo, setCobroListo] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);

    const [peticion, setPeticion] = useState('');
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [pensando, setPensando] = useState(false);
    const [clips, setClips] = useState<Record<string, Video[] | 'sin_clave' | 'cargando'>>({});
    const [video, setVideo] = useState<string | null>(null);

    const [captura, setCaptura] = useState<Captura | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);
    const archivoRef = useRef<HTMLInputElement>(null);

    const [decks, setDecks] = useState<Deck[]>([]);
    const [activo, setActivo] = useState<string | null>(null);
    const [filtro, setFiltro] = useState('');
    const [grande, setGrande] = useState<Plano | null>(null);

    const esPro = plan === 'pro';
    const deckActivo = decks.find(d => d.id === activo) ?? null;

    useEffect(() => {
        (async () => {
            try {
                const { auth } = await import('@/lib/auth');
                setUid((await auth.getCurrentUser())?.uid ?? null);
            } catch { setUid(null); }
            setSesionLista(true);
        })();
    }, []);
    useEffect(() => {
        leerPlan().then(p => { setPlan(p.plan); setCobroListo(p.cobroListo); });
        let vivo = true;
        listarDecks(uid).then(d => {
            if (!vivo) return;
            // Los decks de la primera versión (con planos de TMDB) no tienen imagen propia: fuera.
            const limpios = d.map(x => ({ ...x, planos: (x.planos ?? []).filter(p => p.imagen) }));
            setDecks(limpios); setActivo(a => a ?? limpios[0]?.id ?? null);
        });
        return () => { vivo = false; };
    }, [uid]);

    const persistir = useCallback((nuevos: Deck[]) => { setDecks(nuevos); guardarDecks(uid, nuevos); }, [uid]);

    // ---------- 1. Ideas de la IA ----------
    const pedirIdeas = async (e: React.FormEvent) => {
        e.preventDefault();
        if (peticion.trim().length < 3) return;
        if (!uid) { setAviso('Inicia sesión para pedir ideas a la IA.'); return; }
        setPensando(true); setAviso(null);
        try {
            const res = await fetch('/api/fotogramas/ideas', await conSesion({
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ peticion }),
            }));
            const d = await res.json();
            if (!res.ok) throw new Error(d?.message || 'No se pudo');
            setIdeas(d.ideas);
            if (d.ideas.length === 0) setAviso('La IA no ha encontrado escenas para eso. Prueba a describirlo de otra forma.');
        } catch (err: any) {
            setAviso(err?.message && err.message !== 'No se pudo' ? err.message : 'La IA no ha respondido. Inténtalo de nuevo.');
        } finally { setPensando(false); }
    };

    const verClips = async (busqueda: string) => {
        if (clips[busqueda]) return;
        setClips(c => ({ ...c, [busqueda]: 'cargando' }));
        try {
            const d = await (await fetch(`/api/fotogramas/youtube?q=${encodeURIComponent(busqueda)}`)).json();
            setClips(c => ({ ...c, [busqueda]: d.sinClave ? 'sin_clave' : d.videos }));
        } catch { setClips(c => ({ ...c, [busqueda]: 'sin_clave' })); }
    };

    // ---------- 2. Captura: pegar, arrastrar o subir ----------
    const recibir = useCallback((archivo: Blob | null | undefined, datos?: Partial<Captura>) => {
        if (!archivo || !archivo.type.startsWith('image/')) return;
        setCaptura(prev => {
            if (prev) URL.revokeObjectURL(prev.vista);
            return { blob: archivo, vista: URL.createObjectURL(archivo), pelicula: prev?.pelicula ?? '', anio: prev?.anio ?? '', nota: '', fuente: '', ...datos };
        });
    }, []);

    useEffect(() => {
        const alPegar = (e: ClipboardEvent) => {
            const item = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'));
            if (item) { e.preventDefault(); recibir(item.getAsFile()); }
        };
        window.addEventListener('paste', alPegar);
        return () => window.removeEventListener('paste', alPegar);
    }, [recibir]);

    const pegarDelPortapapeles = async () => {
        try {
            for (const item of await navigator.clipboard.read()) {
                const tipo = item.types.find(t => t.startsWith('image/'));
                if (tipo) { recibir(await item.getType(tipo)); return; }
            }
            setAviso('No hay ninguna imagen copiada. Haz una captura de pantalla primero.');
        } catch { setAviso('Tu navegador no deja leer el portapapeles desde aquí. Pulsa Ctrl+V (o Cmd+V) o sube el archivo.'); }
    };

    const prepararDesdeIdea = (i: Idea) => {
        setCaptura(prev => prev ? { ...prev, pelicula: i.titulo, anio: i.anio ?? '' } : prev);
        setAviso(`Haz la captura de «${i.titulo}» y pégala aquí con Ctrl+V (o Cmd+V), o súbela.`);
        document.getElementById('zona-captura')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const guardarCaptura = async () => {
        if (!captura) return;
        if (!uid) { setAviso('Inicia sesión para guardar capturas en tus decks.'); return; }
        let lista = decks;
        let d = deckActivo;
        if (!d) {
            if (!puedeCrearDeck(plan, decks.length)) { setAviso('El plan gratis incluye 1 deck. Hazte Pro para crear más.'); return; }
            d = deckNuevo('Mi primer deck');
            lista = [...decks, d];
        }
        const id = nuevoId();
        if (motivoParaNoAnadir(plan, d, { id }) === 'limite_planos') {
            setAviso(`El plan gratis admite ${LIMITES.gratis.planosPorDeck} capturas por deck. Con Pro no hay tope.`); return;
        }
        setSubiendo(true); setAviso(null);
        try {
            const grandeJpg = await comprimir(captura.blob, 1920);
            const { imagen, ruta } = await subirCaptura(uid, id, grandeJpg);
            const nuevo: Plano = {
                id, imagen, ruta, creado: Date.now(),
                pelicula: captura.pelicula.trim().slice(0, 120) || undefined,
                anio: /^\d{4}$/.test(captura.anio) ? captura.anio : undefined,
                nota: captura.nota.trim().slice(0, 500) || undefined,
                fuente: captura.fuente.trim().slice(0, 500) || undefined,
            };
            if (esPro) {
                try { nuevo.etiquetas = await etiquetar(await aDataUrl(await comprimir(captura.blob, 1024, 0.8))); }
                catch { setAviso('Captura guardada, pero la IA no ha podido etiquetarla ahora.'); }
            }
            const destino = d.id;
            persistir(lista.map(x => x.id === destino ? { ...x, planos: [nuevo, ...x.planos] } : x));
            setActivo(destino);
            URL.revokeObjectURL(captura.vista);
            setCaptura(null);
        } catch (err) {
            console.warn('[fotogramas] subida:', err);
            setAviso('No se pudo guardar la captura. Comprueba la conexión e inténtalo de nuevo.');
        } finally { setSubiendo(false); }
    };

    // ---------- 3. Decks ----------
    const quitar = (p: Plano) => {
        if (!deckActivo) return;
        persistir(decks.map(x => x.id === deckActivo.id ? { ...x, planos: x.planos.filter(q => q.id !== p.id) } : x));
        borrarCaptura(p.ruta);
        setGrande(null);
    };

    const crearDeck = () => {
        if (!puedeCrearDeck(plan, decks.length)) { setAviso('El plan gratis incluye 1 deck. Hazte Pro para crear más.'); return; }
        const nombre = window.prompt('Nombre del deck');
        if (!nombre?.trim()) return;
        const d = deckNuevo(nombre.trim().slice(0, 80));
        persistir([...decks, d]); setActivo(d.id);
    };

    const borrarDeck = () => {
        if (!deckActivo || !window.confirm(`¿Borrar el deck «${deckActivo.nombre}» y sus ${deckActivo.planos.length} capturas?`)) return;
        deckActivo.planos.forEach(p => borrarCaptura(p.ruta));
        const resto = decks.filter(d => d.id !== deckActivo.id);
        persistir(resto); setActivo(resto[0]?.id ?? null);
    };

    const compartir = async () => {
        if (!deckActivo) return;
        if (!esPro) { setAviso('Compartir decks es del plan Pro.'); return; }
        if (deckActivo.planos.length === 0) { setAviso('El deck está vacío.'); return; }
        try {
            const res = await fetch('/api/fotogramas/deck', await conSesion({
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deckActivo.compartido, nombre: deckActivo.nombre, planos: deckActivo.planos }),
            }));
            if (res.status === 403) { setAviso('Este enlace se retiró por una denuncia y está en revisión.'); return; }
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

    const visibles = deckActivo?.planos.filter(p => coincide(p, filtro)) ?? [];

    return (
        <main className="min-h-screen bg-[#100E0B] text-[#F6EFE0]">
            <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6">
                <Link href="/estudios" className="mb-6 inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D9CFBD] hover:text-amber-400">
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver a Mis Estudios
                </Link>

                <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-amber-400">Referencias de cine</p>
                        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Fotogramas</h1>
                        <p className="mt-2 max-w-xl text-[#D9CFBD]">Dile a la IA qué buscas, mira la escena y guarda tus capturas en decks para tu director o tu representante.</p>
                    </div>
                    {esPro ? (
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400"><Crown className="h-3.5 w-3.5" /> Pro</span>
                            <button type="button" onClick={() => hacerPro(true)} className="min-h-11 text-xs uppercase tracking-wider text-[#D9CFBD] underline hover:text-white">Gestionar suscripción</button>
                        </div>
                    ) : cobroListo ? (
                        <button type="button" onClick={() => hacerPro()} className={botonOro}><Crown className="h-4 w-4" /> Hazte Pro</button>
                    ) : null}
                </header>

                {sesionLista && !uid && (
                    <p className="mb-4 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm">
                        Para pedir ideas a la IA y guardar capturas necesitas una cuenta. <Link href="/login" className="font-bold text-amber-400 underline">Inicia sesión</Link>
                    </p>
                )}

                {aviso && (
                    <p role="status" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-amber-400 bg-amber-400/10 px-4 py-3 text-sm">
                        <span className="break-all">{aviso}</span>
                        <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)} className="flex h-11 w-11 shrink-0 items-center justify-center"><X className="h-4 w-4" /></button>
                    </p>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    <div className="min-w-0 space-y-8">
                        {/* 1. Ideas */}
                        <section aria-labelledby="t-ideas">
                            <h2 id="t-ideas" className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">1 · ¿Qué buscas?</h2>
                            <form onSubmit={pedirIdeas} className="flex flex-col gap-2 sm:flex-row">
                                <input value={peticion} onChange={e => setPeticion(e.target.value)} maxLength={500}
                                    aria-label="Qué buscas" placeholder="Rabia contenida en primer plano, luz dura de noche…"
                                    className={`${entrada} flex-1 py-3`} />
                                <button type="submit" disabled={pensando} className={botonOro}>
                                    {pensando ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Buscar escenas</>}
                                </button>
                            </form>

                            {ideas.length > 0 && (
                                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                                    {ideas.map(i => {
                                        const c = clips[i.busqueda];
                                        return (
                                            <li key={i.titulo + i.escena} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                                <p className="text-lg font-bold">{i.titulo} {i.anio && <span className="font-normal text-[#D9CFBD]">({i.anio})</span>}</p>
                                                {i.director && <p className="text-xs uppercase tracking-wider text-[#D9CFBD]">{i.director}</p>}
                                                <p className="mt-2 text-sm">{i.escena}</p>
                                                {i.porQue && <p className="mt-1 text-sm text-[#D9CFBD]"><b className="text-amber-400">Para ti:</b> {i.porQue}</p>}
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <button type="button" onClick={() => verClips(i.busqueda)} className={botonLinea}><Play className="h-3.5 w-3.5" /> Ver clips</button>
                                                    <a href={urlGoogleImagenes(i.busqueda)} target="_blank" rel="noreferrer" className={botonLinea}><Search className="h-3.5 w-3.5" /> Google Imágenes</a>
                                                    <button type="button" onClick={() => prepararDesdeIdea(i)} className={botonLinea}><ImagePlus className="h-3.5 w-3.5" /> Capturar</button>
                                                </div>
                                                {c === 'cargando' && <Loader2 className="mt-3 h-5 w-5 animate-spin text-amber-400" />}
                                                {c === 'sin_clave' && (
                                                    <a href={urlBusquedaYoutube(i.busqueda)} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-amber-400 underline">
                                                        Buscar el clip en YouTube <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                                {Array.isArray(c) && (c.length === 0 ? <p className="mt-3 text-sm text-[#D9CFBD]">No hay clips para esta escena.</p> : (
                                                    <ul className="mt-3 grid grid-cols-2 gap-2">
                                                        {c.map(v => (
                                                            <li key={v.id}>
                                                                <button type="button" onClick={() => setVideo(v.id)} className="block w-full text-left" aria-label={`Ver ${v.titulo}`}>
                                                                    {v.miniatura && <img src={v.miniatura} alt="" loading="lazy" className="aspect-video w-full rounded object-cover" />}
                                                                    <span className="mt-1 line-clamp-2 block text-xs">{v.titulo}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ))}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>

                        {/* 2. Captura */}
                        <section aria-labelledby="t-captura" id="zona-captura">
                            <h2 id="t-captura" className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">2 · Guarda tu captura</h2>
                            {!captura ? (
                                <div
                                    onDragOver={e => { e.preventDefault(); setArrastrando(true); }}
                                    onDragLeave={() => setArrastrando(false)}
                                    onDrop={e => { e.preventDefault(); setArrastrando(false); recibir(e.dataTransfer.files[0]); }}
                                    className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${arrastrando ? 'border-amber-400 bg-amber-400/10' : 'border-white/20'}`}>
                                    <ImagePlus className="mx-auto h-8 w-8 text-amber-400" />
                                    <p className="mt-3 text-sm">Haz una captura de pantalla de la escena y <b>pégala aquí</b> (Ctrl+V o Cmd+V), o arrástrala.</p>
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        <button type="button" onClick={pegarDelPortapapeles} className={botonLinea}><Clipboard className="h-3.5 w-3.5" /> Pegar</button>
                                        <button type="button" onClick={() => archivoRef.current?.click()} className={botonLinea}><Plus className="h-3.5 w-3.5" /> Subir archivo</button>
                                        <input ref={archivoRef} type="file" accept="image/*" hidden onChange={e => { recibir(e.target.files?.[0]); e.target.value = ''; }} />
                                    </div>
                                    <p className="mt-4 text-xs text-[#D9CFBD]">Tus capturas son privadas. Sube sólo imágenes que puedas usar como referencia personal.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_1fr]">
                                    <img src={captura.vista} alt="Captura sin guardar" className="w-full rounded object-contain" />
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-[1fr_90px] gap-2">
                                            <input aria-label="Película" placeholder="Película" value={captura.pelicula} onChange={e => setCaptura({ ...captura, pelicula: e.target.value })} className={entrada} />
                                            <input aria-label="Año" placeholder="Año" inputMode="numeric" maxLength={4} value={captura.anio} onChange={e => setCaptura({ ...captura, anio: e.target.value.replace(/\D/g, '') })} className={entrada} />
                                        </div>
                                        <textarea aria-label="Nota" rows={3} placeholder="¿Qué te interesa de este plano?" value={captura.nota} onChange={e => setCaptura({ ...captura, nota: e.target.value })} className={`${entrada} w-full`} />
                                        <input aria-label="De dónde la has sacado" placeholder="De dónde la has sacado (enlace, opcional)" value={captura.fuente} onChange={e => setCaptura({ ...captura, fuente: e.target.value })} className={`${entrada} w-full`} />
                                        <p className="text-xs text-[#D9CFBD]">
                                            Se guarda en <b className="text-[#F6EFE0]">{deckActivo?.nombre ?? 'Mi primer deck'}</b>.
                                            {esPro ? ' La IA la etiquetará al guardar.' : ' Etiquetado con IA: Pro.'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={guardarCaptura} disabled={subiendo} className={botonOro}>
                                                {subiendo ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : 'Guardar en el deck'}
                                            </button>
                                            <button type="button" onClick={() => { URL.revokeObjectURL(captura.vista); setCaptura(null); }} className={botonLinea}>Descartar</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* 3. Decks */}
                    <aside aria-label="Mis decks" className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">3 · Mis decks</h2>
                            <button type="button" onClick={crearDeck} className="inline-flex min-h-11 items-center gap-1 text-xs uppercase tracking-wider hover:text-amber-400"><Plus className="h-3.5 w-3.5" /> Nuevo</button>
                        </div>

                        {decks.length > 0 && (
                            <select aria-label="Deck activo" value={activo ?? ''} onChange={e => setActivo(e.target.value)} className={`${entrada} mb-3 w-full`}>
                                {decks.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.planos.length})</option>)}
                            </select>
                        )}

                        {deckActivo ? (
                            <>
                                {deckActivo.planos.length > 0 && (
                                    <input aria-label="Filtrar capturas" placeholder="Filtrar: contraluz, tensión, Heat…" value={filtro} onChange={e => setFiltro(e.target.value)} className={`${entrada} mb-2 w-full`} />
                                )}
                                <p className="mb-2 text-xs text-[#D9CFBD]">{deckActivo.planos.length}{esPro ? '' : ` / ${LIMITES.gratis.planosPorDeck}`} capturas</p>
                                {deckActivo.planos.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-white/20 px-3 py-6 text-center text-sm text-[#D9CFBD]">Pega tu primera captura a la izquierda.</p>
                                ) : visibles.length === 0 ? (
                                    <p className="text-sm text-[#D9CFBD]">Nada coincide con «{filtro}».</p>
                                ) : (
                                    <ul className="grid grid-cols-3 gap-2">
                                        {visibles.map(p => (
                                            <li key={p.id}>
                                                <button type="button" onClick={() => setGrande(p)} aria-label={`Ver captura${p.pelicula ? ' de ' + p.pelicula : ''}`} className="block w-full">
                                                    <img src={p.imagen} alt="" loading="lazy" className="aspect-video w-full rounded object-cover" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button type="button" onClick={compartir} className={botonOro}>
                                        {esPro ? <Share2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} {deckActivo.compartido ? 'Copiar enlace' : 'Compartir'}
                                    </button>
                                    <button type="button" onClick={borrarDeck} className={botonLinea}><Trash2 className="h-3.5 w-3.5" /> Borrar</button>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-[#D9CFBD]">Aún no tienes decks. Se crea uno al guardar tu primera captura.</p>
                        )}

                        {!esPro && (
                            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-[#D9CFBD]">
                                Gratis: 1 deck de {LIMITES.gratis.planosPorDeck} capturas. Pro: decks ilimitados, etiquetado con IA y compartir por enlace.
                                {!cobroListo && ' El plan Pro aún no está activado.'}
                            </p>
                        )}
                    </aside>
                </div>
            </div>

            {video && urlEmbedYoutube(video) && (
                <div role="dialog" aria-modal="true" aria-label="Clip de YouTube" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4">
                    <button type="button" aria-label="Cerrar" onClick={() => setVideo(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 hover:border-amber-400"><X className="h-5 w-5" /></button>
                    <div className="w-full max-w-4xl">
                        <iframe src={urlEmbedYoutube(video)} title="Clip de YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full rounded" />
                        <p className="mt-3 text-center text-sm text-[#D9CFBD]">Pausa en el plano que te interese, haz captura de pantalla y pégala en «Guarda tu captura».</p>
                    </div>
                </div>
            )}

            {grande && (
                <div role="dialog" aria-modal="true" aria-label="Captura ampliada" className="fixed inset-0 z-[110] overflow-y-auto bg-black/95 p-4">
                    <button type="button" aria-label="Cerrar" onClick={() => setGrande(null)} className="fixed right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black hover:border-amber-400"><X className="h-5 w-5" /></button>
                    <div className="mx-auto max-w-5xl pt-14">
                        <img src={grande.imagen} alt={grande.pelicula ? `Captura de ${grande.pelicula}` : 'Captura'} className="max-h-[70vh] w-full rounded object-contain" />
                        <div className="mt-4 space-y-3">
                            {grande.pelicula && <p className="text-xl font-bold">{grande.pelicula} {grande.anio && <span className="font-normal text-[#D9CFBD]">({grande.anio})</span>}</p>}
                            {grande.nota && <p className="text-sm">{grande.nota}</p>}
                            {grande.etiquetas ? (
                                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                                    {ETIQUETAS.map(([k, t]) => grande.etiquetas?.[k] ? (
                                        <div key={k}><dt className="text-xs uppercase tracking-wider text-amber-400">{t}</dt><dd>{String(grande.etiquetas[k])}</dd></div>
                                    ) : null)}
                                </dl>
                            ) : !esPro && <p className="flex items-center gap-1.5 text-xs text-[#D9CFBD]"><Lock className="h-3.5 w-3.5" /> Etiquetado con IA (plano, luz, color, emoción): Pro.</p>}
                            {grande.etiquetas?.palabras && grande.etiquetas.palabras.length > 0 && (
                                <ul className="flex flex-wrap gap-1.5">
                                    {grande.etiquetas.palabras.map(w => <li key={w} className="rounded-full border border-white/20 px-2.5 py-1 text-xs">{w}</li>)}
                                </ul>
                            )}
                            {grande.fuente && /^https?:\/\//.test(grande.fuente) && (
                                <a href={grande.fuente} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-amber-400 underline">Fuente <ExternalLink className="h-3.5 w-3.5" /></a>
                            )}
                            <div><button type="button" onClick={() => quitar(grande)} className={botonLinea}><Trash2 className="h-3.5 w-3.5" /> Borrar captura</button></div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
