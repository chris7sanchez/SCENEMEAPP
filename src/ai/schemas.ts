import { z } from 'genkit';

// ============================================
// ANTIGRAVITY SCHEMAS v2.0
// ============================================
// All schemas use strict required fields and detailed descriptions
// for optimal structured output from Gemini 2.0 Flash

// ============================================
// VIDEO SCRIPT GENERATION
// ============================================

export const GenerateVideoScriptInputSchema = z.object({
    genre: z.string().describe('The primary genre of the video (e.g., Drama, Comedy, Horror).'),
    secondaryGenre: z.string().optional().describe('The secondary optional genre.'),
    numActors: z.string().describe('Number of actors (e.g., "2", "3-5").'),
    genderActors: z.string().describe('Gender distribution of actors (e.g., "Mixed", "All Female").'),
    tones: z.array(z.string()).describe('The emotional tones of the video (e.g., ["Intense", "Mysterious"]).'),
    locationPreference: z.string().optional().describe('Specific location preference (e.g., "Urban", "Nature").'),
    length: z.string().describe('The length of the video in seconds (e.g., "60", "180").'),
    logline: z.string().describe('The one-sentence summary of the story.'),
    props: z.string().describe('The props used in the video (comma-separated list).'),
    endingType: z.string().describe('The type of ending required (e.g., "Twist", "Happy", "Ambiguous").'),
    language: z.string().optional().describe('The language of the script: "Spanish" or "English".'),
    userEmail: z.string().optional().describe('Email to send the script to.'),
    userName: z.string().optional().describe('Name of the user.'),
});

export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

export const GenerateVideoScriptOutputSchema = z.object({
    script: z.string().describe('The complete, formatted video script with scene headings, action lines, and dialogue.'),
});

export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

// ============================================
// CHARACTER ANALYSIS (Astrological Profiling)
// ============================================

export const AnalyzeCharacterInputSchema = z.object({
    scriptSegment: z.string().describe('The segment of the script or dialogue to analyze. Include all relevant character actions and dialogue.'),
    characterName: z.string().describe('The exact name of the character to analyze within the text.'),
    customKnowledge: z.array(z.object({
        target: z.string().describe('The astrological sign or concept this knowledge relates to.'),
        category: z.string().describe('The category of knowledge (e.g., "Psychology", "Archetype").'),
        value: z.string().describe('The key insight or attribute.'),
        description: z.string().describe('Detailed explanation of this knowledge.')
    })).optional().describe('Custom assimilated knowledge to refine the analysis.'),
});

export type AnalyzeCharacterInput = z.infer<typeof AnalyzeCharacterInputSchema>;

