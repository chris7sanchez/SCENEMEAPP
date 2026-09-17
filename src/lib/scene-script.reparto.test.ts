// Lo que un guion trae y no es diálogo: imprenta, silencios y pies compartidos.
// Y el problema de que la misma persona aparezca escrita de cuatro maneras.

import { describe, it, expect } from 'vitest';
import {
    parseScriptScenes, parseScriptTurns, speakersOfScenes, NARRADOR,
    esDe, vozDeTurno, censoDeReparto, aplicarAlias, parejasEnEscena, PAUSA_BEAT_MS,
} from './scene-script';
import { claveDePersonaje, partirConjunto, distancia, dudasDeReparto, claveDuda } from './personajes';

describe('transiciones y muletillas de página', () => {
    const GUION_SUCIO = [
        '1. INT. COCINA - NOCHE',
        '',
        'ANA',
        '¿Y ahora qué?',
        '',
        'CONTINUED:',
        '',
        'LUIS',
        'Ahora nada.',
        '',
        '12.',
        '',
        'CORTE A:',
        '',
        '2. EXT. CALLE - DÍA',
        '',
        'ANA',
        'Pues eso.',
        '',
        'FUNDIDO A NEGRO',
        '',
        'FIN',
    ].join('\n');

    it('CONTINUED, el número de página y el fundido no son personajes', () => {
        expect(speakersOfScenes(parseScriptScenes(GUION_SUCIO))).toEqual(['ANA', 'LUIS']);
    });

    it('tampoco se las lee el narrador', () => {
        expect(parseScriptTurns(GUION_SUCIO).filter(t => t.kind !== 'dialogo')).toEqual([]);
    });

    it('una transición corta el diálogo, no se le pega al que hablaba', () => {
        const dialogo = parseScriptTurns(GUION_SUCIO).filter(t => t.kind === 'dialogo');
        expect(dialogo.map(t => [t.speaker, t.text])).toEqual([
            ['ANA', '¿Y ahora qué?'],
            ['LUIS', 'Ahora nada.'],
            ['ANA', 'Pues eso.'],
        ]);
    });

    it('no confunde prosa de acción con una transición', () => {
        // "corta a" en minúsculas es una frase, no un corte de montaje.
        const turnos = parseScriptTurns('Ana corta a lo bruto la cebolla.');
        expect(turnos.map(t => [t.kind, t.speaker, t.text])).toEqual([
            ['accion', NARRADOR, 'Ana corta a lo bruto la cebolla.'],
        ]);
    });

    it('«Sigue.» dicho por un personaje es diálogo, no una muletilla', () => {
        expect(parseScriptTurns('ANA: Sigue.\nLUIS: No puedo.').map(t => t.text))
            .toEqual(['Sigue.', 'No puedo.']);
    });

    it('«(MORE)» y «(CONTINUED)» entre paréntesis tampoco se leen', () => {
        const turnos = parseScriptTurns('ANA: Una cosa.\n(MORE)\nANA: Y otra.');
        expect(turnos.map(t => [t.kind, t.text])).toEqual([
            ['dialogo', 'Una cosa.'],
            ['dialogo', 'Y otra.'],
        ]);
    });
});

describe('(beat): un silencio, no una palabra', () => {
    it('no lo lee el narrador; se convierte en pausa del turno anterior', () => {
        const turnos = parseScriptTurns('ANA: Espera.\n(beat)\nANA: Ya no importa.');
        expect(turnos.map(t => [t.kind, t.text])).toEqual([
            ['dialogo', 'Espera.'],
            ['dialogo', 'Ya no importa.'],
        ]);
        expect(turnos[0].pausaMs).toBe(PAUSA_BEAT_MS);
        expect(turnos[1].pausaMs).toBeUndefined();
    });

    it('un beat en mitad de la frase parte el diálogo y deja el silencio en medio', () => {
        const turnos = parseScriptTurns('LUIS: No lo sé. (beat) Puede que sí.');
        expect(turnos.map(t => t.text)).toEqual(['No lo sé.', 'Puede que sí.']);
        expect(turnos[0].pausaMs).toBe(PAUSA_BEAT_MS);
    });

    it('«(larga pausa)» sí la lee el narrador: eso es una indicación de verdad', () => {
        const turnos = parseScriptTurns('ANA: Dime.\n(larga pausa)\nANA: Lo que sea.');
        expect(turnos.map(t => [t.kind, t.text])).toEqual([
            ['dialogo', 'Dime.'],
            ['acotacion', 'larga pausa'],
            ['dialogo', 'Lo que sea.'],
        ]);
    });
});

