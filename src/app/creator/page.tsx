
'use client';
import React, { useState, useMemo, useEffect, Suspense } from "react";
import { DYNAMICS, GENRES, LENGTHS, LOCATIONS, STEPS, PHOTO_STEPS, TONES } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { type FormData, type UserProfile, initialSceneData } from "@/lib/types";
import { Stepper } from "@/components/stepper";
import { SummaryCard } from "@/components/summary-card";
import Step0Intro from "@/components/steps/step0-intro";
import Step1Selection from "@/components/steps/step1-selection";
import Step1Genre from "@/components/steps/step1-genre";
import Step2Cast from "@/components/steps/step2-cast";
import Step3Details from "@/components/steps/step3-details";
import Step5Script from "@/components/steps/step4-script";
import Step5Budget from "@/components/steps/step5-budget";
import Step6Checkout from "@/components/steps/step6-checkout";
import ProfileForm from "@/components/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Star, User, Sparkles } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import Step1PhotoSelection from "@/components/steps/step1-photo-selection";
import Step3PhotoDates from "@/components/steps/step3-photo-dates";
import { cn } from "@/lib/utils";

function CreatorContent() {
    const { toast } = useToast();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [flowType, setFlowType] = useState<"scene" | "photo">("scene"); // Added Flow Type State
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();

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

    const handleProfileComplete = (profile: UserProfile) => {
        import('@/lib/auth').then(async ({ auth }) => {
            await auth.updateProfile(profile);
            setUserProfile(profile);
        });
    };

    const handleLogout = () => {
        import('@/lib/auth').then(async ({ auth }) => {
            await auth.logout();
            router.push('/');
        });
    };

    const [formData, setFormData] = useState<FormData>({
        ...initialSceneData,
        serviceType: "scene", // Default
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

    const CurrentStepComponent = useMemo(() => {
        if (flowType === 'photo') {
            switch (step) {
                case 0: return <Step0Intro setStep={setStep} setFlowType={setFlowType} updateForm={updateForm} />;
                case 1: return <Step1PhotoSelection formData={formData} updateForm={updateForm} setStep={setStep} setFlowType={setFlowType} />;
                case 2: return <Step3PhotoDates formData={formData} updateForm={updateForm} setStep={setStep} />;
                case 3: return <Step6Checkout formData={formData} updateForm={updateForm} setStep={setStep} summary={<SummaryCard formData={formData} dynamicLabel={dynamicLabel} />} />;
                default: return <Step0Intro setStep={setStep} setFlowType={setFlowType} updateForm={updateForm} />;
            }
        }

        // SCENE FLOW (Standard)
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
    }, [step, formData, dynamicLabel, currentUserEmail, userProfile?.firstName, flowType]);

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-200">
                <div className="max-w-7xl mx-auto">
                    <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
                        {/* Logo Section */}
                        <div className="flex items-center gap-4 min-w-0 flex-shrink-1">
                            <div className="cursor-pointer group" onClick={() => router.push('/')}>
                                <h1 className="font-display text-4xl tracking-wider leading-tight text-primary whitespace-nowrap group-hover:scale-105 transition-transform">SCENE ME</h1>
                                <p className="text-[10px] text-white -mt-1 tracking-[0.3em] font-sans uppercase opacity-70 group-hover:opacity-100 italic transition-opacity">the ACTOR'S STORE concept</p>
                                {/* Secret Path */}
                                <div onClick={(e) => { e.stopPropagation(); router.push('/antigravity'); }} className="h-2 w-2 bg-transparent absolute top-0 left-0 cursor-default" title="Void" />
                                <p onClick={(e) => { e.stopPropagation(); router.push('/antigravity'); }} className="text-[8px] text-purple-900/50 hover:text-purple-500 cursor-pointer mt-1 select-none">.</p>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white border-none h-8 px-3 text-[10px] uppercase tracking-wide font-bold shadow-sm hover:shadow-blue-500/20 transition-all"
                                onClick={() => router.push('/talents')}
                            >
                                <span className="hidden md:inline">Directorio</span>
                                <span className="md:hidden">Talentos</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:flex text-muted-foreground hover:text-primary">
                                Ayuda
                            </Button>
                            <Button variant="outline" size="sm" className="hidden md:flex border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground h-7 px-2 text-[10px] uppercase tracking-wide font-medium">
                                Guardar
                            </Button>


                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-primary/50 cursor-pointer hover:border-primary transition-colors">
                                        <AvatarImage src={userProfile?.photos && userProfile.photos.length > 0 ? URL.createObjectURL(userProfile.photos[0]) : undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {userProfile?.firstName ? `${userProfile.firstName[0]}${userProfile.lastName?.[0] || ''}` : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Usuario'}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">{currentUserEmail}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/onboarding/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        {userProfile ? 'Editar Perfil' : 'Completar Perfil'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toast({ title: "Suscripción", description: "Próximamente" })}>
                                        <Star className="mr-2 h-4 w-4" /> Suscripción
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {/* ALCHEMISTERY (Hidden/Advanced Tool) */}
                                    <DropdownMenuItem onClick={() => router.push('/antigravity')} className="text-purple-400 focus:text-purple-500 focus:bg-purple-900/10">
                                        <Sparkles className="mr-2 h-4 w-4" /> ALCHEMISTERY
                                    </DropdownMenuItem>
                                    {/* ADMIN PANEL (Hidden Access) */}
                                    <DropdownMenuItem onClick={() => router.push('/admin')} className="text-amber-400 focus:text-amber-500 focus:bg-amber-900/10">
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        ADMIN PANEL
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            <main className={cn(
                "flex-1 w-full flex flex-col transition-all duration-700 relative",
                step === 0 ? "min-h-screen p-0" : "max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8",
                flowType === 'photo' && step > 0 ? "bg-studio-matte" : "bg-transparent"
            )}>
                {flowType === 'photo' && step > 0 && (
                    <div className="absolute inset-0 bg-red-500/5 blur-[120px] rounded-full pointer-events-none animate-light-leak z-0 opacity-30" />
                )}
                {step > 0 && (
                    <div className={cn(
                        "grid gap-10 h-full",
                        flowType === 'photo' ? "md:grid-cols-[280px,1fr]" : "md:grid-cols-[250px,1fr]"
                    )}>
                        <aside className="hidden md:flex flex-col gap-8 sticky top-24 h-fit">
                            <div className={cn(
                                "space-y-1 mb-4",
                                flowType === 'photo' ? "text-white" : "text-black"
                            )}>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Proceso</h2>
                                <div className="h-px w-10 bg-current opacity-20" />
                            </div>
                            <Stepper
                                currentStep={step}
                                setStep={setStep}
                                steps={flowType === 'photo' ? PHOTO_STEPS : STEPS}
                                dark={flowType === 'photo'}
                            />
                            <SummaryCard formData={formData} dynamicLabel={dynamicLabel} />
                        </aside>

                        <section className="relative z-10 flex flex-col min-h-0">
                            {CurrentStepComponent}

                            {/* Mobile Sidebar Content - Only show if NOT step 0 */}
                            <div className="md:hidden space-y-6 pt-12 border-t border-white/10 mt-12 mb-20 text-white">
                                <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter italic">Tu Resumen</h3>
                                <Stepper
                                    currentStep={step}
                                    setStep={setStep}
                                    steps={flowType === 'photo' ? PHOTO_STEPS : STEPS}
                                    dark={flowType === 'photo'}
                                />
                                <div className="mt-6">
                                    <SummaryCard formData={formData} dynamicLabel={dynamicLabel} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                {step === 0 && (
                    <div className="w-full h-full">
                        {CurrentStepComponent}
                    </div>
                )}
            </main>

            {/* User Widget removed from bottom-left */}

            <footer className="border-t border-white/10 bg-black/50 py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    <p>&copy; 2024 SCENE ME. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default function SceneMeCreator() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <CreatorContent />
        </Suspense>
    );
}
