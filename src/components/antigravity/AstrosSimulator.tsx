'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Home, Shield, Zap, Info, ChevronRight, RotateCcw } from 'lucide-react';
import { Astro, Casa, Signo, INITIAL_ASTROS, INITIAL_CASAS, INITIAL_SIGNOS } from '@/lib/astrologia';
import { interpretAstrology } from '@/lib/interpreter';
import { cn } from '@/lib/utils';

export default function AstrosSimulator() {
    const [selectedAstro, setSelectedAstro] = useState<Astro | null>(null);
    const [selectedCasa, setSelectedCasa] = useState<Casa | null>(null);
    const [selectedSigno, setSelectedSigno] = useState<Signo | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (selectedAstro && selectedCasa && selectedSigno) {
            setIsGenerating(true);
            const timer = setTimeout(() => {
                setInterpretation(interpretAstrology(selectedAstro, selectedCasa, selectedSigno));
                setIsGenerating(false);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setInterpretation('');
        }
    }, [selectedAstro, selectedCasa, selectedSigno]);

    const reset = () => {
        setSelectedAstro(null);
        setSelectedCasa(null);
        setSelectedSigno(null);
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-zinc-100 p-4 md:p-8 font-serif selection:bg-amber-500/30">
            {/* Background elements inherited from VisualEngine style */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            <main className="max-w-6xl mx-auto relative z-10 pt-10">
                <header className="mb-12 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"
                    >
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-amber-500/80">Laboratorio de Arquetipos</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Simulador de <span className="text-amber-500">Relaciones</span>
                    </h1>
                    <p className="text-zinc-500 max-w-xl text-lg leading-relaxed">
                        Explora cómo las fuerzas celestiales se manifiestan en diferentes escenarios de la vida bajo distintos modificadores de personalidad.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT PANEL: Selection */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* ASTROS */}
                        <section>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mb-4 px-2">Personajes (Astros)</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {INITIAL_ASTROS.map((astro) => (
                                    <button
                                        key={astro.id}
                                        onClick={() => setSelectedAstro(astro)}
                                        className={cn(
                                            "aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group",
                                            selectedAstro?.id === astro.id
                                                ? "bg-white border-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                                : "bg-zinc-900/50 border-white/5 hover:border-white/20"
                                        )}
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{astro.emoji}</span>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-wider",
                                            selectedAstro?.id === astro.id ? "text-zinc-950" : "text-zinc-500"
                                        )}>{astro.nombre}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* CASAS */}
                        <section>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mb-4 px-2">Escenarios (Casas)</h3>
                            <div className="space-y-2">
                                {INITIAL_CASAS.map((casa) => (
                                    <button
                                        key={casa.id}
                                        onClick={() => setSelectedCasa(casa)}
                                        className={cn(
                                            "w-full px-5 py-3 rounded-xl border transition-all flex items-center justify-between group",
                                            selectedCasa?.id === casa.id
                                                ? "bg-amber-500 border-amber-500 text-zinc-950"
                                                : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono opacity-50">#{casa.numero}</span>
                                            <span className="text-sm font-bold tracking-tight">{casa.nombre}</span>
                                        </div>
                                        <Home size={14} className={selectedCasa?.id === casa.id ? "text-zinc-950" : "text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"} />
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* SIGNOS */}
                        <section>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mb-4 px-2">Modificadores (Signos)</h3>
                            <div className="flex flex-wrap gap-2">
                                {INITIAL_SIGNOS.map((signo) => (
                                    <button
                                        key={signo.id}
                                        onClick={() => setSelectedSigno(signo)}
                                        className={cn(
                                            "px-4 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all",
                                            selectedSigno?.id === signo.id
                                                ? "bg-zinc-100 border-white text-zinc-950"
                                                : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/20"
                                        )}
                                    >
                                        {signo.nombre}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </aside>

                    {/* RIGHT PANEL: Simulation Display */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="relative aspect-video lg:aspect-auto lg:h-[600px] w-full bg-zinc-900/30 rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-3xl flex items-center justify-center p-8">

                            {/* Visual Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <svg width="100%" height="100%">
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                                    </pattern>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            <AnimatePresence mode="wait">
                                {!selectedAstro && !selectedCasa && !selectedSigno ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center space-y-4"
                                    >
                                        <div className="w-24 h-24 rounded-full border border-dashed border-white/10 mx-auto flex items-center justify-center">
                                            <Zap size={32} className="text-zinc-800" />
                                        </div>
                                        <p className="text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-black">Selecciona componentes para iniciar la simulación</p>
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center relative">

                                        {/* State Engine Visualization */}
                                        <div className="relative z-20 mb-12 flex items-center justify-center">

                                            {/* ASTRO VISUAL */}
                                            <motion.div
                                                layoutId="astro-visual"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="relative"
                                            >
                                                <div
                                                    className="w-48 h-48 rounded-full blur-[60px] absolute inset-0 opacity-40 mix-blend-screen animate-pulse"
                                                    style={{ backgroundColor: selectedAstro?.color || '#333' }}
                                                />
                                                <div className="relative w-40 h-40 rounded-full border-4 border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-2 shadow-2xl">
                                                    <span className="text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{selectedAstro?.emoji || '❔'}</span>
                                                    <motion.span
                                                        animate={{ y: [0, -5, 0] }}
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                        className="text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        {selectedAstro?.personalidad || '---'}
                                                    </motion.span>
                                                </div>

                                                {/* Orbiting Elements */}
                                                <AnimatePresence>
                                                    {selectedCasa && (
                                                        <motion.div
                                                            initial={{ rotate: 0, opacity: 0 }}
                                                            animate={{ rotate: 360, opacity: 1 }}
                                                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                                            className="absolute -inset-10 border border-white/5 rounded-full pointer-events-none"
                                                        >
                                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500 rounded-full text-[8px] font-black text-zinc-950 uppercase tracking-tighter shadow-lg">
                                                                {selectedCasa.nombre}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <AnimatePresence>
                                                    {selectedSigno && (
                                                        <motion.div
                                                            initial={{ rotate: 180, opacity: 0 }}
                                                            animate={{ rotate: -180, opacity: 1 }}
                                                            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                                                            className="absolute -inset-20 border border-white/5 rounded-full pointer-events-none"
                                                        >
                                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-3 py-1 bg-white rounded-full text-[8px] font-black text-zinc-950 uppercase tracking-tighter shadow-lg">
                                                                {selectedSigno.nombre}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </div>

                                        {/* INTERPRETATION DIALOGUE */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full max-w-lg bg-zinc-950/80 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative"
                                        >
                                            <div className="absolute -top-3 left-10 px-4 py-1 bg-zinc-900 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                                Interpretación Fractal
                                            </div>

                                            {isGenerating ? (
                                                <div className="flex gap-2 items-center py-4">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100" />
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6 italic text-zinc-200">
                                                        {interpretation || 'Combina los tres elementos para revelar la energía resultante...'}
                                                    </p>

                                                    {interpretation && (
                                                        <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Conceptos clave:</div>
                                                            <span className="text-[10px] bg-zinc-900 px-3 py-1 rounded-full text-amber-500 border border-amber-500/20">{selectedAstro?.capacidad}</span>
                                                            <span className="text-[10px] bg-zinc-900 px-3 py-1 rounded-full text-zinc-300 border border-white/10">{selectedCasa?.ambito}</span>
                                                            <span className="text-[10px] bg-zinc-900 px-3 py-1 rounded-full text-zinc-300 border border-white/10">{selectedSigno?.adjetivo}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>

                                        {/* Reset Button */}
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={reset}
                                            className="absolute bottom-4 right-4 p-4 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 transition-colors group"
                                        >
                                            <RotateCcw size={20} className="group-hover:rotate-[-90deg] transition-transform duration-500" />
                                        </motion.button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
