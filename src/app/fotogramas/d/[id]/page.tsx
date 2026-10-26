'use client';

// Deck compartido: lo que ve quien recibe el enlace (no hace falta cuenta).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { urlImagen, type Plano } from '@/lib/fotogramas';

export default function DeckCompartido() {
    const { id } = useParams<{ id: string }>();
    const [deck, setDeck] = useState<{ nombre: string; planos: Plano[] } | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`/api/fotogramas/deck?id=${encodeURIComponent(id)}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(setDeck)
            .catch(() => setError(true));
    }, [id]);

    return (
        <main className="min-h-screen bg-[#100E0B] px-4 py-10 text-[#F6EFE0]">
            <div className="mx-auto max-w-6xl">
                {error ? (
                    <p className="text-[#D9CFBD]">Este deck no existe o ya no se comparte.</p>
                ) : !deck ? (
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                ) : (
                    <>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-amber-400">Deck de referencias</p>
                        <h1 className="mt-2 text-4xl font-extrabold">{deck.nombre}</h1>
                        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {deck.planos.map(p => (
                                <li key={p.peliculaId + p.ruta} className="overflow-hidden rounded-lg bg-white/5">
                                    <img src={urlImagen(p.ruta, 'w1280')} alt={`Plano de ${p.titulo}`} loading="lazy" className="aspect-video w-full object-cover" />
                                    <p className="px-3 py-2 text-sm text-[#F6EFE0]">{p.titulo} {p.anio && <span className="text-[#D9CFBD]">({p.anio})</span>}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <p className="mt-12 text-xs text-[#D9CFBD]">
                    Imágenes de <a className="underline" href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a>. Hecho con <Link href="/fotogramas" className="underline">Fotogramas de SCENE ME</Link>.
                </p>
            </div>
        </main>
    );
}
