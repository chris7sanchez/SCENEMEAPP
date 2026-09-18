'use client';

// EL ESTUDIO DE DOBLAJE. Tu compañero se sienta diez minutos, graba sus
// líneas, y a partir de ahí ensayas contra su voz y no contra una máquina.
//
// Va línea a línea a propósito, no de una tirada: así cada réplica queda
// recortada por sí sola y entra exactamente cuando te toca oírla. Grabar la
// escena entera y luego trocearla sería peor de hacer y peor de repetir.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    guardarToma, borrarToma, borrarPersonaje, formatoDeGrabacion,
    comoPeso, pesoDeTomas, BITS_POR_SEGUNDO, type TomaVoz,
} from '@/lib/voces-grabadas';

export interface LineaGrabable {
    clave: string;
    texto: string;
    /** Rótulo de la escena, para saber dónde se está. */
    escena: string;
}

export default function GrabadorDeVoces({ guionId, uid, personaje, lineas, tomas, onCambio, onClose }: {
    guionId: string;
    /** Con sesión, las tomas van a la cuenta y sobreviven a este navegador. */
    uid: string | null;
    personaje: string;
    lineas: LineaGrabable[];
    tomas: Map<string, TomaVoz>;
    /** Se llama tras guardar o borrar: quien manda recarga las tomas. */
    onCambio: () => void;
    onClose: () => void;
}) {
    const [i, setI] = useState(() => {
        // Se empieza por la primera que falte, que es lo que se va a hacer.
        const falta = lineas.findIndex(l => !tomas.has(l.clave));
        return falta < 0 ? 0 : falta;
    });
    const [grabando, setGrabando] = useState(false);
    const [nivel, setNivel] = useState(0);
    const [segundos, setSegundos] = useState(0);
    const [permiso, setPermiso] = useState<'pidiendo' | 'ok' | 'denegado'>('pidiendo');
    const [reproduciendo, setReproduciendo] = useState(false);
    /** Qué ha pasado con la última toma: '' si fue bien a la cuenta. */
    const [avisoGuardado, setAvisoGuardado] = useState('');

    const streamRef = useRef<MediaStream | null>(null);
    const ctxRef = useRef<AudioContext | null>(null);
    const analizadorRef = useRef<AnalyserNode | null>(null);
    const grabadorRef = useRef<MediaRecorder | null>(null);
    const trozosRef = useRef<Blob[]>([]);
    const desdeRef = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const linea = lineas[i];
    const toma = linea ? tomas.get(linea.clave) : undefined;
    const hechas = useMemo(() => lineas.filter(l => tomas.has(l.clave)).length, [lineas, tomas]);
    const peso = useMemo(
        () => pesoDeTomas([...tomas.values()].filter(t => t.personaje === personaje)),
        [tomas, personaje],
    );
    const formato = useMemo(() => formatoDeGrabacion(), []);
    /** Si este navegador puede grabar se sabe AL PINTAR, no hace falta efecto. */
    const soportado = formato !== ''
        && typeof navigator !== 'undefined'
        && !!navigator.mediaDevices?.getUserMedia;
    const error = !soportado
        ? 'Este navegador no sabe grabar desde el micrófono. Prueba con Chrome, Edge o Safari actualizados.'
        : permiso === 'denegado'
            ? 'No has dado permiso al micrófono. Actívalo en el candado de la barra de direcciones y vuelve a entrar.'
            : '';

    // El micro se abre UNA vez y se queda abierto: pedir permiso en cada línea
    // sería insufrible, y el primer segundo de cada toma se perdería esperando.
    useEffect(() => {
        if (!soportado) return;
        let vivo = true;
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
            .then(s => {
                if (!vivo) { s.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = s;
                setPermiso('ok');
                try {
                    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                    const ctx = new AC();
                    const analizador = ctx.createAnalyser();
                    analizador.fftSize = 1024;
                    ctx.createMediaStreamSource(s).connect(analizador);
                    ctxRef.current = ctx;
                    analizadorRef.current = analizador;
                } catch { /* el medidor es un lujo, grabar no */ }
            })
            .catch(() => { if (vivo) setPermiso('denegado'); });

        return () => {
            vivo = false;
            try { grabadorRef.current?.stop(); } catch { /* */ }
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
            try { ctxRef.current?.close(); } catch { /* */ }
            ctxRef.current = null; analizadorRef.current = null;
        };
    }, [soportado]);

    // Medidor de volumen y cronómetro, sólo mientras se graba.
    useEffect(() => {
        if (!grabando) return;   // el nivel sólo se pinta grabando: no hay que ponerlo a cero
        const analizador = analizadorRef.current;
        const buf = analizador ? new Uint8Array(analizador.fftSize) : null;
        let raf = 0;
        const tic = () => {
            if (analizador && buf) {
                analizador.getByteTimeDomainData(buf);
                let suma = 0;
                for (let k = 0; k < buf.length; k++) { const v = (buf[k] - 128) / 128; suma += v * v; }
                setNivel(Math.min(1, Math.sqrt(suma / buf.length) * 7));
            }
            setSegundos((Date.now() - desdeRef.current) / 1000);
            raf = requestAnimationFrame(tic);
        };
        raf = requestAnimationFrame(tic);
        return () => cancelAnimationFrame(raf);
    }, [grabando]);

    const arrancar = () => {
        const s = streamRef.current;
        if (!s || !linea || grabando) return;
        try { ctxRef.current?.resume?.(); } catch { /* */ }
        trozosRef.current = [];
        const g = new MediaRecorder(s, { mimeType: formato, audioBitsPerSecond: BITS_POR_SEGUNDO });
        g.ondataavailable = e => { if (e.data.size) trozosRef.current.push(e.data); };
        g.onstop = async () => {
            const audio = new Blob(trozosRef.current, { type: formato });
            const duracionMs = Date.now() - desdeRef.current;
            // Un chasquido de medio segundo no es una toma: casi siempre es un
            // doble clic. Se descarta antes de machacar la que hubiera.
            if (audio.size > 1200 && duracionMs > 400) {
                const r = await guardarToma(
                    { guionId, personaje, texto: linea.texto, clave: linea.clave, audio, duracionMs },
                    uid,
                );
                // Si la toma NO ha llegado a la cuenta hay que decirlo AHORA, no
                // cuando se haya grabado media escena y se pierda al cerrar.
                setAvisoGuardado(
                    r.enLaCuenta ? ''
                        : r.motivo === 'sin-sesion'
                            ? 'Esta toma se ha guardado sólo en este navegador. Inicia sesión para que quede en tu cuenta y no se pierda.'
                            : r.motivo === 'demasiado-larga'
                                ? 'La toma es demasiado larga para subirla a tu cuenta; se queda sólo en este navegador. Prueba a partir la frase.'
                                : 'No se ha podido subir a tu cuenta (¿sin conexión?). Se ha guardado en este navegador; se subirá si vuelves a grabarla con red.',
                );
                onCambio();
            }
        };
        desdeRef.current = Date.now();
        g.start();
        grabadorRef.current = g;
        setGrabando(true);
    };

    const parar = () => {
        if (!grabando) return;
        try { grabadorRef.current?.stop(); } catch { /* */ }
        grabadorRef.current = null;
        setGrabando(false);
        setSegundos(0);
    };

    const escuchar = () => {
        if (!toma) return;
        audioRef.current?.pause();
        const url = URL.createObjectURL(toma.audio);
        const a = new Audio(url);
        audioRef.current = a;
        setReproduciendo(true);
        const fin = () => { setReproduciendo(false); URL.revokeObjectURL(url); };
        a.onended = fin; a.onerror = fin;
        a.play().catch(fin);
    };

    const siguiente = () => { parar(); setI(n => Math.min(lineas.length - 1, n + 1)); };
    const anterior = () => { parar(); setI(n => Math.max(0, n - 1)); };

    const rehacer = async () => {
        if (!linea) return;
        await borrarToma(guionId, linea.clave, uid);
        onCambio();
    };

    const borrarTodo = async () => {
        if (!confirm(`¿Borrar TODAS las tomas de ${personaje}? No se puede deshacer.`)) return;
        await borrarPersonaje(guionId, personaje, uid);
        onCambio();
    };

    // La barra espaciadora graba y para: con el guion en la mano, el ratón sobra.
    useEffect(() => {
        const tecla = (e: KeyboardEvent) => {
            if (e.code !== 'Space') return;
            const en = (e.target as HTMLElement)?.tagName;
            if (en === 'INPUT' || en === 'TEXTAREA') return;
            e.preventDefault();
            if (grabando) parar(); else arrancar();
        };
        window.addEventListener('keydown', tecla);
        return () => window.removeEventListener('keydown', tecla);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grabando, i, linea?.clave]);

    if (!linea) {
        return (
            <div className="mt-8 text-center text-zinc-400">
                <p>{personaje} no tiene líneas que grabar en este guion.</p>
                <button onClick={onClose} className="mt-4 rounded-full bg-zinc-800 px-5 py-2 text-sm font-bold text-zinc-200">Volver</button>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-500/80">Grabar la voz de</p>
                    <h3 className="text-2xl font-black text-white">{personaje}</h3>
                </div>
                <button onClick={onClose} className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700">
                    ✓ Terminar
                </button>
            </div>

            <p className="mt-1 text-sm text-zinc-400">
                <strong className="text-zinc-200">{hechas}</strong> de {lineas.length} líneas grabadas
                {peso > 0 && <span className="text-zinc-600"> · {comoPeso(peso)}</span>}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${(hechas / lineas.length) * 100}%` }} />
            </div>

            {error ? (
                <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>
            ) : (
                <>
                    <div className={`mt-5 rounded-2xl border p-6 transition ${grabando ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-zinc-900/60'}`}>
                        <p className="text-center text-[11px] uppercase tracking-widest text-zinc-500">
                            {linea.escena} · línea {i + 1} de {lineas.length}
                        </p>
                        <p className="mt-3 text-center text-xl leading-relaxed text-white sm:text-2xl">{linea.texto}</p>

                        {grabando ? (
                            <div className="mt-5">
                                <div className="mx-auto h-2 max-w-sm overflow-hidden rounded-full bg-zinc-800">
                                    <div className="h-full bg-red-500" style={{ width: `${Math.round(nivel * 100)}%` }} />
                                </div>
                                <p className="mt-2 text-center text-xs text-red-300">● grabando · {segundos.toFixed(1)}s</p>
                            </div>
                        ) : toma ? (
                            <p className="mt-4 text-center text-xs text-emerald-400">
                                ✓ grabada ({(toma.duracionMs / 1000).toFixed(1)}s)
                            </p>
                        ) : (
                            <p className="mt-4 text-center text-xs text-zinc-600">Sin grabar</p>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                            onClick={grabando ? parar : arrancar}
                            className={`flex-1 rounded-full py-4 text-sm font-black transition ${grabando ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
                        >
                            {grabando ? '■ PARAR' : toma ? '● VOLVER A GRABAR' : '● GRABAR'}
                        </button>
                        {toma && !grabando && (
                            <button onClick={escuchar} className="rounded-full bg-zinc-800 px-6 py-4 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700">
                                {reproduciendo ? '♪ sonando…' : '▶ Escuchar'}
                            </button>
                        )}
                    </div>
                    <p className="mt-2 text-center text-[11px] text-zinc-600">También con la barra espaciadora</p>

                    <div className="mt-4 flex items-center justify-between gap-2">
                        <button onClick={anterior} disabled={i === 0}
                            className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-40">
                            ◀ Anterior
                        </button>
                        {toma && (
                            <button onClick={rehacer} className="px-3 py-2 text-xs text-zinc-500 transition hover:text-red-400">
                                Descartar esta toma
                            </button>
                        )}
                        <button onClick={siguiente} disabled={i === lineas.length - 1}
                            className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-40">
                            Siguiente ▶
                        </button>
                    </div>

                    {hechas > 0 && (
                        <button onClick={borrarTodo} className="mt-6 w-full px-4 py-2 text-[11px] text-zinc-600 transition hover:text-red-400">
                            Borrar las {hechas} tomas de {personaje}
                        </button>
                    )}
                </>
            )}

            {avisoGuardado && (
                <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                    ⚠️ {avisoGuardado}
                </p>
            )}

            {uid ? (
                <p className="mt-6 rounded-xl border border-emerald-600/30 bg-emerald-500/5 p-3 text-[11px] leading-relaxed text-emerald-300/80">
                    ✓ Las tomas se guardan <strong>en tu cuenta</strong>. Las tendrás en cualquier
                    ordenador y no se pierden aunque vacíes el navegador.
                </p>
            ) : (
                <p className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
                    ⚠️ <strong>Sin sesión iniciada</strong>, las tomas se guardan sólo en este navegador y se
                    pierden al vaciarlo (y en una ventana privada, al cerrarla). Inicia sesión antes de
                    ponerte a grabar: es un minuto ahora frente a repetirlo todo después.
                </p>
            )}
        </div>
    );
}
