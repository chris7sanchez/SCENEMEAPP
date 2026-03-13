import React, { useState } from 'react';
import { Sparkles, Flame, Droplets, Wind, Mountain, Settings2, Zap, Target } from 'lucide-react';

interface AlchemicalState {
    fire: number;
    water: number;
    air: number;
    earth: number;
}

export default function AlchemicalTransmutator() {
    const [elements, setElements] = useState<AlchemicalState>({ fire: 40, water: 20, air: 20, earth: 20 });
    const [intensity, setIntensity] = useState(50);
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [manualTactic, setManualTactic] = useState<any>(null);

    const handleIntentClick = (intentId: string) => {
        setManualTactic(null);
        setSelectedIntent(intentId);
        const newElements = { ...elements };
        if (intentId === 'dominate') { newElements.fire = 80; newElements.earth = 60; newElements.water = 15; newElements.air = 20; }
        else if (intentId === 'seduce') { newElements.fire = 25; newElements.earth = 15; newElements.water = 85; newElements.air = 45; }
        else if (intentId === 'evade') { newElements.fire = 10; newElements.earth = 35; newElements.water = 40; newElements.air = 90; }
        else if (intentId === 'reveal') { newElements.fire = 55; newElements.earth = 10; newElements.water = 30; newElements.air = 75; }
        setElements(newElements);
    };

    const handleDeepSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            if (!selectedIntent) {
                // Generar táctica basada en el elemento dominante
                const dominant = Object.entries(elements).reduce((a, b) => a[1] > b[1] ? a : b)[0];
                const customTactics = {
                    fire: {
                        gesto: "Un golpe súbito de aliento hacia afuera, tensando los puños a los costados.",
                        cuerpo: "Azufre Volcánico",
                        voz: "Impacto Metálico",
                        secreto: "Tu mezcla actual tiene exceso de Fuego. Úsalo para romper el ritmo del otro actor mediante interrupciones físicas."
                    },
                    water: {
                        gesto: "Dejar que la mirada se pierda ligeramente mientras el peso del cuerpo baila entre los talones.",
                        cuerpo: "Espejo de Mercurio",
                        voz: "Corriente Subcero",
                        secreto: "El Agua predomina. No actúes la emoción, deja que el cuerpo 'flote' en la incertidumbre de la escena."
                    },
                    earth: {
                        gesto: "Presionar las plantas de los pies contra el suelo como si quisieras hundirte en la madera.",
                        cuerpo: "Sal de Plomo",
                        voz: "Gravidez Profunda",
                        secreto: "Estás muy anclado a Tierra. Usa esa inmovilidad para intimidar; que el otro se mueva alrededor de tu silencio."
                    },
                    air: {
                        gesto: "Girar levemente la cabeza al hablar, como si escucharas una frecuencia lejana.",
                        cuerpo: "Vapor de Antimonio",
                        voz: "Frecuencia Etérea",
                        secreto: "El Aire es tu guía. Habla rápido pero sin peso, como si tus palabras fueran pensamientos que se escapan."
                    }
                };
                setManualTactic(customTactics[dominant as keyof typeof customTactics]);
            }
            setIsSyncing(false);
        }, 3000);
    };

    const updateElement = (key: keyof AlchemicalState, delta: number) => {
        setElements(prev => ({
            ...prev,
            [key]: Math.min(100, Math.max(0, prev[key] + delta))
        }));
        setSelectedIntent(null); // Entramos en modo manual
    };

    const tactics = {
        dominate: {
            gesto: "Expandir el pecho y proyectar la energía desde el plexo solar hacia el oponente como un muro de fuego.",
            cuerpo: "Oro Hirviente",
            voz: "Comando Solar",
            secreto: "Tu Marte está activo: no pidas permiso, ocupa el espacio físico antes de hablar. El silencio es tu arma de poder."
        },
        seduce: {
            gesto: "Suavizar la columna y permitir que el peso caiga hacia la pelvis, manteniendo una tensión elástica en los brazos.",
            cuerpo: "Plata Fluida",
            voz: "Susurro de Venus",
            secreto: "Usa tu Neptuno: mira a través de sus ojos, no a sus ojos. Desdibuja los límites de la escena con tu fragancia."
        },
        evade: {
            gesto: "Moverse desde las articulaciones periféricas (muñecas, tobillos) como si el aire te empujara constantemente.",
            cuerpo: "Mercurio Volátil",
            voz: "Eco de Aire",
            secreto: "Tu Saturno te protege: crea una estructura invisible de desapego emocional. Responde siempre con una pregunta."
        },
        reveal: {
            gesto: "Abrir las palmas y permitir que el mentón se eleve, exponiendo la garganta mientras inhalas el entorno.",
            cuerpo: "Cristal de Tierra",
            voz: "Verdad Profunda",
            secreto: "Tu Urano pide originalidad: rompe el ritmo de la frase en el momento menos esperado. La verdad debe sentirse como un rayo."
        }
    };

    const currentTactic = selectedIntent ? tactics[selectedIntent as keyof typeof tactics] : null;

    return (
        <div className="w-full min-h-[600px] bg-neutral-950 text-white p-8 font-sans border border-white/5 relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C55959]/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#C55959]/20 transition-colors duration-1000"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Intent Selection */}
                <div className="lg:col-span-4 space-y-8">
                    <div>
                        <h3 className="text-[10px] tracking-[0.4em] uppercase font-black text-[#C55959] mb-2">Transmutador</h3>
                        <h2 className="text-4xl font-display tracking-tight leading-none">INTENCIÓN<br/>ESCÉNICA</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'dominate', label: 'Dominar', color: '#EF4444' },
                            { id: 'seduce', label: 'Seducir', color: '#EC4899' },
                            { id: 'evade', label: 'Evadir', color: '#60A5FA' },
                            { id: 'reveal', label: 'Revelar', color: '#FBBF24' }
                        ].map(intent => (
                            <button
                                key={intent.id}
                                onClick={() => handleIntentClick(intent.id)}
                                className={`flex items-center justify-between px-6 py-5 border transition-all duration-500 rounded-none group ${selectedIntent === intent.id ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                            >
                                <span className="uppercase text-xs font-bold tracking-[0.2em]">{intent.label}</span>
                                <Target size={16} className={selectedIntent === intent.id ? 'text-black' : 'text-white/20'} />
                            </button>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-6">
                        <div>
                            <label className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4 block italic">Intensidad de Mercurio (Volatilidad)</label>
                            <input 
                                type="range" 
                                className="w-full accent-[#C55959] bg-white/10 h-1 appearance-none cursor-pointer"
                                value={intensity}
                                onChange={(e) => setIntensity(parseInt(e.target.value))}
                            />
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-white/20 font-mono text-[8px]">ESTÁTICO</span>
                                <span className="text-[10px] text-[#C55959] font-mono font-bold text-[8px]">VOLÁTIL</span>
                            </div>
                        </div>

                        {/* Manual Distillation Controls */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <h4 className="text-[8px] uppercase tracking-[0.4em] text-white/30 mb-2">Taller de Destilación Manual</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: 'fire' as keyof AlchemicalState, label: 'Ignis', color: 'text-orange-500' },
                                    { key: 'water' as keyof AlchemicalState, label: 'Aqua', color: 'text-blue-400' },
                                    { key: 'earth' as keyof AlchemicalState, label: 'Terra', color: 'text-emerald-500' },
                                    { key: 'air' as keyof AlchemicalState, label: 'Aer', color: 'text-slate-300' }
                                ].map(el => (
                                    <div key={el.key} className="flex items-center justify-between bg-white/5 p-2 border border-white/5">
                                        <span className={`text-[9px] font-bold uppercase ${el.color}`}>{el.label}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => updateElement(el.key, -10)} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 text-[10px]">-</button>
                                            <button onClick={() => updateElement(el.key, 10)} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 text-[10px]">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: The Alchemical Circle (Visualizer) */}
                <div className="lg:col-span-4 flex items-center justify-center relative">
                    <div className="relative w-80 h-80">
                        {/* Rotating Rings */}
                        <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
                        <div className="absolute inset-4 border border-white/10 rounded-full border-dashed animate-[spin_15s_linear_infinite_reverse]"></div>
                        
                        {/* Central Pulse */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#C55959] to-amber-600 blur-[40px] opacity-20 animate-pulse"></div>
                            <div className="relative w-32 h-32 border-2 border-white/40 rounded-full flex items-center justify-center backdrop-blur-md">
                                <Sparkles className="text-white animate-pulse" size={40} />
                            </div>
                        </div>

                        {/* Element Dots with Dramatic Feedback */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-500" 
                             style={{ opacity: 0.2 + (elements.fire / 100) * 0.8, transform: `translate(-50%, -50%) scale(${0.8 + (elements.fire / 100) * 0.5})` }}>
                             <Flame className={`${elements.fire > 50 ? 'animate-pulse' : ''} text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]`} size={24} />
                             <span className="text-[8px] font-black tracking-widest text-orange-500 uppercase">Ignis</span>
                             <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${elements.fire}%` }}></div>
                             </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-500" 
                             style={{ opacity: 0.2 + (elements.water / 100) * 0.8, transform: `translate(-50%, -50%) scale(${0.8 + (elements.water / 100) * 0.5})` }}>
                             <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden order-last mt-2">
                                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${elements.water}%` }}></div>
                             </div>
                             <span className="text-[8px] font-black tracking-widest text-blue-400 uppercase">Aqua</span>
                             <Droplets className={`${elements.water > 50 ? 'animate-pulse' : ''} text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]`} size={24} />
                        </div>
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-500" 
                             style={{ opacity: 0.2 + (elements.earth / 100) * 0.8, transform: `translate(-50%, -50%) scale(${0.8 + (elements.earth / 100) * 0.5})` }}>
                             <Mountain className={`${elements.earth > 50 ? 'animate-pulse' : ''} text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]`} size={24} />
                             <span className="text-[8px] font-black tracking-widest text-emerald-500 uppercase">Terra</span>
                             <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${elements.earth}%` }}></div>
                             </div>
                        </div>
                        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-500" 
                             style={{ opacity: 0.2 + (elements.air / 100) * 0.8, transform: `translate(-50%, -50%) scale(${0.8 + (elements.air / 100) * 0.5})` }}>
                             <Wind className={`${elements.air > 50 ? 'animate-pulse' : ''} text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]`} size={24} />
                             <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase">Aer</span>
                             <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${elements.air}%` }}></div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right: Tactics Output */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 p-8 space-y-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap size={18} className="text-amber-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Resultado de Transmutación</h4>
                    </div>

                    {(selectedIntent && currentTactic) || manualTactic ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                             {manualTactic && !selectedIntent && (
                                <div className="mb-4 bg-white/10 p-2 text-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#C55959]">Fórmula Personalizada Destilada</span>
                                </div>
                             )}
                             <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#C55959] mb-2">Gesto Psicológico (Técnica Chekhov)</p>
                                <p className="text-sm font-serif leading-relaxed text-white/80 italic">
                                    "{selectedIntent ? currentTactic!.gesto : manualTactic.gesto}"
                                </p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/5">
                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1">Cuerpo</p>
                                    <p className="text-[11px] font-bold uppercase">{selectedIntent ? currentTactic!.cuerpo : manualTactic.cuerpo}</p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/5">
                                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1">Voz</p>
                                    <p className="text-[11px] font-bold uppercase">{selectedIntent ? currentTactic!.voz : manualTactic.voz}</p>
                                </div>
                             </div>

                             <div className="p-5 border-l-2 border-amber-500 bg-amber-500/5">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-amber-500 mb-2">Secreto Alquímico</p>
                                <p className="text-xs leading-relaxed text-white/60">
                                    {selectedIntent ? currentTactic!.secreto : manualTactic.secreto}
                                </p>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 aspect-square p-6 text-center">
                            <Settings2 className="text-[#C55959] mb-4 opacity-50" size={32} />
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                                Estas creando una sintonización manual. Dale a "Sintonización Profunda" para destilar esta frecuencia única.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Progress / Connection Status */}
            <div className="mt-12 flex justify-between items-center bg-white/5 p-4 border border-white/5">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></div>
                        <span className="text-[9px] uppercase font-bold tracking-widest font-mono">
                            {isSyncing ? 'Destilando Éter Actoral...' : 'Reactores v4.1.0'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[8px] text-white/20 font-mono hidden md:block uppercase">Sync Lock: READY</span>
                    <button 
                        onClick={handleDeepSync}
                        disabled={isSyncing}
                        className={`text-[9px] uppercase font-black px-6 py-2 transition-colors ${isSyncing ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#C55959] hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
                    >
                        {isSyncing ? 'Calculando...' : 'Sintonización Profunda'}
                    </button>
                </div>
            </div>
        </div>
    );
}
