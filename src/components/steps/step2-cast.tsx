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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {DYNAMICS.map((d: any) => (
                <div
                    key={d.id}
                    onClick={() => updateScene(sceneIndex, { dynamic: d.id })}
                    className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all hover:border-primary/50 hover:bg-gray-100",
                        currentDynamic === d.id
                            ? "border-primary border-[3px] bg-primary/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                            : "border-transparent bg-gray-50"
                    )}
                >
                    <div className={cn(
                        "p-3 rounded-full",
                        currentDynamic === d.id ? "bg-primary text-primary-foreground shadow-md" : "bg-white text-gray-500"
                    )}>
                        {d.id === 'solo' ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="font-bold text-black">{d.label}</div>
                        <div className="text-xs text-gray-600">{d.desc}</div>
                    </div>
                </div>
            ))}
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
