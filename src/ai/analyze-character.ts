'use server';

import { ai, safeGenerate } from './genkit';
import { AnalyzeCharacterInput, AnalyzeCharacterOutput, AnalyzeCharacterOutputSchema } from './schemas';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';

// ============================================
// CHARACTER ANALYZER v2.0
// ============================================
// Uses safeGenerate with automatic retry and intelligent fallback

/**
 * Analyzes a character from script text and generates an astrological profile.
 * Uses "Reverse Engineering" methodology to deduce the Big Three from behavior.
 */
export async function analyzeCharacter(input: AnalyzeCharacterInput): Promise<AnalyzeCharacterOutput> {
    const { scriptSegment, characterName, customKnowledge } = input;

    // Serialize Archetypes for Context
    let archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
        return `- ${sign}: Sun(${data.sun}), Moon(${data.moon}), Asc(${data.ascendant}), Shadow(${data.shadow}), Light(${data.light})`;
    }).join('\n');

    // Append Custom Knowledge if available (prioritized)
    if (customKnowledge && customKnowledge.length > 0) {
        const customContext = customKnowledge.map(k =>
            `[WISDOM] ${k.target}: ${k.category} → ${k.value} (${k.description})`
        ).join('\n');
        archetypeContext += `\n\n--- ASSIMILATED WISDOM (PRIORITIZE) ---\n${customContext}`;
    }

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TU MISIÓN: PERFILADO ASTROLÓGICO INVERSO
    Deduce la carta natal de un personaje a partir de su comportamiento en el guión.
    
    REFERENCE DATA:
    ${archetypeContext}

    METODOLOGÍA DE LOS TRES PILARES:

    1. **SOL (Esencia)** → "¿Cómo soy en esencia?"
       - Identidad consciente, propósito de vida, el "YO SOY"
       - Busca: motivaciones principales, cómo se define a sí mismo
       
    2. **LUNA (Emociones)** → "¿Cómo siento y cómo son mis emociones?"
       - Mundo interior, reacciones instintivas, necesidades ocultas
       - Busca: comportamiento bajo estrés, qué le da seguridad
       
    3. **ASCENDENTE (Máscara)** → "¿Cómo me ve el otro? ¿Cuál es mi destino?"
       - Máscara social, primera impresión, cómo navega obstáculos
       - Busca: presencia física, cómo interactúa con extraños

    METHOD ACTING (Para el Actor):
    - Gesto Psicológico: Un movimiento físico que capture la esencia
    - Cualidad Vocal: Tempo, tono, textura, ritmo específicos
    - Animal Tótem: Criatura que encarne su energía
    - Centro Físico: ¿De dónde lidera el cuerpo?
    - Paisaje Emocional: Metáfora de naturaleza para su mundo interno

    REGLAS CRÍTICAS:
    - TODOS los campos son OBLIGATORIOS
    - Los signos deben ser exactamente uno de los 12 del zodiaco
    - Los elementos deben sumar 100
    - Sé específico y evita respuestas genéricas
    `;

    const userPrompt = `
    PERSONAJE A ANALIZAR: ${characterName}
    
    FRAGMENTO DEL GUIÓN:
    """
    ${scriptSegment.substring(0, 12000)}
    """
    
    Genera el perfil astrológico completo de ${characterName}.
    `;

    // Generate intelligent fallback based on character name analysis
    const fallback = generateCharacterFallback(characterName, scriptSegment);

    return await safeGenerate(
        () => ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AnalyzeCharacterOutputSchema }
        }),
        fallback,
        `Character Analysis: ${characterName}`
    );
}

/**
 * Generates a thoughtful fallback profile when AI is unavailable.
 * Uses heuristics based on character name and text analysis.
 */
function generateCharacterFallback(characterName: string, scriptSegment: string): AnalyzeCharacterOutput {
    // Simple text analysis for element determination
    const textLower = scriptSegment.toLowerCase();

    const fireWords = ['anger', 'passion', 'fight', 'rage', 'bold', 'fire', 'explosion', 'furia', 'pasión', 'lucha'];
    const earthWords = ['money', 'work', 'stable', 'practical', 'ground', 'dinero', 'trabajo', 'estable', 'práctico'];
    const airWords = ['think', 'idea', 'talk', 'logic', 'reason', 'piensa', 'idea', 'habla', 'lógica', 'razón'];
    const waterWords = ['feel', 'emotion', 'cry', 'love', 'intuition', 'siente', 'emoción', 'llora', 'amor', 'intuición'];

    const countWords = (words: string[]) => words.filter(w => textLower.includes(w)).length;

    const fireScore = countWords(fireWords) * 10 + 15;
    const earthScore = countWords(earthWords) * 10 + 15;
    const airScore = countWords(airWords) * 10 + 15;
    const waterScore = countWords(waterWords) * 10 + 15;

    const total = fireScore + earthScore + airScore + waterScore;

    // Determine dominant element and corresponding signs
    const elements = {
        fire: Math.round((fireScore / total) * 100),
        earth: Math.round((earthScore / total) * 100),
        air: Math.round((airScore / total) * 100),
        water: Math.round((waterScore / total) * 100)
    };

    // Normalize to exactly 100
    const diff = 100 - (elements.fire + elements.earth + elements.air + elements.water);
    elements.fire += diff;

    // Determine signs based on dominant element
    const elementSigns = {
        fire: ['Aries', 'Leo', 'Sagittarius'],
        earth: ['Taurus', 'Virgo', 'Capricorn'],
        air: ['Gemini', 'Libra', 'Aquarius'],
        water: ['Cancer', 'Scorpio', 'Pisces']
    };

    const dominant = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0] as keyof typeof elementSigns;
    const secondary = Object.entries(elements).sort((a, b) => b[1] - a[1])[1][0] as keyof typeof elementSigns;

    const sunSign = elementSigns[dominant][0];
    const moonSign = elementSigns[secondary][1];
    const ascendant = elementSigns[dominant][2];

    return {
        sunSign,
        moonSign,
        ascendant,
        elements,
        archetype: "El Misterio Emergente",
        analysis: `${characterName} presenta una energía predominantemente de ${dominant}. Este perfil provisional se basa en el análisis textual y requiere refinamiento con la IA completa.`,
        threePillars: {
            sunReasoning: `Basado en el comportamiento observado, ${characterName} parece operar desde una energía ${sunSign}.`,
            moonReasoning: `Las reacciones emocionales sugieren un refugio interno tipo ${moonSign}.`,
            ascendantReasoning: `La primera impresión y presencia física apuntan hacia ${ascendant}.`
        },
        methodActing: {
            psychologicalGesture: "Un gesto de búsqueda constante hacia adelante",
            voiceQuality: "Tempo moderado, textura variada según el contexto emocional",
            animalTotem: dominant === 'fire' ? "Lobo" : dominant === 'water' ? "Delfín" : dominant === 'earth' ? "Oso" : "Águila",
            physicalCenter: dominant === 'fire' ? "Plexo Solar" : dominant === 'water' ? "Corazón" : dominant === 'earth' ? "Pelvis" : "Cabeza",
            emotionalLandscape: dominant === 'fire' ? "Un volcán activo con lagos de lava" : dominant === 'water' ? "Un océano profundo y misterioso" : dominant === 'earth' ? "Un bosque antiguo y denso" : "Un cielo infinito con corrientes de viento"
        }
    };
}
