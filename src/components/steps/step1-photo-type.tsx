'use client';

import { StepCard } from "@/components/step-card";
import { PHOTO_TYPES } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Camera, User, Sparkles, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1PhotoTypeProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
    setFlowType: (type: 'scene' | 'photo') => void; // To go back
}

export default function Step1PhotoType({ formData, updateForm, setStep, setFlowType }: Step1PhotoTypeProps) {
    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => { setStep(0); }}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            {/* "Continuar" is disabled if no type selected, or hidden if handled by click */}
        </div>
    );

    const handleSelect = (typeId: string) => {
        if (typeId === 'event') {
            // Special handling for events? Or just select it and show info?
            // User requested email redirection or info
            window.location.href = "mailto:contacto@sceneme.com?subject=Consulta%20Evento%20Personalizado";
            return;
        }

        updateForm({ photoType: typeId as any });
        setStep(2); // Go to Pack Selection
    };

    const SelectCard = ({ id, label, desc, icon: Icon }: { id: string, label: string, desc: string, icon: any }) => (
        <div
            className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:border-primary/50 group h-full flex flex-col items-center text-center gap-4",
                formData.photoType === id ? "border-primary bg-primary/5" : "border-zinc-800 bg-zinc-950/30"
            )}
            onClick={() => handleSelect(id)}
        >
            <div className={cn(
                "p-4 rounded-full transition-transform group-hover:scale-110",
                formData.photoType === id ? "bg-primary text-black" : "bg-zinc-900 text-zinc-400"
            )}>
                <Icon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
                <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors uppercase tracking-tighter">{label}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>

            <div className={cn(
                "absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center",
                formData.photoType === id ? "bg-primary border-primary text-primary-foreground" : "border-zinc-800"
            )}>
                {formData.photoType === id && <Check className="w-4 h-4" />}
            </div>

            {id === 'event' && (
                <div className="mt-auto pt-2">
                    <span className="text-[10px] font-bold text-primary flex items-center justify-center gap-2 uppercase tracking-widest">
                        <Mail className="w-3 h-3" /> Contactar
                    </span>
                </div>
            )}
        </div>
    );

    return (
        <StepCard
            title="SÅLECCIÓN DE BOOK"
            description="Elige la categoría que mejor encaja con lo que buscas."
            footerContent={footer}
        >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {PHOTO_TYPES.map((type) => {
                    const Icon = type.id === 'actor' ? User :
                        type.id === 'editorial' ? Camera :
                            type.id === 'conceptual' ? Sparkles : Mail;
                    return (
                        <SelectCard
                            key={type.id}
                            id={type.id}
                            label={type.label}
                            desc={type.desc}
                            icon={Icon}
                        />
                    );
                })}
            </div>
        </StepCard>
    );
}
