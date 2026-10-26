'use client';

// LA HEMEROTECA DE GUIONES dentro de la Sala de producción.
//
// Buscas una película o serie → ves su guion sin salir de la app → marcas la
// escena (o un trozo) → la guardas en tus guiones → la ensayas en el Plató con
// la réplica de la IA. Ese recorrido entero es lo que hace memorable la sala.
//
// Si no está en la hemeroteca, «Buscar con IA» dice si ese guion se ha publicado
// y quién lo escribió (los enlaces nunca los pone la IA: hemeroteca o Google).
// Desde cualquier escena, «Referencias de cine» abre Fotogramas con esa escena
// para que la IA proponga películas con escenas parecidas.
//
// Dos modos de lectura, según lo que permita el autor:
//  - PDF: se descarga en el servidor, se trocea por escenas y se lee aquí.
//  - Drive (sólo ver): se incrusta el visor de Google y el fragmento lo
//    transcribes tú al lado. No se salta el candado que puso el autor.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, BookOpen, Eye, ExternalLink, Mic, Save, ChevronRight, Sparkles, Film } from 'lucide-react';
import { nuevoId, type Guion } from '@/lib/estudios-db';
import { urlVisorDrive, type GuionCatalogo, type EscenaTexto } from '@/lib/guiones-catalogo';
import { prepararEnsayo } from '@/lib/ensayar';
import { conSesion } from '@/lib/fotogramas-db';
import { rutaReferencias, urlBuscarGuion, type GuionIA } from '@/lib/guiones-ia';

interface Props {
    uid: string | null;
    /** El padre añade la ficha a la lista y la persiste. */
    onGuardado: (g: Guion) => Promise<void>;
}

const ETIQUETA: Record<GuionCatalogo['tipo'], { texto: string; icono: React.ComponentType<{ className?: string }> }> = {
    pdf: { texto: 'Se lee aquí', icono: BookOpen },
    drive: { texto: 'Visor', icono: Eye },
    web: { texto: 'Fuera', icono: ExternalLink },
};

const IDIOMA: Record<string, string> = { ca: 'catalán', gl: 'gallego', en: 'inglés' };

const PUBLICADO: Record<GuionIA['publicado'], string> = { si: 'Publicado', no: 'No publicado', no_se: 'Sin confirmar' };
const botonPequeno = 'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--cin-line)] px-3 text-[11px] uppercase tracking-[0.14em] text-[var(--cin-ink)] transition hover:border-[var(--cin-accent)]';