describe('dos personajes que hablan a la vez', () => {
    const CORO = [
        'ANA: ¿Vamos?',
        'LUIS: Vamos.',
        'ANA Y LUIS (AL UNÍSONO): ¡Ya era hora!',
        'ANA/LUIS: Otra vez.',
    ].join('\n');

    it('el coro NO es un tercer personaje en el reparto', () => {
        expect(speakersOfScenes(parseScriptScenes(CORO))).toEqual(['ANA', 'LUIS']);
    });

    it('la línea del coro es de los dos, y «(al unísono)» no la lee el narrador', () => {
        const turnos = parseScriptTurns(CORO);
        expect(turnos.every(t => t.kind === 'dialogo')).toBe(true);
        const juntos = turnos[2];
        expect(juntos.conjunto).toEqual(['ANA', 'LUIS']);
        expect(esDe(juntos, 'ANA')).toBe(true);
        expect(esDe(juntos, 'LUIS')).toBe(true);
        expect(esDe(juntos, 'MARTA')).toBe(false);
    });

    it('«ANA/LUIS» y «ANA Y LUIS» son el mismo pie, con un solo rótulo', () => {
        const turnos = parseScriptTurns(CORO);
        expect(turnos[2].speaker).toBe('ANA Y LUIS');
        expect(turnos[3].speaker).toBe('ANA Y LUIS');
    });

    it('la voz de un coro es la del compañero, nunca la tuya', () => {
        const juntos = parseScriptTurns(CORO)[2];
        expect(vozDeTurno(juntos, 'ANA')).toBe('LUIS');
        expect(vozDeTurno(juntos, 'LUIS')).toBe('ANA');
    });

    it('un personaje que SE LLAMA así no se parte en dos', () => {
        // Nadie habla suelto llamándose JUAN ni MEDIO: es un nombre, no un coro.
        const escenas = parseScriptScenes('JUAN Y MEDIO: Buenas noches.\nANA: Hola.');
        expect(speakersOfScenes(escenas)).toEqual(['JUAN Y MEDIO', 'ANA']);
    });
});

describe('el mismo personaje escrito de varias maneras', () => {
    it('las tildes y las coletillas no crean personajes nuevos', () => {
        const escenas = parseScriptScenes([
            'SONIA: Uno.',
            'SONÍA: Dos.',
            'SONÏA: Tres.',
            'SONIA (V.O.): Cuatro.',
            "SONIA (CONT'D): Cinco.",
        ].join('\n'));
        expect(speakersOfScenes(escenas)).toEqual(['SONIA']);
        expect(escenas[0].turns).toHaveLength(5);
    });

    it('DR. MARTÍNEZ y DR MARTINEZ son el mismo doctor', () => {
        const escenas = parseScriptScenes('DR. MARTÍNEZ: Respire.\nDR MARTINEZ: Otra vez.');
        expect(speakersOfScenes(escenas)).toEqual(['DR. MARTÍNEZ']);
    });

    it('se queda la grafía que más aparece', () => {
        const escenas = parseScriptScenes('SONÍA: Uno.\nSONÍA: Dos.\nSONIA: Tres.');
        expect(speakersOfScenes(escenas)).toEqual(['SONÍA']);
    });

    it('MARC y MARCOS NO se unen solos: eso hay que preguntarlo', () => {
        expect(speakersOfScenes(parseScriptScenes('MARC: Uno.\nMARCOS: Dos.')))
            .toEqual(['MARC', 'MARCOS']);
    });
});

