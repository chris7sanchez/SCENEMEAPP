'use client';

import { StepCard } from "@/components/step-card";
import { TagGrid } from "@/components/tag-grid";
import { TONES, LOCATIONS, LENGTHS } from "@/lib/data";
import { type FormData, type SceneData } from "@/lib/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface Step3DetailsProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

const DetailsForm = ({
    sceneIndex,
    data,
    title,
    onUpdate
}: {
    sceneIndex: 0 | 1,
    data: SceneData,
    title?: string,
    onUpdate: (sceneIndex: 0 | 1, data: Partial<SceneData>) => void
}) => (
    <div className="space-y-4 pt-1">
        {title && (
            <div className="flex items-center gap-4 pb-2 border-b border-border">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-background font-bold text-lg">
                    {sceneIndex + 1}
                </div>
                <h3 className="font-headline text-xl text-primary uppercase tracking-wider">{title}</h3>
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        {/* TONES SECTION */}
        <div>
            <div className="flex items-baseline justify-between mb-1">
                <Label className="font-headline text-base uppercase tracking-wide text-foreground">Tono</Label>
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider">Hasta 3</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">¿Qué atmósfera quieres? Elige hasta tres.</p>
            <TagGrid
                options={TONES}
                value={data.tones}
                onChange={(tones) => {
                    if (Array.isArray(tones) && tones.length > 3) return;
                    onUpdate(sceneIndex, { tones });
                }}
                multi
            />
        </div>

        {/* LOCATION SECTION */}
        <div>
            <div className="flex items-baseline justify-between mb-1">
                <Label className="font-headline text-base uppercase tracking-wide text-foreground">Ubicación</Label>
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider">Elige 1</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">¿Dónde transcurre la escena? Selecciona el espacio principal.</p>
            <TagGrid
                options={LOCATIONS}
                value={data.locations[0] || ""}
                onChange={(location) => onUpdate(sceneIndex, { locations: [location] })}
                multi={false}
            />
        </div>

        </div>
        {/* OTHER DETAILS / CUSTOM LOCATION */}
        <div>
            <Label className="font-headline text-base uppercase tracking-wide text-foreground block mb-1">
                Otros lugares / notas
            </Label>
            <p className="text-xs text-muted-foreground mb-2">¿Tu ubicación no está arriba? Descríbela aquí. (Opcional)</p>
            <Textarea
                placeholder="Ej.: terraza de un ático al atardecer…"
                className="w-full h-16 bg-secondary border border-border rounded-xl p-3 text-base text-foreground focus:border-primary/50 transition-all resize-none placeholder:text-muted-foreground"
                value={data.otherDetails || ""}
                onChange={(e) => onUpdate(sceneIndex, { otherDetails: e.target.value })}
            />
        </div>
    </div>
);

export default function Step3Details({ formData, updateForm, setStep }: Step3DetailsProps) {
    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button size="lg" onClick={() => setStep(5)}>
                Continuar <ArrowRight className="ml-2" />
            </Button>
        </div>
    );

    const updateScene = (sceneIndex: 0 | 1, data: Partial<SceneData>) => {
        if (sceneIndex === 0) {
            updateForm(data);
        } else {
            updateForm({
                scene2: { ...formData.scene2, ...data }
            });
        }
    };

    return (
        <StepCard
            title="Detalles de la escena"
            description="Define el tono, dónde rodáis y cuánto dura la sesión."
            footerContent={footer}
            plainTitle
        >
            <div className="space-y-5">
                <DetailsForm
                    sceneIndex={0}
                    data={formData}
                    title={formData.packType === "two-scenes" ? "Tu 1ª Escena" : undefined}
                    onUpdate={updateScene}
                />

                {formData.packType === "two-scenes" && (
                    <DetailsForm
                        sceneIndex={1}
                        data={formData.scene2}
                        title="Tu 2ª Escena"
                        onUpdate={updateScene}
                    />
                )}

                {/* Global Length Selection */}
                <div className="pt-4 border-t border-border">
                    <Label className="font-headline text-base uppercase tracking-wide text-foreground block mb-1">
                        Duración de la sesión
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">¿Cuánto tiempo reservamos? Incluye la preparación.</p>
                    <TagGrid
                        options={LENGTHS}
                        value={formData.length}
                        onChange={(length) => updateForm({ length })}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Tiempos aproximados.</p>
                </div>
            </div>        </StepCard>
    );
}
