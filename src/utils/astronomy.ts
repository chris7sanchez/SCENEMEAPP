import { Body, Ecliptic, GeoVector } from 'astronomy-engine';

export interface PlanetPosition {
    name: string;
    symbol: string;
    longitude: number; // 0-360 degrees (0 = Aries)
    speed: number;
    house?: number;
    color: string;
}

export interface BirthData {
    name?: string; // User's Name / Alias
    date: string;
    latitude: number;
    longitude: number;
    time?: string;
    city?: string; // Birth Place Name
}

const PLANET_DATA = [
    { name: 'Sol', symbol: '☉', body: Body.Sun, color: '#FDB813' },
    { name: 'Luna', symbol: '☽', body: Body.Moon, color: '#C0C0C0' },
    { name: 'Mercurio', symbol: '☿', body: Body.Mercury, color: '#B7B7B7' },
    { name: 'Venus', symbol: '♀', body: Body.Venus, color: '#E3963E' },
    { name: 'Marte', symbol: '♂', body: Body.Mars, color: '#FF4500' },
    { name: 'Júpiter', symbol: '♃', body: Body.Jupiter, color: '#D2691E' },
    { name: 'Saturno', symbol: '♄', body: Body.Saturn, color: '#DAA520' },
    { name: 'Urano', symbol: '♅', body: Body.Uranus, color: '#40E0D0' },
    { name: 'Neptuno', symbol: '♆', body: Body.Neptune, color: '#4169E1' },
    { name: 'Plutón', symbol: '♇', body: Body.Pluto, color: '#800080' },
];

/**
 * Calculates the Ascendant (Rising Sign) in degrees.
 * Based on the formula: tan(Asc) = cos(LST) / -(sin(LST) * cos(Eps) + tan(Lat) * sin(Eps))
 */
function calculateAscendant(date: Date, latitude: number, longitude: number): number {
    // 1. Calculate Julian Day
    // astronomy-engine uses its own date handling usually, but we can use native Date
    // We need Local Sidereal Time (LST).

    // Calculate Greenwich Sidereal Time (GMST) first
    // Julian Day
    const time = date.getTime();
    const JD = (time / 86400000) + 2440587.5;
    const T = (JD - 2451545.0) / 36525.0;

    // GMST in degrees
    let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
    GMST = (GMST % 360 + 360) % 360; // Normalize 0-360

    // Local Sidereal Time (LST) = GMST + Longitude
    const LST = (GMST + longitude) % 360;
    const LSTrad = (LST * Math.PI) / 180;

    // Obliquity of Ecliptic (Eps) - approx 23.439 degrees
    // More precise: Eps = 23° 26' 21.406" - 46.815" * T ...
    const Eps = 23.4392911;
    const EpsRad = (Eps * Math.PI) / 180;

    const latRad = (latitude * Math.PI) / 180;

    // Formula for Ascendant
    // tan(Asc) = y / x
    // y = cos(LST)
    // x = - (sin(LST) * cos(Eps) + tan(Lat) * sin(Eps))

    const y = Math.cos(LSTrad);
    const x = -(Math.sin(LSTrad) * Math.cos(EpsRad) + Math.tan(latRad) * Math.sin(EpsRad));

    let ascRad = Math.atan2(y, x);
    let ascDeg = (ascRad * 180) / Math.PI;

    return (ascDeg + 360) % 360;
}

/**
 * Calculates accurate planetary positions using astronomy-engine.
 */
