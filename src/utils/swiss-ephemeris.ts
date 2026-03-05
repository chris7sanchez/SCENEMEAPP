/**
 * ============================================
 * SWISS EPHEMERIS WRAPPER (Fallback Mode)
 * ============================================
 * 
 * This module provides a Swiss Ephemeris-compatible API using
 * our astronomy-engine based calculations as a fallback.
 * 
 * When swisseph-wasm is properly installed and configured,
 * this module can be updated to use the actual Swiss Ephemeris.
 * 
 * Current status: Using astronomy-engine fallback
 */

import { calculateRealPlanets, type ChartData, type PlanetPosition } from './astronomy';

// Type exports for compatibility
export interface SwissPlanetPosition {
    name: string;
    longitude: number;
    speed: number;
    house?: number;
    isRetrograde: boolean;
}

export interface SwissHouseSystem {
    cusps: number[];
    ascendant: number;
    mc: number;
}

export interface SwissChartResult {
    planets: SwissPlanetPosition[];
    houses: SwissHouseSystem;
    ascendant: number;
    mc: number;
}

/**
 * Calculate a complete chart using Swiss Ephemeris
 * Currently falls back to astronomy-engine implementation
 */
export const calculateSwissChart = async (
    date: Date,
    lat: number,
    lon: number
): Promise<SwissChartResult> => {
    console.log(`[SwissEph] Calculating chart for ${date.toISOString()} at ${lat}, ${lon}`);
    console.log('[SwissEph] Note: Using astronomy-engine fallback (swisseph-wasm not installed)');

    try {
        // Use our astronomy-engine based calculations
        const chartData = calculateRealPlanets(date.toISOString(), lat, lon);

        // Convert to Swiss Ephemeris format
        const planets: SwissPlanetPosition[] = chartData.planets.map(p => ({
            name: p.name,
            longitude: p.longitude,
            speed: p.speed,
            house: p.house,
            isRetrograde: p.isRetrograde
        }));

        const houses: SwissHouseSystem = {
            cusps: chartData.houses,
            ascendant: chartData.ascendant,
            mc: chartData.mc
        };

        return {
            planets,
            houses,
            ascendant: chartData.ascendant,
            mc: chartData.mc
        };
    } catch (error) {
        console.error('[SwissEph] Error in calculateSwissChart:', error);
        throw error;
    }
};

/**
 * Get Julian Day for a date
 */
export const getJulianDay = async (date: Date): Promise<number> => {
    // Julian Day calculation
    const JD = (date.getTime() / 86400000) + 2440587.5;
    return JD;
};

/**
 * Status of Swiss Ephemeris initialization
 */
export const getSwissEphStatus = (): {
    initialized: boolean;
    mode: 'native' | 'fallback';
    version: string;
} => {
    return {
        initialized: true,
        mode: 'fallback',
        version: 'astronomy-engine-2.x'
    };
};
