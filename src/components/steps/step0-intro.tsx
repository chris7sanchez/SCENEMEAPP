'use client';

import { StepCard } from "@/components/step-card";
import { Button } from "../ui/button";
import { ArrowRight, ArrowDown, Camera, Clapperboard, Film, Mail, CheckCircle2, ChevronLeft, ChevronRight, X, AlertTriangle, Sparkles } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import Image from "next/image";
import { type FormData } from "@/lib/types";

interface Step0IntroProps {
    setStep: (step: number) => void;
    setFlowType?: (type: 'scene' | 'photo') => void;
    updateForm?: (data: Partial<FormData>) => void;
}

export default function Step0Intro({ setStep, setFlowType, updateForm }: Step0IntroProps) {
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<number>(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [showGuestWarning, setShowGuestWarning] = useState(false);
    const [visibleCount, setVisibleCount] = useState(4);

    const searchParams = useSearchParams();

    // Floating Offer Logic
    const offerRef = useRef<HTMLDivElement>(null);
    const [showFloatingOffer, setShowFloatingOffer] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowFloatingOffer(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (offerRef.current) {
            observer.observe(offerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    // Splash Screen Logic
    const [showSplash, setShowSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('hasSeenSplash');
        if (hasSeen) {
            setShowSplash(false);
            setSplashFading(true);
            return;
        }

        const timer1 = setTimeout(() => {
            setSplashFading(true);
        }, 800);

        const timer2 = setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem('hasSeenSplash', 'true');
        }, 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const scrollToOffer = () => {
        offerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const TOTAL_IMAGES = 11;
    const VARIANTS_PER_ITEM = 3;
    const ITEMS_WITH_VARIANTS = [1, 2, 4, 5, 6, 8, 9, 10, 11];

    const getImagePath = (index: number, variant: number = 0) => {
        if (variant === 0) return `/trabajos/${index}.jpg`;
        return `/trabajos/${index}.${variant + 1}.jpg`;
    };

    const handleNext = () => {
        if (selectedIndex === null) return;
        if (selectedVariant < VARIANTS_PER_ITEM - 1) {
            setSelectedVariant(prev => prev + 1);
        } else {
            if (selectedIndex < TOTAL_IMAGES) {
                setSelectedIndex(prev => (prev ? prev + 1 : 1));
                setSelectedVariant(0);
            } else {
                setSelectedIndex(1);
                setSelectedVariant(0);
            }
        }
    };

    const handlePrev = () => {
        if (selectedIndex === null) return;
        if (selectedVariant > 0) {
            setSelectedVariant(prev => prev - 1);
        } else {
            if (selectedIndex > 1) {
                setSelectedIndex(prev => (prev ? prev - 1 : 1));
                setSelectedVariant(0);
            } else {
                setSelectedIndex(TOTAL_IMAGES);
                setSelectedVariant(0);
            }
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const card = scrollContainerRef.current.firstElementChild as HTMLElement;
            if (!card) return;

            const cardWidth = card.offsetWidth;
            const gap = 40; // Synchronized with container gap
            const scrollAmount = cardWidth + gap;
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const currentIndex = Math.round(currentScroll / scrollAmount);
            let targetIndex = direction === 'left' ? Math.max(0, currentIndex - 1) : currentIndex + 1;
            const targetScroll = targetIndex * scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full flex flex-col bg-transparent">
            <InstallPrompt />

            {/* SPLASH SCREEN */}
            {showSplash && (
                <div className={`fixed inset-0 z-[99999] bg-[hsl(var(--sm-bg-base))] flex items-center justify-center transition-opacity duration-500 ${splashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-700 fade-in-0">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-2xl relative">
                            <Image
                                src="/android-chrome-512x512.png"
                                alt="Scene Me Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <h1 className="text-white font-black text-2xl tracking-[0.2em] animate-pulse">SCENE ME</h1>
                    </div>
                </div>
            )}

            <div className="pt-0 px-4 flex flex-col items-center">
                <p className="font-headline font-black text-lg md:text-4xl leading-none animate-in slide-in-from-top duration-700 uppercase tracking-tight">
                    <span className="text-primary">El ÉXITO</span> <span className="text-white">del ACTOR</span>
                </p>
                <p className="text-red-600 font-headline font-black text-lg md:text-4xl p-0 leading-none tracking-tighter filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] mt-1">
                    en 3 PASOS
                </p>

                <div className="pt-0 md:pt-2 flex flex-col items-center w-full">
                    <div className="w-full max-w-[280px] md:max-w-md h-[1px] bg-[hsl(var(--sm-border)/0.5)]" />
                </div>
            </div>

            <div className="relative flex flex-col w-full max-w-[100vw] pb-2">

                {/* Scroll Container (Desktop/Tablet) */}
                <div
                    ref={scrollContainerRef}
                    className="flex flex-row items-stretch gap-4 lg:gap-6 w-full max-w-[78rem] mx-auto px-4 lg:px-6 pb-3 pt-2 overflow-x-auto snap-x scrollbar-hide"
                >
                    {/* CARD 1: BOOK */}
                    <div
                        style={{ backgroundColor: 'hsla(220, 30%, 10%, 0.7)' }}
                        className="flex-1 snap-center min-w-[88vw] sm:min-w-[300px] md:min-w-[280px] md:max-w-[400px] backdrop-blur-xl border-2 border-white/10 rounded-[2rem] p-6 flex flex-col md:min-h-[440px] relative shadow-2xl transition-all duration-500 hover:shadow-[var(--sm-shadow-glow)] hover:border-primary/30 group justify-between overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                        <div className="w-full bg-white/5 py-3 text-center border-b border-white/10 -mt-6 -mx-6 mb-6">
                            <span className="font-black text-primary uppercase tracking-[0.3em] text-base flex justify-center items-center gap-2">
                                1<span className="lowercase">er</span> Paso
                            </span>
                        </div>
                        <div className="text-center space-y-1 relative z-10 pt-0 font-sans">
                            <div className="relative inline-block py-1">
                                <span className="absolute inset-0 bg-primary skew-x-[-12deg] transform rotate-[-1deg]" />
                                <p className="relative text-2xl font-black text-black px-4 uppercase tracking-tighter italic">"REVÉLATE" AL MUNDO!</p>
                            </div>
                            <p className="text-sm text-white font-bold px-2 leading-relaxed pt-1">
                                con tu mejor <span className="text-primary font-black">BOOK</span> de fotos <span className="text-primary font-black">YA!</span>
                            </p>
                        </div>
                        <div className="text-center space-y-2 relative z-10 pt-1">
                            <div className="flex justify-center">
                                <div className="p-3 bg-primary/10 rounded-full border border-primary/20 shadow-[0_0_20px_rgba(251,191,36,0.1)] group-hover:scale-110 transition-transform duration-500">
                                    <Camera className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-1">BOOK</h3>
                                <span className="text-[11px] font-bold text-primary tracking-[0.3em] uppercase opacity-70">Actor / Actriz</span>
                            </div>
                            <div className="space-y-2 w-full">
                                <Dialog open={isGalleryOpen} onOpenChange={(open) => {
                                    if (!open && selectedIndex !== null) return;
                                    setIsGalleryOpen(open);
                                    if (!open) setTimeout(() => setVisibleCount(4), 300);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full bg-white text-black border-white hover:bg-zinc-200 hover:text-black font-black tracking-[0.2em] h-10 text-xs uppercase transition-all">
                                            VER TRABAJOS
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl bg-[hsl(var(--sm-bg-base))] border-white/10 text-[hsl(var(--sm-text-primary))] max-h-[90vh] overflow-y-auto backdrop-blur-2xl studio-rim-light">
                                        <DialogHeader>
                                            <DialogTitle className="text-4xl font-display font-black uppercase tracking-widest text-primary italic text-center mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">Nuestros Trabajos</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pb-6">
                                            {Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1).slice(0, visibleCount).map((num) => (
                                                <GalleryGridItem key={num} num={num} onClick={() => { setIsGalleryOpen(false); setTimeout(() => { setSelectedIndex(num); setSelectedVariant(0); }, 100); }} />
                                            ))}
                                        </div>
                                        {visibleCount < TOTAL_IMAGES && (
                                            <div className="flex justify-center pb-12 pt-4">
                                                <Button variant="outline" onClick={() => setVisibleCount(prev => Math.min(prev + 4, TOTAL_IMAGES))} className="border-primary/40 text-primary hover:bg-primary/10 font-black uppercase tracking-[0.3em] text-xs h-12 px-10 rounded-full">Cargar Más Fotos...</Button>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className="w-full bg-primary hover:bg-primary-hover text-[hsl(var(--sm-bg-base))] font-black tracking-[0.2em] h-11 text-sm uppercase shadow-xl shadow-primary/20 sm-hover-lift"
                                    onClick={() => { if (setFlowType) setFlowType('photo'); if (updateForm) updateForm({ serviceType: 'photo' }); setStep(1); }}
                                >
                                    <Mail className="mr-3 w-4 h-4" /> ELEGIR BOOK
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: SCENE ME */}
                    <div className="flex-1 snap-center min-w-[88vw] sm:min-w-[300px] md:min-w-[280px] md:max-w-[400px] bg-primary/5 backdrop-blur-2xl border-2 border-primary/30 rounded-[2rem] p-6 flex flex-col md:min-h-[440px] relative shadow-[0_0_50px_rgba(251,191,36,0.15)] transition-all duration-500 z-10 justify-between group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.05] to-transparent pointer-events-none" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />

                        <div className="w-full bg-primary text-[hsl(var(--sm-bg-base))] py-3 text-center font-black uppercase tracking-[0.3em] text-base shadow-lg -mt-6 -mx-6 mb-6 border-b border-primary/40">
                            2º Paso
                        </div>

                        <div className="text-center relative z-10 font-sans leading-none">
                            <p className="text-sm md:text-base font-bold text-white uppercase tracking-wide">Diseña</p>
                            <h2 className="text-3xl md:text-4xl font-black text-primary leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] uppercase py-0.5">
                                Tu Mejor Escena
                            </h2>
                            <p className="text-sm md:text-base font-bold text-white uppercase tracking-wide">Ahora</p>
                            <p className="text-xs text-white font-bold pt-1">
                                y <span className="text-primary font-black">Rueda</span> cuando quieras!
                            </p>
                        </div>

                        <div className="text-center space-y-2 pt-3 relative z-10">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <Clapperboard className="w-11 h-11 text-primary animate-clapper" />
                                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl font-display font-black text-primary uppercase tracking-[0.05em] mb-0.5 drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]">SCENE ME</h3>
                                <span className="text-[10px] font-black text-[hsl(var(--sm-text-primary)/0.5)] tracking-[0.4em] uppercase">THE ACTOR'S STORE CONCEPT</span>
                            </div>
                            <Button
                                size="lg"
                                className="w-full bg-primary hover:bg-primary-hover text-[hsl(var(--sm-bg-base))] font-black tracking-[0.2em] h-12 text-base shadow-2xl shadow-primary/30 rounded-2xl sm-hover-lift"
                                onClick={() => { if (setFlowType) setFlowType('scene'); if (updateForm) updateForm({ serviceType: 'scene' }); setStep(1); }}
                            >
                                EMPEZAR AHORA <ArrowRight className="ml-3 w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* CARD 3: SELF-TAPES */}
                    <div
                        style={{ backgroundColor: 'hsla(220, 30%, 10%, 0.7)' }}
                        className="flex-1 snap-center min-w-[88vw] sm:min-w-[300px] md:min-w-[280px] md:max-w-[400px] backdrop-blur-xl border-2 border-blue-500/20 rounded-[2rem] p-6 flex flex-col md:min-h-[440px] relative shadow-2xl hover:border-blue-500/40 transition-all duration-500 group justify-between overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-transparent pointer-events-none" />
                        <div className="w-full bg-white/5 py-3 text-center border-b border-white/10 -mt-6 -mx-6 mb-6">
                            <span className="font-black text-blue-400 uppercase tracking-[0.3em] text-base flex justify-center items-center gap-2">
                                3<span className="lowercase">er</span> Paso
                            </span>
                        </div>
                        <div className="text-center relative z-10 pt-0 font-sans leading-none">
                            <p className="text-base md:text-lg font-bold text-white uppercase tracking-wide">Prepárate para</p>
                            <h2 className="text-3xl md:text-4xl font-black text-blue-400 leading-tight tracking-tighter drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] uppercase">
                                El Sí
                            </h2>
                            <p className="text-xs text-white font-bold pt-1">
                                con <span className="text-blue-400 font-black">Self-Tapes</span> de cine!
                            </p>
                        </div>
                        <div className="text-center space-y-2 relative z-10 pt-1">
                            <div className="flex justify-center">
                                <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20 shadow-[0_0_20px_rgba(96,165,250,0.1)] group-hover:scale-110 transition-transform duration-500">
                                    <Film className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-1">SELF-TAPES</h3>
                                <span className="text-[11px] font-bold text-blue-400 tracking-[0.3em] uppercase opacity-70">Coaching & Dirección</span>
                            </div>
                            <Button
                                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black tracking-[0.2em] h-11 text-sm uppercase shadow-xl shadow-blue-500/20 sm-hover-lift rounded-xl"
                                onClick={() => router.push('/booking?service=selftape')}
                            >
                                RESERVAR ASESORÍA
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MOBILE VIEW — editorial (oculto; en móvil usamos el carrusel de cards de arriba) */}
                <div className="hidden">
                    {/* CARD 1: BOOK */}
                    <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-[hsl(var(--sm-bg-surface))]">
                        <div className="relative z-10 h-full p-4 flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase text-white/80">Paso 1 · Book</span>
                                <Camera className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                                <h3 className="text-2xl font-black text-white uppercase leading-none tracking-tighter">Tu Book Actoral</h3>
                                <p className="text-xs text-white/70 font-medium">Tu mejor carta de presentación.</p>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => { setIsGalleryOpen(true); setVisibleCount(4); }} className="bg-white/15 text-white h-8 px-4 text-[10px] font-black tracking-widest rounded-full uppercase">Ver trabajos</button>
                                    <button onClick={() => { if (setFlowType) setFlowType('photo'); if (updateForm) updateForm({ serviceType: 'photo' }); setStep(1); }} className="bg-primary text-[hsl(var(--sm-bg-base))] h-8 px-4 text-[10px] font-black tracking-widest rounded-full uppercase shadow-lg">Empezar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: SCENE ME (héroe) */}
                    <div className="relative flex-[1.7] min-h-0 rounded-[1.4rem] overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(251,191,36,0.18)] bg-primary/10">
                        <div className="relative z-10 h-full p-5 flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="bg-primary text-[hsl(var(--sm-bg-base))] px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">2º Paso</span>
                                <div className="relative">
                                    <Clapperboard className="w-9 h-9 text-primary animate-clapper" />
                                    <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-primary animate-pulse" />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <p className="text-sm font-bold text-white/80 uppercase tracking-wide leading-none mb-1">Diseña</p>
                                <h2 className="text-4xl font-black text-primary uppercase leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] py-1">Tu Mejor Escena</h2>
                                <p className="text-xs text-white/70 font-medium mb-4">Y <span className="text-primary font-bold">rueda</span> cuando quieras · 5 plazas</p>
                                <button onClick={() => { if (setFlowType) setFlowType('scene'); if (updateForm) updateForm({ serviceType: 'scene' }); setStep(1); }} className="w-full bg-primary text-[hsl(var(--sm-bg-base))] h-11 text-sm font-black tracking-[0.2em] rounded-xl uppercase shadow-xl flex items-center justify-center gap-2">Empezar ahora <ArrowRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: SELF-TAPES */}
                    <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-blue-500/30 shadow-xl bg-[hsl(var(--sm-bg-surface))]">
                        <div className="relative z-10 h-full p-4 flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase text-white/80">Paso 3</span>
                                <Film className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                                <p className="text-xs font-bold text-white/80 uppercase leading-none">Prepárate para <span className="text-blue-400 font-black animate-shine-text">El Sí</span></p>
                                <h3 className="text-2xl font-black text-white uppercase leading-none tracking-tighter">Tus Self-Tapes</h3>
                                <button onClick={() => router.push('/booking?service=selftape')} className="bg-blue-500 text-white h-8 px-4 text-[10px] font-black tracking-widest rounded-full uppercase shadow-lg mt-1">Reservar asesoría</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GRAND FINALE: PACKTOR OFFER */}
                <div ref={offerRef} className="w-full bg-[hsl(var(--sm-bg-surface))] border-t-4 border-primary shadow-[0_-20px_60px_rgba(0,0,0,0.7)] z-40 relative shrink-0 pb-6 pt-4 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-4">
                            <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">⚠ Oferta Limitada: Solo 5 plazas</span>
                            <h2 className="text-3xl md:text-5xl font-black text-primary italic tracking-tighter mt-2 leading-none">PACKTOR <span className="text-white">PRO</span></h2>
                            <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">La herramienta definitiva para el actor</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center space-y-4">
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">¿Qué te llevas?</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded text-left border border-white/5">
                                        <div className="flex items-center gap-3"><div className="bg-zinc-800 p-1.5 rounded-full"><Camera className="w-4 h-4 text-primary" /></div><span className="text-white font-bold text-sm">BOOK ACTORAL</span></div>
                                        <span className="text-zinc-500 font-bold text-xs line-through">150€</span>
                                    </div>
                                    <div className="flex items-center justify-center text-primary font-black text-xs">+</div>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded text-left border border-white/5">
                                        <div className="flex items-center gap-3"><div className="bg-zinc-800 p-1.5 rounded-full"><Clapperboard className="w-4 h-4 text-primary" /></div><span className="text-white font-bold text-sm">ESCENA CINE</span></div>
                                        <span className="text-zinc-500 font-bold text-xs line-through">450€</span>
                                    </div>
                                    <div className="flex items-center justify-center text-primary font-black text-xs">+</div>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded text-left border border-white/5">
                                        <div className="flex items-center gap-3"><div className="bg-zinc-800 p-1.5 rounded-full"><Film className="w-4 h-4 text-primary" /></div><span className="text-white font-bold text-sm">BONO 5 SELF-TAPES</span></div>
                                        <span className="text-zinc-500 font-bold text-xs line-through">250€</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-white/10"><p className="text-zinc-400 text-xs">Valor Real: <span className="line-through decoration-red-500 decoration-2 text-white/50">850€</span></p></div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xl font-black text-white uppercase italic text-center md:text-left">TODO INCLUIDO:</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /><div><span className="block text-white font-bold text-sm">Sesión de Fotos Completa</span><span className="block text-zinc-500 text-xs">5 fotos retocadas + Galería completa.</span></div></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /><div><span className="block text-white font-bold text-sm">Producción de Escena de Cine</span><span className="block text-zinc-500 text-xs">Guion a medida, rodaje 4K, edición cine.</span></div></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /><div><span className="block text-white font-bold text-sm">Bono de 5 Self-Tapes</span><span className="block text-zinc-500 text-xs">Con coaching y dirección de casting real.</span></div></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /><div><span className="block text-white font-bold text-sm">Asesoría de Perfil</span><span className="block text-zinc-500 text-xs">Revisión de CV y material.</span></div></li>
                                </ul>
                            </div>

                            <div className="bg-primary p-6 rounded-3xl text-center shadow-2xl shadow-primary/20 transform scale-100 md:scale-105 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                                <p className="text-black font-bold text-sm uppercase tracking-widest mb-1">Precio Final</p>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="text-black/50 text-xl line-through font-bold">850€</span>
                                    <span className="text-6xl font-black text-black tracking-tighter">660€</span>
                                </div>
                                <Button className="w-full bg-[hsl(var(--sm-bg-base))] hover:bg-[hsl(var(--sm-bg-surface))] text-primary border border-primary/20 font-black tracking-widest h-14 text-lg shadow-xl" onClick={() => router.push('/booking?service=packtor')}>¡LO QUIERO!</Button>
                                <p className="text-[10px] text-black/70 font-bold uppercase tracking-wide mt-3">*Pago fraccionado disponible</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE GALLERY DIALOGS (PORTALS) */}
                <Dialog open={selectedIndex !== null} onOpenChange={(open) => {
                    if (!open) {
                        setSelectedIndex(null);
                        setSelectedVariant(0);
                        setIsGalleryOpen(true);
                    }
                }}>
                    <DialogContent className="max-w-none w-screen h-[100dvh] bg-[hsl(var(--sm-bg-base))] border-none shadow-none p-0 gap-0 rounded-none flex flex-col items-center justify-center outline-none z-[10000]" excludeCloseButton={true}>
                        <div className="w-full h-full flex flex-col relative" onClick={(e) => { if (e.target === e.currentTarget) setSelectedIndex(null); }}>
                            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-[hsl(var(--sm-bg-base))/0.95] to-transparent z-[10005]">
                                <button className="bg-white/5 backdrop-blur-md text-white font-black tracking-[0.2em] text-[10px] px-8 py-4 rounded-full border border-white/10 shadow-2xl flex items-center uppercase hover:bg-white/10 transition-all" onClick={() => setSelectedIndex(null)}><ChevronLeft className="w-5 h-5 mr-2" /> VOLVER</button>
                                <button className="text-white/60 hover:text-white bg-white/5 p-4 rounded-full border border-white/5 transition-all" onClick={() => setSelectedIndex(null)}><X className="w-8 h-8" /></button>
                            </div>

                            <button className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-full z-[10005] hover:bg-primary hover:text-[hsl(var(--sm-bg-base))] transition-all" onClick={(e) => { e.stopPropagation(); handlePrev(); }}><ChevronLeft className="w-10 h-10" /></button>
                            <button className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white bg-white/5 backdrop-blur-md border border-white/10 rounded-full z-[10005] hover:bg-primary hover:text-[hsl(var(--sm-bg-base))] transition-all" onClick={(e) => { e.stopPropagation(); handleNext(); }}><ChevronRight className="w-10 h-10" /></button>

                            <div className="flex-1 flex items-center justify-center p-8 pb-56 w-full h-full relative">
                                <Image key={`${selectedIndex}-${selectedVariant}`} src={getImagePath(selectedIndex || 1, selectedVariant)} alt="Vista" fill className="object-contain" sizes="100vw" priority />
                                <div className="absolute bottom-64 left-1/2 -translate-x-1/2 text-center">
                                    <h4 className="text-primary font-display font-black text-5xl uppercase tracking-[0.2em] drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">SCENE ME</h4>
                                    <p className="text-white/40 text-xs font-black tracking-[0.5em] uppercase mt-2">Professional Work Portfolio</p>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full bg-[hsl(var(--sm-bg-surface))] border-t border-white/5 pt-10 pb-10 flex flex-col gap-6 backdrop-blur-2xl">
                                <div className="px-8">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-3">Vistas del Proyecto</p>
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {[0, 1, 2].map((v) => (selectedIndex !== null && (v === 0 || ITEMS_WITH_VARIANTS.includes(selectedIndex))) && (
                                            <button key={v} onClick={() => setSelectedVariant(v)} className={`relative w-20 h-28 border-2 rounded-xl overflow-hidden shrink-0 transition-all ${selectedVariant === v ? 'border-primary scale-110 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                                                <Image src={getImagePath(selectedIndex, v)} fill className="object-cover" alt="v" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-8 pt-6 border-t border-white/5">
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-3">Más Trabajos</p>
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                        {Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1).map((n) => (
                                            <button key={n} onClick={() => { setSelectedIndex(n); setSelectedVariant(0); }} className={`relative w-16 h-16 rounded-full border-2 overflow-hidden shrink-0 transition-all ${selectedIndex === n ? 'border-primary scale-110 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                                <Image src={getImagePath(n, 0)} fill className="object-cover" alt="n" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showGuestWarning} onOpenChange={setShowGuestWarning}>
                    <DialogContent className="max-w-md bg-zinc-900 border border-yellow-500/20 text-white rounded-2xl">
                        <div className="flex flex-col items-center text-center space-y-4 py-4">
                            <div className="bg-yellow-500/10 p-4 rounded-full"><AlertTriangle className="w-10 h-10 text-yellow-500" /></div>
                            <h2 className="text-xl font-black uppercase text-white">Modo Invitado</h2>
                            <p className="text-zinc-400 text-sm px-4">Estás explorando la plataforma en modo visualización. <span className="text-white font-bold block mt-2">Recuerda que para contratar los servicios deberás estar registrado.</span></p>
                            <Button className="w-full bg-yellow-500 text-black font-bold" onClick={() => setShowGuestWarning(false)}>ENTENDIDO</Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}

const GalleryGridItem = ({ num, onClick }: { num: number, onClick: () => void }) => {
    return (
        <button className="aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden relative group" onClick={onClick}>
            <img src={`/trabajos/${num}.jpg`} alt="t" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white text-xs font-bold uppercase">Ampliar</span></div>
        </button>
    );
}
