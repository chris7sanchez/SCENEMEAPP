
'use client';
import React, { useState, useMemo, useEffect, Suspense } from "react";
import { DYNAMICS, GENRES, LENGTHS, LOCATIONS, STEPS, PHOTO_STEPS, TONES } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { type FormData, type UserProfile, initialSceneData } from "@/lib/types";
import { Stepper } from "@/components/stepper";
import { SummaryCard } from "@/components/summary-card";
import { PhotoPackSelector } from "@/components/photo-pack-selector";
import Step0Intro from "@/components/steps/step0-intro";
import Step1Selection from "@/components/steps/step1-selection";
import Step1Genre from "@/components/steps/step1-genre";
import Step2Cast from "@/components/steps/step2-cast";
import Step3Details from "@/components/steps/step3-details";
import Step5Script from "@/components/steps/step4-script";
import Step5Budget from "@/components/steps/step5-budget";
import Step6Checkout from "@/components/steps/step6-checkout";



import { useRouter, useSearchParams } from "next/navigation";
import Step1PhotoSelection from "@/components/steps/step1-photo-selection";
import Step3PhotoDates from "@/components/steps/step3-photo-dates";
import { cn } from "@/lib/utils";
import { PHOTO_PACKS_ACTOR } from "@/lib/data"; // Added this import
import ProfileForm from "@/components/profile-form"; // Import directly for simplicity since it's used in the tab

import { AnimatePresence, motion } from "framer-motion";

