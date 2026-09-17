// Sólo la parte pura: el almacén es IndexedDB y aquí no hay navegador.
import { describe, it, expect } from 'vitest';
import { claveDeLinea, huella, idDeGuion, comoPeso, pesoDeTomas } from './voces-grabadas';

describe('claveDeLinea', () => {
    it('la misma frase del mismo personaje da siempre la misma clave', () => {
        expect(claveDeLinea('ANA', 'No me toques.')).toBe(claveDeLinea('ANA', 'No me toques.'));
    });

    it('no le afectan los espacios de más ni las mayúsculas del texto', () => {
        expect(claveDeLinea('ANA', '  No   me toques.  ')).toBe(claveDeLinea('ANA', 'No me toques.'));
        expect(claveDeLinea('ANA', 'NO ME TOQUES.')).toBe(claveDeLinea('ANA', 'No me toques.'));
    });

    it('la misma frase dicha por otro personaje es otra toma', () => {
        expect(claveDeLinea('ANA', 'Ya.')).not.toBe(claveDeLinea('LUIS', 'Ya.'));
    });

    it('si se reescribe la frase, la toma vieja deja de valer', () => {
        expect(claveDeLinea('ANA', 'No me toques.')).not.toBe(claveDeLinea('ANA', 'No me toque.'));
    });

    it('un coro tiene su propia toma, distinta de la de cada uno', () => {
        expect(claveDeLinea('ANA Y LUIS', '¡Ya!')).not.toBe(claveDeLinea('ANA', '¡Ya!'));
    });
});

describe('huella', () => {
    it('es estable y distingue textos parecidos', () => {
        expect(huella('hola')).toBe(huella('hola'));
        expect(huella('hola')).not.toBe(huella('hola.'));
        expect(huella('')).toBeTruthy();
    });

    it('sobrevive a los acentos y a los emoji sin romperse', () => {
        expect(huella('ñandú 🎙')).toBeTruthy();
        expect(huella('ñandú 🎙')).toBe(huella('ñandú 🎙'));
    });
});

describe('idDeGuion', () => {
    it('un guion guardado usa su propio id', () => {
        expect(idDeGuion('abc123', 'lo que sea')).toBe('abc123');
    });

    it('dos ensayos sueltos distintos no se pisan las tomas', () => {
        const a = idDeGuion('__suelto__', 'ANA: Hola.');
        const b = idDeGuion('__suelto__', 'ANA: Adiós.');
        expect(a).not.toBe(b);
        expect(a).toBe(idDeGuion('__suelto__', 'ANA: Hola.'));
        expect(a.startsWith('suelto:')).toBe(true);
    });
});

describe('peso', () => {
    it('suma lo que ocupan las tomas y lo dice en cristiano', () => {
        const falsa = (size: number) => ({ audio: { size } as Blob }) as never;
        expect(pesoDeTomas([falsa(1000), falsa(2000)])).toBe(3000);
        expect(comoPeso(512)).toBe('512 B');
        expect(comoPeso(2048)).toBe('2 kB');
        expect(comoPeso(3 * 1024 * 1024)).toBe('3.0 MB');
    });
});
