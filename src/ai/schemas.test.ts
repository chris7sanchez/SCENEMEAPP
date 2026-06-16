import { describe, it, expect } from 'vitest';
import { AnalyzeCharacterOutputSchema } from './schemas';

// Perfil válido completo (refleja el mock corregido de generateMockProfile).
const validProfile = {
  sunSign: 'Aries',
  moonSign: 'Leo',
  ascendant: 'Libra',
  elements: { fire: 25, earth: 25, air: 25, water: 25 },
  archetype: 'El Superviviente (Simulación)',
  essence: 'En la simulación, el alma encuentra su forma provisional.',
  analysis: '[MODO SIMULACIÓN] Perfil generado automáticamente.',
  threePillars: {
    sunReasoning: 'Energía proyectada simulada.',
    moonReasoning: 'Respuesta emocional inferida.',
    ascendantReasoning: 'Máscara social predeterminada.',
  },
  methodActing: {
    psychologicalGesture: 'Un puño cerrado que se abre lentamente.',
    voiceQuality: 'Tempo medido, tono neutro.',
    animalTotem: 'Un lobo paciente.',
    physicalCenter: 'Plexo solar',
    emotionalLandscape: 'Un mar en calma sobre una corriente profunda.',
  },
};

describe('AnalyzeCharacterOutputSchema', () => {
  it('acepta un perfil completo (el mock corregido cumple el schema)', () => {
    expect(() => AnalyzeCharacterOutputSchema.parse(validProfile)).not.toThrow();
  });

  it('rechaza un perfil sin "essence" ni "methodActing" (regresión del bug del mock)', () => {
    const { essence, methodActing, ...broken } = validProfile;
    const result = AnalyzeCharacterOutputSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it('rechaza elementos fuera del rango 0-100', () => {
    const bad = { ...validProfile, elements: { fire: 250, earth: 25, air: 25, water: 25 } };
    expect(AnalyzeCharacterOutputSchema.safeParse(bad).success).toBe(false);
  });
});
