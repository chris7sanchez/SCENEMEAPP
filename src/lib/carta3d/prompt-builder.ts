/**
 * Carta 3D — Fase 2: prompt dinámico en inglés para FLUX/SD + ControlNet.
 * Recibe las posiciones que ya calcula utils/astronomy.ts (Fase 1).
 */

import type { PlanetPosition } from '@/utils/astronomy';
import type { Aspect } from '@/utils/astrology';

type Elemento = 'fire' | 'earth' | 'air' | 'water';

// utils/astronomy.ts emite signos en español; el prompt necesita inglés
const SIGNO_EN: Record<string, string> = {
    Aries: 'Aries', Tauro: 'Taurus', 'Géminis': 'Gemini', 'Cáncer': 'Cancer',
    Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Escorpio: 'Scorpio',
    Sagitario: 'Sagittarius', Capricornio: 'Capricorn', Acuario: 'Aquarius', Piscis: 'Pisces',
    // ya en inglés → identidad
    Taurus: 'Taurus', Gemini: 'Gemini', Cancer: 'Cancer', Scorpio: 'Scorpio',
    Sagittarius: 'Sagittarius', Capricorn: 'Capricorn', Aquarius: 'Aquarius', Pisces: 'Pisces',
};

const signoEn = (s: string) => SIGNO_EN[s] ?? s;

const ELEMENTO_POR_SIGNO: Record<string, Elemento> = {
    Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
    Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
    Gemini: 'air', Libra: 'air', Aquarius: 'air',
    Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

// El elemento dominante de la carta tiñe el anillo interior del letrero
const ANILLO_POR_ELEMENTO: Record<Elemento, string> = {
    fire: 'warm crimson-orange neon tube',
    earth: 'emerald-green neon tube',
    air: 'violet-white neon tube',
    water: 'ice-blue neon tube',
};

// Claves en inglés y español, como PLANET_ARCHETYPES en utils/astrology.ts.
// Cada planeta es un orbe de neón con su color propio (estilo elegido por Christian, 8 jul 2026).
const DESCRIPCION_PLANETA: Record<string, string> = {
    Sun: 'the Sun as an intense gold-yellow neon orb',
    Sol: 'the Sun as an intense gold-yellow neon orb',
    Moon: 'the Moon as a cool-white neon orb',
    Luna: 'the Moon as a cool-white neon orb',
    Mercury: 'Mercury as a pale-blue neon orb',
    Mercurio: 'Mercury as a pale-blue neon orb',
    Venus: 'Venus as a warm cream neon orb',
    Mars: 'Mars as a vivid red neon orb',
    Marte: 'Mars as a vivid red neon orb',
    Jupiter: 'Jupiter as an amber neon orb',
    Júpiter: 'Jupiter as an amber neon orb',
    Saturn: 'Saturn as a pale-gold neon orb',
    Saturno: 'Saturn as a pale-gold neon orb',
    Uranus: 'Uranus as a cyan neon orb',
    Urano: 'Uranus as a cyan neon orb',
    Neptune: 'Neptune as a deep-blue neon orb',
    Neptuno: 'Neptune as a deep-blue neon orb',
    Pluto: 'Pluto as a violet neon orb',
    Plutón: 'Pluto as a violet neon orb',
};

const ES_SOL = (nombre: string) => nombre === 'Sun' || nombre === 'Sol';

// Sin "text/letters": bloquearlos suprime también los glifos zodiacales del anillo
export const NEGATIVE_PROMPT =
    'watermark, signature, flat 2d diagram, daylight, cartoon, blurry, low quality, ' +
    'readable paragraphs, data tables, ui elements';

export interface Carta3DInput {
    planets: PlanetPosition[];
    /** Longitud eclíptica del ascendente (0-360) */
    ascendant: number;
    aspects: Aspect[];
    /** Signos con 3+ planetas; si no se pasa, se detectan aquí */
    stelliums?: { sign: string; planets: string[] }[];
}

function detectarStelliums(planets: PlanetPosition[]) {
    const porSigno = new Map<string, string[]>();
    for (const p of planets) {
        porSigno.set(p.sign, [...(porSigno.get(p.sign) ?? []), p.name]);
    }
    return [...porSigno.entries()]
        .filter(([, nombres]) => nombres.length >= 3)
        .map(([sign, nombres]) => ({ sign, planets: nombres }));
}

function elementoDominante(planets: PlanetPosition[]): Elemento {
    const conteo: Record<Elemento, number> = { fire: 0, earth: 0, air: 0, water: 0 };
    for (const p of planets) {
        const e = ELEMENTO_POR_SIGNO[signoEn(p.sign)];
        if (e) conteo[e]++;
    }
    return (Object.keys(conteo) as Elemento[]).reduce(
        (max, e) => (conteo[e] > conteo[max] ? e : max), 'air');
}

export function construirPrompt(carta: Carta3DInput): { prompt: string; negativePrompt: string } {
    const { planets, ascendant } = carta;

    const listaPlanetas = planets
        .filter(p => DESCRIPCION_PLANETA[p.name])
        .map(p => `${DESCRIPCION_PLANETA[p.name]} in the sector of ${signoEn(p.sign)}`)
        .join('; ');

    const stelliums = carta.stelliums ?? detectarStelliums(planets);
    const frasesStellium = stelliums
        .map(s => `A cluster of neon orbs (${s.planets.join(', ')}) concentrates in the ${signoEn(s.sign)} sector, glowing with amplified brightness. `)
        .join('');

    const signoAsc = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
        'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(ascendant / 30) % 12];

    const anilloInterior = ANILLO_POR_ELEMENTO[elementoDominante(planets)];

    const prompt =
        'A high-resolution photograph of a complex multi-layered custom neon sign installation ' +
        'mounted on a dark rough concrete brick wall, direct frontal perspective. ' +
        `A large double-ring frame: outer golden-yellow neon tube and inner ${anilloInterior}. ` +
        'Twelve glowing zodiac sign symbols arranged around the ring in varied coloured neon tubes (blue, yellow, red), ' +
        `individual planets as small intense neon orbs placed precisely at their positions on the wheel: ${listaPlanetas}. ` +
        frasesStellium +
        `The eastern point of the wheel glows intensely, marking the ${signoAsc} rising sign. ` +
        'A complex web of glowing red and blue neon tubes connects the planet orbs as astrological aspect lines: ' +
        'harmonious aspects as blue tubes, tense aspects as red tubes. ' +
        'Thin cool-white neon lines mark the house divisions. ' +
        'The dark wall absorbs light creating deep shadows and soft realistic neon bloom, ' +
        'a few trailing subtle power cords visible at the bottom of the circular sign, ' +
        'moody night atmosphere, 8k, sharp focus';

    return { prompt, negativePrompt: NEGATIVE_PROMPT };
}
