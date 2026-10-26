import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import {
    motivoParaNoAnadir, puedeCrearDeck, limpiarIdeas, limpiarEtiquetas, coincide, esImagenPropia,
    limpiarPlanosPublicos, urlEmbedYoutube, urlGoogleImagenes,
    type Deck, type Plano,
} from './fotogramas';
import { firmaStripeValida } from './stripe-firma';

const IMG = 'https://firebasestorage.googleapis.com/v0/b/xperimental-hub.appspot.com/o/users%2Fabc123%2Ffotogramas%2Fp1.jpg?alt=media&token=t';
const plano = (id: string, extra: Partial<Plano> = {}): Plano => ({ id, imagen: IMG, ruta: `users/abc123/fotogramas/${id}.jpg`, creado: 0, ...extra });
const deck = (n: number): Deck => ({ id: 'd', nombre: 'D', creado: 0, planos: Array.from({ length: n }, (_, i) => plano(`p${i}`)) });

describe('plan', () => {
    it('límites de decks y planos', () => {
        expect(puedeCrearDeck('gratis', 0)).toBe(true);
        expect(puedeCrearDeck('gratis', 1)).toBe(false);
        expect(puedeCrearDeck('pro', 500)).toBe(true);
        expect(motivoParaNoAnadir('gratis', deck(12), plano('nuevo'))).toBe('limite_planos');
        expect(motivoParaNoAnadir('pro', deck(12), plano('nuevo'))).toBeNull();
        expect(motivoParaNoAnadir('pro', deck(3), plano('p1'))).toBe('duplicado');
    });
});

describe('limpiarIdeas', () => {
    it('acepta {ideas:[...]} o una lista, recorta y descarta lo incompleto', () => {
        const ideas = limpiarIdeas({ ideas: [
            { titulo: 'Heat', anio: 1995, director: 'Michael Mann', escena: 'La cafetería', porQue: 'Contención', busqueda: 'Heat cafeteria scene' },
            { titulo: '', escena: 'x' },
            { titulo: 'Sin escena' },
            { titulo: 'Mal año', anio: 'hace mucho', escena: 'y' },
        ] });
        expect(ideas).toHaveLength(2);
        expect(ideas[0]).toMatchObject({ titulo: 'Heat', anio: '1995', busqueda: 'Heat cafeteria scene' });
        expect(ideas[1].anio).toBeUndefined();
        expect(ideas[1].busqueda).toContain('Mal año');
        expect(limpiarIdeas('basura')).toEqual([]);
    });
});

describe('etiquetas y filtro', () => {
    it('limpia las etiquetas del modelo', () => {
        expect(limpiarEtiquetas({ plano: ' Primer plano ', luz: 42, palabras: ['Noche', '', 'LLUVIA'] }))
            .toEqual({ plano: 'Primer plano', palabras: ['noche', 'lluvia'] });
    });
    it('busca en película, nota y etiquetas sin importar tildes', () => {
        const p = plano('a', { pelicula: 'Heat', nota: 'mirada fija', etiquetas: { luz: 'contraluz', emocion: 'tensión' } });
        expect(coincide(p, 'tension heat')).toBe(true);
        expect(coincide(p, 'CONTRALUZ')).toBe(true);
        expect(coincide(p, 'comedia')).toBe(false);
        expect(coincide(p, '  ')).toBe(true);
    });
});

describe('imágenes y enlaces', () => {
    it('sólo acepta imágenes de fotogramas en el Storage propio', () => {
        expect(esImagenPropia(IMG)).toBe(true);
        expect(esImagenPropia('https://evil.com/x.jpg')).toBe(false);
        expect(esImagenPropia(IMG.replace('fotogramas', 'avatar'))).toBe(false);
    });
    it('limpia los planos públicos y quita la fuente y la ruta', () => {
        const [p] = limpiarPlanosPublicos([{ ...plano('a'), fuente: 'https://x', nota: 'n' }, { id: 'b', imagen: 'https://evil.com/x.jpg' }]);
        expect(p).toMatchObject({ id: 'a', imagen: IMG, nota: 'n' });
        expect(p).not.toHaveProperty('ruta');
        expect(p).not.toHaveProperty('fuente');
    });
    it('embed de YouTube sólo con ids válidos', () => {
        expect(urlEmbedYoutube('dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(urlEmbedYoutube('"><script>')).toBeUndefined();
        expect(urlGoogleImagenes('Heat 1995')).toBe('https://www.google.com/search?tbm=isch&q=Heat%201995');
    });
});

describe('firmaStripeValida', () => {
    const secreto = 'whsec_test';
    const cuerpo = '{"type":"checkout.session.completed"}';
    const ahora = 1_800_000_000_000;
    const t = String(ahora / 1000);
    const firma = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest('hex');

    it('acepta una firma buena', () => {
        expect(firmaStripeValida(cuerpo, `t=${t},v1=${firma}`, secreto, ahora)).toBe(true);
    });
    it('rechaza cuerpo manipulado, secreto distinto, firma ausente o aviso antiguo', () => {
        expect(firmaStripeValida(cuerpo + ' ', `t=${t},v1=${firma}`, secreto, ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, `t=${t},v1=${firma}`, 'otro', ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, null, secreto, ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, `t=${t},v1=zz`, secreto, ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, `t=${t},v1=${firma}`, secreto, ahora + 10 * 60_000)).toBe(false);
    });
});

describe('extraerJson (respuesta de Gemini)', async () => {
    const { extraerJson, parteImagen } = await import('../ai/gemini-json');
    const resp = (text: string) => ({ candidates: [{ content: { parts: [{ text }] } }] });
    it('lee JSON limpio y envuelto en ```json', () => {
        expect(extraerJson(resp('{"ideas":[]}'))).toEqual({ ideas: [] });
        expect(extraerJson(resp('```json\n{"a":1}\n```'))).toEqual({ a: 1 });
    });
    it('falla con un motivo claro si no hay texto o no es JSON', () => {
        expect(() => extraerJson({ candidates: [{ finishReason: 'SAFETY' }] })).toThrow(/SAFETY/);
        expect(() => extraerJson(resp('hola'))).toThrow(/no es JSON/);
    });
    it('convierte un dataURL en parte de imagen', () => {
        expect(parteImagen('data:image/jpeg;base64,QUJD')).toEqual({ inlineData: { mimeType: 'image/jpeg', data: 'QUJD' } });
    });
});
