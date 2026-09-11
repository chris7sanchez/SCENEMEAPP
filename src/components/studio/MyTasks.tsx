'use client';

import React, { useEffect, useRef, useState } from 'react';
import { listMySubmissions, uploadSubmission, type Submission } from '@/lib/studio-db';
import { misPublicaciones, publicar, retirar, nombreParaFirmar } from '@/lib/comunidad-db';

export default function MyTasks({ uid, dateKey }: { uid: string; dateKey: string }) {
    const [items, setItems] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    /** submissionId -> id de su publicación en la Sala. Lo que no esté aquí, es privado. */
    const [publicadas, setPublicadas] = useState<Record<string, string>>({});
    const [moviendo, setMoviendo] = useState<string | null>(null);

    const refrescarPublicadas = async () => {
        try {
            const mias = await misPublicaciones(uid);
            const mapa: Record<string, string> = {};
            mias.forEach(p => { if (p.submissionId) mapa[p.submissionId] = p.id; });
            setPublicadas(mapa);
        } catch (e) {
            console.warn('[comunidad] no se pudo saber qué está publicado:', e);
        }
    };

    const refresh = async () => {
        setLoading(true);
        setItems(await listMySubmissions(uid));
        setLoading(false);
        refrescarPublicadas();
    };

    /**
     * Compartir es SIEMPRE un acto explícito: nada sale del cajón privado si el
     * actor no pulsa aquí, y se puede retirar en cualquier momento.
     */
    const alternarSala = async (it: Submission) => {
        if (!it.id) return;
        const id = it.id;
        setError('');
        try {
            const yaEsta = publicadas[id];
            if (yaEsta) {
                if (!confirm('¿Retirar tu vídeo de la Sala? Tu toma NO se borra: sigue aquí.')) return;
                setMoviendo(id);
                await retirar(yaEsta);
                setPublicadas(p => { const n = { ...p }; delete n[id]; return n; });
            } else {
                if (!confirm('Se verá en la Sala de visionado, con tu nombre, para los actores con cuenta. ¿Lo compartes?')) return;
                setMoviendo(id);
                const { auth } = await import('@/lib/auth');
                const u = await auth.getCurrentUser();
                const nuevo = await publicar({
                    uid,
                    autor: nombreParaFirmar(u?.profile),
                    fecha: it.date,
                    titulo: it.title,
                    downloadURL: it.downloadURL,
                    submissionId: id,
                });
                setPublicadas(p => ({ ...p, [id]: nuevo }));
            }
        } catch (e) {
            console.error(e);
            setError('No se pudo cambiar la visibilidad. Inténtalo otra vez.');
        } finally {
            setMoviendo(null);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid]);

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError('Sube un archivo de vídeo.');
            return;
        }
        setError('');
        setUploading(true);
        try {
            const title = `Toma del ${dateKey}`;
            await uploadSubmission(uid, dateKey, file, title);
            await refresh();
        } catch (err: any) {
            setError('No se pudo subir el vídeo. Revisa que Firebase Storage esté activo.');
            console.error(err);
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                        <span className="mr-2 rounded-full border border-zinc-600 bg-white/5 px-2 py-0.5 text-[10px] font-black text-zinc-300">3</span>
                        Mis tareas
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Tus grabaciones 📹</h2>
                </div>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                >
                    {uploading ? 'Subiendo…' : 'SUBIR MI TOMA'}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    capture="user"
                    className="hidden"
                    onChange={onFile}
                />
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-5">
                {loading ? (
                    <p className="text-sm text-zinc-500">Cargando…</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        Aún no has subido nada. Graba la escena de hoy y sube tu toma para guardarla y revisarla.
                    </p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {items.map((it) => (
                            <li key={it.id} className="rounded-xl border border-zinc-700/60 bg-black/40 p-3">
                                <video src={it.downloadURL} controls className="w-full rounded-lg" />
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm text-zinc-200">{it.title}</span>
                                    <span className="text-xs text-zinc-500">{it.date}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${it.id && publicadas[it.id] ? 'text-amber-400/80' : 'text-zinc-600'}`}>
                                        {it.id && publicadas[it.id] ? '● En la Sala' : '○ Solo tú lo ves'}
                                    </span>
                                    <button
                                        onClick={() => alternarSala(it)}
                                        disabled={moviendo === it.id}
                                        className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-amber-400/40 hover:text-white disabled:opacity-50"
                                    >
                                        {moviendo === it.id ? '…' : it.id && publicadas[it.id] ? 'Retirar' : 'Compartir en la Sala'}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
