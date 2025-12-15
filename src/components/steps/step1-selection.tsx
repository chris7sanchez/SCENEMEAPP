'use client';

import { StepCard } from "@/components/step-card";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface Step1SelectionProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step1Selection({ formData, updateForm, setStep }: Step1SelectionProps) {
    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button size="lg" onClick={() => setStep(2)}>
                Continuar <ArrowRight className="ml-2" />
            </Button>
        </div>
    );

    const SelectCard = ({ type, price, title, description, badge }: { type: "one-scene" | "two-scenes", price: string, title: string, description: string, badge?: string }) => (
        <div
            className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:border-primary/50",
                formData.packType === type ? "border-primary bg-primary/5" : "border-border bg-card"
            )}
            onClick={() => updateForm({ packType: type })}
        >
            {badge && (
                <div className="absolute -top-3 -right-3 bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg transform rotate-12 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {badge}
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-display text-xl">{title}</h3>
                <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center",
                    formData.packType === type ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                )}>
                    {formData.packType === type && <Check className="w-4 h-4" />}
                </div>
            </div>
            <div className="text-3xl font-bold mb-4 text-primary">{price}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );

    return (
        <StepCard
            title="SELÅCCIÓN"
            description="Elige el pack que mejor se adapte a tus necesidades."
            footerContent={footer}
        >
            <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <SelectCard
                        type="one-scene"
                        title="1 ESCENA PROFESIONAL"
                        price="499€"
                        description="Calidad cine digital [cámara Blackmagic 6K Pro / sonido profesional / iluminación] + 2 opciones de guion personalizado + asesoramiento + dirección."
                    />
                    <SelectCard
                        type="two-scenes"
                        title="PACK 2 ESCENAS"
                        price="699€"
                        badge="AHORRA 30%"
                        description="Calidad cine digital [cámara Blackmagic 6K Pro / sonido profesional / iluminación] + 2 opciones de guion personalizado por escena + asesoramiento + dirección."
                    />
                </div>

                <div className="bg-muted/20 border rounded-lg p-6 flex items-start space-x-4">
                    <Checkbox
                        id="editing"
                        checked={formData.addEditing}
                        onCheckedChange={(checked) => updateForm({ addEditing: !!checked })}
                        className="mt-1"
                    />
                    <div className="space-y-1">
                        <Label htmlFor="editing" className="font-bold text-base cursor-pointer">
                            ¿Quieres recibir tu escena lista para enviar?
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Añadir <strong>EDICIÓN Y ETALONAJE</strong> por solo un <strong>10% más</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </StepCard>
    );
}
