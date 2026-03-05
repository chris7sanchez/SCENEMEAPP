'use client';

import { useState } from "react";
import { PHOTO_TYPES, PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL, PHOTO_GALLERY } from "@/lib/data";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Camera, User, Sparkles, Mail, Check, Star, Info, Image as ImageIcon, Aperture, Focus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step1PhotoSelectionProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
    setFlowType: (type: 'scene' | 'photo') => void;
}

export default function Step1PhotoSelection({ formData, updateForm, setStep, setFlowType }: Step1PhotoSelectionProps) {
    const [selectedType, setSelectedType] = useState<string>(formData.photoType || 'actor');

    const handleSelectType = (id: string) => {
        setSelectedType(id);
        if (id === 'event') {
            updateForm({ serviceType: 'photo', photoType: 'event' });
        } else {
            updateForm({ photoType: id as any, serviceType: 'photo' });
        }
    };

    const handleSelectPack = (packId: string) => {
        updateForm({ photoPack: packId });
    };

    const handleContinue = () => {
        if (selectedType === 'event') {
            window.location.href = "mailto:contacto@sceneme.com?subject=Consulta%20Personalizada";
            return;
        }
        setStep(2); // Go to Dates
    };

    const currentPacks = selectedType === 'editorial' ? PHOTO_PACKS_EDITORIAL :
        selectedType === 'conceptual' ? PHOTO_PACKS_CONCEPTUAL :
            PHOTO_PACKS_ACTOR;

    const currentTypeData = PHOTO_TYPES.find(t => t.id === selectedType);

    const getSamples = (type: string) => {
        return (PHOTO_GALLERY as any)[type] || PHOTO_GALLERY.default;
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 h-full">

            {/* LAB HEADER (Internal) */}
            <div className="mb-8 space-y-2">
                <div className="flex items-center gap-3">
                    <span className="bg-white text-black text-[10px] font-black px-3 py-1 uppercase tracking-[0.3em]">Laboratorio Visual</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                    Configura tu <span className="text-zinc-600">Sesión</span>
                </h1>
            </div>

            {/* Main Application Window (Adaptive & Full Height) */}
            <div className="flex flex-col lg:flex-row border border-technical bg-studio-matte w-full flex-1 min-h-[700px] overflow-hidden rounded-sm shadow-2xl relative studio-rim-light">

                {/* Atmospheric Layer: Light Leak */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none animate-light-leak z-0" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none animate-light-leak z-0" />

                {/* SIDEBAR: NAV-STRIP */}
                <aside className="w-full lg:w-[280px] bg-black border-r border-zinc-900 flex flex-col shrink-0 relative overflow-hidden">
                    {/* Viewfinder Decorative Brackets */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20 pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20 pointer-events-none" />

                    <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)] animate-pulse" />
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.5em]">LENS_SELECT</p>
                        </div>

                        <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hide">
                            {PHOTO_TYPES.map((type, idx) => {
                                const Icon = type.id === 'actor' ? User :
                                    type.id === 'editorial' ? Camera :
                                        type.id === 'conceptual' ? Sparkles : Mail;
                                const isActive = selectedType === type.id;

                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => handleSelectType(type.id)}
                                        className={cn(
                                            "group w-full flex flex-col p-6 transition-all duration-700 relative border-l-2",
                                            isActive
                                                ? "bg-white/[0.05] border-white text-phosphor"
                                                : "border-transparent text-zinc-300 hover:text-white hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3 text-zinc-400">
                                            <Icon className={cn("w-5 h-5 transition-all duration-500", isActive ? "scale-110 text-white" : "group-hover:text-zinc-200")} />
                                            <span className="text-[9px] font-mono opacity-40">AUTO_F_0{idx + 1}</span>
                                        </div>
                                        <h3 className="font-black text-base tracking-tighter uppercase leading-none mb-1">
                                            {type.label}
                                        </h3>
                                        <p className="text-[9px] font-bold uppercase tracking-wider opacity-40 truncate">
                                            {type.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-900">
                            <div className="flex items-center gap-5 text-zinc-700">
                                <Focus className="w-6 h-6 shrink-0 opacity-20" />
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Digital Neg. Process</p>
                                    <p className="text-[10px] font-medium leading-snug italic text-zinc-600">Fidelity Enhancement v2.0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CONTENT AREA: EXPERIMENTAL DARKROOM */}
                <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative group/main z-10">
                    {/* Visual Overlay: Exposure Scale */}
                    <div className="absolute top-0 left-0 w-full h-8 flex items-center justify-between px-10 opacity-10 pointer-events-none z-50">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className={cn("bg-white", i % 10 === 0 ? "h-3 w-[1px]" : i % 5 === 0 ? "h-2 w-[1px]" : "h-1 w-[1px]")} />
                        ))}
                    </div>

                    {selectedType === 'event' ? (
                        <div className="flex flex-col items-center justify-center min-h-full py-20 px-10 text-center animate-in fade-in duration-1000">
                            <div className="w-32 h-32 bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.05)] rotate-3 hover:rotate-0 transition-transform duration-700">
                                <Mail className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic mb-8">
                                On<br /><span className="text-zinc-800">Request</span>
                            </h3>
                            <p className="text-zinc-500 text-lg max-w-lg mb-12 font-bold uppercase tracking-tight leading-relaxed">
                                Sesiones personalizadas, marcas y campañas. Cuéntanos tu idea y la haremos realidad.
                            </p>
                            <Button
                                size="lg"
                                onClick={handleContinue}
                                className="bg-white text-black hover:bg-zinc-200 font-black tracking-[0.3em] px-16 h-20 text-xl rounded-none transition-all shadow-2xl"
                            >
                                CONTACTAR
                            </Button>
                        </div>
                    ) : (
                        <div className="p-10 md:p-14 lg:p-20 space-y-20 lg:space-y-32 w-full max-w-6xl">

                            {/* Head Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] whitespace-nowrap">Exposure Data</span>
                                    <div className="h-px flex-1 bg-zinc-900" />
                                </div>
                                <div className="relative">
                                    <h2 className="text-8xl md:text-10xl lg:text-11xl font-black text-white uppercase tracking-tighter italic leading-[0.8] select-none transition-all duration-1000 hover:tracking-normal cursor-default" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}>
                                        {currentTypeData?.label.replace('Book ', '')}
                                    </h2>
                                    <div className="absolute -top-4 -right-4 flex flex-col items-end gap-1 opacity-20 font-mono text-[10px]">
                                        <span>ISO 400</span>
                                        <span>F/2.8</span>
                                        <span>1/250s</span>
                                    </div>
                                </div>
                                <p className="text-zinc-500 text-base md:text-lg lg:text-xl max-w-4xl font-medium uppercase tracking-tight leading-relaxed">
                                    {selectedType === 'actor'
                                        ? "La herramienta definitiva para el actor. Una sesión diseñada para capturar tu esencia real, sin artificios, lista para el mercado profesional."
                                        : selectedType === 'editorial'
                                            ? "Moda y actitud. Una propuesta visual de alto impacto que eleva tu marca personal a estándares de publicación internacional."
                                            : "Creatividad sin límites. Escenografía, luz experimental y narrativa visual para perfiles que buscan una imagen icónica."
                                    }
                                </p>
                            </div>

                            {/* FILM STRIP: High Precision Layout */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em]">Contact Print Selection</p>
                                    <p className="text-[10px] font-mono text-zinc-800 tracking-tighter">EMULSION: 4429-PX-22</p>
                                </div>
                                <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide py-4 snap-x items-center">
                                    {getSamples(selectedType).map((item: { src: string, isWide: boolean }, i: number) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "relative shrink-0 bg-zinc-950 overflow-hidden group border border-zinc-900 hover:border-zinc-100 transition-all duration-700 snap-center",
                                                item.isWide ? "w-[500px] md:w-[700px] aspect-[16/9]" : "w-[280px] md:w-[350px] aspect-[4/5]"
                                            )}
                                        >
                                            {/* Film Frame Visuals */}
                                            <div className="absolute top-0 bottom-0 left-0 w-6 bg-black border-r border-zinc-900 flex flex-col items-center justify-center gap-10 z-20 py-10">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <div key={p} className="w-3 h-3 border border-zinc-800 bg-zinc-950/20" />)}
                                            </div>
                                            <div className="absolute top-3 right-6 z-30 text-[10px] font-mono text-white/40 group-hover:text-white/80 transition-colors">PX-{i + 1}</div>

                                            <Image
                                                src={item.src}
                                                alt="Gallery Frame"
                                                fill
                                                className="object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                                            />
                                            {/* Burn effect overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* INVESTMENT GRID: Clean & Professional */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <p className="text-[11px] font-black text-zinc-200 uppercase tracking-[0.5em]">Packs & Services</p>
                                    <div className="h-px flex-1 bg-zinc-900" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 pb-20">
                                    {currentPacks.map((pack) => {
                                        const isSelected = formData.photoPack === pack.id;
                                        return (
                                            <button
                                                key={pack.id}
                                                onClick={() => handleSelectPack(pack.id)}
                                                className={cn(
                                                    "group relative p-10 transition-all duration-700 flex flex-col text-left border overflow-hidden",
                                                    isSelected
                                                        ? "bg-white text-black border-white shadow-[0_0_60px_rgba(255,255,255,0.1)]"
                                                        : "bg-[#080808] border-zinc-900 hover:border-zinc-400"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-8 relative z-10">
                                                    <div>
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-[0.2em] block mb-2",
                                                            isSelected ? "text-black/50" : "text-zinc-600"
                                                        )}>
                                                            Level_0{pack.id === 'essential' ? '1' : pack.id === 'complete' ? '2' : '3'}
                                                        </span>
                                                        <h4 className="font-black text-2xl lg:text-3xl uppercase tracking-tighter leading-none italic">
                                                            {pack.label}
                                                        </h4>
                                                    </div>
                                                    <div className={cn(
                                                        "w-8 h-8 border flex items-center justify-center transition-all duration-500",
                                                        isSelected ? "bg-black border-black text-white scale-110" : "border-zinc-800 text-transparent group-hover:border-zinc-500"
                                                    )}>
                                                        {isSelected && <Check className="w-5 h-5" />}
                                                    </div>
                                                </div>

                                                <div className="text-5xl lg:text-6xl font-black mb-10 tracking-tighter relative z-10">
                                                    {pack.price}
                                                </div>

                                                <ul className="space-y-4 mb-14 flex-1 relative z-10">
                                                    {pack.features.slice(0, 4).map((f, i) => (
                                                        <li key={i} className={cn(
                                                            "text-[11px] uppercase font-black tracking-widest flex items-center gap-4",
                                                            isSelected ? "text-black/80" : "text-zinc-500"
                                                        )}>
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-black/20" : "bg-zinc-800")} />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div className={cn(
                                                    "w-full py-5 text-[11px] font-black text-center uppercase tracking-[0.5em] transition-all duration-500 relative z-10",
                                                    isSelected ? "bg-black text-white hover:bg-zinc-900" : "bg-zinc-900 text-zinc-500 group-hover:bg-white group-hover:text-black shadow-xl"
                                                )}>
                                                    {isSelected ? "SELECCIONADO" : "ELEGIR"}
                                                </div>

                                                {/* Visual decoration for active card */}
                                                {pack.id === 'complete' && (
                                                    <div className="absolute top-0 right-0 bg-black text-white text-[9px] font-black px-4 py-2 uppercase tracking-[0.3em] italic z-20">
                                                        Best Selection
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* FOOTER BAR (Internal) */}
            <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                <Button
                    variant="ghost"
                    onClick={() => setStep(0)}
                    className="text-zinc-600 hover:text-white transition-all uppercase font-black text-xs tracking-[0.4em] group"
                >
                    <ArrowLeft className="mr-3 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Terminar Sesión
                </Button>

                <div className="flex items-center gap-10">
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Current Flow</p>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                            System Active <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={selectedType !== 'event' && !formData.photoPack}
                        className="bg-white text-black hover:bg-zinc-100 font-black tracking-[0.4em] px-14 h-16 rounded-none text-base border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-20 disabled:grayscale group"
                    >
                        {selectedType === 'event' ? 'ENVIAR CONSULTA' : 'RESERVAR DÍAS'} <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
