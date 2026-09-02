'use client';

// NOTAS DE LA TOMA — cierra el bucle del Studio.
// Hasta ahora el actor ensayaba y grababa, pero no recibía nada de vuelta.
// Aquí sube su toma, se transcribe y se compara con el texto de la escena para
// devolverle notas concretas, como se las daría un director.

import React, { useEffect, useRef, useState } from 'react';
import type { DailyScene as Scene } from '@/lib/daily-scene';

interface Nota { momento: string; observacion: string; sugerencia: string }
interface Resultado {
    transcripcion: string;
    fidelidad?: number;
    resumen?: string;
    fuerte?: string;
    notas?: Nota[];
    siguientePaso?: string;
    error?: string;
    message?: string;
}

const LIMITE_MB = 25;

export default function TakeFeedback({ dateKey }: { dateKey: string }) {
    const [scene, setScene] = useState<Scene | null>(null);
    const [personaje, setPersonaje] = useState('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [analizando, setAnalizando] = useState(false);
    const [res, setRes] = useState<Resultado | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verTexto, setVerTexto] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let vivo = true;
        import('@/lib/studio-db').then(async ({ getOrCreateDailyScene }) => {
            try {
                const s = await getOrCreateDailyScene(dateKey);
                if (!vivo) return;
                setScene(s);
                if (s?.characters?.length) setPersonaje(s.characters[0]);
            } catch { /* la sección se queda en reposo, sin romper el Studio */ }
        });
        return () => { vivo = false; };
    }, [dateKey]);

    const elegir = (f: File | null) => {
        setError(null); setRes(null);
        if (!f) { setArchivo(null); return; }
        if (f.size > LIMITE_MB * 1024 * 1024) {
            setError(`La toma pesa ${(f.size / 1048576).toFixed(1)} MB y el límite son ${LIMITE_MB} MB. Graba un fragmento más corto.`);
            setArchivo(null); return;
        }
        setArchivo(f);
    };

    const analizar = async () => {
        if (!archivo || !scene) return;
        setAnalizando(true); setError(null); setRes(null);
        try {
            const guion = scene.lines.map(l => `${l.character}: ${l.text}`).join('\n');
            const fd = new FormData();
            fd.append('media', archivo);
            fd.append('guion', guion);
            fd.append('personaje', personaje);
            const r = await fetch('/api/analyze-take', { method: 'POST', body: fd });
            const datos = await r.json();
            if (!r.ok) { setError(datos?.message ?? 'No se pudo analizar la toma.'); return; }
            setRes(datos);
        } catch (e) {
            setError('No se pudo conectar para analizar la toma. Revisa tu conexión.');
            console.warn('[notas] fallo de red:', e);
        } finally {
            setAnalizando(false);
        }
    };

    if (!scene) return null;

    return (
        <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-6">
            <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">Nuevo</span>
                <h3 className="text-lg font-bold text-amber-300">Notas de tu toma</h3>
            </div>
            <p className="mb-5 text-sm text-zinc-400">
                Sube la toma que acabas de grabar y te la comparo con el texto de la escena:
                qué has cambiado, dónde se cae el ritmo y qué probar en la siguiente.
            </p>

            {scene.characters?.length > 1 && (
                <label className="mb-4 block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-400">Tu personaje</span>
                    <select value={personaje} onChange={e => setPersonaje(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/60 focus:outline-none">
                        {scene.characters.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </label>
            )}

            <input ref={input} type="file" accept="video/*,audio/*" className="hidden"
                onChange={e => elegir(e.target.files?.[0] ?? null)} />

            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => input.current?.click()} disabled={analizando}
                    className="rounded-full border border-zinc-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-300 disabled:opacity-50">
                    {archivo ? 'Cambiar toma' : 'Elegir toma'}
                </button>
                <button type="button" onClick={analizar} disabled={!archivo || analizando}
                    className="rounded-full bg-amber-500 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black transition hover:bg-amber-400 disabled:opacity-40">
                    {analizando ? 'Escuchándote…' : 'Pedir notas'}
                </button>
            </div>

            {archivo && !analizando && !res && (
                <p className="mt-3 text-xs text-zinc-500">{archivo.name} · {(archivo.size / 1048576).toFixed(1)} MB</p>
            )}
            {analizando && (
                <p className="mt-3 text-xs text-zinc-500">Transcribiendo y comparando con la escena. Suele tardar unos segundos.</p>
            )}
            {error && (
                <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            )}

            {res && (
                <div className="mt-6 space-y-5">
                    {res.error === 'analisis' && (
                        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{res.message}</p>
                    )}

                    {typeof res.fidelidad === 'number' && (
                        <div>
                            <div className="mb-1.5 flex items-baseline justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Fidelidad al texto</span>
                                <span className="text-sm font-black tabular-nums text-amber-300">{res.fidelidad}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${res.fidelidad}%` }} />
                            </div>
                        </div>
                    )}

                    {res.resumen && <p className="text-sm leading-relaxed text-zinc-200">{res.resumen}</p>}

                    {res.fuerte && (
                        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            <strong className="font-bold">Lo mejor: </strong>{res.fuerte}
                        </p>
                    )}

                    {!!res.notas?.length && (
                        <ul className="space-y-3">
                            {res.notas.map((n, i) => (
                                <li key={i} className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 p-4">
                                    {n.momento && <p className="mb-1 text-xs italic text-zinc-500">«{n.momento}»</p>}
                                    <p className="text-sm text-zinc-200">{n.observacion}</p>
                                    {n.sugerencia && <p className="mt-1.5 text-sm text-amber-300/90">→ {n.sugerencia}</p>}
                                </li>
                            ))}
                        </ul>
                    )}

                    {res.siguientePaso && (
                        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            <strong className="font-bold uppercase tracking-widest text-xs">En la siguiente toma: </strong>{res.siguientePaso}
                        </p>
                    )}

                    {res.transcripcion && (
                        <div>
                            <button type="button" onClick={() => setVerTexto(v => !v)}
                                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300">
                                {verTexto ? 'Ocultar' : 'Ver'} lo que he oído
                            </button>
                            {verTexto && (
                                <p className="mt-2 whitespace-pre-line rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-400">
                                    {res.transcripcion}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
