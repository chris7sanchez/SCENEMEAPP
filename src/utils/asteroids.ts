/**
 * ============================================
 * ASTEROIDES — efemérides reales vía JPL Horizons
 * ============================================
 *
 * Módulo AISLADO. No usa astronomy-engine ni toca el motor principal.
 * Devuelve la longitud eclíptica GEOCÉNTRICA y APARENTE, referida a la
 * eclíptica DE FECHA (justo lo que usa la astrología tropical) — la propia
 * cantidad "ObsEcLon" de Horizons ya incluye luz-tiempo y aberración, así
 * que NO hay que corregir precesión.
 *
 * Bodies (número de planeta menor en Horizons):
 *   Quirón = 2060, Ceres = 1, Pallas = 2, Juno = 3, Vesta = 4
 */

export interface AsteroidDef { name: string; symbol: string; horizons: string; color: string; }

export const ASTEROID_DEFS: AsteroidDef[] = [
    { name: 'Quirón', symbol: '⚷', horizons: '2060;', color: '#5C8A6F' },
    { name: 'Ceres',  symbol: '⚳', horizons: '1;',    color: '#6B8E23' },
    { name: 'Pallas', symbol: '⚴', horizons: '2;',    color: '#4682B4' },
    { name: 'Juno',   symbol: '⚵', horizons: '3;',    color: '#9370DB' },
    { name: 'Vesta',  symbol: '⚶', horizons: '4;',    color: '#CD853F' },
];

export interface AsteroidPosition {
    name: string;
    symbol: string;
    color: string;
    longitude: number; // 0–360, eclíptica de fecha
}

const ZODIAC = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
const norm360 = (lon: number) => ((lon % 360) + 360) % 360;
export function signOfLongitude(lon: number): string { return ZODIAC[Math.floor(norm360(lon) / 30)]; }
export function degreeInSign(lon: number): number { return Math.floor(norm360(lon) % 30); }

/** Extrae ObsEcLon de la primera fila de datos entre $$SOE/$$EOE de Horizons. */
export function parseHorizonsLongitude(text: string): number | null {
    const soe = text.indexOf('$$SOE');
    const eoe = text.indexOf('$$EOE');
    if (soe === -1 || eoe === -1) return null;
    const block = text.slice(soe + 5, eoe).trim();
    const firstLine = block.split('\n').map(l => l.trim()).filter(Boolean)[0];
    if (!firstLine) return null;
    // "2002-Feb-12 00:00   325.8996074  -7.3042659"  → [fecha, hora, ObsEcLon, ObsEcLat]
    const parts = firstLine.split(/\s+/);
    const lon = parseFloat(parts[2]);
    return Number.isFinite(lon) ? norm360(lon) : null;
}

function toYMD(dateISO: string): string {
    const d = new Date(dateISO);
    return isNaN(d.getTime()) ? dateISO.slice(0, 10) : d.toISOString().slice(0, 10);
}
function nextDayYMD(ymd: string): string {
    const d = new Date(ymd + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
}

/** Una sola consulta a Horizons para un asteroide en una fecha (YYYY-MM-DD). Solo servidor. */
export async function fetchAsteroidLongitude(def: AsteroidDef, ymd: string): Promise<number | null> {
    const params = new URLSearchParams({
        format: 'text',
        COMMAND: `'${def.horizons}'`,
        MAKE_EPHEM: 'YES',
        EPHEM_TYPE: 'OBSERVER',
        CENTER: "'500@399'",       // geocéntrico
        START_TIME: `'${ymd}'`,
        STOP_TIME: `'${nextDayYMD(ymd)}'`,
        STEP_SIZE: "'1 d'",
        QUANTITIES: "'31'",         // ObsEcLon / ObsEcLat (eclíptica de fecha, aparente)
    });
    const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`Horizons HTTP ${res.status}`);
    const text = await res.text();
    return parseHorizonsLongitude(text);
}

/** Los 5 asteroides para una fecha. Resiliente: devuelve los que respondan. Solo servidor. */
export async function fetchAllAsteroids(dateISO: string): Promise<AsteroidPosition[]> {
    const ymd = toYMD(dateISO);
    const results = await Promise.all(ASTEROID_DEFS.map(async (def) => {
        try {
            const lon = await fetchAsteroidLongitude(def, ymd);
            if (lon == null) return null;
            return { name: def.name, symbol: def.symbol, color: def.color, longitude: lon };
        } catch {
            return null;
        }
    }));
    return results.filter((r): r is AsteroidPosition => r !== null);
}
