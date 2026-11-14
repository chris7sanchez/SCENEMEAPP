import { Timestamp, type Firestore } from 'firebase-admin/firestore';

// Tope diario de caracteres de voz IA por usuario. Los audios ya guardados no
// cuentan (no cuestan): solo se llama aquí cuando hay que generar.

export class LimiteSuperado extends Error {
    constructor(public usados: number, public limite: number) {
        super('limite_diario');
        this.name = 'LimiteSuperado';
    }
}

/** `<uid>_<AAAA-MM-DD>` en UTC: el día cambia a la 1:00 o 2:00 de España. */
export function idDeUso(uid: string, fecha: Date): string {
    return `${uid}_${fecha.toISOString().slice(0, 10)}`;
}

export interface RegistroUso {
    /** Suma `n` solo si cabe en `limite`, de forma atómica. */
    sumarSiCabe(id: string, n: number, limite: number): Promise<{ cabe: boolean; usados: number }>;
}

export async function consumirCaracteres(
    registro: RegistroUso, uid: string, n: number, limite: number, ahora: Date = new Date(),
): Promise<number> {
    const r = await registro.sumarSiCabe(idDeUso(uid, ahora), n, limite);
    if (!r.cabe) throw new LimiteSuperado(r.usados, limite);
    return r.usados;
}

export function limiteDiario(): number {
    const n = Number(process.env.TTS_LIMITE_DIARIO);
    return Number.isFinite(n) && n > 0 ? n : 5000;
}

export function registroFirestore(db: Firestore): RegistroUso {
    return {
        sumarSiCabe: (id, n, limite) => db.runTransaction(async tx => {
            const ref = db.collection('tts_uso').doc(id);
            const snap = await tx.get(ref);
            const usados = (snap.exists ? Number(snap.get('caracteres')) : 0) || 0;
            if (usados + n > limite) return { cabe: false, usados };
            tx.set(ref, { caracteres: usados + n, actualizado: Timestamp.now() }, { merge: true });
            return { cabe: true, usados: usados + n };
        }),
    };
}
