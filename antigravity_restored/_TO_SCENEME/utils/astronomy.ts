import { Body, Ecliptic, GeoVector } from 'astronomy-engine';

export interface PlanetPosition {
    name: string;
    symbol: string;
    longitude: number; // 0-360 degrees (0 = Aries)
    speed: number;
    house?: number;
    color: string;
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

    // For specific house systems (Placidus is complex), we'll simulate Equal House system from Ascendant for now 
    // to ensure 12th house logic is somewhat sound relative to Ascendant.
    // Ideally we'd implement Placidus.
    // Let's stick to Equal Houses for stability in this iteration:
    // House 1 = Ascendant, House 2 = Asc + 30, etc.
    const houses = Array.from({ length: 12 }).map((_, i) => (ascendant + i * 30) % 360);

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
