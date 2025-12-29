
// somatic-mapping.ts
// Maps astrological data to somatic/physical acting instructions

import { PlanetPosition } from './astronomy';

export interface SomaticPoint {
    id: string; // e.g., 'head', 'throat'
    label: string;
    description: string;
    intensity: number; // 0-100
    planet: string; // which planet triggered this
    sign: string;
    instruction: string;
}

export const SOMATIC_ZONES: Record<string, { id: string, label: string, baseInstruction: string }> = {
    'Aries': { id: 'head', label: 'CABEZA / OJOS', baseInstruction: 'El ariete. Lidera con la frente, inclinando el eje hacia adelante. La mirada no parpadea, "atraviesa" al interlocutor. Tensión en la mandíbula.' },
    'Taurus': { id: 'throat', label: 'CUELLO / VOZ', baseInstruction: 'La bestia de carga. Cuello ancho, arraigado. La voz resuena en el pecho superior. Movimientos deliberadamente lentos, economizando energía hasta la explosión.' },
    'Gemini': { id: 'hands', label: 'MANOS / PULMONES', baseInstruction: 'El ilusionista. Las manos nunca paran, dibujan conceptos en el aire. Respiración superficial y rápida. Los ojos escanean todo, sin fijar la vista.' },
    'Cancer': { id: 'chest', label: 'PECHO / ESTÓMAGO', baseInstruction: 'El cangrejo. Hombros curvados hacia adelante protegiendo el corazón "blando". Camina protegiendo el centro. Gestos que atraen objetos hacia sí.' },
    'Leo': { id: 'heart', label: 'CORAZÓN / ESPALDA', baseInstruction: 'El rey. Pecho expandido verticalmente. La barbilla ligeramente elevada. Ocupa el espacio central. La espalda es rígida, no se dobla ante nadie.' },
    'Virgo': { id: 'gut', label: 'INTESTINO / DETALLE', baseInstruction: 'El relojero. Tensión contenida en el plexo solar. Micromovimientos precisos (limpiarse pelusitas, ajustar gafas). La mirada disecciona, critica.' },
    'Libra': { id: 'lumbar', label: 'LUMBARES / PIEL', baseInstruction: 'El bailarín. El peso nunca está en los dos pies a la vez. Curva "S" en la columna. Sonrisa social permanente que no llega a los ojos. Evita el choque frontal.' },
    'Scorpio': { id: 'pelvis', label: 'PELVIS / RAÍZ', baseInstruction: 'El depredador. Centro de gravedad muy bajo. Pelvis basculada hacia adelante. Inmovilidad absoluta antes del ataque. Silencioso al andar.' },
    'Sagittarius': { id: 'hips', label: 'CADERAS / MUSLOS', baseInstruction: 'El centauro. Zancadas exageradamente largas. Golpea cosas al pasar (torpeza expansiva). Risa que nace en las caderas. Ocupa más espacio del necesario.' },
    'Capricorn': { id: 'knees', label: 'RODILLAS / HUESOS', baseInstruction: 'El emperador viejo. Rigidez articular. Movimientos secos, angulares. Parece cargar un peso invisible en los hombros. Mirada que evalúa utilidad.' },
    'Aquarius': { id: 'ankles', label: 'TOBILLOS / NERVIOS', baseInstruction: 'El alienígena. Ritmo arrítmico: quieto... estallido... quieto. Tics nerviosos. Parece incómodo en su propio cuerpo. Mira "a través" de la gente hacia el futuro.' },
    'Pisces': { id: 'feet', label: 'PIES / AURA', baseInstruction: 'El fantasma. Los pies se arrastran o flotan, sin contacto firme. Mirada perdida (desenfocada). Cuerpo maleable, imita la postura de quien tiene enfrente.' },
};

