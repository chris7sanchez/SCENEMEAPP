import { describe, it, expect } from 'vitest';
import { ZODIAC_ARCHETYPES, type ZodiacArchetype } from './archetypes';

const SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis',
];

const STRING_FIELDS: (keyof ZodiacArchetype)[] = [
  'sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars', 'light', 'shadow',
];

describe('ZODIAC_ARCHETYPES', () => {
  it('contiene exactamente los 12 signos del zodiaco', () => {
    expect(Object.keys(ZODIAC_ARCHETYPES).sort()).toEqual([...SIGNS].sort());
  });

  it.each(SIGNS)('"%s" tiene todos los campos de texto no vacíos', (sign) => {
    const a = ZODIAC_ARCHETYPES[sign];
    expect(a).toBeDefined();
    for (const f of STRING_FIELDS) {
      expect(typeof a[f]).toBe('string');
      expect((a[f] as string).length).toBeGreaterThan(0);
    }
  });

  it.each(SIGNS)('"%s" tiene un array de keywords no vacío', (sign) => {
    const a = ZODIAC_ARCHETYPES[sign];
    expect(Array.isArray(a.keywords)).toBe(true);
    expect(a.keywords.length).toBeGreaterThan(0);
    a.keywords.forEach((k) => expect(typeof k).toBe('string'));
  });
});
