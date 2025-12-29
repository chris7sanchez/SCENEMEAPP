'use server';

import { ai, safeGenerate } from './genkit';
import { DailyReadingInput, DailyReadingOutput, DailyReadingOutputSchema } from './schemas';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

// ============================================
// DAILY READING GENERATOR v2.0
// ============================================
// Uses safeGenerate with automatic retry and intelligent fallback

/**
 * Generates a personalized daily astrological reading based on current transits
 * affecting the user's natal chart.
 */
export async function generateDailyReading(input: DailyReadingInput): Promise<DailyReadingOutput> {
    const { birthData, aspects, userName } = input;

    // Build the system prompt with full context
    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TAREA ESPECÍFICA (LECTURA DIARIA):
    Interpreta los tránsitos planetarios actuales para este individuo.
    
    INSTRUCCIONES CRÍTICAS:
    1. ANALIZA los aspectos proporcionados. Identifica los 2-3 más poderosos.
    2. PRIORIZA aspectos con planetas lentos (Plutón, Neptuno, Urano, Saturno, Júpiter).
    3. SINTETIZA estos aspectos en UNA narrativa coherente. NO hagas listas.
    4. USA el Marco del Viaje del Héroe: ¿En qué fase está hoy? (Llamada, Umbral, Prueba, Revelación)
    5. SÉ ESPECÍFICO. Menciona los planetas y signos involucrados.
    6. EVITA clichés genéricos. Cada lectura debe sentirse única.
    
    FORMATO OBLIGATORIO:
    - headline: Título místico y evocador (5-10 palabras)
    - theme: Tema en 2-4 palabras
    - reading: Párrafo profundo (150-250 palabras), segunda persona ("tú")
    - advice: Consejo críptico pero práctico (1-2 oraciones)

    DATOS DEL CONSULTANTE:
    - Nombre: ${userName || 'El Alquimista'}
    - Fecha Nacimiento: ${birthData.date}
    - Ciudad: ${birthData.city || 'Desconocida'}
    `;

    const userPrompt = `
    TRÁNSITOS ACTIVOS (${new Date().toLocaleDateString('es-ES')}):
    ${JSON.stringify(aspects, null, 2)}
    
    Genera la Lectura Alquímica Diaria.
    `;

    // Generate the intelligent fallback based on actual data
    const intelligentFallback = generateIntelligentFallback(aspects, userName);

    // Use safeGenerate with retry and fallback
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
 * Generates a deterministic but meaningful fallback reading
 * when the AI service is unavailable.
 */
function generateIntelligentFallback(
    aspects: DailyReadingInput['aspects'],
    userName?: string
): DailyReadingOutput {
    // Find the most significant aspect (prefer outer planets)
    const planetHierarchy = ['Plutón', 'Neptuno', 'Urano', 'Saturno', 'Júpiter', 'Marte', 'Venus', 'Mercurio', 'Sol', 'Luna'];

    let dominantAspect = aspects[0];
    let maxWeight = -1;

    for (const aspect of aspects) {
        const weight1 = planetHierarchy.indexOf(aspect.planet1);
        const weight2 = planetHierarchy.indexOf(aspect.planet2);
        const aspectWeight = Math.min(
            weight1 === -1 ? 100 : weight1,
            weight2 === -1 ? 100 : weight2
        );

        if (aspectWeight > maxWeight || maxWeight === -1) {
            maxWeight = aspectWeight;
            dominantAspect = aspect;
        }
    }

    // Get archetype data for the signs involved
    const sign1 = dominantAspect?.sign1 || 'Aries';
    const sign2 = dominantAspect?.sign2 || 'Aries';
    const archetype1 = ZODIAC_ARCHETYPES[sign1] || ZODIAC_ARCHETYPES['Aries'];
    const archetype2 = ZODIAC_ARCHETYPES[sign2] || ZODIAC_ARCHETYPES['Aries'];

    // Generate aspect-specific content
    const aspectMeanings: Record<string, { theme: string; energy: string }> = {
        'Conjunction': { theme: 'Fusión de Energías', energy: 'unión poderosa' },
        'Opposition': { theme: 'Tensión Creativa', energy: 'polaridad que exige equilibrio' },
        'Square': { theme: 'Desafío Evolutivo', energy: 'fricción que impulsa la acción' },
        'Trine': { theme: 'Flujo Armónico', energy: 'facilidad y gracia natural' },
        'Sextile': { theme: 'Oportunidad Sutil', energy: 'puerta que se abre suavemente' },
    };

    const aspectType = dominantAspect?.type || 'Conjunction';
    const aspectInfo = aspectMeanings[aspectType] || aspectMeanings['Conjunction'];

    const greeting = userName ? `${userName},` : 'Alquimista,';

    return {
        headline: `${dominantAspect?.planet1 || 'El Cosmos'} Susurra a tu ${dominantAspect?.planet2 || 'Alma'}`,
        theme: aspectInfo.theme,
        reading: `${greeting} hoy el universo te habla a través de una ${aspectInfo.energy}. ` +
            `${dominantAspect?.planet1 || 'La energía cósmica'} en ${sign1} entra en diálogo con tu ${dominantAspect?.planet2 || 'esencia'} natal. ` +
            `Este tránsito activa la cualidad ${archetype1?.keywords?.[0] || 'transformadora'} dentro de ti. ` +
            `Es momento de observar cómo tu naturaleza ${archetype2?.keywords?.[1] || 'profunda'} responde a este llamado. ` +
            `La tensión que puedas sentir no es obstáculo sino catalizador. Recuerda: ${archetype1?.light || 'la luz surge de la oscuridad consciente'}. ` +
            `Hoy, tu trabajo interior consiste en integrar estas fuerzas aparentemente opuestas en una síntesis superior.`,
        advice: archetype1?.shadow
            ? `Vigila la tendencia hacia ${archetype1.shadow.toLowerCase()}. En su lugar, cultiva ${archetype1.light?.toLowerCase() || 'la maestría silenciosa'}.`
            : 'Observa sin juzgar. Actúa sin forzar. El momento oportuno se revelará.'
    };
}
