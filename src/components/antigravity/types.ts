import { AnalyzeSynastryOutput } from '@/ai/schemas';

export type ViewMode = 'COSMOS' | 'BODY' | 'SPIRIT' | 'ALCHIMESTRY';

export type AlchimestrySubView = 'inicio' | 'identidad' | 'ciclos' | 'transformacion' | 'casas' | 'transmutador' | 'sinastria';

export interface UserData {
    name?: string;
    date: string;
    latitude: number;
    longitude: number;
    city?: string;
}

export type ChartTheme = 'classic' | 'modern' | 'alchemical';
export type CosmosViewMode = 'RADIAL' | 'SPHERE';

export interface CharacterProfile {
    id: string;
    name: string;
    birthData: {
        date: string;
        latitude?: number;
        longitude?: number;
        time?: string;
    };
    elements: {
        fire: number;
        earth: number;
        air: number;
        water: number;
    };
    fullAnalysis: any;
    deepAnalysis?: any;
}

export interface ThemeSettings {
    backgroundColor: string;
    accentColor: string;
    textColor: string;
    bgImage: string;
    bgOpacity: number;
    blurAmount: number;
    parallaxIntensity: number;
    fontFamily: 'serif' | 'sans';
    glassOpacity: number;
}

export interface ScriptAnalyzerState {
    viewMode: ViewMode;
    alchimestrySubView: AlchimestrySubView;
    currentUser: UserData | null;
    transitDate: Date;
    cosmosViewMode: CosmosViewMode;
    chartTheme: ChartTheme;
    themeSettings: ThemeSettings;
}
