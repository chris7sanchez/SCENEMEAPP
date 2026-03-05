export interface SceneData {
    genre: string;
    dynamic: string;
    tones: string[];
    locations: string[];
    logline: string;
    props: string;
    aiScene: string;
    surpriseMe: boolean;
    surpriseData: {
        word: string;
        movie: string;
        personality: "impulsive" | "adaptive" | "";
    };
    otherDetails: string;
}

export interface UserProfile {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    eyeColor: string;
    hairColor: string;
    height: string;
    ethnicity: string;
    experience: string;
    languages: string;
    photos: File[]; // In a real app, these would be URLs after upload
    video: File | null;
    videoUrl?: string; // External link (YouTube, Vimeo, etc.)
}

export interface FormData extends SceneData {
    packType: "one-scene" | "two-scenes";
    addEditing: boolean;

    // Data for Scene 2 (only used if packType is 'two-scenes')
    scene2: SceneData;

    // Global settings
    length: string;
    crewSize: number;
    shootingType: "standard" | "premium";
    discount: number;
    shootDates: Date[]; // Changed to array for multi-date selection
    preferredMonths: string[]; // List of preferred months if specific date is not selected
    city: string;
    contact: { name: string; email: string; phone: string };
    professionalScript: boolean;
    reviewByProfessional: boolean;
    professionalActors: boolean;

    // Photo Booking Fields
    serviceType: "scene" | "photo";
    photoType?: "actor" | "editorial" | "conceptual" | "event";
    photoPack?: string; // "essential", "complete", "premium", "street", "fashion", "concept"
}

export const initialSceneData: SceneData = {
    genre: "Drama",
    dynamic: "m-f",
    tones: ["Confiado / Esperanzador"],
    locations: ["Casa / Sala de estar"],
    logline: "",
    props: "",
    aiScene: "",
    surpriseMe: false,
    surpriseData: {
        word: "",
        movie: "",
        personality: ""
    },
    otherDetails: ""
};

export type TagOption = string | { id: string; label: string };
