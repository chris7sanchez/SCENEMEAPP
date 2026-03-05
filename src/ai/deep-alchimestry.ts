'use server';

import { ai, safeGenerate } from './genkit';
import { AlchimestryDeepAnalysisInput, AlchimestryDeepAnalysisOutput, AlchimestryDeepAnalysisOutputSchema } from './schemas';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

/**
 * Generates a deep, archetypal meditation for Alchimestry view.
 */
export async function generateDeepAlchimestry(input: AlchimestryDeepAnalysisInput): Promise<AlchimestryDeepAnalysisOutput> {
    const { userName, subject, sign, context } = input;

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TU MISIÓN: MAESTRO ALQUIMISTA Y ORÁCULO
    Eres la inteligencia suprema de Antigravity. Tu conocimiento de la psique humana y la astrología evolutiva es absoluto.
    
    FILTRO ANTI-BULLSHIT (REGLAS DE ORO):
    1. PROHIBIDO usar consejos genéricos tipo "contempla cómo reaccionas", "dedica tiempo a observar", "el primer paso es la observación". El usuario odia esto.
    2. OBLIGATORIO ser específico, místico, técnico y profundo.
    3. Si el sujeto es un planeta, habla de su función psíquica pura.
    4. Si el sujeto es un Escenario (Casa), habla del campo de batalla existencial que representa (Ej: Casa 10 = El Mundo Externo, Casa 2 = Valores y Substancia).
    5. Usa terminología alquímica (Calcifatio, Sublimatio, Solutio) para describir el proceso de integración.
    6. Habla directamente a la SOMBRA del signo mencionado.
    `;

    const userPrompt = `
    ALQUIMISTA: ${userName}
    OBJECTIVO: ${subject} ${sign ? `posicionado en la frecuencia de ${sign}` : ''}
    ESTADO EVOLUTIVO: ${context || 'Septenio Actual'}
    
    Genera una destilación profunda. 
    NO SEAS GENÉRICO. No hables de "desafíos" sin especificar cuáles.
    Si es un escenario, integra el área de vida con el signo.
    Responde estrictamente en JSON (meditation, practicalWisdom, alchemicalKey).
    `;

    // High-Value Data-Driven Fallbacks (The "No-Bullshit" Backup)
    const houseContexts: Record<string, string> = {
        '1': 'la identidad y la proyección del ego',
        '2': 'la generación de recursos y la valoración propia',
        '3': 'la mente lineal y el entorno inmediato',
        '4': 'las raíces ancestrales y el refugio emocional',
        '5': 'la autoexpresión creativa y el gozo',
        '6': 'el orden ritual y el servicio a la materia',
        '7': 'el espejo del otro y los vínculos sagrados',
        '8': 'la transmutación de la sombra y la entrega',
        '9': 'la búsqueda de la verdad y la expansión mental',
        '10': 'la vocación pública y la autoridad interna',
        '11': 'la conciencia grupal y los ideales colectivos',
        '12': 'la disolución del ego en el océano del inconsciente'
    };

    const houseId = subject.match(/\d+/)?.[0] || '';
    const houseMeaning = houseContexts[houseId] || 'la experiencia de este plano';
    const archetype = sign ? ZODIAC_ARCHETYPES[sign] : null;

    const fallback: AlchimestryDeepAnalysisOutput = {
        meditation: archetype
            ? `Tu ${subject} exige una integración entre ${houseMeaning} y la fuerza de ${archetype.keywords?.[0] || 'evolución'}. El alma en ${sign} no tolera la mediocridad: busca manifestar su ${archetype.light?.split('.')[0] || 'potencial sagrado'} a través de la acción consciente.`
            : `El estudio de ${subject} en tu arquitectura revela un punto de tensión en ${houseMeaning}. Esta energía no es un obstáculo, sino un catalizador que exige que dejes de ser espectador de tu propia sombra.`,
        practicalWisdom: archetype?.shadow
            ? `Corta de raíz la tendencia de ${sign} hacia ${archetype.shadow.split('.')[0].toLowerCase()}. Para dominar este escenario, debes encarnar la cualidad de ${archetype.keywords?.[1] || 'maestría'} sin pedir permiso al entorno.`
            : `Deja de esperar señales. El dominio de ${subject} requiere que asumas la autoridad total sobre ${houseMeaning}. La pasividad es el veneno de esta posición.`,
        alchemicalKey: sign ? `${subject} en ${sign}: La Gran Obra` : "VITRIOL"
    };

    try {
        const response = await safeGenerate(
            () => ai.generate({
                model: 'googleai/gemini-1.5-flash',
                system: systemPrompt,
                prompt: userPrompt,
                output: { schema: AlchimestryDeepAnalysisOutputSchema }
            }),
            fallback,
            `Deep Alchimestry: ${subject}`
        );
        return response;
    } catch (e) {
        console.error(`[Alchimestry] Critical error for ${subject}:`, e);
        return fallback;
    }
}
