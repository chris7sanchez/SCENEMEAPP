"use client";
import React, { useMemo } from 'react';
import { calculateRealPlanets, PlanetPosition } from '@/utils/astronomy';

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
    transitsDate?: string;
    knownAscendant?: string; // NEW Override
    transparent?: boolean;
}

export default function NatalChart2D({ date, latitude = 40.4168, longitude = -3.7038, transitsDate, knownAscendant, transparent = false }: NatalChartProps) {
    const { natalPlanets, ascendant, chartRotation } = useMemo(() => {
        if (!date) return { natalPlanets: [], ascendant: 0, chartRotation: 0 };

        const data = calculateRealPlanets(date, latitude, longitude);

        let finalAscendant = data.ascendant;

        // MANUAL OVERRIDE LOGIC
        if (knownAscendant) {
            const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === knownAscendant);
            if (signIndex !== -1) {
                // Set Ascendant to mid-sign (15 deg) of the chosen sign
                finalAscendant = (signIndex * 30) + 15;
            }
        }

        // We want Ascendant to be at 180 degrees (Left side of SVG circle)
        // SVG 0 is Right. 180 is Left.
        // Rotation = Target(180) - ActualAscendant
        const rotation = 180 - finalAscendant;

        return {
            natalPlanets: data.planets,
            ascendant: finalAscendant,
            chartRotation: rotation
        };
    }, [date, latitude, longitude, knownAscendant]);

    const transitPlanets = useMemo(() => {
        if (!transitsDate) return [];
        const data = calculateRealPlanets(transitsDate, latitude, longitude);
        return data.planets;
    }, [transitsDate, latitude, longitude]);

    const radius = 180; // Slightly reduced to fit labels
    const center = 200;

    // Helper to get visual coordinates
    const getCoordinates = (longitude: number, r: number) => {
        let adjustedLon = (longitude + chartRotation) % 360;
        if (adjustedLon < 0) adjustedLon += 360;
        const theta = -(adjustedLon * Math.PI) / 180;
        return {
            x: center + r * Math.cos(theta),
            y: center + r * Math.sin(theta)
        };
    };

    return (
        <div className={`w-full h-full flex items-center justify-center relative ${transparent ? 'bg-transparent' : 'bg-white rounded-xl shadow-2xl'} p-4 text-black`}>
            <svg viewBox="0 0 400 400" className="w-full h-full" style={{ overflow: 'visible' }}>
                {/* Paper Background - Only if not transparent */}
                {!transparent && <rect x="0" y="0" width="400" height="400" fill="white" rx="10" />}

                {/* Outer Zodiac Ring Boundary */}
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#000" strokeWidth="2" />
                <circle cx={center} cy={center} r={radius * 0.85} fill="none" stroke="#000" strokeWidth="1" />

                {/* House Cusps (Lines) */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const cuspLon = ascendant + (i * 30);
                    const coords = getCoordinates(cuspLon, radius);
                    // Draw line from inner ring to outer edge
                    return <line key={`house-line-${i}`} x1={center} y1={center} x2={coords.x} y2={coords.y} stroke="#ccc" strokeWidth="1" />;
                })}

                {/* Horizon / Ascendant-Descendant Axis (Bold) */}
                <line
                    x1={center + radius * Math.cos(Math.PI)} y1={center + radius * Math.sin(Math.PI)}
                    x2={center + radius * Math.cos(0)} y2={center + radius * Math.sin(0)}
                    stroke="#000" strokeWidth="2"
                />
                {/* MC-IC Axis (Vertical) usually? No, let's just stick to Asc being bold Left */}
                <line x1={center} y1={center} x2={center - radius} y2={center} stroke="#000" strokeWidth="3" />
                <text x={center - radius - 20} y={center} fill="#000" fontSize="12" fontWeight="bold" dominantBaseline="middle">ASC</text>

                {/* House Numbers */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const centerAngleLon = ascendant + 15 + (i * 30);
                    const coords = getCoordinates(centerAngleLon, radius * 0.4);
                    return (
                        <text
                            key={`house-num-${i}`}
                            x={coords.x}
                            y={coords.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#999"
                            fontSize="10"
                            fontFamily="serif"
                        >
                            {i + 1}
                        </text>
                    );
                })}

                {/* Zodiac Signs */}
                {ZODIAC_SIGNS.map((sign, i) => {
                    const signLon = i * 30 + 15;
                    const coords = getCoordinates(signLon, radius * 0.92);
                    return (
                        <g key={sign.name}>
                            <text
                                x={coords.x}
                                y={coords.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={sign.color}
                                fontSize="16"
                                fontWeight="bold"
                            >
                                {sign.symbol}
                            </text>
                        </g>
                    );
                })}

                {/* Aspects */}
                {natalPlanets.map((p1, i) =>
                    natalPlanets.slice(i + 1).map((p2, j) => {
                        let diff = Math.abs(p1.longitude - p2.longitude);
                        if (diff > 180) diff = 360 - diff;

                        const isConj = diff < 8;
                        const isOpp = Math.abs(diff - 180) < 8;
                        const isTrine = Math.abs(diff - 120) < 6;
                        const isSquare = Math.abs(diff - 90) < 6;
                        const isSextile = Math.abs(diff - 60) < 4;

                        if (isConj || isOpp || isTrine || isSquare || isSextile) {
                            const c1 = getCoordinates(p1.longitude, radius * 0.7);
                            const c2 = getCoordinates(p2.longitude, radius * 0.7);

                            let color = '#ccc';
                            let dash = '0';
                            if (isTrine) color = '#00aa00'; // Green
                            if (isSquare || isOpp) color = '#cc0000'; // Red
                            if (isSextile) { color = '#0000cc'; dash = '4,2'; } // Blue
                            if (isConj) color = '#DAA520'; // Gold

                            return (
                                <line
                                    key={`aspect-${p1.name}-${p2.name}`}
                                    x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y}
                                    stroke={color}
                                    strokeWidth={isSextile ? "0.5" : "1"}
                                    strokeDasharray={dash}
                                    opacity="0.6"
                                />
                            )
                        }
                        return null;
                    })
                )}

                {/* Natal Planets */}
                {natalPlanets.map((planet, i) => {
                    const coords = getCoordinates(planet.longitude, radius * 0.75); // Inner ring

                    // Simple collision avoidance or stacking could optionally go here
                    // Text offset

                    // Calculate degree in sign (0-29)
                    const absoluteLon = planet.longitude;
                    const degreeInSign = Math.floor(absoluteLon % 30);

                    return (
                        <g key={`natal-${planet.name}`}>
                            <line x1={center} y1={center} x2={coords.x} y2={coords.y} stroke={planet.color} strokeWidth="0.5" opacity="0.2" />
                            <circle cx={coords.x} cy={coords.y} r="9" fill="white" stroke={planet.color} strokeWidth="1.5" />
                            <text
                                x={coords.x}
                                y={coords.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#000"
                                fontSize="12"
                                fontWeight="bold"
                            >
                                {planet.symbol}
                            </text>
                            {/* Degree Label */}
                            <text
                                x={coords.x}
                                y={coords.y + 14}
                                textAnchor="middle"
                                fill="#333"
                                fontSize="8"
                                fontFamily="monospace"
                            >
                                {degreeInSign}°
                            </text>
                        </g>
                    );
                })}

                {/* Transit Planets (Outer) */}
                {transitPlanets.map((planet, i) => {
                    const coords = getCoordinates(planet.longitude, radius + 25);
                    const innerCoords = getCoordinates(planet.longitude, radius);
                    const degreeInSign = Math.floor(planet.longitude % 30);

                    return (
                        <g key={`transit-${planet.name}`}>
                            <line x1={innerCoords.x} y1={innerCoords.y} x2={coords.x} y2={coords.y} stroke={planet.color} strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                            <text
                                x={coords.x}
                                y={coords.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={planet.color}
                                fontSize="10"
                                fontWeight="bold"
                            >
                                {planet.symbol}
                            </text>
                            <text
                                x={coords.x}
                                y={coords.y + 10}
                                textAnchor="middle"
                                fill={planet.color}
                                fontSize="7"
                            >
                                {degreeInSign}°
                            </text>
                        </g>
                    );
                })}

                <circle cx={center} cy={center} r="4" fill="#000" />

            </svg>

            {/* Print Friendly Legend */}
            <div className="absolute top-4 left-4 text-xs font-serif text-black bg-white/80 p-2 border border-black/10 rounded shadow-sm">
                <div className="font-bold border-b border-black mb-1">Carta Natal (Placidus Approx)</div>
                <div>ASC: {Math.round(ascendant)}°</div>
                <div className="grid grid-cols-2 gap-x-4 mt-2 text-[10px]">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full"></div> Cuadratura/Oposición</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-600 rounded-full"></div> Trígono</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> Sextil</div>
                </div>
            </div>

            <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-serif">
                {date ? new Date(date).toLocaleDateString() : 'DEMO'}
            </div>
        </div>
    );
}