export function calculateRealPlanets(dateStr: string, latitude: number = 40.4168, longitude: number = -3.7038): {
    planets: PlanetPosition[],
    ascendant: number,
    houses: number[]
} {
    const date = new Date(dateStr);

    // Calculate Ascendant
    const ascendant = calculateAscendant(date, latitude, longitude);

    // 1. Calculate MC (Midheaven)
    // MC is the intersection of the Meridian and the Ecliptic.
    // tan(MC) = tan(RAMC) / cos(Eps)
    // RAMC = LST

    // We need to re-calculate LST here or extract it.
    // Let's copy the LST logic briefly.
    const time = date.getTime();
    const JD = (time / 86400000) + 2440587.5;
    const T = (JD - 2451545.0) / 36525.0;
    let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
    GMST = (GMST % 360 + 360) % 360;
    const LST = (GMST + longitude) % 360;
    const LSTrad = (LST * Math.PI) / 180;
    const Eps = 23.4392911; // Obliquity
    const EpsRad = (Eps * Math.PI) / 180;

    // MC Calculation
    const tanMC = Math.tan(LSTrad) / Math.cos(EpsRad);
    let MC = (Math.atan(tanMC) * 180) / Math.PI;
    if (MC < 0) MC += 360;

    // Adjust quadrant for MC
    if (LST > 90 && LST < 270) {
        MC = (MC + 180) % 360;
    } else if (LST >= 270 && MC < 180) {
        MC = (MC + 180) % 360;
    } else if (LST < 90 && MC > 180) {
        MC = (MC + 180) % 360;
    }

    // Now we have Ascendant (House 1) and MC (House 10).
    // We will use Porphyry system (simplest unequal system) to satisfy "Real Sizes".
    // Porphyry divides the quadrants into 3 equal parts.

    const H1 = ascendant;
    const H10 = MC;
    const H4 = (MC + 180) % 360; // IC
    const H7 = (ascendant + 180) % 360; // Descendant

    // Quadrant 1: H1 to H4 (Eastern Hemisphere, Bottom) - Houses 1, 2, 3
    let diff14 = (H4 - H1);
    if (diff14 < 0) diff14 += 360;
    const step14 = diff14 / 3;
    const H2 = (H1 + step14) % 360;
    const H3 = (H1 + 2 * step14) % 360;

    // Quadrant 2: H4 to H7 - Houses 4, 5, 6
    let diff47 = (H7 - H4);
    if (diff47 < 0) diff47 += 360;
    const step47 = diff47 / 3;
    const H5 = (H4 + step47) % 360;
    const H6 = (H4 + 2 * step47) % 360;

    // Quadrant 3: H7 to H10 - Houses 7, 8, 9
    let diff710 = (H10 - H7);
    if (diff710 < 0) diff710 += 360;
    const step710 = diff710 / 3;
    const H8 = (H7 + step710) % 360;
    const H9 = (H7 + 2 * step710) % 360;

    // Quadrant 4: H10 to H1 - Houses 10, 11, 12
    let diff101 = (H1 - H10);
    if (diff101 < 0) diff101 += 360;
    const step101 = diff101 / 3;
    const H11 = (H10 + step101) % 360;
    const H12 = (H10 + 2 * step101) % 360;

    const houses = [H1, H2, H3, H4, H5, H6, H7, H8, H9, H10, H11, H12];

    const planets = PLANET_DATA.map(p => {
        // 1. Get Geocentric Equatorial Vector
        const geoVector = GeoVector(p.body, date, true); // true = correct for light time

        // 2. Convert to Ecliptic Coordinates
        // Ecliptic(vector) returns {elon, elat} in degrees
        const eclipticPos = Ecliptic(geoVector);

        return {
            name: p.name,
            symbol: p.symbol,
            longitude: eclipticPos.elon, // Ecliptic Longitude
            speed: 0,
            color: p.color
        };
    });

    return { planets, ascendant, houses };
}

/**
 * Calculates the date for Secondary Progressions.
 * Rule: 1 Day after birth = 1 Year of life.
 */
export function calculateProgressionDate(birthDateStr: string): string {
    const birthDate = new Date(birthDateStr);
    const now = new Date();

    // Calculate age in years
    const ageInMilliseconds = now.getTime() - birthDate.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    // Add ageInYears days to birthDate
    // 1 year (life) = 1 day (ephemeris)
    const progressionTime = birthDate.getTime() + (ageInYears * 24 * 60 * 60 * 1000);

    return new Date(progressionTime).toISOString();
}

/**
 * Calculates the approximate Solar Return date for the current year.
 * (Simplified: Returns this year's birthday)
 */
