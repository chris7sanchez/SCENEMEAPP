'use client';

// Deck compartido: lo que ve quien recibe el enlace (no hace falta cuenta).
// Lleva «Denunciar»: si un titular de derechos avisa, el enlace se retira al momento.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Flag, Loader2 } from 'lucide-react';
import type { Etiquetas, Plano } from '@/lib/fotogramas';

const entrada = 'w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-amber-400 focus:outline-none';
const resumen = (e?: Etiquetas) => [e?.plano, e?.luz, e?.emocion].filter(Boolean).join(' · ');

export default function DeckCompartido() {
    const { id } = useParams<{ id: string }>();
    const [deck, setDeck] = useState<{ nombre: string; planos: Plano[] } | null>(null);
    const [error, setError] = useState(false);
    const [denunciar, setDenunciar] = useState(false);
    const [form, setForm] = useState({ nombre: '', email: '', motivo: '' });
    const [estado, setEstado] = useState<'' | 'enviando' | 'hecho' | string>('');

    useEffect(() => {
        fetch(`/api/fotogramas/deck?id=${encodeURIComponent(id)}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(setDeck)
            .catch(() => setError(true));
    }, [id]);

    const enviar = async (e: React.FormEvent) => {
        e.preventDefault();
        setEstado('enviando');
        try {
            const res = await fetch('/api/fotogramas/denuncia', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deck: id, ...form }),
            });
            const d = await res.json().catch(() => ({}));
            if (!res.ok) { setEstado(d?.message || 'No se pudo enviar. Inténtalo de nuevo.'); return; }
            setEstado('hecho'); setDeck(null); setError(true);
        } catch { setEstado('No se pudo enviar. Inténtalo de nuevo.'); }
    };

    return (
        <main className="min-h-screen bg-[#100E0B] px-4 pb-28 pt-10 text-[#F6EFE0]">
            <div className="mx-auto max-w-6xl">
                {estado === 'hecho' ? (
                    <p role="status" className="rounded-lg border border-amber-400 bg-amber-400/10 px-4 py-3">Gracias. Hemos retirado el enlace y lo revisaremos.</p>
                ) : error ? (
                    <p className="text-[#D9CFBD]">Este deck no existe o ya no se comparte.</p>
                ) : !deck ? (
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                ) : (
                    <>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-amber-400">Deck de referencias</p>
                        <h1 className="mt-2 text-4xl font-extrabold">{deck.nombre}</h1>
                        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {deck.planos.map(p => (
                                <li key={p.id} className="overflow-hidden rounded-lg bg-white/5">
                                    <img src={p.imagen} alt={p.pelicula ? `Captura de ${p.pelicula}` : 'Captura'} loading="lazy" className="aspect-video w-full object-cover" />
                                    <div className="px-3 py-2 text-sm">
                                        {p.pelicula && <p className="font-semibold">{p.pelicula} {p.anio && <span className="font-normal text-[#D9CFBD]">({p.anio})</span>}</p>}
                                        {resumen(p.etiquetas) && <p className="text-xs text-[#D9CFBD]">{resumen(p.etiquetas)}</p>}
                                        {p.nota && <p className="mt-1">{p.nota}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-12 border-t border-white/10 pt-6">
                            {!denunciar ? (
                                <button type="button" onClick={() => setDenunciar(true)} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[#D9CFBD] underline hover:text-white">
                                    <Flag className="h-4 w-4" /> Denunciar este contenido
                                </button>
                            ) : (
                                <form onSubmit={enviar} className="max-w-lg space-y-3">
                                    <p className="text-sm">Si alguna imagen es tuya o infringe derechos, cuéntanoslo. El enlace se retira al momento mientras lo revisamos.</p>
                                    <input required aria-label="Tu nombre" placeholder="Tu nombre o el de tu empresa" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={entrada} />
                                    <input required type="email" aria-label="Tu email" placeholder="Tu email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={entrada} />
                                    <textarea required minLength={10} rows={4} aria-label="Motivo" placeholder="Qué imagen y por qué" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} className={entrada} />
                                    {estado && estado !== 'enviando' && <p role="alert" className="text-sm text-amber-400">{estado}</p>}
                                    <button type="submit" disabled={estado === 'enviando'} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-amber-400 px-5 text-xs font-bold uppercase tracking-wider text-[#140F06] disabled:opacity-60">
                                        {estado === 'enviando' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar denuncia'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                )}
                <p className="mt-12 text-xs text-[#D9CFBD]">
                    Capturas subidas por quien comparte el deck, como referencia personal. Hecho con <Link href="/fotogramas" className="underline">Fotogramas de SCENE ME</Link>.
                </p>
            </div>
        </main>
    );
}
