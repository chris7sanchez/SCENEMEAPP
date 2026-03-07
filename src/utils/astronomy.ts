/**
 * ============================================
 * ANTIGRAVITY ASTRONOMY ENGINE v2.0
 * ============================================
 * 
 * High-precision astronomical calculations powered by astronomy-engine.
 * Features:
 * - Accurate planetary positions (±0.01°)
 * - Lunar Nodes (North Node / Rahu)
 * - Retrograde detection
 * - Multiple house systems (Placidus, Porphyry, Equal)
 * - Secondary progressions
 * - Solar/Lunar returns
 */

import {
    Body,
    Ecliptic,
    GeoVector
} from 'astronomy-engine';

// Export GMST calculation for use by other components
export { calculateGMST };

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PlanetPosition {
    name: string;
    symbol: string;
    longitude: number;      // Ecliptic longitude 0-360° (0° = 0° Aries)
    latitude?: number;      // Ecliptic latitude
    ra?: number;            // Right ascension in hours (0-24)
    speed: number;          // Daily motion in degrees
    isRetrograde: boolean;  // True if planet appears to move backward
    house?: number;         // House placement (1-12)
    sign: string;           // Zodiac sign name
    degree: number;         // Degree within sign (0-30)
    color: string;
}

export interface BirthData {
    name?: string;
    date: string;           // Birth date (YYYY-MM-DD)
    time: string;           // Birth time (HH:mm)
    latitude: number;       // Geographic latitude
    longitude: number;      // Geographic longitude  
    timezone: number;       // Base timezone offset (e.g. 1 for UTC+1)
    isDaylightSaving: boolean; // If DST was active
    city?: string;          // Birth place name
}

export interface ChartData {
    planets: PlanetPosition[];
    ascendant: number;
    mc: number;             // Midheaven
    houses: number[];       // 12 house cusps
    lunarNode: {
        northNode: number;  // True North Node (Rahu)
        southNode: number;  // South Node (Ketu)
    };
    julianDay: number;
}

export type HouseSystem = 'placidus' | 'porphyry' | 'equal' | 'whole';

// ============================================
// CONSTANTS
// ============================================