export function calculateSolarReturnDate(birthDateStr: string): string {
    const birthDate = new Date(birthDateStr);
    const now = new Date();

    const currentYear = now.getFullYear();
    const returnDate = new Date(birthDate);
    returnDate.setFullYear(currentYear);

    // If the birthday hasn't happened yet this year, maybe show last year's? 
    // Usually people want the upcoming or current active one.
    // If today is Dec 2025 and bday is Nov 2025, we show Nov 2025.
    // If today is Jan 2025 and bday is Nov 2025, we might show Nov 2024 or Nov 2025.
    // Let's just default to the current calendar year's birthday.

    return returnDate.toISOString();
}

// --- REVERSE SEARCH EXPERIMENTAL LOGIC ---

const ZODIAC_SIGNS_LIST = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

export function getSignFromLongitude(lon: number): string {
    const index = Math.floor(lon / 30) % 12;
    return ZODIAC_SIGNS_LIST[index];
}

export function normalizeSign(s: string): string {
    const lower = s.toLowerCase();
    if (lower.includes('aries')) return 'Aries';
    if (lower.includes('taur') || lower.includes('tauro')) return 'Tauro';
    if (lower.includes('gem') || lower.includes('gém')) return 'Géminis';
    if (lower.includes('can') || lower.includes('cán')) return 'Cáncer';
    if (lower.includes('leo')) return 'Leo';
    if (lower.includes('vir')) return 'Virgo';
    if (lower.includes('lib')) return 'Libra';
    if (lower.includes('scor') || lower.includes('esc')) return 'Escorpio';
    if (lower.includes('sag')) return 'Sagitario';
    if (lower.includes('cap')) return 'Capricornio';
    if (lower.includes('aqu') || lower.includes('acu')) return 'Acuario';
    if (lower.includes('pis')) return 'Piscis';
    return 'Aries';
}

export function findPossibleBirthDates(
    targetYear: number,
    targetSun: string,
    targetMoon: string,
    targetAscendant: string,
    lat: number = 40.4168,
    lon: number = -3.7038
): Date[] {
    const findings: Date[] = [];
    // Start search from Jan 1 to Dec 31
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    // Optimization key: Sun only moves 1 deg/day.
    // We can step through days.

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Calculate noon position for broader planet check (Sun/Moon)
        const dateStr = d.toISOString();
        const solarData = calculateRealPlanets(dateStr, lat, lon);

        const sun = solarData.planets.find(p => p.name === 'Sol');
        if (!sun) continue;

        const currentSunSign = getSignFromLongitude(sun.longitude);

        // 1. Check Sun
        if (normalizeSign(currentSunSign) === normalizeSign(targetSun)) {

            // 2. Check Moon (Moves ~13 deg/day)
            // It might enter or leave the sign within this day.
            // Check noon Moon first.
            const moon = solarData.planets.find(p => p.name === 'Luna');
            const currentMoonSign = moon ? getSignFromLongitude(moon.longitude) : '';

            // If Noon Moon matches, good candidate day.
            // If not, maybe check beginning/end of day? 
            // For simplicity/performance, Noon Moon check covers most of the day, 
            // but let's be slightly more robust: check 4 slots? (00, 06, 12, 18)
            // Actually, let's keep it simple: If noon matches, we scan the day for ascendant.

            if (normalizeSign(currentMoonSign) === normalizeSign(targetMoon)) {

                // 3. Check Ascendant
                // Scan the day in 20 min increments to find the rising sign window.
                for (let h = 0; h < 24; h++) {
                    for (let m = 0; m < 60; m += 20) {
                        const testDate = new Date(d);
                        testDate.setHours(h, m);

                        const ascDeg = calculateAscendant(testDate, lat, lon);
                        const ascSign = getSignFromLongitude(ascDeg);

                        if (normalizeSign(ascSign) === normalizeSign(targetAscendant)) {
                            findings.push(testDate);
                            // Skip rest of day to avoid 50 results for the same day
                            h = 24; m = 60;
                        }
                    }
                }
            }
        }
    }

    return findings;
}
