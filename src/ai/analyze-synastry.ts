'use server';

import { AnalyzeSynastryInput, AnalyzeSynastryOutput } from './schemas';
import { getSignFromLongitude } from '@/utils/astronomy';
import { calculateRobustChart } from '@/utils/astronomy-robust';

export async function analyzeSynastry(input: AnalyzeSynastryInput): Promise<AnalyzeSynastryOutput> {
    const { userBirthDate, targetBirthDate, targetName } = input;

    // 1. GENERATE RICH ASTRONOMICAL DATA (ROBUST ENGINE)
    const getData = (dateStr: string, name: string) => {
        const d = new Date(dateStr);
        const chart = calculateRobustChart(d, 40.4168, -3.7038);

        const p = (n: string) => chart.planets.find(x => x.name === n);
        const sun = p('Sol');
        const moon = p('Luna');
        const ascSign = getSignFromLongitude(chart.ascendant);

        const counts = { Fuego: 0, Tierra: 0, Aire: 0, Agua: 0 };
        chart.planets.forEach(pl => {
            const s = getSignFromLongitude(pl.longitude);
            const elMap: Record<string, string> = {
                'Aries': 'Fuego', 'Leo': 'Fuego', 'Sagitario': 'Fuego',
                'Tauro': 'Tierra', 'Virgo': 'Tierra', 'Capricornio': 'Tierra',
                'Géminis': 'Aire', 'Libra': 'Aire', 'Acuario': 'Aire',
                'Cáncer': 'Agua', 'Escorpio': 'Agua', 'Piscis': 'Agua'
            };
            const el = elMap[s] || 'Fuego';
            counts[el as keyof typeof counts]++;
        });
        const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

        return {
            name,
            sunSign: getSignFromLongitude(sun?.longitude || 0),
            moonSign: getSignFromLongitude(moon?.longitude || 0),
            ascSign,
            domElem: dom
        };
    };

    const c1 = getData(userBirthDate, "Usuario");
    const c2 = getData(targetBirthDate, targetName);

    // 2. DETERMINISTIC ANALYSIS ALGORITHM (NO EXTERNAL AI)
    // We construct the response based on Elemental Alchemy to ensure it works 100%.

    const elements = {
        "Fuego": { keywords: "Voluntad, Pasión, Impulso", shadow: "Ira, Impaciencia" },
        "Tierra": { keywords: "Estabilidad, Realidad, Cuerpo", shadow: "Rigidez, Materialismo" },
        "Aire": { keywords: "Mente, Comunicación, Visión", shadow: "Disociación, Frialdad" },
        "Agua": { keywords: "Emoción, Fusión, Memoria", shadow: "Drama, Dependencia" }
    };

    const elem1 = c1.domElem as keyof typeof elements;
    const elem2 = c2.domElem as keyof typeof elements;

    let synergyType = "";
    if (elem1 === elem2) synergyType = "ESPEJO RESONANTE";
    else if ((elem1 === 'Fuego' && elem2 === 'Aire') || (elem1 === 'Aire' && elem2 === 'Fuego') || (elem1 === 'Tierra' && elem2 === 'Agua') || (elem1 === 'Agua' && elem2 === 'Tierra')) synergyType = "COMPLEMENTARIEDAD FÉRTIL";
    else synergyType = "FRICCIÓN EVOLUTIVA";

    // Deterministic Text Generation for METHOD ACTING / POSSESSION
    const output: AnalyzeSynastryOutput = {
        synastry_title: `PROTOCOLO DE POSESIÓN: ${c1.sunSign.toUpperCase()} + ${c2.sunSign.toUpperCase()}`,
        phase1_survival_clash: {
            title: "EL CHOQUE DE CUERPOS (BIOLOGÍA)",
            description: `Tu biología (${elem1}) se resiste a la frecuencia invasora de ${targetName} (${elem2}). No es un diálogo, es una transfusión de sangre.`,
            conflict_dynamic: `Tu nervio central opera en modo ${c1.sunSign}, pero el personaje exige encarnar ${c2.sunSign}. El síntoma físico de este rechazo será tensión o falta de aire.`,
            shadow_projection: `Lo que te irrita del personaje ("${elements[elem2].shadow.split(',')[0]}") es la llave de entrada. No lo juzgues; cómetelo.`
        },
        phase2_friction_flow: {
            title: "LA FRICCIÓN NERVIOSA (PSIQUE)",
            description: `Tu Luna en ${c1.moonSign} lucha por mantener el control, pero la Luna en ${c2.moonSign} del personaje exige caos y rendición.`,
            flow_mechanics: `Para habitar su piel, debes anestesiar tu deseo de ${elements[elem1].keywords.split(',')[1]} y someterte a su obsesión por ${elements[elem2].keywords.split(',')[1]}.`,
            friction_points: `Aquí duele: Tu ${c1.domElem} se está quemando para alimentar la hoguera de su ${c2.domElem}.`
        },
        phase3_integration_bridge: {
            title: "LA POSESIÓN (ESPÍRITU)",
            description: "Has dejado de actuar. Ahora eres un vehículo vacío. El personaje te respira.",
            mission_statement: `Sostener la vibración de ${c2.sunSign} en tu cuerpo sin colapsar tu sistema nervioso.`,
            evolutionary_gift: `Al permitir esta posesión, tu rango actoral ha devorado la esencia de ${elem2}.`
        },
        synchronization_exercise: {
            title: "RITUAL DE ENTRADA AL CUERPO",
            step1: "Cierra los ojos. Expulsa tu energía personal por los pies.",
            step2: `Inhalas la cualidad densa/ligera de ${c2.domElem}. Deja que deforme tu postura.`,
            step3: "Camina por la habitación. No eres tú. Eres Eso.",
            mantra: `"Mi cuerpo es el altar. ${targetName} es el fuego."`
        }
    };

    // Return immediately - Simulating AI speed but with instant deterministic result
    return output;
}
