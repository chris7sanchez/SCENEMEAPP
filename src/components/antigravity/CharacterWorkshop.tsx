import React, { useState, useMemo } from 'react';
import {
    Sparkles, Ghost, Loader2, Atom,
    ChevronRight, Search, Edit3, Trash2,
    UserPlus, FileText, Activity, Zap as ZapIcon,
    Dna, Fingerprint, Footprints
} from 'lucide-react';
import { CharacterProfile, ChartTheme } from './types';
import NatalChart2D from './NatalChart2D';
import ElementalDiagram from '@/components/antigravity/ElementalDiagram';
import { motion } from 'framer-motion';
import SomaticBody from '@/components/antigravity/SomaticBody';
import { ChartZoomWrapper } from './shared-components';
import { findPossibleBirthDates, calculateRealPlanets } from '@/utils/astronomy';
import { getSomaticAnalysis } from '@/utils/somatic-mapping';
import { cn } from "@/lib/utils";

interface CharacterWorkshopProps {
    characterProfiles: CharacterProfile[];
    setCharacterProfiles: React.Dispatch<React.SetStateAction<CharacterProfile[]>>;
    selectedCharacterId: number | null;
    setSelectedCharacterId: (id: number | null) => void;
    scriptText: string;
    setScriptText: (text: string) => void;
    analyzeScript: () => void;
    isAnalyzing: boolean;
    isRefining: boolean;
    setIsRefining: (val: boolean) => void;
    chartTheme: ChartTheme;
    setChartTheme: (t: ChartTheme) => void;
    recalculateElements: (base: any, sun: string, moon: string, asc: string) => any;
    getApproxDateForSign: (sign: string) => string;
    refineCharacter: (data: any) => Promise<any>;
}

