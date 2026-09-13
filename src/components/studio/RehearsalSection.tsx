'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getOrCreateDailyScene } from '@/lib/studio-db';
import RehearsalPlayer, { type AjustesEnsayo } from '@/components/studio/RehearsalPlayer';
import { parseScriptScenes, speakersOfScenes, scenesWithDialogue } from '@/lib/scene-script';
import {
    listarGuiones, guardarGuion, borrarGuion, nuevoId, tituloSugerido,
    type GuionEnsayo,
} from '@/lib/rehearsal-db';
import { parsePdfAction } from '@/ai/parse-pdf';

/** Resumen barato de un guion para la lista: escenas y reparto. */
function resumen(texto: string): { escenas: number; personajes: string[] } {
    const escenas = scenesWithDialogue(parseScriptScenes(texto));
    return { escenas: escenas.length, personajes: speakersOfScenes(escenas) };
}

export default function RehearsalSection({ dateKey }: { dateKey: string }) {
    const [script, setScript] = useState('');
    const [titulo, setTitulo] = useState('');
    const [loadingScene, setLoadingScene] = useState(false);
    const [subiendoPdf, setSubiendoPdf] = useState(false);
    const [aviso, setAviso] = useState('');

    const [uid, setUid] = useState<string | null>(null);
    const [guiones, setGuiones] = useState<GuionEnsayo[]>([]);
    const [cargando, setCargando] = useState(true);
    /** El guion abierto en el reproductor (uno guardado, o el del cuadro). */
    const [enEnsayo, setEnEnsayo] = useState<GuionEnsayo | null>(null);

    useEffect(() => {
        import('@/lib/auth').then(async ({ auth }) => {
            const user = await auth.getCurrentUser();
            setUid(user?.uid ?? null);
        }).catch(() => setUid(null));
    }, []);

    useEffect(() => {
        let cancelado = false;
        (async () => {
            try {
                const items = await listarGuiones(uid);
                if (!cancelado) setGuiones(items);
            } finally {
                if (!cancelado) setCargando(false);
            }
        })();
        return () => { cancelado = true; };
    }, [uid]);

    const info = useMemo(() => (script.trim() ? resumen(script) : null), [script]);

    const useToday = async () => {
        setLoadingScene(true);
        setAviso('');
        try {
            const scene = await getOrCreateDailyScene(dateKey);
            setScript(scene.lines.map(l => `${l.character}: ${l.text}`).join('\n'));
            setTitulo(t => t || 'Escena del día');
        } catch (e) {
            console.error(e);
            setAviso('No se pudo cargar la escena de hoy.');
        } finally {
            setLoadingScene(false);
        }
    };

    const cargarPdf = async (file: File) => {
        setSubiendoPdf(true);
        setAviso('');
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await parsePdfAction(fd);
            // Puede venir texto Y aviso a la vez (p. ej. salió partido en
            // letras). En ese caso se carga igualmente: aquí hay un cuadro
            // donde se puede arreglar a mano, que es mejor que quedarse sin nada.
            if (res.text?.trim()) {
                setScript(res.text);
                setTitulo(t => t || file.name.replace(/\.pdf$/i, ''));
                if (res.error) setAviso(`⚠️ ${res.error}`);
            } else {
                setAviso(res.error || 'El PDF no traía texto legible (¿es un escaneo?).');
            }
        } catch (e) {
            console.error(e);
            setAviso('Ocurrió un error al procesar el PDF.');
        } finally {
            setSubiendoPdf(false);
        }
    };

    /** Guarda lo que hay en el cuadro como un guion de la biblioteca. */
    const guardarNuevo = async () => {
        const texto = script.trim();
        if (!texto) return;
        const g: GuionEnsayo = {
            id: nuevoId(),
            titulo: titulo.trim() || tituloSugerido(texto),
            texto,
            reparto: {},
            creado: Date.now(),
            actualizado: Date.now(),
        };
        setGuiones(await guardarGuion(uid, g));
        setScript(''); setTitulo('');
        setAviso(uid ? 'Guion guardado en tu cuenta.' : 'Guion guardado en este navegador.');
    };

    const eliminar = async (g: GuionEnsayo) => {
        if (!confirm(`¿Borrar «${g.titulo}»?`)) return;
        setGuiones(await borrarGuion(uid, g.id));
    };

    /** Al empezar un ensayo se guarda el reparto: no se reparte dos veces. */
    const recordarAjustes = async (g: GuionEnsayo, a: AjustesEnsayo) => {
        if (!guiones.some(x => x.id === g.id)) return; // ensayo suelto: no se guarda
        const actualizado = { ...g, reparto: a.reparto, miPersonaje: a.miPersonaje, motor: a.motor, narrador: a.narrador };
        setEnEnsayo(actualizado);
        setGuiones(await guardarGuion(uid, actualizado));
    };

    return (
        <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-5 sm:p-7">
            <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                    <span className="mr-2 rounded-full border border-zinc-600 bg-white/5 px-2 py-0.5 text-[10px] font-black text-zinc-300">2</span>
                    Ensayar con réplicas
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Tu compañero de reparto 🎭</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Sube tu guion entero (PDF o pegado), reparte la voz y el tono de cada
                    personaje y ensaya tu película: los demás se responden entre sí y se
                    callan en tus líneas. Di tu frase y calla —o pulsa— y entra la réplica.
                </p>
                {!uid && !cargando && (
                    <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
                        Sin iniciar sesión, tus guiones se guardan <strong>solo en este navegador</strong>.{' '}
                        <Link href="/login" className="underline underline-offset-4">Inicia sesión</Link> para tenerlos en todos tus aparatos.
                    </p>
                )}
            </div>

            {/* ---------------- Biblioteca de guiones ---------------- */}
            {guiones.length > 0 && (
                <div className="mt-5">
                    <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Tus guiones</p>
                    <ul className="space-y-2">
                        {guiones.map(g => {
                            const r = resumen(g.texto);
                            return (
                                <li key={g.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-700/70 bg-black/30 px-3 py-2.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-zinc-100">{g.titulo}</p>
                                        <p className="truncate text-[11px] text-zinc-500">
                                            {r.escenas} {r.escenas === 1 ? 'escena' : 'escenas'} · {r.personajes.length} personajes
                                            {g.miPersonaje && <span className="text-amber-500/80"> · tú: {g.miPersonaje}</span>}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setEnEnsayo(g)}
                                        className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-black text-black transition hover:bg-amber-400"
                                    >
                                        ENSAYAR
                                    </button>
                                    <button
                                        onClick={() => eliminar(g)}
                                        className="rounded-full px-2 py-1.5 text-xs text-zinc-500 transition hover:text-red-400"
                                        aria-label={`Borrar ${g.titulo}`}
                                    >
                                        Borrar
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* ---------------- Añadir un guion ---------------- */}
            <div className="mt-6 border-t border-zinc-800 pt-5">
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Añadir un guion</p>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => document.getElementById('ensayo-pdf')?.click()}
                        disabled={subiendoPdf}
                        className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-60"
                    >
                        {subiendoPdf ? 'Leyendo PDF…' : '📄 Subir PDF'}
                    </button>
                    <input
                        id="ensayo-pdf" type="file" accept=".pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) cargarPdf(f); e.target.value = ''; }}
                    />
                    <button
                        onClick={useToday}
                        disabled={loadingScene}
                        className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-60"
                    >
                        {loadingScene ? 'Cargando…' : 'Usar la escena de hoy'}
                    </button>
                </div>

                <input
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Título (p. ej. «El último tren — borrador 3»)"
                    className="mt-3 w-full rounded-xl border border-zinc-700 bg-black/40 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                />

                <textarea
                    value={script}
                    onChange={e => setScript(e.target.value)}
                    placeholder={'Pega aquí el guion o la escena. Ejemplo:\n\n1. INT. COCINA - NOCHE\n\nANA: ¿De verdad pensabas que no me iba a enterar?\nLUIS: No quería hacerte daño.'}
                    className="mt-3 h-44 w-full resize-y rounded-xl border border-zinc-700 bg-black/40 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                />

                {info && (
                    <p className="mt-2 text-xs text-zinc-500">
                        Detectadas <strong className="text-zinc-300">{info.escenas}</strong> {info.escenas === 1 ? 'escena' : 'escenas'}
                        {info.personajes.length > 0 && <> y <strong className="text-zinc-300">{info.personajes.length}</strong> personajes: {info.personajes.join(', ')}</>}.
                    </p>
                )}
                {aviso && <p className="mt-2 text-xs text-amber-300">{aviso}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        onClick={() => setEnEnsayo({
                            id: '__suelto__', titulo: titulo.trim() || 'Ensayo suelto', texto: script,
                            reparto: {}, creado: Date.now(), actualizado: Date.now(),
                        })}
                        disabled={!script.trim()}
                        className="flex-1 rounded-full bg-amber-500 py-3 text-sm font-black text-black transition hover:bg-amber-400 disabled:opacity-50"
                    >
                        ENSAYAR AHORA
                    </button>
                    <button
                        onClick={guardarNuevo}
                        disabled={!script.trim()}
                        className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
                    >
                        Guardar en mis guiones
                    </button>
                </div>
            </div>

            {enEnsayo && (
                <RehearsalPlayer
                    script={enEnsayo.texto}
                    ajustes={{ reparto: enEnsayo.reparto, miPersonaje: enEnsayo.miPersonaje, motor: enEnsayo.motor, narrador: enEnsayo.narrador }}
                    onGuardarAjustes={a => recordarAjustes(enEnsayo, a)}
                    onClose={() => setEnEnsayo(null)}
                />
            )}
        </section>
    );
}
