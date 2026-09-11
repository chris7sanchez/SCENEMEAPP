import { describe, it, expect } from 'vitest';
import {
    parseScriptScenes, parseScriptTurns, speakersOfScenes,
    scenesWith, scenesWithDialogue, sceneLabel,
} from './scene-script';

const GUION = `
1. INT. COCINA - NOCHE

Ana friega. Entra Luis, mojado.

ANA
(sin volverse)
¿De verdad pensabas que no me iba a enterar?

LUIS
No quería hacerte daño.

CUT TO:

2. EXT. CALLE - AMANECER

Luis camina solo.

LUIS
Debí decírselo.

3. INT. BAR - DÍA

MARTA: ¿Y ella qué dijo?
LUIS: Nada. Eso es lo peor.
MARTA: Ya.
`;

describe('parseScriptScenes', () => {
    it('parte el guion por encabezados numerados y conserva el encabezado', () => {
        const escenas = parseScriptScenes(GUION);
        expect(escenas).toHaveLength(3);
        expect(escenas[0].heading).toBe('1. INT. COCINA - NOCHE');
        expect(escenas[1].heading).toBe('2. EXT. CALLE - AMANECER');
        expect(escenas[2].heading).toBe('3. INT. BAR - DÍA');
    });

    it('una transición no abre escena, sólo corta el diálogo', () => {
        // "CUT TO:" va dentro de la escena 1; si abriera escena habría 4.
        expect(parseScriptScenes(GUION)).toHaveLength(3);
    });

    it('reparte los turnos en su escena y lista quién habla en cada una', () => {
        const [uno, dos, tres] = parseScriptScenes(GUION);
        expect(uno.speakers).toEqual(['ANA', 'LUIS']);
        expect(dos.speakers).toEqual(['LUIS']);
        expect(tres.speakers).toEqual(['MARTA', 'LUIS']);
        expect(uno.turns[0].text).toBe('¿De verdad pensabas que no me iba a enterar?');
    });

    it('ignora la acción y las acotaciones', () => {
        const textos = parseScriptScenes(GUION).flatMap(s => s.turns.map(t => t.text));
        expect(textos.some(t => t.includes('Ana friega'))).toBe(false);
        expect(textos.some(t => t.includes('sin volverse'))).toBe(false);
    });

    it('los ids de turno son únicos y correlativos en todo el guion', () => {
        const ids = parseScriptScenes(GUION).flatMap(s => s.turns.map(t => t.id));
        expect(ids).toEqual(ids.map((_, i) => i));
    });

    it('un guion SIN encabezados es una sola escena (el flujo de pegar una escena)', () => {
        const escenas = parseScriptScenes('ANA: Hola.\nLUIS: Adiós.');
        expect(escenas).toHaveLength(1);
        expect(escenas[0].heading).toBe('');
        expect(escenas[0].turns).toHaveLength(2);
    });

    it('acepta encabezados en castellano por número', () => {
        const escenas = parseScriptScenes('ESCENA 1\nANA: Uno.\nESCENA 2\nANA: Dos.');
        expect(escenas).toHaveLength(2);
        expect(escenas[1].turns[0].text).toBe('Dos.');
    });

    it('conserva las escenas sin diálogo para no descuadrar la numeración', () => {
        const escenas = parseScriptScenes('1. INT. A - DÍA\nAlguien camina.\n2. INT. B - DÍA\nANA: Aquí.');
        expect(escenas).toHaveLength(2);
        expect(escenas[0].turns).toHaveLength(0);
        expect(scenesWithDialogue(escenas)).toHaveLength(1);
    });

    it('no confunde una frase con dos puntos con un nombre de personaje', () => {
        const escenas = parseScriptScenes('ANA: Te lo dije, y lo repito: no vuelvas.');
        expect(escenas[0].turns).toHaveLength(1);
        expect(escenas[0].turns[0].speaker).toBe('ANA');
    });
});

describe('parseScriptTurns (compatibilidad)', () => {
    it('devuelve la secuencia plana de todas las escenas', () => {
        const turnos = parseScriptTurns(GUION);
        const desdeEscenas = parseScriptScenes(GUION).flatMap(s => s.turns);
        expect(turnos).toEqual(desdeEscenas);
        expect(turnos.map(t => t.speaker)).toEqual(['ANA', 'LUIS', 'LUIS', 'MARTA', 'LUIS', 'MARTA']);
    });
});

describe('selección de escenas', () => {
    it('speakersOfScenes lista el reparto entero en orden de aparición', () => {
        expect(speakersOfScenes(parseScriptScenes(GUION))).toEqual(['ANA', 'LUIS', 'MARTA']);
    });

    it('scenesWith devuelve sólo las escenas donde habla el personaje', () => {
        const escenas = parseScriptScenes(GUION);
        expect(scenesWith(escenas, 'ANA').map(s => s.id)).toEqual([0]);
        expect(scenesWith(escenas, 'LUIS').map(s => s.id)).toEqual([0, 1, 2]);
        expect(scenesWith(escenas, 'MARTA').map(s => s.id)).toEqual([2]);
    });

    it('sceneLabel usa el encabezado, o numera si no lo hay', () => {
        const escenas = parseScriptScenes(GUION);
        expect(sceneLabel(escenas[0], 0)).toBe('1. INT. COCINA - NOCHE');
        expect(sceneLabel({ id: 0, heading: '', turns: [], speakers: [] }, 4)).toBe('Escena 5');
    });
});
