'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SpeechVoice } from '@/lib/speech';
import { generoDeVoz } from '@/lib/genero';

/**
 * EL DESPLEGABLE DE VOCES, ABIERTO Y CON BUSCADOR.
 *
 * Era un `<select>` del sistema. Con seis voces se aguanta; el navegador de
 * Christian tiene más de cien, y ahí el desplegable del sistema es una lista
 * infinita ordenada por nada, sin forma de buscar, que se cierra al primer
 * despiste y en el móvil ocupa la pantalla entera. Elegir la voz de seis
 * personajes con eso es un suplicio.
 *
 * Aquí se escribe y se filtra. "mujer", "español", "mónica", "es-ES": todo
 * cuenta. Cada voz se puede ESCUCHAR sin elegirla -el triángulo de la
 * derecha-, que es lo que uno quiere hacer de verdad: comparar tres y quedarse
 * con una, no ir seleccionando a ciegas y volviendo atrás.
 *
 * El sexo de cada voz sale marcado (♀ ♂) porque se deduce de su nombre, igual
 * que se deduce el del personaje. Es la misma función, así que lo que se ve en
 * la lista y lo que la aplicación reparte sola no pueden contradecirse.
 */

export function SelectorDeVoz(props: {
    voices: SpeechVoice[];
    valor?: string;
    onChange: (voiceId: string | undefined) => void;
    /** Escuchar una voz sin elegirla. */
    onProbar?: (voiceId: string) => void;
    /** Para el aria-label: "Voz de LUIS". */
    personaje: string;
}) {
    const { voices, valor, onChange, onProbar, personaje } = props;
    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [resaltada, setResaltada] = useState(0);
    const caja = useRef<HTMLDivElement>(null);
    const campo = useRef<HTMLInputElement>(null);

    const elegida = voices.find(v => v.id === valor);

    const filtradas = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return voices;
        // Buscar por sexo con la palabra de toda la vida, no sólo por el nombre
        // que le haya puesto el fabricante.
        const porSexo = /^(mujer|femenina|femenino|female|f)$/.test(q) ? 'f'
            : /^(hombre|masculina|masculino|male|m)$/.test(q) ? 'm'
                : null;
        return voices.filter(v => {
            if (porSexo) return generoDeVoz(v) === porSexo;
            return `${v.label} ${v.lang}`.toLowerCase().includes(q);
        });
    }, [voices, busqueda]);

    // Cerrar al pulsar fuera. Sin esto, abrir el de otro personaje deja dos
    // listas abiertas peleándose por el sitio.
    useEffect(() => {
        if (!abierto) return;
        const fuera = (e: MouseEvent) => {
            if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
        };
        document.addEventListener('mousedown', fuera);
        return () => document.removeEventListener('mousedown', fuera);
    }, [abierto]);

    useEffect(() => {
        if (abierto) campo.current?.focus();
    }, [abierto]);

    const elegir = (v: SpeechVoice) => {
        onChange(v.id);
        setAbierto(false);
        setBusqueda('');
    };

    const teclas = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { setAbierto(false); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); setResaltada(i => Math.min(i + 1, filtradas.length - 1)); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); setResaltada(i => Math.max(i - 1, 0)); return; }
        if (e.key === 'Enter') {
            e.preventDefault();
            const v = filtradas[resaltada];
            if (v) elegir(v);
        }
    };

    const marca = (v: SpeechVoice) => {
        const g = generoDeVoz(v);
        return g === 'f' ? '♀' : g === 'm' ? '♂' : '';
    };

    return (
        <div ref={caja} className="relative">
            <button
                type="button"
                onClick={() => { setAbierto(a => !a); setResaltada(Math.max(0, filtradas.findIndex(v => v.id === valor))); }}
                aria-haspopup="listbox"
                aria-expanded={abierto}
                aria-label={`Voz de ${personaje}`}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-700 bg-black/40 p-2 text-left text-sm text-zinc-200 transition hover:border-zinc-600"
            >
                <span className="truncate">
                    {elegida ? (
                        <>
                            {elegida.label}
                            {elegida.lang !== 'multi' && <span className="text-zinc-500"> · {elegida.lang}</span>}
                            {marca(elegida) && <span className="ml-1.5 text-zinc-500">{marca(elegida)}</span>}
                        </>
                    ) : (
                        <span className="text-zinc-500">{voices.length ? 'Elegir voz…' : '(voz por defecto)'}</span>
                    )}
                </span>
                <span className={`shrink-0 text-[10px] text-zinc-500 transition-transform ${abierto ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {abierto && (
                <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/60">
                    <div className="border-b border-zinc-800 p-2">
                        <input
                            ref={campo}
                            value={busqueda}
                            onChange={e => { setBusqueda(e.target.value); setResaltada(0); }}
                            onKeyDown={teclas}
                            placeholder="Escribe: mujer, español, es-ES, Mónica…"
                            className="w-full rounded-md border border-zinc-800 bg-black/60 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
                        />
                        <p className="mt-1 px-0.5 text-[10px] text-zinc-600">
                            {filtradas.length === voices.length
                                ? `${voices.length} ${voices.length === 1 ? 'voz' : 'voces'}`
                                : `${filtradas.length} de ${voices.length}`}
                            {onProbar && ' · pulsa ▶ para escucharla sin elegirla'}
                        </p>
                    </div>

                    <ul role="listbox" className="max-h-64 overflow-y-auto overscroll-contain">
                        {filtradas.length === 0 && (
                            <li className="px-3 py-4 text-center text-xs text-zinc-500">
                                Ninguna voz se llama así. Prueba con el idioma: «es», «en-US».
                            </li>
                        )}
                        {filtradas.map((v, i) => (
                            <li key={v.id} role="option" aria-selected={v.id === valor}>
                                <div
                                    className={`flex items-center gap-2 px-2 py-1.5 ${i === resaltada ? 'bg-zinc-800' : ''} ${v.id === valor ? 'bg-amber-500/10' : ''}`}
                                    onMouseEnter={() => setResaltada(i)}
                                >
                                    <button
                                        type="button"
                                        onClick={() => elegir(v)}
                                        className="flex min-w-0 flex-1 items-baseline gap-1.5 text-left"
                                    >
                                        <span className={`truncate text-sm ${v.id === valor ? 'font-bold text-amber-300' : 'text-zinc-200'}`}>{v.label}</span>
                                        {v.lang !== 'multi' && <span className="shrink-0 text-[10px] text-zinc-500">{v.lang}</span>}
                                        <span className="shrink-0 text-[11px] text-zinc-400">{marca(v)}</span>
                                    </button>
                                    {onProbar && (
                                        <button
                                            type="button"
                                            onClick={() => onProbar(v.id)}
                                            title={`Escuchar ${v.label}`}
                                            aria-label={`Escuchar ${v.label}`}
                                            className="shrink-0 rounded-full px-2 py-0.5 text-xs text-zinc-500 transition hover:bg-zinc-700 hover:text-amber-300"
                                        >
                                            ▶
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
