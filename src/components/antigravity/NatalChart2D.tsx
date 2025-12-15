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
    knownMoon?: string; // NEW Override for Characters
    customPlanets?: Record<string, string | undefined>; // NEW: Full System Override
    transparent?: boolean;
    forceAriesZero?: boolean; // NEW: Force rotation to 0 Aries
}

export default function NatalChart2D({ date, latitude = 40.4168, longitude = -3.7038, transitsDate, knownAscendant, knownMoon, customPlanets, transparent = false, forceAriesZero = false }: NatalChartProps) {
    const { natalPlanets, ascendant, chartRotation } = useMemo(() => {
        if (!date) return { natalPlanets: [], ascendant: 0, chartRotation: 0 };

        const data = calculateRealPlanets(date, latitude, longitude);

        let finalAscendant = data.ascendant;
        let finalPlanets = [...data.planets];

        // MANUAL OVERRIDE LOGIC: ASCENDANT
        if (knownAscendant) {
            const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === knownAscendant);
            if (signIndex !== -1) {
                // Set Ascendant to mid-sign (15 deg) of the chosen sign
                finalAscendant = (signIndex * 30) + 15;
            }
        }

        // MANUAL OVERRIDE LOGIC: MOON
        if (knownMoon) {
            const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === knownMoon);
            if (signIndex !== -1) {
                const moonLon = (signIndex * 30) + 15; // Set Moon to mid-sign
                // Find Moon in planets array and update it
                const moonIdx = finalPlanets.findIndex(p => p.name === 'Moon');
                if (moonIdx !== -1) {
                    finalPlanets[moonIdx] = { ...finalPlanets[moonIdx], longitude: moonLon };
                } else {
                    // Add Moon if missing (unlikely but safe)
                    finalPlanets.push({ name: 'Moon', symbol: '☾', longitude: moonLon, color: '#C0C0C0', speed: 0 });
                }
            }
        }

        // MANUAL OVERRIDE LOGIC: ALL OTHER PLANETS
        if (customPlanets) {
            Object.entries(customPlanets).forEach(([planetName, signName]) => {
                if (!signName) return;
                const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === signName);
                if (signIndex !== -1) {
                    const newLon = (signIndex * 30) + 15;
                    const idx = finalPlanets.findIndex(p => p.name === planetName);
                    if (idx !== -1) {
                        finalPlanets[idx] = { ...finalPlanets[idx], longitude: newLon };
                    } else {
                        // If planet doesn't exist in standard list, we could add it, but strictly we only map standard ones
                        // Check naming conventions: calculateRealPlanets returns English names
                    }
                }
            });
        }

        // ROTATION LOGIC
        // If forceAriesZero is TRUE, we want Aries 0 (0 deg) to be at Left (180 deg visual).
        // Standard (Asc based): Rotation = 180 - Ascendant.
        // Aries Zero: Rotation = 180 - 0 = 180.
        const rotation = forceAriesZero ? 180 : (180 - finalAscendant);

        return {
            natalPlanets: finalPlanets,
            ascendant: finalAscendant,
            chartRotation: rotation
        };
    }, [date, latitude, longitude, knownAscendant, knownMoon, customPlanets, forceAriesZero]);

    const transitPlanets = useMemo(() => {
        if (!transitsDate) return [];
        const data = calculateRealPlanets(transitsDate, latitude, longitude);
        return data.planets;
    }, [transitsDate, latitude, longitude]);

    const radius = 190; // Increased radius ~20% visually from original 180ish baseline in context of removal of padding
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
        <div className={`w-full h-full flex items-center justify-center relative ${transparent ? 'bg-transparent' : 'bg-white rounded-full shadow-2xl'} p-0 text-black`}>
            <svg viewBox="-50 -50 500 500" className="w-full h-full" style={{ overflow: 'visible' }}>
                {/* Paper Background - Only if not transparent */}
                {!transparent && <circle cx={center} cy={center} r={radius + 5} fill="white" />}

                {/* Outer Zodiac Ring Boundary */}
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#000" strokeWidth="1.5" />
                <circle cx={center} cy={center} r={radius * 0.88} fill="none" stroke="#000" strokeWidth="0.5" />

                {/* House Cusps (Lines) */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const cuspLon = ascendant + (i * 30);
                    const coords = getCoordinates(cuspLon, radius);
                    // Draw line from inner ring to outer edge
                    return <line key={`house-line-${i}`} x1={center} y1={center} x2={coords.x} y2={coords.y} stroke="#eee" strokeWidth="1" />;
                })}

                {/* Horizon / Ascendant-Descendant Axis (Bold) */}
                <line
                    x1={center + radius * Math.cos(Math.PI)} y1={center + radius * Math.sin(Math.PI)}
                    x2={center + radius * Math.cos(0)} y2={center + radius * Math.sin(0)}
                    stroke="#000" strokeWidth="2"
                    opacity="0.3"
                />

                {/* Zodiac Signs (Simplified, no house numbers to declutter) */}
                {ZODIAC_SIGNS.map((sign, i) => {
                    const signLon = i * 30 + 15;
                    const coords = getCoordinates(signLon, radius * 0.94);
                    return (
                        <g key={sign.name}>
                            <text
                                x={coords.x}
                                y={coords.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={sign.color}
                                fontSize="14"
                                fontWeight="bold"
                            >
                                {sign.symbol}
                            </text>
                        </g>
                    );
                })}

                {/* Aspects - COMPREHENSIVE */}
                {natalPlanets.map((p1, i) =>
                    natalPlanets.slice(i + 1).map((p2, j) => {
                        let diff = Math.abs(p1.longitude - p2.longitude);
                        if (diff > 180) diff = 360 - diff;

                        const orb = 8; // Standard orb
                        const isConj = diff < orb;
                        const isOpp = Math.abs(diff - 180) < orb;
                        const isTrine = Math.abs(diff - 120) < orb;
                        const isSquare = Math.abs(diff - 90) < orb;
                        const isSextile = Math.abs(diff - 60) < 5;
                        const isQuincunx = Math.abs(diff - 150) < 4; // 150 degrees

                        if (isConj || isOpp || isTrine || isSquare || isSextile || isQuincunx) {
                            const c1 = getCoordinates(p1.longitude, radius * 0.85);
                            const c2 = getCoordinates(p2.longitude, radius * 0.85);

                            let color = '#ccc';
                            let width = "0.5";
                            let dash = '0';

                            if (isTrine) { color = '#3b82f6'; width = "1"; } // Blue Trine
                            if (isSquare || isOpp) { color = '#ef4444'; width = "1"; } // Red Hard
                            if (isSextile) { color = '#10b981'; dash = '2,2'; } // Green Sextile
                            if (isQuincunx) { color = '#8b5cf6'; dash = '1,3'; } // Purple Quincunx
                            if (isConj) { color = '#f59e0b'; width = "2"; } // Gold Conj

                            // Don't draw conjunction lines (points are same)
                            if (isConj) return null;

                            return (
                                <line
                                    key={`aspect-${p1.name}-${p2.name}`}
                                    x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y}
                                    stroke={color}
                                    strokeWidth={width}
                                    strokeDasharray={dash}
                                    opacity="0.8"
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

                {/* Sacred Geometry / Alchemical Center */}
                {!transparent && (
                    <g opacity="0.05">
                        <circle cx={center} cy={center} r={radius * 0.3} fill="none" stroke="#000" strokeWidth="0.5" />
                        <path d={`M${center} ${center - radius * 0.3} L${center + radius * 0.26} ${center + radius * 0.15} L${center + radius * 0.26} ${center - radius * 0.15} L${center} ${center + radius * 0.3} L${center - radius * 0.26} ${center - radius * 0.15} L${center - radius * 0.26} ${center + radius * 0.15} Z`} fill="none" stroke="#000" strokeWidth="0.5" transform={`rotate(${ascendant}, ${center}, ${center})`} />
                        <path d={`M${center} ${center - radius * 0.3} L${center + radius * 0.26} ${center + radius * 0.15} L${center - radius * 0.26} ${center + radius * 0.15} Z`} fill="none" stroke="#000" strokeWidth="0.5" transform={`rotate(${ascendant + 180}, ${center}, ${center})`} />
                    </g>
                )}

                <circle cx={center} cy={center} r="4" fill="#000" />

            </svg>



            <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-serif">
                {date ? new Date(date).toLocaleDateString() : 'DEMO'}
            </div>
        </div>
    );
}
