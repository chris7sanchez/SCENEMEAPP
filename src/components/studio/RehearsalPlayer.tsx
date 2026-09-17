'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    parseScriptScenes, speakersOfScenes, scenesWith, scenesWithDialogue, sceneLabel, cueOf,
    playableTurns, hasNarration, esDe, aplicarAlias, censoDeReparto, parejasEnEscena, NARRADOR,
    type Scene,
} from '@/lib/scene-script';
import { dudasDeReparto, claveDuda, type DudaReparto } from '@/lib/personajes';
import {
    getSpeechProvider, applyManner, MANNER_PRESETS, DEFAULT_PROFILE, OPENAI_TTS_VOICES, ELEVENLABS_VOICES, unlockAudio, getSharedAudioContext,
    type VoiceProfile, type SpeechVoice,
} from '@/lib/speech';
import { useRehearsal } from '@/hooks/useRehearsal';
import { VoiceTrigger } from '@/lib/voice-advance';

type LineMode = 'full' | 'cue' | 'hidden';
type AdvanceMode = 'tap' | 'voice';
type Engine = 'browser' | 'ai' | 'eleven' | 'cartesia';

/** Lo que el reproductor devuelve al cerrarse, para poder guardarlo en el guion. */
export interface AjustesEnsayo {
    reparto: Record<string, VoiceProfile>;
    miPersonaje: string;
    motor: string;
    /** Si el narrador lee las acotaciones. */
    narrador: boolean;
    /** Personajes que el actor confirmó que eran el mismo: grafía -> nombre bueno. */
    alias: Record<string, string>;
    /** Parejas que dijo que NO eran el mismo. Para no volver a preguntarlo. */
    distintos: string[];
}

