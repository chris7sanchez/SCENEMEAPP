'use client';

// Selector de packs estilo app: filas compactas (nombre + precio) y el detalle
// de lo que incluye se abre en una hoja inferior al tocar — nada de listas de
// características expuestas de golpe.

import { useState } from "react";
import { createPortal } from "react-dom";
import { PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, X } from "lucide-react";

interface PhotoPackSelectorProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    className?: string;
}

type Pack = { id: string; label: string; price: string; features: string[] };

export function PhotoPackSelector({ formData, updateForm, className }: PhotoPackSelectorProps) {
    const [detailPack, setDetailPack] = useState<Pack | null>(null);
    const type = formData.photoType || 'actor';
    if (type === 'event') return null;

    const packs: Pack[] = type === 'editorial' ? PHOTO_PACKS_EDITORIAL
        : type === 'conceptual' ? PHOTO_PACKS_CONCEPTUAL
            : PHOTO_PACKS_ACTOR;

    const choose = (id: string) => {
        updateForm({ photoPack: id });
        setDetailPack(null);
    };

    return (
        <div className={cn("space-y-2", className)}>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Elige tu pack <span className="text-muted-foreground font-medium normal-case tracking-normal">· toca para ver detalles</span>
            </p>

            {/* FILAS COMPACTAS */}
            {packs.map((pack) => {
                const selected = formData.photoPack === pack.id;
                const recommended = pack.id === 'complete';
                return (
                    <button
                        key={pack.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDetailPack(pack)}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.98]",
                            selected
                                ? "border-primary bg-primary/15 shadow-[0_0_18px_hsla(42,90%,55%,0.15)]"
                                : recommended
                                    ? "border-primary/50 bg-secondary"
                                    : "border-border bg-secondary"
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all",
                            selected ? "bg-primary border-primary" : "border-muted-foreground/40"
                        )}>
                            {selected && <Check className="w-3.5 h-3.5 text-background" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-headline text-sm uppercase tracking-wide text-foreground leading-tight truncate">{pack.label}</div>
                            {recommended && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Recomendado</span>
                            )}
                        </div>
                        <span className="text-xl font-display text-primary leading-none shrink-0">{pack.price}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                );
            })}

            {/* HOJA DE DETALLE (bottom sheet) — por portal al body: así queda por
                encima de la barra de pestañas y fuera de cualquier stacking context */}
            {detailPack && createPortal(
                <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label={`Detalles del pack ${detailPack.label}`}>
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setDetailPack(null)}
                    />
                    <div className="absolute bottom-0 inset-x-0 animate-in slide-in-from-bottom duration-300">
                        <div className="mx-auto max-w-md rounded-t-3xl border border-b-0 border-primary/30 px-6 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.6)]" style={{ backgroundColor: '#10141d' }}>
                            <div className="mx-auto w-10 h-1 rounded-full bg-white/20 mb-4" />
                            <div className="flex items-start justify-between gap-4 mb-1">
                                <h3 className="font-headline text-xl uppercase tracking-wide text-foreground leading-tight">{detailPack.label}</h3>
                                <button
                                    type="button"
                                    onClick={() => setDetailPack(null)}
                                    aria-label="Cerrar"
                                    className="p-1.5 rounded-full bg-white/5 text-zinc-300 hover:text-white transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-3xl font-display text-primary mb-5">{detailPack.price}</div>

                            <ul className="space-y-2.5 mb-7">
                                {detailPack.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90 leading-snug">
                                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                                <li className="flex items-start gap-2.5 text-sm text-foreground/90 leading-snug">
                                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span>Edición incluida</span>
                                </li>
                            </ul>

                            <button
                                type="button"
                                onClick={() => choose(detailPack.id)}
                                className="w-full rounded-2xl bg-primary text-background font-black uppercase tracking-[0.2em] text-sm py-4 active:scale-[0.98] transition-transform"
                            >
                                {formData.photoPack === detailPack.id ? '✓ Pack elegido' : 'Elegir este pack'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