const CharacterWorkshop: React.FC<CharacterWorkshopProps> = (props) => {
    const {
        characterProfiles, setCharacterProfiles,
        selectedCharacterId, setSelectedCharacterId,
        scriptText, setScriptText, analyzeScript, isAnalyzing,
        isRefining, setIsRefining, chartTheme, setChartTheme,
        recalculateElements, getApproxDateForSign, refineCharacter
    } = props;

    const [activeStep, setActiveStep] = useState(0);
    const [editingCharacterId, setEditingCharacterId] = useState<number | null>(null);
    const [isSearchingDates, setIsSearchingDates] = useState(false);
    const [foundDates, setFoundDates] = useState<Date[]>([]);

    const STEPS = [
        { id: 0, label: 'EL GUIONISTA', sub: 'Ingesta de Guion', icon: FileText },
        { id: 1, label: 'LA ALQUIMIA', sub: 'Perfiles Natales', icon: Sparkles },
        { id: 2, label: 'EL ACTOR', sub: 'Posesión Somática', icon: Activity }
    ];

    // --- SOMATIC CALCULATION ---
    const somaticPoints = useMemo(() => {
        if (selectedCharacterId === null || !characterProfiles[selectedCharacterId]) return [];
        const char = characterProfiles[selectedCharacterId];
        const planets = calculateRealPlanets(char.birthData.date, 40, -3);
        return getSomaticAnalysis(planets.planets);
    }, [selectedCharacterId, characterProfiles]);

    const handleRefinement = async () => {
        if (selectedCharacterId === null) return;

        const char = characterProfiles[selectedCharacterId];
        const deep = char.deepAnalysis || {};
        const hasDeepData = deep.unsaid || deep.emotions || deep.outcome;

        let targetSun = char.fullAnalysis.sunSign;
        let targetMoon = char.fullAnalysis.knownMoon || char.fullAnalysis.moonSign || 'Aries';
        let targetAsc = char.fullAnalysis.knownAscendant || char.fullAnalysis.ascendant || 'Aries';

        let aiMessage = '';

        if (hasDeepData) {
            try {
                setIsRefining(true);
                const refined = await refineCharacter({
                    name: char.name,
                    currentProfile: {
                        sun: targetSun,
                        moon: targetMoon,
                        ascendant: targetAsc
                    },
                    deepAnalysis: deep
                });

                targetSun = refined.suggestedSun;
                targetMoon = refined.suggestedMoon;
                targetAsc = refined.suggestedAscendant;

                aiMessage = `VERDICTO CÓSMICO: ${refined.verdict}\n\nADJETIVO: ${refined.adjective.toUpperCase()}\n\nCarta Reajustada para coincidir con la profundidad psicológica.`;

                setCharacterProfiles(prev => {
                    const updated = [...prev];
                    const current = updated[selectedCharacterId];
                    current.fullAnalysis.sunSign = refined.suggestedSun;
                    current.fullAnalysis.moonSign = refined.suggestedMoon;
                    current.fullAnalysis.ascendant = refined.suggestedAscendant;
                    current.fullAnalysis.knownMoon = refined.suggestedMoon;
                    current.fullAnalysis.knownAscendant = refined.suggestedAscendant;

                    if (refined.suggestedPlanets) {
                        const p = refined.suggestedPlanets;
                        if (p.Mercury) current.fullAnalysis.mercurySign = p.Mercury;
                        if (p.Venus) current.fullAnalysis.venusSign = p.Venus;
                        if (p.Mars) current.fullAnalysis.marsSign = p.Mars;
                    }

                    current.fullAnalysis.verdict = refined.verdict;
                    current.fullAnalysis.adjective = refined.adjective;
                    return updated;
                });

            } catch (e) {
                aiMessage = "Error en el refinamiento por IA.";
            } finally {
                setIsRefining(false);
            }
        }

        // Recalculate Elements & Sync Date
        setCharacterProfiles(prev => {
            const updated = [...prev];
            const current = updated[selectedCharacterId];

            current.elements = recalculateElements(current.elements, targetSun, targetMoon, targetAsc);

            let foundDate: string | null = null;
            try {
                for (let y = 1985; y <= 1995; y += 2) {
                    const matches = findPossibleBirthDates(y, targetSun, targetMoon, targetAsc);
                    if (matches.length > 0) {
                        foundDate = matches[0].toISOString();
                        break;
                    }
                }
            } catch (e) { }

            if (foundDate) current.birthData.date = foundDate;
            if (aiMessage) alert(aiMessage);
            return updated;
        });
    };

    return (
        <div className="flex flex-col animate-fadeIn h-full min-h-screen pb-20">
            {/* --- HEADER CON STEPPER --- */}
            <header className="mb-12">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/70 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-500/50" />

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <ZapIcon size={32} className="text-amber-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Taller de Personajes</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Protocolo: Antigravity Method</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2 md:gap-4 bg-gray-900/5 p-2 rounded-full border border-black/5 relative z-10">
                        {STEPS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveStep(s.id)}
                                className={cn(
                                    "relative px-4 md:px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-500 overflow-hidden",
                                    activeStep === s.id
                                        ? "text-white shadow-2xl"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-black/5"
                                )}
                            >
                                {activeStep === s.id && (
                                    <motion.div
                                        layoutId="active-step-bg"
                                        className="absolute inset-0 bg-black -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <s.icon size={18} className={cn(activeStep === s.id ? "text-amber-400" : "text-gray-300")} />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                                    <span className="text-[8px] opacity-40 uppercase font-bold mt-1 hidden md:block">{s.sub}</span>
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* --- PASO 1: EL GUIONISTA --- */}
                {activeStep === 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="glass-panel p-0 overflow-hidden relative group rounded-[40px] border border-black/5 bg-white/40 shadow-2xl h-[600px]">
                                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 border-b border-black/5 bg-white/60 backdrop-blur-md">
                                    <span className="text-[11px] uppercase font-black tracking-[0.4em] text-gray-400 flex items-center gap-3">
                                        <FileText size={16} className="text-black" /> Laboratorio de Guiones
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">{scriptText.length} caracteres</span>
                                        <button
                                            onClick={() => setScriptText('')}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                            title="Borrar guion"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full h-full p-12 pt-28 bg-transparent text-lg font-serif leading-relaxed focus:outline-none resize-none placeholder:text-gray-200 custom-scrollbar selection:bg-amber-100"
                                    placeholder="Copia y pega aquí tu escena o tratamiento de personaje..."
                                    value={scriptText}
                                    onChange={(e) => setScriptText(e.target.value)}
                                />
                                <div className="absolute bottom-10 right-10 z-20">
                                    <button
                                        onClick={async () => {
                                            await analyzeScript();
                                            if (characterProfiles.length > 0) {
                                                setSelectedCharacterId(0);
                                                setActiveStep(1);
                                            }
                                        }}
                                        disabled={isAnalyzing || !scriptText.trim()}
                                        className="group relative bg-black text-white px-10 py-5 rounded-3xl text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 disabled:opacity-30 shadow-2xl hover:scale-105 active:scale-95"
                                    >
                                        {isAnalyzing ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <Sparkles size={18} className="text-amber-500" />}
                                        {isAnalyzing ? 'PROCESANDO ALMAS...' : 'INVOCAR PERSONAJES'}
                                        <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="glass-panel p-8 bg-black/5 rounded-[40px] border border-black/10 shadow-inner h-full">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 mb-8 flex items-center gap-3">
                                    <Fingerprint size={16} /> Elenco Detectado
                                </h3>
                                {characterProfiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 opacity-30">
                                        <Ghost size={64} />
                                        <p className="text-[10px] uppercase font-bold tracking-widest max-w-[200px]">El proscenio está vacío. Inyecta texto para comenzar.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {characterProfiles.map((char, i) => (
                                            <button
                                                key={char.id}
                                                onClick={() => {
                                                    setSelectedCharacterId(i);
                                                    setActiveStep(1);
                                                }}
                                                className="w-full text-left p-6 rounded-3xl bg-white border border-black/5 hover:border-black/20 hover:shadow-xl transition-all group relative overflow-hidden"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-widest group-hover:text-amber-600 transition-colors">{char.name}</span>
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold mt-1">{char.fullAnalysis.archetype}</span>
                                                </div>
                                                <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all">
                                                    <ChevronRight size={20} className="text-amber-600" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PASO 2: LA ALQUIMIA --- */}
                {activeStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        {selectedCharacterId !== null && characterProfiles[selectedCharacterId] ? (
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                {/* Dashboard */}
                                <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="glass-panel p-10 bg-white border border-black/5 shadow-2xl rounded-[40px] relative overflow-hidden flex flex-col min-h-[500px]">
                                        <div className="absolute -top-20 -right-20 p-20 opacity-[0.03] text-[15rem] font-serif pointer-events-none animate-spin-slow">❂</div>

                                        <header className="flex justify-between items-start mb-12 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-3xl flex items-center justify-center font-black text-3xl shadow-inner uppercase">
                                                    {characterProfiles[selectedCharacterId].fullAnalysis.sunSign[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-gray-900 font-serif leading-none">{characterProfiles[selectedCharacterId].name}</h3>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-black mt-2">{characterProfiles[selectedCharacterId].fullAnalysis.archetype}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingCharacterId(editingCharacterId === selectedCharacterId ? null : selectedCharacterId)}
                                                className={cn("p-4 rounded-full transition-all", editingCharacterId === selectedCharacterId ? "bg-black text-white" : "bg-gray-100 text-gray-400 hover:text-black")}
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                        </header>

                                        <div className="flex-1 flex items-center justify-center relative">
                                            <div className="w-full max-w-[380px] aspect-square transform scale-110">
                                                <ChartZoomWrapper title={`Speculum: ${characterProfiles[selectedCharacterId].name}`} theme={chartTheme} onThemeChange={setChartTheme}>
                                                    <NatalChart2D date={characterProfiles[selectedCharacterId].birthData.date} latitude={40} longitude={-3} theme={chartTheme} />
                                                </ChartZoomWrapper>
                                            </div>
                                        </div>

                                        {/* Quick Edit */}
                                        {editingCharacterId === selectedCharacterId && (
                                            <div className="mt-8 p-8 bg-gray-50 rounded-3xl border border-black/5 animate-in slide-in-from-top-4 duration-300">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-6">Mutar Geometría</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {[
                                                        { label: 'Sol', key: 'sunSign' },
                                                        { label: 'Luna', key: 'moonSign', override: 'knownMoon' },
                                                        { label: 'Asc', key: 'ascendant', override: 'knownAscendant' },
                                                    ].map((item) => {
                                                        const val = (item.override ? characterProfiles[selectedCharacterId].fullAnalysis[item.override] : null) || characterProfiles[selectedCharacterId].fullAnalysis[item.key] || 'Aries';
                                                        return (
                                                            <div key={item.label} className="flex flex-col bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                                                                <label className="text-[9px] uppercase font-black text-gray-400 mb-2">{item.label}</label>
                                                                <select
                                                                    className="text-xs font-black uppercase border-none outline-none bg-transparent text-gray-900"
                                                                    value={val}
                                                                    onChange={(e) => {
                                                                        const updated = [...characterProfiles];
                                                                        updated[selectedCharacterId].fullAnalysis[item.key] = e.target.value;
                                                                        if (item.override) updated[selectedCharacterId].fullAnalysis[item.override] = e.target.value;
                                                                        if (item.key === 'sunSign') updated[selectedCharacterId].birthData.date = getApproxDateForSign(e.target.value);
                                                                        setCharacterProfiles(updated);
                                                                    }}
                                                                >
                                                                    {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map(s => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="glass-panel p-10 bg-[#F9F8F4] border border-amber-900/10 rounded-[40px] shadow-xl flex flex-col items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-800/20 mb-10">Equilibrio de Elementos</h4>
                                        <ElementalDiagram
                                            fire={characterProfiles[selectedCharacterId].elements?.fire || 25}
                                            earth={characterProfiles[selectedCharacterId].elements?.earth || 25}
                                            air={characterProfiles[selectedCharacterId].elements?.air || 25}
                                            water={characterProfiles[selectedCharacterId].elements?.water || 25}
                                            size={280}
                                        />
                                        <div className="mt-12 w-full p-8 bg-white/80 rounded-[30px] border border-black/5 shadow-inner">
                                            <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3">Diagnóstico Alquímico</p>
                                            <p className="text-sm font-serif italic text-gray-700 leading-relaxed font-bold">
                                                "{characterProfiles[selectedCharacterId].fullAnalysis.verdict || 'Análisis pendiente de destilación...'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar: Refinement & Acting */}
                                <div className="xl:col-span-4 space-y-8">
                                    <div className="glass-panel p-10 bg-white border border-black/5 shadow-2xl rounded-[40px] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Fingerprint size={80} />
                                        </div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-8 flex items-center gap-4">
                                            <Dna size={20} className="text-amber-500" /> Refinar Esencia
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Deseo Raíz (Super-Objetivo)</label>
                                                <textarea
                                                    className="w-full bg-gray-50 border border-black/5 rounded-[25px] p-6 text-sm font-serif italic focus:border-amber-500 transition-all outline-none h-32"
                                                    placeholder="¿Qué es lo que más desea el personaje en la vida?"
                                                    value={characterProfiles[selectedCharacterId].deepAnalysis?.superObjective || ''}
                                                    onChange={e => {
                                                        const updated = [...characterProfiles];
                                                        if (!updated[selectedCharacterId].deepAnalysis) updated[selectedCharacterId].deepAnalysis = {};
                                                        updated[selectedCharacterId].deepAnalysis.superObjective = e.target.value;
                                                        setCharacterProfiles(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Subtexto (Lo No Dicho)</label>
                                                <textarea
                                                    className="w-full bg-gray-50 border border-black/5 rounded-[25px] p-6 text-sm font-serif italic focus:border-amber-500 transition-all outline-none h-32"
                                                    placeholder="Secretos, miedos y contradicciones..."
                                                    value={characterProfiles[selectedCharacterId].deepAnalysis?.unsaid || ''}
                                                    onChange={e => {
                                                        const updated = [...characterProfiles];
                                                        if (!updated[selectedCharacterId].deepAnalysis) updated[selectedCharacterId].deepAnalysis = {};
                                                        updated[selectedCharacterId].deepAnalysis.unsaid = e.target.value;
                                                        setCharacterProfiles(updated);
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={handleRefinement}
                                                disabled={isRefining}
                                                className="w-full bg-black text-white py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
                                            >
                                                {isRefining ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <Sparkles size={18} className="text-amber-500" />}
                                                {isRefining ? 'REFILTRANDO...' : 'REFRESCAR ESENCIA'}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveStep(2)}
                                        className="w-full bg-amber-500 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.4em] text-xs shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-4"
                                    >
                                        <Activity size={20} /> EL ACTOR: MAPA SOMÁTICO <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-[40px] border-dashed border-4 border-black/5 opacity-40">
                                <Ghost size={80} className="mb-6" />
                                <p className="text-xs font-black uppercase tracking-widest">Primero selecciona un alma en el Paso 1.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- PASO 3: EL ACTOR (SOMÁTICA) --- */}
                {activeStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        {selectedCharacterId !== null && characterProfiles[selectedCharacterId] ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                                {/* Somatic Body Visualization */}
                                <div className="lg:col-span-8">
                                    <div className="glass-panel p-2 bg-white border border-black/5 shadow-2xl rounded-[50px] overflow-hidden group">
                                        <SomaticBody points={somaticPoints} />
                                    </div>
                                </div>

                                {/* Sidebar: Instructions & Details */}
                                <div className="lg:col-span-4 flex flex-col gap-8">
                                    <div className="glass-panel p-10 bg-black text-white rounded-[40px] shadow-2xl border border-white/10 flex-1">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black">
                                                <Footprints size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black uppercase tracking-tight leading-none">Protocolo de Posesión</h4>
                                                <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mt-2">{characterProfiles[selectedCharacterId].name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 custom-scrollbar max-h-[500px] pr-4">
                                            {somaticPoints.slice(0, 6).map((point, i) => (
                                                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{point.planet} en {point.sign}</span>
                                                        <span className="text-[9px] font-mono opacity-40">{point.label}</span>
                                                    </div>
                                                    <p className="text-sm font-serif italic text-gray-300 leading-relaxed">
                                                        "{point.instruction}"
                                                    </p>
                                                    <div className="mt-4 text-[8px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
                                                        <ZapIcon size={10} className="text-amber-500" /> {point.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[40px] text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-700 leading-loose">
                                            Este mapa somático traduce la geometría astral<br />en impulsos físicos para el actor.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-[40px] border-dashed border-4 border-black/5 opacity-40">
                                <Ghost size={80} className="mb-6" />
                                <p className="text-xs font-black uppercase tracking-widest">Vuelve al Paso 1 para invocar a tu actor.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CharacterWorkshop;
