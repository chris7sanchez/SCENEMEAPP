import { describe, it, expect } from 'vitest';
import {
    parseScriptScenes, parseScriptTurns, speakersOfScenes,
    scenesWith, scenesWithDialogue, sceneLabel,
    playableTurns, hasNarration, NARRADOR,
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
        expect(uno.turns.find(t => t.kind === 'dialogo')!.text).toBe('¿De verdad pensabas que no me iba a enterar?');
    });

    it('la acción y las acotaciones no se mezclan con el diálogo', () => {
        const dialogo = parseScriptScenes(GUION)
            .flatMap(s => s.turns.filter(t => t.kind === 'dialogo').map(t => t.text));
        expect(dialogo.some(t => t.includes('Ana friega'))).toBe(false);
        expect(dialogo.some(t => t.includes('sin volverse'))).toBe(false);
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
        expect(escenas[0].speakers).toHaveLength(0);
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
    });

    it('el diálogo sigue saliendo en el mismo orden de siempre', () => {
        const dialogo = parseScriptTurns(GUION).filter(t => t.kind === 'dialogo');
        expect(dialogo.map(t => t.speaker)).toEqual(['ANA', 'LUIS', 'LUIS', 'MARTA', 'LUIS', 'MARTA']);
    });
});

describe('acotaciones para el narrador', () => {
    it('recoge la acción como turno del narrador', () => {
        const accion = parseScriptScenes(GUION).flatMap(s => s.turns).filter(t => t.kind === 'accion');
        expect(accion.map(t => t.text)).toEqual(['Ana friega. Entra Luis, mojado.', 'Luis camina solo.']);
        expect(accion.every(t => t.speaker === NARRADOR)).toBe(true);
    });

    it('recoge la acotación entre paréntesis, sin los paréntesis', () => {
        const acot = parseScriptScenes(GUION).flatMap(s => s.turns).filter(t => t.kind === 'acotacion');
        expect(acot.map(t => t.text)).toEqual(['sin volverse']);
    });

    it('la acotación va JUSTO ANTES de la frase a la que afecta', () => {
        const turnos = parseScriptScenes(GUION)[0].turns;
        const i = turnos.findIndex(t => t.kind === 'acotacion');
        expect(turnos[i + 1].speaker).toBe('ANA');
        expect(turnos[i + 1].text).toContain('¿De verdad');
    });

    it('la acción posterior a un diálogo NO se le pega al personaje', () => {
        // Antes, "Ana se va" acababa dentro de la réplica de ANA.
        const turnos = parseScriptScenes('ANA\nHola.\n\nAna se va. Luis la mira.\n\nLUIS\nEspera.').flatMap(s => s.turns);
        expect(turnos.map(t => [t.speaker, t.kind, t.text])).toEqual([
            ['ANA', 'dialogo', 'Hola.'],
            [NARRADOR, 'accion', 'Ana se va. Luis la mira.'],
            ['LUIS', 'dialogo', 'Espera.'],
        ]);
    });

    it('un hueco entre el pie de personaje y su frase NO la convierte en acción', () => {
        // Extraer un PDF suele dejar ese hueco; si cerrase el bloque ahí, la
        // primera frase de cada personaje se leería como narración.
        const turnos = parseScriptScenes('ANA\n\n¿Vienes?').flatMap(s => s.turns);
        expect(turnos).toEqual([{ id: 0, speaker: 'ANA', text: '¿Vienes?', kind: 'dialogo' }]);
    });

    it('el narrador no entra en el reparto ni cuenta para "sales tú"', () => {
        const escenas = parseScriptScenes(GUION);
        expect(speakersOfScenes(escenas)).toEqual(['ANA', 'LUIS', 'MARTA']);
        expect(escenas[1].speakers).toEqual(['LUIS']); // esa escena tiene acción
        expect(scenesWith(escenas, NARRADOR)).toEqual([]);
    });

    it('playableTurns quita o deja las acotaciones', () => {
        const turnos = parseScriptTurns(GUION);
        expect(playableTurns(turnos, false).every(t => t.kind === 'dialogo')).toBe(true);
        expect(playableTurns(turnos, true)).toEqual(turnos);
        expect(playableTurns(turnos, true).length).toBeGreaterThan(playableTurns(turnos, false).length);
    });

    it('hasNarration dice si merece la pena ofrecer el narrador', () => {
        expect(hasNarration(parseScriptScenes(GUION))).toBe(true);
        expect(hasNarration(parseScriptScenes('ANA: Hola.\nLUIS: Adiós.'))).toBe(false);
    });

    it('una escena de sólo acción no es ensayable, pero conserva su narración', () => {
        const escenas = parseScriptScenes('1. INT. A - DÍA\nAlguien camina.\n2. INT. B - DÍA\nANA: Aquí.');
        expect(scenesWithDialogue(escenas)).toHaveLength(1);
        expect(escenas[0].turns[0]).toMatchObject({ kind: 'accion', speaker: NARRADOR });
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
