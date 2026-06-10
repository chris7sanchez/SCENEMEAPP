'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { rehearsalReducer, initRehearsal } from '@/lib/rehearsal-reducer';
import type { SceneTurn } from '@/lib/scene-script';
import { getSpeechProvider, type VoiceProfile } from '@/lib/speech';

interface RehearsalOpts {
    profiles?: Record<string, VoiceProfile>;
    engine?: 'browser' | 'ai';
}

/**
 * Conecta el reducer puro de ensayo con el motor de voz:
 * cuando es turno de la réplica (phase 'speaking') la lee en voz alta y,
 * al terminar, avanza solo. En los turnos del actor espera ('awaiting-user').
 */
export function useRehearsal(turns: SceneTurn[], myRole: string, opts?: RehearsalOpts) {
    const [state, dispatch] = useReducer(rehearsalReducer, undefined, () => initRehearsal(turns, myRole));
    const provider = useRef(getSpeechProvider(opts?.engine));
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) { provider.current.cancel(); return; }
        if (state.phase === 'speaking') {
            const turn = state.turns[state.index];
            const p = opts?.profiles?.[turn.speaker];
            let cancelled = false;
            let timer: ReturnType<typeof setTimeout>;
            provider.current
                .speak(turn.text, { voiceId: p?.voiceId, rate: p?.rate ?? 1, pitch: p?.pitch ?? 1, instructions: p?.instructions })
                .then(() => {
                    if (cancelled) return;
                    timer = setTimeout(() => { if (!cancelled) dispatch({ type: 'PARTNER_DONE' }); }, p?.pauseMs ?? 300);
                });
            return () => { cancelled = true; clearTimeout(timer); provider.current.cancel(); };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase, state.index, state.seq, paused]);

    useEffect(() => () => provider.current.cancel(), []);

    return {
        state,
        current: state.turns[state.index] ?? null,
        total: state.turns.length,
        paused,
        start: () => dispatch({ type: 'START' }),
        advance: () => dispatch({ type: 'USER_ADVANCE' }),
        repeat: () => dispatch({ type: 'REPEAT' }),
        skip: () => dispatch({ type: 'SKIP' }),
        prev: () => dispatch({ type: 'PREV' }),
        restart: () => dispatch({ type: 'RESTART' }),
        togglePause: () => setPaused(p => !p),
    };
}
