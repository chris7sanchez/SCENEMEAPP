/**
 * Carta 3D — prepara los datos que consume POST /api/carta-3d.
 * Reproduce los mismos overrides (Asc/Luna/planetas conocidos) que NatalChart2D
 * para que el render 3D coincida con la carta 2D que ve el usuario.
 * Client-safe: sin dependencias de servidor.
 */

import { calculateRealPlanets } from '@/utils/astronomy';
import { calculateAspects } from '@/utils/astrology';
import type { Carta3DInput } from './prompt-builder';

const SIGNOS = [
    'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis',
];

export interface DatosCartaParams {
    date: string;
    latitude?: number;
    longitude?: number;
    knownAscendant?: string;
    knownMoon?: string;
    customPlanets?: Record<string, string | undefined>;
}

export function calcularDatosCarta3D({
    date,
    latitude = 40.4168,
    longitude = -3.7038,
    knownAscendant,
    knownMoon,
    customPlanets,
}: DatosCartaParams): Carta3DInput {
    const data = calculateRealPlanets(date, latitude, longitude);
    let ascendant = data.ascendant;
    let planets = [...data.planets];

    const enSigno = (nombre?: string) => SIGNOS.findIndex(s => s === nombre);

    const si = enSigno(knownAscendant);
    if (si !== -1) ascendant = si * 30 + 15;

    const mi = enSigno(knownMoon);
    if (mi !== -1) {
        planets = planets.map(p =>
            p.name === 'Luna'
                ? { ...p, longitude: mi * 30 + 15, sign: SIGNOS[mi], degree: 15 }
                : p,
        );
    }

    if (customPlanets) {
        for (const [nombre, signo] of Object.entries(customPlanets)) {
            const ci = enSigno(signo);
            if (ci === -1) continue;
            planets = planets.map(p =>
                p.name === nombre
                    ? { ...p, longitude: ci * 30 + 15, sign: SIGNOS[ci], degree: 15 }
                    : p,
            );
        }
    }

    return {
        planets,
        ascendant,
        aspects: calculateAspects(planets, planets, 'NATAL'),
    };
}
