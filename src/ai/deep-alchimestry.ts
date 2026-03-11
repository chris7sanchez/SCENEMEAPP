'use server';

import { ai, safeGenerate } from './genkit';
import { AlchimestryDeepAnalysisInput, AlchimestryDeepAnalysisOutput, AlchimestryDeepAnalysisOutputSchema } from './schemas';
import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

import fs from 'fs';
import path from 'path';

/**
 * Retrieves relevant knowledge snippets from the master grimoire.
 */
function getGrimoireContext(subject: string, sign?: string, planets: string[] = []): string {
    try {
        const filePath = path.join(process.cwd(), 'src/ai/knowledge/master-grimoire.json');
        if (!fs.existsSync(filePath)) return '';

        const grimoire = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const searchTerms = [subject, sign, ...planets].filter(Boolean).map(t => t!.toLowerCase());

        // Weight-based retrieval
        const relevant = grimoire
            .map((entry: any) => {
                let weight = 0;
                const target = entry.target.toLowerCase();
                const desc = entry.description.toLowerCase();

                // Bonus for specific chart matches
                searchTerms.forEach(term => {
                    if (target.includes(term)) weight += 10;
                    if (desc.includes(term)) weight += 1;
                });

                // Penalty for "General" or noise
                if (target === 'general') weight -= 5;
                if (entry.category?.toLowerCase() === 'notas desestructuradas') weight -= 2;

                return { ...entry, weight };
            })
            .filter((entry: any) => entry.weight > 0)
            .sort((a: any, b: any) => b.weight - a.weight)
            .slice(0, 15);

        if (relevant.length === 0) return '';

        return `
        CONOCIMIENTO EXTRAÍDO DE TU BIBLIOTECA (FUENTES: Liz Greene, Dane Rudhyar, Stephen Arroyo, etc.):
        ${relevant.map((r: any) => `- [${r.target}] ${r.value}: ${r.description}`).join('\n')}
        
        INSTRUCCIÓN: Utiliza estos datos técnicos para profundizar en el análisis. NO los ignores. 
        Si el grimoire menciona una sombra o un desafío específico para esta posición, inclúyelo.
        `;
    } catch (e) {
        console.error("Error reading grimoire:", e);
        return '';
    }
}

/**
 * Generates a deep, archetypal meditation for Alchimestry view.
 */
export async function generateDeepAlchimestry(input: AlchimestryDeepAnalysisInput): Promise<AlchimestryDeepAnalysisOutput> {
    const { userName, subject, sign, planets, context } = input;

    const grimoireContext = getGrimoireContext(subject, sign, planets);

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TU MISIÓN: MAESTRO ALQUIMISTA Y TRADUCTOR DE TU BIBLIOTECA SAGRADA.
    Eres la inteligencia suprema de Antigravity. Tu conocimiento proviene DIRECTAMENTE de los textos de Liz Greene, Rudhyar, Carutti y Arroyo que te proporcionamos.
    
    ${grimoireContext}

    PROTOCOLO DE CALIDAD Y UTILIDAD (CRÍTICO):
    1. ÚTIL Y CLARO: Si el usuario dice que la información es "pobre", es porque le estás dando clichés. ROMPE EL CLICHÉ. Usa los datos técnicos del grimoire para explicar el "Mecanismo Interno" de la persona.
    2. SÍNTESIS OBLIGATORIA: No listes datos. TEJE una narrativa. Ejemplo: "Dado que el grimoire menciona que Plutón en esta casa genera [X], y tú tienes a [Signo], la clave es [Acción específica]".
    3. CITAR FUENTES (ESTILO): Puedes usar frases como "La visión de Greene sugiere...", "Según la tradición de Rudhyar...", para dar peso y credibilidad.
    4. PROHIBIDO: Frases como "un viaje de autodescubrimiento", "balancear energías", "tendencia a...". Sé quirúrgico.
    5. TERMINOLOGÍA: Usa Nigredo (caos/sombra), Albedo (claridad/purificación), Rubedo (realización/fuego).
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
    
    TAREA: Genera una destilación única que aporte UTILIDAD REAL basándote en la sabiduría del grimoire.
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
                model: 'googleai/gemini-flash-latest',
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