export const AnalyzeCharacterOutputSchema = z.object({
    sunSign: z.string().describe('REQUIRED. The estimated Sun Sign (one of: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces). This represents the character\'s core identity and ego.'),
    moonSign: z.string().describe('REQUIRED. The estimated Moon Sign based on emotional patterns, reactions under stress, and inner world. Choose from the 12 zodiac signs.'),
    ascendant: z.string().describe('REQUIRED. The estimated Ascendant/Rising Sign based on first impressions, physical mannerisms, and how others perceive them. Choose from the 12 zodiac signs.'),
    elements: z.object({
        fire: z.number().min(0).max(100).describe('REQUIRED. Percentage of Fire element (0-100). Fire = passion, initiative, impulsiveness.'),
        earth: z.number().min(0).max(100).describe('REQUIRED. Percentage of Earth element (0-100). Earth = practicality, stability, materialism.'),
        air: z.number().min(0).max(100).describe('REQUIRED. Percentage of Air element (0-100). Air = intellect, communication, detachment.'),
        water: z.number().min(0).max(100).describe('REQUIRED. Percentage of Water element (0-100). Water = emotion, intuition, sensitivity.'),
    }).describe('REQUIRED. The elemental balance of the character. All four must sum to 100.'),
    archetype: z.string().describe('REQUIRED. The Jungian or literary archetype (e.g., "The Rebel", "The Caregiver", "The Trickster", "The Shadow").'),
    essence: z.string().describe('REQUIRED. "Cristalización de Esencia" - A powerful, one-sentence alchemical aphorism that captures the character\'s core contradiction and psychological truth.'),
    analysis: z.string().describe('REQUIRED. A 2-3 sentence explanation of why these astrological placements perfectly capture this character\'s psychology and behavior.'),
    threePillars: z.object({
        sunReasoning: z.string().describe('REQUIRED. Answer to: "¿Cómo soy en esencia?" - What drives their ego, identity, and life purpose?'),
        moonReasoning: z.string().describe('REQUIRED. Answer to: "¿Cómo siento y cómo son mis emociones?" - How do they process feelings and find emotional security?'),
        ascendantReasoning: z.string().describe('REQUIRED. Answer to: "¿Cómo me modifica la vida?" - What mask do they wear? How do others first perceive them?'),
    }).describe('REQUIRED. The detailed reasoning for the Big Three placements based on specific psychological questions.'),
    methodActing: z.object({
        psychologicalGesture: z.string().describe('REQUIRED. A specific physical movement or posture that captures the character\'s inner essence (Chekhov technique). Example: "A clenched fist slowly opening".'),
        voiceQuality: z.string().describe('REQUIRED. Description of the voice including tempo (fast/slow), pitch (high/low), texture (rough/smooth), and rhythm (staccato/legato).'),
        animalTotem: z.string().describe('REQUIRED. An animal that represents the character\'s movement quality, instincts, and behavioral patterns. Example: "A hawk - patient, precise, suddenly explosive".'),
        physicalCenter: z.string().describe('REQUIRED. Where the character leads their movement from. Options: Head (intellectual), Heart/Chest (emotional), Solar Plexus (power), Pelvis (sensual/instinctual), Feet (grounded).'),
        emotionalLandscape: z.string().describe('REQUIRED. A vivid metaphor for their internal emotional world. Example: "A volcano with a frozen surface", "An endless ocean at night".'),
    }).describe('REQUIRED. Deep method acting keys for actor embodiment based on Stanislavski, Chekhov, and Meisner techniques.'),
});

export type AnalyzeCharacterOutput = z.infer<typeof AnalyzeCharacterOutputSchema>;

// ============================================
// DAILY ASTROLOGICAL READING
// ============================================

export const DailyReadingInputSchema = z.object({
    birthData: z.object({
        date: z.string().describe('REQUIRED. The user\'s birth date in ISO format (YYYY-MM-DD or full ISO string).'),
        city: z.string().optional().describe('The user\'s birth city for house calculations.'),
    }).describe('REQUIRED. The user\'s birth data for natal chart reference.'),
    aspects: z.array(z.object({
        planet1: z.string().describe('The transiting planet name (e.g., "Mars", "Venus").'),
        planet2: z.string().describe('The natal planet being aspected (e.g., "Sun", "Moon").'),
        type: z.string().describe('The aspect type (e.g., "Conjunction", "Square", "Trine", "Opposition", "Sextile").'),
        sign1: z.string().optional().describe('The zodiac sign of the transiting planet.'),
        sign2: z.string().optional().describe('The zodiac sign of the natal planet.'),
    })).describe('REQUIRED. List of current planetary transits making aspects to the user\'s natal chart.'),
    userName: z.string().optional().describe('The user\'s name for personalization.'),
});

export type DailyReadingInput = z.infer<typeof DailyReadingInputSchema>;

export const DailyReadingOutputSchema = z.object({
    headline: z.string().describe('REQUIRED. A mystical, evocative title for the daily reading (5-10 words). Use alchemical or esoteric language. Example: "El Fuego Interior Reclama su Trono".'),
    theme: z.string().describe('REQUIRED. The main energetic theme in 2-4 words. Example: "Transformación Profunda", "Claridad Mental", "Tensión Creativa".'),
    reading: z.string().describe('REQUIRED. A personalized, deep, and alchemical interpretation (150-250 words). Use second person ("tú"). Reference specific transits. Weave them into a coherent narrative about the day\'s energy. Avoid generic horoscope language. Be specific and psychological.'),
    advice: z.string().describe('REQUIRED. A cryptic but actionable piece of advice (1-2 sentences). Should feel like wisdom from an ancient teacher. Example: "No resistas el río; aprende a nadar con su corriente."'),
});

