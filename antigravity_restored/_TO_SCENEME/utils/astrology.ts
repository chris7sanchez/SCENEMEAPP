import { PlanetPosition } from './astronomy';

export interface Aspect {
    planet1: string; // From Transit
    planet2: string; // From Natal
    type: 'Conjunción' | 'Oposición' | 'Cuadratura' | 'Trígono' | 'Sextil';
    angle: number;
    orb: number;
    descriptionEs: string;
    descriptionEn: string;
    intensity: number; // 1-10
}

const ASPECTS = [
    { name: 'Conjunción', angle: 0, orb: 8, symbol: '☌' },
    { name: 'Oposición', angle: 180, orb: 8, symbol: '☍' },
    { name: 'Cuadratura', angle: 90, orb: 7, symbol: '□' },
    { name: 'Trígono', angle: 120, orb: 8, symbol: '△' },
    { name: 'Sextil', angle: 60, orb: 5, symbol: '✱' }
];

// Simple Interpretation Database
const INTERPRETATIONS: Record<string, any> = {
    'Sol-Sol': {
        conjunction: { es: "Tu retorno solar personal. Máxima vitalidad y renovación de identidad.", en: "Your personal solar return. Maximum vitality and identity renewal." },
        opposition: { es: "Baja vitalidad. El ego se enfrenta a la realidad externa.", en: "Low vitality. The ego confronts external reality." }
    },
    'Sol-Luna': {
        trine: { es: "Armonía interna entre lo que quieres y lo que necesitas.", en: "Internal harmony between what you want and what you need." },
        square: { es: "Tensión entre vida pública y privada.", en: "Tension between public and private life." }
    },
    'Marte-Saturno': {
        conjunction: { es: "El freno y el acelerador al mismo tiempo. Frustración constructiva.", en: "The brake and the gas pedal at the same time. Constructive frustration." },
        square: { es: "Obstáculos en tus acciones. Paciencia obligatoria.", en: "Obstacles in your actions. Mandatory patience." }
    },
    // Fallback generator
};

export function calculateAspects(transitPlanets: PlanetPosition[], natalPlanets: PlanetPosition[]): Aspect[] {
    const aspects: Aspect[] = [];

    transitPlanets.forEach(tPlanet => {
        natalPlanets.forEach(nPlanet => {
            // Calculate shortest distance between angles on a circle
            let diff = Math.abs(tPlanet.longitude - nPlanet.longitude);
            if (diff > 180) diff = 360 - diff;

            // Check against defined aspects
            for (const aspect of ASPECTS) {
                if (diff >= (aspect.angle - aspect.orb) && diff <= (aspect.angle + aspect.orb)) {
                    // It's a match!
                    const orb = Math.abs(diff - aspect.angle);

                    // Generate description
                    const key = `${tPlanet.name}-${nPlanet.name}`;
                    const aspectKey = aspect.name === 'Conjunción' ? 'conjunction' :
                        aspect.name === 'Oposición' ? 'opposition' :
                            aspect.name === 'Cuadratura' ? 'square' :
                                aspect.name === 'Trígono' ? 'trine' : 'sextile';

                    let descEs = `La energía de ${tPlanet.name} interactúa con tu ${nPlanet.name} natal.`;
                    let descEn = `Energy from ${tPlanet.name} interacts with your natal ${nPlanet.name}.`;

                    if (INTERPRETATIONS[key] && INTERPRETATIONS[key][aspectKey]) {
                        descEs = INTERPRETATIONS[key][aspectKey].es;
                        descEn = INTERPRETATIONS[key][aspectKey].en;
                    } else {
                        // Procedural generation fallback
                        if (aspect.name === 'Conjunción') descEs = `Fusión intensa entre ${tPlanet.name} y ${nPlanet.name}. Nuevo ciclo.`;
                        if (aspect.name === 'Cuadratura') descEs = `Tensión dinámica entre ${tPlanet.name} y ${nPlanet.name}. Acción requerida.`;
                        if (aspect.name === 'Trígono') descEs = `Fluidez y suerte entre ${tPlanet.name} y ${nPlanet.name}.`;
                        if (aspect.name === 'Oposición') descEs = `Confrontación o proyección entre ${tPlanet.name} y ${nPlanet.name}.`;
                    }

                    aspects.push({
                        planet1: tPlanet.name,
                        planet2: nPlanet.name,
                        type: aspect.name as any,
                        angle: diff,
                        orb: orb,
                        descriptionEs: descEs,
                        descriptionEn: descEn,
                        intensity: 10 - orb // Closer to 0 orb = higher intensity
                    });
                }
            }
        });
    });

    // Sort by intensity (tightest orbs first)
    return aspects.sort((a, b) => b.intensity - a.intensity);
}
