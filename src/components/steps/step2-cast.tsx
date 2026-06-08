'use client';

import { StepCard } from "@/components/step-card";
import { DYNAMICS } from "@/lib/data";
import { type FormData, type SceneData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, User, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

interface Step2CastProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step2Cast({ formData, updateForm, setStep }: Step2CastProps) {
    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button size="lg" onClick={() => setStep(4)}>
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

    const CastSelection = ({ sceneIndex, currentDynamic }: { sceneIndex: 0 | 1, currentDynamic: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 md:grid-flow-col gap-3 pt-2">
            {DYNAMICS.map((d: any) => {
                const selected = currentDynamic === d.id;
                return (
                    <button
                        key={d.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updateScene(sceneIndex, { dynamic: d.id })}
                        className={cn(
                            "w-full text-left cursor-pointer rounded-2xl border p-3 flex items-center gap-3 transition-all",
                            selected
                                ? "border-primary bg-primary/15 shadow-[0_0_24px_hsla(42,90%,55%,0.18)]"
                                : "border-border bg-secondary hover:border-primary/50 hover:bg-primary/5"
                        )}
                    >
                        <div className={cn(
                            "shrink-0 p-2.5 rounded-full transition-colors",
                            selected ? "bg-primary text-background" : "bg-muted text-primary"
                        )}>
                            {d.id === 'solo' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-foreground text-base leading-tight">{d.label}</div>
                            <div className="text-xs text-muted-foreground leading-tight">{d.desc}</div>
                        </div>
                        <div className={cn(
                            "shrink-0 w-5 h-5 rounded-full border-2 transition-colors",
                            selected ? "border-primary bg-primary" : "border-border"
                        )} />
                    </button>
                );
            })}
        </div>
    );

    return (
        <StepCard
            title="Reparto y Dinámica"
            description="Selecciona la configuración de actores para tu escena."
            footerContent={footer}
        >
            {formData.packType === "two-scenes" ? (
                <Tabs defaultValue="scene1" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/20 p-1 rounded-xl">
                        <TabsTrigger
                            value="scene1"
                            className="rounded-lg py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-lg transition-all"
                        >
                            Tu 1ª Escena
                        </TabsTrigger>
                        <TabsTrigger
                            value="scene2"
                            className="rounded-lg py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-lg transition-all"
                        >
                            Tu 2ª Escena
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="scene1" className="mt-0">
                        <CastSelection sceneIndex={0} currentDynamic={formData.dynamic} />
                    </TabsContent>
                    <TabsContent value="scene2" className="mt-0">
                        <CastSelection sceneIndex={1} currentDynamic={formData.scene2.dynamic} />
                    </TabsContent>
                </Tabs>
            ) : (
                <CastSelection sceneIndex={0} currentDynamic={formData.dynamic} />
            )}
        </StepCard>
    );
}
