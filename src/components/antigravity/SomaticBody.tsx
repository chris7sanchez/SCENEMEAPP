
import React from 'react';
import { SomaticPoint } from '@/utils/somatic-mapping';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface SomaticBodyProps {
    points: SomaticPoint[];
}

export default function SomaticBody({ points }: SomaticBodyProps) {
    const [style, setStyle] = React.useState<'MODERN' | 'VITRUVIAN'>('VITRUVIAN');
    const [scale, setScale] = React.useState(1);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const handleReset = () => setScale(1);

    // Helper to get active point for a zone
    const getPoint = (id: string) => points.find(p => p.id === id);

    // Coordinate Mapping based on Style AND Pose
    const getCoords = (id: string): { x: number, y: number, side: 'left' | 'right' } => {
        if (style === 'VITRUVIAN') {
            // Vitruvian Pose: X-shape configuration
            switch (id) {
                case 'head': return { x: 50, y: 15, side: 'right' };
                case 'throat': return { x: 50, y: 22, side: 'left' };
                case 'chest': return { x: 50, y: 30, side: 'right' }; // Higher chest
                case 'heart': return { x: 50, y: 34, side: 'left' };
                case 'hands': return { x: 88, y: 28, side: 'right' }; // Hands extended high/wide
                case 'gut': return { x: 50, y: 45, side: 'right' };
                case 'lumbar': return { x: 50, y: 48, side: 'left' };
                case 'pelvis': return { x: 50, y: 55, side: 'right' };
                case 'hips': return { x: 65, y: 58, side: 'right' };
                case 'knees': return { x: 75, y: 75, side: 'left' }; // Knees wide
                case 'ankles': return { x: 82, y: 88, side: 'right' }; // Ankles wide
                case 'feet': return { x: 85, y: 95, side: 'left' }; // Feet very wide
                default: return { x: 50, y: 50, side: 'right' };
            }
        } else {
            // Modern Pose: Standing straight
            switch (id) {
                case 'head': return { x: 50, y: 15, side: 'right' };
                case 'throat': return { x: 50, y: 22, side: 'left' };
                case 'hands': return { x: 75, y: 45, side: 'right' };
                case 'chest': return { x: 50, y: 32, side: 'left' };
                case 'heart': return { x: 50, y: 35, side: 'right' };
                case 'gut': return { x: 50, y: 45, side: 'left' };
                case 'lumbar': return { x: 50, y: 48, side: 'right' };
                case 'pelvis': return { x: 50, y: 55, side: 'left' };
                case 'hips': return { x: 60, y: 58, side: 'right' };
                case 'knees': return { x: 45, y: 75, side: 'left' };
                case 'ankles': return { x: 60, y: 88, side: 'right' };
                case 'feet': return { x: 50, y: 95, side: 'left' };
                default: return { x: 50, y: 50, side: 'right' };
            }
        }
    };

    // Render a zone indicator
    const ZoneIndicator = ({ id }: { id: string }) => {
        const point = getPoint(id);
        if (!point) return null;

        const { x, y, side } = getCoords(id);

        const color =
            point.planet === 'Sol' ? (style === 'VITRUVIAN' ? '#b45309' : '#fbbf24') : // Amber / Dark Amber
                point.planet === 'Luna' ? (style === 'VITRUVIAN' ? '#475569' : '#e2e8f0') : // Slate
                    point.planet === 'Marte' ? (style === 'VITRUVIAN' ? '#991b1b' : '#ef4444') : // Red
                        point.planet === 'Venus' ? (style === 'VITRUVIAN' ? '#be185d' : '#f472b6') : // Pink
                            point.planet === 'Ascendente' ? (style === 'VITRUVIAN' ? '#047857' : '#10b981') : // Emerald
                                (style === 'VITRUVIAN' ? '#7e22ce' : '#a855f7'); // Purple

        const textColor = style === 'VITRUVIAN' ? 'text-[#4a3b32]' : 'text-white';
        const labelBg = style === 'VITRUVIAN' ? 'bg-[#e3dac3]/90 border-[#8d7966]' : 'bg-black/80 border-white/10 text-white';
        const lineColor = style === 'VITRUVIAN' ? '#5c4535' : color;
        const dotBorder = style === 'VITRUVIAN' ? 'border-[#2c241e]' : 'border-black';

        const isLower = y > 65;

        return (
            <div className="absolute z-20" style={{ left: `${x}%`, top: `${y}%` }}>
                {/* Pulse Effect */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-dashed"
                    style={{ borderColor: color }}
                />

                {/* Dot */}
                <div
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${dotBorder} shadow-sm z-10`}
                    style={{ backgroundColor: color }}
                />

                {/* Line & Label */}
                <motion.div
                    initial={{ opacity: 0, x: side === 'right' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`absolute ${isLower ? 'bottom-0' : 'top-0'} ${side === 'right' ? 'left-6' : 'right-6'} w-56 pointer-events-none`}
                >
                    <svg className={`absolute ${isLower ? 'bottom-2' : 'top-1.5'} ${side === 'right' ? '-left-6' : '-right-6'} w-6 h-[1px] overflow-visible`}>
                        <line x1={side === 'right' ? 0 : 24} y1={0} x2={side === 'right' ? 24 : 0} y2={0} stroke={lineColor} strokeWidth="1" />
                        <circle cx={side === 'right' ? 24 : 0} cy={0} r="1.5" fill={lineColor} />
                    </svg>

                    <div className={`flex ${isLower ? 'flex-col-reverse' : 'flex-col'} gap-1 ${side === 'right' ? 'items-start text-left' : 'items-end text-right'}`}>
                        <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-md border shadow-sm ${labelBg} ${style === 'VITRUVIAN' ? 'text-[#4a3b32]' : 'text-zinc-200'}`}>
                            <span style={{ color: style === 'VITRUVIAN' ? color : undefined, fontWeight: '900' }}>{point.planet}</span> <span className="opacity-70">en</span> {point.sign}
                        </div>
                        <div className={`text-[10px] font-serif italic leading-tight max-w-[180px] p-1 rounded ${style === 'VITRUVIAN' ? 'text-[#5c4535] bg-[#d6cbb1]/40' : 'text-zinc-300 bg-black/40'}`}>
                            "{point.instruction}"
                        </div>
                        <div className="text-[8px] opacity-80 uppercase tracking-wider font-bold" style={{ color: style === 'VITRUVIAN' ? '#8d7966' : '#C55959' }}>
                            {point.label}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    const isVitruvian = style === 'VITRUVIAN';

    return (
        <div className={`relative w-full h-[600px] rounded-xl overflow-hidden flex items-center justify-center group transition-all duration-1000 ${isVitruvian ? 'bg-[#f0ead6]' : 'bg-gradient-to-b from-zinc-900 to-black border border-white/5'}`}>

            {/* PAPER TEXTURE FOR VITRUVIAN */}
            {isVitruvian && (
                <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`, // Optional fallback or CSS noise
                    filter: 'sepia(0.8) contrast(1.1)'
                }} />
            )}

            {/* Context Header */}
            <div className={`absolute top-0 left-0 w-full p-4 z-30 flex justify-between items-start ${isVitruvian ? 'text-[#4a3b32]' : 'text-zinc-400 bg-gradient-to-b from-black/80 to-transparent'}`}>
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em]">
                        {isVitruvian ? 'L\'Uomo Vitruviano' : 'Somatic Possession Map'}
                    </h3>
                    <p className={`text-[9px] font-mono mt-1 ${isVitruvian ? 'text-[#8d7966]' : 'text-zinc-600'}`}>
                        {isVitruvian ? 'PROPORTIO DIVINA' : 'ANATOMÍA ENERGÉTICA'}
                    </p>
                </div>

                {/* STYLE TOGGLE */}
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => setStyle(isVitruvian ? 'MODERN' : 'VITRUVIAN')}
                        className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border rounded transition-all ${isVitruvian ? 'border-[#5c4535] text-[#5c4535] hover:bg-[#5c4535] hover:text-[#f0ead6]' : 'border-white/20 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        {isVitruvian ? 'MODO: CLÁSICO' : 'MODO: FUTURO'}
                    </button>

                    {/* ZOOM CONTROLS */}
                    <div className={`flex items-center gap-1 p-1 rounded border backdrop-blur-md ${isVitruvian ? 'border-[#8d7966]/30 bg-[#e3dac3]/50' : 'border-white/10 bg-black/50'}`}>
                        <button onClick={handleZoomOut} className={`p-1 rounded hover:bg-black/10 text-xs transition-colors ${isVitruvian ? 'text-[#5c4535]' : 'text-zinc-400 hover:text-white'}`}>
                            <ZoomOut size={14} />
                        </button>
                        <span className={`text-[9px] font-mono w-8 text-center ${isVitruvian ? 'text-[#5c4535]' : 'text-zinc-500'}`}>
                            {Math.round(scale * 100)}%
                        </span>
                        <button onClick={handleZoomIn} className={`p-1 rounded hover:bg-black/10 text-xs transition-colors ${isVitruvian ? 'text-[#5c4535]' : 'text-zinc-400 hover:text-white'}`}>
                            <ZoomIn size={14} />
                        </button>
                        <div className={`w-px h-3 mx-1 ${isVitruvian ? 'bg-[#5c4535]/30' : 'bg-white/10'}`}></div>
                        <button onClick={handleReset} className={`p-1 rounded hover:bg-black/10 text-xs transition-colors ${isVitruvian ? 'text-[#5c4535]' : 'text-zinc-400 hover:text-white'}`}>
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Background Grid/Geometry */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: isVitruvian
                    ? `linear-gradient(#8d7966 0.5px, transparent 0.5px), linear-gradient(90deg, #8d7966 0.5px, transparent 0.5px)`
                    : `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                backgroundSize: isVitruvian ? '50px 50px' : '40px 40px'
            }} />

            {/* SCALABLE CONTENT CONTAINER */}
            <motion.div
                className="absolute inset-0 w-full h-full flex items-center justify-center p-8"
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* VITRUVIAN GEOMETRY */}
                {isVitruvian && (
                    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#5c4535" strokeWidth="0.3" />
                        <rect x="15" y="15" width="70" height="70" fill="none" stroke="#5c4535" strokeWidth="0.3" />
                        <line x1="50" y1="0" x2="50" y2="100" stroke="#5c4535" strokeWidth="0.1" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#5c4535" strokeWidth="0.1" />
                    </svg>
                )}

                {/* Human Silhouette */}
                <div className="relative h-[85%] w-auto aspect-[1/1] opacity-60 transition-all duration-1000 group-hover:opacity-80 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className={`h-full w-full ${isVitruvian ? 'drop-shadow-none text-[#4a3b32]' : 'drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] text-zinc-600'}`}>
                        {isVitruvian ? (
                            // DA VINCI STYLE SILHOUETTE (User Image)
                            <image
                                href="/vitruvian-man.jpg"
                                x="0"
                                y="0"
                                width="200"
                                height="200"
                                preserveAspectRatio="xMidYMid meet"
                                opacity="0.9"
                                style={{ mixBlendMode: 'multiply' }}
                            />
                        ) : (
                            // MODERN SILHOUETTE
                            <path
                                transform="translate(50, 0)"
                                d="M50,5 C42,5 38,12 38,20 C38,28 42,32 50,32 C58,32 62,28 62,20 C62,12 58,5 50,5 M50,32 L50,38 M25,45 C25,45 35,40 50,40 C65,40 75,45 75,45 L75,90 C75,90 70,85 65,85 L65,110 L80,110 L80,115 L62,115 L62,190 L55,190 L55,130 L45,130 L45,190 L38,190 L38,115 L20,115 L20,110 L35,110 L35,85 C30,85 25,90 25,90 Z"
                                fill="currentColor"
                            />
                        )}
                    </svg>
                </div>

                {/* Zones - Render all defined zones */}
                {['head', 'throat', 'hands', 'chest', 'heart', 'gut', 'lumbar', 'pelvis', 'hips', 'knees', 'ankles', 'feet'].map(id => (
                    <ZoneIndicator key={id} id={id} />
                ))}
            </motion.div>

            {/* Footer Legend */}
            <div className={`absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-50 font-mono text-[8px] ${isVitruvian ? 'text-[#5c4535]' : 'text-zinc-500'}`}>
                <div className="">
                    <div className="flex items-center gap-1 mb-1"><div className={`w-2 h-2 rounded-full ${isVitruvian ? 'bg-[#b45309]' : 'bg-[#fbbf24]'}`} /> SOL</div>
                    <div className="flex items-center gap-1 mb-1"><div className={`w-2 h-2 rounded-full ${isVitruvian ? 'bg-[#475569]' : 'bg-[#e2e8f0]'}`} /> LUNA</div>
                    <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${isVitruvian ? 'bg-[#991b1b]' : 'bg-[#ef4444]'}`} /> MARTE</div>
                </div>
                <div className="text-right">
                    {isVitruvian ? 'CODEX ASTROLOGICUS' : 'ANTIGRAVITY SYSTEMS v2.4'}
                    <br />
                    {isVitruvian ? 'MMXXV' : 'SOMATIC PROTOCOL'}
                </div>
            </div>
        </div>
    );
}
