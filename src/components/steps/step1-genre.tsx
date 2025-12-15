'use client';

import { StepCard } from "@/components/step-card";
import { GENRES } from "@/lib/data";
import { type FormData, type SceneData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, VenetianMask, Laugh, Eye, Rocket, Ghost, Heart, Zap, Video, Clapperboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

const GENRE_ICONS: Record<string, any> = {
    drama: VenetianMask,
    comedy: Laugh,
    thriller: Eye,
    scifi: Rocket,
    horror: Ghost,
    romance: Heart,
    action: Zap,
    documentary: Video
};

interface Step1GenreProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step1Genre({ formData, updateForm, setStep }: Step1GenreProps) {
    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
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

    const GenreSelection = ({ sceneIndex, currentGenre }: { sceneIndex: 0 | 1, currentGenre: string }) => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {GENRES.map((g: any) => {
                const Icon = GENRE_ICONS[g.id] || Clapperboard;
                return (
                    <div
                        key={g.id}
                        onClick={() => updateScene(sceneIndex, { genre: g.label })}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50 hover:bg-gray-100",
                            currentGenre === g.label
                                ? "border-primary border-[3px] bg-primary/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                : "border-transparent bg-gray-50"
                        )}
                    >
                        <div className="mb-3 flex justify-center md:justify-start">
                            <Icon className={cn("w-8 h-8", currentGenre === g.label ? "text-primary fill-primary/20" : "text-black")} />
                        </div>
                        <div className="font-bold text-black">{g.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{g.desc}</div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <StepCard
            title="Género Cinematográfico"
            description="Define el estilo de tu escena."
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
                        <GenreSelection sceneIndex={0} currentGenre={formData.genre} />
                    </TabsContent>
                    <TabsContent value="scene2" className="mt-0">
                        <GenreSelection sceneIndex={1} currentGenre={formData.scene2.genre} />
                    </TabsContent>
                </Tabs>
            ) : (
                <GenreSelection sceneIndex={0} currentGenre={formData.genre} />
            )}
        </StepCard>
    );
}
