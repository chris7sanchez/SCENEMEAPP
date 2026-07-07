'use server';

import { DailyReadingInput, DailyReadingOutput } from './schemas';

// ============================================
// DAILY READING — Lenguaje NORMAL / terrenal
// ============================================
// Determinista: mismo día → mismo texto. Sin jerga, sin grandilocuencia,
// sin clichés de horóscopo. Cada tránsito explicado para cualquiera + un
// consejo práctico. (Antes lo escribía la IA en tono florido; el usuario
// pidió expresamente lenguaje normal.)

// Qué mueve el planeta EN TRÁNSITO (nombres en español, como los da el motor)
const PT: Record<string, string> = {
    'Sol': 'tu vitalidad',
    'Luna': 'tu ánimo',
    'Mercurio': 'tu mente',
    'Venus': 'tu lado afectivo',
    'Marte': 'tu empuje',
    'Júpiter': 'tus ganas de crecer',
    'Saturno': 'tu disciplina',
    'Urano': 'tu necesidad de cambio',
    'Neptuno': 'tu sensibilidad',
    'Plutón': 'tu lado más profundo',
    'Nodo Norte': 'tu rumbo',
};

// Qué zona tuya toca el planeta NATAL
const PN: Record<string, string> = {
    'Sol': 'quién eres',
    'Luna': 'cómo te sientes',
    'Mercurio': 'cómo piensas',
    'Venus': 'tus relaciones',
    'Marte': 'cómo actúas',
    'Júpiter': 'tus planes',
    'Saturno': 'tus responsabilidades',
    'Urano': 'tu libertad',
    'Neptuno': 'tus sueños',
    'Plutón': 'tu poder personal',
    'Ascendente': 'tu imagen ante los demás',
    'Nodo Norte': 'tu rumbo',
};

// Tono del aspecto (tipos en inglés, como los da el motor)
const TONE: Record<string, string> = {
    'Conjunción': 'se juntan y se potencian',
    'Oposición': 'tiran cada uno hacia su lado',
    'Cuadratura': 'chocan y se nota la tensión',
    'Trígono': 'encajan y fluyen sin esfuerzo',
    'Sextil': 'se dan una pequeña oportunidad',
    'Quincuncio': 'no terminan de encajar y piden ajuste',
    'Semi-sextil': 'se rozan, con un matiz suave',
};

const TIP: Record<string, string> = {
    'Conjunction': 'Aprovecha el empujón, sin pasarte de intensidad.',
    'Opposition': 'Busca el punto medio en vez de irte a un extremo.',
    'Square': 'Usa la tensión para empujar, no para discutir.',
    'Trine': 'Buen día para dar ese paso que tenías pendiente.',
    'Sextile': 'Si la buscas, la oportunidad aparece; si no, pasa de largo.',
};

const TITLE: Record<string, string> = {
    'Conjunction': 'Foco intenso',
    'Opposition': 'Busca el equilibrio',
    'Square': 'Empuje con resistencia',
    'Trine': 'Día que fluye',
    'Sextile': 'Puerta abierta',
};

export async function generateDailyReading(input: DailyReadingInput): Promise<DailyReadingOutput> {
    const { aspects, userName } = input;
    const greeting = userName ? `${userName}, ` : '';

    // Orden estable: planetas lentos (más importantes) primero
    const weightOrder = ['Luna', 'Sol', 'Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'];
    const w = (p: string) => { const i = weightOrder.indexOf(p); return i === -1 ? 99 : i; };
    const sorted = (aspects || [])
        .filter(a => a?.planet1 !== 'Nodo Norte')
        .sort((a, b) => Math.min(w(a.planet1), w(a.planet2)) - Math.min(w(b.planet1), w(b.planet2)));

    const make = (a: any) => {
        const pt = PT[a?.planet1] || 'su energía';
        const pn = PN[a?.planet2] || (a?.planet2 || 'tu carta');
        const tone = TONE[a?.type] || 'se conectan';
        const tip = TIP[a?.type] || 'Obsérvalo y úsalo a tu favor.';
        const title = TITLE[a?.type] || 'Tránsito del día';
        return {
            headline: title,
            theme: title,
            reading: `Hoy se cruzan ${pt} y ${pn}: ${tone}.`,
            advice: tip,
            planetSource: `${a?.planet1 || '?'} → ${a?.planet2 || '?'}`,
        };
    };

    const efluvios = sorted.map(make);

    const primary = efluvios[0] ?? {
        headline: 'Día tranquilo',
        theme: 'Sin tránsitos fuertes',
        reading: `${greeting}hoy no hay tránsitos fuertes: un día sin grandes empujones. Aprovéchalo para lo de siempre.`,
        advice: 'Sigue a tu ritmo.',
    };

    return {
        headline: primary.headline,
        theme: primary.theme,
        reading: primary.reading,
        advice: primary.advice,
        efluvios,
    };
}
