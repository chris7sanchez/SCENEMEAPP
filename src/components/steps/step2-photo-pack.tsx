'use client';

import { StepCard } from "@/components/step-card";
import { PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2PhotoPackProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step2PhotoPack({ formData, updateForm, setStep }: Step2PhotoPackProps) {
    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button size="lg" onClick={() => setStep(3)} disabled={!formData.photoPack}>
                Continuar <ArrowRight className="ml-2" />
            </Button>
        </div>
    );

    const getPackInfo = () => {
        switch (formData.photoType) {
            case 'editorial': return { packs: PHOTO_PACKS_EDITORIAL, title: "Estilo Editorial" };
            case 'conceptual': return { packs: PHOTO_PACKS_CONCEPTUAL, title: "Estilo Conceptual" };
            default: return { packs: PHOTO_PACKS_ACTOR, title: "Elige tu Pack Actoral" };
        }
    };

    const { packs, title } = getPackInfo();

    const SelectCard = ({ pack }: { pack: any }) => (
        <div
            className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:border-primary/50 flex flex-col h-full group",
                formData.photoPack === pack.id ? "border-primary bg-primary/5" : "border-zinc-800 bg-zinc-950/30"
            )}
            onClick={() => updateForm({ photoPack: pack.id })}
        >
            {pack.id === 'complete' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold text-[10px] px-3 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Más Popular
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <h3 className="font-display text-xl text-white group-hover:text-primary transition-colors">{pack.label}</h3>
                <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                    formData.photoPack === pack.id ? "bg-primary border-primary text-black" : "border-zinc-700"
                )}>
                    {formData.photoPack === pack.id && <Check className="w-4 h-4" />}
                </div>
            </div>

            <div className="text-3xl font-black mb-6 text-primary tracking-tighter">{pack.price}</div>

            <ul className="space-y-3 mb-8 flex-1">
                {pack.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                className={cn(
                    "w-full font-bold tracking-widest h-12 transition-all",
                    formData.photoPack === pack.id
                        ? "bg-primary text-black hover:bg-primary/90"
                        : "bg-zinc-800 text-white hover:bg-zinc-700"
                )}
            >
                {formData.photoPack === pack.id ? "SELECCIONADO" : "SELECCIONAR"}
            </Button>
        </div>
    );

    return (
        <StepCard
            title={title.toUpperCase()}
            description="Selecciona la opción que mejor se adapta a tus objetivos profesionales."
            footerContent={footer}
        >
            <div className="grid md:grid-cols-3 gap-6 pt-4">
                {packs.map((pack) => (
                    <SelectCard key={pack.id} pack={pack} />
                ))}
            </div>
        </StepCard>
    );
}
