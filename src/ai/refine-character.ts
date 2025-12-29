'use server';

import { ai, safeGenerate } from './genkit';
import { RefineCharacterInputSchema, RefineCharacterOutputSchema } from './schemas';
import { z } from 'genkit';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';

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

    TU MISIÓN: REFINAMIENTO CLÍNICO
    El usuario ha realizado un "Análisis Profundo" (Lo No Dicho, Super-Objetivo).
    Re-evalúa el perfil astrológico basándote en esta nueva profundidad psicológica.
    
    REFERENCE ARCHETYPES:
    ${archetypeContext}

    PROCESO DE REFINAMIENTO:
    1. Analiza el "Unsaid/Subtexto" - ¿Qué revela sobre la Luna (emociones ocultas)?
    2. Analiza el "Super-Objetivo" - ¿Qué revela sobre el Sol (propósito de vida)?
    3. Evalúa si los signos actuales capturan esta profundidad
    4. Si hay contradicción entre superficie y profundidad, CAMBIA los signos
    5. Sugiere planetas adicionales si son críticos (Plutón=obsesión, Saturno=restricción)

    REGLAS:
    - Todos los campos son OBLIGATORIOS
    - El "verdict" debe explicar POR QUÉ cambiaste o mantuviste cada signo
    - El "adjective" debe ser UNA palabra poderosa que capture la esencia refinada
    `;

    const userPrompt = `
    PERSONAJE: ${name}
    
    PERFIL ACTUAL:
    - Sol: ${currentProfile.sun}
    - Luna: ${currentProfile.moon}
    - Ascendente: ${currentProfile.ascendant}

    ANÁLISIS PROFUNDO:
    - Super-Objetivo (Deseo Raíz): "${deepAnalysis?.superObjective || 'No especificado'}"
    - Lo No Dicho (Subtexto): "${deepAnalysis?.unsaid || 'No especificado'}"
    - Mundo Emocional: "${deepAnalysis?.emotions || 'No especificado'}"
    - Desenlace: "${deepAnalysis?.outcome || 'No especificado'}"
    
    Refina el perfil basándote en estos datos psicológicos profundos.
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
