'use client';

import { PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PhotoPackSelectorProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    className?: string;
}

const tierLabel = (id: string) => id === 'essential' ? 'Nivel 1' : id === 'complete' ? 'Nivel 2' : 'Nivel 3';

export function PhotoPackSelector({ formData, updateForm, className }: PhotoPackSelectorProps) {
    const type = formData.photoType || 'actor';
    if (type === 'event') return null;

    const packs = type === 'editorial' ? PHOTO_PACKS_EDITORIAL
        : type === 'conceptual' ? PHOTO_PACKS_CONCEPTUAL
            : PHOTO_PACKS_ACTOR;

    return (
        <div className={cn("space-y-2", className)}>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Elige tu pack <span className="text-muted-foreground font-medium normal-case tracking-normal">· edición incluida</span>
            </p>
            {packs.map((pack) => {
                const selected = formData.photoPack === pack.id;
                const recommended = pack.id === 'complete';
                return (
                    <button
                        key={pack.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updateForm({ photoPack: pack.id })}
                        className={cn(
                            "group w-full text-left rounded-xl border p-2.5 transition-all",
                            selected
                                ? "border-primary bg-primary/15 shadow-[0_0_18px_hsla(42,90%,55%,0.15)]"
                                : recommended
                                    ? "border-primary/50 bg-secondary hover:border-primary"
                                    : "border-border bg-secondary hover:border-primary/50"
                        )}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tierLabel(pack.id)}</span>
                            {recommended && <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/15 border border-primary/40 rounded-full px-1.5 py-px">Recom.</span>}
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-headline text-sm uppercase tracking-wide text-foreground leading-tight truncate">{pack.label}</h3>
                            <span className="text-xl font-display text-primary leading-none shrink-0">{pack.price}</span>
                        </div>
                        <ul className="mt-1.5 space-y-1">
                            {pack.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-tight">
                                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={cn(
                            "mt-2 w-full text-center text-[10px] font-bold uppercase tracking-wide rounded-md py-1 transition-all",
                            selected ? "bg-primary text-background" : "bg-muted text-foreground group-hover:bg-primary group-hover:text-background"
                        )}>
                            {selected ? "✓ Elegido" : "Elegir"}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
