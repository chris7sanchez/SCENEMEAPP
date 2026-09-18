import { describe, expect, it } from 'vitest';
import { initRehearsal, rehearsalReducer, type RehearsalState } from './rehearsal-reducer';
import type { SceneTurn } from './scene-script';

/** ANA · LUIS · ANA · acción · LUIS. El papel de quien ensaya es ANA. */
const TURNOS: SceneTurn[] = [
    { id: 0, speaker: 'ANA', text: '¿Dónde estabas?', kind: 'dialogo' },
    { id: 1, speaker: 'LUIS', text: 'Fuera.', kind: 'dialogo' },
    { id: 2, speaker: 'ANA', text: 'Llevo dos horas.', kind: 'dialogo' },
    { id: 3, speaker: '', text: 'Luis se sienta.', kind: 'accion' },
    { id: 4, speaker: 'LUIS', text: 'Ya.', kind: 'dialogo' },
];

const arrancado = (): RehearsalState =>
    rehearsalReducer(initRehearsal(TURNOS, 'ANA'), { type: 'START' });

describe('GO_TO', () => {
    it('salta a la línea pedida', () => {
        const s = rehearsalReducer(arrancado(), { type: 'GO_TO', index: 4 });
        expect(s.index).toBe(4);
    });

    it('deja la fase que le toca a esa línea, no la que hubiera', () => {
        // Saltar a una línea de LUIS deja al compañero hablando...
        const enLuis = rehearsalReducer(arrancado(), { type: 'GO_TO', index: 1 });
        expect(enLuis.phase).toBe('speaking');
        // ...y saltar a una de ANA deja el turno esperando a quien ensaya.
        const enAna = rehearsalReducer(enLuis, { type: 'GO_TO', index: 2 });
        expect(enAna.phase).toBe('awaiting-user');
    });

    it('una acción nunca es turno de nadie', () => {
        const s = rehearsalReducer(arrancado(), { type: 'GO_TO', index: 3 });
        expect(s.phase).toBe('speaking');
    });

    it('no se sale por ningún extremo', () => {
        expect(rehearsalReducer(arrancado(), { type: 'GO_TO', index: -7 }).index).toBe(0);
        // Un índice pasado de rosca se queda en la última línea: saltar no
        // debería DAR POR TERMINADO el ensayo, que es lo que haría caer en
        // 'finished' con la separata a medias.
        const tarde = rehearsalReducer(arrancado(), { type: 'GO_TO', index: 99 });
        expect(tarde.index).toBe(TURNOS.length - 1);
        expect(tarde.phase).not.toBe('finished');
    });

    it('re-dispara los efectos aunque se salte a la línea en la que ya estás', () => {
        const a = arrancado();
        const b = rehearsalReducer(a, { type: 'GO_TO', index: a.index });
        expect(b.seq).toBeGreaterThan(a.seq);
    });

    it('sin líneas no hace nada', () => {
        const vacio = initRehearsal([], 'ANA');
        expect(rehearsalReducer(vacio, { type: 'GO_TO', index: 2 })).toBe(vacio);
    });
});
