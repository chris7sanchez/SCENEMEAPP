'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { parseScriptTurns, speakersOf, cueOf, type SceneTurn } from '@/lib/scene-script';
import {
    getSpeechProvider, applyManner, MANNER_PRESETS, DEFAULT_PROFILE,
    type VoiceProfile, type SpeechVoice,
} from '@/lib/speech';
import { useRehearsal } from '@/hooks/useRehearsal';

type LineMode = 'full' | 'cue' | 'hidden';
type AdvanceMode = 'tap' | 'voice';

export default function RehearsalPlayer({ script, onClose }: { script: string; onClose: () => void }) {
    const turns = useMemo(() => parseScriptTurns(script), [script]);
    const speakers = useMemo(() => speakersOf(turns), [turns]);

    const [role, setRole] = useState('');
    const [mode, setMode] = useState<LineMode>('full');
    const [advance, setAdvance] = useState<AdvanceMode>('tap');
    const [started, setStarted] = useState(false);
    const [voices, setVoices] = useState<SpeechVoice[]>([]);
    const [profiles, setProfiles] = useState<Record<string, VoiceProfile>>({});

    useEffect(() => { if (speakers.length && !role) setRole(speakers[0]); }, [speakers, role]);

    useEffect(() => {
        const load = () => {
            const v = getSpeechProvider().listVoices();
            setVoices(v);
            setProfiles(prev => {
                const next: Record<string, VoiceProfile> = {};
                speakers.forEach((s, i) => {
                    const vid = v.length ? v[i % v.length].id : undefined;
                    const ex = prev[s];
                    next[s] = ex ? { ...ex, voiceId: ex.voiceId ?? vid } : { ...DEFAULT_PROFILE, voiceId: vid };
                });
                return next;
            });
        };
        load();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = load;
            return () => { window.speechSynthesis.onvoiceschanged = null; };
        }
    }, [speakers]);

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm p-4 sm:p-6 text-white overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl pb-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-wide">Ensayar con réplicas</h2>
                    <button onClick={onClose} className="rounded-full px-3 py-1 text-zinc-400 hover:text-white" aria-label="Cerrar">✕</button>
                </div>

                {turns.length === 0 ? (
                    <p className="mt-8 text-center text-zinc-400">No se detectaron diálogos. Pega una escena con personajes (NOMBRE: línea).</p>
                ) : !started ? (
                    <Config
                        speakers={speakers} role={role} setRole={setRole}
                        mode={mode} setMode={setMode} advance={advance} setAdvance={setAdvance}
                        voices={voices} profiles={profiles} setProfiles={setProfiles}
                        onStart={() => setStarted(true)}
                    />
                ) : (
                    <ActivePlayer
                        key={role} turns={turns} role={role}
                        mode={mode} advanceMode={advance} profiles={profiles}
                        onBack={() => setStarted(false)} onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${active ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
            {children}
        </button>
    );
}

function Config(props: {
    speakers: string[]; role: string; setRole: (s: string) => void;
    mode: LineMode; setMode: (m: LineMode) => void;
    advance: AdvanceMode; setAdvance: (a: AdvanceMode) => void;
    voices: SpeechVoice[]; profiles: Record<string, VoiceProfile>;
    setProfiles: (fn: (p: Record<string, VoiceProfile>) => Record<string, VoiceProfile>) => void;
    onStart: () => void;
}) {
    const { speakers, role, setRole, mode, setMode, advance, setAdvance, voices, profiles, setProfiles, onStart } = props;
    const update = (s: string, p: VoiceProfile) => setProfiles(prev => ({ ...prev, [s]: p }));

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
                <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Voz de cada personaje</p>
                <p className="mb-3 text-xs text-zinc-500">Ajusta voz, manera de hablar, velocidad, tono y pausa. (Tu personaje no se lee en voz alta.)</p>
                <div className="space-y-3">
                    {speakers.map(s => (
                        <VoiceEditor
                            key={s} speaker={s} isMine={s === role} voices={voices}
                            profile={profiles[s] ?? DEFAULT_PROFILE}
                            onChange={(p) => update(s, p)}
                        />
                    ))}
                </div>
            </div>

            <button onClick={onStart} disabled={!role} className="w-full rounded-full bg-amber-500 py-4 text-base font-black text-black transition hover:bg-amber-400 disabled:opacity-50">
                EMPEZAR
            </button>
        </div>
    );
}

