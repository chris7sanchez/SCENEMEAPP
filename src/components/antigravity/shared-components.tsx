import React, { useState, useEffect } from 'react';
import { Sun, Atom, BookOpen, Plus, Minus, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { ChartTheme } from './types';

// --- HELPER UTILS ---
export const downloadChartAsPDF = async (elementId: string, title: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.setFontSize(16);
        pdf.text(title, 10, 10);
        pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
        pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (e) {
        console.error("PDF Export Error", e);
        alert("Error generando PDF.");
    }
};

export const ChartZoomWrapper = ({ children, title, theme, onThemeChange }: { children: React.ReactNode, title: string, theme: ChartTheme, onThemeChange: (t: ChartTheme) => void }) => {
    const [scale, setScale] = useState(1);
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
    const id = `chart-${Math.random().toString(36).substr(2, 9)}`; // For PDF

    return (
        <div className="relative w-full h-full group overflow-hidden bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl transition-all hover:bg-white/80">
            {/* Header / Title */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-20 pointer-events-none">
                <h3 className="bg-black/80 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md shadow-lg">{title}</h3>
            </div>

            {/* Left Controls: Download */}
            <div className="absolute top-2 left-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                <button
                    onClick={(e) => { e.stopPropagation(); downloadChartAsPDF(id, title); }}
                    className="bg-black/80 text-white p-2 rounded-full hover:bg-[#C55959] transition-colors shadow-lg"
                    title="Descargar PDF"
                >
                    <Download size={12} />
                </button>
            </div>

            {/* Theme Controls - Top Right */}
            <div className="absolute top-2 right-2 flex gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg border shadow-sm pointer-events-auto">
                {[
                    { id: 'classic', icon: 'Sun', label: 'Clásico' },
                    { id: 'modern', icon: 'Atom', label: 'Moderno' },
                    { id: 'alchemical', icon: 'BookOpen', label: 'Alquimia' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => onThemeChange(t.id as any)}
                        className={`p-1.5 rounded-md transition-all ${theme === t.id ? 'bg-[#C55959] text-white shadow' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={`Diseño ${t.label}`}
                    >
                        {t.id === 'classic' && <Sun size={12} />}
                        {t.id === 'modern' && <Atom size={12} />}
                        {t.id === 'alchemical' && <BookOpen size={12} />}
                    </button>
                ))}
            </div>

            {/* Zoom Controls - Bottom Right */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                <button onClick={handleZoomIn} className="bg-white text-black p-2 rounded-full shadow hover:bg-gray-100 border border-gray-200"><Plus size={14} /></button>
                <button onClick={handleZoomOut} className="bg-white text-black p-2 rounded-full shadow hover:bg-gray-100 border border-gray-200"><Minus size={14} /></button>
            </div>

            {/* Content Container with Zoom */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden cursor-move active:cursor-grabbing p-4">
                <div id={id} style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease-out' }} className="w-full h-full flex items-center justify-center origin-center">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const PlanetaryTrinity = ({ sun, moon, asc }: { sun: string, moon: string, asc: string }) => {
    // Resolve descriptions
    const getDesc = (sign: string, type: 'light' | 'shadow' | 'sun' | 'moon' | 'ascendant') => {
        const data = ZODIAC_ARCHETYPES[sign] || ZODIAC_ARCHETYPES['Aries']; // fallback
        if (type === 'sun') return data.sun;
        if (type === 'moon') return data.moon;
        if (type === 'ascendant') return data.ascendant;
        return data.keywords.join(', ');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="glass-panel bg-white/60 p-4 rounded-xl border border-[#C55959]/10 hover:border-[#C55959]/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-serif text-[#C55959] transform rotate-12 group-hover:rotate-0 transition-transform">☉</div>
                <div className="text-[#C55959] text-2xl mb-2 animate-pulse-slow">☉</div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-1">Tu Esencia (Sol)</div>
                <div className="font-serif font-bold text-lg text-[#1a1a1a] mb-2">{sun || '-'}</div>
                <p className="text-[10px] text-gray-600 leading-relaxed italic border-t border-black/5 pt-2 w-full">
                    "{getDesc(sun, 'sun')}"
                </p>
            </div>

            <div className="glass-panel bg-white/60 p-4 rounded-xl border border-[#C55959]/10 hover:border-[#C55959]/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-serif text-[#C55959] transform rotate-12 group-hover:rotate-0 transition-transform">☾</div>
                <div className="text-[#C55959] text-2xl mb-2 animate-pulse-slow">☾</div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-1">Tu Emoción (Luna)</div>
                <div className="font-serif font-bold text-lg text-[#1a1a1a] mb-2">{moon || '-'}</div>
                <p className="text-[10px] text-gray-600 leading-relaxed italic border-t border-black/5 pt-2 w-full">
                    "{getDesc(moon, 'moon')}"
                </p>
            </div>

            <div className="glass-panel bg-white/60 p-4 rounded-xl border border-[#C55959]/10 hover:border-[#C55959]/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-serif text-[#C55959] transform rotate-12 group-hover:rotate-0 transition-transform">↑</div>
                <div className="text-[#C55959] text-2xl mb-2 animate-pulse-slow">↑</div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-1">Tu Máscara (Asc)</div>
                <div className="font-serif font-bold text-lg text-[#1a1a1a] mb-2">{asc || '-'}</div>
                <p className="text-[10px] text-gray-600 leading-relaxed italic border-t border-black/5 pt-2 w-full">
                    "{getDesc(asc, 'ascendant')}"
                </p>
            </div>
        </div>
    );
};

export const CharacterTransits = ({ birthData }: { birthData: any }) => {
    const [transits, setTransits] = useState<any[]>([]);

    useEffect(() => {
        if (!birthData || !birthData.date) return;
        Promise.all([
            import('@/utils/astronomy'),
            import('@/utils/astrology')
        ]).then(([{ calculateRealPlanets }, { calculateAspects }]) => {
            const now = new Date();
            const t = calculateRealPlanets(now.toISOString(), birthData.lat || 40, birthData.lon || -3);
            const n = calculateRealPlanets(birthData.date, birthData.lat || 40, birthData.lon || -3);
            const aspects = calculateAspects(t.planets, n.planets, 'NATAL');
            setTransits(aspects.slice(0, 5));
        });
    }, [birthData]);

    if (transits.length === 0) return <div className="text-[9px] text-gray-400 italic">Sin tránsitos mayores activos.</div>;

    return (
        <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            <div className="text-[9px] uppercase font-bold tracking-widest text-[#5B7C99] border-b border-[#5B7C99]/20 pb-1 mb-2">Tránsitos Activos</div>
            {transits.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] bg-white/50 p-2 rounded border border-black/5">
                    <span className="text-[#C55959] font-serif">{a.symbol || '✧'}</span>
                    <span className="font-bold">{a.planet1}</span>
                    <span className="text-gray-400 text-[8px]">vs</span>
                    <span className="font-bold">{a.planet2}</span>
                    <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] ${a.type.includes('Op') || a.type.includes('Cuad') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                        }`}>{a.type}</span>
                </div>
            ))}
        </div>
    );
};
