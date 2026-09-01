import { describe, it, expect } from 'vitest';
import { dailyKey, isValidScene, sanitizeFilename, buildSubmissionPath, computeStreak } from './daily-scene';

describe('dailyKey', () => {
    it('da formato YYYY-MM-DD', () => {
        const d = new Date('2026-06-10T10:00:00Z');
        expect(dailyKey(d, 'Europe/Madrid')).toBe('2026-06-10');
    });
    it('es estable para la misma fecha civil', () => {
        const a = new Date('2026-06-10T08:00:00Z');
        const b = new Date('2026-06-10T20:00:00Z');
        expect(dailyKey(a, 'Europe/Madrid')).toBe(dailyKey(b, 'Europe/Madrid'));
    });
    it('respeta la zona horaria en la frontera de medianoche', () => {
        // 23:30 UTC del día 10 es 01:30 del día 11 en Madrid (CEST, +2).
        const d = new Date('2026-06-10T23:30:00Z');
        expect(dailyKey(d, 'Europe/Madrid')).toBe('2026-06-11');
        expect(dailyKey(d, 'UTC')).toBe('2026-06-10');
    });
});

describe('isValidScene', () => {
    const ok = {
        title: 'La discusión',
        characters: ['ANA', 'LUIS'],
        lines: [
            { character: 'ANA', text: '¿De verdad pensabas que no me iba a enterar?' },
            { character: 'LUIS', text: 'No quería hacerte daño.' },
        ],
    };
    it('acepta una escena bien formada', () => {
        expect(isValidScene(ok)).toBe(true);
    });
    it('rechaza sin título', () => {
        expect(isValidScene({ ...ok, title: '   ' })).toBe(false);
    });
    it('rechaza con menos de 2 líneas', () => {
        expect(isValidScene({ ...ok, lines: [ok.lines[0]] })).toBe(false);
    });
    it('rechaza línea sin texto', () => {
        expect(isValidScene({ ...ok, lines: [ok.lines[0], { character: 'LUIS', text: '' }] })).toBe(false);
    });
    it('rechaza null/objetos vacíos', () => {
        expect(isValidScene(null)).toBe(false);
        expect(isValidScene({})).toBe(false);
    });
});

describe('sanitizeFilename', () => {
    it('reemplaza caracteres peligrosos', () => {
        expect(sanitizeFilename('mi tarea/../x.mp4')).toBe('mi_tarea_.._x.mp4');
    });
    it('colapsa guiones bajos repetidos', () => {
        expect(sanitizeFilename('a   b')).toBe('a_b');
    });
    it('da un nombre por defecto si queda vacío', () => {
        expect(sanitizeFilename('///')).toBe('tarea');
    });
});

describe('buildSubmissionPath', () => {
    it('construye la ruta aislada por uid y fecha', () => {
        expect(buildSubmissionPath('user123', '2026-06-10', 'toma.mp4', 1000)).toBe(
            'submissions/user123/2026-06-10/1000_toma.mp4',
        );
    });
});

describe('computeStreak', () => {
    it('cuenta días seguidos hasta hoy', () => {
        expect(computeStreak(['2026-08-30', '2026-08-31', '2026-09-01'], '2026-09-01')).toBe(3);
    });
    it('si hoy no hay toma, la racha de ayer sigue viva', () => {
        expect(computeStreak(['2026-08-30', '2026-08-31'], '2026-09-01')).toBe(2);
    });
    it('se rompe si falta un día intermedio', () => {
        expect(computeStreak(['2026-08-28', '2026-08-30', '2026-09-01'], '2026-09-01')).toBe(1);
    });
    it('sin tomas: racha cero', () => {
        expect(computeStreak([], '2026-09-01')).toBe(0);
    });
    it('cruza el cambio de mes', () => {
        expect(computeStreak(['2026-08-31', '2026-09-01'], '2026-09-01')).toBe(2);
    });
    it('tolera fechas repetidas', () => {
        expect(computeStreak(['2026-09-01', '2026-09-01', '2026-08-31'], '2026-09-01')).toBe(2);
    });
});
