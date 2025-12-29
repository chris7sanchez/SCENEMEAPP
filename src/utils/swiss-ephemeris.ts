import swissephFactory from 'swisseph-wasm';

// --- SINGLETON INITIALIZATION ---
let swisseph: any = null;
let initPromise: Promise<any> | null = null;

const ensureSwisseph = async () => {
    if (swisseph) return swisseph;
    if (!initPromise) {
        console.log("[SwissEph] Initializing WASM module...");
        initPromise = (async () => {
            try {
                // 1. Instantiate the class
                const instance = new (swissephFactory as any)();

                // 2. Explicitly initialize the WASM backend
                // The logs showed 'initSwissEph' in the prototype.
                if (typeof instance.initSwissEph === 'function') {
                    console.log("[SwissEph] Calling initSwissEph()...");
                    await instance.initSwissEph();
                    console.log("[SwissEph] initSwissEph() completed.");
                } else {
                    console.warn("[SwissEph] initSwissEph not found on instance, hoping it's auto-init...");
                }

                swisseph = instance;
                return instance;
            } catch (err) {
                console.error("[SwissEph] Initialization failed:", err);
                throw err;
            }
        })();
    }
    return initPromise;
};

// --- CONSTANTS MAPPING ---
// We can't access constants from 'swisseph' variable until it's initialized.
// However, standard SwissEph Integer constants (SE_SUN=0 etc) are universal.
// We will access them from the initialized instance dynamically.

export interface PlanetPosition {
    name: string;
    longitude: number;
    speed: number;
    house?: number;
    isRetrograde: boolean;
}

export interface HouseSystem {
    cusps: number[];
    ascendant: number;
    mc: number;
}

const getBodyName = (id: number, lib: any): string => {
    switch (id) {
        case lib.SE_SUN: return 'Sol';
        case lib.SE_MOON: return 'Luna';
        case lib.SE_MERCURY: return 'Mercurio';
        case lib.SE_VENUS: return 'Venus';
        case lib.SE_MARS: return 'Marte';
        case lib.SE_JUPITER: return 'Júpiter';
        case lib.SE_SATURN: return 'Saturno';
        case lib.SE_URANUS: return 'Urano';
        case lib.SE_NEPTUNE: return 'Neptuno';
        case lib.SE_PLUTO: return 'Plutón';
        case lib.SE_CHIRON: return 'Quirón';
        case lib.SE_LILITH: return 'Lilith';
        case lib.SE_TRUE_NODE: return 'Nodo Norte';
        default: return `Cuerpo ${id}`;
    }
};

/**
 * Función Principal: Obtener Carta Completa
 */
export const calculateSwissChart = async (date: Date, lat: number, lon: number) => {
    console.log(`[SwissEph] Calculating chart for ${date.toISOString()} at ${lat}, ${lon}`);

    try {
        const lib = await ensureSwisseph();

        // Define flags
        const flag = lib.SEFLG_SPEED | lib.SEFLG_SWIEPH;

        // Julian Day
        const jd = lib.julday(
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate(),
            date.getUTCHours() + date.getUTCMinutes() / 60,
            lib.SE_GREG_CAL
        );

        // Bodies to calculate
        // We access constants dynamically from the lib instance
        const bodyIds = [
            lib.SE_SUN, lib.SE_MOON, lib.SE_MERCURY, lib.SE_VENUS,
            lib.SE_MARS, lib.SE_JUPITER, lib.SE_SATURN, lib.SE_URANUS,
            lib.SE_NEPTUNE, lib.SE_PLUTO, lib.SE_CHIRON, lib.SE_TRUE_NODE
        ];


        const planets = bodyIds.map((bodyId: number) => {
            const result = lib.calc_ut(jd, bodyId, flag);
            if (result.error) {
                console.warn(`[SwissEph] Error calculating body ${bodyId}:`, result.error);
                return { name: 'Error', longitude: 0, speed: 0, isRetrograde: false };
            }
            return {
                name: getBodyName(bodyId, lib),
                longitude: result.longitude,
                speed: result.longitudeSpeed,
                isRetrograde: result.longitudeSpeed < 0
            };
        });

        // Houses
        // 'P' = Placidus
        const houseResult = lib.houses(jd, lat, lon, 'P'.charCodeAt(0));

        const houses = {
            cusps: houseResult.houseCusps,
            ascendant: houseResult.ascendant,
            mc: houseResult.mc
        };

        return {
            planets,
            houses,
            ascendant: houses.ascendant,
            mc: houses.mc
        };
    } catch (error) {
        console.error("[SwissEph] CRITICAL ERROR in calculateSwissChart:", error);
        throw error;
    }
};

// Deprecated or Helper only if needed externally (must await lib)
export const getJulianDay = async (date: Date): Promise<number> => {
    const lib = await ensureSwisseph();
    return lib.julday(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours() + date.getUTCMinutes() / 60,
        lib.SE_GREG_CAL
    );
};
