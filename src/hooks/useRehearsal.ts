'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { rehearsalReducer, initRehearsal } from '@/lib/rehearsal-reducer';
import type { SceneTurn } from '@/lib/scene-script';
import { getSpeechProvider, waitVisible, type VoiceProfile, type SpeakResult } from '@/lib/speech';
import { estimateReadingMs, fallbackEngine, nextPartnerIndex, delayAfterReply, type EngineId } from '@/lib/speech-plan';

interface RehearsalOpts {
    profiles?: Record<string, VoiceProfile>;
    engine?: EngineId;
}

/**
 * Conecta el reducer puro de ensayo con el motor de voz:
 * cuando es turno de la réplica (phase 'speaking') la lee en voz alta y,
 * al terminar, avanza solo. En los turnos del actor espera ('awaiting-user').
 *
 * Garantías:
 *  - La réplica NUNCA se salta en silencio: si el motor elegido no llega a
 *    sonar, se escala a otro motor; si tampoco, la línea se queda en pantalla
 *    el tiempo de leerla y se avisa (voiceFailed).
 *  - La siguiente réplica se precarga mientras hablas tú (motores IA), así
 *    entra al instante y no depende de la latencia del servidor.
 *  - Al cambiar de turno se cancela lo anterior: nada suena encima.
 */
export function useRehearsal(turns: SceneTurn[], myRole: string, opts?: RehearsalOpts) {
    const [state, dispatch] = useReducer(rehearsalReducer, undefined, () => initRehearsal(turns, myRole));
    const engine: EngineId = opts?.engine ?? 'browser';
    const provider = useRef(getSpeechProvider(engine));
    const [paused, setPaused] = useState(false);
    /** Última réplica no llegó a sonar por ningún motor. */
    const [voiceFailed, setVoiceFailed] = useState<string | null>(null);
    /** Estado visible de la réplica en curso: 'esperando' (pestaña oculta) | 'preparando' | 'sonando' | 'silencio'. */
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'esperando' | 'preparando' | 'sonando' | 'silencio'>('idle');

    // Precarga la SIGUIENTE réplica en cuanto arranca un turno (el tuyo o el
    // de la réplica actual): cuando te toque oírla, ya está descargada.
    useEffect(() => {
        if (state.phase !== 'awaiting-user' && state.phase !== 'speaking') return;
        const i = nextPartnerIndex(state.turns, state.index, state.myRole);
        if (i < 0) return;
        const t = state.turns[i];
        const p = opts?.profiles?.[t.speaker];
        provider.current.prefetch(t.text, { voiceId: p?.voiceId, rate: p?.rate ?? 1, pitch: p?.pitch ?? 1, instructions: p?.instructions }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase, state.index]);

    useEffect(() => {
        if (paused) { provider.current.cancel(); return; }
        if (state.phase !== 'speaking') { setVoiceStatus('idle'); return; }

        const turn = state.turns[state.index];
        const p = opts?.profiles?.[turn.speaker];
        const speakOpts = { voiceId: p?.voiceId, rate: p?.rate ?? 1, pitch: p?.pitch ?? 1, instructions: p?.instructions };
        let cancelled = false;
        let advanced = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const goNext = () => { if (cancelled || advanced) return; advanced = true; dispatch({ type: 'PARTNER_DONE' }); };

        // Tope absoluto (muy holgado): pase lo que pase, la escena no se queda
        // clavada. Los motores ya resuelven antes por sus propios vigilantes.
        // Con la pestaña oculta no corre: al volver se reanuda desde aquí.
        let safety: ReturnType<typeof setTimeout> | undefined;
        const armaTope = () => { if (!safety) safety = setTimeout(goNext, estimateReadingMs(turn.text, speakOpts.rate) * 2 + 15000); };
        if (typeof document === 'undefined' || document.visibilityState !== 'hidden') armaTope();
        else waitVisible(0).then(() => { if (!cancelled) armaTope(); });

        (async () => {
            setVoiceFailed(null);
            // Si te has ido a otra pestaña o app, el navegador no habla: el ensayo
            // se queda quieto en esta réplica y sigue solo cuando vuelvas.
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                setVoiceStatus('esperando');
                await waitVisible(0);
                if (cancelled) return;
            }
            setVoiceStatus('preparando');
            const intenta = async (): Promise<SpeakResult> => {
                try { return await provider.current.speakChecked(turn.text, speakOpts); }
                catch (e: any) { return { spoken: false, reason: 'throw:' + String(e?.message || e) }; }
            };
            let res = await intenta();
            if (cancelled) return;
            // 'cancelled' sin que este turno haya cambiado = nos pisó otra llamada
            // (dos efectos solapados). Reintentar una vez en limpio.
            if (!res.spoken && res.reason === 'cancelled') {
                res = await intenta();
                if (cancelled) return;
            }

            // Plan B: si el motor elegido no llegó a sonar, otro motor.
            if (!res.spoken) {
                setVoiceFailed(res.reason || 'sin-sonido'); // que se vea ya el aviso
                const alt = fallbackEngine(engine);
                if (alt) {
                    setVoiceStatus('preparando');
                    try {
                        // Sin voiceId (la del otro motor no vale aquí) y sin volver a caer
                        // al navegador, que es justo el que acaba de fallar.
                        res = await getSpeechProvider(alt).speakChecked(turn.text, { rate: speakOpts.rate, pitch: speakOpts.pitch, instructions: speakOpts.instructions, noFallback: true });
                    } catch (e: any) {
                        res = { spoken: false, reason: 'alt-throw:' + String(e?.message || e) };
                    }
                    if (cancelled) return;
                }
            }

            if (res.spoken) {
                setVoiceFailed(null);
                setVoiceStatus('sonando');
            } else {
                setVoiceStatus('silencio');
                setVoiceFailed(res.reason || 'sin-sonido');
            }
            timer = setTimeout(goNext, delayAfterReply(res.spoken, p?.pauseMs ?? 300, turn.text, speakOpts.rate));
        })();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
            if (safety) clearTimeout(safety);
            provider.current.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase, state.index, state.seq, paused]);

    useEffect(() => () => provider.current.cancel(), []);

    return {
        state,
        current: state.turns[state.index] ?? null,
        total: state.turns.length,
        paused,
        voiceFailed,
        voiceStatus,
        start: () => dispatch({ type: 'START' }),
        advance: () => dispatch({ type: 'USER_ADVANCE' }),
        repeat: () => dispatch({ type: 'REPEAT' }),
        skip: () => dispatch({ type: 'SKIP' }),
        prev: () => dispatch({ type: 'PREV' }),
        restart: () => dispatch({ type: 'RESTART' }),
        togglePause: () => setPaused(p => !p),
    };
}
