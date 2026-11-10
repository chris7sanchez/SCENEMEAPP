import { describe, it, expect } from 'vitest';
import { esEscaparate, SCRIPT_SALTO_APP, INICIO_APP } from './modo-app';

describe('esEscaparate', () => {
    it('la portada y sus pruebas son escaparate', () => {
        expect(esEscaparate('/')).toBe(true);
        expect(esEscaparate('/propuesta')).toBe(true);
        expect(esEscaparate('/scroll/')).toBe(true);
    });
    it('las pantallas de la app no lo son', () => {
        for (const ruta of ['/creator', '/login', '/talents', '/fotogramas', '/estudios', '/privacy', '/scroll-x']) {
            expect(esEscaparate(ruta)).toBe(false);
        }
    });
});

describe('SCRIPT_SALTO_APP', () => {
    // El script se ejecuta en el <head> con un window falso: comprueba que salta
    // sólo en la app instalada y sólo desde el escaparate.
    function ejecutar(ruta: string, instalada: boolean) {
        let destino: string | null = null;
        const window = {
            matchMedia: (q: string) => ({ matches: instalada && q.includes('standalone') }),
            navigator: {},
        };
        const location = { pathname: ruta, replace: (u: string) => { destino = u; } };
        new Function('window', 'location', SCRIPT_SALTO_APP)(window, location);
        return destino;
    }

    it('app instalada en la portada → a la app', () => {
        expect(ejecutar('/', true)).toBe(INICIO_APP);
        expect(ejecutar('/propuesta', true)).toBe(INICIO_APP);
    });
    it('app instalada dentro de la app → se queda', () => {
        expect(ejecutar('/creator', true)).toBeNull();
        expect(ejecutar('/login', true)).toBeNull();
    });
    it('navegador normal → la portada se ve como siempre', () => {
        expect(ejecutar('/', false)).toBeNull();
    });
});