export type DailyReadingOutput = z.infer<typeof DailyReadingOutputSchema>;

// ============================================
// SYNASTRY ANALYSIS (Relationship Compatibility)
// ============================================

export const AnalyzeSynastryInputSchema = z.object({
    userBirthDate: z.string().describe('REQUIRED. The ISO date string of the user\'s birth (YYYY-MM-DD).'),
    targetBirthDate: z.string().describe('REQUIRED. The ISO date string of the target person/character\'s birth.'),
    targetName: z.string().describe('REQUIRED. The name of the target person or character being compared.'),
});

export type AnalyzeSynastryInput = z.infer<typeof AnalyzeSynastryInputSchema>;

export const AnalyzeSynastryOutputSchema = z.object({
    synastry_title: z.string().describe('REQUIRED. A poetic title for this alchemical combination. Example: "El Encuentro del Fuego y el Agua".'),
    phase1_survival_clash: z.object({
        title: z.string().describe('REQUIRED. Title for Phase 1: The survival/ego clash.'),
        description: z.string().describe('REQUIRED. 2-3 sentences describing the initial friction when these two energies meet.'),
        conflict_dynamic: z.string().describe('REQUIRED. The specific psychological conflict pattern between them.'),
        shadow_projection: z.string().describe('REQUIRED. What unconscious aspects each projects onto the other.'),
    }).describe('REQUIRED. FASE 1: El Choque de Mundos - The initial survival-level meeting of two different psychological worlds.'),
    phase2_friction_flow: z.object({
        title: z.string().describe('REQUIRED. Title for Phase 2: The dance of friction and flow.'),
        description: z.string().describe('REQUIRED. 2-3 sentences about how they learn to navigate each other.'),
        flow_mechanics: z.string().describe('REQUIRED. Where and how energy flows easily between them.'),
        friction_points: z.string().describe('REQUIRED. Where friction creates both heat and potential growth.'),
    }).describe('REQUIRED. FASE 2: La Fricción y el Flujo - The ongoing negotiation of energies.'),
    phase3_integration_bridge: z.object({
        title: z.string().describe('REQUIRED. Title for Phase 3: The potential for integration.'),
        description: z.string().describe('REQUIRED. 2-3 sentences about what this relationship can become at its highest expression.'),
        mission_statement: z.string().describe('REQUIRED. The evolutionary purpose of this connection.'),
        evolutionary_gift: z.string().describe('REQUIRED. What each person gains by integrating the other\'s energy.'),
    }).describe('REQUIRED. FASE 3: El Puente de Integración - The transcendent potential of the union.'),
    synchronization_exercise: z.object({
        title: z.string().describe('REQUIRED. A creative name for the synchronization ritual.'),
        step1: z.string().describe('REQUIRED. First step of the exercise.'),
        step2: z.string().describe('REQUIRED. Second step of the exercise.'),
        step3: z.string().describe('REQUIRED. Third step of the exercise.'),
        mantra: z.string().describe('REQUIRED. A shared mantra or affirmation for this pair.'),
    }).describe('REQUIRED. A practical exercise for deepening synchronization between these two energies.'),
});

export type AnalyzeSynastryOutput = z.infer<typeof AnalyzeSynastryOutputSchema>;

// ============================================
// CHARACTER REFINEMENT (Deep Psychological Analysis)
// ============================================

