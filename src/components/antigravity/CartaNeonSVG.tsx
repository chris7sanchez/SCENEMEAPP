"use client";
import React, { useMemo } from 'react';
import { calcularDatosCarta3D, type DatosCartaParams } from '@/lib/carta3d/datos-carta';
import type { PlanetPosition } from '@/utils/astronomy';

/**
 * Carta natal como letrero de neón, dibujada en SVG — fiel al 100%:
 * glifos reales, grados exactos, casas y aspectos con datos verdaderos.
 * (La versión IA fotográfica vive en Carta3DViewer; esta es la exacta.)
 */

const C = 500;
const R_AZUL = 482;
const R_ORO_EXT = 448;
const R_ORO_INT = 356;
const R_GLIFO_SIGNO = 402;
const R_CASAS_EXT = 342;
const R_HUB = 62;
const R_NUM_CASA = 95;
const R_GLIFO_PLANETA = 300;
const R_ASPECTOS = 258;

const NEON = {
    azulHielo: '#8fd8ff', oro: '#ffd75e', blanco: '#eef4f8',
    fuego: '#ff5348', tierra: '#5ee08b', aire: '#ffd75e', agua: '#6ab7ff',
    aspectoArmonico: '#4d9fff', aspectoTenso: '#ff3b30',
};

const GLIFOS_SIGNOS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const SIGNOS_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
    'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const COLOR_ELEMENTO = [NEON.fuego, NEON.tierra, NEON.aire, NEON.agua];

const COLOR_PLANETA: Record<string, string> = {
    Sol: '#ffd75e', Luna: '#eef4f8', Mercurio: '#9fd8ff', Venus: '#ffe9c9',
    Marte: '#ff5348', 'Júpiter': '#ffbd66', Saturno: '#e8d089',
    Urano: '#7ff0e8', Neptuno: '#6a8dff', 'Plutón': '#c78dff', Pluton: '#c78dff',
};

const ARMONICOS = new Set(['Trígono', 'Sextil']);

// Misma convención polar que NatalChart2D: Asc al Este, signos en antihorario
function punto(lon: number, radio: number, asc: number): [number, number] {
    const theta = (-(lon + 180 - asc) * Math.PI) / 180;
    return [C + radio * Math.cos(theta), C + radio * Math.sin(theta)];
}

/** Separa glifos que caen demasiado juntos (stelliums) sin perder su posición real. */
function separarAngulos(longitudes: number[], minSep: number): number[] {
    const orden = longitudes.map((lon, i) => ({ lon: ((lon % 360) + 360) % 360, i }))
        .sort((a, b) => a.lon - b.lon);
    const disp = orden.map(o => o.lon);
    const n = disp.length;
    for (let pase = 0; pase < 50; pase++) {
        let cambiado = false;
        for (let i = 0; i < n; i++) {
            const prev = (i - 1 + n) % n;
            const gap = (disp[i] - disp[prev] + 360) % 360;
            if (gap < minSep) {
                const empuje = (minSep - gap) / 2;
                disp[i] = (disp[i] + empuje + 360) % 360;
                disp[prev] = (disp[prev] - empuje + 360) % 360;
                cambiado = true;
            }
        }
        if (!cambiado) break;
    }
    const resultado = new Array(n);
    orden.forEach((o, k) => { resultado[o.i] = disp[k]; });
    return resultado;
}

interface CartaNeonSVGProps extends DatosCartaParams {
    /** Datos del bloque de texto (solo se pintan si se pasan) */
    ciudad?: string;
    nombre?: string;
}

