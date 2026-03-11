'use server';

import { ai, safeGenerate } from './genkit';
import { RefineCharacterInputSchema, RefineCharacterOutputSchema } from './schemas';
import { z } from 'genkit';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';
import { INTENTION_TO_ASTRO_MAP } from './intention-mapping';

// ============================================
// CHARACTER REFINEMENT v2.0
// ============================================
// Refines astrological profiles based on deep psychological analysis

type RefineCharacterInput = z.infer<typeof RefineCharacterInputSchema>;
type RefineCharacterOutput = z.infer<typeof RefineCharacterOutputSchema>;

/**
 * Refines a character's astrological profile based on deep psychological analysis.
 * Re-evaluates Sun, Moon, and Ascendant based on subtext and emotional patterns.
 */
export async function refineCharacter(input: RefineCharacterInput): Promise<RefineCharacterOutput> {
    const { name, currentProfile, deepAnalysis } = input;

    // Serialize Context
    const archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
        return `- ${sign}: Keywords(${data.keywords.join(', ')}), Shadow(${data.shadow})`;
    }).join('\n');

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TU MISIÓN: REFINAMIENTO CLÍNICO Y TRANSFORMACIÓN DE CARTA
    El usuario (que es el actor/director) ha realizado un "Análisis Profundo" (Lo No Dicho, Super-Objetivo).
    Tu deber es REEVALUAR AGRESIVAMENTE el perfil astrológico basándote en esta nueva profundidad psicológica.
    NUNCA debes conformarte con la asignación original si la nueva información sugiere una contradicción interesante.
    
    REFERENCE ARCHETYPES:
    ${archetypeContext}

    ${INTENTION_TO_ASTRO_MAP}

    PROCESO DE REFINAMIENTO ESTRUCTURAL:
    1. Analiza "Lo No Dicho / Subtexto" - Si oculta emociones, la Luna actual podría estar equivocada. Cámbiala a un signo más defensivo o hermético (ej. Escorpio, Capricornio).
    2. Analiza el "Super-Objetivo" - Si el propósito es de poder, conquista o escape, el Sol actual debe reflejar ese nivel de ambición o herida.
    3. Evalúa la "Máscara" (Ascendente) - ¿Coincide la fachada con la "Mentira" que se dice a sí mismo frente a los demás?
    4. JUSTIFICA TUS CAMBIOS: Si cambias de Sol Aries a Sol Piscis, explica que la supuesta agresión inicial ocultaba una extrema sensibilidad y sacrificio (o viceversa).
    5. Sugiere planetas adicionales decisivos (Plutón = obsesiones/poder, Saturno = cargas/muros).

    REGLAS ESTRICTAS DE REFINAMIENTO:
    - Todos los campos son OBLIGATORIOS.
    - PROHIBIDO MANTENER EL PERFIL INICIAL SOLO "PORQUE SÍ". Sé valiente, si el super-objetivo contradice al Sol inicial, CÁMBIALO.
    - El "verdict" debe ser una justificación contundente de la alquimia entre el guion visible y este nuevo mundo interno.
    - El "adjective" debe ser UNA palabra poderosa y reveladora.
    `;

    const userPrompt = `
    PERSONAJE: ${name}
    
    PERFIL INFERIDO DEL TEXTO SUPERFICIAL:
    - Sol: ${currentProfile.sun}
    - Luna: ${currentProfile.moon}
    - Ascendente: ${currentProfile.ascendant}

    REVELACIÓN CLÍNICA (SUBTEXTO OCULTO DEL ACTOR):
    - Super-Objetivo (Deseo Raíz): "${deepAnalysis?.superObjective || 'No especificado'}"
    - Lo No Dicho (Subtexto): "${deepAnalysis?.unsaid || 'No especificado'}"
    - Mundo Emocional (Secretos): "${deepAnalysis?.emotions || 'No especificado'}"
    - Arco o Desenlace: "${deepAnalysis?.outcome || 'No especificado'}"
    
    Re-escribe la carta astral. Muéstrame qué signos operan realmente detrás de su comportamiento aparente. 
    `;

    // Fallback that keeps current profile with explanation
    const fallback: RefineCharacterOutput = {
        suggestedSun: currentProfile.sun,
        suggestedMoon: currentProfile.moon,
        suggestedAscendant: currentProfile.ascendant,
        suggestedPlanets: {},
        verdict: `El perfil de ${name} mantiene su configuración actual. La profundidad psicológica proporcionada confirma las asignaciones originales. Para un refinamiento más preciso, proporciona más detalles sobre el subtexto y las motivaciones ocultas del personaje.`,
        adjective: "Consistente"
    };

    return await safeGenerate(
        () => ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: RefineCharacterOutputSchema }
        }),
        fallback,
        `Character Refinement: ${name}`
    );
}