function VoiceEditor(props: { speaker: string; isMine: boolean; voices: SpeechVoice[]; profile: VoiceProfile; onChange: (p: VoiceProfile) => void; }) {
    const { speaker, isMine, voices, profile, onChange } = props;
    const test = () => getSpeechProvider().speak(`Hola, soy ${speaker}.`, { voiceId: profile.voiceId, rate: profile.rate, pitch: profile.pitch });

    return (
        <div className={`rounded-xl border p-3 ${isMine ? 'border-zinc-800 bg-zinc-900/30 opacity-70' : 'border-zinc-700 bg-zinc-900/60'}`}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold uppercase text-amber-300">{speaker}{isMine && <span className="ml-2 text-[10px] font-normal text-zinc-500">(tú — sin voz)</span>}</span>
                <button onClick={test} className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-700">▶ Probar</button>
            </div>

            <div className="mt-2">
                <select
                    value={profile.voiceId ?? ''}
                    onChange={e => onChange({ ...profile, voiceId: e.target.value || undefined })}
                    className="w-full rounded-lg border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-200"
                >
                    {voices.length === 0 && <option value="">(voz por defecto del sistema)</option>}
                    {voices.map(v => <option key={v.id} value={v.id}>{v.label} ({v.lang})</option>)}
                </select>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
                {MANNER_PRESETS.map(m => (
                    <button key={m.id} onClick={() => onChange(applyManner(profile, m.id))}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${profile.manner === m.id ? 'bg-amber-500/90 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-zinc-400">
                <label>Velocidad {profile.rate.toFixed(2)}
                    <input type="range" min={0.6} max={1.5} step={0.05} value={profile.rate} onChange={e => onChange({ ...profile, rate: parseFloat(e.target.value), manner: 'custom' })} className="w-full accent-amber-500" />
                </label>
                <label>Tono {profile.pitch.toFixed(2)}
                    <input type="range" min={0.6} max={1.4} step={0.05} value={profile.pitch} onChange={e => onChange({ ...profile, pitch: parseFloat(e.target.value), manner: 'custom' })} className="w-full accent-amber-500" />
                </label>
                <label>Pausa {profile.pauseMs}ms
                    <input type="range" min={0} max={1500} step={50} value={profile.pauseMs} onChange={e => onChange({ ...profile, pauseMs: parseInt(e.target.value, 10) })} className="w-full accent-amber-500" />
                </label>
            </div>
        </div>
    );
}

function ActivePlayer(props: {
    turns: SceneTurn[]; role: string; mode: LineMode; advanceMode: AdvanceMode;
    profiles: Record<string, VoiceProfile>; onBack: () => void; onClose: () => void;
}) {
    const { turns, role, mode, advanceMode, profiles, onBack, onClose } = props;

    const r = useRehearsal(turns, role, { profiles });
    const { state, current } = r;

    useEffect(() => { r.start(); /* eslint-disable-next-line */ }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); if (state.phase === 'awaiting-user') r.advance(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase]);

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
                    <button onClick={onBack} className="rounded-full bg-zinc-800 px-6 py-3 font-bold text-zinc-200 hover:bg-zinc-700">Cambiar ajustes</button>
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
                <button onClick={r.advance} className="mt-5 w-full rounded-full bg-amber-500 py-5 text-lg font-black text-black transition hover:bg-amber-400">SIGUIENTE ▸</button>
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
