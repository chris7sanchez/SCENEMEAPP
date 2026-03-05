import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Settings, Image as ImageIcon, Palette, Eye, Sliders, X, ChevronRight, Layout, Sparkles, Monitor } from 'lucide-react';
import { ThemeSettings } from './types';
import { cn } from "@/lib/utils";

interface VisualEngineProps {
    settings: ThemeSettings;
    onSettingsChange: (newSettings: ThemeSettings) => void;
}

const VisualEngine: React.FC<VisualEngineProps> = ({ settings, onSettingsChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'bg' | 'colors' | 'effects'>('bg');

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = (clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const moveY = (clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            mouseX.set(moveX * settings.parallaxIntensity);
            mouseY.set(moveY * settings.parallaxIntensity);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [settings.parallaxIntensity, mouseX, mouseY]);

    // Sync CSS Variables with Document
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--glass-opacity', (settings.glassOpacity / 100).toString());
        root.style.setProperty('--blur-amount', `${settings.blurAmount}px`);
        root.style.setProperty('--accent-color', settings.accentColor);
        root.style.setProperty('--text-color', settings.textColor);
        root.style.setProperty('--bg-color', settings.backgroundColor);
    }, [settings]);

    // Layers depth mapping
    const bgLayerDeepX = useTransform(springX, x => x * 5);
    const bgLayerDeepY = useTransform(springY, y => y * 5);

    const bgLayerMidX = useTransform(springX, x => x * 15);
    const bgLayerMidY = useTransform(springY, y => y * 15);

    const bgLayerNearX = useTransform(springX, x => x * -25);
    const bgLayerNearY = useTransform(springY, y => y * -25);

    const fgLayerX = useTransform(springX, x => x * 45);
    const fgLayerY = useTransform(springY, y => y * 45);

    const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const presets = [
        {
            name: 'Original',
            config: {
                backgroundColor: '#F2F0E9',
                accentColor: '#C55959',
                textColor: '#1a1a1a',
                bgImage: '/antigravity/astral_background_v2.png',
                bgOpacity: 15,
                blurAmount: 0,
                parallaxIntensity: 30,
                fontFamily: 'serif',
                glassOpacity: 70
            }
        },
        {
            name: 'Noche Estelar',
            config: {
                backgroundColor: '#050A14',
                accentColor: '#4f46e5',
                textColor: '#e2e8f0',
                bgImage: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80',
                bgOpacity: 30,
                blurAmount: 2,
                parallaxIntensity: 50,
                fontFamily: 'serif',
                glassOpacity: 20
            }
        },
        {
            name: 'Alquimia Oro',
            config: {
                backgroundColor: '#0f172a',
                accentColor: '#fbbf24',
                textColor: '#f8fafc',
                bgImage: '/antigravity/simbolos-alquimia.jpg',
                bgOpacity: 20,
                blurAmount: 0,
                parallaxIntensity: 40,
                fontFamily: 'serif',
                glassOpacity: 40
            }
        }
    ];

    return (
        <>
            {/* BACKGROUND DEPTH ENGINE */}
            <div
                className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none transition-colors duration-1000"
                style={{ backgroundColor: settings.backgroundColor }}
            >
                {/* Layer 0: Deep Background (The main image) */}
                <motion.div
                    style={{
                        x: bgLayerDeepX,
                        y: bgLayerDeepY,
                        backgroundImage: `url(${settings.bgImage})`,
                        opacity: settings.bgOpacity / 100,
                    }}
                    className="absolute -inset-[15%] bg-cover bg-center mix-blend-multiply transition-opacity duration-1000"
                />

                {/* Layer 1: Middle Particles / Dust */}
                <motion.div
                    style={{ x: bgLayerMidX, y: bgLayerMidY }}
                    className="absolute -inset-[25%] opacity-10"
                >
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="dust-pattern" width="600" height="600" patternUnits="userSpaceOnUse">
                                <circle cx="50" cy="150" r="1.5" fill={settings.accentColor} />
                                <circle cx="450" cy="400" r="1" fill={settings.accentColor} />
                                <circle cx="200" cy="500" r="2" fill={settings.accentColor} />
                                <circle cx="550" cy="100" r="0.8" fill={settings.accentColor} />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dust-pattern)" />
                    </svg>
                </motion.div>

                {/* Layer 2: Accent Glows / Depth Light */}
                <motion.div
                    style={{ x: bgLayerNearX, y: bgLayerNearY }}
                    className="absolute -inset-[20%] flex items-center justify-center opacity-30 pointer-events-none"
                >
                    <div
                        className="w-[120vw] h-[120vh] rounded-full blur-[180px]"
                        style={{ background: `radial-gradient(circle at 30% 30%, ${settings.accentColor}33 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${settings.accentColor}22 0%, transparent 50%)` }}
                    />
                </motion.div>

                {/* Layer 3: Foreground Floating Elements (Dynamic) */}
                <motion.div
                    style={{ x: fgLayerX, y: fgLayerY }}
                    className="absolute -inset-[30%]"
                >
                    <div className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full border border-white/5 backdrop-blur-sm opacity-10" />
                    <div className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full border border-white/5 backdrop-blur-sm opacity-10" />
                </motion.div>

                {/* Overlay Noise / Grain */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Master Blur Transition */}
                <motion.div
                    className="absolute inset-0"
                    style={{ backdropFilter: `blur(${settings.blurAmount}px)` }}
                />
            </div>

            {/* FLOATING CONTROL WIDGET */}
            <div className="fixed bottom-6 right-6 z-[100] flex items-end flex-col gap-4">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30, x: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30, x: 20 }}
                            className="w-80 bg-white/95 backdrop-blur-3xl border border-black/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="bg-zinc-950 text-white p-7">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Sparkles size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-[0.25em]">Atelier</h3>
                                            <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Studio de Diseño</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex p-2 bg-zinc-100/50 mx-4 mt-2 rounded-2xl gap-1">
                                {[
                                    { id: 'bg', icon: Monitor, label: 'Entorno' },
                                    { id: 'colors', icon: Palette, label: 'Vibración' },
                                    { id: 'effects', icon: Sliders, label: 'Óptica' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300",
                                            activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                                        )}
                                    >
                                        <tab.icon size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Controls Content */}
                            <div className="p-7 space-y-8 max-h-[450px] overflow-y-auto no-scrollbar">

                                {activeTab === 'bg' && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1">Textura del Alma (URL / Path)</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={settings.bgImage}
                                                    onChange={(e) => updateSetting('bgImage', e.target.value)}
                                                    className="w-full bg-zinc-100 border border-transparent focus:border-zinc-200 rounded-2xl p-4 pr-10 text-[11px] font-mono transition-all group-hover:bg-zinc-50"
                                                />
                                                <ImageIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end px-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Intensidad</label>
                                                <span className="text-[10px] font-mono font-bold">{settings.bgOpacity}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100"
                                                value={settings.bgOpacity}
                                                onChange={(e) => updateSetting('bgOpacity', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end px-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profundidad Parallax</label>
                                                <span className="text-[10px] font-mono font-bold">{settings.parallaxIntensity}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="150"
                                                value={settings.parallaxIntensity}
                                                onChange={(e) => updateSetting('parallaxIntensity', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'colors' && (
                                    <div className="space-y-5">
                                        {[
                                            { label: 'Color Base', key: 'backgroundColor' },
                                            { label: 'Color de Acento', key: 'accentColor' },
                                            { label: 'Color de Texto', key: 'textColor' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</label>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{(settings as any)[item.key]}</span>
                                                    <input
                                                        type="color"
                                                        value={(settings as any)[item.key]}
                                                        onChange={(e) => updateSetting(item.key as any, e.target.value)}
                                                        className="w-10 h-10 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer scale-125 focus:ring-0"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-4 space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1">Tipografía</label>
                                            <div className="flex gap-2">
                                                {['serif', 'sans'].map((f) => (
                                                    <button
                                                        key={f}
                                                        onClick={() => updateSetting('fontFamily', f as any)}
                                                        className={cn(
                                                            "flex-1 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all",
                                                            settings.fontFamily === f ? "bg-black text-white border-black" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                                        )}
                                                    >
                                                        {f === 'serif' ? 'Serifa Elegante' : 'Sans Técnico'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'effects' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end px-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Difuminado Óptico</label>
                                                <span className="text-[10px] font-mono font-bold">{settings.blurAmount}px</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="60"
                                                value={settings.blurAmount}
                                                onChange={(e) => updateSetting('blurAmount', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end px-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Opacidad de Paneles</label>
                                                <span className="text-[10px] font-mono font-bold">{settings.glassOpacity}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100"
                                                value={settings.glassOpacity}
                                                onChange={(e) => updateSetting('glassOpacity', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                                            />
                                        </div>

                                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                                            <Sparkles size={16} className="text-amber-600 mt-1" />
                                            <p className="text-[10px] leading-relaxed text-amber-900/70 font-medium italic">
                                                Los efectos de cristal y desenfoque mejoran la lectura al separar los planos de información.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Fast Presets */}
                            <div className="p-6 bg-zinc-50 border-t border-black/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 text-center">Colecciones Predefinidas</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => onSettingsChange(preset.config as any)}
                                            className="group flex flex-col items-center gap-1.5"
                                        >
                                            <div
                                                className="w-full aspect-square rounded-2xl border-2 border-white shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md cursor-pointer relative overflow-hidden"
                                                style={{ backgroundColor: preset.config.backgroundColor }}
                                            >
                                                <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ backgroundColor: preset.config.accentColor, opacity: 0.3 }} />
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-zinc-400 group-hover:text-zinc-900 transition-colors">{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    layoutId="studio-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "w-16 h-16 rounded-[2rem] flex flex-col items-center justify-center transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] pointer-events-auto",
                        isOpen ? "bg-zinc-950 text-white" : "bg-white text-black hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
                    )}
                >
                    <Settings className={cn("transition-transform duration-700", isOpen ? "rotate-180" : "rotate-0")} size={22} />
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] mt-1">{isOpen ? 'Cerrar' : 'Estilo'}</span>
                </motion.button>
            </div>

            {/* Global style updates based on CSS variables */}
            <style jsx global>{`
                .glass-panel {
                    background-color: rgba(255, 255, 255, var(--glass-opacity)) !important;
                    backdrop-filter: blur(var(--blur-amount)) !important;
                    -webkit-backdrop-filter: blur(var(--blur-amount)) !important;
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    transition: background-color 0.5s ease, backdrop-filter 0.5s ease !important;
                }
                .accent-glow {
                     box-shadow: 0 0 20px var(--accent-color) !important;
                }
                .text-dynamic {
                    color: var(--text-color) !important;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default VisualEngine;
