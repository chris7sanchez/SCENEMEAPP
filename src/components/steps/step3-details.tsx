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
    <div className="space-y-8 pt-4">
        {title && (
            <div className="flex items-center gap-4 pb-2 border-b border-white/10">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-lg">
                    {sceneIndex + 1}
                </div>
                <h3 className="font-display text-2xl text-primary uppercase tracking-wider">{title}</h3>
            </div>
        )}

        {/* TONES SECTION */}
        <div>
            <div className="flex justify-between items-end mb-3">
                <Label className="font-headline text-2xl uppercase tracking-wide">Tono/s</Label>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">Máximo 3</span>
            </div>
            <TagGrid
                options={TONES}
                value={data.tones}
                onChange={(tones) => {
                    // Limit to 3 items
                    if (Array.isArray(tones) && tones.length > 3) return;
                    onUpdate(sceneIndex, { tones });
                }}
                multi
            />
        </div>

        {/* LOCATION SECTION */}
        <div>
            <div className="flex justify-between items-end mb-3">
                <Label className="font-headline text-2xl uppercase tracking-wide">Ubicación</Label>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">Selecciona 1</span>
            </div>
            <TagGrid
                options={LOCATIONS}
                value={data.locations[0] || ""}
                onChange={(location) => onUpdate(sceneIndex, { locations: [location] })}
                multi={false}
            />
        </div>

        {/* OTHER DETAILS / CUSTOM LOCATION */}
        <div>
            <Label className="mb-3 font-headline text-xl uppercase tracking-wide block text-white/80">
                Otros Lugares / Notas
            </Label>
            <Textarea
                placeholder="Si tu ubicación no aparece arriba, descríbela aquí..."
                className="w-full h-24 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-base focus:border-primary/50 transition-all resize-none placeholder:text-white/20"
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
            description="Define el ambiente y localización de tu rodaje."
            footerContent={footer}
        >
            <div className="space-y-12">
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
                <div className="pt-8 border-t border-white/10">
                    <Label className="mb-4 font-headline text-2xl uppercase tracking-wide block">
                        Duración Estimada de la Sesión
                    </Label>
                    <TagGrid
                        options={LENGTHS}
                        value={formData.length}
                        onChange={(length) => updateForm({ length })}
                    />
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-3 px-1">
                        * Tiempos aproximados incluyendo preparación.
                    </p>
                </div>
            </div>        </StepCard>
    );
}