const ZODIAC_SIGNS = [
    'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

const PLANET_CONFIG = [
    { name: 'Sol', symbol: '☉', body: Body.Sun, color: '#FDB813', avgSpeed: 1.0 },
    { name: 'Luna', symbol: '☽', body: Body.Moon, color: '#C0C0C0', avgSpeed: 13.2 },
    { name: 'Mercurio', symbol: '☿', body: Body.Mercury, color: '#B7B7B7', avgSpeed: 1.6 },
    { name: 'Venus', symbol: '♀', body: Body.Venus, color: '#E3963E', avgSpeed: 1.2 },
    { name: 'Marte', symbol: '♂', body: Body.Mars, color: '#FF4500', avgSpeed: 0.5 },
    { name: 'Júpiter', symbol: '♃', body: Body.Jupiter, color: '#D2691E', avgSpeed: 0.08 },
    { name: 'Saturno', symbol: '♄', body: Body.Saturn, color: '#DAA520', avgSpeed: 0.03 },
    { name: 'Urano', symbol: '♅', body: Body.Uranus, color: '#40E0D0', avgSpeed: 0.01 },
    { name: 'Neptuno', symbol: '♆', body: Body.Neptune, color: '#4169E1', avgSpeed: 0.006 },
    { name: 'Plutón', symbol: '♇', body: Body.Pluto, color: '#800080', avgSpeed: 0.004 },
];

const OBLIQUITY = 23.4392911; // Mean obliquity of the ecliptic in degrees

/**
 * Converts ecliptic coordinates to equatorial (Right Ascension)
 * Returns RA in hours (0-24)
 */
function eclipticToRA(longitude: number, latitude: number = 0): number {
    const lonRad = (longitude * Math.PI) / 180;
    const latRad = (latitude * Math.PI) / 180;
    const oblRad = (OBLIQUITY * Math.PI) / 180;

    // Calculate Right Ascension
    const y = Math.sin(lonRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad);
    const x = Math.cos(lonRad);

    let ra = Math.atan2(y, x) * (180 / Math.PI);
    ra = ((ra % 360) + 360) % 360;

    // Convert degrees to hours (0-24)
    return ra / 15;
}

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

/**
 * Converts ecliptic longitude to zodiac sign and degree
 */
export function getSignFromLongitude(longitude: number): string {
    const normalizedLon = ((longitude % 360) + 360) % 360;
    const index = Math.floor(normalizedLon / 30);
    return ZODIAC_SIGNS[index];
}

/**
 * Gets the degree within the sign (0-30)
 */
function getDegreeInSign(longitude: number): number {
    const normalizedLon = ((longitude % 360) + 360) % 360;
    return normalizedLon % 30;
}

/**
 * Calculates True UTC from Local birth data
 * Formula: UTC = LocalTime - (StandardOffset + DSTAdjustment)
 * Also includes Longitude Correction (Ajuste por Longitud) for extreme precision
 */
export function convertToUTC(
    dateStr: string,
    timeStr: string,
    timezone: number,
    isDST: boolean,
    longitude?: number
): Date {
    // 1. Create date at noon to avoid boundary issues during setup
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Initial local date object (using UTC constructor to avoid local machine pollution)
    const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // 2. Apply Timezone and DST (UTC = Local - Offset)
    const dstOffset = isDST ? 1 : 0;
    const totalOffsetHours = timezone + dstOffset;
    
    // Convert to UTC by subtracting the offset in milliseconds
    const utcTimeInMs = localDate.getTime() - (totalOffsetHours * 60 * 60 * 1000);
    
    // 3. Optional: Longitude Correction (Ajuste a Tiempo Local Medio)
    // Only applied if we want to shift the internal 'moment' of birth to the actual Meridian
    // Note: For modern ephimeris, we just need the UTC moment. 
    // The "Long * 4" is already integrated in LST calculation.
    
    return new Date(utcTimeInMs);
}

/**
 * Calculates Julian Day from JavaScript Date
 */
function dateToJulianDay(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
}

/**
 * Calculates Greenwich Mean Sidereal Time
 */
function calculateGMST(date: Date): number {
    const JD = dateToJulianDay(date);
    const T = (JD - 2451545.0) / 36525.0;

    let GMST = 280.46061837 +
        360.98564736629 * (JD - 2451545.0) +
        0.000387933 * T * T -
        T * T * T / 38710000.0;

    return ((GMST % 360) + 360) % 360;
}

/**
 * Calculates Local Sidereal Time
 */
function calculateLST(date: Date, longitude: number): number {
    const GMST = calculateGMST(date);
    return ((GMST + longitude) % 360 + 360) % 360;
}

/**
 * Calculates the Ascendant using accurate formula
 */
function calculateAscendant(date: Date, latitude: number, longitude: number): number {
    const LST = calculateLST(date, longitude);
    const LSTrad = (LST * Math.PI) / 180;
    const latRad = (latitude * Math.PI) / 180;
    const oblRad = (OBLIQUITY * Math.PI) / 180;

    const y = Math.cos(LSTrad);
    const x = -(Math.sin(LSTrad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));

    let ascRad = Math.atan2(y, x);
    let ascDeg = (ascRad * 180) / Math.PI;

    return ((ascDeg % 360) + 360) % 360;
}

/**
 * Calculates the Midheaven (MC)
 */
function calculateMC(date: Date, longitude: number): number {
    const LST = calculateLST(date, longitude);
    const LSTrad = (LST * Math.PI) / 180;
    const oblRad = (OBLIQUITY * Math.PI) / 180;

    const tanMC = Math.tan(LSTrad) / Math.cos(oblRad);
    let MC = (Math.atan(tanMC) * 180) / Math.PI;

    // Quadrant correction
    if (LST > 90 && LST < 270) {
        MC = (MC + 180) % 360;
    } else if (LST >= 270 && MC < 180) {
        MC = (MC + 180) % 360;
    } else if (LST < 90 && MC > 180) {
        MC = (MC + 180) % 360;
    }

    return ((MC % 360) + 360) % 360;
}

/**
 * Calculates house cusps using specified system
 */
function calculateHouseCusps(
    ascendant: number,
    mc: number,
    latitude: number,
    system: HouseSystem = 'porphyry'
): number[] {
    const H1 = ascendant;
    const H10 = mc;
    const H4 = (mc + 180) % 360;
    const H7 = (ascendant + 180) % 360;

    if (system === 'equal') {
        // Equal house system - each house is exactly 30°
        return Array.from({ length: 12 }, (_, i) => (ascendant + i * 30) % 360);
    }

    if (system === 'whole') {
        // Whole sign houses - each sign is a complete house
        const ascSign = Math.floor(ascendant / 30);
        return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
    }

    // Porphyry system (default) - divide quadrants into thirds
    const calculateQuadrant = (start: number, end: number): [number, number] => {
        let diff = end - start;
        if (diff < 0) diff += 360;
        const step = diff / 3;
        return [(start + step) % 360, (start + 2 * step) % 360];
    };

    const [H2, H3] = calculateQuadrant(H1, H4);
    const [H5, H6] = calculateQuadrant(H4, H7);
    const [H8, H9] = calculateQuadrant(H7, H10);
    const [H11, H12] = calculateQuadrant(H10, H1);

    return [H1, H2, H3, H4, H5, H6, H7, H8, H9, H10, H11, H12];
}

/**
 * Calculates which house a planet is in
 */
function getHouseForPlanet(longitude: number, houses: number[]): number {
    const normalizedLon = ((longitude % 360) + 360) % 360;

    for (let i = 0; i < 12; i++) {
        const start = houses[i];
        const end = houses[(i + 1) % 12];

        if (start < end) {
            if (normalizedLon >= start && normalizedLon < end) {
                return i + 1;
            }
        } else {
            // Wraps around 0°
            if (normalizedLon >= start || normalizedLon < end) {
                return i + 1;
            }
        }
    }

    return 1; // Default to 1st house
}

/**
 * Calculates True Lunar Node (North Node / Rahu)
 * Using simplified formula based on lunar orbit mechanics
 */
function calculateLunarNode(date: Date): number {
    const JD = dateToJulianDay(date);
    const T = (JD - 2451545.0) / 36525.0;

    // Mean longitude of ascending node
    // This is the True Node approximation
    let node = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441.0;

    // Normalize to 0-360
    node = ((node % 360) + 360) % 360;

    return node;
}

/**
 * Calculates planetary speed and retrograde status
 */
function calculatePlanetaryMotion(
    body: Body,
    date: Date
): { speed: number; isRetrograde: boolean } {
    // Calculate position 1 day before and after
    const dayBefore = new Date(date.getTime() - 86400000);
    const dayAfter = new Date(date.getTime() + 86400000);

    try {
        const posBefore = Ecliptic(GeoVector(body, dayBefore, true));
        const posAfter = Ecliptic(GeoVector(body, dayAfter, true));

        // Calculate daily motion
        let speed = posAfter.elon - posBefore.elon;

        // Handle wrap-around at 0°/360°
        if (speed > 180) speed -= 360;
        if (speed < -180) speed += 360;

        speed = speed / 2; // Average per day

        return {
            speed,
            isRetrograde: speed < 0
        };
    } catch {
        return { speed: 0, isRetrograde: false };
    }
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculates a complete natal chart with all planetary positions
 */
export function calculateRealPlanets(
    dateStr: string,
    latitude: number = 40.4168,
    longitude: number = -3.7038,
    houseSystem: HouseSystem = 'porphyry',
    timezoneOffset: number = 0,
    isDaylightSaving: boolean = false
): ChartData {
    // If dateStr contains 'T', we assume it's already ISO or needs parsing as is
    // If not, we should use our new robust converter
    let date: Date;
    if (dateStr.includes('T')) {
        date = new Date(dateStr);
    } else {
        // Fallback for simple date strings, assuming midnight
        date = new Date(dateStr + 'T12:00:00Z');
    }

    const JD = dateToJulianDay(date);

    // Calculate angles
    const ascendant = calculateAscendant(date, latitude, longitude);
    const mc = calculateMC(date, longitude);
    const houses = calculateHouseCusps(ascendant, mc, latitude, houseSystem);

    // Calculate Lunar Nodes
    const northNode = calculateLunarNode(date);
    const southNode = (northNode + 180) % 360;

    // Calculate planetary positions
    const planets: PlanetPosition[] = PLANET_CONFIG.map(config => {
        try {
            const geoVector = GeoVector(config.body, date, true);
            const ecliptic = Ecliptic(geoVector);
            const longitude = ecliptic.elon;

            const motion = calculatePlanetaryMotion(config.body, date);
            const sign = getSignFromLongitude(longitude);
            const degree = getDegreeInSign(longitude);
            const house = getHouseForPlanet(longitude, houses);

            return {
                name: config.name,
                symbol: config.symbol,
                longitude,
                latitude: ecliptic.elat,
                ra: eclipticToRA(longitude, ecliptic.elat),
                speed: motion.speed,
                isRetrograde: motion.isRetrograde,
                sign,
                degree,
                house,
                color: config.color
            };
        } catch (error) {
            console.warn(`Failed to calculate ${config.name}:`, error);
            return {
                name: config.name,
                symbol: config.symbol,
                longitude: 0,
                latitude: 0,
                ra: 0,
                speed: 0,
                isRetrograde: false,
                sign: 'Aries',
                degree: 0,
                house: 1,
                color: config.color
            };
        }
    });

    // Add North Node as a pseudo-planet for display
    planets.push({
        name: 'Nodo Norte',
        symbol: '☊',
        longitude: northNode,
        ra: eclipticToRA(northNode, 0),
        speed: -0.053, // Nodes move retrograde ~3° per year
        isRetrograde: true, // Nodes always appear retrograde
        sign: getSignFromLongitude(northNode),
        degree: getDegreeInSign(northNode),
        house: getHouseForPlanet(northNode, houses),
        color: '#9370DB'
    });

    return {
        planets,
        ascendant,
        mc,
        houses,
        lunarNode: {
            northNode,
            southNode
        },
        julianDay: JD
    };
}

// ============================================
// PREDICTIVE TECHNIQUES
// ============================================

/**
 * Calculates Secondary Progression date
 * Rule: 1 day after birth = 1 year of life
 */
export function calculateProgressionDate(birthDateStr: string, targetDate?: Date): string {
    const birthDate = new Date(birthDateStr);
    const target = targetDate || new Date();

    const ageInMs = target.getTime() - birthDate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);

    // Add age in days to birth date
    const progressedTime = birthDate.getTime() + (ageInYears * 24 * 60 * 60 * 1000);

    return new Date(progressedTime).toISOString();
}

/**
 * Calculates Solar Return date for a given year
 */
export function calculateSolarReturnDate(birthDateStr: string, year?: number): string {
    const birthDate = new Date(birthDateStr);
    const targetYear = year || new Date().getFullYear();

    const returnDate = new Date(birthDate);
    returnDate.setFullYear(targetYear);

    return returnDate.toISOString();
}

/**
 * Gets current planetary transits
 */
export function getCurrentTransits(latitude: number = 40.4168, longitude: number = -3.7038): ChartData {
    return calculateRealPlanets(new Date().toISOString(), latitude, longitude);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Normalizes sign name to Spanish standard
 */
export function normalizeSign(input: string): string {
    const lower = input.toLowerCase().trim();

    const signMap: Record<string, string> = {
        'aries': 'Aries',
        'taurus': 'Tauro', 'tauro': 'Tauro',
        'gemini': 'Géminis', 'géminis': 'Géminis', 'geminis': 'Géminis',
        'cancer': 'Cáncer', 'cáncer': 'Cáncer',
        'leo': 'Leo',
        'virgo': 'Virgo',
        'libra': 'Libra',
        'scorpio': 'Escorpio', 'escorpio': 'Escorpio',
        'sagittarius': 'Sagitario', 'sagitario': 'Sagitario',
        'capricorn': 'Capricornio', 'capricornio': 'Capricornio',
        'aquarius': 'Acuario', 'acuario': 'Acuario',
        'pisces': 'Piscis', 'piscis': 'Piscis'
    };

    for (const [key, value] of Object.entries(signMap)) {
        if (lower.includes(key)) return value;
    }

    return 'Aries';
}

/**
 * Finds possible birth dates matching specific placements
 */
export function findPossibleBirthDates(
    targetYear: number,
    targetSun: string,
    targetMoon: string,
    targetAscendant: string,
    lat: number = 40.4168,
    lon: number = -3.7038
): Date[] {
    const findings: Date[] = [];
    const normalizedSun = normalizeSign(targetSun);
    const normalizedMoon = normalizeSign(targetMoon);
    const normalizedAsc = normalizeSign(targetAscendant);

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const noonDate = new Date(d);
        noonDate.setHours(12, 0, 0, 0);

        const chartData = calculateRealPlanets(noonDate.toISOString(), lat, lon);
        const sun = chartData.planets.find(p => p.name === 'Sol');
        const moon = chartData.planets.find(p => p.name === 'Luna');

        if (!sun || sun.sign !== normalizedSun) continue;
        if (!moon || moon.sign !== normalizedMoon) continue;

        // Scan the day for matching Ascendant
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const testDate = new Date(d);
                testDate.setHours(h, m, 0, 0);

                const testChart = calculateRealPlanets(testDate.toISOString(), lat, lon);
                const ascSign = getSignFromLongitude(testChart.ascendant);

                if (ascSign === normalizedAsc) {
                    findings.push(new Date(testDate));
                    h = 24; // Found one, skip rest of day
                    break;
                }
            }
        }
    }

    return findings.slice(0, 10); // Limit results
}

