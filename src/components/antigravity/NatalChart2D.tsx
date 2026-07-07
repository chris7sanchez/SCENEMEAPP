"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { calculateRealPlanets, PlanetPosition } from '@/utils/astronomy';
import { ASTEROID_DEFS, AsteroidPosition } from '@/utils/asteroids';

const ZODIAC_SIGNS = [
    { symbol: '♈', name: 'Aries', color: '#FF4500' },
    { symbol: '♉', name: 'Tauro', color: '#228B22' },
    { symbol: '♊', name: 'Géminis', color: '#FFD700' },
    { symbol: '♋', name: 'Cáncer', color: '#C0C0C0' },
    { symbol: '♌', name: 'Leo', color: '#FFA500' },
    { symbol: '♍', name: 'Virgo', color: '#808000' },
    { symbol: '♎', name: 'Libra', color: '#FF69B4' },
    { symbol: '♏', name: 'Escorpio', color: '#8B0000' },
    { symbol: '♐', name: 'Sagitario', color: '#800080' },
    { symbol: '♑', name: 'Capricornio', color: '#A52A2A' },
    { symbol: '♒', name: 'Acuario', color: '#00FFFF' },
    { symbol: '♓', name: 'Piscis', color: '#2E8B57' },
];

interface NatalChartProps {
    date?: string;
    latitude?: number;
    longitude?: number;
    timezone?: number;
    isDST?: boolean;
    transitsDate?: string;
    knownAscendant?: string;
    knownMoon?: string;
    customPlanets?: Record<string, string | undefined>;
    transparent?: boolean;
    forceAriesZero?: boolean;
    theme?: 'classic' | 'modern' | 'alchemical';
    showTransits?: boolean;
    showAsteroids?: boolean;
}

const THEMES = {
    classic: {
        bg: 'white', text: 'black', line: '#333', houseLine: '#e5e7eb',
        ring: '#000', font: 'sans-serif', planetBg: 'white', accent: '#C55959',
        planetRadius: 10, planetFontSize: 12, signFontSize: 14,
        strokeNormal: "1", strokeBold: "2"
    },
    modern: {
        bg: '#0f172a', text: '#f8fafc', line: '#475569', houseLine: '#334155',
        ring: '#94a3b8', font: 'Inter, sans-serif', planetBg: '#1e293b', accent: '#38bdf8',
        planetRadius: 12, planetFontSize: 14, signFontSize: 16,
        strokeNormal: "1.5", strokeBold: "2.5"
    },
    alchemical: {
        bg: '#F2F0E9', text: '#5c4d44', line: '#8c7b70', houseLine: '#d6cfc7',
        ring: '#5c4d44', font: 'serif', planetBg: '#F9F8F4', accent: '#D4AF37',
        planetRadius: 14, planetFontSize: 18, signFontSize: 18,
        strokeNormal: "1.2", strokeBold: "3"
    }
};

// ─── Astrodienst-style anti-collision placement ────────────────────────────
// Distributes symbol angles so no two symbols are closer than MIN_SEP degrees.
// Each symbol retains a "tick" at its true longitude on the wheel.
function resolveNonOverlapping(
    items: Array<{ longitude: number; [key: string]: any }>,
    minSep: number
): number[] {
    const n = items.length;
    if (n === 0) return [];

    // Work in [0, 360) sorted order
    const indexed = items.map((it, i) => ({ lon: it.longitude % 360, idx: i }))
        .sort((a, b) => a.lon - b.lon);

    // Initial display angles == true longitudes
    const disp = indexed.map(it => it.lon);

    // Iterative relaxation — push apart overlapping neighbours (up to 50 passes)
    for (let pass = 0; pass < 50; pass++) {
        let changed = false;
        for (let i = 0; i < n; i++) {
            const prev = (i - 1 + n) % n;
            let gap = (disp[i] - disp[prev] + 360) % 360;
            if (gap < minSep) {
                const push = (minSep - gap) / 2;
                disp[i] = (disp[i] + push + 360) % 360;
                disp[prev] = (disp[prev] - push + 360) % 360;
                changed = true;
            }
        }
        if (!changed) break;
    }

    // Map back to original order
    const result = new Array(n);
    indexed.forEach((it, sortedI) => { result[it.idx] = disp[sortedI]; });
    return result;
}

