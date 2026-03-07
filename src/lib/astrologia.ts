export interface Astro {
    id: string;
    nombre: string;
    cualidad: string;
    capacidad: string;
    personalidad: string;
    color: string;
    emoji: string;
}

export interface Signo {
    id: string;
    nombre: string;
    elemento: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
    modalidad: 'Cardinal' | 'Fijo' | 'Mutable';
    adjetivo: string;
}

export interface Casa {
    id: string;
    numero: number;
    nombre: string;
    ambito: string;
}

export const INITIAL_ASTROS: Astro[] = [
    {
        id: 'marte',
        nombre: 'Marte',
        cualidad: 'Impulsivo',
        capacidad: 'Acción y Fuerza',
        personalidad: 'Guerrero',
        color: '#ef4444',
        emoji: '♂️'
    },
    {
        id: 'venus',
        nombre: 'Venus',
        cualidad: 'Armoniosa',
        capacidad: 'Atracción y Valor',
        personalidad: 'Amante/Artista',
        color: '#ec4899',
        emoji: '♀️'
    },
    {
        id: 'mercurio',
        nombre: 'Mercurio',
        cualidad: 'Curioso',
        capacidad: 'Comunicación y Pensamiento',
        personalidad: 'Mensajero/Analista',
        color: '#f59e0b',
        emoji: '☿️'
    }
];

export const INITIAL_SIGNOS: Signo[] = [
    {
        id: 'tauro',
        nombre: 'Tauro',
        elemento: 'Tierra',
        modalidad: 'Fijo',
        adjetivo: 'Estable y Lento'
    },
    {
        id: 'cancer',
        nombre: 'Cáncer',
        elemento: 'Agua',
        modalidad: 'Cardinal',
        adjetivo: 'Protector y Sensible'
    },
    {
        id: 'aries',
        nombre: 'Aries',
        elemento: 'Fuego',
        modalidad: 'Cardinal',
        adjetivo: 'Directo y Audaz'
    }
];

export const INITIAL_CASAS: Casa[] = [
    {
        id: 'casa-2',
        numero: 2,
        nombre: 'Casa 2',
        ambito: 'Banco/Almacén de Recursos'
    },
    {
        id: 'casa-4',
        numero: 4,
        nombre: 'Casa 4',
        ambito: 'Hogar y Raíces'
    },
    {
        id: 'casa-10',
        numero: 10,
        nombre: 'Casa 10',
        ambito: 'Vocación y Estatus'
    }
];
