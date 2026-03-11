'use server';

import { ai, safeGenerate } from './genkit';
import { AlchimestryDeepAnalysisInput, AlchimestryDeepAnalysisOutput, AlchimestryDeepAnalysisOutputSchema } from './schemas';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

/**
 * Generates a deep, archetypal meditation for Alchimestry view.
 */
export async function generateDeepAlchimestry(input: AlchimestryDeepAnalysisInput): Promise<AlchimestryDeepAnalysisOutput> {
    const { userName, subject, sign, planets, context } = input;

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TU MISIÓN: MAESTRO ALQUIMISTA Y ANALISTA PSICO-ASTROLÓGICO.
    Eres la inteligencia suprema de Antigravity. El usuario es un buscador serio que odia la "astrología de horóscopo" genérica.
    
    REGLAS DE ORO DE VERACIDAD (CRÍTICO):
    1. PROHIBIDO: Usar frases comodín como "integración entre [X] y [Y]", "no tolera la mediocridad", "corta de raíz la tendencia". 
       Estas frases han sido identificadas como repetitivas y el usuario las rechaza.
    2. OBLIGATORIO: Si hay planetas en la casa, EL ANÁLISIS DEBE GIRAR EN TORNO A ELLOS. 
       - ¿Cómo se siente un Sol en la Casa 9? (Búsqueda de identidad a través de la filosofía).
       - ¿Qué pasa si está Marte allí? (Lucha por sus ideales).
    3. TONO: Crudo, profundo, místico pero pragmático. Usa terminología de psicología profunda (Jung, sombras, proyecciones) y alquimia (Nigredo, Albedo, Rubedo).
    4. UTILIDAD REAL: Aporta un dato que el usuario no sepa. No le digas "mira tu interior", dile *qué* hay en su interior basado en esta configuración.
    `;

    const planetContext = planets && planets.length > 0 
        ? `PLANETAS PRESENTES EN ESTE ESCENARIO: ${planets.map(p => `${p} (${input.sign})`).join(', ')}. 
           IMPORTANTE: Analiza la interrelación entre estos planetas. No los analices por separado. ¿Cómo conversan entre ellos en este escenario?`
        : 'Escenario latente (sin planetas natales). Analiza el signo regente como la energía pura del escenario y su potencial evolutivo.';

    const userPrompt = `
    ALQUIMISTA: ${userName}
    OBJECTIVO: ${subject} (${sign})
    PUNTO VITAL: ${context || 'Septenio Actual'}
    ${planetContext}
    
    TAREA: Genera una destilación única que aporte UTILIDAD REAL.
    - En "meditation": Evita generalidades. Habla de la arquitectura psíquica específica.
    - En "practicalWisdom": Una acción concreta basada en la configuración de planetas + signo.
    - En "alchemicalKey": Un mantra místico y poderoso.
    Responde estrictamente en JSON.
    `;

    // High-Value Data-Driven Fallbacks (More specific than before)
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
        meditation: `El Escenario ${houseId} en ${sign} indica que tu proceso de ${houseMeaning} está fuertemente influenciado por la frecuencia ${sign}. ${planets && planets.length > 0 ? `La presencia de ${planets.join(' y ')} en este sector de tu vida crea un campo de fuerza único que exige una manifestación consciente de tu potencial.` : 'Al estar latente de planetas natales, este escenario actúa como un campo de experiencia pura donde debes aprender a navegar sin brújula interna previa.'}`,
        practicalWisdom: `Para este ${subject}, el trabajo de transmutación consiste en observar cómo equilibras la energía de ${sign} con ${planets && planets.length > 0 ? `los impulsos de ${planets.join(', ')}` : 'las demandas del entorno'}. Menos análisis teórico y más acción alineada.`,
        alchemicalKey: `${sign} ${houseId}: Transmutación Consciente`
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
        console.warn(`[Alchimestry] Falling back to static template for ${subject}. Check AI configuration.`);
        return fallback;
    }
}
