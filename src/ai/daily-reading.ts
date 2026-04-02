'use server';

import { ai, safeGenerate } from './genkit';
import { DailyReadingInput, DailyReadingOutput, DailyReadingOutputSchema } from './schemas';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

// ============================================
// DAILY READING GENERATOR v3.0 — Multi-Effluvio
// ============================================

/**
 * Generates a personalized daily astrological reading based on current transits.
 * Returns a primary reading + an array of 2-4 distinct efluvios (one per transit).
 */
export async function generateDailyReading(input: DailyReadingInput): Promise<DailyReadingOutput> {
    const { birthData, aspects, userName } = input;

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TAREA: LECTURA ALQUÍMICA DIARIA — MÚLTIPLES EFLUVIOS
    Interpreta cómo los tránsitos de HOY impactan la carta natal del consultante.
    
    INSTRUCCIONES:
    1. Genera un campo "headline", "theme", "reading" y "advice" PRIMARIO que sintetice el día completo.
    2. Luego genera entre 2 y 4 EFLUVIOS en el array "efluvios". Cada efluvio debe:
       - Centrarse en UN tránsito o dimensión energética diferente.
       - Tener su propio headline, theme, reading y advice únicos (no repitas contenido).
       - Incluir "planetSource" indicando el par "PlanetaTránsito → PlanetaNatal".
    3. TONO: Profundo pero fácil de entender. Directo. Sin clichés de horóscopo.
    4. PROHIBIDO: "un viaje de autodescubrimiento", "balancear energías", frases vacías.
    
    CONSULTANTE:
    - Nombre: ${userName || 'Alquimista'}
    - Fecha de nacimiento: ${birthData.date}
    `;

    const userPrompt = `
    TRÁNSITOS ACTIVOS (${new Date().toLocaleDateString('es-ES')}):
    ${JSON.stringify(aspects, null, 2)}
    
    Genera la Lectura Alquímica Diaria con su campo primario y el array "efluvios" (2-4 efluvios distintos).
    Responde ESTRICTAMENTE en JSON válido con la estructura del schema.
    `;

    const intelligentFallback = generateDeterministicFallback(aspects, userName);

    return await safeGenerate(
        () => ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: DailyReadingOutputSchema }
        }),
        intelligentFallback,
        'Daily Reading'
    );
}

/**
 * Fully deterministic fallback — always yields identical output for the same inputs.
 * This prevents the flicker between "loading" and "different result" states.
 */
function generateDeterministicFallback(
    aspects: DailyReadingInput['aspects'],
    userName?: string
): DailyReadingOutput {
    const planetHierarchy = ['Plutón', 'Neptuno', 'Urano', 'Saturno', 'Júpiter', 'Marte', 'Venus', 'Mercurio', 'Sol', 'Luna'];
    const greeting = userName ? `${userName},` : 'Alquimista,';

    const aspectThemes: Record<string, { theme: string; energy: string }> = {
        'Conjunction': { theme: 'Unión de Fuerzas', energy: 'fusión' },
        'Opposition': { theme: 'Tensión Productiva', energy: 'polaridad' },
        'Square': { theme: 'Desafío Activo', energy: 'fricción que impulsa' },
        'Trine': { theme: 'Flujo Natural', energy: 'armonía' },
        'Sextile': { theme: 'Oportunidad', energy: 'apertura suave' },
    };

    // Sort deterministically by planetary weight (outer planets first)
    const sorted = [...aspects].sort((a, b) => {
        const wa = Math.min(
            planetHierarchy.indexOf(a.planet1) === -1 ? 99 : planetHierarchy.indexOf(a.planet1),
            planetHierarchy.indexOf(a.planet2) === -1 ? 99 : planetHierarchy.indexOf(a.planet2)
        );
        const wb = Math.min(
            planetHierarchy.indexOf(b.planet1) === -1 ? 99 : planetHierarchy.indexOf(b.planet1),
            planetHierarchy.indexOf(b.planet2) === -1 ? 99 : planetHierarchy.indexOf(b.planet2)
        );
        return wa - wb;
    });

    const makeEfluvio = (aspect: (typeof aspects)[0], idx: number) => {
        const sign = aspect?.sign1 || 'Aries';
        const archetype = ZODIAC_ARCHETYPES[sign] || ZODIAC_ARCHETYPES['Aries'];
        const info = aspectThemes[aspect?.type] || aspectThemes['Conjunction'];
        const keyword = archetype?.keywords?.[idx % (archetype?.keywords?.length || 1)] || 'transformador';

        return {
            headline: `${aspect?.planet1 || 'El Cosmos'} Activa tu ${aspect?.planet2 || 'Esencia'}`,
            theme: info.theme,
            reading: `${greeting} el tránsito de ${aspect?.planet1} sobre tu ${aspect?.planet2} natal crea hoy una ${info.energy} ` +
                `con la energía de ${sign}. Esto despierta en ti la cualidad ${keyword}: una invitación a trabajar conscientemente ` +
                `con este impulso en lugar de reaccionar desde él. Observa dónde aparece esta tensión en tu día y úsala como información.`,
            advice: archetype?.shadow
                ? `Atención: cuando esta energía se desequilibra, aparece ${archetype.shadow.toLowerCase()}. ` +
                  `Trabaja desde ${archetype?.light?.toLowerCase() || 'la conciencia plena'}.`
                : 'Observa sin juzgar. La respuesta consciente siempre supera la reacción automática.',
            planetSource: `${aspect?.planet1 || '?'} → ${aspect?.planet2 || '?'}`,
        };
    };

    // Take up to 4 aspects, guarantee minimum of 2
    const selected = sorted.slice(0, 4);
    while (selected.length < 2 && aspects.length > 0) {
        selected.push(aspects[0]);
    }
    const efluvios = selected.map((a, i) => makeEfluvio(a, i));

    // Primary reading = synthesis of the first effluvio
    const primary = efluvios[0] ?? {
        headline: 'El Cielo Habla Hoy',
        theme: 'Conciencia Activa',
        reading: `${greeting} los astros están activos hoy. Presta atención a las señales en tu entorno.`,
        advice: 'Observa antes de actuar.',
    };

    return {
        headline: primary.headline,
        theme: primary.theme,
        reading: primary.reading,
        advice: primary.advice,
        efluvios,
    };
}
