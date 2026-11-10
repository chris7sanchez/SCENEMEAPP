// LOS PUNTOS DE LOS ESTUDIOS.
//
// 10/11/2026 (Christian): un sistema sencillo para que la comunidad tenga
// motivo para moverse. Se ganan puntos compartiendo tomas, recibiendo bravos y
// comentando a otros; los puntos se canjean por descuentos para Book de fotos,
// reel y Self-tape.
//
// Tres decisiones que lo mantienen sencillo y difícil de trampear:
//
// 1. NO HAY SALDO GUARDADO. Los puntos se calculan cada vez, en el servidor, a
//    partir de lo que de verdad hay en la Sala de visionado. No existe un
//    número que alguien pueda editar. Retirar una toma retira sus puntos.
// 2. LO ÚNICO QUE SE GUARDA SON LOS CANJES (colección `canjes`), y sólo los
//    escribe el servidor: ninguna regla de Firestore deja tocarla desde el
//    navegador.
// 3. EL DESCUENTO NO SE APLICA SOLO. Canjear da un código; SCENE ME lo ve en el
//    panel de administración y lo aplica al cerrar la sesión. Si algo huele a
//    trampa, se anula y los puntos vuelven.
//
// TODOS LOS NÚMEROS ESTÁN AQUÍ. Para cambiar cuánto vale cada cosa o qué
// descuento da cada premio, se toca este fichero y nada más.

/** Cuánto se gana por cada cosa. */
export const PUNTOS = {
    /** Por cada día en que compartes una toma (una al día cuenta). */
    toma: 10,
    /** Por cada bravo que otro actor da a una toma tuya. */
    bravo: 2,
    /** Por comentar la toma de otro actor (una vez por toma). */
    comentario: 3,
} as const;

/** Un comentario más corto que esto no puntúa: «ok» no es feedback. */
export const LARGO_MINIMO_COMENTARIO = 10;
/** Comentarios que puntúan en un mismo día, como mucho. */
export const TOPE_COMENTARIOS_DIA = 5;

export interface Premio {
    id: string;
    puntos: number;
    /** Tanto por ciento de descuento. */
    descuento: number;
}

/** De menos a más puntos. */
export const PREMIOS: readonly Premio[] = [
    { id: 'd5', puntos: 150, descuento: 5 },
    { id: 'd10', puntos: 300, descuento: 10 },
    { id: 'd15', puntos: 600, descuento: 15 },
];

/** En qué se puede gastar un descuento. */
export const DONDE_VALE = 'tu próximo Book de fotos, reel o Self-tape';

export interface Actividad {
    /** Días distintos en que compartió una toma que sigue publicada. */
    diasConToma: number;
    /** Bravos de otros actores a sus tomas (el propio no cuenta). */
    bravosRecibidos: number;
    /** Tomas de otros que ha comentado con algo de sustancia. */
    comentarios: number;
}

export type EstadoCanje = 'pendiente' | 'usado' | 'anulado';

export interface Canje {
    id: string;
    codigo: string;
    premioId: string;
    puntos: number;
    descuento: number;
    estado: EstadoCanje;
    creado: number;
}

/** Lo que el servidor ha visto en la Sala, antes de contar. */
export interface DatosActividad {
    /** Día real (del servidor) en que se creó cada toma mía que sigue publicada. */
    diasDeMisTomas: string[];
    /** Por cada toma mía, los uid de quienes le han dado bravo. */
    votantesPorToma: string[][];
    /** Mis comentarios en tomas de otros: como mucho uno por toma. */
    comentarios: { dia: string; texto: string }[];
}

export function contarActividad(uid: string, d: DatosActividad): Actividad {
    const diasConToma = new Set(d.diasDeMisTomas.filter(Boolean)).size;

    let bravosRecibidos = 0;
    for (const votantes of d.votantesPorToma) {
        bravosRecibidos += new Set(votantes.filter(v => v && v !== uid)).size;
    }

    const porDia = new Map<string, number>();
    for (const c of d.comentarios) {
        if ((c.texto || '').trim().length < LARGO_MINIMO_COMENTARIO) continue;
        porDia.set(c.dia, Math.min(TOPE_COMENTARIOS_DIA, (porDia.get(c.dia) || 0) + 1));
    }
    let comentarios = 0;
    for (const n of porDia.values()) comentarios += n;

    return { diasConToma, bravosRecibidos, comentarios };
}

export function puntosGanados(a: Actividad): number {
    return a.diasConToma * PUNTOS.toma + a.bravosRecibidos * PUNTOS.bravo + a.comentarios * PUNTOS.comentario;
}

/** Lo que ya se ha ido en canjes. Un canje anulado devuelve sus puntos. */
export function puntosGastados(canjes: Pick<Canje, 'puntos' | 'estado'>[]): number {
    return canjes.filter(c => c.estado !== 'anulado').reduce((n, c) => n + c.puntos, 0);
}

export interface Resumen {
    actividad: Actividad;
    ganados: number;
    gastados: number;
    /** Lo que queda para canjear. */
    saldo: number;
    /** El premio más barato que todavía no alcanza, o null si los alcanza todos. */
    siguiente: Premio | null;
    /** Puntos que le faltan para `siguiente` (0 si no hay). */
    faltan: number;
    canjes: Canje[];
}

export function hacerResumen(actividad: Actividad, canjes: Canje[]): Resumen {
    const ganados = puntosGanados(actividad);
    const gastados = puntosGastados(canjes);
    const saldo = Math.max(0, ganados - gastados);
    const siguiente = PREMIOS.find(p => p.puntos > saldo) ?? null;
    return {
        actividad, ganados, gastados, saldo, siguiente,
        faltan: siguiente ? siguiente.puntos - saldo : 0,
        canjes: [...canjes].sort((a, b) => b.creado - a.creado),
    };
}

export type MotivoNoCanje = 'premio' | 'pendiente' | 'saldo';

/**
 * ¿Puede canjear este premio? Un solo descuento pendiente a la vez: así no se
 * acumulan dos sobre la misma sesión.
 */
export function motivoParaNoCanjear(
    premioId: string,
    saldo: number,
    canjes: Pick<Canje, 'estado'>[],
): MotivoNoCanje | null {
    const premio = PREMIOS.find(p => p.id === premioId);
    if (!premio) return 'premio';
    if (canjes.some(c => c.estado === 'pendiente')) return 'pendiente';
    if (saldo < premio.puntos) return 'saldo';
    return null;
}

/** Letras y números que no se confunden al dictarlos (sin 0/O, 1/I…). */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** «SM-7KQ2MX» a partir de bytes al azar. */
export function codigoDesde(bytes: Uint8Array): string {
    let s = '';
    for (let i = 0; i < 6; i++) s += ALFABETO[(bytes[i] ?? 0) % ALFABETO.length];
    return `SM-${s}`;
}
