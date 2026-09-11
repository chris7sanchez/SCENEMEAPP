'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    listarPublicaciones, fechasConPublicaciones, listarComentarios, comentar,
    borrarComentario, alternarBravo, tengoBravo, retirar, denunciar, nombreParaFirmar,
    type Publicacion, type Comentario,
} from '@/lib/comunidad-db';

/** Fecha «2026-09-11» → «11 de septiembre». */
function enBonito(fecha: string): string {
    const [a, m, d] = fecha.split('-').map(Number);
    if (!a || !m || !d) return fecha;
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${d} de ${meses[m - 1]}`;
}

export default function SalaVisionado() {
    const [uid, setUid] = useState<string | null>(null);
    const [yo, setYo] = useState('');
    const [cargandoSesion, setCargandoSesion] = useState(true);

    const [items, setItems] = useState<Publicacion[]>([]);
    const [fechas, setFechas] = useState<string[]>([]);
    const [filtro, setFiltro] = useState<string>('');
    const [cargando, setCargando] = useState(true);
    const [abierta, setAbierta] = useState<Publicacion | null>(null);

    useEffect(() => {
        import('@/lib/auth').then(async ({ auth }) => {
            const u = await auth.getCurrentUser();
            setUid(u?.uid ?? null);
            setYo(nombreParaFirmar(u?.profile));
        }).catch(() => setUid(null)).finally(() => setCargandoSesion(false));
    }, []);

    // El «cargando» lo enciende quien PULSA el filtro, y se apaga cuando llegan
    // los datos: así el efecto no toca el estado hasta que responde el servidor.
    const cambiarFiltro = (f: string) => { setCargando(true); setFiltro(f); };
    /** Para volver a pedir el muro sin pasar por el efecto (p. ej. al retirar). */
    const [recarga, setRecarga] = useState(0);
    const recargar = () => setRecarga(n => n + 1);

    useEffect(() => {
        if (!uid) return;
        let vivo = true;
        listarPublicaciones(filtro || undefined)
            .then(r => { if (vivo) { setItems(r); setCargando(false); } })
            .catch(e => {
                console.warn('[comunidad] no se pudo leer el muro:', e);
                if (vivo) { setItems([]); setCargando(false); }
            });
        return () => { vivo = false; };
    }, [uid, filtro, recarga]);

    useEffect(() => { if (uid) fechasConPublicaciones().then(setFechas).catch(() => setFechas([])); }, [uid]);

    if (cargandoSesion) {
        return <p className="py-20 text-center text-sm text-zinc-500">Abriendo la sala…</p>;
    }

    // Se entra con sesión: son self-tapes de gente real, no un escaparate público.
    if (!uid) {
        return (
            <div className="mx-auto max-w-lg py-20 text-center">
                <p className="text-lg font-bold text-white">La sala está a oscuras</p>
                <p className="mt-3 text-sm text-zinc-400">
                    Aquí se ven las tomas que otros actores han querido enseñar. Se entra con
                    sesión: lo que hay dentro es trabajo de gente real y no está abierto a internet.
                </p>
                <Link href="/login" className="mt-6 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-black transition hover:bg-amber-400">
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => cambiarFiltro('')}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${!filtro ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                >
                    Todo
                </button>
                {fechas.slice(0, 8).map(f => (
                    <button
                        key={f}
                        onClick={() => cambiarFiltro(f)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${filtro === f ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                    >
                        Escena del {enBonito(f)}
                    </button>
                ))}
            </div>

            {cargando ? (
                <p className="py-16 text-center text-sm text-zinc-500">Cargando la sala…</p>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
                    <p className="text-sm text-zinc-300">
                        {filtro ? 'Nadie ha enseñado todavía esta escena.' : 'La sala está vacía. Sé el primero en proyectar algo.'}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                        Sube tu toma en el Plató y pulsa «Compartir en la Sala».
                    </p>
                    <Link href="/studio" className="mt-5 inline-block rounded-full border border-amber-400/40 bg-amber-500/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20">
                        Ir al Plató
                    </Link>
                </div>
            ) : (
                <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(p => (
                        <Butaca key={p.id} pub={p} onAbrir={() => setAbierta(p)} />
                    ))}
                </ul>
            )}

            {abierta && (
                <Proyeccion
                    pub={abierta}
                    uid={uid}
                    yo={yo}
                    onCerrar={() => setAbierta(null)}
                    onRetirada={() => { setAbierta(null); recargar(); }}
                />
            )}
        </>
    );
}

/** Una tarjeta del muro: el vídeo en pequeño, quién es y cuántos bravos lleva. */
function Butaca({ pub, onAbrir }: { pub: Publicacion; onAbrir: () => void }) {
    return (
        <li>
            <button
                onClick={onAbrir}
                className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left transition hover:border-amber-400/40"
            >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <video src={pub.downloadURL} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-3xl opacity-0 transition group-hover:opacity-100">▶</span>
                </div>
                <div className="p-3">
                    <p className="truncate text-sm font-bold text-white">{pub.autor}</p>
                    <p className="mt-0.5 flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="truncate">Escena del {enBonito(pub.fecha)}</span>
                        <span className="shrink-0 text-amber-400/80">👏 {pub.bravos ?? 0}</span>
                    </p>
                </div>
            </button>
        </li>
    );
}

/** El vídeo a lo grande, con sus bravos y sus comentarios. */
function Proyeccion({ pub, uid, yo, onCerrar, onRetirada }: {
    pub: Publicacion; uid: string; yo: string; onCerrar: () => void; onRetirada: () => void;
}) {
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [texto, setTexto] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [bravo, setBravo] = useState(false);
    const [bravos, setBravos] = useState(pub.bravos ?? 0);
    const [aviso, setAviso] = useState('');
    const esMia = pub.uid === uid;

    useEffect(() => {
        listarComentarios(pub.id).then(setComentarios).catch(() => setComentarios([]));
        tengoBravo(pub.id, uid).then(setBravo).catch(() => { });
    }, [pub.id, uid]);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [onCerrar]);

    const aplaudir = async () => {
        // Se pinta ya y se corrige si el servidor dice otra cosa: aplaudir tiene
        // que sentirse instantáneo.
        const antes = bravo;
        setBravo(!antes); setBravos(n => n + (antes ? -1 : 1));
        try {
            const ahora = await alternarBravo(pub.id, uid);
            setBravo(ahora);
        } catch {
            setBravo(antes); setBravos(n => n + (antes ? 1 : -1));
            setAviso('No se pudo registrar el bravo.');
        }
    };

    const enviar = async () => {
        const t = texto.trim();
        if (!t) return;
        setEnviando(true); setAviso('');
        try {
            const nuevo = await comentar(pub.id, uid, yo, t);
            setComentarios(prev => [...prev, nuevo]);
            setTexto('');
        } catch {
            setAviso('No se pudo publicar el comentario.');
        } finally {
            setEnviando(false);
        }
    };

    const quitarComentario = async (c: Comentario) => {
        if (!confirm('¿Borrar este comentario?')) return;
        try {
            await borrarComentario(pub.id, c.id);
            setComentarios(prev => prev.filter(x => x.id !== c.id));
        } catch { setAviso('No se pudo borrar.'); }
    };

    const reportar = async (comentarioId?: string) => {
        const motivo = prompt('¿Qué pasa con esto? Lo revisaremos.');
        if (motivo === null) return;
        try {
            await denunciar(pub.id, uid, motivo, comentarioId);
            setAviso('Gracias. Lo revisaremos.');
        } catch { setAviso('No se pudo enviar la denuncia.'); }
    };

    const retirarla = async () => {
        if (!confirm('¿Retirar tu vídeo de la Sala? Tu toma NO se borra: sigue en tus tareas.')) return;
        try { await retirar(pub.id); onRetirada(); }
        catch { setAviso('No se pudo retirar.'); }
    };

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 p-4 backdrop-blur-sm sm:p-8" onClick={onCerrar}>
            <div className="mx-auto w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-lg font-black text-white">{pub.autor}</p>
                        <p className="text-xs text-zinc-500">Escena del {enBonito(pub.fecha)}</p>
                    </div>
                    <button onClick={onCerrar} className="shrink-0 rounded-full px-3 py-1 text-zinc-400 hover:text-white" aria-label="Cerrar">✕</button>
                </div>

                <video src={pub.downloadURL} controls autoPlay playsInline className="mt-4 w-full rounded-2xl bg-black" />

                {pub.nota && <p className="mt-3 text-sm italic text-zinc-300">«{pub.nota}»</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                        onClick={aplaudir}
                        className={`rounded-full px-5 py-2.5 text-sm font-black transition ${bravo ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                    >
                        👏 Bravo · {bravos}
                    </button>
                    {esMia ? (
                        <button onClick={retirarla} className="rounded-full bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-red-400">
                            Retirar de la sala
                        </button>
                    ) : (
                        <button onClick={() => reportar()} className="rounded-full bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition hover:text-amber-300">
                            Denunciar
                        </button>
                    )}
                </div>

                {aviso && <p className="mt-3 text-xs text-amber-300">{aviso}</p>}

                <div className="mt-8 border-t border-white/10 pt-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                        {comentarios.length === 0 ? 'Sin comentarios' : `${comentarios.length} ${comentarios.length === 1 ? 'comentario' : 'comentarios'}`}
                    </p>

                    <ul className="mt-4 space-y-4">
                        {comentarios.map(c => (
                            <li key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-bold text-amber-300/90">{c.autor}</p>
                                    <div className="flex shrink-0 gap-2 text-[10px] uppercase tracking-wider">
                                        {(c.uid === uid || esMia) && (
                                            <button onClick={() => quitarComentario(c)} className="text-zinc-600 hover:text-red-400">Borrar</button>
                                        )}
                                        {c.uid !== uid && (
                                            <button onClick={() => reportar(c.id)} className="text-zinc-600 hover:text-amber-300">Denunciar</button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{c.texto}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5">
                        <textarea
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            placeholder="Di algo que le sirva: qué has creído, dónde te has perdido, qué te ha llegado."
                            className="h-24 w-full resize-y rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                        />
                        <button
                            onClick={enviar}
                            disabled={enviando || !texto.trim()}
                            className="mt-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-black text-black transition hover:bg-amber-400 disabled:opacity-50"
                        >
                            {enviando ? 'Enviando…' : 'Comentar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
