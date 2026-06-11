'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { parseScriptTurns, speakersOf, cueOf, type SceneTurn } from '@/lib/scene-script';
import {
    getSpeechProvider, applyManner, MANNER_PRESETS, DEFAULT_PROFILE, OPENAI_TTS_VOICES, ELEVENLABS_VOICES,
    type VoiceProfile, type SpeechVoice,
} from '@/lib/speech';
import { useRehearsal } from '@/hooks/useRehearsal';

type LineMode = 'full' | 'cue' | 'hidden';
type AdvanceMode = 'tap' | 'voice';
type Engine = 'browser' | 'ai' | 'eleven';

export default function RehearsalPlayer({ script, onClose }: { script: string; onClose: () => void }) {
    const turns = useMemo(() => parseScriptTurns(script), [script]);
    const speakers = useMemo(() => speakersOf(turns), [turns]);

    const [role, setRole] = useState('');
    const [mode, setMode] = useState<LineMode>('full');
    const [advance, setAdvance] = useState<AdvanceMode>('tap');
    const [engine, setEngine] = useState<Engine>('browser');
    const [started, setStarted] = useState(false);
    const [browserVoices, setBrowserVoices] = useState<SpeechVoice[]>([]);
    const [profiles, setProfiles] = useState<Record<string, VoiceProfile>>({});

    const voices = engine === 'ai' ? OPENAI_TTS_VOICES : engine === 'eleven' ? ELEVENLABS_VOICES : browserVoices;

    useEffect(() => { if (speakers.length && !role) setRole(speakers[0]); }, [speakers, role]);

    // Carga voces del navegador (para el motor 'browser').
    useEffect(() => {
        const load = () => setBrowserVoices(getSpeechProvider('browser').listVoices());
        load();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = load;
            return () => { window.speechSynthesis.onvoiceschanged = null; };
        }
    }, []);

    // Asegura un perfil por personaje y una voz válida para el motor actual.
    useEffect(() => {
        const list = engine === 'ai' ? OPENAI_TTS_VOICES : engine === 'eleven' ? ELEVENLABS_VOICES : browserVoices;
        setProfiles(prev => {
            const next: Record<string, VoiceProfile> = {};
            speakers.forEach((s, i) => {
                const base = prev[s] ? { ...prev[s] } : { ...DEFAULT_PROFILE };
                const ok = base.voiceId && list.some(v => v.id === base.voiceId);
                if (!ok) base.voiceId = list.length ? list[i % list.length].id : undefined;
                next[s] = base;
            });
            return next;
        });
    }, [engine, browserVoices, speakers]);

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
                        engine={engine} setEngine={setEngine}
                        voices={voices} profiles={profiles} setProfiles={setProfiles}
                        onStart={() => setStarted(true)}
                    />
                ) : (
                    <ActivePlayer
                        key={role + engine} turns={turns} role={role}
                        mode={mode} advanceMode={advance} engine={engine} profiles={profiles}
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
    engine: Engine; setEngine: (e: Engine) => void;
    voices: SpeechVoice[]; profiles: Record<string, VoiceProfile>;
    setProfiles: (fn: (p: Record<string, VoiceProfile>) => Record<string, VoiceProfile>) => void;
    onStart: () => void;
}) {
    const { speakers, role, setRole, mode, setMode, advance, setAdvance, engine, setEngine, voices, profiles, setProfiles, onStart } = props;
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
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Motor de voz</p>
                <div className="flex flex-wrap gap-2">
                    <Chip active={engine === 'browser'} onClick={() => setEngine('browser')}>Navegador (gratis)</Chip>
                    <Chip active={engine === 'ai'} onClick={() => setEngine('ai')}>Voz IA (OpenAI)</Chip>
                    <Chip active={engine === 'eleven'} onClick={() => setEngine('eleven')}>Voz IA Pro (ElevenLabs)</Chip>
                </div>
                {engine === 'ai' && (
                    <p className="mt-2 text-xs text-zinc-500">Voz actuada con emoción. Requiere clave de OpenAI; si no, usa la del navegador.</p>
                )}
                {engine === 'eleven' && (
                    <p className="mt-2 text-xs text-zinc-500">La más natural. Requiere clave de ElevenLabs; si no, usa la del navegador. La emoción depende sobre todo de la voz elegida.</p>
                )}
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
                <p className="mb-3 text-xs text-zinc-500">Ajusta cada personaje. (Tu personaje no se lee en voz alta.)</p>
                <div className="space-y-3">
                    {speakers.map(s => (
                        <VoiceEditor
                            key={s} speaker={s} isMine={s === role} engine={engine} voices={voices}
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

const AI_TONE_CHIPS = ['Tono frío y cortante', 'Con rabia contenida', 'Cálido y cercano', 'Nervioso, al borde del llanto', 'Irónico', 'Susurrando, íntimo'];

function VoiceEditor(props: { speaker: string; isMine: boolean; engine: Engine; voices: SpeechVoice[]; profile: VoiceProfile; onChange: (p: VoiceProfile) => void; }) {
    const { speaker, isMine, engine, voices, profile, onChange } = props;
    const test = () => getSpeechProvider(engine).speak(`Hola, soy ${speaker}.`, { voiceId: profile.voiceId, rate: profile.rate, pitch: profile.pitch, instructions: profile.instructions });

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
                    {voices.length === 0 && <option value="">(voz por defecto)</option>}
                    {voices.map(v => <option key={v.id} value={v.id}>{v.label}{v.lang !== 'multi' ? ` (${v.lang})` : ''}</option>)}
                </select>
            </div>

            {engine !== 'browser' ? (
                <div className="mt-3">
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500">Cómo habla (instrucción de interpretación)</p>
                    <textarea
                        value={profile.instructions ?? ''}
                        onChange={e => onChange({ ...profile, instructions: e.target.value })}
                        placeholder="Ej.: habla con rabia contenida, voz grave, ritmo lento y amenazante"
                        className="h-16 w-full resize-y rounded-lg border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 placeholder:text-zinc-600"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {AI_TONE_CHIPS.map(c => (
                            <button key={c} onClick={() => onChange({ ...profile, instructions: c })}
                                className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-700">{c}</button>
                        ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-zinc-400">
                        <label>Velocidad {profile.rate.toFixed(2)}
                            <input type="range" min={0.7} max={1.3} step={0.05} value={profile.rate} onChange={e => onChange({ ...profile, rate: parseFloat(e.target.value) })} className="w-full accent-amber-500" />
                        </label>
                        <label>Pausa {profile.pauseMs}ms
                            <input type="range" min={0} max={1500} step={50} value={profile.pauseMs} onChange={e => onChange({ ...profile, pauseMs: parseInt(e.target.value, 10) })} className="w-full accent-amber-500" />
                        </label>
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
}

function ActivePlayer(props: {
    turns: SceneTurn[]; role: string; mode: LineMode; advanceMode: AdvanceMode;
    engine: Engine; profiles: Record<string, VoiceProfile>; onBack: () => void; onClose: () => void;
}) {
    const { turns, role, mode, advanceMode, engine, profiles, onBack, onClose } = props;

    const r = useRehearsal(turns, role, { profiles, engine });
    const { state, current } = r;
    const [micDenied, setMicDenied] = useState(false);
    const micStreamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => { r.start(); /* eslint-disable-next-line */ }, []);

    // Abrir el micrófono UNA vez y mantenerlo abierto todo el ensayo (sin clic),
    // y montar un analizador de volumen (Web Audio) para detectar tu voz nosotros
    // mismos — sin el reconocimiento de Chrome (que choca con el micro ya abierto).
    useEffect(() => {
        if (advanceMode !== 'voice') return;
        const md = (typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined) as MediaDevices | undefined;
        if (!md?.getUserMedia) { setMicDenied(true); return; }
        let cancelled = false;
        md.getUserMedia({ audio: true })
            .then(s => {
                if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
                micStreamRef.current = s;
                try {
                    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
                    const ctx: AudioContext = new AC();
                    ctx.resume?.();
                    const src = ctx.createMediaStreamSource(s);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 1024;
                    src.connect(analyser);
                    audioCtxRef.current = ctx;
                    analyserRef.current = analyser;
                } catch { /* */ }
            })
            .catch(() => setMicDenied(true));
        return () => {
            cancelled = true;
            try { audioCtxRef.current?.close(); } catch { /* */ }
            audioCtxRef.current = null; analyserRef.current = null;
            if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); if (state.phase === 'awaiting-user') r.advance(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.phase]);

    // Avance por voz: medimos el VOLUMEN del micro (Web Audio). Cuando hablas y
    // luego hay ~1,1s de silencio, avanzamos. Sin reconocimiento de Chrome, sin clic.
    useEffect(() => {
        if (advanceMode !== 'voice' || state.phase !== 'awaiting-user') return;
        const analyser = analyserRef.current;
        if (!analyser) return;
        try { audioCtxRef.current?.resume?.(); } catch { /* */ }
        const buf = new Uint8Array(analyser.fftSize);
        let raf = 0; let done = false; let hasSpoken = false; let silenceStart = 0;
        const SPEAK = 0.03, SILENCE = 0.02, SILENCE_MS = 1100;
        const tick = () => {
            if (done) return;
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
            const rms = Math.sqrt(sum / buf.length);
            const now = performance.now();
            if (rms > SPEAK) { hasSpoken = true; silenceStart = 0; }
            else if (hasSpoken && rms < SILENCE) {
                if (!silenceStart) silenceStart = now;
                else if (now - silenceStart > SILENCE_MS) { done = true; r.advance(); return; }
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => { done = true; cancelAnimationFrame(raf); };
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
                <>
                    <button onClick={r.advance} className="mt-5 w-full rounded-full bg-amber-500 py-5 text-lg font-black text-black transition hover:bg-amber-400">SIGUIENTE ▸</button>
                    {advanceMode === 'voice' && (
                        <p className="mt-2 text-center text-xs text-zinc-500">
                            {micDenied ? '⚠️ Micrófono bloqueado — actívalo en el candado de la barra, o pulsa SIGUIENTE.' : '🎤 Escuchando… avanza solo al terminar tu frase (o pulsa SIGUIENTE).'}
                        </p>
                    )}
                </>
            ) : (
                <p className="mt-5 text-center text-sm text-zinc-500">{r.paused ? 'En pausa' : (engine === 'ai' ? 'Generando voz IA…' : 'Leyendo la réplica…')}</p>
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