export const RefineCharacterInputSchema = z.object({
    name: z.string().describe('REQUIRED. The character name.'),
    currentProfile: z.object({
        sun: z.string().describe('Current Sun sign assignment.'),
        moon: z.string().describe('Current Moon sign assignment.'),
        ascendant: z.string().describe('Current Ascendant sign assignment.'),
    }).describe('REQUIRED. The current astrological profile to be refined.'),
    deepAnalysis: z.object({
        superObjective: z.string().optional().describe('The character\'s deepest desire or life goal.'),
        unsaid: z.string().optional().describe('Secrets, fears, and unspoken thoughts.'),
        emotions: z.string().optional().describe('Dominant emotional patterns.'),
        outcome: z.string().optional().describe('The character\'s arc or transformation.'),
    }).optional().describe('Deep psychological analysis data for refinement.'),
});

export type RefineCharacterInput = z.infer<typeof RefineCharacterInputSchema>;

export const RefineCharacterOutputSchema = z.object({
    suggestedSun: z.string().describe('REQUIRED. The refined Sun sign that better matches the deep analysis.'),
    suggestedMoon: z.string().describe('REQUIRED. The refined Moon sign that better matches emotional patterns.'),
    suggestedAscendant: z.string().describe('REQUIRED. The refined Ascendant that better matches external presentation.'),
    suggestedPlanets: z.object({
        Mercury: z.string().optional().describe('Suggested Mercury sign for communication style.'),
        Venus: z.string().optional().describe('Suggested Venus sign for love and values.'),
        Mars: z.string().optional().describe('Suggested Mars sign for action and drive.'),
    }).optional().describe('Additional planetary suggestions.'),
    verdict: z.string().describe('REQUIRED. A 2-3 sentence summary of the refinement rationale.'),
    adjective: z.string().describe('REQUIRED. A single powerful adjective that captures this character\'s essence.'),
});

export type RefineCharacterOutput = z.infer<typeof RefineCharacterOutputSchema>;

// ============================================
// KNOWLEDGE ASSIMILATION
// ============================================

export const AssimilateKnowledgeInputSchema = z.object({
    content: z.string().describe('REQUIRED. Raw text content to be assimilated (from PDF, manual input, etc).'),
});

export type AssimilateKnowledgeInput = z.infer<typeof AssimilateKnowledgeInputSchema>;

export const AssimilateKnowledgeOutputSchema = z.object({
    summary: z.string().describe('REQUIRED. A 1-2 sentence summary of what was learned.'),
    knowledge: z.array(z.object({
        target: z.string().describe('REQUIRED. The zodiac sign, planet, or astrological concept this applies to.'),
        category: z.string().describe('REQUIRED. Category: "Psychology", "Archetype", "Health", "Career", "Relationship", "Shadow", "Evolution".'),
        value: z.string().describe('REQUIRED. The key insight or attribute (brief).'),
        description: z.string().describe('REQUIRED. Detailed explanation of this knowledge (1-3 sentences).'),
    })).describe('REQUIRED. Array of structured knowledge items extracted from the content.'),
});

export type AssimilateKnowledgeOutput = z.infer<typeof AssimilateKnowledgeOutputSchema>;
// ============================================
// ALCHIMESTRY DEEP ANALYSIS
// ============================================

export const AlchimestryDeepAnalysisInputSchema = z.object({
    userName: z.string().describe('The name of the alchemist.'),
    birthData: z.string().describe('The birth date and time in ISO format.'),
    subject: z.string().describe('The specific planet or house being analyzed (e.g., "Sol", "Luna", "Casa 1").'),
    sign: z.string().optional().describe('The zodiac sign associated with the subject in your chart.'),
    context: z.string().optional().describe('Additional context about your chart or current life situation.'),
});

export type AlchimestryDeepAnalysisInput = z.infer<typeof AlchimestryDeepAnalysisInputSchema>;

export const AlchimestryDeepAnalysisOutputSchema = z.object({
    meditation: z.string().describe('A mystical and psychological meditation on the archetype (100-150 words).'),
    practicalWisdom: z.string().describe('A concrete piece of advice or ritual for integrating this energy into daily life.'),
    alchemicalKey: z.string().describe('A single powerful phrase or word that serves as a mantra for this placement.'),
});

export type AlchimestryDeepAnalysisOutput = z.infer<typeof AlchimestryDeepAnalysisOutputSchema>;