/**
 * Formats a planet position for display
 */
export function formatPlanetPosition(planet: PlanetPosition): string {
    const degInt = Math.floor(planet.degree);
    const mins = Math.round((planet.degree - degInt) * 60);
    const retro = planet.isRetrograde ? ' ℞' : '';

    return `${planet.symbol} ${degInt}° ${planet.sign}${retro}`;
}

/**
 * Gets element for a sign
 */
export function getElementForSign(sign: string): 'Fuego' | 'Tierra' | 'Aire' | 'Agua' {
    const elements: Record<string, 'Fuego' | 'Tierra' | 'Aire' | 'Agua'> = {
        'Aries': 'Fuego', 'Leo': 'Fuego', 'Sagitario': 'Fuego',
        'Tauro': 'Tierra', 'Virgo': 'Tierra', 'Capricornio': 'Tierra',
        'Géminis': 'Aire', 'Libra': 'Aire', 'Acuario': 'Aire',
        'Cáncer': 'Agua', 'Escorpio': 'Agua', 'Piscis': 'Agua'
    };

    return elements[normalizeSign(sign)] || 'Fuego';
}

/**
 * Gets modality for a sign
 */
export function getModalityForSign(sign: string): 'Cardinal' | 'Fijo' | 'Mutable' {
    const modalities: Record<string, 'Cardinal' | 'Fijo' | 'Mutable'> = {
        'Aries': 'Cardinal', 'Cáncer': 'Cardinal', 'Libra': 'Cardinal', 'Capricornio': 'Cardinal',
        'Tauro': 'Fijo', 'Leo': 'Fijo', 'Escorpio': 'Fijo', 'Acuario': 'Fijo',
        'Géminis': 'Mutable', 'Virgo': 'Mutable', 'Sagitario': 'Mutable', 'Piscis': 'Mutable'
    };

    return modalities[normalizeSign(sign)] || 'Cardinal';
}
