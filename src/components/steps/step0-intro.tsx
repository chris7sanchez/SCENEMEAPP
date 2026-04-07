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
        <div className="w-full flex flex-col bg-white md:bg-transparent">
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
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <h1 className="text-white font-black text-2xl tracking-[0.2em] animate-pulse">SCENE ME</h1>
                    </div>
                </div>
            )}

            <div className="pt-2 px-4 flex flex-col items-center">
                <p className="text-primary font-black text-4xl md:text-7xl leading-none animate-in slide-in-from-top duration-700 uppercase tracking-tight">
                    Alcanza el éxito
                </p>
                <p className="text-red-600 font-headline font-black text-4xl md:text-9xl p-0 -mt-2 leading-none tracking-tighter filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
                    EN SOLO 3 PASOS!
                </p>

                <div className="pt-6 flex flex-col items-center w-full">
                    <h2 className="font-sans font-black text-zinc-900 text-3xl md:text-6xl uppercase tracking-tighter leading-none mb-1">
                        TU CARRERA ACTORAL
                    </h2>
                    <div className="w-full max-w-[280px] md:max-w-md h-[1px] bg-zinc-200 mb-2" />
                    <p className="text-[10px] md:text-sm font-medium text-zinc-500 tracking-[0.3em] uppercase mb-1">
                        merece una ESTRATEGIA GANADORA
                    </p>
                    <p className="text-primary font-black text-xl md:text-3xl leading-normal block pt-2 pb-8 px-8 relative z-10 -mt-2 uppercase tracking-tight">
                        hoy mismo
                    </p>
                </div>
            </div>

            <div className="relative flex flex-col w-full max-w-[100vw] pb-2">

                {/* Scroll Container (Desktop/Tablet) */}
                <div
                    ref={scrollContainerRef}
                    className="hidden md:flex flex-row items-stretch justify-center gap-24 lg:gap-40 w-full max-w-[95rem] mx-auto px-10 pb-24 pt-10 overflow-x-auto scrollbar-hide snap-x scroll-smooth"
                >
                    {/* CARD 1: BOOK */}
                    <div className="min-w-[76vw] md:min-w-0 md:w-[400px] shrink-0 snap-center bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col h-[62vh] md:h-auto relative shadow-xl lg:shadow-none lg:border-0 lg:rounded-none hover:bg-zinc-50 transition-colors group justify-between">
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
                                <Dialog open={isGalleryOpen} onOpenChange={(open) => {
                                    if (!open && selectedIndex !== null) return;
                                    setIsGalleryOpen(open);
                                    if (!open) setTimeout(() => setVisibleCount(4), 300);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold tracking-wider h-9 text-xs">
                                            VER TRABAJOS
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl bg-white border-zinc-200 text-zinc-900 max-h-[90vh] overflow-y-auto">
                                        <DialogHeader><DialogTitle className="text-2xl font-display font-black uppercase tracking-wider text-black">Nuestros Trabajos</DialogTitle></DialogHeader>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pb-4">
                                            {Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1).slice(0, visibleCount).map((num) => (
                                                <GalleryGridItem key={num} num={num} onClick={() => { setIsGalleryOpen(false); setTimeout(() => { setSelectedIndex(num); setSelectedVariant(0); }, 100); }} />
                                            ))}
                                        </div>
                                        {visibleCount < TOTAL_IMAGES && (
                                            <div className="flex justify-center pb-8 pt-2">
                                                <Button variant="outline" onClick={() => setVisibleCount(prev => Math.min(prev + 4, TOTAL_IMAGES))} className="border-zinc-300 text-zinc-600 font-bold uppercase tracking-widest text-xs">Cargar Más Fotos...</Button>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className="w-full bg-zinc-900 hover:bg-black text-white font-bold tracking-wider h-10 text-sm"
                                    onClick={() => { if (setFlowType) setFlowType('photo'); if (updateForm) updateForm({ serviceType: 'photo' }); setStep(1); }}
                                >
                                    <Mail className="mr-2 w-3 h-3" /> ELEGIR BOOK
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: SCENE ME */}
                    <div className="min-w-[76vw] md:min-w-0 md:w-[420px] shrink-0 snap-center bg-primary/5 border-2 border-primary/20 rounded-3xl p-5 flex flex-col h-[62vh] md:h-auto relative shadow-2xl lg:shadow-none lg:border-0 lg:rounded-none hover:bg-primary/10 transition-colors z-10 justify-between transform scale-105 md:scale-100">
                        <div className="w-full bg-primary text-black py-2 text-center font-black uppercase tracking-widest text-xs shadow-sm rounded-t-2xl lg:rounded-none -mt-5 -mx-5 mb-4">
                            EL CAMINO
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">Exposición y el mejor enfoque</p>
                            <p className="text-lg font-black text-black leading-tight">para <span className="text-primary-600 bg-primary/20 px-1">TU MEJOR ESCENA!</span></p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Estás en el lugar adecuado.</p>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-primary/10 shadow-sm space-y-3 text-xs text-left backdrop-blur-sm mt-2">
                            <div className="flex items-start gap-2">
                                <div className="bg-primary text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">1</div>
                                <div className="leading-tight"><span className="text-black font-bold block">Elige tu Pack</span><span className="text-[10px] text-zinc-500">1 o 2 escenas.</span></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-primary text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">2</div>
                                <div className="leading-tight"><span className="text-black font-bold block">Personaliza tu guión</span><span className="text-[10px] text-zinc-500">Género, ubicación, vestuario...</span></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-primary text-black w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">3</div>
                                <div className="leading-tight"><span className="text-black font-bold block">Reserva y Rueda</span><span className="text-[10px] text-zinc-500">Cierra fecha al instante. Recibe material profesional y...</span><span className="text-black font-bold block mt-1">¡A RODAR!</span></div>
                            </div>
                        </div>
                        <div className="text-center space-y-2 pt-2">
                            <div className="flex justify-center"><Clapperboard className="w-10 h-10 text-black animate-clapper" /></div>
                            <div>
                                <h3 className="text-3xl font-display font-black text-black uppercase tracking-tighter mb-0 whitespace-nowrap">SCENE ME</h3>
                                <span className="text-[9px] font-bold text-primary-600 tracking-[0.2em] uppercase">THE ACTOR'S STORE CONCEPT</span>
                            </div>
                            <Button
                                size="lg"
                                className="w-full bg-primary hover:bg-primary/90 text-black font-black tracking-widest h-10 text-sm shadow-lg shadow-primary/20"
                                onClick={() => { if (setFlowType) setFlowType('scene'); if (updateForm) updateForm({ serviceType: 'scene' }); setStep(1); }}
                            >
                                EMPEZAR AHORA <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* CARD 3: SELF-TAPES */}
                    <div className="min-w-[76vw] md:min-w-0 md:w-[400px] shrink-0 snap-center bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col h-[62vh] md:h-auto relative shadow-xl lg:shadow-none lg:border-0 lg:rounded-none hover:bg-zinc-50 transition-colors group justify-between">
                        <div className="w-full bg-zinc-100 py-2 text-center border-b border-zinc-200 rounded-t-2xl lg:rounded-none -mt-5 -mx-5 mb-4">
                            <span className="font-black text-zinc-600 uppercase tracking-widest text-xs">ÚLTIMO EMPUJÓN</span>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-base font-bold text-zinc-600 leading-tight">¡PREPÁRATE para recibir <br /> <span className="text-3xl font-black text-blue-600 animate-shine-text">EL SÍ!</span></p>
                            <div className="border-l-2 border-blue-400 pl-3 py-1 mx-4 text-left"><p className="text-xs text-zinc-500 italic leading-tight">"La suerte es ciega. El Director de Casting, no."</p></div>
                        </div>
                        <div className="text-left space-y-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs">
                            <p className="font-bold text-zinc-700 text-[10px] uppercase tracking-wide mb-1">Exprime cada oportunidad:</p>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Iluminación Profesional</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Sonido Perfecto</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Calidad de Imagen</div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">¡Un equipo de dirección para sacar lo mejor de TI!</p>
                            <div className="flex justify-center"><Film className="w-10 h-10 text-zinc-800" /></div>
                            <div>
                                <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-0">SELF-TAPES</h3>
                                <span className="text-[9px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Coaching & Dirección</span>
                            </div>
                            <Button variant="outline" className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-bold tracking-wider h-9 text-xs" onClick={() => router.push('/booking?service=selftape')}>
                                RESERVAR ASESORÍA
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MOBILE VIEW */}
                <div className="md:hidden flex flex-col items-center w-full px-4 space-y-4 mb-0">
                    <div className="sticky top-[56px] z-[60] bg-white/95 backdrop-blur-md py-4 w-full flex justify-center border-b border-zinc-100 -mx-4 px-4 shadow-sm">
                        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                            {[
                                { id: 0, Icon: Camera, label: "FOTO" },
                                { id: 1, Icon: Clapperboard, label: "ESCENA" },
                                { id: 2, Icon: Film, label: "TAPES" }
                            ].map(({ id, Icon, label }) => (
                                <button key={id} onClick={() => { setSelectedIndex(null); const card = document.getElementById(`mobile-card-${id}`); card?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
                                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-zinc-100 shadow-sm bg-white hover:border-primary/40 transition-colors">
                                        <Icon className="w-6 h-6 text-zinc-800" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-red-600 text-xl font-black">{id + 1}</span>
                                        <span className="text-[8px] font-black tracking-widest uppercase text-zinc-900">{label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full space-y-12 pt-6 pb-20">
                        {/* MOBILE CARD 1: BOOK */}
                        <div id="mobile-card-0" className="bg-white border border-zinc-50 rounded-[2.5rem] p-8 flex flex-col shadow-xl relative scroll-mt-20 overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100"><span className="text-zinc-300 font-bold uppercase tracking-widest text-[10px]">PASO 1</span></div>
                                <Camera className="w-8 h-8 text-black opacity-80" />
                            </div>
                            <div className="relative mb-6 mt-2">
                                <p className="text-red-600 text-3xl font-black leading-none -rotate-1 mb-4 uppercase">¡Prepárate!</p>
                                <h3 className="text-3xl font-black text-black uppercase leading-[0.9] tracking-tighter">TU BOOK ACTORAL</h3>
                            </div>
                            <p className="text-sm text-zinc-400 italic mb-6 font-medium">Levántate del sofá y "revélate" al mundo con <span className="font-bold not-italic text-zinc-700">un buen fotógrafo.</span></p>
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 bg-zinc-100 border-none text-zinc-600 h-10 text-[10px] font-black tracking-widest rounded-full" onClick={() => { setIsGalleryOpen(true); setVisibleCount(4); }}>VER TRABAJOS</Button>
                                <Button className="flex-1 bg-black text-white h-10 text-[10px] font-black tracking-widest rounded-full shadow-lg" onClick={() => { if (setFlowType) setFlowType('photo'); if (updateForm) updateForm({ serviceType: 'photo' }); setStep(1); }}>EMPEZAR AHORA</Button>
                            </div>
                        </div>

                        {/* MOBILE CARD 2: SCENE ME */}
                        <div id="mobile-card-1" className="bg-[#FFFBEB] border border-mustard-gold/30 rounded-[2.5rem] p-8 flex flex-col shadow-xl relative scroll-mt-20 overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-mustard-gold text-black px-4 py-2 rounded-full border border-mustard-gold shadow-sm flex items-center gap-2">
                                    <span className="font-black uppercase tracking-widest text-[10px]">EL CAMINO</span>
                                </div>
                                <Clapperboard className="w-8 h-8 text-black opacity-80" />
                            </div>
                            <div className="relative mb-6 mt-4">
                                <p className="text-red-600 text-3xl font-black leading-none -rotate-1 mb-4 uppercase">¡Crea y rueda!</p>
                                <h3 className="text-3xl font-black text-black uppercase leading-tight tracking-tighter">TU MEJOR ESCENA</h3>
                                <div className="mt-2 mb-6"><span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full border border-zinc-200 uppercase tracking-wide">5 PLAZAS DISPONIBLES</span></div>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full bg-black text-white h-10 text-[10px] font-black tracking-widest rounded-full shadow-lg" onClick={() => { if (updateForm) updateForm({ serviceType: 'scene' }); setStep(1); }}>EMPEZAR AHORA</button>
                                <button onClick={() => router.push('/booking?service=scene')} className="w-full bg-[#E11D48] text-white rounded-full h-10 flex items-center justify-center gap-2 font-black text-[10px] tracking-widest uppercase shadow-lg"><AlertTriangle className="w-3 h-3 text-white" /> OFERTA LIMITADA: MÁS INFO AQUÍ</button>
                            </div>
                        </div>

                        {/* MOBILE CARD 3: SELF-TAPES */}
                        <div id="mobile-card-2" className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 flex flex-col shadow-xl relative scroll-mt-20 overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-zinc-100 text-zinc-400 px-4 py-1.5 rounded-full border border-zinc-200"><span className="font-bold uppercase tracking-widest text-[10px]">PASO 3</span></div>
                                <Film className="w-8 h-8 text-black opacity-80" />
                            </div>
                            <div className="relative mb-4 mt-4">
                                <p className="text-red-600 text-3xl font-black leading-none -rotate-1 mb-3 uppercase">¡Asegúrate!</p>
                                <p className="text-base font-bold text-zinc-600 leading-tight mb-1">¡PREPÁRATE para recibir <br /><span className="text-3xl font-black text-blue-600 animate-shine-text">EL SÍ!</span></p>
                                <h3 className="text-3xl font-black text-black uppercase leading-[0.9] tracking-tighter mt-3">TUS MEJORES<br />SELF-TAPES</h3>
                            </div>
                            <p className="text-sm text-zinc-400 italic mb-8 font-medium">"La suerte es ciega. El Director de Casting, no."</p>
                            <Button variant="outline" className="w-full border-2 border-primary text-black hover:bg-primary/5 font-black h-14 text-[11px] tracking-widest rounded-xl shadow-sm" onClick={() => { if (setFlowType) setFlowType('photo'); if (updateForm) updateForm({ serviceType: 'photo', photoType: 'event' }); setStep(1); }}>RESERVAR ASESORÍA</Button>
                        </div>
                    </div>
                </div>

                {/* GRAND FINALE: PACKTOR OFFER */}
                <div ref={offerRef} className="w-full bg-zinc-950 border-t-4 border-primary shadow-[0_-20px_60px_rgba(0,0,0,0.7)] z-40 relative shrink-0 pb-6 pt-4 px-4 md:px-8">
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
                                <Button className="w-full bg-black hover:bg-zinc-900 text-white font-black tracking-widest h-14 text-lg shadow-xl" onClick={() => router.push('/booking?service=packtor')}>¡LO QUIERO!</Button>
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
                    <DialogContent className="max-w-none w-screen h-[100dvh] bg-white border-none shadow-none p-0 gap-0 rounded-none flex flex-col items-center justify-center outline-none z-[10000]" excludeCloseButton={true}>
                        <div className="w-full h-full flex flex-col relative" onClick={(e) => { if (e.target === e.currentTarget) setSelectedIndex(null); }}>
                            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-white/90 to-transparent z-[10005]">
                                <button className="bg-white/90 text-zinc-900 font-bold tracking-wider text-xs px-5 py-3 rounded-full border border-zinc-200 shadow-xl flex items-center" onClick={() => setSelectedIndex(null)}><ChevronLeft className="w-5 h-5 mr-1" /> VOLVER</button>
                                <button className="text-zinc-500 hover:text-black bg-zinc-100/50 p-3 rounded-full" onClick={() => setSelectedIndex(null)}><X className="w-8 h-8" /></button>
                            </div>

                            <button className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-zinc-800 bg-white/40 rounded-full z-[10005]" onClick={(e) => { e.stopPropagation(); handlePrev(); }}><ChevronLeft className="w-8 h-8" /></button>
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-zinc-800 bg-white/40 rounded-full z-[10005]" onClick={(e) => { e.stopPropagation(); handleNext(); }}><ChevronRight className="w-8 h-8" /></button>

                            <div className="flex-1 flex items-center justify-center p-4 pb-48 w-full h-full"><Image key={`${selectedIndex}-${selectedVariant}`} src={getImagePath(selectedIndex || 1, selectedVariant)} alt="Vista" fill className="object-contain" sizes="100vw" /></div>

                            <div className="absolute bottom-0 left-0 w-full bg-white pt-8 pb-4 flex flex-col gap-2">
                                <div className="px-3"><p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Proyecto</p><div className="flex gap-2 overflow-x-auto">{[0, 1, 2].map((v) => (selectedIndex !== null && (v === 0 || ITEMS_WITH_VARIANTS.includes(selectedIndex))) && <button key={v} onClick={() => setSelectedVariant(v)} className={`w-12 h-16 border rounded ${selectedVariant === v ? 'border-primary' : 'border-zinc-200'}`}><Image src={getImagePath(selectedIndex, v)} fill className="object-cover" alt="v" /></button>)}</div></div>
                                <div className="px-3 bg-zinc-50 py-2 border-t"><p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Más</p><div className="flex gap-2 overflow-x-auto">{Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => { setSelectedIndex(n); setSelectedVariant(0); }} className={`w-14 h-14 rounded-full border-2 overflow-hidden ${selectedIndex === n ? 'border-black' : 'border-transparent'}`}><Image src={getImagePath(n, 0)} fill className="object-cover" alt="n" /></button>)}</div></div>
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
