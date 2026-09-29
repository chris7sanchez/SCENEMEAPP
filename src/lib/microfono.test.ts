import { describe, expect, it } from 'vitest';
import { explicarFalloMicrofono, queNavegador } from './microfono';

const SAFARI_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const CHROME_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0 Mobile/15E148 Safari/604.1';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

describe('el micrófono, explicado', () => {
    it('distingue Safari de Chrome (Chrome también dice «Safari» en su firma)', () => {
        expect(queNavegador(SAFARI_MAC)).toBe('safari');
        expect(queNavegador(SAFARI_IPHONE)).toBe('safari');
        expect(queNavegador(CHROME_MAC)).toBe('chrome');
        expect(queNavegador(CHROME_IPHONE)).toBe('chrome');
    });

    it('sin permiso: dice dónde se da en ESE navegador y en el Mac', () => {
        const s = explicarFalloMicrofono('NotAllowedError', SAFARI_MAC);
        expect(s).toContain('menú Safari');
        expect(s).toContain('activa Safari');
        expect(s).not.toContain('Chrome');
        const c = explicarFalloMicrofono('NotAllowedError', CHROME_MAC);
        expect(c).toContain('icono de la izquierda');
        expect(c).toContain('activa Google Chrome');
    });

    it('sin micrófono, ocupado o sin soporte: cada uno con su salida', () => {
        expect(explicarFalloMicrofono('NotFoundError', CHROME_MAC)).toContain('Sonido → Entrada');
        expect(explicarFalloMicrofono('NotReadableError', SAFARI_MAC)).toContain('Zoom');
        expect(explicarFalloMicrofono('sin-soporte', SAFARI_MAC)).toContain('https://');
        expect(explicarFalloMicrofono('RaroError', CHROME_MAC)).toContain('RaroError');
    });
});
