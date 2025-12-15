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
    symbol?: string;
}

const ASPECTS = [
    { name: 'Conjunción', angle: 0, orb: 8, symbol: '☌' },
    { name: 'Oposición', angle: 180, orb: 8, symbol: '☍' },
    { name: 'Cuadratura', angle: 90, orb: 7, symbol: '□' },
    { name: 'Trígono', angle: 120, orb: 8, symbol: '△' },
    { name: 'Sextil', angle: 60, orb: 5, symbol: '✱' }
];

// --- DEEP DATA ARCHETYPES ---

const PLANET_ARCHETYPES: Record<string, { transit: string, natal: string, keywords: string[] }> = {
    'Sun': {
        transit: "Tu consciencia activa y voluntad vital iluminan",
        natal: "tu núcleo de identidad y propósito de vida",
        keywords: ["brillo", "ego", "consciencia", "vitalidad", "héroe interior"]
    },
    'Sol': {
        transit: "Tu consciencia activa y voluntad vital iluminan",
        natal: "tu núcleo de identidad y propósito de vida",
        keywords: ["brillo", "ego", "consciencia", "vitalidad", "héroe interior"]
    },
    'Moon': {
        transit: "Tus mareas emocionales y sensibilidad activan",
        natal: "tus necesidades de seguridad y memoria subconsciente",
        keywords: ["emoción", "madre", "seguridad", "instinto", "hogar"]
    },
    'Luna': {
        transit: "Tus mareas emocionales y sensibilidad activan",
        natal: "tus necesidades de seguridad y memoria subconsciente",
        keywords: ["emoción", "madre", "seguridad", "instinto", "hogar"]
    },
    'Mercury': {
        transit: "El flujo de información y lógica estimula",
        natal: "tu forma de procesar, hablar y negociar",
        keywords: ["mente", "mensaje", "comercio", "lógica", "conexión"]
    },
    'Mercurio': {
        transit: "El flujo de información y lógica estimula",
        natal: "tu forma de procesar, hablar y negociar",
        keywords: ["mente", "mensaje", "comercio", "lógica", "conexión"]
    },
    'Venus': {
        transit: "El deseo de armonía, placer y valor toca",
        natal: "tu capacidad de amar y valorar lo estético",
        keywords: ["amor", "dinero", "arte", "atracción", "valores"]
    },
    'Mars': {
        transit: "El impulso de conquista y energía pura inflama",
        natal: "tu motor de acción y defensa personal",
        keywords: ["acción", "deseo", "guerra", "inicio", "pasión"]
    },
    'Marte': {
        transit: "El impulso de conquista y energía pura inflama",
        natal: "tu motor de acción y defensa personal",
        keywords: ["acción", "deseo", "guerra", "inicio", "pasión"]
    },
    'Jupiter': {
        transit: "La expansión, la fe y la abundancia magnifican",
        natal: "tu búsqueda de sentido y crecimiento",
        keywords: ["expansión", "suerte", "sabiduría", "exceso", "optimismo"]
    },
    'Júpiter': {
        transit: "La expansión, la fe y la abundancia magnifican",
        natal: "tu búsqueda de sentido y crecimiento",
        keywords: ["expansión", "suerte", "sabiduría", "exceso", "optimismo"]
    },
    'Saturn': {
        transit: "La estructura, el tiempo y la dura realidad ponen a prueba",
        natal: "tus límites, miedos y estructuras de soporte",
        keywords: ["tiempo", "karma", "límite", "madurez", "restricción"]
    },
    'Saturno': {
        transit: "La estructura, el tiempo y la dura realidad ponen a prueba",
        natal: "tus límites, miedos y estructuras de soporte",
        keywords: ["tiempo", "karma", "límite", "madurez", "restricción"]
    },
    'Uranus': {
        transit: "El rayo del cambio, la revolución y lo inesperado sacude",
        natal: "tu necesidad de libertad e individualidad",
        keywords: ["cambio", "rebelión", "shock", "futuro", "genio"]
    },
    'Urano': {
        transit: "El rayo del cambio, la revolución y lo inesperado sacude",
        natal: "tu necesidad de libertad e individualidad",
        keywords: ["cambio", "rebelión", "shock", "futuro", "genio"]
    },
    'Neptune': {
        transit: "La disolución, el sueño y lo místico envuelven",
        natal: "tus ideales, sueños y sensibilidad espiritual",
        keywords: ["sueño", "ilusión", "arte", "espíritu", "confusión"]
    },
    'Neptuno': {
        transit: "La disolución, el sueño y lo místico envuelven",
        natal: "tus ideales, sueños y sensibilidad espiritual",
        keywords: ["sueño", "ilusión", "arte", "espíritu", "confusión"]
    },
    'Pluto': {
        transit: "La transformación radical, la muerte y el renacimiento excavan",
        natal: "tu poder oculto y tus heridas profundas",
        keywords: ["poder", "transformación", "sombra", "intensidad", "crisis"]
    },
    'Plutón': {
        transit: "La transformación radical, la muerte y el renacimiento excavan",
        natal: "tu poder oculto y tus heridas profundas",
        keywords: ["poder", "transformación", "sombra", "intensidad", "crisis"]
    }
};

