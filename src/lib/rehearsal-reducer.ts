// Máquina de estados del reproductor de ensayo. Pura y testeable (sin React/TTS).
import { esDe, type SceneTurn } from './scene-script';

export type RehearsalPhase = 'idle' | 'speaking' | 'awaiting-user' | 'finished';

export interface RehearsalState {
    phase: RehearsalPhase;
    index: number;
    turns: SceneTurn[];
    myRole: string;
    /** Se incrementa en cada transición; sirve para re-disparar efectos (p.ej. REPEAT). */
    seq: number;
}

export type RehearsalAction =
    | { type: 'START' }
    | { type: 'PARTNER_DONE' }
    | { type: 'USER_ADVANCE' }
    | { type: 'REPEAT' }
    | { type: 'SKIP' }
    | { type: 'PREV' }
    | { type: 'GO_TO'; index: number }
    | { type: 'RESTART' };

export function initRehearsal(turns: SceneTurn[], myRole: string): RehearsalState {
    return { phase: 'idle', index: 0, turns, myRole, seq: 0 };
}

function phaseForIndex(state: RehearsalState, index: number): RehearsalPhase {
    if (index >= state.turns.length) return 'finished';
    // Una línea que dicen dos a la vez también es TUYA si eres uno de ellos.
    // Lo que lee el narrador nunca lo es, aunque te llames como él.
    const t = state.turns[index];
    const mio = t.kind === 'dialogo' ? esDe(t, state.myRole) : false;
    return mio ? 'awaiting-user' : 'speaking';
}

function goTo(state: RehearsalState, index: number): RehearsalState {
    if (index >= state.turns.length) return { ...state, index: state.turns.length, phase: 'finished', seq: state.seq + 1 };
    const clamped = Math.max(0, index);
    return { ...state, index: clamped, phase: phaseForIndex(state, clamped), seq: state.seq + 1 };
}

export function rehearsalReducer(state: RehearsalState, action: RehearsalAction): RehearsalState {
    switch (action.type) {
        case 'START':
        case 'RESTART':
            if (state.turns.length === 0) return { ...state, index: 0, phase: 'finished' };
            return goTo(state, 0);

        case 'PARTNER_DONE':
            // Solo avanza si de verdad estábamos leyendo una réplica.
            if (state.phase !== 'speaking') return state;
            return goTo(state, state.index + 1);

        case 'USER_ADVANCE':
            if (state.phase !== 'awaiting-user') return state;
            return goTo(state, state.index + 1);

        case 'SKIP':
            if (state.phase === 'finished') return state;
            return goTo(state, state.index + 1);

        case 'PREV':
            if (state.phase === 'idle') return state;
            return goTo(state, Math.max(0, (state.phase === 'finished' ? state.turns.length : state.index) - 1));

        // Saltar a una línea concreta: la separata es clicable y ésta es la
        // acción que hay detrás. Sin ella, volver ocho líneas atrás para repetir
        // un trozo son ocho pulsaciones de "Anterior".
        case 'GO_TO':
            if (state.turns.length === 0) return state;
            return goTo(state, Math.min(Math.max(0, action.index), state.turns.length - 1));

        case 'REPEAT':
            // Reinicia la fase del turno actual sin mover el índice (re-leer / re-esperar).
            if (state.phase === 'idle' || state.phase === 'finished') return state;
            return { ...state, phase: phaseForIndex(state, state.index), seq: state.seq + 1 };

        default:
            return state;
    }
}
