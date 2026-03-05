import { TagOption } from "./types";

export const GENRES = [
    { id: 'drama', label: 'Drama', emoji: '🎭', description: 'Emociones profundas y conflictos serios.' },
    { id: 'comedy', label: 'Comedia', emoji: '😂', description: 'Situaciones divertidas y humor.' },
    { id: 'thriller', label: 'Thriller', emoji: '🔪', description: 'Suspenso, tensión y misterio.' },
    { id: 'scifi', label: 'Ciencia Ficción', emoji: '👽', description: 'Futuro, tecnología y lo desconocido.' },
    { id: 'romance', label: 'Romance', emoji: '❤️', description: 'Amor, pasión y relaciones.' },
    { id: 'action', label: 'Acción', emoji: '💥', description: 'Adrenalina, movimiento y riesgo.' },
    { id: 'monologue', label: 'Monólogo', emoji: '🗣️', description: 'Pieza individual introspectiva.' },
];

export const DYNAMICS = [
    { id: "m-f", label: "Hombre - Mujer", desc: "Escena clásica de pareja o conflicto mixto." },
    { id: "f-f", label: "Mujer - Mujer", desc: "Interacción entre dos personajes femeninos." },
    { id: "m-m", label: "Hombre - Hombre", desc: "Interacción entre dos personajes masculinos." },
    { id: "solo", label: "Monólogo", desc: "Tú solo frente a la cámara. Demuestra tu rango." },
    { id: "triad", label: "Trío", desc: "Dinámica compleja entre tres personajes." },
    { id: "ensemble", label: "Grupo", desc: "Escena coral con múltiples personajes." }
];

export const TONES: TagOption[] = [
    "Confiado / Esperanzador", "Dramático", "Cómico",
    "Intrigante", "Trágico", "Romántico",
    "Melancólico", "Serio", "Naturalista",
    "Independiente"
];
export const LOCATIONS: TagOption[] = [
    "Casa / Sala de estar", "Casa / Habitación", "Casa / Cocina",
    "Casa / Baño", "Exterior / Parque", "Exterior / Calle",
    "Oficina / Lugar de trabajo", "Interior / Restaurante", "Interior / Bar"
];
export const LENGTHS: TagOption[] = [
    { id: "60", label: "60 min (Sin suplemento)" },
    { id: "90", label: "90 min (Sin suplemento)" },
    { id: "120", label: "120 min (+8%)" },
    { id: "180", label: "180 min (+10%)" },
    { id: "240", label: "240 min (+15%)" }
];
export const STEPS = ["El Plan Perfecto", "Selección", "Género", "Reparto", "Detalles", "Guion", "Presupuesto", "Finalizar"];
export const PHOTO_STEPS = ["El Plan Perfecto", "Selección de Sesión", "Fechas", "Finalizar"];

export const ETHNICITIES = [
    "Caucásico",
    "Latino / Hispano",
    "Afrodescendiente",
    "Asiático",
    "Árabe / Medio Oriente",
    "Indígena",
    "Multirracial",
    "Otro"
];

// Mock available dates (e.g., next 2 months, some random days)
// In a real app, this would come from a backend/CMS
export const AVAILABLE_DATES = [
    new Date(2025, 11, 10), // Dec 10, 2025
    new Date(2025, 11, 12),
    new Date(2025, 11, 15),
    new Date(2025, 11, 20),
    new Date(2026, 0, 5),   // Jan 5, 2026
    new Date(2026, 0, 8),
    new Date(2026, 0, 15),
    new Date(2026, 0, 22),
];

export const PHOTO_TYPES = [
    { id: 'actor', label: 'Book Actoral', desc: 'Material esencial para casting.' },
    { id: 'editorial', label: 'Book Editorial', desc: 'Moda, Street Style y tendencias.' },
    { id: 'conceptual', label: 'Book Conceptual', desc: 'Narrativa visual y conceptos creativos.' },
    { id: 'event', label: 'Otras Peticiones', desc: 'Eventos, marcas y proyectos a medida.' }
];

export const PHOTO_PACKS_ACTOR = [
    {
        id: 'essential',
        label: 'Básico / Esencial',
        price: '150€',
        features: ['8 Fotos Retocadas', 'Mejor iluminación y calidad', 'Toda la calidad que necesitas para mostrar tu mejor versión.', 'Entrega digital']
    },
    {
        id: 'complete',
        label: 'Completo',
        price: '299€',
        features: ['12-15 Fotos Retocadas', 'Máxima calidad y mejor luz', 'Variedad de planos y perfiles', 'Entrega digital']
    },
    {
        id: 'premium',
        label: 'Premium',
        price: '399€',
        features: ['15+ Fotos Retocadas', '3 Cambios de Ropa', 'Maquillaje y Peluquería', 'Reel de presentación (4K)']
    }
];

export const PHOTO_PACKS_EDITORIAL = [
    { id: 'street', label: 'Street Style', price: '250€', features: ['Luz natural / Exterior', '2 horas de sesión', '2 Cambios'] },
    { id: 'fashion', label: 'Fashion Style', price: '350€', features: ['Iluminación Estudio', '3 horas de sesión', '3 Cambios'] },
    { id: 'concept', label: 'Editorial Design', price: '450€', features: ['Dirección de Arte', '3 horas de sesión', 'Iluminación creativa'] }
];

export const PHOTO_PACKS_CONCEPTUAL = [
    { id: 'creative', label: 'Creative Concept', price: '300€', features: ['Concepto a medida', '2 horas de sesión', 'Edición artística'] },
    { id: 'story', label: 'Visual Story', price: '500€', features: ['Storytelling visual', '4 horas de sesión', 'Escenografía incluida'] }
];

// GALERIA DE FOTOS (Configuración rápida para el usuario)
// Cambia los nombres de los archivos aquí para actualizar las fotos de cada book
// GALERIA DE FOTOS (Configuración técnica de proporciones y orden)
export const PHOTO_GALLERY = {
    actor: [
        { src: '/trabajos/2.jpg', isWide: false }, // PX2
        { src: '/trabajos/8.jpg', isWide: false }, // PX2 (Chico)
        { src: '/trabajos/9.jpg', isWide: false }  // PX3 (Chica)
    ],
    editorial: [
        { src: '/trabajos/4.jpg', isWide: false }, // PX1
        { src: '/trabajos/6.jpg', isWide: true },  // PX3 (Chica tumbada - Alargada)
        { src: '/trabajos/5.jpg', isWide: false }  // PX2
    ],
    conceptual: [
        { src: '/trabajos/3.jpg', isWide: false }, // PX3 de actoral (Caballo)
        { src: '/trabajos/7.jpg', isWide: true },  // PX2 (Concepto Alargado)
        { src: '/trabajos/1.jpg', isWide: false }  // PX1 de actoral
    ],
    default: [
        { src: '/trabajos/10.jpg', isWide: false },
        { src: '/trabajos/11.jpg', isWide: false },
        { src: '/trabajos/1.jpg', isWide: false }
    ]
};