export default function BuscadorGuiones({ uid, onGuardado }: Props) {
    const router = useRouter();
    const [q, setQ] = useState('');
    const [ia, setIa] = useState<GuionIA[] | null>(null);
    const [pensando, setPensando] = useState(false);
    const [avisoIa, setAvisoIa] = useState<string | null>(null);
    const [resultados, setResultados] = useState<GuionCatalogo[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [abierto, setAbierto] = useState<GuionCatalogo | null>(null);

    // Búsqueda con un respiro de 250 ms para no pedir en cada tecla.
    useEffect(() => {
        const termino = q.trim();
        if (termino.length < 2) { setResultados([]); return; }
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            setBuscando(true);
            try {
                const res = await fetch(`/api/guiones?q=${encodeURIComponent(termino)}`, { signal: ctrl.signal });
                const data = await res.json();
                setResultados(data.resultados ?? []);
            } catch { /* abortada o sin red: se deja lo que había */ }
            finally { if (!ctrl.signal.aborted) setBuscando(false); }
        }, 250);
        return () => { clearTimeout(t); ctrl.abort(); };
    }, [q]);

    return (
        <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)]">Hemeroteca · guiones en castellano</p>
            <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cin-dim)]" />
                <input value={q} onChange={e => { setQ(e.target.value); setIa(null); setAvisoIa(null); }} placeholder="Busca una película o serie: Campeones, Berlanga, Ministerio del Tiempo…"
                    className="w-full rounded-xl border border-[var(--cin-line)] bg-[var(--cin-input)] py-3 pl-11 pr-10 text-sm text-[var(--cin-body)] placeholder:text-[var(--cin-dim)] focus:border-[var(--cin-accent)] focus:outline-none" />
                {buscando && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--cin-accent)]" />}
            </div>

            {resultados.length > 0 && (
                <ul className="mt-3 divide-y divide-[var(--cin-line)] overflow-hidden rounded-xl border border-[var(--cin-line)] bg-[var(--cin-card)]">
                    {resultados.map(g => {
                        const et = ETIQUETA[g.tipo];
                        const Icono = et.icono;
                        const contenido = (
                            <>
                                <div className="min-w-0 flex-1">
                                    <p className="cin-display truncate text-base">{g.titulo}</p>
                                    <p className="truncate text-xs text-[var(--cin-dim)]">
                                        {g.autor || g.seccion}{g.anio ? ` · ${g.anio}` : ''}{IDIOMA[g.idioma] ? ` · ${IDIOMA[g.idioma]}` : ''}
                                    </p>
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--cin-line)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--cin-accent)]">
                                    <Icono className="h-3 w-3" /> {et.texto}
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--cin-dim)]" />
                            </>
                        );
                        const clase = 'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--cin-accent-soft)]';
                        return (
                            <li key={g.id}>
                                {g.tipo === 'web'
                                    ? <a href={g.url} target="_blank" rel="noopener noreferrer" className={clase}>{contenido}</a>
                                    : <button type="button" onClick={() => setAbierto(g)} className={clase}>{contenido}</button>}
                            </li>
                        );
                    })}
                </ul>
            )}
            {q.trim().length >= 2 && !buscando && resultados.length === 0 && (
                <p className="mt-3 text-sm text-[var(--cin-dim)]">Nada con ese nombre en la hemeroteca. Prueba con una palabra del título o con el guionista.</p>
            )}

            {q.trim().length >= 2 && !buscando && (
                <div className="mt-3">
                    <button type="button" disabled={pensando} onClick={async () => {
                        if (!uid) { setAvisoIa('Inicia sesión para buscar guiones con la IA.'); return; }
                        setPensando(true); setAvisoIa(null);
                        try {
                            const res = await fetch('/api/guiones/ideas', await conSesion({
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consulta: q.trim() }),
                            }));
                            const d = await res.json().catch(() => ({ message: 'La IA está tardando demasiado. Inténtalo de nuevo en un momento.' }));
                            if (!res.ok || !Array.isArray(d?.guiones)) throw new Error(d?.message || 'La IA no ha respondido. Inténtalo de nuevo.');
                            setIa(d.guiones);
                            if (d.guiones.length === 0) setAvisoIa('La IA no ha encontrado ese guion. Prueba con el título original.');
                        } catch (e) {
                            setAvisoIa(e instanceof Error ? e.message : 'La IA no ha respondido. Inténtalo de nuevo.');
                        } finally { setPensando(false); }
                    }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--cin-accent)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cin-on-accent)] transition hover:bg-[var(--cin-accent-dark)] disabled:opacity-60">
                        {pensando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Buscar «{q.trim()}» con IA
                    </button>
                    {avisoIa && <p role="status" className="mt-2 text-sm text-[var(--cin-accent)]">{avisoIa}</p>}
                </div>
            )}

            {ia && ia.length > 0 && (
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                    {ia.map(g => (
                        <li key={g.titulo + (g.anio ?? '')} className="rounded-xl border border-[var(--cin-line)] bg-[var(--cin-card)] p-4">
                            <div className="flex items-start justify-between gap-2">
                                <p className="cin-display text-base">{g.titulo} {g.anio && <span className="font-sans text-xs text-[var(--cin-dim)]">({g.anio})</span>}</p>
                                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${g.publicado === 'si' ? 'border-[var(--cin-accent)] text-[var(--cin-accent)]' : 'border-[var(--cin-line)] text-[var(--cin-dim)]'}`}>
                                    {g.enHemeroteca ? 'En la hemeroteca' : PUBLICADO[g.publicado]}
                                </span>
                            </div>
                            {g.guionistas && <p className="text-xs text-[var(--cin-dim)]">Guion: {g.guionistas}</p>}
                            {g.donde && <p className="mt-2 text-sm text-[var(--cin-body)]">{g.donde}</p>}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {g.enHemeroteca ? (
                                    <button type="button" onClick={() => setAbierto(g.enHemeroteca!)} className={botonPequeno}><BookOpen className="h-3.5 w-3.5" /> Abrir aquí</button>
                                ) : (
                                    <a href={urlBuscarGuion(g.busqueda)} target="_blank" rel="noopener noreferrer" className={botonPequeno}><Search className="h-3.5 w-3.5" /> Buscar el guion</a>
                                )}
                                <button type="button" onClick={() => router.push(rutaReferencias({ titulo: g.titulo }))} className={botonPequeno}><Film className="h-3.5 w-3.5" /> Referencias de cine</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {ia && ia.length > 0 && (
                <p className="mt-2 text-xs text-[var(--cin-dim)]">Lo que dice la IA sobre si un guion está publicado puede fallar: compruébalo en la búsqueda.</p>
            )}

            <AnimatePresence>
                {abierto && <Lector guion={abierto} uid={uid} onGuardado={onGuardado} onClose={() => setAbierto(null)} />}
            </AnimatePresence>
        </div>
    );
}

/* ---------------- El lector ---------------- */

function Lector({ guion, uid, onGuardado, onClose }: { guion: GuionCatalogo; uid: string | null; onGuardado: Props['onGuardado']; onClose: () => void }) {
    const router = useRouter();
    const [escenas, setEscenas] = useState<EscenaTexto[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [actual, setActual] = useState(0);
    const [filtro, setFiltro] = useState('');
    const [seleccion, setSeleccion] = useState('');
    const [transcripcion, setTranscripcion] = useState('');
    const [nombreEscena, setNombreEscena] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);
    const textoRef = useRef<HTMLPreElement>(null);

    const esPdf = guion.tipo === 'pdf';
    const visor = useMemo(() => urlVisorDrive(guion.url), [guion.url]);

    useEffect(() => {
        if (!esPdf) return;
        const ctrl = new AbortController();
        (async () => {
            try {
                const res = await fetch(`/api/guiones?id=${encodeURIComponent(guion.id)}`, { signal: ctrl.signal });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'No se pudo leer el guion');
                setEscenas(data.escenas);
            } catch (e) {
                if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : 'No se pudo leer el guion');
            }
        })();
        return () => ctrl.abort();
    }, [guion.id, esPdf]);

    useEffect(() => {
        const cerrar = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', cerrar);
        return () => window.removeEventListener('keydown', cerrar);
    }, [onClose]);

    const visibles = useMemo(() => {
        if (!escenas) return [];
        const f = filtro.trim().toLowerCase();
        return escenas.map((e, i) => ({ e, i })).filter(({ e }) => !f || e.texto.toLowerCase().includes(f) || e.titulo.toLowerCase().includes(f));
    }, [escenas, filtro]);

    const capturarSeleccion = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !textoRef.current || !textoRef.current.contains(sel.anchorNode)) { setSeleccion(''); return; }
        setSeleccion(sel.toString().trim());
    }, []);

    const escenaActual = escenas?.[actual];
    const textoAGuardar = esPdf ? (seleccion || escenaActual?.texto || '') : transcripcion.trim();
    const etiquetaEscena = esPdf ? (escenaActual?.titulo ?? '') : nombreEscena.trim();

    const guardar = async (yEnsayar: boolean) => {
        if (!textoAGuardar) return;
        setGuardando(true);
        try {
            const ficha: Guion = {
                id: nuevoId(),
                titulo: guion.titulo,
                autor: guion.autor || undefined,
                enlace: guion.url,
                texto: textoAGuardar,
                escena: etiquetaEscena || undefined,
                fuente: guion.fuente,
                creado: Date.now(),
            };
            await onGuardado(ficha);
            if (yEnsayar) {
                const ruta = await prepararEnsayo(uid, `${guion.titulo}${etiquetaEscena ? ' · ' + etiquetaEscena : ''}`, textoAGuardar);
                router.push(ruta);
                return;
            }
            setAviso(seleccion ? 'Fragmento guardado en tus guiones.' : 'Escena guardada en tus guiones.');
            setSeleccion('');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            // z-[110]: por encima de la barra inferior de la app (z-[100]), que si
            // no tapaba los botones de guardar y ensayar en el móvil.
            className="fixed inset-0 z-[110] flex items-stretch justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
                className="cinemateca flex h-full w-full max-w-6xl flex-col overflow-hidden bg-[var(--cin-bg)] text-[var(--cin-body)] sm:h-[90vh] sm:rounded-2xl sm:border sm:border-[var(--cin-line)]"
                role="dialog" aria-modal="true" aria-label={`Guion de ${guion.titulo}`}>

                {/* Cabecera */}
                <div className="flex items-start gap-3 border-b border-[var(--cin-line)] px-4 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                        <h2 className="cin-display truncate text-xl sm:text-2xl">{guion.titulo}</h2>
                        <p className="truncate text-xs text-[var(--cin-dim)]">{[guion.autor, guion.anio, guion.fuente === 'ambas' ? 'Bloguionistas y Aprendercine' : guion.fuente].filter(Boolean).join(' · ')}</p>
                    </div>
                    <a href={guion.url} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-full border border-[var(--cin-line)] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--cin-dim)] hover:text-[var(--cin-ink)] sm:inline-flex">
                        <ExternalLink className="h-3 w-3" /> Original
                    </a>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-[var(--cin-dim)] hover:bg-[var(--cin-accent-soft)] hover:text-[var(--cin-ink)]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cuerpo */}
                {esPdf ? (
                    error ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                            <p className="text-sm text-[var(--cin-body)]">{error}</p>
                            <a href={guion.url} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.16em] text-[var(--cin-accent)]">Abrir el PDF original</a>
                        </div>
                    ) : !escenas ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-[var(--cin-accent)]" />
                            <p className="text-sm text-[var(--cin-dim)]">Descargando el guion y partiéndolo por escenas…</p>
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
                            {/* Escenas */}
                            <aside className="flex max-h-[32vh] shrink-0 flex-col border-b border-[var(--cin-line)] sm:max-h-none sm:w-72 sm:border-b-0 sm:border-r">
                                <div className="p-3">
                                    <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder={`Buscar en ${escenas.length} escenas…`}
                                        className="w-full rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] px-3 py-2 text-xs text-[var(--cin-body)] placeholder:text-[var(--cin-dim)] focus:border-[var(--cin-accent)] focus:outline-none" />
                                </div>
                                <ol className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                                    {visibles.map(({ e, i }) => (
                                        <li key={i}>
                                            <button type="button" onClick={() => { setActual(i); setSeleccion(''); setAviso(null); }}
                                                className={`w-full truncate rounded-lg px-3 py-2 text-left text-xs transition ${i === actual ? 'bg-[var(--cin-accent-soft2)] text-[var(--cin-ink)]' : 'text-[var(--cin-body)] hover:bg-[var(--cin-accent-soft)]'}`}>
                                                <span className="mr-2 text-[var(--cin-dim)]">{i + 1}</span>{e.titulo}
                                            </button>
                                        </li>
                                    ))}
                                    {visibles.length === 0 && <li className="px-3 py-2 text-xs text-[var(--cin-dim)]">Ninguna escena contiene eso.</li>}
                                </ol>
                            </aside>

                            {/* Texto de la escena */}
                            <div className="flex min-h-0 flex-1 flex-col">
                                <pre ref={textoRef} onMouseUp={capturarSeleccion} onTouchEnd={capturarSeleccion}
                                    className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap px-5 py-5 font-mono text-[13px] leading-relaxed text-[var(--cin-body)] selection:bg-[var(--cin-accent)] selection:text-[var(--cin-on-accent)] sm:px-10 sm:text-sm">
                                    {escenaActual?.texto}
                                </pre>
                                <Acciones
                                    detalle={seleccion ? `Seleccionado: ${seleccion.split(/\s+/).length} palabras` : `Escena entera: ${escenaActual?.titulo ?? ''}`}
                                    puede={!!textoAGuardar} guardando={guardando} aviso={aviso}
                                    onGuardar={() => guardar(false)} onEnsayar={() => guardar(true)}
                                    onReferencias={() => router.push(rutaReferencias({ titulo: guion.titulo, escena: etiquetaEscena, texto: textoAGuardar }))} />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
                        <div className="min-h-[45vh] flex-1 bg-black sm:min-h-0">
                            {visor ? (
                                <iframe src={visor} title={`Visor de ${guion.titulo}`} className="h-full w-full" />
                            ) : (
                                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[var(--cin-dim)]">Este guion no se puede incrustar. <a className="ml-1 text-[var(--cin-accent)]" href={guion.url} target="_blank" rel="noopener noreferrer">Ábrelo fuera</a>.</div>
                            )}
                        </div>
                        <div className="flex shrink-0 flex-col border-t border-[var(--cin-line)] sm:w-96 sm:border-l sm:border-t-0">
                            <div className="px-4 pt-4 sm:px-5">
                                <p className="text-xs uppercase tracking-[0.16em] text-[var(--cin-dim)]">Sólo lectura, por decisión del autor</p>
                                <p className="mt-1 text-sm text-[var(--cin-body)]">Busca la escena en el visor y copia aquí lo que quieras trabajar. Un personaje por línea: <span className="font-mono text-[var(--cin-ink)]">ANA: …</span></p>
                                <input value={nombreEscena} onChange={e => setNombreEscena(e.target.value)} placeholder="Escena (p. ej. INT. COCINA - NOCHE)"
                                    className="mt-3 w-full rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] px-3 py-2 text-xs text-[var(--cin-body)] placeholder:text-[var(--cin-dim)] focus:border-[var(--cin-accent)] focus:outline-none" />
                            </div>
                            <textarea value={transcripcion} onChange={e => { setTranscripcion(e.target.value); setAviso(null); }} placeholder={'ANA: ¿De verdad pensabas que no me iba a enterar?\nLUIS: No quería hacerte daño.'}
                                className="m-4 min-h-[160px] flex-1 resize-none rounded-lg border border-[var(--cin-line)] bg-[var(--cin-input)] p-3 font-mono text-[13px] leading-relaxed text-[var(--cin-body)] placeholder:text-[var(--cin-dim)] focus:border-[var(--cin-accent)] focus:outline-none sm:mx-5" />
                            <Acciones detalle={transcripcion.trim() ? `${transcripcion.trim().split(/\s+/).length} palabras` : 'Escribe o dicta la escena'}
                                puede={!!textoAGuardar} guardando={guardando} aviso={aviso}
                                onGuardar={() => guardar(false)} onEnsayar={() => guardar(true)}
                                onReferencias={() => router.push(rutaReferencias({ titulo: guion.titulo, escena: etiquetaEscena, texto: textoAGuardar }))} />
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

function Acciones({ detalle, puede, guardando, aviso, onGuardar, onEnsayar, onReferencias }: {
    detalle: string; puede: boolean; guardando: boolean; aviso: string | null;
    onGuardar: () => void; onEnsayar: () => void; onReferencias: () => void;
}) {
    return (
        // pb-20 en el móvil: la barra de pestañas de la app (fija, 64 px) queda por
        // encima del lector y tapaba la última fila de botones.
        <div className="border-t border-[var(--cin-line)] bg-[var(--cin-card)] px-4 pb-20 pt-3 sm:px-5 sm:pb-3">
            <p className="mb-2 truncate text-[11px] uppercase tracking-[0.14em] text-[var(--cin-dim)]">{aviso ? <span className="text-[var(--cin-accent)]">{aviso}</span> : detalle}</p>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onGuardar} disabled={!puede || guardando}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--cin-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cin-accent)] transition hover:bg-[var(--cin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-40">
                    <Save className="h-3.5 w-3.5" /> Guardar en mis guiones
                </button>
                <button type="button" onClick={onEnsayar} disabled={!puede || guardando}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--cin-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cin-on-accent)] transition hover:bg-[var(--cin-accent-dark)] disabled:cursor-not-allowed disabled:opacity-40">
                    {guardando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />} Ensayar en el Plató
                </button>
                <button type="button" onClick={onReferencias} disabled={!puede}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--cin-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cin-ink)] transition hover:border-[var(--cin-accent)] disabled:cursor-not-allowed disabled:opacity-40">
                    <Film className="h-3.5 w-3.5" /> Referencias de cine
                </button>
            </div>
        </div>
    );
}
