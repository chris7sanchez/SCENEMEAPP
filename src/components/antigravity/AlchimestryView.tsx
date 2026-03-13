
import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronRight, Zap, Sparkles, Eye, Shield, Moon, Sun as SunIcon, Clock, MapPin, Info, ArrowRight, Loader2, Workflow } from 'lucide-react';
import { ViewMode, AlchimestrySubView, UserData } from './types';
import { calculateRealPlanets, getSignFromLongitude } from '@/utils/astronomy';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { generateDeepAlchimestry } from '@/ai/deep-alchimestry';
import { AlchimestryDeepAnalysisOutput } from '@/ai/schemas';
import AlchemicalTransmutator from './AlchemicalTransmutator';

interface AlchimestryViewProps {
    currentUser: UserData | null;
    setViewMode: (mode: ViewMode) => void;
}

const AlchimestryView: React.FC<AlchimestryViewProps> = ({ currentUser, setViewMode }) => {
    const [subView, setSubView] = useState<AlchimestrySubView>('inicio');
    const [selectedDetail, setSelectedDetail] = useState<{ type: 'planet' | 'house', id: string | number } | null>(null);
    const [deepReading, setDeepReading] = useState<AlchimestryDeepAnalysisOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setDeepReading(null);
    }, [selectedDetail]);

    // --- CALCULATIONS ---
    const astroData = useMemo(() => {
        if (!currentUser) return null;
        try {
            const data = calculateRealPlanets(currentUser.date, currentUser.latitude, currentUser.longitude);

            const planetMap: Record<string, any> = {};
            data.planets.forEach(p => {
                planetMap[p.name] = {
                    ...p,
                    sign: getSignFromLongitude(p.longitude)
                };
            });

            const planetsInHouses: Record<number, string[]> = {};
            data.planets.forEach(p => {
                let house = 12;
                for (let i = 0; i < 12; i++) {
                    const start = data.houses[i];
                    const end = data.houses[(i + 1) % 12];
                    let inHouse = start < end ? (p.longitude >= start && p.longitude < end) : (p.longitude >= start || p.longitude < end);
                    if (inHouse) { house = i + 1; break; }
                }
                if (!planetsInHouses[house]) planetsInHouses[house] = [];
                planetsInHouses[house].push(p.name);
            });

            return {
                planets: planetMap,
                ascendant: { longitude: data.ascendant, sign: getSignFromLongitude(data.ascendant) },
                planetsInHouses,
                houses: data.houses
            };
        } catch (e) {
            console.error("Error calculating Alchimestry planets:", e);
            return null;
        }
    }, [currentUser]);

    const septInfo = useMemo(() => {
        if (!currentUser) return { start: 0, end: 7, age: 0, current: 1 };
        const birthDate = new Date(currentUser.date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        const current = Math.floor(age / 7) + 1;
        const start = (current - 1) * 7;
        return { start, end: start + 7, age, current };
    }, [currentUser]);

    if (!currentUser) return null;

    return (
        <div className="relative min-h-screen bg-[#05070a] text-stone-300 font-serif w-full animate-in fade-in duration-700 selection:bg-amber-500/30 pb-20">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, transparent 70%), url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            {/* --- INDEPENDENT HEADER --- */}
            <header className="sticky top-0 z-[1010] px-8 py-6 flex flex-col md:flex-row justify-between items-center border-b border-amber-900/20 bg-[#05070a]/80 backdrop-blur-xl">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <button onClick={() => setViewMode('COSMOS')} className="p-2 rounded-full border border-amber-900/30 hover:bg-amber-900/10 text-amber-500/70 transition-all group">
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-[0.3em] text-amber-500 uppercase leading-none drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Alchimestry</h1>
                            <span className="bg-amber-900/30 text-amber-500 text-[8px] px-2 py-0.5 rounded-full border border-amber-500/20 uppercase font-black">{currentUser.name || "Alquimista"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] text-amber-500/50 font-bold tracking-[0.5em] uppercase mt-1 italic">
                                Speculum: {septInfo.age} años • Septenio {septInfo.current} ({septInfo.start}-{septInfo.end})
                            </span>
                            <span className="text-[7px] text-amber-500/30 font-black uppercase tracking-[0.2em] border border-amber-500/10 px-2 py-0.5 rounded-sm">v4.0.1</span>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-wrap justify-center gap-1 md:gap-4 bg-black/40 p-1.5 rounded-full border border-amber-900/20 backdrop-blur-md">
                    {(['inicio', 'identidad', 'ciclos', 'transformacion', 'casas', 'transmutador'] as AlchimestrySubView[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setSubView(tab); setSelectedDetail(null); }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${subView === tab ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'text-stone-500 hover:text-amber-500'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </header>

            {/* --- CORE CONTENT --- */}
            <main className="max-w-6xl mx-auto px-8 pt-16 relative z-[205]">

                {/* --- SECCIÓN 1: INICIO --- */}
                {subView === 'inicio' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="text-left max-w-2xl mb-12">
                            <h2 className="text-4xl font-black text-white mb-6 tracking-tight uppercase">El Lenguaje Sagrado</h2>
                            <p className="text-lg text-stone-400 leading-relaxed font-serif">
                                Tu geometría estelar es la arquitectura de tu alma. Este grimorio digital transforma tus datos natales en un mapa de autoconocimiento profundo.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-8">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/70 border border-amber-900/20 px-4 py-2 rounded-xl bg-amber-900/5">
                                    <Clock size={12} /> {new Date(currentUser.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500/70 border border-amber-900/20 px-4 py-2 rounded-xl bg-amber-900/5">
                                    <MapPin size={12} /> {currentUser.city || 'Ubicación Desconocida'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { title: 'Individuación', desc: 'Integrar tu luz solar y tu refugio lunar para ser un individuo completo.', icon: <Sparkles size={32} /> },
                                { title: 'Tu Sombra', desc: 'Identificar las tensiones que proyectas en los demás para recuperarlas como poder.', icon: <Moon size={32} /> },
                                { title: 'Percepción', desc: `Tu Ascendente ${astroData?.ascendant.sign || "Aries"} define el filtro con el que miras la vida.`, icon: <Eye size={32} /> }
                            ].map((item, i) => (
                                <div key={i} className="group relative">
                                    <div className="bg-[#e2dcc8] text-[#5c4d3c] p-10 rounded-sm shadow-2xl relative transition-all duration-500 hover:-translate-y-2 border-x border-[#c8bc9a]">
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-[#c8bc9a] border-b border-[#a19570]" />
                                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#c8bc9a] border-t border-[#a19570]" />
                                        <div className="flex flex-col items-center text-center space-y-6">
                                            <div className="p-4 border border-[#5c4d3c]/20 rounded-full mb-2 text-[#8c7b60] group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-2xl font-black tracking-wide uppercase border-b border-[#5c4d3c]/10 pb-2">{item.title}</h3>
                                            <p className="text-sm leading-relaxed font-serif italic">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-black/40 blur-xl w-3/4 mx-auto -mt-2 opacity-50" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN 2: IDENTIDAD --- */}
                {subView === 'identidad' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="text-left mb-12 flex justify-between items-end">
                            <div>
                                <span className="text-amber-500/50 text-[10px] font-black uppercase tracking-[0.5em] mb-2 block">Arquitectura Personal</span>
                                <h2 className="text-4xl font-black text-white tracking-tight uppercase">Trinidad Planetaria</h2>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="text-[10px] font-bold text-stone-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    Ascendente: <span className="text-amber-500">{astroData?.ascendant.sign || "???"}</span>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!currentUser || !astroData) return;
                                        setIsGenerating(true);
                                        const res = await generateDeepAlchimestry({
                                            userName: currentUser.name || "Alquimista",
                                            birthData: currentUser.date,
                                            subject: "Síntesis de Identidad",
                                            sign: astroData.ascendant.sign,
                                            context: `Analiza la combinación de Sol en ${astroData.planets['Sol']?.sign}, Mercurio en ${astroData.planets['Mercurio']?.sign} y Venus en ${astroData.planets['Venus']?.sign}.`
                                        });
                                        setDeepReading(res);
                                        setSelectedDetail({ type: 'planet', id: 'Sol' }); // Show result in drawer
                                        setIsGenerating(false);
                                    }}
                                    className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-amber-500/20 transition-all"
                                >
                                    <Sparkles size={12} /> Análisis Holístico
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: 'El Sol', id: 'Sol', role: 'Conciencia', color: 'from-amber-400 to-orange-600', icon: '☉', key: 'sun' },
                                { name: 'Mercurio', id: 'Mercurio', role: 'Mente', color: 'from-cyan-400 to-blue-600', icon: '☿', key: 'mercury' },
                                { name: 'Venus', id: 'Venus', role: 'Deseo', color: 'from-pink-400 to-purple-600', icon: '♀', key: 'venus' }
                            ].map((card, i) => {
                                const sign = astroData?.planets[card.id]?.sign || 'Aries';
                                const traitKey = card.key as keyof typeof ZODIAC_ARCHETYPES['Aries'];
                                const traitDesc = ZODIAC_ARCHETYPES[sign]?.[traitKey] || 'Explorando arquetipo...';

                                return (
                                    <div key={i} className="group relative h-[520px] transition-all duration-700 hover:scale-[1.02]">
                                        <div className={`absolute -inset-0.5 bg-gradient-to-b ${card.color} opacity-20 group-hover:opacity-100 blur transition duration-700`} />
                                        <div className="relative h-full bg-[#050A14] border border-white/10 rounded-2xl overflow-hidden flex flex-col p-10 items-center text-center justify-between">
                                            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                                                <div className="w-64 h-64 border border-white/20 rounded-full animate-spin-slow" />
                                            </div>
                                            <div className="relative z-10 w-full mb-6">
                                                <div className={`text-8xl mb-4 bg-gradient-to-b ${card.color} bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                                                    {card.icon}
                                                </div>
                                                <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-1">{card.name}</h3>
                                                <div className="text-amber-500 font-bold mb-1">{sign}</div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{card.role}</span>
                                            </div>
                                            <div className="relative z-10 w-full">
                                                <p className="text-[11px] text-stone-400 leading-relaxed font-serif italic mb-8 border-t border-white/5 pt-6 line-clamp-4">
                                                    {traitDesc}
                                                </p>
                                                <button
                                                    onClick={() => setSelectedDetail({ type: 'planet', id: card.id })}
                                                    className="w-full py-4 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2 group-hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                                >
                                                    <Zap size={12} className="text-amber-500" /> Analizar Dinámica
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN 3: CICLOS --- */}
                {subView === 'ciclos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            <div className="bg-black/40 p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3">Septenio Actual</span>
                                <span className="text-5xl font-black text-amber-500 mb-2">{septInfo.current}</span>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">{septInfo.start}-{septInfo.end} Años</span>
                            </div>
                            <div className="lg:col-span-2 bg-black/40 p-8 rounded-2xl border border-white/5 flex flex-col justify-center">
                                <h4 className="text-xl font-black text-white uppercase tracking-widest mb-4">El Ciclo de {septInfo.current === 5 ? 'Marte' : septInfo.current === 6 ? 'Júpiter' : 'la Integración'}</h4>
                                <p className="text-sm text-stone-400 font-serif leading-relaxed italic">
                                    "En este periodo de tu vida, la energía se desplaza desde la exploración externa hacia la consolidación de tu propia autoridad. Es un tiempo de 'Hacer' para 'Ser'."
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#0d0f14] p-8 md:p-12 rounded-3xl border border-amber-900/20 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Clock size={200} /></div>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                                <div className="lg:col-span-12 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.4em] mb-6 text-center">Puntos de Inflexión</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[
                                            { title: 'Primer Septenio', age: 7, desc: 'Configuración del refugio emocional (Luna).' },
                                            { title: 'Oposición Saturno', age: 14, desc: 'El primer choque con las leyes del mundo.' },
                                            { title: 'Madurez Biológica', age: 21, desc: 'El despertar de la voluntad consciente (Sol).' },
                                            { title: 'Retorno de Saturno', age: 29, desc: 'La gran prueba: ¿quién eres realmente?' }
                                        ].map((h, i) => (
                                            <div key={i} className={`p-5 rounded-2xl border transition-all ${septInfo.age >= h.age ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 opacity-40'}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-white text-[10px] uppercase tracking-widest">{h.title}</span>
                                                    <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">{h.age}A</span>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 leading-relaxed italic">{h.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col items-center justify-center space-y-8 pt-12">
                                        <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
                                            <div className="absolute inset-0 border border-amber-900/20 rounded-full animate-spin-slow" />
                                            <div className="absolute inset-8 border border-white/5 rounded-full" />
                                            <div className="w-16 h-16 bg-amber-500/10 rounded-full border border-amber-500/50 flex items-center justify-center text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                                                <span className="text-2xl font-black">{septInfo.age}</span>
                                            </div>
                                            <div className="absolute w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]"
                                                style={{ transform: `rotate(${(septInfo.age / 84) * 360}deg) translate(140px)` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN 4: TRANSFORMACIÓN --- */}
                {subView === 'transformacion' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Alquimia de la Sombra</h2>
                                <p className="text-stone-500 font-serif italic text-lg max-w-2xl">Transmutación del dolor en propósito y estructura.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!currentUser || !astroData) return;
                                    setIsGenerating(true);
                                    const res = await generateDeepAlchimestry({
                                        userName: currentUser.name || "Alquimista",
                                        birthData: currentUser.date,
                                        subject: "Análisis de Transformación",
                                        sign: astroData.planets['Saturno']?.sign,
                                        context: `Analiza la relación entre Saturno en ${astroData.planets['Saturno']?.sign} y Plutón en ${astroData.planets['Plutón']?.sign}. Los señores del tiempo y la transmutación profunda.`
                                    });
                                    setDeepReading(res);
                                    setSelectedDetail({ type: 'planet', id: 'Plutón' });
                                    setIsGenerating(false);
                                }}
                                className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-purple-500/20 transition-all rounded-full"
                            >
                                <Moon size={14} /> Síntesis de Sombras
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="bg-black/40 p-12 rounded-3xl border border-purple-900/30 relative group overflow-hidden hover:border-purple-500/50 transition-colors">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">♇</div>
                                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-3xl border border-purple-500/20">♇</div>
                                    Plutón en {astroData?.planets['Plutón']?.sign || "Aries"}
                                </h3>
                                <div className="space-y-6">
                                    <p className="text-stone-300 leading-relaxed font-serif text-sm">
                                        "Tu Plutón revela un poder regenerativo inmenso que emerge solo tras la rendición total. No temas a la muerte de lo viejo, pues es el abono de tu renacimiento."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Poder', 'Inconsciente', 'Renacimiento', 'Crisis'].map(t => (
                                            <span key={t} className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/5 px-4 py-1.5 rounded-full border border-purple-900/30">{t}</span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSelectedDetail({ type: 'planet', id: 'Plutón' })}
                                        className="text-[10px] font-bold text-purple-400 flex items-center gap-2 hover:translate-x-1 transition-transform uppercase"
                                    >
                                        Ver Sombra Arquetípica <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-black/40 p-12 rounded-3xl border border-stone-800 relative group overflow-hidden hover:border-amber-900/50 transition-colors">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">♄</div>
                                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-stone-200 text-3xl border border-white/5">♄</div>
                                    Saturno en {astroData?.planets['Saturno']?.sign || "Aries"}
                                </h3>
                                <div className="space-y-6">
                                    <p className="text-stone-300 leading-relaxed font-serif text-sm">
                                        "Saturno es tu Gran Maestro. Pone límites donde necesitas estructura y te da el peso necesario para manifestar tus visiones en la materia dura."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Ley', 'Tiempo', 'Estructura', 'Límite'].map(t => (
                                            <span key={t} className="text-[9px] font-black uppercase tracking-widest text-stone-300 bg-stone-500/5 px-4 py-1.5 rounded-full border border-stone-800">{t}</span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSelectedDetail({ type: 'planet', id: 'Saturno' })}
                                        className="text-[10px] font-bold text-stone-300 flex items-center gap-2 hover:translate-x-1 transition-transform uppercase"
                                    >
                                        Ver Maestría del Tiempo <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN 5: CASAS --- */}
                {subView === 'casas' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tight uppercase">El Teatro Circular</h2>
                                <p className="text-stone-500 mt-2 font-serif italic text-lg max-w-2xl">Los escenarios donde tus planetas ejecutan su obra maestra.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!currentUser || !astroData) return;
                                    setIsGenerating(true);
                                    const res = await generateDeepAlchimestry({
                                        userName: currentUser.name || "Alquimista",
                                        birthData: currentUser.date,
                                        subject: "Destilación de Escenarios Global",
                                        sign: astroData.ascendant.sign,
                                        context: `Analiza la distribución de planetas en las casas. El usuario tiene planetas en las casas: ${Object.keys(astroData.planetsInHouses).join(', ')}.`
                                    });
                                    setDeepReading(res);
                                    setSelectedDetail({ type: 'house', id: 1 });
                                    setIsGenerating(false);
                                }}
                                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-amber-500/20 transition-all rounded-full"
                            >
                                <Zap size={14} /> Destilación Global
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { n: 1, t: 'Yo', d: 'Identidad y Proyección' }, { n: 2, t: 'Deseo', d: 'Recursos y Valores' },
                                { n: 3, t: 'Mente', d: 'Comunicación y Enlace' }, { n: 4, t: 'Raíz', d: 'Hogar y Pertenencia' },
                                { n: 5, t: 'Gozo', d: 'Creación e Identidad' }, { n: 6, t: 'Obra', d: 'Servicio y Ritual' },
                                { n: 7, t: 'Espejo', d: 'Vínculos y Alianzas' }, { n: 8, t: 'Crisis', d: 'Fusión y Sombras' },
                                { n: 9, t: 'Fe', d: 'Expansión y Guía' }, { n: 10, t: 'Cima', d: 'Vocación y Status' },
                                { n: 11, t: 'Red', d: 'Grupos y Amigos' }, { n: 12, t: 'Origen', d: 'Disolución y Espíritu' }
                            ].map(house => {
                                const planets = astroData?.planetsInHouses[house.n] || [];
                                return (
                                    <div
                                        key={house.n}
                                        onClick={() => setSelectedDetail({ type: 'house', id: house.n })}
                                        className={`p-6 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between h-[180px] ${planets.length > 0 ? 'bg-amber-900/10 border-amber-500/30' : 'bg-black/20 border-white/5 opacity-80'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest">Escenario {house.n}</div>
                                                {planets.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
                                            </div>
                                            <h4 className="font-bold text-white uppercase text-lg group-hover:text-amber-500 transition-colors mb-1">{house.t}</h4>
                                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{house.d}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {planets.length > 0 ? planets.map(p => (
                                                <div key={p} className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 text-[9px] font-bold text-amber-500/80">
                                                    <span className="text-[12px]">{p === 'Sol' ? '☉' : p === 'Luna' ? '☾' : p === 'Mercurio' ? '☿' : p === 'Venus' ? '♀' : p === 'Marte' ? '♂' : '✦'}</span>
                                                    {p}
                                                </div>
                                            )) : (
                                                <span className="text-[9px] text-zinc-800 italic uppercase tracking-tighter">Latente</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN 6: TRANSMUTADOR --- */}
                {subView === 'transmutador' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="mb-12">
                            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Laboratorio de Transmutación</h2>
                            <p className="text-stone-500 font-serif italic text-lg max-w-2xl">Sintoniza la frecuencia de vibración de tu personaje para la escena.</p>
                        </div>
                        <AlchemicalTransmutator />
                    </div>
                )}
            </main>

            {/* --- DETAIL OVERLAY (Analysis Drawer) --- */}
            {selectedDetail && (
                <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex justify-end animate-in fade-in duration-300">
                    <div className="w-full md:w-[500px] h-full bg-[#0a0d14] border-l border-amber-900/20 p-12 overflow-y-auto animate-in slide-in-from-right duration-500">
                        <button onClick={() => setSelectedDetail(null)} className="absolute top-8 right-8 p-2 rounded-full border border-white/10 text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="space-y-12">
                            {selectedDetail.type === 'planet' ? (
                                <>
                                    <div className="text-center space-y-4">
                                        <div className="text-8xl text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                            {selectedDetail.id === 'Sol' ? '☉' : selectedDetail.id === 'Luna' ? '☾' : selectedDetail.id === 'Saturno' ? '♄' : selectedDetail.id === 'Plutón' ? '♇' : selectedDetail.id === 'Mercurio' ? '☿' : selectedDetail.id === 'Venus' ? '♀' : selectedDetail.id === 'Marte' ? '♂' : '✧'}
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em]">{selectedDetail.id} en {astroData?.planets[selectedDetail.id as string]?.sign || "..."}</h2>
                                        <div className="w-12 h-0.5 bg-amber-500 mx-auto" />
                                    </div>

                                    <div className="space-y-8">
                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest flex items-center gap-2">
                                                <Sparkles size={14} /> La Función Psíquica
                                            </h4>
                                            <p className="text-stone-300 font-serif leading-relaxed text-sm">
                                                {(() => {
                                                    const id = selectedDetail.id;
                                                    const sign = astroData?.planets[id as string]?.sign || 'Aries';
                                                    if (id === 'Sol') return ZODIAC_ARCHETYPES[sign]?.sun;
                                                    if (id === 'Luna') return ZODIAC_ARCHETYPES[sign]?.moon;
                                                    if (id === 'Mercurio') return ZODIAC_ARCHETYPES[sign]?.mercury;
                                                    if (id === 'Venus') return ZODIAC_ARCHETYPES[sign]?.venus;
                                                    if (id === 'Marte') return ZODIAC_ARCHETYPES[sign]?.mars;
                                                    return "Representa una función esencial de tu arquitectura psíquica.";
                                                })()}
                                            </p>
                                        </section>

                                        <section className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-purple-500/60 tracking-widest flex items-center gap-2">
                                                <Moon size={14} /> La Sombra del Arquetipo
                                            </h4>
                                            <p className="text-stone-300 font-serif leading-relaxed text-sm italic">
                                                {ZODIAC_ARCHETYPES[astroData?.planets[selectedDetail.id as string]?.sign as string]?.shadow || "Bajo estrés, esta función puede manifestarse como una necesidad de control o aislamiento defensivo."}
                                            </p>
                                        </section>

                                        {!deepReading && !isGenerating && (
                                            <button
                                                onClick={async () => {
                                                    if (!currentUser || !astroData) return;
                                                    setIsGenerating(true);
                                                    try {
                                                        const sign = selectedDetail.type === 'planet' ? astroData.planets[selectedDetail.id as string]?.sign : 'N/A';
                                                        const res = await generateDeepAlchimestry({
                                                            userName: currentUser.name || "Alquimista",
                                                            birthData: currentUser.date,
                                                            subject: selectedDetail.id.toString(),
                                                            sign: sign,
                                                            planets: selectedDetail.type === 'house' ? (astroData?.planetsInHouses[selectedDetail.id as number] || []) : [selectedDetail.id as string],
                                                            context: `El usuario está en el septenio ${septInfo.current}.`
                                                        });
                                                        setDeepReading(res);
                                                    } catch (e) {
                                                        console.error(e);
                                                    } finally {
                                                        setIsGenerating(false);
                                                    }
                                                }}
                                                className="w-full py-5 bg-amber-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20"
                                            >
                                                <Zap size={16} /> Generar Lectura Genkit
                                            </button>
                                        )}

                                        {isGenerating && (
                                            <div className="w-full py-10 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
                                                <Loader2 size={32} className="animate-spin text-amber-500" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50">Destilando Esencia...</span>
                                            </div>
                                        )}

                                        {deepReading && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                                                <div className="p-8 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-2xl space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2">
                                                        <Sparkles size={14} /> Revelación Alquímica
                                                    </h4>
                                                    <p className="text-stone-300 font-serif leading-relaxed text-sm italic">
                                                        "{deepReading.meditation}"
                                                    </p>
                                                </div>

                                                <div className="p-8 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sabiduría Práctica</h4>
                                                    <p className="text-zinc-400 font-serif text-sm">
                                                        {deepReading.practicalWisdom}
                                                    </p>
                                                </div>

                                                <div className="pt-6 border-t border-white/5 text-center">
                                                    <span className="text-[9px] uppercase font-black text-amber-500/40 tracking-[0.6em] mb-3 block">Clave de Transmutación</span>
                                                    <p className="text-xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent">
                                                        {deepReading.alchemicalKey}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Análisis de Entorno</div>
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                                            Escenario {selectedDetail.id}: {
                                                (() => {
                                                    const ids: Record<number, string> = {
                                                        1: 'Identidad', 2: 'Recursos', 3: 'Entorno', 4: 'Raíces',
                                                        5: 'Creatividad', 6: 'Ritual', 7: 'Vínculos', 8: 'Transmutación',
                                                        9: 'Búsqueda', 10: 'Vocación', 11: 'Comunidad', 12: 'Inconsciente'
                                                    };
                                                    return ids[selectedDetail.id as number] || 'Experiencia';
                                                })()
                                            }
                                        </h2>
                                        <div className="w-12 h-1 bg-amber-500" />
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-8 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl font-black text-white">
                                                {astroData ? getSignFromLongitude(astroData.houses[Number(selectedDetail.id) - 1]) : '??'}
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest mb-4">Arquitectura del Escenario</h4>
                                            <p className="text-stone-300 font-serif leading-relaxed text-sm">
                                                Este escenario está regido por la vibración de <span className="text-amber-500 font-bold">{astroData ? getSignFromLongitude(astroData.houses[Number(selectedDetail.id) - 1]) : '??'}</span>.
                                                {(() => {
                                                    const sign = astroData ? getSignFromLongitude(astroData.houses[Number(selectedDetail.id) - 1]) : null;
                                                    const archetype = sign ? ZODIAC_ARCHETYPES[sign] : null;
                                                    if (!archetype) return "";
                                                    return ` Aquí, tu búsqueda de ${selectedDetail.id === 1 ? 'uno mismo' : selectedDetail.id === 10 ? 'reconocimiento' : 'sentido'} se tiñe de ${archetype.keywords?.[0] || 'esta energía'}.`;
                                                })()}
                                            </p>
                                        </div>

                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                            <h4 className="text-[9px] font-black text-amber-500 uppercase mb-4 tracking-widest">Planetas en esta Casa</h4>
                                            <div className="space-y-4">
                                                {(astroData?.planetsInHouses[selectedDetail.id as number] || []).length > 0 ?
                                                    (astroData?.planetsInHouses[selectedDetail.id as number] || []).map(p => (
                                                        <div key={p} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-amber-500 text-lg">{p === 'Sol' ? '☉' : p === 'Luna' ? '☾' : p === 'Mercurio' ? '☿' : p === 'Venus' ? '♀' : p === 'Marte' ? '♂' : '✦'}</span>
                                                                <span className="font-bold text-white uppercase text-xs">{p}</span>
                                                            </div>
                                                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">En {astroData?.planets[p]?.sign}</span>
                                                        </div>
                                                    )) : <p className="text-xs text-zinc-600 italic">No hay planetas natales en este escenario. Es un área de pura potencialidad externa.</p>}
                                            </div>
                                        </div>

                                        {!deepReading && !isGenerating && (
                                            <button
                                                onClick={async () => {
                                                    if (!currentUser || !astroData) return;
                                                    setIsGenerating(true);
                                                    try {
                                                        const sign = getSignFromLongitude(astroData.houses[Number(selectedDetail.id) - 1]);
                                                        const res = await generateDeepAlchimestry({
                                                            userName: currentUser.name || "Alquimista",
                                                            birthData: currentUser.date,
                                                            subject: `Escenario ${selectedDetail.id}`,
                                                            sign: sign,
                                                            planets: astroData?.planetsInHouses[Number(selectedDetail.id)] || [],
                                                            context: `Analizando el Escenario ${selectedDetail.id} (Casa Astrológica) en el signo de ${sign}. Septenio ${septInfo.current}.`
                                                        });
                                                        setDeepReading(res);
                                                    } catch (e) {
                                                        console.error(e);
                                                    } finally {
                                                        setIsGenerating(false);
                                                    }
                                                }}
                                                className="w-full py-5 bg-amber-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20"
                                            >
                                                <Zap size={16} /> Destilación de Escenario con Genkit
                                            </button>
                                        )}

                                        {isGenerating && (
                                            <div className="w-full py-10 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
                                                <Loader2 size={32} className="animate-spin text-amber-500" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50">Destilando Escenario...</span>
                                            </div>
                                        )}

                                        {deepReading && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                                                <div className="p-8 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-2xl space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2">
                                                        <Sparkles size={14} /> Revelación del Escenario
                                                    </h4>
                                                    <p className="text-stone-300 font-serif leading-relaxed text-sm italic">
                                                        "{deepReading.meditation}"
                                                    </p>
                                                </div>

                                                <div className="p-8 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Consejo para esta Área</h4>
                                                    <p className="text-zinc-400 font-serif text-sm">
                                                        {deepReading.practicalWisdom}
                                                    </p>
                                                </div>

                                                <div className="pt-6 border-t border-white/5 text-center">
                                                    <span className="text-[9px] uppercase font-black text-amber-500/40 tracking-[0.6em] mb-3 block">Mantra del Escenario</span>
                                                    <p className="text-xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent">
                                                        {deepReading.alchemicalKey}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default AlchimestryView;
