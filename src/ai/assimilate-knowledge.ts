'use server';

import { ai, safeGenerate } from './genkit';
import { AssimilateKnowledgeInputSchema, AssimilateKnowledgeOutputSchema } from './schemas';
import { z } from 'genkit';

// ============================================
// KNOWLEDGE ASSIMILATION v2.0
// ============================================
// Converts raw text (PDFs, notes) into structured astrological knowledge

type AssimilateKnowledgeInput = z.infer<typeof AssimilateKnowledgeInputSchema>;
type AssimilateKnowledgeOutput = z.infer<typeof AssimilateKnowledgeOutputSchema>;

/**
 * Assimilates raw text into structured astrological knowledge entries.
 * Uses AI for intelligent extraction with deterministic fallback.
 */
export async function assimilateKnowledge(input: AssimilateKnowledgeInput): Promise<AssimilateKnowledgeOutput> {
    const { content } = input;

    const systemPrompt = `
    ROL: Maestro Exégeta de Astrología Psicológica y Evolutiva.
    TAREA: Extraer la "médula" y el conocimiento profundo de textos de autores como Liz Greene, Carutti o Rudhyar.
    IDIOMA: Español.
    
    REQUISITO CRÍTICO: "MENOS ES MÁS EN CANTIDAD, PERO MÁS ES MEJOR EN PROFUNDIDAD."
    
    INSTRUCCIONES:
    1. ANALIZA el texto buscando revelaciones sobre la SOMBRA, el PROPÓSITO EVOLUTIVO y la DINÁMICA PSÍQUICA.
    
    2. CALIDAD DE LA SALIDA:
       - Target: Debe ser el planeta, signo o casa específico (ej: "Luna en Escorpio", "Casa 8", "Saturno").
       - Value: Un título o concepto clave que defina la revelación (ej: "La herida de la orfandad psíquica").
       - Description: Un párrafo denso, rico y místico-psicológico. Captura la VOZ del autor. No resumas, destila la esencia.
    
    3. FILTRO DE RUIDO: Ignora bibliografías, prefacios, agradecimientos o contenido puramente descriptivo.
    
    4. MAPEO DE TARGETS:
       - Sé muy específico. "Sol en Casa 12" es mejor que "Sol".
       - Si el texto habla de una configuración específica, ese es el Target.
    `;

    const userPrompt = `
    FRAGMENTO DE MANUSCRITO SAGRADO:
    """
    ${content.substring(0, 20000)}
    """
    
    EXTRAE LA ESENCIA AHORA. SÉ PROFUNDO, NO SUPERFICIAL. En español.
    `;

    // Fallback using deterministic parser
    const fallback = fallbackDeterministicAssimilation(content);

    return await safeGenerate(
        () => ai.generate({
            model: 'googleai/gemini-flash-latest',
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AssimilateKnowledgeOutputSchema }
        }),
        fallback,
        'Knowledge Assimilation'
    );
}

/**
 * Deterministic fallback parser for when AI is unavailable.
 * Extracts structure from tables, key-value pairs, and headings.
 */
function fallbackDeterministicAssimilation(text: string): AssimilateKnowledgeOutput {
    const knowledge: Array<{
        target: string;
        category: string;
        value: string;
        description: string;
    }> = [];

    const lines = text.split('\n');
    let currentTarget = "General";

    // Sign name normalization
    const signNormalize: Record<string, string> = {
        'aries': 'Aries', 'taurus': 'Tauro', 'tauro': 'Tauro',
        'gemini': 'Géminis', 'géminis': 'Géminis',
        'cancer': 'Cáncer', 'cáncer': 'Cáncer',
        'leo': 'Leo',
        'virgo': 'Virgo',
        'libra': 'Libra',
        'scorpio': 'Escorpio', 'escorpio': 'Escorpio',
        'sagittarius': 'Sagitario', 'sagitario': 'Sagitario',
        'capricorn': 'Capricornio', 'capricornio': 'Capricornio',
        'aquarius': 'Acuario', 'acuario': 'Acuario',
        'pisces': 'Piscis', 'piscis': 'Piscis'
    };

    lines.forEach(line => {
        const clean = line.trim();
        if (!clean || clean.length < 3) return;

        // Detect Sign Headings
        const signPattern = /^(Aries|Taur[ou]s?|Géminis|Gemini|Cáncer|Cancer|Leo|Virgo|Libra|Escorpio|Scorpio|Sagitario|Sagittarius|Capricornio|Capricorn|Acuario|Aquarius|Piscis|Pisces)/i;
        const signMatch = clean.match(signPattern);

        if (signMatch && clean.length < 50) {
            const normalized = signNormalize[signMatch[1].toLowerCase()];
            if (normalized) {
                currentTarget = normalized;
                return;
            }
        }

        // Detect Table Row (Separator | )
        if (clean.includes('|')) {
            const parts = clean.split('|').map(s => s.trim()).filter(s => s);
            if (parts.length >= 2) {
                knowledge.push({
                    target: signNormalize[parts[0].toLowerCase()] || parts[0] || currentTarget,
                    category: "Atributos Generales",
                    value: parts[1],
                    description: parts.slice(2).join(' ') || "Extraído de tabla"
                });
            }
        }
        // Detect Colon Key: Value
        else if (clean.includes(':') && !clean.startsWith('http')) {
            const colonIndex = clean.indexOf(':');
            const key = clean.substring(0, colonIndex).trim();
            const val = clean.substring(colonIndex + 1).trim();

            if (key && val && key.length < 50 && val.length < 200) {
                knowledge.push({
                    target: currentTarget,
                    category: key,
                    value: val.substring(0, 100),
                    description: val.length > 100 ? val : "Extracción de entrada manual"
                });
            }
        }
        // Detect bullet points or dashes
        else if (clean.startsWith('-') || clean.startsWith('•') || clean.startsWith('*')) {
            const content = clean.substring(1).trim();
            if (content.length > 5 && content.length < 200) {
                knowledge.push({
                    target: currentTarget,
                    category: "Nota",
                    value: content.substring(0, 50),
                    description: content
                });
            }
        }
    });

    // Ensure at least one entry
    if (knowledge.length === 0) {
        const preview = text.substring(0, 200).replace(/\n/g, ' ').trim();
        knowledge.push({
            target: "General",
            category: "Notas Desestructuradas",
            value: "Fragmento de Texto",
            description: preview + (text.length > 200 ? '...' : '')
        });
    }

    const uniqueTargets = [...new Set(knowledge.map(k => k.target))];

    return {
        summary: `Asimilación Determinista: ${knowledge.length} entradas extraídas para ${uniqueTargets.length} objetivo(s): ${uniqueTargets.slice(0, 5).join(', ')}${uniqueTargets.length > 5 ? '...' : ''}.`,
        knowledge: knowledge.slice(0, 50)
    };
}
