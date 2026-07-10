'use client';

import { useState } from "react";
import { PHOTO_TYPES, PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL, PHOTO_GALLERY } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Camera, User, Sparkles, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PhotoPackSelector } from "@/components/photo-pack-selector";

interface Step1PhotoSelectionProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
    setFlowType: (type: 'scene' | 'photo') => void;
}

const TYPE_ICON: Record<string, any> = { actor: User, editorial: Camera, conceptual: Sparkles, event: Mail };

export default function Step1PhotoSelection({ formData, updateForm, setStep, setFlowType }: Step1PhotoSelectionProps) {
    const [selectedType, setSelectedType] = useState<string>(formData.photoType || 'actor');

    const handleSelectType = (id: string) => {
        setSelectedType(id);
        if (id === 'event') {
            updateForm({ serviceType: 'photo', photoType: 'event' });
        } else {
            updateForm({ photoType: id as any, serviceType: 'photo' });
        }
    };

    const handleSelectPack = (packId: string) => updateForm({ photoPack: packId });

    const handleContinue = () => {
        if (selectedType === 'event') {
            window.location.href = "mailto:contacto@sceneme.com?subject=Consulta%20Personalizada";
            return;
        }
        setStep(2); // Go to Dates
    };

    const currentPacks = selectedType === 'editorial' ? PHOTO_PACKS_EDITORIAL :
        selectedType === 'conceptual' ? PHOTO_PACKS_CONCEPTUAL :
            PHOTO_PACKS_ACTOR;

    const currentTypeData = PHOTO_TYPES.find(t => t.id === selectedType);
    const getSamples = (type: string) => (PHOTO_GALLERY as any)[type] || PHOTO_GALLERY.default;

    return (
        <div className="animate-in fade-in duration-500 w-full max-w-6xl mx-auto flex flex-col">

            {/* HEADER — mínimo: título y fuera */}
            <div className="mb-4">
                <h1 className="font-headline text-2xl md:text-3xl uppercase tracking-tight text-foreground leading-none">
                    Elige tu sesión de fotos
                </h1>
                <div className="w-full h-px bg-border/60 mt-3" />
            </div>

            {/* TYPE SELECTOR — chips compactos, sin párrafos en móvil */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
                {PHOTO_TYPES.map((type) => {
                    const Icon = TYPE_ICON[type.id] || Camera;
                    const active = selectedType === type.id;
                    return (
                        <button
                            key={type.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => handleSelectType(type.id)}
                            className={cn(
                                "flex items-center md:items-start md:flex-col gap-2 md:gap-1.5 rounded-2xl border p-3 text-left transition-all active:scale-[0.98]",
                                active
                                    ? "border-primary bg-primary/15"
                                    : "border-border bg-secondary hover:border-primary/50 hover:bg-primary/5"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                            <div className="font-bold text-sm text-foreground leading-tight">{type.label}</div>
                            <div className="hidden md:block text-xs text-muted-foreground line-clamp-2">{type.desc}</div>
                        </button>
                    );
                })}
            </div>

            {selectedType === 'event' ? (
                /* ON-REQUEST / A MEDIDA */
                <div className="rounded-3xl border border-border bg-secondary p-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center mb-6">
                        <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-headline text-2xl uppercase tracking-wide text-foreground mb-2">Sesiones a medida</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        ¿Tienes una idea distinta? Eventos, campañas de marca o proyectos especiales. Cuéntanoslo y la diseñamos contigo.
                    </p>
                    <Button size="lg" onClick={handleContinue}>
                        Contactar <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 1º EJEMPLOS — justo después del tipo, en carrusel deslizable */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Así se ve un {currentTypeData?.label}
                        </p>
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {getSamples(selectedType).map((item: { src: string }, i: number) => (
                                <div key={i} className="relative snap-start shrink-0 w-44 md:w-52 aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-secondary">
                                    <Image src={item.src} alt={`Ejemplo ${i + 1} de ${currentTypeData?.label}`} fill sizes="208px" className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2º PACKS — filas compactas; el detalle se abre al tocar */}
                    <PhotoPackSelector formData={formData} updateForm={updateForm} className="md:hidden" />
                </div>
            )}

            {/* FOOTER */}
            <div className="mt-6 flex justify-between items-center gap-4">
                <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Atrás
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={selectedType !== 'event' && !formData.photoPack}
                    className="disabled:opacity-40"
                >
                    {selectedType === 'event' ? 'Enviar consulta' : 'Reservar fechas'} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
