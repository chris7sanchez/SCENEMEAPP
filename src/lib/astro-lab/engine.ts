import { Star, Scene, Lens } from './types';

/**
 * Astro Lab Interpretation Engine
 * 
 * Generates narrative insights based on combined star archetypes, scene domains, and lens expressions.
 */
export function fuseArchetypes(star: Star, scene: Scene, lens: Lens): string {
    const starPart = `${star.archetype} (${star.name})`;
    const scenePart = `in the ${scene.title}`;
    const lensPart = `filtered through a ${lens.expression} lens`;

    // Standard high-end narrative mapping
    const narratives: Record<string, string> = {
        'mars-scene-4-cancer': 'A vital energy that channels its drive into building a sensitive and unyielding sanctuary for the soul.',
        'venus-scene-2-taurus': 'A refined presence that cultivates wealth and value through a grounded appreciation for tangible beauty.',
        'mercury-scene-10-aries': 'Swift intelligence that communicates its grand purpose with direct, pioneering clarity.'
    };

    const key = `${star.id}-${scene.id}-${lens.id}`;
    if (narratives[key]) return narratives[key];

    // Procedural generation fallback
    return `${starPart} manifests ${star.capability.toLowerCase()} ${scenePart}, acting in a way that is ${lens.expression.toLowerCase()}.`;
}