describe('censo y alias', () => {
    it('el censo cuenta las líneas de cada uno, coros incluidos', () => {
        const G = 'ANA: Uno.\nANA: Dos.\nMARCOS: Tres.\nANA Y MARCOS: Cuatro.';
        expect(censoDeReparto(parseScriptScenes(G))).toEqual([
            { nombre: 'ANA', veces: 3 },
            { nombre: 'MARCOS', veces: 2 },
        ]);
    });

    it('aplicarAlias funde dos personajes sin tocar las escenas originales', () => {
        const escenas = parseScriptScenes('MARC: Uno.\nMARCOS: Dos.\nANA: Tres.');
        const fundido = aplicarAlias(escenas, { MARC: 'MARCOS' });
        expect(speakersOfScenes(fundido)).toEqual(['MARCOS', 'ANA']);
        expect(speakersOfScenes(escenas)).toEqual(['MARC', 'MARCOS', 'ANA']); // intactas
    });

    it('si se funden los dos miembros de un coro, deja de ser un coro', () => {
        const escenas = parseScriptScenes('MARC: Uno.\nMARCOS: Dos.\nMARC Y MARCOS: Tres.');
        const ultimo = aplicarAlias(escenas, { MARC: 'MARCOS' }).flatMap(s => s.turns).at(-1)!;
        expect(ultimo.speaker).toBe('MARCOS');
        expect(ultimo.conjunto).toBeUndefined();
    });

    it('parejasEnEscena ve a los que se responden en la misma escena', () => {
        const juntos = parejasEnEscena(parseScriptScenes('ANA: Hola.\nLUIS: Adiós.'));
        expect(juntos.has(claveDuda('ANA', 'LUIS'))).toBe(true);
    });
});

describe('personajes.ts', () => {
    it('claveDePersonaje quita tildes, puntos y coletillas', () => {
        expect(claveDePersonaje('SONÏA')).toBe('SONIA');
        expect(claveDePersonaje('Sonía (V.O.)')).toBe('SONIA');
        expect(claveDePersonaje("SONIA (CONT'D)")).toBe('SONIA');
        expect(claveDePersonaje('SONIA V.O.')).toBe('SONIA');
        expect(claveDePersonaje("ANA V.O. CONT'D")).toBe('ANA');
        expect(claveDePersonaje('DR. MARTÍNEZ')).toBe('DR MARTINEZ');
    });

    it('partirConjunto reconoce los pies compartidos y descarta lo que no lo es', () => {
        expect(partirConjunto('ANA Y LUIS')).toEqual(['ANA', 'LUIS']);
        expect(partirConjunto('ANA/LUIS')).toEqual(['ANA', 'LUIS']);
        expect(partirConjunto('ANA & LUIS')).toEqual(['ANA', 'LUIS']);
        expect(partirConjunto('ANA')).toBeNull();
        expect(partirConjunto('ANA Y ANA')).toBeNull();
        expect(partirConjunto('EL HOMBRE DE LA GABARDINA Y EL PERRO')).toBeNull();
    });

    it('distancia mide los retoques que separan dos nombres', () => {
        expect(distancia('SONIA', 'SONIA')).toBe(0);
        expect(distancia('SONIA', 'SONIO')).toBe(1);
        expect(distancia('MARC', 'MARCOS')).toBe(2);
    });

    it('propone erratas y nombres cortos, y ordena por lo más probable', () => {
        const dudas = dudasDeReparto([
            { nombre: 'MARCOS', veces: 4 },
            { nombre: 'MARC', veces: 1 },
            { nombre: 'ROBERTO', veces: 9 },
            { nombre: 'ROBERTA', veces: 8 },
        ]);
        expect(dudas.map(d => [d.a, d.b, d.motivo])).toEqual([
            ['ROBERTO', 'ROBERTA', 'errata'],
            ['MARCOS', 'MARC', 'nombre-corto'],
        ]);
    });

    it('dos que se hablan en la misma escena NO se proponen como el mismo', () => {
        const juntos = new Set([claveDuda('ROBERTO', 'ROBERTA')]);
        const dudas = dudasDeReparto(
            [{ nombre: 'ROBERTO', veces: 9 }, { nombre: 'ROBERTA', veces: 8 }],
            juntos,
        );
        expect(dudas).toEqual([]);
    });

    it('...pero una grafía que aparece UNA sola vez se pregunta igual', () => {
        // Veinte MARCOS y un MARC descolgado es una errata, comparta escena o no.
        const juntos = new Set([claveDuda('MARCOS', 'MARC')]);
        const dudas = dudasDeReparto(
            [{ nombre: 'MARCOS', veces: 20 }, { nombre: 'MARC', veces: 1 }],
            juntos,
        );
        expect(dudas.map(d => [d.a, d.b])).toEqual([['MARCOS', 'MARC']]);
    });

    it('no propone nada cuando los nombres no se parecen en nada', () => {
        expect(dudasDeReparto([{ nombre: 'ANA', veces: 3 }, { nombre: 'LUIS', veces: 3 }])).toEqual([]);
    });
});
