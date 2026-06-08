'use client';

import { useState } from "react";
import { PHOTO_TYPES, PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL, PHOTO_GALLERY } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Camera, User, Sparkles, Mail, Check } from "lucide-react";
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

const TYPE_INTRO: Record<string, string> = {
    actor: "Tu material esencial para castings y agencias: fotos naturales que muestran quién eres, listas para presentarte al mercado profesional.",
    editorial: "Moda, estilo y actitud. Imágenes de alto impacto para elevar tu marca personal y destacar en redes y portafolios.",
    conceptual: "Creatividad sin límites: escenografía, luz e historia para conseguir una imagen icónica y diferente.",
};

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
    const tierLabel = (id: string) => id === 'essential' ? 'Nivel 1' : id === 'complete' ? 'Nivel 2' : 'Nivel 3';

    return (
        <div className="animate-in fade-in duration-500 w-full max-w-6xl mx-auto flex flex-col">

            {/* HEADER */}
            <div className="mb-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-1 md:gap-6">
                    <h1 className="font-headline text-2xl md:text-3xl uppercase tracking-tight text-foreground leading-none shrink-0">
                        Elige tu sesión de fotos
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-right md:max-w-md leading-snug">
                        <span className="block">Material profesional para casting, agencias y tu marca como actor.</span>
                        <span className="block">Empieza eligiendo el tipo de sesión.</span>
                    </p>
                </div>
                <div className="w-full h-px bg-border/60 mt-3" />
            </div>

            {/* TYPE SELECTOR */}
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
                                "flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-all",
                                active
                                    ? "border-primary bg-primary/15"
                                    : "border-border bg-secondary hover:border-primary/50 hover:bg-primary/5"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
                            <div className="font-bold text-sm text-foreground leading-tight">{type.label}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{type.desc}</div>
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
                <div className="space-y-5">
                    {/* INTRO */}
                    <div>
                        <h2 className="font-headline text-xl uppercase tracking-wide text-foreground mb-1">
                            {currentTypeData?.label}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-snug max-w-3xl">
                            {TYPE_INTRO[selectedType] || TYPE_INTRO.actor}
                        </p>
                    </div>

                    {/* PACKS — solo móvil; en escritorio van bajo el stepper */}
                    <PhotoPackSelector formData={formData} updateForm={updateForm} className="md:hidden" />

                    {/* EXAMPLES (grandes) */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Ejemplos de este tipo de book</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {getSamples(selectedType).slice(0, 6).map((item: { src: string }, i: number) => (
                                <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border bg-secondary">
                                    <Image src={item.src} alt={`Ejemplo ${i + 1}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
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