const ASPECT_MEANINGS = {
    'Conjunción': "provocando una fusión intensa y un nuevo inicio de ciclo. Las energías se vuelven indistinguibles y poderosas, marcando un momento semilla.",
    'Oposición': "generando una tensión de 'tira y afloja' que exige consciencia objetiva. Es probable que proyectes esta energía en otros o enfrentes una decisión polarizada.",
    'Cuadratura': "creando una fricción dinámica que te obliga a tomar acción. No es un momento de paz, sino de construcción a través de la superación de un obstáculo.",
    'Trígono': "permitiendo un flujo armónico y talentoso. Las puertas se abren con facilidad y la energía circula sin resistencia, ideal para la expansión.",
    'Sextil': "ofreciendo oportunidades estimulantes si decides tomarlas. Es un aspecto de cooperación mental y nuevas posibilidades creativas."
};

import { ZODIAC_ARCHETYPES } from './archetypes';
import { getSignFromLongitude } from './astronomy';

function generateDeepInterpretation(tName: string, nName: string, aspectName: string, tSign: string, nSign: string, context: 'NATAL' | 'MUNDANE' = 'NATAL'): string {
    const tArch = PLANET_ARCHETYPES[tName] || { transit: `La energía de ${tName} toca`, keywords: [tName] };
    const nArch = PLANET_ARCHETYPES[nName] || { natal: `tu ${nName} natal`, keywords: [nName] };
    const aspectAction = ASPECT_MEANINGS[aspectName as keyof typeof ASPECT_MEANINGS] || "interactúa con";

    // Enhance with Zodiac flavor
    const tZodiac = ZODIAC_ARCHETYPES[tSign];
    const nZodiac = ZODIAC_ARCHETYPES[nSign];

    let nuance = "";
    if (tZodiac && nZodiac) {
        const tTrait = tZodiac.keywords[0] || tSign;
        const nTrait = nZodiac.keywords[0] || nSign;

        if (context === 'NATAL') {
            nuance = ` La influencia llega con un tono **${tTrait}** (${tSign}) y colorea tu capacidad de **${nTrait}** (${nSign}).`;
        } else {
            // Mundane text
            nuance = ` Se siente una atmósfera **${tTrait}** (${tSign}) que desafía o impulsa la energía **${nTrait}** (${nSign}).`;
        }

        if (aspectName === 'Cuadratura' || aspectName === 'Oposición') {
            nuance += ` Cuidado con la sombra de ${tSign}: ${tZodiac.shadow.split(',')[0]}.`;
        } else if (aspectName === 'Trígono' || aspectName === 'Sextil') {
            nuance += ` Aprovecha la virtud de ${tSign}: ${tZodiac.light.split(',')[0]}.`;
        }
    }

    if (context === 'MUNDANE') {
        return `CLIMA GLOBAL: ${tName} en ${tSign} hace ${aspectName} a ${nName} en ${nSign}. ${aspectAction}.${nuance} Esto afecta al colectivo activando temas de ${tArch.keywords[0]} y ${nArch.keywords[0]}.`;
    }

    return `${tArch.transit} ${nArch.natal}, ${aspectAction}.${nuance} Este tránsito activa temas de ${tArch.keywords[0]} y ${nArch.keywords[0]}. Observa cómo se manifiesta esta alquimia en tu realidad inmediata.`;
}


export function calculateAspects(transitPlanets: PlanetPosition[], targetPlanets: PlanetPosition[], context: 'NATAL' | 'MUNDANE' = 'NATAL'): Aspect[] {
    const aspects: Aspect[] = [];

    // Avoid duplicate mundane aspects (A-B same as B-A)
    // For Natal it matters direction (Transit touches Natal).
    // For Mundane, Sun-Moon is same as Moon-Sun effectively, but let's keep it simple.

    for (let i = 0; i < transitPlanets.length; i++) {
        const tPlanet = transitPlanets[i];

        // Output optimization: For Mundane, only compare with planets further in the list to avoid duplicates
        // For Natal, compare all Transits vs all Natals.
        const startTargetIndex = (context === 'MUNDANE') ? i + 1 : 0;

        for (let j = startTargetIndex; j < targetPlanets.length; j++) {
            const nPlanet = targetPlanets[j];

            // Comparison logic
            // Calculate shortest distance between angles on a circle
            let diff = Math.abs(tPlanet.longitude - nPlanet.longitude);
            if (diff > 180) diff = 360 - diff;

            // Check against defined aspects
            for (const aspect of ASPECTS) {
                if (diff >= (aspect.angle - aspect.orb) && diff <= (aspect.angle + aspect.orb)) {
                    // It's a match!
                    const orb = Math.abs(diff - aspect.angle);

                    // Get Signs
                    const tSign = getSignFromLongitude(tPlanet.longitude);
                    const nSign = getSignFromLongitude(nPlanet.longitude);

                    let descEs = generateDeepInterpretation(tPlanet.name, nPlanet.name, aspect.name, tSign, nSign, context);
                    let descEn = `Energy from ${tPlanet.name} (${tSign}) interacts with ${context === 'NATAL' ? 'your natal' : ''} ${nPlanet.name} (${nSign}).`;

                    aspects.push({
                        planet1: tPlanet.name,
                        planet2: nPlanet.name,
                        type: aspect.name as any,
                        angle: diff,
                        orb: orb,
                        descriptionEs: descEs,
                        descriptionEn: descEn,
                        intensity: 10 - orb, // Closer to 0 orb = higher intensity
                        symbol: aspect.symbol
                    });
                }
            }
        }
    }

    // Sort by intensity (tightest orbs first)
    return aspects.sort((a, b) => b.intensity - a.intensity);
}
