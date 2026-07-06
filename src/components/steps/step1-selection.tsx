'use client';

import { StepCard } from "@/components/step-card";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Clapperboard, Film, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";

interface Step1SelectionProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step1Selection({ formData, updateForm, setStep }: Step1SelectionProps) {
    const footer = (
        <div className="w-full flex justify-between gap-4">
            <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setStep(0)}
                className="rounded-full px-8 border-[hsl(var(--sm-border-subtle))] hover:bg-white/5"
            >
                <ArrowLeft className="mr-2 w-4 h-4" /> Atrás
            </Button>
            <Button 
                size="lg" 
                onClick={() => setStep(2)}
                className="rounded-full px-12 bg-[hsl(var(--sm-accent))] text-[hsl(var(--sm-bg-base))] font-bold hover:scale-105 transition-transform"
            >
                Continuar <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
    );

    const SelectCard = ({ value, icon: Icon, title, description, price, badge }: { value: "one-scene" | "two-scenes", icon: any, title: string, description: string, price: string, badge?: string }) => {
        const selected = formData.packType === value;
        return (
            <div className="relative">
                <RadioGroupItem value={value} id={value} className="peer sr-only" />
                <Label
                    htmlFor={value}
                    style={{
                        backgroundColor: selected ? 'hsla(42, 90%, 55%, 0.14)' : 'hsla(220, 30%, 14%, 0.85)',
                        borderColor: selected ? 'hsl(42, 90%, 55%)' : 'hsla(220, 18%, 35%, 0.5)',
                    }}
                    className={cn(
                        "flex flex-col items-center justify-between p-6 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer h-full group",
                        selected
                            ? "shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                            : "hover:!border-primary/50 hover:!bg-primary/5"
                    )}
                >
                    {badge && (
                        <div className="absolute -top-3 -right-3 bg-primary text-black font-black text-[10px] px-3 py-1 rounded-full shadow-lg transform rotate-12 flex items-center gap-1 z-20">
                            <Star className="w-3 h-3 fill-current" /> {badge}
                        </div>
                    )}

                    <div className={cn(
                        "p-4 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110",
                        selected ? "bg-primary text-black" : "bg-white/10 text-primary"
                    )}>
                        <Icon className="w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2 mb-4">
                        <p className={cn(
                            "font-display font-black text-xl uppercase tracking-tight italic transition-colors",
                            selected ? "text-white" : "text-zinc-200"
                        )}>
                            {title}
                        </p>
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest leading-tight px-2">
                            {description}
                        </p>
                    </div>

                    <div className="text-3xl font-black text-primary italic tracking-tighter">{price}</div>

                    {selected && (
                        <div className="absolute top-4 left-4">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                    )}
                </Label>
            </div>
        );
    };

    return (
        <StepCard
            title="SELECCIÓN"
            description="Escoge el formato de tu próxima visión cinematográfica."
            footerContent={footer}
        >
            <div className="space-y-8">
                <RadioGroup
                    value={formData.packType || ""}
                    onValueChange={(val: any) => updateForm({ packType: val })}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <SelectCard
                        value="one-scene"
                        icon={Clapperboard}
                        title="1 ESCENA"
                        price="499€"
                        description="Calidad cine digital, 2 opciones de guion, dirección profesional."
                    />
                    <SelectCard
                        value="two-scenes"
                        icon={Film}
                        title="2 ESCENAS"
                        price="699€"
                        badge="BEST VALUE"
                        description="Doble impacto, más guiones, asesoramiento integral y dirección."
                    />
                </RadioGroup>

                <div
                    style={{ backgroundColor: 'hsla(220, 30%, 14%, 0.6)', borderColor: 'hsla(220, 18%, 35%, 0.5)' }}
                    className="border rounded-2xl p-6 flex items-start space-x-4 transition-all hover:!bg-primary/5 hover:!border-primary/40"
                >
                    <Checkbox
                        id="editing"
                        checked={formData.addEditing}
                        onCheckedChange={(checked) => updateForm({ addEditing: !!checked })}
                        className="mt-1 border-zinc-500 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                    />
                    <div className="space-y-1">
                        <Label htmlFor="editing" className="font-bold text-base cursor-pointer text-white">
                            ¿Quieres recibir tu escena lista para enviar?
                        </Label>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                            Añade <span className="text-primary font-black">EDICIÓN Y ETALONAJE</span> profesional por solo un <span className="font-bold text-white">10% adicional</span>.
                        </p>
                    </div>
                </div>
            </div>
        </StepCard>
    );
}
