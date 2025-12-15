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