function CreatorContent() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(() => Number(searchParams.get('step')) || 0);
    const [flowType, setFlowType] = useState<"scene" | "photo">(
        searchParams.get('flow') === 'photo' ? 'photo' : 'scene'
    );
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const isGuest = searchParams.get('guest') === 'true';

        import('@/lib/auth').then(async ({ auth }) => {
            const user = await auth.getCurrentUser();
            if (!user) {
                if (isGuest) {
                    setIsLoading(false);
                } else {
                    router.push('/');
                }
            } else {
                setCurrentUserEmail(user.email);
                if (user.profile) {
                    setUserProfile(user.profile);
                }
                setIsLoading(false);
            }
        });
    }, [router, searchParams]);

    const [formData, setFormData] = useState<FormData>({
        ...initialSceneData,
        serviceType: "scene",
        packType: "one-scene",
        addEditing: false,
        scene2: { ...initialSceneData },
        length: "120",
        crewSize: 2,
        shootingType: "standard",
        discount: 0,
        shootDates: [],
        preferredMonths: [],
        city: "Madrid",
        contact: { name: "", email: "", phone: "" },
        professionalScript: false,
        reviewByProfessional: false,
        professionalActors: false
    });

    const updateForm = (data: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const dynamicLabel = useMemo(() => {
        const found = DYNAMICS.find(d => typeof d !== 'string' && d.id === formData.dynamic);
        return found && typeof found !== 'string' ? found.label : "";
    }, [formData.dynamic]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const activeTab = searchParams.get('tab') || 'services';

    const CurrentStepComponent = useMemo(() => {
        if (activeTab === 'profile') return null;

        if (flowType === 'photo') {
            switch (step) {
                case 0: return <Step0Intro setStep={setStep} setFlowType={setFlowType} updateForm={updateForm} />;
                case 1: return <Step1PhotoSelection formData={formData} updateForm={updateForm} setStep={setStep} setFlowType={setFlowType} />;
                case 2: return <Step3PhotoDates formData={formData} updateForm={updateForm} setStep={setStep} />;
                case 3: return <Step6Checkout formData={formData} updateForm={updateForm} setStep={setStep} summary={<SummaryCard formData={formData} dynamicLabel={dynamicLabel} />} />;
                default: return <Step0Intro setStep={setStep} setFlowType={setFlowType} updateForm={updateForm} />;
            }
        }

        switch (step) {
            case 0: return <Step0Intro setStep={setStep} setFlowType={setFlowType} updateForm={updateForm} />;
            case 1: return <Step1Selection formData={formData} updateForm={updateForm} setStep={setStep} />;
            case 2: return <Step1Genre formData={formData} updateForm={updateForm} setStep={setStep} />;
            case 3: return <Step2Cast formData={formData} updateForm={updateForm} setStep={setStep} />;
            case 4: return <Step3Details formData={formData} updateForm={updateForm} setStep={setStep} />;
            case 5: return (
                <Step5Script
                    formData={formData}
                    updateForm={updateForm}
                    setStep={setStep}
                    userEmail={currentUserEmail}
                    userName={userProfile?.firstName}
                />
            );
            case 6: return <Step5Budget formData={formData} updateForm={updateForm} setStep={setStep} />;
            case 7: return <Step6Checkout formData={formData} updateForm={updateForm} setStep={setStep} summary={<SummaryCard formData={formData} dynamicLabel={dynamicLabel} />} />;
            default: return <Step0Intro setStep={setStep} setFlowType={setFlowType} updateForm={updateForm} />;
        }
    }, [step, formData, dynamicLabel, currentUserEmail, userProfile?.firstName, flowType, activeTab]);

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-[hsl(var(--sm-bg-base))] text-[hsl(var(--sm-text-muted))] flex flex-col">
            <header className="border-b border-white/10 bg-[hsl(var(--sm-bg-surface)/0.8)] backdrop-blur-md sticky top-0 z-[110] transition-all duration-200 h-16 md:h-20 flex items-center shadow-lg">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    <div className="cursor-pointer flex flex-col items-center flex-1 group" onClick={() => router.push('/')}>
                        <h1 className="font-display text-3xl md:text-4xl tracking-[0.1em] leading-none text-primary uppercase group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_hsla(42,90%,55%,0.3)]">SCENE ME</h1>
                        <p className="text-[8px] md:text-[10px] text-[hsl(var(--sm-text-primary)/0.6)] tracking-[0.4em] font-headline uppercase mt-1">the ACTOR'S STORE concept</p>
                    </div>
                    <button
                        onClick={() => router.push('/studio')}
                        className="shrink-0 rounded-full border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-300 hover:bg-amber-500/20 transition-all"
                    >
                        Studio
                    </button>
                </div>
            </header>

            <main className={cn(
                "flex-1 w-full flex flex-col relative pb-28 md:pb-28",
                step === 0 || activeTab === 'profile' ? "p-0" : "max-w-7xl mx-auto px-4 md:px-8 py-6"
            )}>
                {activeTab === 'profile' ? (
                    <div className="max-w-3xl mx-auto w-full p-6 animate-in fade-in duration-500">
                        <section className="mb-12">
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-8">AJUSTES DE PERFIL</h2>
                            <ProfileForm initialEmail={currentUserEmail} onComplete={(p) => setUserProfile(p)} />
                        </section>
                        
                        <section className="mt-12 p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-6">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">INFORMACIÓN LEGAL</h3>
                            <div className="grid gap-4">
                                <a href="/privacy" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                                    <span className="text-sm font-bold uppercase tracking-tight text-white/60 group-hover:text-white">Política de Privacidad</span>
                                    <span className="text-[10px] font-black text-primary italic">VER</span>
                                </a>
                                <a href="/terms" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                                    <span className="text-sm font-bold uppercase tracking-tight text-white/60 group-hover:text-white">Condiciones del Servicio</span>
                                    <span className="text-[10px] font-black text-primary italic">VER</span>
                                </a>
                                <a href="/cookies" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                                    <span className="text-sm font-bold uppercase tracking-tight text-white/60 group-hover:text-white">Política de Cookies</span>
                                    <span className="text-[10px] font-black text-primary italic">VER</span>
                                </a>
                            </div>
                        </section>

                        <div className="mt-12 text-center pb-12">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
                            <p className="text-[10px] font-black text-[hsl(var(--sm-text-primary)/0.8)] uppercase tracking-[0.5em] drop-shadow-sm">Scene Me © 2024 — ACTOR WORLDWIDE</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {step > 0 && (
                            <div className="grid gap-8 md:grid-cols-[240px,1fr] h-full">
                                <aside className="hidden md:flex flex-col gap-6 sticky top-24 h-fit">
                                    <Stepper
                                        currentStep={step}
                                        setStep={setStep}
                                        steps={flowType === 'photo' ? PHOTO_STEPS : STEPS}
                                        dark={true}
                                    />
                                    {flowType === 'photo' && step === 1 && (
                                        <PhotoPackSelector formData={formData} updateForm={updateForm} />
                                    )}
                                </aside>

                                <section className="relative z-10 flex flex-col min-h-0 min-w-0 overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${flowType}-${step}`}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="w-full h-full"
                                        >
                                            {CurrentStepComponent}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className="mt-6">
                                        <SummaryCard formData={formData} dynamicLabel={dynamicLabel} />
                                    </div>
                                </section>
                            </div>
                        )}
                        
                        {step === 0 && (
                            <div className="w-full h-full">
                                {CurrentStepComponent}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default function SceneMeCreator() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[hsl(var(--sm-bg-base))]" />}>
            <CreatorContent />
        </Suspense>
    );
}
