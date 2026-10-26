import { describe, it, expect, vi } from 'vitest';
import { alAvisoTts, avisoDeRespuesta, cabecerasTts, emitirAvisoTts, TEXTO_AVISO } from './tts-cliente';

describe('avisoDeRespuesta', () => {
    it('401 → login, 429 → límite, el resto nada', () => {
        expect(avisoDeRespuesta(401)).toBe('login_requerido');
        expect(avisoDeRespuesta(429, 'limite_diario')).toBe('limite_diario');
        expect(avisoDeRespuesta(503)).toBeNull();
        expect(avisoDeRespuesta(200)).toBeNull();
    });

    it('429 por ir demasiado rápido no es el límite del día', () => {
        expect(avisoDeRespuesta(429, 'demasiadas_peticiones')).toBe('demasiadas_peticiones');
        expect(avisoDeRespuesta(429)).toBe('demasiadas_peticiones');
    });

    it('cada aviso tiene texto', () => {
        expect(TEXTO_AVISO.login_requerido).toMatch(/sesión/);
        expect(TEXTO_AVISO.limite_diario).toMatch(/límite/);
        expect(TEXTO_AVISO.demasiadas_peticiones).toMatch(/minuto/);
    });
});

describe('cabecerasTts', () => {
    it('con token añade Authorization Bearer', async () => {
        expect(await cabecerasTts(async () => 'tok')).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer tok' });
    });

    it('sin token o si falla, solo Content-Type', async () => {
        expect(await cabecerasTts(async () => null)).toEqual({ 'Content-Type': 'application/json' });
        expect(await cabecerasTts(async () => { throw new Error('x'); })).toEqual({ 'Content-Type': 'application/json' });
    });
});

describe('alAvisoTts', () => {
    it('avisa a quien escucha y deja de avisar al darse de baja', () => {
        const fn = vi.fn();
        const baja = alAvisoTts(fn);
        emitirAvisoTts('limite_diario');
        baja();
        emitirAvisoTts('login_requerido');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('limite_diario');
    });
});
