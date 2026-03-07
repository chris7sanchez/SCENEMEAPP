export interface Star {
    id: string;
    name: string;
    archetype: string;
    capability: string;
    vibe: string;
    visualTone: string;
}

export interface Scene {
    id: string;
    index: number;
    title: string;
    domain: string;
}

export interface Lens {
    id: string;
    name: string;
    element: 'Plasma' | 'Solid' | 'Vapor' | 'Flow';
    quality: string;
    expression: string;
}

export interface Character {
    id: string;
    name: string;
    archetype: string;
    image: string;
    elementalIcons: string[];
}

export const STARS: Star[] = [
    {
        id: 'mars',
        name: 'Mars',
        archetype: 'The Catalyst',
        capability: 'Drive and Action',
        vibe: 'Direct',
        visualTone: 'hsl(0, 84%, 60%)'
    },
    {
        id: 'venus',
        name: 'Venus',
        archetype: 'The Harmonizer',
        capability: 'Attraction and Care',
        vibe: 'Refined',
        visualTone: 'hsl(330, 81%, 60%)'
    },
    {
        id: 'mercury',
        name: 'Mercury',
        archetype: 'The Messenger',
        capability: 'Flow and Intelligence',
        vibe: 'Swift',
        visualTone: 'hsl(45, 93%, 47%)'
    }
];

export const SCENES: Scene[] = [
    {
        id: 'scene-2',
        index: 2,
        title: 'Resource Chamber',
        domain: 'Possessions and Talents'
    },
    {
        id: 'scene-4',
        index: 4,
        title: 'Safe Haven',
        domain: 'Roots and Foundations'
    },
    {
        id: 'scene-10',
        index: 10,
        title: 'The Summit',
        domain: 'Purpose and Recognition'
    }
];

export const LENSES: Lens[] = [
    {
        id: 'taurus',
        name: 'Taurus',
        element: 'Solid',
        quality: 'Sustained',
        expression: 'Patient and Substantial'
    },
    {
        id: 'cancer',
        name: 'Cancer',
        element: 'Flow',
        quality: 'Protective',
        expression: 'Shielding and Emotive'
    },
    {
        id: 'aries',
        name: 'Aries',
        element: 'Plasma',
        quality: 'Primary',
        expression: 'Bold and Immediate'
    }
];

export const INITIAL_CHARACTERS: Character[] = [
    {
        id: 'urano',
        name: 'Urano',
        archetype: 'El Loco',
        image: '/astro-lab/char-urano.png',
        elementalIcons: ['⚡', '🤖']
    },
    {
        id: 'venus',
        name: 'Venus',
        archetype: 'La Amante',
        image: '/astro-lab/char-solara.png', // Reusing Solara for now as it looks magical
        elementalIcons: ['💖', '✨']
    },
    {
        id: 'sol',
        name: 'El Sol',
        archetype: 'El Rey/Zeus',
        image: '/astro-lab/char-sol.png',
        elementalIcons: ['☀️', '👑']
    },
    {
        id: 'saturno',
        name: 'Saturno',
        archetype: 'El Sabio/Juez',
        image: '/astro-lab/char-saturno.png',
        elementalIcons: ['⏳', '⚖️']
    },
    {
        id: 'pluton',
        name: 'Plutón',
        archetype: 'El Señor del Inframundo',
        image: '/astro-lab/char-pluton.png',
        elementalIcons: ['💀', '🔮']
    }
];
