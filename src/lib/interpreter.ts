import { Astro, Casa, Signo } from './astrologia';

/**
 * Función interpretativa que traduce combinaciones astrológicas a lenguaje sencillo y divertido.
 * 
 * Basado en la mecánica de: 
 * Personaje (Astro) + Escenario (Casa) + Modificador (Signo)
 */
export function interpretAstrology(astro: Astro, casa: Casa, signo: Signo): string {
    const { personalidad, capacidad, nombre: astroNombre } = astro;
    const { ambito, numero: casaNumero } = casa;
    const { adjetivo, nombre: signoNombre } = signo;

    // Lógica de construcción de frase:
    // "Un [personalidad] que [expresa su capacidad] en el [ámbito de la casa] de forma [adjetivo del signo]"

    // Casos especiales para que suene más natural
    let accion = capacidad.toLowerCase();
    let escenario = ambito.toLowerCase();

    // Reemplazos de conectores comunes para fluidez
    if (accion.includes(' y ')) {
        const parts = accion.split(' y ');
        accion = `${parts[0]} con ${parts[1]}`;
    }

    const frasesMap: Record<string, string> = {
        'marte-casa-4-cancer': 'Un guerrero que protege el hogar con sensibilidad',
        'venus-casa-2-tauro': 'Una amante que valora sus recursos con estabilidad y disfrute',
        'mercurio-casa-10-aries': 'Un mensajero que comunica su vocación de forma directa y audaz'
    };

    const key = `${astro.id}-${casa.id}-${signo.id}`;
    if (frasesMap[key]) return frasesMap[key];

    // Generador genérico proactivo
    const articulos: Record<string, string> = {
        'Marte': 'Un',
        'Venus': 'Una',
        'Mercurio': 'Un',
        'Luna': 'Una',
        'Sol': 'Un',
        'Saturno': 'Un',
        'Júpiter': 'Un'
    };

    const articulo = articulos[astroNombre] || 'Un/a';

    return `${articulo} ${personalidad.toLowerCase()} que manifiesta su ${accion} en el área de ${escenario}, actuando de manera ${adjetivo.toLowerCase()}.`;
}
