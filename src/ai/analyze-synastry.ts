'use server';

import { ai, safeGenerate } from './genkit';
import { AnalyzeSynastryInput, AnalyzeSynastryOutput, AnalyzeSynastryOutputSchema } from './schemas';
import { getSignFromLongitude, calculateRealPlanets } from '@/utils/astronomy';
import { QUANTUM_SYNASTRY_PROMPT } from './system-prompt';

export async function analyzeSynastry(input: AnalyzeSynastryInput): Promise<AnalyzeSynastryOutput> {
    const { sourceBirthDate, sourceName, targetBirthDate, targetName } = input;

    // 1. GENERATE RICH ASTRONOMICAL DATA
    const getData = (dateStr: string, name: string) => {
        const chart = calculateRealPlanets(dateStr);
        const p = (n: string) => chart.planets.find(x => x.name === n);
        const sun = p('Sol');
        const moon = p('Luna');
        const mercury = p('Mercurio');
        const venus = p('Venus');
        const mars = p('Marte');
        const saturn = p('Saturno');
        const pluto = p('Plutón');

        const ascSign = getSignFromLongitude(chart.ascendant);

        return {
            name,
            sunSign: getSignFromLongitude(sun?.longitude || 0),
            moonSign: getSignFromLongitude(moon?.longitude || 0),
            mercurySign: getSignFromLongitude(mercury?.longitude || 0),
            venusSign: getSignFromLongitude(venus?.longitude || 0),
            marsSign: getSignFromLongitude(mars?.longitude || 0),
            saturnSign: getSignFromLongitude(saturn?.longitude || 0),
            plutoSign: getSignFromLongitude(pluto?.longitude || 0),
            ascSign
        };
    };

    const c1 = getData(sourceBirthDate, sourceName);
    const c2 = getData(targetBirthDate, targetName);

    const userPrompt = `
    PERSONA A (BASE): ${c1.name}
    PLACA SOLAR: ${c1.sunSign}
    PLACA LUNAR: ${c1.moonSign}
    ASCENDENTE: ${c1.ascSign}
    MERCURIO: ${c1.mercurySign}
    VENUS: ${c1.venusSign}
    MARTE: ${c1.marsSign}
    SATURNO: ${c1.saturnSign}
    PLUTÓN: ${c1.plutoSign}

    PERSONA B (OBJETIVO): ${c2.name}
    PLACA SOLAR: ${c2.sunSign}
    PLACA LUNAR: ${c2.moonSign}
    ASCENDENTE: ${c2.ascSign}
    MERCURIO: ${c2.mercurySign}
    VENUS: ${c2.venusSign}
    MARTE: ${c2.marsSign}
    SATURNO: ${c2.saturnSign}
    PLUTÓN: ${c2.plutoSign}

    TAREA: Genera un análisis de SINERGIA DE ALMAS CLARO Y COMPLETO.
    - Sigue el ROL de Alchemistery.
    - Usa un tono profundo pero extremadamente claro y útil.
    - Explica la dinámica de poder y crecimiento entre estas dos configuraciones.
    - No uses clichés de horóscopo. Habla de mecanismos psíquicos.
    `;

    const fallback: AnalyzeSynastryOutput = {
        synastry_title: `Sinergia Alquímica: ${sourceName} + ${targetName}`,
        phase1_survival_clash: {
            title: "EL CHOQUE DE ESTRATEGIAS",
            description: `La energía de ${c1.ascSign} se encuentra con ${c2.ascSign}. Es un encuentro de dos formas distintas de ver el mundo.`,
            conflict_dynamic: `Posible fricción entre la necesidad de control y la búsqueda de expansión.`,
            shadow_projection: `Cada uno proyecta en el otro lo que más le cuesta integrar de su propia sombra.`
        },
        phase2_friction_flow: {
            title: "DANZA DE ELEMENTOS",
            description: `A nivel psíquico, ${c1.sunSign} intenta dialogar con ${c2.sunSign}.`,
            flow_mechanics: `La comunicación fluye cuando ambos se permiten ser vulnerables.`,
            friction_points: `El reto está en aprender a respetar los tiempos emocionales del otro.`
        },
        phase3_integration_bridge: {
            title: "PUENTE HACIA LA UNIDAD",
            description: "Esta relación tiene el potencial de catalizar un gran crecimiento.",
            mission_statement: "Aprender a integrar las polaridades opuestas.",
            evolutionary_gift: "Mayor conciencia sobre los propios puntos ciegos."
        },
        synchronization_exercise: {
            title: "RITUAL DE SINTONIZACIÓN",
            step1: "Inhalen juntos manteniendo el contacto visual por 1 minuto.",
            step2: "Compartan un miedo que rara vez expresen.",
            step3: "Afirmen el potencial de crecimiento mutuo.",
            mantra: "Somos espejos de una misma luz."
        }
    };

    try {
        const response = await safeGenerate(
            () => ai.generate({
                model: 'googleai/gemini-flash-latest',
                system: QUANTUM_SYNASTRY_PROMPT,
                prompt: userPrompt,
                output: { schema: AnalyzeSynastryOutputSchema }
            }),
            fallback,
            `Synastry: ${sourceName} vs ${targetName}`
        );
        return response;
    } catch (e) {
        console.error("[Synastry] Error:", e);
        return fallback;
    }
}
