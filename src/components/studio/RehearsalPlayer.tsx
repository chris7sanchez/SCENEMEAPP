'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { parseScriptTurns, speakersOf, cueOf, type SceneTurn } from '@/lib/scene-script';
import { getSpeechProvider, assignVoices } from '@/lib/speech';
import { useRehearsal } from '@/hooks/useRehearsal';

type LineMode = 'full' | 'cue' | 'hidden';
type AdvanceMode = 'tap' | 'voice';

export default function RehearsalPlayer({ script, onClose }: { script: string; onClose: () => void }) {
    const turns = useMemo(() => parseScriptTurns(script), [script]);
    const speakers = useMemo(() => speakersOf(turns), [turns]);

    const [role, setRole] = useState<string>('');
    const [mode, setMode] = useState<LineMode>('full');
    const [advance, setAdvance] = useState<AdvanceMode>('tap');
    const [rate, setRate] = useState(1);
    const [started, setStarted] = useState(false);

    useEffect(() => { if (speakers.length && !role) setRole(speakers[0]); }, [speakers, role]);

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm p-4 sm:p-6 text-white overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-wide">Ensayar con réplicas</h2>
                    <button onClick={onClose} className="rounded-full px-3 py-1 text-zinc-400 hover:text-white" aria-label="Cerrar">✕</button>
                </div>

                {turns.length === 0 ? (
                    <p className="mt-8 text-center text-zinc-400">No se detectaron diálogos en el guion. Pega una escena con personajes (NOMBRE: línea).</p>
                ) : !started ? (
                    <Config
                        speakers={speakers} role={role} setRole={setRole}
                        mode={mode} setMode={setMode} advance={advance} setAdvance={setAdvance}
                        rate={rate} setRate={setRate} onStart={() => setStarted(true)}
                    />
                ) : (
                    <ActivePlayer
                        key={role} turns={turns} speakers={speakers} role={role}
                        mode={mode} advanceMode={advance} rate={rate}
                        onBack={() => setStarted(false)} onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-bold transition ${active ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
            {children}
        </button>
    );
}

function Config(props: {
    speakers: string[]; role: string; setRole: (s: string) => void;
    mode: LineMode; setMode: (m: LineMode) => void;
    advance: AdvanceMode; setAdvance: (a: AdvanceMode) => void;
    rate: number; setRate: (n: number) => void; onStart: () => void;
}) {
    const { speakers, role, setRole, mode, setMode, advance, setAdvance, rate, setRate, onStart } = props;
    return (
        <div className="mt-6 space-y-6">
            <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-amber-400/80">¿Cuál es tu personaje?</p>
                <div className="flex flex-wrap gap-2">
                    {speakers.map(s => <Chip key={s} active={role === s} onClick={() => setRole(s)}>{s}</Chip>)}
                </div>
            </div>
            <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Tus líneas</p>
                <div className="flex flex-wrap gap-2">
                    <Chip active={mode === 'full'} onClick={() => setMode('full')}>Texto completo</Chip>
                    <Chip active={mode === 'cue'} onClick={() => setMode('cue')}>Pie de entrada</Chip>
                    <Chip active={mode === 'hidden'} onClick={() => setMode('hidden')}>Oculto</Chip>
                </div>
            </div>
            <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Avance</p>
                <div className="flex flex-wrap gap-2">
                    <Chip active={advance === 'tap'} onClick={() => setAdvance('tap')}>Toque / barra</Chip>
                    <Chip active={advance === 'voice'} onClick={() => setAdvance('voice')}>Por voz</Chip>
                </div>
            </div>
            <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Velocidad de lectura: {rate.toFixed(1)}x</p>
                <input type="range" min={0.8} max={1.4} step={0.1} value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-amber-500" />
            </div>
            <button onClick={onStart} disabled={!role} className="w-full rounded-full bg-amber-500 py-4 text-base font-black text-black transition hover:bg-amber-400 disabled:opacity-50">
                EMPEZAR
            </button>
        </div>
    );
}

function ActivePlayer(props: {
    turns: SceneTurn[]; speakers: string[]; role: string;
    mode: LineMode; advanceMode: AdvanceMode; rate: number;
    onBack: () => void; onClose: () => void;
}) {
    const { turns, speakers, role, mode, advanceMode, rate, onBack, onClose } = props;

    const [voiceMap, setVoiceMap] = useState<Record<string, string | undefined>>({});
    useEffect(() => {
        const load = () => setVoiceMap(assignVoices(speakers.filter(s => s !== role), getSpeechProvider().listVoices()));
        load();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = load;
            return () => { window.speechSynthesis.onvoiceschanged = null; };
        }
    }, [speakers, role]);

    const r = useRehearsal(turns, role, { rate, voiceMap });
    const { state, current } = r;

    // Arrancar al montar
    useEffect(() => { r.start(); /* eslint-disable-next-line */ }, []);

    // Barra espaciadora avanza en tu turno
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); if (state.phase === 'awaiting-user') r.advance(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase]);

    // Avance por voz (opcional, con degradación elegante)
    useEffect(() => {
        if (advanceMode !== 'voice' || state.phase !== 'awaiting-user') return;
        const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const rec = new SR();
        rec.lang = 'es-ES'; rec.continuous = false; rec.interimResults = false;
        let done = false;
        const finish = () => { if (!done) { done = true; try { rec.stop(); } catch { /* */ } r.advance(); } };
        rec.onspeechend = finish; rec.onresult = finish; rec.onerror = () => { try { rec.stop(); } catch { /* */ } };
        try { rec.start(); } catch { /* */ }
        return () => { done = true; try { rec.stop(); } catch { /* */ } };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [advanceMode, state.phase, state.index]);

    if (state.phase === 'finished') {
        return (
            <div className="mt-16 text-center">
                <p className="text-2xl font-black text-amber-300">¡Escena completada!</p>
                <p className="mt-2 text-zinc-400">Buen trabajo. ¿Otra vez?</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={r.restart} className="rounded-full bg-amber-500 px-6 py-3 font-bold text-black hover:bg-amber-400">Repetir escena</button>
                    <button onClick={onBack} className="rounded-full bg-zinc-800 px-6 py-3 font-bold text-zinc-200 hover:bg-zinc-700">Cambiar personaje</button>
                    <button onClick={onClose} className="rounded-full px-6 py-3 font-bold text-zinc-400 hover:text-white">Salir</button>
                </div>
            </div>
        );
    }

    const isMine = current?.speaker === role;
    const progress = `${Math.min(state.index + 1, turns.length)} / ${turns.length}`;

    let lineText = current?.text ?? '';
    if (isMine) {
        if (mode === 'cue') lineText = cueOf(current?.text ?? '', 3);
        else if (mode === 'hidden') lineText = '— tu línea —';
    }

    return (
        <div className="mt-6">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                <span>{progress}</span>
                <span>{isMine ? 'TU TURNO' : 'RÉPLICA'}</span>
            </div>

            <div className={`min-h-[180px] rounded-2xl border p-6 text-center text-xl leading-relaxed sm:text-2xl ${isMine ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-700 bg-zinc-900/60'}`}>
                <p className={`mb-3 text-sm font-bold uppercase tracking-widest ${isMine ? 'text-amber-400' : 'text-zinc-400'}`}>{current?.speaker}</p>
                <p className={isMine && mode === 'hidden' ? 'text-zinc-500 italic' : 'text-white'}>{lineText}</p>
            </div>

            {isMine ? (
                <button onClick={r.advance} className="mt-5 w-full rounded-full bg-amber-500 py-5 text-lg font-black text-black transition hover:bg-amber-400">
                    SIGUIENTE ▸
                </button>
            ) : (
                <p className="mt-5 text-center text-sm text-zinc-500">{r.paused ? 'En pausa' : 'Leyendo la réplica…'}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                <button onClick={r.prev} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">◂ Anterior</button>
                <button onClick={r.repeat} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">⟲ Repetir</button>
                <button onClick={r.togglePause} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">{r.paused ? '▶ Reanudar' : '⏸ Pausa'}</button>
                <button onClick={r.skip} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">Saltar ▸</button>
                <button onClick={r.restart} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">Reiniciar</button>
            </div>

            <div className="mt-6 text-center">
                <button onClick={onClose} className="text-xs text-zinc-500 hover:text-white">Cerrar ensayo</button>
            </div>
        </div>
    );
}