export default function RehearsalPlayer({ script, ajustes, onGuardarAjustes, onClose }: {
    script: string;
    /** Reparto y elecciones guardadas de este guion, si las hay. */
    ajustes?: Partial<AjustesEnsayo>;
    /** Se llama al pulsar EMPEZAR: así el reparto queda guardado en la cuenta. */
    onGuardarAjustes?: (a: AjustesEnsayo) => void;
    onClose: () => void;
}) {
    /** Personajes que el actor ya confirmó que eran el mismo mal escrito. */
    const [alias, setAlias] = useState<Record<string, string>>(ajustes?.alias ?? {});
    /** Parejas que dijo que eran dos personajes distintos: no se vuelve a preguntar. */
    const [distintos, setDistintos] = useState<string[]>(ajustes?.distintos ?? []);

    const escenasCrudas = useMemo(() => parseScriptScenes(script), [script]);
    const scenes = useMemo(() => aplicarAlias(escenasCrudas, alias), [escenasCrudas, alias]);

    /**
     * Nombres que se PARECEN tanto que huelen a errata del mismo personaje.
     * No se unen solos: SONIA y SONÏA sí, pero MARC y MARCOS pueden ser dos
     * actores distintos y eso sólo lo sabe quien se ha leído el guion.
     */
    const dudas = useMemo(() => {
        const decididas = new Set(distintos);
        return dudasDeReparto(censoDeReparto(scenes), parejasEnEscena(scenes))
            .filter(d => !decididas.has(claveDuda(d.a, d.b)));
    }, [scenes, distintos]);
    // El reparto se calcula sobre el GUION ENTERO, no sobre las escenas
    // elegidas: así la voz de un personaje no cambia al cambiar de escena.
    const speakers = useMemo(() => speakersOfScenes(scenes), [scenes]);
    const conDialogo = useMemo(() => scenesWithDialogue(scenes), [scenes]);
    /** Un guion de verdad (varias escenas) abre el selector; una escena pegada, no. */
    const esGuionLargo = conDialogo.length > 1;
    /** Si el guion no trae acción ni acotaciones, no se ofrece el narrador. */
    const hayNarracion = useMemo(() => hasNarration(conDialogo), [conDialogo]);

    /** Personaje elegido a mano. Puede no estar en ESTE guion (viene guardado
     *  de otro, o el guion ha cambiado): quien manda es `role`, más abajo. */
    const [roleElegido, setRole] = useState(ajustes?.miPersonaje ?? '');
    const [mode, setMode] = useState<LineMode>('full');
    const [advance, setAdvance] = useState<AdvanceMode>('tap');
    const [engine, setEngine] = useState<Engine>((ajustes?.motor as Engine) ?? 'browser');
    const [started, setStarted] = useState(false);
    const [browserVoices, setBrowserVoices] = useState<SpeechVoice[]>([]);
    const [cartesiaVoices, setCartesiaVoices] = useState<SpeechVoice[]>([]);
    /** Voces tocadas a mano. Lo que no esté aquí se rellena solo (`profiles`). */
    const [repartoManual, setRepartoManual] = useState<Record<string, VoiceProfile>>(ajustes?.reparto ?? {});
    /** ¿Lee el narrador la acción y las acotaciones? */
    const [conNarrador, setConNarrador] = useState<boolean>(ajustes?.narrador ?? false);
    /** Elección manual de escenas, atada al personaje para el que se hizo:
     *  al cambiar de personaje vuelve a mandar la preselección de sus escenas. */
    const [seleccion, setSeleccion] = useState<{ role: string; ids: Set<number> } | null>(null);

    const voices = engine === 'ai' ? OPENAI_TTS_VOICES
        : engine === 'eleven' ? ELEVENLABS_VOICES
        : engine === 'cartesia' ? cartesiaVoices
        : browserVoices;

    // Si el personaje guardado no está en este guion, manda el primero. Se
    // deriva en vez de guardarse: así no hay un render de más con el personaje
    // equivocado, ni un efecto que lo corrija después.
    const role = roleElegido && speakers.includes(roleElegido) ? roleElegido : (speakers[0] ?? '');

    // Por defecto se ensayan TUS escenas, que es lo que se hace el 95% de las
    // veces; en cuanto tocas la lista manda tu elección, hasta que cambies de
    // personaje. Se deriva en vez de guardarse para no encadenar renders.
    const elegidas = useMemo(() => {
        if (seleccion && seleccion.role === role) return seleccion.ids;
        const mias = scenesWith(conDialogo, role);
        return new Set((mias.length ? mias : conDialogo).map(s => s.id));
    }, [seleccion, role, conDialogo]);
    const setElegidas = (ids: Set<number>) => setSeleccion({ role, ids });

    /** Las escenas que se van a ensayar, en orden de guion. */
    const escenasEnsayo = useMemo(
        () => (esGuionLargo ? conDialogo.filter(s => elegidas.has(s.id)) : conDialogo),
        [esGuionLargo, conDialogo, elegidas],
    );

    // Carga las voces de Cartesia (incluidas las clonadas) al elegir ese motor.
    useEffect(() => {
        if (engine !== 'cartesia') return;
        let cancelled = false;
        fetch('/api/tts/voices?provider=cartesia')
            .then(r => r.json())
            .then(d => { if (!cancelled) setCartesiaVoices(Array.isArray(d?.voices) ? d.voices : []); })
            .catch(() => { if (!cancelled) setCartesiaVoices([]); });
        return () => { cancelled = true; };
    }, [engine]);

    // Carga voces del navegador (para el motor 'browser').
    useEffect(() => {
        const load = () => setBrowserVoices(getSpeechProvider('browser').listVoices());
        load();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = load;
            return () => { window.speechSynthesis.onvoiceschanged = null; };
        }
    }, []);

    // A quién hay que ponerle voz: el reparto y, si el guion trae acotaciones,
    // también el narrador.
    const conVoz = useMemo(
        () => (hayNarracion ? [...speakers, NARRADOR] : speakers),
        [speakers, hayNarracion],
    );

    // Un perfil por cada uno de los que hablan, con una voz que EXISTA en el
    // motor elegido: al cambiar de motor las voces del anterior ya no valen y
    // hay que repartir de nuevo. Se deriva del reparto tocado a mano, así que
    // cambiar de motor no borra el tono ni la velocidad que ajustó el actor.
    const profiles = useMemo(() => {
        const next: Record<string, VoiceProfile> = {};
        conVoz.forEach((s, i) => {
            const base = repartoManual[s] ? { ...repartoManual[s] } : { ...DEFAULT_PROFILE };
            const ok = base.voiceId && voices.some(v => v.id === base.voiceId);
            if (!ok) base.voiceId = voices.length ? voices[i % voices.length].id : undefined;
            next[s] = base;
        });
        return next;
    }, [conVoz, repartoManual, voices]);

    /** Guardar un cambio del actor sobre el reparto derivado. */
    const setProfiles = (fn: (p: Record<string, VoiceProfile>) => Record<string, VoiceProfile>) =>
        setRepartoManual(fn(profiles));

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm p-4 sm:p-6 text-white overflow-y-auto">
            <div className={`mx-auto w-full pb-10 ${started && conDialogo.length > 0 ? 'max-w-5xl' : 'max-w-2xl'}`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-wide">Ensayar con réplicas</h2>
                    <button onClick={onClose} className="rounded-full px-3 py-1 text-zinc-400 hover:text-white" aria-label="Cerrar">✕</button>
                </div>

                {conDialogo.length === 0 ? (
                    <p className="mt-8 text-center text-zinc-400">No se detectaron diálogos. Pega una escena con personajes (NOMBRE: línea).</p>
                ) : !started && dudas.length > 0 ? (
                    <DudasReparto
                        dudas={dudas}
                        onMismo={d => setAlias(a => ({ ...a, [d.b]: d.a }))}
                        onDistintos={d => setDistintos(x => [...x, claveDuda(d.a, d.b)])}
                        onDejarlo={() => setDistintos(x => [...x, ...dudas.map(d => claveDuda(d.a, d.b))])}
                    />
                ) : !started ? (
                    <Config
                        speakers={speakers} role={role} setRole={setRole}
                        mode={mode} setMode={setMode} advance={advance} setAdvance={setAdvance}
                        engine={engine} setEngine={setEngine}
                        voices={voices} profiles={profiles} setProfiles={setProfiles}
                        escenas={conDialogo} elegidas={elegidas} setElegidas={setElegidas}
                        esGuionLargo={esGuionLargo} conVoz={conVoz}
                        hayNarracion={hayNarracion} conNarrador={conNarrador} setConNarrador={setConNarrador}
                        totalTurnos={escenasEnsayo.reduce((n, s) => n + playableTurns(s.turns, conNarrador).length, 0)}
                        onStart={() => {
                            onGuardarAjustes?.({ reparto: profiles, miPersonaje: role, motor: engine, narrador: conNarrador, alias, distintos });
                            setStarted(true);
                        }}
                    />
                ) : (
                    <ActivePlayer
                        key={role + engine + String(conNarrador) + escenasEnsayo.map(s => s.id).join(',')}
                        escenas={escenasEnsayo} role={role} conNarrador={conNarrador}
                        mode={mode} advanceMode={advance} engine={engine} profiles={profiles}
                        onBack={() => setStarted(false)} onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}

/**
 * ¿SONIA y SONÏA son la misma? Eso se une solo. ¿MARC y MARCOS? Eso NO.
 *
 * Una errata en el nombre parte a un personaje en dos: sale dos veces en el
 * reparto, hay que ponerle voz dos veces y la réplica le contesta con la voz
 * equivocada según la página. Pero unir por parecido a ciegas es peor: MARC y
 * MARCOS pueden ser dos actores. Así que aquí se pregunta, una sola vez por
 * guion, y la respuesta se guarda con él.
 */
function DudasReparto({ dudas, onMismo, onDistintos, onDejarlo }: {
    dudas: DudaReparto[];
    onMismo: (d: DudaReparto) => void;
    onDistintos: (d: DudaReparto) => void;
    onDejarlo: () => void;
}) {
    const d = dudas[0];
    const lineas = (n: number) => `${n} ${n === 1 ? 'línea' : 'líneas'}`;

    return (
        <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-500/80">Antes de repartir las voces</p>
            <h3 className="mt-2 text-xl font-black text-white">¿Son el mismo personaje?</h3>
            <p className="mt-1 text-sm text-zinc-400">
                En el guion hay dos nombres casi iguales. Si es una errata, los junto en uno;
                si son dos personajes, los dejo como están.
                {dudas.length > 1 && <> Quedan <strong className="text-zinc-300">{dudas.length}</strong> por aclarar.</>}
            </p>

            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                    <div className="min-w-[8rem]">
                        <p className="text-lg font-black text-amber-300">{d.a}</p>
                        <p className="text-[11px] text-zinc-500">{lineas(d.vecesA)}</p>
                    </div>
                    <span className="text-zinc-600">·</span>
                    <div className="min-w-[8rem]">
                        <p className="text-lg font-black text-amber-300">{d.b}</p>
                        <p className="text-[11px] text-zinc-500">{lineas(d.vecesB)}</p>
                    </div>
                </div>
                <p className="mt-3 text-center text-xs text-zinc-500">
                    {d.motivo === 'errata'
                        ? 'Se diferencian en una letra: suele ser un dedo de más al escribir.'
                        : 'Uno es el nombre corto del otro. A veces es la misma persona; a veces no.'}
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={() => onMismo(d)}
                        className="flex-1 rounded-full bg-amber-500 py-3 text-sm font-black text-black transition hover:bg-amber-400"
                    >
                        Es el mismo · se queda «{d.a}»
                    </button>
                    <button
                        onClick={() => onDistintos(d)}
                        className="flex-1 rounded-full bg-zinc-800 py-3 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700"
                    >
                        Son dos personajes
                    </button>
                </div>
            </div>

            <button
                onClick={onDejarlo}
                className="mt-4 w-full rounded-full px-4 py-2 text-xs text-zinc-500 transition hover:text-zinc-300"
            >
                Dejarlo como está y empezar a repartir
            </button>
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

function SelectorEscenas(props: {
    escenas: Scene[]; role: string;
    elegidas: Set<number>; setElegidas: (s: Set<number>) => void;
}) {
    const { escenas, role, elegidas, setElegidas } = props;
    const mias = useMemo(() => scenesWith(escenas, role), [escenas, role]);
    const soloMias = mias.length > 0 && mias.length === elegidas.size && mias.every(s => elegidas.has(s.id));
    const todas = elegidas.size === escenas.length;

    const alternar = (id: number) => {
        const next = new Set(elegidas);
        if (next.has(id)) next.delete(id); else next.add(id);
        setElegidas(next);
    };

    return (
        <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Qué ensayas</p>
            <div className="flex flex-wrap gap-2">
                <Chip active={soloMias} onClick={() => setElegidas(new Set(mias.map(s => s.id)))}>
                    Sólo mis escenas ({mias.length})
                </Chip>
                <Chip active={todas} onClick={() => setElegidas(new Set(escenas.map(s => s.id)))}>
                    Película entera ({escenas.length})
                </Chip>
            </div>

            <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-zinc-800 bg-black/30">
                {escenas.map((s, i) => {
                    const salgo = s.speakers.includes(role);
                    const marcada = elegidas.has(s.id);
                    return (
                        <label key={s.id} className="flex cursor-pointer items-start gap-3 border-b border-zinc-800/60 px-3 py-2 last:border-0 hover:bg-white/5">
                            <input type="checkbox" checked={marcada} onChange={() => alternar(s.id)} className="mt-1 accent-amber-500" />
                            <span className="min-w-0 flex-1">
                                <span className={`block truncate text-xs font-bold ${salgo ? 'text-amber-300' : 'text-zinc-400'}`}>
                                    {sceneLabel(s, i)}{salgo && <span className="ml-2 font-normal text-amber-500/70">· sales tú</span>}
                                </span>
                                <span className="block truncate text-[11px] text-zinc-500">
                                    {s.speakers.join(' · ')} — {s.turns.length} {s.turns.length === 1 ? 'línea' : 'líneas'}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
            {elegidas.size === 0 && (
                <p className="mt-2 text-xs text-amber-400/90">Marca al menos una escena para poder empezar.</p>
            )}
        </div>
    );
}

function Config(props: {
    speakers: string[]; role: string; setRole: (s: string) => void;
    mode: LineMode; setMode: (m: LineMode) => void;
    advance: AdvanceMode; setAdvance: (a: AdvanceMode) => void;
    engine: Engine; setEngine: (e: Engine) => void;
    voices: SpeechVoice[]; profiles: Record<string, VoiceProfile>;
    setProfiles: (fn: (p: Record<string, VoiceProfile>) => Record<string, VoiceProfile>) => void;
    escenas: Scene[]; elegidas: Set<number>; setElegidas: (s: Set<number>) => void;
    esGuionLargo: boolean; totalTurnos: number; conVoz: string[];
    hayNarracion: boolean; conNarrador: boolean; setConNarrador: (v: boolean) => void;
    onStart: () => void;
}) {
    const { speakers, role, setRole, mode, setMode, advance, setAdvance, engine, setEngine, voices, profiles, setProfiles, escenas, elegidas, setElegidas, esGuionLargo, totalTurnos, conVoz, hayNarracion, conNarrador, setConNarrador, onStart } = props;
    const update = (s: string, p: VoiceProfile) => setProfiles(prev => ({ ...prev, [s]: p }));
    const listo = Boolean(role) && totalTurnos > 0;

    return (
        <div className="mt-6">
            {/* Dos columnas en escritorio: a la izquierda lo que haces tú,
                a la derecha cómo suena tu compañero. En móvil, una sola. */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">

                <div className="space-y-6">
                    <p className="border-b border-zinc-800 pb-2 text-[11px] font-black uppercase tracking-[0.3em] text-amber-400/90">Tu parte</p>

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

                    {esGuionLargo && (
                        <SelectorEscenas escenas={escenas} role={role} elegidas={elegidas} setElegidas={setElegidas} />
                    )}
                </div>

                <div className="mt-8 space-y-6 lg:mt-0">
                    <p className="border-b border-zinc-800 pb-2 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Tu compañero</p>

                    <div>
                        <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Motor de voz</p>
                        <div className="flex flex-wrap gap-2">
                            <Chip active={engine === 'browser'} onClick={() => setEngine('browser')}>Navegador (gratis)</Chip>
                            <Chip active={engine === 'ai'} onClick={() => setEngine('ai')}>Voz IA (OpenAI)</Chip>
                            <Chip active={engine === 'eleven'} onClick={() => setEngine('eleven')}>Voz IA Pro (ElevenLabs)</Chip>
                            <Chip active={engine === 'cartesia'} onClick={() => setEngine('cartesia')}>Voz IA Pro (Cartesia)</Chip>
                        </div>
                        {engine === 'ai' && (
                            <p className="mt-2 text-xs text-zinc-500">Voz actuada con emoción. Requiere clave de OpenAI; si no, usa la del navegador.</p>
                        )}
                        {engine === 'eleven' && (
                            <p className="mt-2 text-xs text-zinc-500">La más natural. Requiere clave de ElevenLabs; si no, usa la del navegador. La emoción depende sobre todo de la voz elegida.</p>
                        )}
                        {engine === 'cartesia' && (
                            <p className="mt-2 text-xs text-zinc-500">Muy natural y barata. Usa tus voces de Cartesia (incluidas las que clones, p. ej. una voz castellana). El &quot;cómo habla&quot; ajusta la emoción. Requiere clave de Cartesia.</p>
                        )}
                    </div>

                    {hayNarracion && (
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Acotaciones</p>
                            <div className="flex flex-wrap gap-2">
                                <Chip active={!conNarrador} onClick={() => setConNarrador(false)}>Sólo diálogo</Chip>
                                <Chip active={conNarrador} onClick={() => setConNarrador(true)}>Las lee un narrador</Chip>
                            </div>
                            <p className="mt-2 text-xs text-zinc-500">
                                La acción del guion y las indicaciones entre paréntesis se leen en voz
                                alta, con su propia voz, antes de la frase a la que acompañan.
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Voz de cada personaje</p>
                        <p className="mb-3 text-xs text-zinc-500">Ajusta cada personaje. (Tu personaje no se lee en voz alta.)</p>
                        <div className="space-y-3">
                            {conVoz
                                .filter(s => s !== NARRADOR || conNarrador)
                                .map(s => (
                                    <VoiceEditor
                                        key={s} speaker={s} isMine={s === role} esNarrador={s === NARRADOR}
                                        engine={engine} voices={voices}
                                        profile={profiles[s] ?? DEFAULT_PROFILE}
                                        onChange={(p) => update(s, p)}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => { unlockAudio(); onStart(); }} disabled={!listo} className="mt-8 w-full rounded-full bg-amber-500 py-4 text-base font-black text-black transition hover:bg-amber-400 disabled:opacity-50">
                EMPEZAR
                {esGuionLargo && listo && (
                    <span className="ml-2 font-bold text-black/60">
                        · {elegidas.size} {elegidas.size === 1 ? 'escena' : 'escenas'}, {totalTurnos} líneas
                    </span>
                )}
            </button>
        </div>
    );
}

const AI_TONE_CHIPS = ['Tono frío y cortante', 'Con rabia contenida', 'Cálido y cercano', 'Nervioso, al borde del llanto', 'Irónico', 'Susurrando, íntimo'];

function VoiceEditor(props: { speaker: string; isMine: boolean; esNarrador?: boolean; engine: Engine; voices: SpeechVoice[]; profile: VoiceProfile; onChange: (p: VoiceProfile) => void; }) {
    const { speaker, isMine, esNarrador, engine, voices, profile, onChange } = props;
    const muestra = esNarrador ? 'Ana friega. Entra Luis, mojado.' : `Hola, soy ${speaker}.`;
    const test = () => getSpeechProvider(engine).speak(muestra, { voiceId: profile.voiceId, rate: profile.rate, pitch: profile.pitch, instructions: profile.instructions });

    return (
        <div className={`rounded-xl border p-3 ${isMine ? 'border-zinc-800 bg-zinc-900/30 opacity-70' : esNarrador ? 'border-zinc-600 bg-zinc-800/40' : 'border-zinc-700 bg-zinc-900/60'}`}>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold uppercase ${esNarrador ? 'text-zinc-300' : 'text-amber-300'}`}>
                    {esNarrador ? 'Narrador' : speaker}
                    {esNarrador && <span className="ml-2 text-[10px] font-normal normal-case text-zinc-500">lee las acotaciones</span>}
                    {isMine && <span className="ml-2 text-[10px] font-normal text-zinc-500">(tú — sin voz)</span>}
                </span>
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
    escenas: Scene[]; role: string; conNarrador: boolean; mode: LineMode; advanceMode: AdvanceMode;
    engine: Engine; profiles: Record<string, VoiceProfile>; onBack: () => void; onClose: () => void;
}) {
    const { escenas, role, conNarrador, mode, advanceMode, engine, profiles, onBack, onClose } = props;

    // Las escenas elegidas se ensayan SEGUIDAS, como una sola secuencia: el
    // reparto se responde entre sí y se cruza de escena sin parar.
    const bloques = useMemo(
        () => escenas
            .map(s => ({ escena: s, turns: playableTurns(s.turns, conNarrador) }))
            .filter(b => b.turns.length > 0),
        [escenas, conNarrador],
    );
    const turns = useMemo(() => bloques.flatMap(b => b.turns), [bloques]);
    // Posición (en la secuencia plana) -> escena a la que pertenece ese turno.
    const escenaDeTurno = useMemo(() => bloques.flatMap(b => b.turns.map(() => b.escena)), [bloques]);
    /** Ids de los turnos con los que ARRANCA cada escena (para el rótulo). */
    const abreEscena = useMemo(() => new Set(bloques.map(b => b.turns[0].id)), [bloques]);
    const indiceEscena = useMemo(() => {
        const m = new Map<number, number>();
        escenas.forEach((s, i) => m.set(s.id, i));
        return m;
    }, [escenas]);

    const r = useRehearsal(turns, role, { profiles, engine });
    const { state, current } = r;
    const [micDenied, setMicDenied] = useState(false);
    const [micError, setMicError] = useState('');
    const [micAttempt, setMicAttempt] = useState(0);
    // El detector de voz SOLO puede armarse cuando el micro ya está abierto.
    // Tiene que ser estado (no ref): si fuera ref, el efecto del detector se
    // ejecutaría con el analizador aún a null (permiso del navegador pendiente)
    // y no volvería a armarse jamás — la réplica "contestaba una vez y nunca más".
    const [micReady, setMicReady] = useState(false);
    const [heard, setHeard] = useState(false);
    /** El AudioContext sigue 'suspended' (iOS sin gesto): el micro no mide nada. */
    const [micSuspended, setMicSuspended] = useState(false);
    const micStreamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const vuRef = useRef<HTMLDivElement | null>(null);
    const currentLineRef = useRef<HTMLDivElement | null>(null);

    // Desplaza la separata para que la línea actual quede siempre visible.
    useEffect(() => {
        currentLineRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [state.index]);

    useEffect(() => { r.start(); /* eslint-disable-next-line */ }, []);

    // Abrir el micrófono UNA vez y mantenerlo abierto todo el ensayo (sin clic),
    // y montar un analizador de volumen (Web Audio) para detectar tu voz nosotros
    // mismos — sin el reconocimiento de Chrome (que choca con el micro ya abierto).
    useEffect(() => {
        if (advanceMode !== 'voice') return;
        const md = (typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined) as MediaDevices | undefined;
        if (!md?.getUserMedia) { setMicDenied(true); setMicError('sin-soporte'); return; }
        setMicDenied(false); setMicError('');
        let cancelled = false;
        const resumeCtx = () => { audioCtxRef.current?.resume?.().catch(() => {}); };
        md.getUserMedia({ audio: true })
            .then(s => {
                if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
                micStreamRef.current = s;
                try {
                    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
                    // Preferimos el contexto creado DENTRO del gesto de EMPEZAR: iOS
                    // deja suspendido para siempre uno creado fuera de un gesto.
                    const ctx: AudioContext = getSharedAudioContext() || new AC();
                    ctx.resume?.().catch(() => {});
                    const src = ctx.createMediaStreamSource(s);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 1024;
                    src.connect(analyser);
                    audioCtxRef.current = ctx;
                    analyserRef.current = analyser;
                    setMicReady(true); // avisa al detector: ya puede armarse
                    // Chrome suele dejar el AudioContext "suspended": reanúdalo al primer gesto.
                    window.addEventListener('pointerdown', resumeCtx);
                    window.addEventListener('keydown', resumeCtx);
                } catch { /* */ }
            })
            .catch((err: unknown) => { setMicDenied(true); setMicError(err instanceof Error ? err.name : 'error'); });
        return () => {
            cancelled = true;
            window.removeEventListener('pointerdown', resumeCtx);
            window.removeEventListener('keydown', resumeCtx);
            try { if (audioCtxRef.current && audioCtxRef.current !== getSharedAudioContext()) audioCtxRef.current.close(); } catch { /* */ }
            audioCtxRef.current = null; analyserRef.current = null;
            setMicReady(false);
            if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [micAttempt]);

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
    // Se REARMA en cada turno tuyo (y en cuanto el micro esté listo: micReady).
    useEffect(() => {
        if (advanceMode !== 'voice' || state.phase !== 'awaiting-user' || !micReady) return;
        const analyser = analyserRef.current;
        if (!analyser) return;
        setHeard(false);
        try { audioCtxRef.current?.resume?.(); } catch { /* */ }
        const buf = new Uint8Array(analyser.fftSize);
        const trigger = new VoiceTrigger();
        let raf = 0; let done = false; let frame = 0; let heardShown = false; let suspendedFrames = 0;
        const tick = () => {
            if (done) return;
            frame++;
            // Chrome puede suspender el AudioContext a mitad de ensayo (sin gesto
            // del usuario en modo voz): reanúdalo periódicamente o el micro "muere".
            const ctxState = audioCtxRef.current?.state;
            if (frame % 60 === 0 && ctxState === 'suspended') {
                audioCtxRef.current?.resume().catch(() => {});
            }
            // Si sigue suspendido ~1,5 s, iOS está esperando un gesto: se pide.
            if (ctxState === 'suspended') { if (++suspendedFrames === 90) setMicSuspended(true); }
            else if (suspendedFrames) { suspendedFrames = 0; setMicSuspended(false); }
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
            const rms = Math.sqrt(sum / buf.length);
            // Medidor visible: el usuario VE que el micro le está oyendo.
            if (vuRef.current) vuRef.current.style.width = `${Math.min(100, Math.round(rms * 700))}%`;
            if (!heardShown && trigger.heard) { heardShown = true; setHeard(true); }
            if (trigger.sample(rms, performance.now())) { done = true; r.advance(); return; }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => { done = true; cancelAnimationFrame(raf); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [advanceMode, state.phase, state.index, micReady]);

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

    const esNarracion = current?.kind !== undefined && current.kind !== 'dialogo';
    // Una línea al unísono es tuya si eres uno de los que la dicen.
    const isMine = !!current && esDe(current, role);
    const progress = `${Math.min(state.index + 1, turns.length)} / ${turns.length}`;
    const escenaActual = escenaDeTurno[state.index];
    const variasEscenas = bloques.length > 1;
    let lineText = current?.text ?? '';
    if (isMine) {
        if (mode === 'cue') lineText = cueOf(current?.text ?? '', 3);
        else if (mode === 'hidden') lineText = '— tu línea —';
    }

    return (
        <div className="mt-6 lg:grid lg:grid-cols-[1fr_19rem] lg:gap-8 lg:items-start">
            <div>
                <div className="mb-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span className="shrink-0">{progress}</span>
                    {variasEscenas && escenaActual && (
                        <span className="min-w-0 flex-1 truncate text-center font-bold uppercase tracking-wider text-zinc-400">
                            {sceneLabel(escenaActual, indiceEscena.get(escenaActual.id) ?? 0)}
                        </span>
                    )}
                    {/* La acción y la acotación no son lo mismo: una cuenta lo que
                        pasa, la otra dice CÓMO se dice la frase que viene detrás. */}
                    <span className="shrink-0">{isMine ? 'TU TURNO' : current?.kind === 'acotacion' ? 'ACOTACIÓN' : current?.kind === 'accion' ? 'ACCIÓN' : 'RÉPLICA'}</span>
                </div>
                <div className={`min-h-[180px] rounded-2xl border p-6 text-center text-xl leading-relaxed sm:text-2xl ${isMine ? 'border-amber-500/50 bg-amber-500/5' : esNarracion ? 'border-zinc-700/60 border-dashed bg-zinc-900/40' : 'border-zinc-700 bg-zinc-900/60'}`}>
                    <p className={`mb-3 text-sm font-bold uppercase tracking-widest ${isMine ? 'text-amber-400' : 'text-zinc-400'}`}>
                        {esNarracion ? 'Narrador' : current?.speaker}
                    </p>
                    <p className={esNarracion ? 'italic text-zinc-300' : isMine && mode === 'hidden' ? 'text-zinc-500 italic' : 'text-white'}>{lineText}</p>
                </div>
                {isMine ? (
                    <>
                        <button onClick={r.advance} className="mt-5 w-full rounded-full bg-amber-500 py-5 text-lg font-black text-black transition hover:bg-amber-400">SIGUIENTE ▸</button>
                        {advanceMode === 'voice' && (
                            <div className="mt-2 text-center text-xs text-zinc-500">
                                {micDenied ? (
                                    <p>
                                        ⚠️ Micrófono no disponible{micError ? ` (${micError})` : ''} — permítelo en el candado de la barra (y en macOS → Ajustes → Privacidad → Micrófono → Chrome).{' '}
                                        <button onClick={() => setMicAttempt(n => n + 1)} className="font-bold text-amber-400 underline hover:text-amber-300">Reintentar</button>{' '}o pulsa SIGUIENTE.
                                    </p>
                                ) : !micReady ? (
                                    <p className="animate-pulse">🎙️ Activando el micrófono… (acepta el permiso si te lo pide)</p>
                                ) : micSuspended ? (
                                    <p className="font-bold text-amber-300">👆 Toca la pantalla una vez para activar el micrófono.</p>
                                ) : (
                                    <div>
                                        <p className={heard ? 'font-bold text-emerald-400' : ''}>
                                            {heard ? '✓ Te he oído — cuando calles, entra la réplica' : '🎤 Di tu frase cuando quieras…'}
                                        </p>
                                        <div className="mx-auto mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-zinc-800">
                                            <div ref={vuRef} className={`h-full rounded-full transition-[width] duration-75 ${heard ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: '0%' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-5 text-center">
                        <p className="text-sm text-zinc-500">
                            {r.paused ? 'En pausa'
                                : r.voiceStatus === 'esperando' ? 'Vuelve a esta pestaña para seguir con la réplica.'
                                : r.voiceStatus === 'sonando' ? 'Leyendo la réplica…'
                                : r.voiceStatus === 'silencio' ? 'La voz no ha sonado: lee la réplica y sigue.'
                                : (engine === 'browser' ? 'Preparando la réplica…' : 'Generando voz IA…')}
                        </p>
                        {r.voiceFailed && (
                            <p className="mx-auto mt-2 max-w-md rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                ⚠️ No se ha oído la voz de la réplica. Sube el volumen o quita el modo silencio del móvil; la escena continúa sola.
                            </p>
                        )}
                        <button onClick={r.skip} className="mt-3 rounded-full bg-zinc-800 px-6 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700">Continuar ▸ <span className="font-normal text-zinc-500">(si no se oye)</span></button>
                    </div>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                    <button onClick={r.prev} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">◂ Anterior</button>
                    <button onClick={r.repeat} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">⟲ Repetir</button>
                    <button onClick={r.togglePause} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">{r.paused ? '▶ Reanudar' : '⏸ Pausa'}</button>
                    <button onClick={r.skip} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">Saltar ▸</button>
                    <button onClick={r.restart} className="rounded-full bg-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-700">Reiniciar</button>
                </div>
            </div>

            <div className="mt-8 lg:mt-0 lg:sticky lg:top-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">Separata</p>
                <div className="max-h-72 overflow-y-auto rounded-md bg-[#f4efe2] px-4 py-3 text-zinc-900 shadow-md ring-1 ring-black/10 lg:max-h-[64vh]"
                    style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                    {turns.map((t, i) => {
                        const narracion = t.kind !== 'dialogo';
                        const mine = !narracion && t.speaker === role;
                        const active = i === state.index;
                        // Encabezado de escena justo antes de su primera línea.
                        const escena = escenaDeTurno[i];
                        const rotulo = variasEscenas && escena && abreEscena.has(t.id);
                        return (
                            <React.Fragment key={t.id}>
                                {rotulo && (
                                    <p className={`mb-2 mt-1 border-b border-zinc-400/60 pb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-700 ${i > 0 ? 'mt-5' : ''}`}>
                                        {sceneLabel(escena, indiceEscena.get(escena.id) ?? 0)}
                                    </p>
                                )}
                                <div ref={active ? currentLineRef : undefined}
                                    className={`mb-2.5 rounded-sm px-1 ${active ? 'bg-amber-300/60' : ''}`}>
                                    {narracion ? (
                                        // La acción va al margen y en cursiva, como en el guion.
                                        <p className="text-[12px] italic leading-snug text-zinc-600">{t.text}</p>
                                    ) : (
                                        <>
                                            <p className={`pl-10 text-[11px] font-bold uppercase ${mine ? 'text-amber-800' : 'text-zinc-600'}`}>{t.speaker}{mine ? ' (TÚ)' : ''}</p>
                                            <p className={`pl-4 text-[12px] leading-snug ${mine ? 'text-amber-950 font-semibold' : 'text-zinc-800'}`}>{t.text}</p>
                                        </>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            <div className="mt-6 text-center">
                <button onClick={onClose} className="text-xs text-zinc-500 hover:text-white">Cerrar ensayo</button>
            </div>
        </div>
    );
}
