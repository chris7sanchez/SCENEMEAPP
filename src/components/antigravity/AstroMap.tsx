"use client";
import React, { useMemo, useState } from 'react';
import { calculateRealPlanets, calculateGMST } from '@/utils/astronomy';

interface AstroMapProps {
    date: string;
    latitude: number;
    longitude: number;
}

export default function AstroMap({ date, latitude, longitude }: AstroMapProps) {
    const [hoveredLine, setHoveredLine] = useState<string | null>(null);

    const { lines } = useMemo(() => {
        try {
            if (!date) return { lines: [] };

            const d = new Date(date);
            if (isNaN(d.getTime())) return { lines: [] }; // Invalid date check

            const gmst = calculateGMST(d);
            const data = calculateRealPlanets(date, latitude, longitude);

            // Calculate MC Lines (Vertical)
            // MC Longitude = RA - GMST
            // We need to normalize to -180 to 180 for the map
            const mapLines = data.planets.map(p => {
                // RA is in hours (0-24). Convert to degrees (0-360).
                const raDeg = p.ra * 15;

                // Geographic Longitude where this RA is on the Meridian (MC)
                // LST = GMST + Long
                // RA = GMST + Long
                // Long = RA - GMST
                let geoLon = raDeg - gmst;

                // Normalize to -180 to 180
                geoLon = (geoLon % 360 + 360) % 360;
                if (geoLon > 180) geoLon -= 360;
                if (geoLon < -180) geoLon += 360;

                return {
                    planet: p.name,
                    symbol: p.symbol,
                    color: p.color,
                    longitude: geoLon,
                    type: 'MC' // Midheaven (Success, Career, Public Standing)
                };
            });

            // IC Lines (Opposite to MC) - Home, Roots, Inner Self
            const icLines = mapLines.map(line => {
                let icLon = line.longitude + 180;
                if (icLon > 180) icLon -= 360;
                if (icLon < -180) icLon += 360;
                return {
                    ...line,
                    longitude: icLon,
                    type: 'IC',
                    color: line.color // Maybe make it dashed or lighter?
                };
            });

            return { lines: [...mapLines, ...icLines] };
        } catch (e) {
            console.error("AstroMap Error:", e);
            return { lines: [] };
        }
    }, [date, latitude, longitude]);

    return (
        <div className="w-full h-full bg-[#0f172a] relative overflow-hidden rounded-xl border border-white/10 group">
            {/* Reliable Background Image (Wikimedia) */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen pointer-events-none grayscale"
                style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')" }}
            ></div>

            {/* Overlay SVG for Lines */}
            <svg viewBox="-180 -90 360 180" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="fade-line" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {lines.map((line, i) => (
                    <g key={`${line.planet}-${line.type}-${i}`}>
                        {/* The Line */}
                        <line
                            x1={line.longitude} y1="-90"
                            x2={line.longitude} y2="90"
                            stroke={line.color}
                            strokeWidth={hoveredLine === line.planet ? "1.5" : "0.5"}
                            strokeOpacity={hoveredLine && hoveredLine !== line.planet ? 0.1 : (line.type === 'MC' ? 0.8 : 0.3)}
                            strokeDasharray={line.type === 'IC' ? "2,2" : "none"}
                            className="transition-all duration-300"
                        />

                        {/* Planet Symbol at top */}
                        {line.type === 'MC' && (
                            <text
                                x={line.longitude} y="-80"
                                fill={line.color}
                                fontSize="6"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="pointer-events-auto cursor-pointer hover:scale-150 transition-transform"
                                onMouseEnter={() => setHoveredLine(line.planet)}
                                onMouseLeave={() => setHoveredLine(null)}
                            >
                                {line.symbol}
                            </text>
                        )}
                    </g>
                ))}

                {/* User Location Marker */}
                <g transform={`translate(${longitude}, ${latitude})`}>
                    <circle r="2" fill="white" className="animate-pulse" />
                    <circle r="4" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" className="animate-ping" />
                    <text y="-5" fill="white" fontSize="4" textAnchor="middle" fontWeight="bold" style={{ textShadow: '0 0 2px black' }}>📍 TÚ</text>
                </g>
            </svg>

            {/* Tooltip Overlay */}
            {hoveredLine && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full backdrop-blur-md border border-white/20 text-sm font-mono uppercase tracking-widest z-50 shadow-xl flex items-center gap-3">
                    <span className="text-[#C55959]">●</span> Línea de {hoveredLine} (MC)
                </div>
            )}

            <div className="absolute bottom-4 left-4 text-[10px] text-white/40 font-mono bg-black/50 px-2 py-1 rounded">
                ASTROCARTOGRAFÍA: LÍNEAS PLANETARIAS (MC/IC)
            </div>
        </div>
    );
}