export const getSomaticAnalysis = (planets: PlanetPosition[]): SomaticPoint[] => {
    // We strictly look for the "Big 3" + Mars/Venus for physical acting
    const targetPlanets = ['Sol', 'Luna', 'Ascendente', 'Marte', 'Venus', 'Mercurio', 'Saturno', 'Júpiter', 'Urano', 'Neptuno', 'Plutón'];

    // Helper to normalize sign names if needed (assuming input is standardized Spanish or English)
    // The previous files use Spanish names: Aries, Tauro, Géminis...

    const results: SomaticPoint[] = [];

    planets.forEach(p => {
        if (!targetPlanets.includes(p.name)) return;

        // Simple mapping, assuming p.longitude -> Sign Name
        // We need a helper for Longitude -> Sign Name if not present in p
        // Assuming p has logic or we calculate it here.
        const signs = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
        const signIndex = Math.floor(p.longitude / 30);
        const signNameI = signs[signIndex % 12];

        // Map Spanish Sign to Key (My map uses English/Latin roots mostly? No, let's normalize keys)
        // Let's make the map keys robust
        let key = 'Aries';
        if (signNameI.includes('Aries')) key = 'Aries';
        else if (signNameI.includes('Taur')) key = 'Taurus';
        else if (signNameI.includes('Gém')) key = 'Gemini';
        else if (signNameI.includes('Cán')) key = 'Cancer';
        else if (signNameI.includes('Leo')) key = 'Leo';
        else if (signNameI.includes('Vir')) key = 'Virgo';
        else if (signNameI.includes('Lib')) key = 'Libra';
        else if (signNameI.includes('Esc')) key = 'Scorpio';
        else if (signNameI.includes('Sag')) key = 'Sagittarius';
        else if (signNameI.includes('Cap')) key = 'Capricorn';
        else if (signNameI.includes('Acu')) key = 'Aquarius';
        else if (signNameI.includes('Pis')) key = 'Pisces';

        const zone = SOMATIC_ZONES[key];

        if (zone) {
            let context = "";
            let intensity = 50;

            if (p.name === 'Sol') {
                context = "TU MOTOR VITAL. Aquí reside tu carisma y tu 'Yo Soy'. Proyecta desde esta zona.";
                intensity = 100;
            } else if (p.name === 'Luna') {
                context = "TU SECRETOS. Aquí proteges tus emociones. Tensa o colapsa esta zona cuando te sientas vulnerable.";
                intensity = 80;
            } else if (p.name === 'Ascendente') {
                context = "TU ARMADURA. Es lo primero que entra en la habitación. Úsalo como escudo o ariete.";
                intensity = 90;
            } else if (p.name === 'Marte') {
                context = "TU GATILLO. Desde aquí inicias el ataque o la acción impulsiva. Es tu zona de 'fuego'.";
                intensity = 85;
            } else if (p.name === 'Venus') {
                context = "TU IMÁN. Muestra u ofrece esta parte del cuerpo para seducir o encantar.";
                intensity = 70;
            } else if (p.name === 'Mercurio') {
                context = "TU ANTENA. Gesticula desde aquí para explicarte. Es donde procesas el ritmo.";
                intensity = 60;
            } else if (p.name === 'Saturno') {
                context = "TU PESO. Aquí sientes la gravedad, la responsabilidad y la restricción.";
                intensity = 65;
            } else if (p.name === 'Júpiter') {
                context = "TU EXPANSIÓN. Exagera los movimientos de esta zona cuando te sientas eufórico.";
                intensity = 65;
            } else if (p.name === 'Plutón') {
                context = "TU PODER OCULTO. Una tensión latente y peligrosa reside aquí. No la muevas, solo 'cárgala'.";
                intensity = 95;
            }

            // Only add if it's a major point (to avoid clutter if we added all planets)
            // But function requests all... keep logic loose
            if (context) {
                results.push({
                    id: zone.id,
                    label: zone.label,
                    description: context,
                    intensity,
                    planet: p.name,
                    sign: signNameI,
                    instruction: zone.baseInstruction
                });
            }
        }
    });

    return results.sort((a, b) => b.intensity - a.intensity);
};
