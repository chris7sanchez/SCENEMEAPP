import { describe, it, expect } from 'vitest';
import { generoDeNombre, generoDeVoz, repartirVoces } from './genero';
import { OPENAI_TTS_VOICES, ELEVENLABS_VOICES } from './speech';

describe('generoDeNombre', () => {
    it('acierta con los nombres corrientes, en los dos idiomas', () => {
        for (const n of ['MARÍA', 'Ana', 'SONIA', 'LAURA', 'CARMEN', 'RACHEL', 'EMILY', 'MÓNICA'])
            expect(generoDeNombre(n), n).toBe('f');
        for (const n of ['LUIS', 'Marcos', 'JAVIER', 'JORGE', 'MICHAEL', 'JOHN', 'DIEGO'])
            expect(generoDeNombre(n), n).toBe('m');
    });

    it('el papel manda sobre todo lo demás', () => {
        expect(generoDeNombre('MADRE')).toBe('f');
        expect(generoDeNombre('LA MADRE DE ANA')).toBe('f');
        expect(generoDeNombre('PADRE')).toBe('m');
        expect(generoDeNombre('CAMARERA')).toBe('f');
        expect(generoDeNombre('DOCTOR MARTÍNEZ')).toBe('m');
        expect(generoDeNombre('DOCTORA MARTÍNEZ')).toBe('f');
        expect(generoDeNombre('SEÑOR LOBO')).toBe('m');
        expect(generoDeNombre('MRS. SMITH')).toBe('f');
    });

    it('«JOSÉ MARÍA» es un hombre: manda la primera palabra', () => {
        expect(generoDeNombre('JOSÉ MARÍA')).toBe('m');
        expect(generoDeNombre('MARÍA JOSÉ')).toBe('f');
    });

    it('la terminación resuelve lo que no está en la lista', () => {
        expect(generoDeNombre('ZULEMA')).toBe('f');
        expect(generoDeNombre('ANACLETO')).toBe('m');
    });

    it('una palabra ambigua NO tapa a la que sí dice el género', () => {
        // El caso que salió mal en pantalla: "VOZ DE HOMBRE" con voz de Rachel.
        expect(generoDeNombre('VOZ DE HOMBRE')).toBe('m');
        expect(generoDeNombre('VOZ DE MUJER')).toBe('f');
        expect(generoDeNombre('VOZ MASCULINA')).toBe('m');
        expect(generoDeNombre('VOZ FEMENINA')).toBe('f');
        expect(generoDeNombre('POLICÍA MARÍA')).toBe('f');
        expect(generoDeNombre('JOVEN CARLOS')).toBe('m');
        expect(generoDeNombre('VOZ DE NIÑA')).toBe('f');
    });

    it('lo que de verdad no se sabe se queda sin saber', () => {
        for (const n of ['POLICÍA', 'PERIODISTA', 'JOVEN', 'VOZ', 'TESTIGO', 'NARRADOR', 'ESTUDIANTE'])
            expect(generoDeNombre(n), n).toBeNull();
    });

    it('los números de los figurantes no estorban', () => {
        expect(generoDeNombre('HOMBRE 2')).toBe('m');
        expect(generoDeNombre('CHICA 1')).toBe('f');
    });

    it('las coletillas tampoco: «ANA (V.O.)» sigue siendo ANA', () => {
        expect(generoDeNombre('ANA (V.O.)')).toBe('f');
        expect(generoDeNombre("LUIS (CONT'D)")).toBe('m');
    });
});

describe('generoDeVoz', () => {
    it('lee el género de la etiqueta, sin confundir «female» con «male»', () => {
        expect(generoDeVoz({ label: 'Bella (femenina, suave)' })).toBe('f');
        expect(generoDeVoz({ label: 'Adam (masculina, profunda)' })).toBe('m');
        expect(generoDeVoz({ label: 'Female voice' })).toBe('f');
        expect(generoDeVoz({ label: 'Male voice' })).toBe('m');
        expect(generoDeVoz({ label: 'Alloy (neutra)' })).toBeNull();
    });

    it('y si no lo dice, por el nombre propio de la voz', () => {
        expect(generoDeVoz({ label: 'Mónica' })).toBe('f');
        expect(generoDeVoz({ label: 'Microsoft Helena - Spanish (Spain)' })).toBe('f');
        expect(generoDeVoz({ label: 'Jorge' })).toBe('m');
        expect(generoDeVoz({ label: 'Google español' })).toBeNull();
    });

    it('los catálogos de la casa traen su género dentro', () => {
        const porGenero = (vs: { label: string }[]) => vs.map(generoDeVoz);
        // No hace falta que TODAS lo digan, pero sí que haya de los dos.
        expect(porGenero(OPENAI_TTS_VOICES)).toContain('f');
        expect(porGenero(OPENAI_TTS_VOICES)).toContain('m');
        expect(porGenero(ELEVENLABS_VOICES)).toContain('f');
        expect(porGenero(ELEVENLABS_VOICES)).toContain('m');
    });
});

describe('repartirVoces', () => {
    const VOCES = [
        { id: 'f1', label: 'Bella (femenina)' },
        { id: 'f2', label: 'Rachel (femenina)' },
        { id: 'm1', label: 'Adam (masculina)' },
        { id: 'm2', label: 'Josh (masculina)' },
        { id: 'n1', label: 'Alloy (neutra)' },
    ];

    it('a cada personaje una voz de su género', () => {
        const r = repartirVoces(['MARÍA', 'LUIS', 'CARMEN', 'JAVIER'], VOCES);
        expect(['f1', 'f2']).toContain(r['MARÍA']);
        expect(['f1', 'f2']).toContain(r['CARMEN']);
        expect(['m1', 'm2']).toContain(r['LUIS']);
        expect(['m1', 'm2']).toContain(r['JAVIER']);
    });

    it('no repite mientras queden voces libres', () => {
        const r = repartirVoces(['MARÍA', 'CARMEN', 'LUIS', 'JAVIER'], VOCES);
        expect(new Set(Object.values(r)).size).toBe(4);
    });

    it('el que no se sabe empieza por las neutras', () => {
        expect(repartirVoces(['POLICÍA'], VOCES)['POLICÍA']).toBe('n1');
    });

    it('si se acaban las de su género coge otra antes que quedarse mudo', () => {
        const r = repartirVoces(['MARÍA', 'CARMEN', 'LAURA', 'SONIA'], VOCES);
        expect(Object.values(r).every(Boolean)).toBe(true);
        expect(Object.keys(r)).toHaveLength(4);
    });

    it('sin voces no revienta', () => {
        expect(repartirVoces(['ANA'], [])).toEqual({ ANA: undefined });
    });

    it('con las voces de verdad, MARÍA no acaba con voz de hombre', () => {
        const r = repartirVoces(['MARÍA', 'PADRE'], ELEVENLABS_VOICES);
        expect(generoDeVoz(ELEVENLABS_VOICES.find(v => v.id === r['MARÍA'])!)).toBe('f');
        expect(generoDeVoz(ELEVENLABS_VOICES.find(v => v.id === r['PADRE'])!)).toBe('m');
    });
});
