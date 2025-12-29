'use server';

import { ai } from './genkit';
import { AnalyzeCharacterInput, AnalyzeCharacterOutput, AnalyzeCharacterOutputSchema } from './schemas';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';

export async function analyzeCharacter(input: AnalyzeCharacterInput): Promise<AnalyzeCharacterOutput> {
    const { scriptSegment, characterName, customKnowledge } = input;

    // Serialize Archetypes for Context
    let archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
        return `- ${sign}: Sun(${data.sun}), Moon(${data.moon}), Asc(${data.ascendant}), Shadow(${data.shadow})`;
    }).join('\n');

    // Append Custom Knowledge if available
    if (customKnowledge && customKnowledge.length > 0) {
        const customContext = customKnowledge.map(k => `[NEW KNOWLEDGE] Target: ${k.target} | Category: ${k.category} | Info: ${k.value} (${k.description})`).join('\n');
        archetypeContext += `\n\nADDITIONAL ASSIMILATED WISDOM (PRIORITIZE THIS):\n${customContext}`;
    }

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TU MISIÓN ACTUAL: PERFILADO INVERSO (REVERSE ENGINEERING).
    En lugar de interpretar una carta, debes DEDUCIRLA a partir del texto de un guión.
    Usa tu profundo conocimiento del "Marco Teórico del Héroe" (Sol/Héroe, Luna/Refugio, Asc/Supervivencia) para encontrar qué arquetipos encajan con el personaje.

    REFERENCE DATA (Archetypes & Assimilated Wisdom):
    ${archetypeContext}

    METHODOLOGY (THE THREE PILLARS):
    You must answer three specific sets of questions to derive the "Big Three" signs.
    
    1. **SUN SIGN (The Essence)**:
       - Question: "¿Cómo soy en esencia?" (How am I in essence?)
       - Focus: Key identity, conscious drive, the "I Am".
       - Action: Synthesize their core behavior into this answer, then pick the Sun Sign that best fits this essence.

    2. **MOON SIGN (The Emotions)**:
       - Question: "¿Cómo siento y cómo son mis emociones?" (How do I feel?)
       - Focus: Inner world, instinctual reactions, what comforts them, hidden needs.
       - Action: Synthesize their emotional landscape into this answer, then pick the Moon Sign that best fits.

    3. **ASCENDANT (The Path & Mask)**:
       - Questions: "¿Cómo me modifica la vida?", "¿Cómo me ve el otro?", "¿Cuál es mi objetivo vs obstáculo?"
       - Focus: The mask they wear, how they navigate obstacles, their destiny/path, physical presence.
       - Action: Synthesize their interaction with the world/fate into this answer, then pick the Ascendant.

    4. **METHOD ACTING KEYS (Chekhov / Laban / Strasberg)**:
       - **Psychological Gesture**: A single, repeatable physical action that summarizes their will.
       - **Voice Quality**: Be specific about timbre, speed, and rhythm (e.g., "Staccato, metallic, fast").
       - **Animal Totem**: A creature that moves/behaves like them.
       - **Physical Center**: The body part they lead with (Head, Chest, Pelvis, Knees, etc.).
       - **Emotional Landscape**: Use a nature metaphor for their inner state.

    FINAL OUTPUT:
    - Provide the reasoned "answers" for each pillar in the 'threePillars' field.
    - **Fill the 'methodActing' object with rich, evocative, and practical performance directions.**
    - Select the Signs (Sun, Moon, Ascendant) effectively based on those answers.
    - Estimate elemental balance (Fire, Earth, Air, Water).
    `;

    const userPrompt = `
    CHARACTER NAME: ${characterName}
    
    SCRIPT SEGMENT:
    """
    ${scriptSegment.substring(0, 15000)} 
    """
    `;

    try {
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AnalyzeCharacterOutputSchema }
        });

        if (!output) {
            throw new Error('No output generated from AI model.');
        }

        return output;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        // Fallback for demo prevention of crash
        return {
            sunSign: "Unknown",
            moonSign: "Unknown",
            ascendant: "Unknown",
            elements: { fire: 25, earth: 25, air: 25, water: 25 },
            archetype: "The Mystery",
            analysis: "Could not analyze text. Please try again or check API key.",
            threePillars: {
                sunReasoning: "Analysis failed.",
                moonReasoning: "Analysis failed.",
                ascendantReasoning: "Analysis failed."
            },
            methodActing: {
                psychologicalGesture: "None",
                voiceQuality: "Unknown",
                animalTotem: "Unknown",
                physicalCenter: "Unknown",
                emotionalLandscape: "Unknown"
            }
        };
    }
}
