import { useState } from "react";
import { StepCard } from "@/components/step-card";
import { type FormData, type SceneData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { generateScriptAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface Step5ScriptProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
    userEmail?: string;
    userName?: string;
}

const ScriptForm = ({
    sceneIndex,
    data,
    onUpdate
}: {
    sceneIndex: 0 | 1,
    data: SceneData,
    onUpdate: (sceneIndex: 0 | 1, data: Partial<SceneData>) => void
}) => (
    <div className="space-y-6 pt-4">
        <div className="bg-muted/30 p-6 rounded-lg border border-primary/20">
            <h3 className="font-display text-xl mb-2 text-primary">¿Cómo funciona?</h3>
            <p className="text-muted-foreground font-sans">
                Nuestra IA analizará tus requisitos y generará un guion profesional al instante. Te lo enviaremos por email y podrás verlo en el siguiente paso.
            </p>
        </div>

        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-accent/10">
            <Checkbox
                id={`surprise-${sceneIndex}`}
                checked={data.surpriseMe}
                onCheckedChange={(checked) => onUpdate(sceneIndex, { surpriseMe: !!checked })}
            />
            <Label htmlFor={`surprise-${sceneIndex}`} className="font-subheadline text-xl cursor-pointer pt-1">
                ¡SORPRÉNDEME! (Libertad total creativa)
            </Label>
        </div>

        {data.surpriseMe ? (
            <div className="space-y-6 border-l-2 border-primary pl-4 animate-in slide-in-from-left-2 duration-300">
                <div className="space-y-2">
                    <Label className="font-subheadline text-xl">1. Una palabra que te defina</Label>
                    <Input
                        placeholder="Ej: Resiliencia, Caos, Misterio..."
                        value={data.surpriseData?.word || ""}
                        onChange={(e) => onUpdate(sceneIndex, {
                            surpriseData: { ...data.surpriseData, word: e.target.value }
                        })}
                        className="font-sans"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-subheadline text-xl">2. Tu película favorita</Label>
                    <Input
                        placeholder="Ej: El Padrino, La La Land, Matrix..."
                        value={data.surpriseData?.movie || ""}
                        onChange={(e) => onUpdate(sceneIndex, {
                            surpriseData: { ...data.surpriseData, movie: e.target.value }
                        })}
                        className="font-sans"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-subheadline text-xl">3. ¿Cómo te consideras?</Label>
                    <RadioGroup
                        value={data.surpriseData?.personality || ""}
                        onValueChange={(val: "impulsive" | "adaptive") => onUpdate(sceneIndex, {
                            surpriseData: { ...data.surpriseData, personality: val }
                        })}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="impulsive" id={`impulsive-${sceneIndex}`} />
                            <Label htmlFor={`impulsive-${sceneIndex}`} className="font-sans">Me considero impulsivo/a y líder</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="adaptive" id={`adaptive-${sceneIndex}`} />
                            <Label htmlFor={`adaptive-${sceneIndex}`} className="font-sans">Fluyo con la vida y me adapto</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        ) : (
            <div className="grid md:grid-cols-1 gap-6">
                <div className="space-y-2">
                    <Label htmlFor={`logline-${sceneIndex}`} className="font-subheadline text-2xl">Premisa / Objetivo del Actor</Label>
                    <p className="text-sm text-muted-foreground font-sans">Describe brevemente la situación, el conflicto o lo que quieres transmitir.</p>
                    <Textarea
                        id={`logline-${sceneIndex}`}
                        className="w-full rounded-lg p-3 min-h-[120px] font-sans"
                        placeholder="Ej: Quiero una escena dramática donde mi personaje descubre una traición..."
                        value={data.logline}
                        onChange={(e) => onUpdate(sceneIndex, { logline: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`props-${sceneIndex}`} className="font-subheadline text-2xl">Atrezo / Objetos Clave</Label>
                    <Textarea
                        id={`props-${sceneIndex}`}
                        className="w-full rounded-lg p-3 font-sans"
                        rows={3}
                        placeholder="Ej: Un anillo de compromiso, una carta manuscrita..."
                        value={data.props}
                        onChange={(e) => onUpdate(sceneIndex, { props: e.target.value })}
                    />
                </div>
            </div>
        )}
    </div>
);

export default function Step5Script({ formData, updateForm, setStep, userEmail, userName }: Step5ScriptProps) {

    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button
                size="lg"
                onClick={() => setStep(6)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
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
            title="Briefing del Guion"
            description="Cuéntanos tu idea. Nuestro equipo de guionistas trabajará en tu propuesta basándose en estos detalles."
            footerContent={footer}
        >
            {formData.packType === "two-scenes" ? (
                <Tabs defaultValue="scene1" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="scene1">Tu 1ª Escena</TabsTrigger>
                        <TabsTrigger value="scene2">Tu 2ª Escena</TabsTrigger>
                    </TabsList>
                    <TabsContent value="scene1">
                        <ScriptForm sceneIndex={0} data={formData} onUpdate={updateScene} />
                    </TabsContent>
                    <TabsContent value="scene2">
                        <ScriptForm sceneIndex={1} data={formData.scene2} onUpdate={updateScene} />
                    </TabsContent>
                </Tabs>
            ) : (
                <ScriptForm sceneIndex={0} data={formData} onUpdate={updateScene} />
            )}
        </StepCard>
    );
}