export default function NatalChart2D({
    date, latitude = 40.4168, longitude = -3.7038,
    timezone = 0, isDST = false, transitsDate,
    knownAscendant, knownMoon, customPlanets,
    transparent = false, forceAriesZero = false,
    theme = 'classic', showAsteroids = true
}: NatalChartProps) {
    const style = THEMES[theme] || THEMES.classic;
    const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

    // ── Asteroides (efemérides reales vía /api/asteroids, módulo aislado) ──
    const [asteroids, setAsteroids] = useState<AsteroidPosition[]>([]);
    const [astOn, setAstOn] = useState<Record<string, boolean>>(
        Object.fromEntries(ASTEROID_DEFS.map(a => [a.name, true]))
    );
    useEffect(() => {
        if (!date || !showAsteroids) { setAsteroids([]); return; }
        let cancelled = false;
        fetch(`/api/asteroids?date=${encodeURIComponent(date)}`)
            .then(r => r.json())
            .then(j => { if (!cancelled && j?.ok && Array.isArray(j.asteroids)) setAsteroids(j.asteroids); })
            .catch(() => { /* aislado: si JPL falla, no se muestran asteroides */ });
        return () => { cancelled = true; };
    }, [date, showAsteroids]);

    const { natalPlanets, ascendant, houses, chartRotation } = useMemo(() => {
        if (!date) return { natalPlanets: [], ascendant: 0, houses: [], chartRotation: 0 };

        const data = calculateRealPlanets(date, latitude, longitude, 'porphyry', timezone, isDST);
        let finalAscendant = data.ascendant;
        let finalPlanets = [...data.planets];

        if (knownAscendant) {
            const si = ZODIAC_SIGNS.findIndex(s => s.name === knownAscendant);
            if (si !== -1) finalAscendant = si * 30 + 15;
        }
        if (knownMoon) {
            const si = ZODIAC_SIGNS.findIndex(s => s.name === knownMoon);
            if (si !== -1) {
                const moonLon = si * 30 + 15;
                const mi = finalPlanets.findIndex(p => p.name === 'Luna');
                if (mi !== -1) finalPlanets[mi] = { ...finalPlanets[mi], longitude: moonLon };
                else finalPlanets.push({ name: 'Luna', symbol: '☽', longitude: moonLon, color: '#C0C0C0', speed: 0, isRetrograde: false, sign: ZODIAC_SIGNS[si].name, degree: 15 });
            }
        }
        if (customPlanets) {
            Object.entries(customPlanets).forEach(([pName, sName]) => {
                if (!sName) return;
                const si = ZODIAC_SIGNS.findIndex(s => s.name === sName);
                if (si !== -1) {
                    const idx = finalPlanets.findIndex(p => p.name === pName);
                    if (idx !== -1) finalPlanets[idx] = { ...finalPlanets[idx], longitude: si * 30 + 15 };
                }
            });
        }

        const rotation = forceAriesZero ? 180 : 180 - finalAscendant;
        return {
            natalPlanets: finalPlanets,
            ascendant: finalAscendant,
            houses: data.houses || Array.from({ length: 12 }).map((_, i) => (finalAscendant + i * 30) % 360),
            chartRotation: rotation
        };
    }, [date, latitude, longitude, knownAscendant, knownMoon, customPlanets, forceAriesZero]);

    const transitPlanets = useMemo(() => {
        if (!transitsDate) return [];
        return calculateRealPlanets(transitsDate, latitude, longitude).planets;
    }, [transitsDate, latitude, longitude]);

    // ── Geometry constants ────────────────────────────────────────────────
    const cx = 200;           // SVG center
    const cy = 200;
    const R_OUTER = 185;      // Outer zodiac ring
    const R_SIGN = R_OUTER * 0.94;  // Zodiac glyphs
    const R_ZODIAC_INNER = R_OUTER * 0.88; // Inner zodiac border
    const R_TICK_OUTER = R_ZODIAC_INNER; // Where tick line meets inner ring
    const R_TICK_INNER = R_ZODIAC_INNER - 6; // Short tick mark
    const R_SYMBOL = R_OUTER * 0.72; // Planet symbol ring (Astrodienst style)
    const R_ANCHOR = R_ZODIAC_INNER - 8; // Where the anchor line starts (near the degree mark)
    const R_HOUSE_LINE = R_ZODIAC_INNER;
    const R_ASPECT = R_OUTER * 0.82; // Aspect lines draw from here
    const R_AST = R_OUTER * 0.56; // Asteroid symbol ring (inner sub-ring)

    // Transit ring (outside R_OUTER)
    const R_TRANSIT_TICK = R_OUTER + 10;
    const R_TRANSIT_SYMBOL = R_OUTER + 30;

    const polar = (lon: number, r: number) => {
        let adj = (lon + chartRotation) % 360;
        if (adj < 0) adj += 360;
        const theta = -(adj * Math.PI) / 180;
        return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
    };

    // ── Anti-collision display angles for natal planets ───────────────────
    const MIN_SEP_NATAL = 13; // degrees between symbol centres
    const natalDispAngles = useMemo(
        () => resolveNonOverlapping(natalPlanets, MIN_SEP_NATAL),
        [natalPlanets]
    );

    const MIN_SEP_TRANSIT = 12;
    const transitDispAngles = useMemo(
        () => resolveNonOverlapping(transitPlanets, MIN_SEP_TRANSIT),
        [transitPlanets]
    );

    const activeAsteroids = asteroids.filter(a => astOn[a.name]);
    const asteroidDispAngles = useMemo(
        () => resolveNonOverlapping(activeAsteroids, 12),
        [asteroids, astOn]
    );

    return (
        <div className={`w-full h-full flex items-center justify-center relative ${transparent ? 'bg-transparent' : 'bg-white rounded-full shadow-2xl'} text-black`}>
            <svg viewBox="-70 -70 540 540" className="w-full h-full" style={{ overflow: 'visible' }}>

                {/* Background */}
                {!transparent && <circle cx={cx} cy={cy} r={R_OUTER + 5} fill={style.bg} />}

                {/* Outer ring */}
                <circle cx={cx} cy={cy} r={R_OUTER} fill="none" stroke={style.ring} strokeWidth={style.strokeBold} />
                {/* Inner zodiac ring */}
                <circle cx={cx} cy={cy} r={R_ZODIAC_INNER} fill="none" stroke={style.ring} strokeWidth={style.strokeNormal} />
                {/* Inner planet ring guide (subtle) */}
                <circle cx={cx} cy={cy} r={R_SYMBOL + 16} fill="none" stroke={style.ring} strokeWidth="0.3" opacity="0.2" strokeDasharray="3,4" />

                {Array.from({ length: 12 }).map((_, i) => {
                    const a = polar(i * 30, R_OUTER);
                    const b = polar(i * 30, R_ZODIAC_INNER);
                    return <line key={`sb-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={style.ring} strokeWidth="0.6" opacity="0.5" />;
                })}

                {/* ── Zodiac glyphs */}
                {ZODIAC_SIGNS.map((sign, i) => {
                    const c = polar(i * 30 + 15, R_SIGN);
                    return (
                        <text key={sign.name} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle"
                            fill={theme === 'modern' ? style.accent : sign.color}
                            fontSize={style.signFontSize} fontWeight="bold" fontFamily={style.font}>
                            {sign.symbol}
                        </text>
                    );
                })}

                {houses.map((cuspLon, i) => {
                    const c = polar(cuspLon, R_HOUSE_LINE);
                    const nextCusp = houses[(i + 1) % 12];
                    let mid = (cuspLon + nextCusp) / 2;
                    if (nextCusp < cuspLon) mid = ((cuspLon + nextCusp + 360) / 2) % 360;
                    const nC = polar(mid, R_OUTER * 0.40);
                    const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
                    return (
                        <g key={`house-${i}`}>
                            <line x1={cx} y1={cy} x2={c.x} y2={c.y}
                                stroke={isAngular ? style.line : '#cfcfcf'}
                                strokeWidth={isAngular ? '1.4' : '0.7'} />
                            <text x={nC.x} y={nC.y} textAnchor="middle" dominantBaseline="middle"
                                fill={style.text} opacity="0.5" fontSize="9" fontFamily="monospace">{i + 1}</text>
                        </g>
                    );
                })}

                {/* ── Axes */}
                <line x1={cx + R_OUTER * Math.cos(Math.PI)} y1={cy + R_OUTER * Math.sin(Math.PI)}
                    x2={cx + R_OUTER * Math.cos(0)} y2={cy + R_OUTER * Math.sin(0)}
                    stroke={style.line} strokeWidth={style.strokeBold} opacity="0.8" />

                {natalPlanets.map((p1, i) =>
                    natalPlanets.slice(i + 1).map((p2) => {
                        let diff = Math.abs(p1.longitude - p2.longitude);
                        if (diff > 180) diff = 360 - diff;
                        const orb = 6;
                        const isTrine = Math.abs(diff - 120) < orb;
                        const isSquare = Math.abs(diff - 90) < orb;
                        const isOpp = Math.abs(diff - 180) < orb;
                        if (!isTrine && !isSquare && !isOpp) return null;
                        const c1 = polar(p1.longitude, R_ASPECT);
                        const c2 = polar(p2.longitude, R_ASPECT);
                        const color = isTrine ? '#3b82f6' : '#ef4444';
                        return <line key={`asp-${p1.name}-${p2.name}`} x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y}
                            stroke={color} strokeWidth="0.7" opacity="0.28" />;
                    })
                )}

                {/* ── NATAL PLANETS — Astrodienst style ────────────────────── */}
                {natalPlanets.map((planet, i) => {
                    const isHovered = hoveredPlanet === `natal-${planet.name}`;

                    // True position tick on the degree ring
                    const tickOuter = polar(planet.longitude, R_TICK_OUTER);
                    const tickInner = polar(planet.longitude, R_TICK_INNER);

                    // Display angle (collision-resolved)
                    const dispLon = natalDispAngles[i] ?? planet.longitude;
                    const symPos = polar(dispLon, R_SYMBOL);

                    // Anchor line: from tick inward to near the symbol
                    const anchorStart = polar(planet.longitude, R_ANCHOR);
                    const midPoint = polar((planet.longitude + dispLon) / 2, (R_ANCHOR + R_SYMBOL + 14) / 2);
                    const symEdge = polar(dispLon, R_SYMBOL + 13);

                    const degreeInSign = Math.floor(planet.longitude % 30);
                    const minuteInSign = Math.floor((planet.longitude % 1) * 60);
                    const symbolSize = isHovered ? style.planetFontSize * 1.5 : style.planetFontSize;
                    const circleR = isHovered ? style.planetRadius * 1.4 : style.planetRadius;

                    return (
                        <g key={`natal-${planet.name}`}
                            onMouseEnter={() => setHoveredPlanet(`natal-${planet.name}`)}
                            onMouseLeave={() => setHoveredPlanet(null)}
                            style={{ cursor: 'pointer' }}>

                            {/* Tick mark at true degree (short line on inner edge of zodiac ring) */}
                            <line x1={tickOuter.x} y1={tickOuter.y} x2={tickInner.x} y2={tickInner.y}
                                stroke={planet.color} strokeWidth="2" strokeLinecap="round" />

                            {/* Anchor line: tick → symbol (only if symbol has moved away from true position) */}
                            {Math.abs(dispLon - planet.longitude) > 1 && (
                                <path
                                    d={`M${anchorStart.x},${anchorStart.y} Q${midPoint.x},${midPoint.y} ${symEdge.x},${symEdge.y}`}
                                    fill="none" stroke={planet.color} strokeWidth="0.6"
                                    strokeDasharray="2,2" opacity="0.55"
                                />
                            )}

                            {/* Planet circle + glyph */}
                            <circle cx={symPos.x} cy={symPos.y} r={circleR}
                                fill={style.planetBg} stroke={planet.color}
                                strokeWidth={isHovered ? "2" : style.strokeNormal}
                                style={{ transition: 'r 0.15s, stroke-width 0.15s', filter: isHovered ? `drop-shadow(0 0 4px ${planet.color})` : 'none' }}
                            />
                            <text x={symPos.x} y={symPos.y}
                                textAnchor="middle" dominantBaseline="middle"
                                fill={theme === 'modern' ? 'white' : planet.color}
                                fontSize={symbolSize} fontWeight="bold" fontFamily={style.font}
                                style={{ transition: 'font-size 0.15s' }}>
                                {planet.symbol}
                            </text>

                            {/* Degree label below glyph (always visible, small) */}
                            {!isHovered && (
                                <text x={symPos.x} y={symPos.y + circleR + 5}
                                    textAnchor="middle" fill={style.text}
                                    fontSize="6.5" fontFamily="monospace" opacity="0.7"
                                    fontWeight="bold">
                                    {degreeInSign}°
                                </text>
                            )}

                            {/* HOVER TOOLTIP */}
                            {isHovered && (
                                <g>
                                    <rect x={symPos.x - 28} y={symPos.y - circleR - 28}
                                        width="56" height="24" rx="3"
                                        fill={style.text} opacity="0.92" />
                                    <text x={symPos.x} y={symPos.y - circleR - 19}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fill={style.bg} fontSize="8" fontFamily={style.font} fontWeight="bold">
                                        {planet.name}
                                    </text>
                                    <text x={symPos.x} y={symPos.y - circleR - 9}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fill={style.accent} fontSize="7.5" fontFamily="monospace">
                                        {degreeInSign}°{minuteInSign.toString().padStart(2, '0')}′ {planet.sign}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}

                {/* ── ASTEROIDES (Quirón · Ceres · Pallas · Juno · Vesta) — anillo interior */}
                {activeAsteroids.map((ast, i) => {
                    const tickOuter = polar(ast.longitude, R_TICK_OUTER);
                    const tickInner = polar(ast.longitude, R_TICK_INNER);
                    const dispLon = asteroidDispAngles[i] ?? ast.longitude;
                    const symPos = polar(dispLon, R_AST);
                    const symEdge = polar(dispLon, R_AST + 11);
                    const anchorStart = polar(ast.longitude, R_ANCHOR);
                    const midPoint = polar((ast.longitude + dispLon) / 2, (R_ANCHOR + R_AST + 12) / 2);
                    const deg = Math.floor(ast.longitude % 30);
                    const rr = style.planetRadius * 0.78;
                    return (
                        <g key={`ast-${ast.name}`}>
                            <line x1={tickOuter.x} y1={tickOuter.y} x2={tickInner.x} y2={tickInner.y}
                                stroke={ast.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
                            {Math.abs(dispLon - ast.longitude) > 1 && (
                                <path d={`M${anchorStart.x},${anchorStart.y} Q${midPoint.x},${midPoint.y} ${symEdge.x},${symEdge.y}`}
                                    fill="none" stroke={ast.color} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                            )}
                            <circle cx={symPos.x} cy={symPos.y} r={rr}
                                fill={style.planetBg} stroke={ast.color} strokeWidth="1" strokeDasharray="2,1.5" />
                            <text x={symPos.x} y={symPos.y} textAnchor="middle" dominantBaseline="middle"
                                fill={ast.color} fontSize={style.planetFontSize * 0.82} fontWeight="bold" fontFamily={style.font}>
                                {ast.symbol}
                            </text>
                            <text x={symPos.x} y={symPos.y + rr + 5} textAnchor="middle"
                                fill={style.text} fontSize="5.5" fontFamily="monospace" opacity="0.6">{deg}°</text>
                        </g>
                    );
                })}

                {/* ── TRANSIT PLANETS — outer ring ───────────────────────── */}
                {/* Outer boundary for transits */}
                {transitPlanets.length > 0 && (
                    <circle cx={cx} cy={cy} r={R_TRANSIT_SYMBOL + 18} fill="none"
                        stroke={style.ring} strokeWidth="0.4" opacity="0.3" strokeDasharray="3,5" />
                )}
                {transitPlanets.map((planet, i) => {
                    const isHovered = hoveredPlanet === `transit-${planet.name}`;

                    // True degree tick on outer edge
                    const tickInner = polar(planet.longitude, R_OUTER + 2);
                    const tickOuter = polar(planet.longitude, R_OUTER + 9);

                    // Display position (collision-resolved)
                    const dispLon = transitDispAngles[i] ?? planet.longitude;
                    const symPos = polar(dispLon, R_TRANSIT_SYMBOL);

                    // Anchor line
                    const anchorStart = polar(planet.longitude, R_OUTER + 10);
                    const midPoint = polar((planet.longitude + dispLon) / 2, R_TRANSIT_SYMBOL - 8);
                    const symEdge = polar(dispLon, R_TRANSIT_SYMBOL - 12);

                    const degreeInSign = Math.floor(planet.longitude % 30);
                    const minuteInSign = Math.floor((planet.longitude % 1) * 60);
                    const symbolSize = isHovered ? 13 : 10;
                    const circleR = isHovered ? 11 : 8;

                    return (
                        <g key={`transit-${planet.name}`}
                            onMouseEnter={() => setHoveredPlanet(`transit-${planet.name}`)}
                            onMouseLeave={() => setHoveredPlanet(null)}
                            style={{ cursor: 'pointer' }}>

                            {/* Tick at true degree */}
                            <line x1={tickInner.x} y1={tickInner.y} x2={tickOuter.x} y2={tickOuter.y}
                                stroke={planet.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                            {/* Anchor line to symbol if displaced */}
                            {Math.abs(dispLon - planet.longitude) > 1 && (
                                <path d={`M${anchorStart.x},${anchorStart.y} Q${midPoint.x},${midPoint.y} ${symEdge.x},${symEdge.y}`}
                                    fill="none" stroke={planet.color} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                            )}

                            {/* Transit glyph (no circle background — more subtle) */}
                            <circle cx={symPos.x} cy={symPos.y} r={circleR}
                                fill={theme === 'modern' ? '#0f172a' : 'white'}
                                stroke={planet.color} strokeWidth="0.8" opacity="0.9"
                                style={{ filter: isHovered ? `drop-shadow(0 0 3px ${planet.color})` : 'none' }} />
                            <text x={symPos.x} y={symPos.y}
                                textAnchor="middle" dominantBaseline="middle"
                                fill={planet.color} fontSize={symbolSize} fontWeight="bold">
                                {planet.symbol}
                            </text>

                            {/* Degree below */}
                            {!isHovered && (
                                <text x={symPos.x} y={symPos.y + circleR + 4}
                                    textAnchor="middle" fill={planet.color}
                                    fontSize="5.5" fontFamily="monospace" opacity="0.75">
                                    {degreeInSign}°
                                </text>
                            )}

                            {/* Hover tooltip */}
                            {isHovered && (
                                <g>
                                    <rect x={symPos.x - 32} y={symPos.y - circleR - 30}
                                        width="64" height="26" rx="3"
                                        fill={style.text} opacity="0.92" />
                                    <text x={symPos.x} y={symPos.y - circleR - 21}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fill={style.bg} fontSize="8" fontFamily={style.font} fontWeight="bold">
                                        T: {planet.name}
                                    </text>
                                    <text x={symPos.x} y={symPos.y - circleR - 10}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fill={planet.color} fontSize="7.5" fontFamily="monospace">
                                        {degreeInSign}°{minuteInSign.toString().padStart(2, '0')}′
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}

                {/* Sacred geometry (subtle bg decoration) */}
                {!transparent && (
                    <g opacity="0.04">
                        <circle cx={cx} cy={cy} r={R_OUTER * 0.3} fill="none" stroke="#000" strokeWidth="0.5" />
                        <path d={`M${cx} ${cy - R_OUTER * 0.3} L${cx + R_OUTER * 0.26} ${cy + R_OUTER * 0.15} L${cx - R_OUTER * 0.26} ${cy + R_OUTER * 0.15} Z`}
                            fill="none" stroke="#000" strokeWidth="0.5" />
                    </g>
                )}

                {/* Center dot */}
                <circle cx={cx} cy={cy} r="4" fill={style.line} />

            </svg>

            {showAsteroids && asteroids.length > 0 && (
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-0.5 bg-white/85 backdrop-blur-sm rounded-lg p-2 border border-black/5 shadow-sm text-[9px]">
                    <span className="font-mono uppercase tracking-wider text-gray-400 mb-1 px-0.5">Asteroides</span>
                    {asteroids.map(a => (
                        <label key={a.name} className="flex items-center gap-1.5 cursor-pointer select-none hover:bg-black/5 rounded px-0.5 py-px">
                            <input type="checkbox" checked={!!astOn[a.name]}
                                onChange={() => setAstOn(p => ({ ...p, [a.name]: !p[a.name] }))}
                                style={{ accentColor: a.color, width: 11, height: 11 }} />
                            <span style={{ color: a.color }} className="text-[11px] leading-none">{a.symbol}</span>
                            <span className="text-gray-600">{a.name}</span>
                        </label>
                    ))}
                </div>
            )}

            <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-serif">
                {date ? new Date(date).toLocaleDateString() : 'DEMO'}
            </div>
        </div>
    );
}
