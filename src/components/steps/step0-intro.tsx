'use client';

import { VideoMethodSection } from "@/components/promo/VideoMethodSection";
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

interface Step0IntroProps {
    setStep: (step: number) => void;
}

export default function Step0Intro({ setStep }: Step0IntroProps) {
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
        // Check session storage
        const hasSeen = sessionStorage.getItem('hasSeenSplash');
        if (hasSeen) {
            setShowSplash(false);
            setSplashFading(true); // Ensure it's hidden logically
            return;
        }

        // Start fading out after 1.5s
        const timer1 = setTimeout(() => {
            setSplashFading(true);
        }, 1500);

        // Remove from DOM after fade (2s total)
        const timer2 = setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem('hasSeenSplash', 'true');
        }, 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const scrollToOffer = () => {
        offerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Total images count
    const TOTAL_IMAGES = 11;
    const VARIANTS_PER_ITEM = 3; // 1.jpg, 1.2.jpg, 1.3.jpg
    const ITEMS_WITH_VARIANTS = [1, 2, 4, 5, 6, 8, 9, 10, 11]; // Hardcoded list of items that have variants

    const getImagePath = (index: number, variant: number = 0) => {
        if (variant === 0) return `/trabajos/${index}.jpg`;
        return `/trabajos/${index}.${variant + 1}.jpg`;
    };

    const handleNext = () => {
        if (selectedIndex === null) return;

        // Try next variant
        if (selectedVariant < VARIANTS_PER_ITEM - 1) {
            setSelectedVariant(prev => prev + 1);
        } else {
            // Move to next project, reset variant
            if (selectedIndex < TOTAL_IMAGES) {
                setSelectedIndex(prev => (prev ? prev + 1 : 1));
                setSelectedVariant(0);
            } else {
                // Formatting loop or stop? Let's loop to 1
                setSelectedIndex(1);
                setSelectedVariant(0);
            }
        }
    };

    const handlePrev = () => {
        if (selectedIndex === null) return;

        // Try prev variant
        if (selectedVariant > 0) {
            setSelectedVariant(prev => prev - 1);
        } else {
            // Move to prev project, set to last variant?
            // Implementation choice: Go to prev project, 1st variant (simple) or last (continuity)?
            // User asked "two columns", implying structure. Let's go to Prev Project, Variant 0.
            if (selectedIndex > 1) {
                setSelectedIndex(prev => (prev ? prev - 1 : 1));
                setSelectedVariant(0);
            } else {
                // Loop to last
                setSelectedIndex(TOTAL_IMAGES);
                setSelectedVariant(0);
            }
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            // Get card width (all cards have same width)
            const card = scrollContainerRef.current.firstElementChild as HTMLElement;
            if (!card) return;

            const cardWidth = card.offsetWidth;
            const gap = 16; // 4 * 4px gap
            const scrollAmount = cardWidth + gap;
            const currentScroll = scrollContainerRef.current.scrollLeft;

            // Calculate current index to avoid getting stuck between snaps
            const currentIndex = Math.round(currentScroll / scrollAmount);

            let targetIndex;
            if (direction === 'left') {
                targetIndex = Math.max(0, currentIndex - 1);
            } else {
                targetIndex = currentIndex + 1; // You might want to clamp this too, but overflow is usually fine
            }

            const targetScroll = targetIndex * scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-white md:bg-transparent overflow-y-auto scrollbar-hide">
            <InstallPrompt />

            {/* SPLASH SCREEN */}
            {showSplash && (
                <div className={`fixed inset-0 z-[99999] bg-zinc-950 flex items-center justify-center transition-opacity duration-500 ${splashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-700 fade-in-0">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-2xl relative">
                            <Image
                                src="/android-chrome-512x512.png"
                                alt="Scene Me Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <h1 className="text-white font-black text-2xl tracking-[0.2em] animate-pulse">SCENE ME</h1>
                    </div>
                </div>
            )}

            {/* Header Section - Fixed at top */}
            <div className="shrink-0 text-center space-y-2 max-w-4xl mx-auto pt-2 pb-1 px-4 z-10 relative">
                <div className="space-y-0.5">
                    <h1 className="text-sm md:text-xl font-sans font-thin text-zinc-900 leading-tight tracking-wide uppercase">
                        Tu carrera actoral merece <br /> <span className="font-normal text-primary flex items-center justify-center gap-1">
                            una estrategia ganadora.
                            <button onClick={() => router.push('/antigravity')} className="opacity-10 hover:opacity-100 transition-opacity text-purple-600 animate-pulse" title="???">
                                ✦
                            </button>
                        </span>
                    </h1>
                    <p className="font-sans text-[9px] md:text-[10px] text-zinc-500 font-bold tracking-widest uppercase opacity-90 pt-0.5">
                        Vale, digamos que es suerte... pero no seas idiota, ¡aprende a venderte!
                    </p>
                </div>

                <div className="pt-0">
                    <p className="gold-text animate-none font-sans font-black text-sm md:text-xl uppercase tracking-widest">
                        AQUÍ TIENES EL PLAN PERFECTO
                    </p>
                </div>
            </div>

            {/* FLOATING MOBILE OFFER CTA */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-500 ${showFloatingOffer ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <button
                    onClick={scrollToOffer}
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-2 animate-bounce border-2 border-white/20 whitespace-nowrap"
                >
                    <span>⚠</span> OFERTA LIMITADA: Más info aquí
                </button>
            </div>
            {/* Carousel Section - Takes remaining space and centers vertically */}
            <div className="flex-1 relative flex flex-col justify-center w-full max-w-[100vw] overflow-hidden pb-2">

                {/* Desktop Arrows */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-4 z-20 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-all hidden md:block"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-all hidden md:block"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Mobile Arrows (Active) */}
                <button
                    className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-50 to-transparent z-30 md:hidden flex items-center justify-start pl-2 outline-none touch-manipulation"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="w-8 h-8 text-zinc-400 active:scale-95 transition-transform" />
                </button>
                <button
                    className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-50 to-transparent z-30 md:hidden flex items-center justify-end pr-2 outline-none touch-manipulation"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="w-8 h-8 text-zinc-400 active:scale-95 transition-transform" />
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[12vw] md:px-0 w-full items-center scrollbar-hide lg:grid lg:grid-cols-3 lg:gap-8 lg:px-8 lg:h-auto lg:max-w-7xl lg:mx-auto py-2 touch-pan-y"
                >

                    {/* CARD 1: BOOK */}
                    <div className="min-w-[76vw] md:min-w-0 shrink-0 snap-center bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col h-[62vh] md:h-auto relative shadow-xl lg:shadow-none lg:border-0 lg:rounded-none hover:bg-zinc-50 transition-colors group justify-between">
                        {/* Header Numérico */}
                        <div className="w-full bg-zinc-50 py-2 text-center border-b border-zinc-100 rounded-t-2xl lg:rounded-none -mt-5 -mx-5 mb-4">
                            <span className="font-black text-zinc-400 uppercase tracking-widest text-xs flex justify-center items-center gap-1">
                                EL <span className="text-sm">1</span>er PASO
                            </span>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-base font-bold text-zinc-600 uppercase">Levántate del sofá,</p>
                            <p className="text-base font-bold text-zinc-600 uppercase">busca una buena luz</p>
                            <p className="text-xl font-black text-black bg-primary/20 inline-block px-2 transform -rotate-1 uppercase">y "revélate" al mundo!</p>
                            <p className="text-sm text-zinc-500 italic px-2 leading-tight pt-2">
                                ...pero cuida que sea <br /> <span className="font-bold text-zinc-800 not-italic">CON UN BUEN FOTÓGRAFO.</span>
                            </p>
                        </div>

                        <div className="flex justify-center my-2">
                            <ArrowDown className="w-8 h-8 text-primary animate-bounce stroke-[3]" />
                        </div>

                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <Camera className="w-12 h-12 text-zinc-800" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-black uppercase tracking-tighter mb-0">BOOK</h3>
                                <span className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Actor / Actriz</span>
                            </div>
                            <div className="space-y-2 w-full">
                                <div className="space-y-2 w-full">
                                    <Dialog open={isGalleryOpen} onOpenChange={(open) => {
                                        if (!open && selectedIndex !== null) return;
                                        setIsGalleryOpen(open);
                                        if (!open) setTimeout(() => setVisibleCount(4), 300); // Reset after close
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold tracking-wider h-9 text-xs"
                                                onClick={() => {
                                                    setIsGalleryOpen(true);
                                                    setVisibleCount(4); // Start small for safety
                                                }}
                                            >
                                                VER TRABAJOS
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl bg-white border-zinc-200 text-zinc-900 max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-display font-black uppercase tracking-wider text-black">
                                                    Nuestros Trabajos
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pb-4">
                                                {Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1)
                                                    .slice(0, visibleCount)
                                                    .map((num) => (
                                                        <GalleryGridItem
                                                            key={num}
                                                            num={num}
                                                            onClick={() => {
                                                                // Close gallery first to avoid double-modal issues on mobile
                                                                setIsGalleryOpen(false);
                                                                setTimeout(() => {
                                                                    setSelectedIndex(num);
                                                                    setSelectedVariant(0);
                                                                }, 100);
                                                            }}
                                                        />
                                                    ))}
                                            </div>

                                            {visibleCount < TOTAL_IMAGES && (
                                                <div className="flex justify-center pb-8 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setVisibleCount(prev => Math.min(prev + 4, TOTAL_IMAGES))}
                                                        className="border-zinc-300 text-zinc-600 font-bold uppercase tracking-widest text-xs"
                                                    >
                                                        Cargar Más Fotos...
                                                    </Button>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        className="w-full bg-zinc-900 hover:bg-black text-white font-bold tracking-wider h-10 text-sm"
                                        onClick={() => router.push('/booking?service=book')}
                                    >
                                        <Mail className="mr-2 w-3 h-3" /> RESERVAR FECHA
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: SCENE ME (Central) */}
                        <div className="min-w-[76vw] md:min-w-0 shrink-0 snap-center bg-primary/5 border-2 border-primary/20 rounded-3xl p-5 flex flex-col h-[62vh] md:h-auto relative shadow-2xl lg:shadow-none lg:border-0 lg:rounded-none hover:bg-primary/10 transition-colors z-10 justify-between transform scale-105 md:scale-100">
                            {/* Header Numérico */}
                            <div className="w-full bg-primary text-black py-2 text-center font-black uppercase tracking-widest text-xs shadow-sm rounded-t-2xl lg:rounded-none -mt-5 -mx-5 mb-4">
                                EL CAMINO
                            </div>

                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">Exposición y el mejor enfoque</p>
                                <p className="text-lg font-black text-black leading-tight">
                                    para <span className="text-primary-600 bg-primary/20 px-1">TU MEJOR ESCENA!</span>
                                </p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Estás en el lugar adecuado.</p>
                            </div>

                            {/* Lista Numerada Compacta */}
                            <div className="bg-white/80 p-3 rounded-xl border border-primary/10 shadow-sm space-y-3 text-xs text-left backdrop-blur-sm mt-2">
                                <div className="flex items-start gap-2">
                                    <div className="bg-primary text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">1</div>
                                    <div className="leading-tight">
                                        <span className="text-black font-bold block">Elige tu Pack</span>
                                        <span className="text-[10px] text-zinc-500">1 o 2 escenas.</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="bg-primary text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">2</div>
                                    <div className="leading-tight">
                                        <span className="text-black font-bold block">Personaliza tu guión</span>
                                        <span className="text-[10px] text-zinc-500">Género, ubicación, vestuario...</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="bg-primary text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">3</div>
                                    <div className="leading-tight">
                                        <span className="text-black font-bold block">Reserva y Rueda</span>
                                        <span className="text-[10px] text-zinc-500">Cierra fecha al instante. Recibe material profesional y...</span>
                                        <span className="text-black font-bold block mt-1">¡A RODAR!</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center space-y-2 pt-2">
                                <div className="flex justify-center">
                                    <Clapperboard className="w-10 h-10 text-black animate-clapper" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-display font-black text-black uppercase tracking-tighter mb-0 whitespace-nowrap">SCENE ME</h3>
                                    <span className="text-[9px] font-bold text-primary-600 tracking-[0.2em] uppercase">THE ACTOR'S STORE CONCEPT</span>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full bg-primary hover:bg-primary/90 text-black font-black tracking-widest h-10 text-sm shadow-lg shadow-primary/20"
                                    onClick={() => setStep(1)}
                                >
                                    EMPEZAR AHORA <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>




                        {/* CARD 3: SELF-TAPES */}
                        <div className="min-w-[76vw] md:min-w-0 shrink-0 snap-center bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col h-[62vh] md:h-auto relative shadow-xl lg:shadow-none lg:border-0 lg:rounded-none hover:bg-zinc-50 transition-colors group justify-between">
                            {/* Header Numérico */}
                            <div className="w-full bg-zinc-100 py-2 text-center border-b border-zinc-200 rounded-t-2xl lg:rounded-none -mt-5 -mx-5 mb-4">
                                <span className="font-black text-zinc-600 uppercase tracking-widest text-xs">ÚLTIMO EMPUJÓN</span>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-base font-bold text-zinc-600 leading-tight">
                                    ¡PREPÁRATE para recibir <br /> <span className="text-3xl font-black text-blue-600 animate-shine-text">EL SÍ!</span>
                                </p>
                                <div className="border-l-2 border-blue-400 pl-3 py-1 mx-4 text-left">
                                    <p className="text-xs text-zinc-500 italic leading-tight">
                                        "La suerte es ciega. El Director de Casting, no."
                                    </p>
                                </div>
                            </div>

                            <div className="text-left space-y-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs">
                                <p className="font-bold text-zinc-700 text-[10px] uppercase tracking-wide mb-1">Exprime cada oportunidad:</p>
                                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Iluminación Profesional</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Sonido Perfecto</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Calidad de Imagen</div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">¡Un equipo de dirección para sacar lo mejor de TI!</p>
                                <div className="flex justify-center">
                                    <Film className="w-10 h-10 text-zinc-800" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-0">SELF-TAPES</h3>
                                    <span className="text-[9px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Coaching & Dirección</span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-bold tracking-wider h-9 text-xs"
                                    onClick={() => router.push('/booking?service=selftape')}
                                >
                                    RESERVAR ASESORÍA
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* VIDEO METHOD SECTION */}
                <VideoMethodSection />

                {/* GRAND FINALE: PACKTOR OFFER */}
                <div ref={offerRef} className="w-full bg-zinc-950 border-t-4 border-primary shadow-[0_-20px_60px_rgba(0,0,0,0.7)] z-40 relative shrink-0 pb-8 pt-6 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">

                        {/* Header of the Offer */}
                        <div className="text-center mb-6">
                            <span className="bg-red-600 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                ⚠ Oferta Limitada: Solo 5 plazas
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black text-primary italic tracking-tighter mt-2 leading-none">
                                PACKTOR <span className="text-white">PRO</span>
                            </h2>
                            <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
                                La herramienta definitiva para el actor
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">

                            {/* Col 1: The Visual Equation */}
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center space-y-4">
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">¿Qué te llevas?</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded text-left border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-zinc-800 p-1.5 rounded-full"><Camera className="w-4 h-4 text-primary" /></div>
                                            <span className="text-white font-bold text-sm">BOOK ACTORAL</span>
                                        </div>
                                        <span className="text-zinc-500 font-bold text-xs line-through">150€</span>
                                    </div>
                                    <div className="flex items-center justify-center text-primary font-black text-xs">+</div>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded text-left border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-zinc-800 p-1.5 rounded-full"><Clapperboard className="w-4 h-4 text-primary" /></div>
                                            <span className="text-white font-bold text-sm">ESCENA CINE</span>
                                        </div>
                                        <span className="text-zinc-500 font-bold text-xs line-through">450€</span>
                                    </div>
                                    <div className="flex items-center justify-center text-primary font-black text-xs">+</div>
                                    <div className="flex items-center justify-between bg-black/40 p-3 rounded text-left border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-zinc-800 p-1.5 rounded-full"><Film className="w-4 h-4 text-primary" /></div>
                                            <span className="text-white font-bold text-sm">BONO 5 SELF-TAPES</span>
                                        </div>
                                        <span className="text-zinc-500 font-bold text-xs line-through">250€</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-zinc-400 text-xs">Valor Real: <span className="line-through decoration-red-500 decoration-2 text-white/50">850€</span></p>
                                </div>
                            </div>

                            {/* Col 2: The Detailed List (The "Meat") */}
                            <div className="space-y-3">
                                <h3 className="text-xl font-black text-white uppercase italic text-center md:text-left">
                                    TODO INCLUIDO:
                                </h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <span className="block text-white font-bold text-sm">Sesión de Fotos Completa</span>
                                            <span className="block text-zinc-500 text-xs">5 fotos retocadas + Galería completa.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <span className="block text-white font-bold text-sm">Producción de Escena de Cine</span>
                                            <span className="block text-zinc-500 text-xs">Guion a medida, rodaje 4K, edición cine.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <span className="block text-white font-bold text-sm">Bono de 5 Self-Tapes</span>
                                            <span className="block text-zinc-500 text-xs">Con coaching y dirección de casting real.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <span className="block text-white font-bold text-sm">Asesoría de Perfil</span>
                                            <span className="block text-zinc-500 text-xs">Revisión de CV y material.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Col 3: Price & CTA */}
                            <div className="bg-primary p-6 rounded-3xl text-center shadow-2xl shadow-primary/20 transform scale-100 md:scale-105 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                                <p className="text-black font-bold text-sm uppercase tracking-widest mb-1">Precio Final</p>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="text-black/50 text-xl line-through font-bold">850€</span>
                                    <span className="text-6xl font-black text-black tracking-tighter">660€</span>
                                </div>

                                <Button
                                    className="w-full bg-black hover:bg-zinc-900 text-white font-black tracking-widest h-14 text-lg shadow-xl"
                                    onClick={() => router.push('/booking?service=packtor')}
                                >
                                    ¡LO QUIERO!
                                </Button>
                                <p className="text-[10px] text-black/70 font-bold uppercase tracking-wide mt-3">
                                    *Pago fraccionado disponible
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* LIGHTBOX - SECONDARY RADIX DIALOG */}
                <Dialog open={selectedIndex !== null} onOpenChange={(open) => {
                    if (!open) {
                        setSelectedIndex(null);
                        setSelectedVariant(0);
                        // Re-open gallery when closing lightbox to preserve flow
                        setIsGalleryOpen(true);
                    }
                }}>
                    <DialogContent
                        className="max-w-none w-screen h-[100dvh] bg-white border-none shadow-none p-0 gap-0 rounded-none flex flex-col items-center justify-center outline-none z-[10000] data-[state=open]:slide-in-from-bottom-5"
                        excludeCloseButton={true}
                    >
                        <div
                            className="w-full h-full flex flex-col relative"
                            onClick={(e) => {
                                // Close if clicking outside main content areas (background)
                                if (e.target === e.currentTarget) setSelectedIndex(null);
                            }}
                        >
                            {/* Top Bar with "Volver" & Close */}
                            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-white/90 to-transparent z-[10005]">
                                <button
                                    className="bg-white/90 text-zinc-900 font-bold tracking-wider text-xs px-5 py-3 rounded-full border border-zinc-200 shadow-xl pointer-events-auto active:scale-95 transition-transform flex items-center hover:bg-zinc-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedIndex(null);
                                        setSelectedVariant(0);
                                    }}
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1" /> VOLVER
                                </button>

                                <button
                                    className="text-zinc-500 hover:text-black bg-zinc-100/50 hover:bg-zinc-200/50 p-3 rounded-full pointer-events-auto active:scale-95 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedIndex(null);
                                        setSelectedVariant(0);
                                    }}
                                >
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-zinc-800/75 hover:text-black bg-white/40 hover:bg-white/60 rounded-full backdrop-blur-sm z-[10005] transition-all active:scale-90 touch-manipulation cursor-pointer border border-zinc-200/50 shadow-lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePrev();
                                }}
                            >
                                <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md" />
                            </button>

                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-zinc-800/75 hover:text-black bg-white/40 hover:bg-white/60 rounded-full backdrop-blur-sm z-[10005] transition-all active:scale-90 touch-manipulation cursor-pointer border border-zinc-200/50 shadow-lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleNext();
                                }}
                            >
                                <ChevronRight className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md" />
                            </button>

                            {/* Main Image Area */}
                            <div className="flex-1 flex items-center justify-center p-4 pb-48 w-full h-full overflow-hidden" onClick={() => setSelectedIndex(null)}>
                                {/* Main Lightbox Image - Keep high quality but optimized */}
                                <div className="relative w-full h-full max-w-full max-h-full">
                                    <Image
                                        key={`${selectedIndex}-${selectedVariant}`}
                                        src={getImagePath(selectedIndex || 1, selectedVariant)}
                                        alt="Vista ampliada"
                                        fill
                                        className="object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-auto"
                                        onClick={(e) => e.stopPropagation()}
                                        priority
                                        sizes="100vw"
                                    />
                                </div>
                            </div>

                            {/* Bottom Thumbnail Strips */}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-safe z-[10006] flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>

                                {/* STRIP 1: VARIANTS OF CURRENT PROJECT */}
                                <div className="px-3">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 pl-1">Vistas del Proyecto</p>
                                    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide touch-pan-x">
                                        {[0, 1, 2].map((variant) => {
                                            // Only show variants 1 and 2 if the item actually has them
                                            if (variant > 0 && selectedIndex !== null && !ITEMS_WITH_VARIANTS.includes(selectedIndex)) return null;

                                            return (
                                                <button
                                                    key={variant}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedVariant(variant);
                                                    }}
                                                    className={`shrink-0 w-12 h-16 rounded-md overflow-hidden relative border transition-all cursor-pointer touch-manipulation ${selectedVariant === variant ? 'border-primary ring-1 ring-primary/20 opacity-100' : 'border-zinc-200 opacity-40 hover:opacity-100'
                                                        }`}
                                                >
                                                    <Image
                                                        src={getImagePath(selectedIndex || 1, variant)}
                                                        fill
                                                        className="object-cover pointer-events-none"
                                                        alt={`Var ${variant}`}
                                                        sizes="48px"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* STRIP 2: ALL PROJECTS */}
                                <div className="px-3 bg-zinc-50/90 py-2 border-t border-zinc-200 backdrop-blur-md">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 pl-1">Más Trabajos</p>
                                    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide touch-pan-x">
                                        {Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1).map((num) => (
                                            <button
                                                key={num}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedIndex(num);
                                                    setSelectedVariant(0);
                                                }}
                                                className={`shrink-0 snap-center w-14 h-14 rounded-full overflow-hidden relative border-2 transition-all cursor-pointer touch-manipulation ${selectedIndex === num ? 'border-black scale-110 opacity-100' : 'border-transparent opacity-30 hover:opacity-80'
                                                    }`}
                                            >
                                                <Image
                                                    src={getImagePath(num, 0)}
                                                    fill
                                                    className="object-cover pointer-events-none"
                                                    alt={`Thumb ${num}`}
                                                    sizes="56px"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* GUEST MODE WARNING DIALOG */}
                <Dialog open={showGuestWarning} onOpenChange={setShowGuestWarning}>
                    <DialogContent className="max-w-md bg-zinc-900 border border-yellow-500/20 text-white rounded-2xl shadow-2xl">
                        <div className="flex flex-col items-center text-center space-y-4 py-4">
                            <div className="bg-yellow-500/10 p-4 rounded-full">
                                <AlertTriangle className="w-10 h-10 text-yellow-500 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-black font-display uppercase tracking-wide text-white">
                                Modo Invitado
                            </h2>
                            <p className="text-zinc-400 text-sm leading-relaxed px-4">
                                Estás explorando la plataforma en modo visualización. <br />
                                <span className="text-white font-bold block mt-2">
                                    Recuerda que para contratar los servicios deberás estar registrado.
                                </span>
                            </p>
                            <Button
                                className="w-full bg-yellow-500 text-black font-bold hover:bg-yellow-400"
                                onClick={() => setShowGuestWarning(false)}
                            >
                                ENTENDIDO
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

const GalleryGridItem = ({ num, onClick }: { num: number, onClick: () => void }) => {
    return (
        <button
            className="aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-primary transition-all p-0 border-none outline-none"
            onClick={onClick}
        >
            <img
                src={`/trabajos/${num}.jpg`}
                alt={`Trabajo ${num}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Ampliar</span>
            </div>
        </button>
    );
}