export default function CartaNeonSVG(props: CartaNeonSVGProps) {
    const { ciudad, nombre, ...carta } = props;

    const datos = useMemo(() => calcularDatosCarta3D(carta),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [carta.date, carta.latitude, carta.longitude, carta.knownAscendant, carta.knownMoon, carta.customPlanets]);

    const asc = datos.ascendant;
    const sol = datos.planets.find(p => p.name === 'Sol' || p.name === 'Sun');
    const signoAsc = SIGNOS_EN[Math.floor(asc / 30) % 12];

    const angulosGlifos = useMemo(
        () => separarAngulos(datos.planets.map(p => p.longitude), 9),
        [datos]);

    const lat = carta.latitude ?? 40.4168;
    const lng = carta.longitude ?? -3.7038;
    const coords = `${Math.abs(lat).toFixed(1)}${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(1)}${lng >= 0 ? 'E' : 'W'}`;
    const fecha = carta.date
        ? new Date(carta.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    const lineasTexto = [
        { t: ciudad ? `In ${ciudad}` : (nombre ? `Chart: ${nombre}` : 'Natal Chart'), c: NEON.azulHielo },
        { t: coords, c: NEON.azulHielo },
        { t: sol ? `Sun sign: ${SIGNOS_EN[Math.floor(sol.longitude / 30) % 12]}` : '', c: NEON.oro },
        { t: `Ascendant: ${signoAsc}`, c: NEON.oro },
        { t: fecha, c: NEON.azulHielo },
    ].filter(l => l.t);

    return (
        <svg viewBox="0 0 1000 1000" className="w-full h-auto rounded-2xl shadow-2xl"
            role="img" aria-label="Carta natal en estilo neón">
            <defs>
                <radialGradient id="pared" cx="50%" cy="42%" r="75%">
                    <stop offset="0%" stopColor="#131a20" />
                    <stop offset="100%" stopColor="#05080b" />
                </radialGradient>
                <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                        <feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="glowSuave" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="2" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            <rect width="1000" height="1000" fill="url(#pared)" />

            {/* Anillos del letrero */}
            <circle cx={C} cy={C} r={R_AZUL} fill="none" stroke={NEON.azulHielo} strokeWidth="5" filter="url(#glow)" />
            <circle cx={C} cy={C} r={R_ORO_EXT} fill="none" stroke={NEON.oro} strokeWidth="5" filter="url(#glow)" />
            <circle cx={C} cy={C} r={R_ORO_INT} fill="none" stroke={NEON.oro} strokeWidth="4" filter="url(#glow)" />
            <circle cx={C} cy={C} r={R_CASAS_EXT} fill="none" stroke={NEON.blanco} strokeWidth="1.5" opacity="0.7" filter="url(#glowSuave)" />
            <circle cx={C} cy={C} r={R_HUB} fill="none" stroke={NEON.blanco} strokeWidth="2" opacity="0.8" filter="url(#glowSuave)" />

            {/* Divisiones y glifos de los 12 signos */}
            {GLIFOS_SIGNOS.map((glifo, i) => {
                const [dx1, dy1] = punto(i * 30, R_ORO_INT, asc);
                const [dx2, dy2] = punto(i * 30, R_ORO_EXT, asc);
                const [gx, gy] = punto(i * 30 + 15, R_GLIFO_SIGNO, asc);
                return (
                    <g key={glifo}>
                        <line x1={dx1} y1={dy1} x2={dx2} y2={dy2} stroke={NEON.blanco} strokeWidth="1.5" opacity="0.6" />
                        <text x={gx} y={gy} fontSize="42" fill={COLOR_ELEMENTO[i % 4]} filter="url(#glow)"
                            fontFamily="ui-monospace, Menlo, 'Segoe UI Symbol', monospace"
                            textAnchor="middle" dominantBaseline="central">{`${glifo}︎`}</text>
                    </g>
                );
            })}

            {/* Casas: líneas y números (casas iguales desde el Ascendente) */}
            {Array.from({ length: 12 }, (_, i) => {
                const [x1, y1] = punto(asc + i * 30, R_HUB, asc);
                const [x2, y2] = punto(asc + i * 30, R_CASAS_EXT, asc);
                const [nx, ny] = punto(asc + i * 30 + 15, R_NUM_CASA, asc);
                return (
                    <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={NEON.blanco}
                            strokeWidth={i % 3 === 0 ? 2.5 : 1.2} opacity={i % 3 === 0 ? 0.9 : 0.55}
                            filter="url(#glowSuave)" />
                        <text x={nx} y={ny} fontSize="22" fill={NEON.blanco} opacity="0.75"
                            textAnchor="middle" dominantBaseline="central">{i + 1}</text>
                    </g>
                );
            })}

            {/* Aspectos: azul armónico / rojo tenso (la conjunción no se traza) */}
            {datos.aspects.filter(a => a.type !== 'Conjunción').map((a, k) => {
                const p1 = datos.planets.find(p => p.name === a.planet1);
                const p2 = datos.planets.find(p => p.name === a.planet2);
                if (!p1 || !p2) return null;
                const [x1, y1] = punto(p1.longitude, R_ASPECTOS, asc);
                const [x2, y2] = punto(p2.longitude, R_ASPECTOS, asc);
                const color = ARMONICOS.has(a.type) ? NEON.aspectoArmonico : NEON.aspectoTenso;
                return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color}
                    strokeWidth="2.5" opacity="0.9" filter="url(#glowSuave)" />;
            })}

            {/* Planetas: tick en su grado real + glifo separado anti-colisión + grado */}
            {datos.planets.map((p: PlanetPosition, i: number) => {
                const color = COLOR_PLANETA[p.name] ?? p.color ?? NEON.blanco;
                const [tx1, ty1] = punto(p.longitude, R_CASAS_EXT - 8, asc);
                const [tx2, ty2] = punto(p.longitude, R_CASAS_EXT, asc);
                const [gx, gy] = punto(angulosGlifos[i], R_GLIFO_PLANETA, asc);
                const [dx, dy] = punto(angulosGlifos[i], R_GLIFO_PLANETA - 42, asc);
                return (
                    <g key={p.name}>
                        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={color} strokeWidth="3" filter="url(#glowSuave)" />
                        <text x={gx} y={gy} fontSize="34" fill={color} filter="url(#glow)"
                            fontFamily="ui-monospace, Menlo, 'Segoe UI Symbol', monospace"
                            textAnchor="middle" dominantBaseline="central">{`${p.symbol}︎`}</text>
                        <text x={dx} y={dy} fontSize="17" fill={NEON.blanco} opacity="0.85"
                            textAnchor="middle" dominantBaseline="central">
                            {Math.floor(p.degree)}°{p.isRetrograde ? ' ℞' : ''}
                        </text>
                    </g>
                );
            })}

            {/* Bloque de datos (texto real, siempre legible) */}
            {lineasTexto.map((l, i) => (
                <text key={i} x="40" y={52 + i * 30} fontSize="24" fill={l.c}
                    filter="url(#glowSuave)" fontFamily="ui-monospace, monospace">{l.t}</text>
            ))}
        </svg>
    );
}
