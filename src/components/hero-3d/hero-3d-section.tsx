'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { conexionPobre } from '@/components/landing/lazy-video';
import type { Giro } from '@/components/hero-3d/escena-3d';

/*
 * HERO 3D DE SCENE ME (propuesta del 30/09/2026, a partir del «prompt
 * maestro» que trajo Christian). Tres capas:
 *   1. el objeto 3D (escena-3d.tsx) en el centro, que sigue al ratón o a la
 *      inclinación del móvil y gira hacia la tarjeta señalada;
 *   2. la capa de texto y tarjetas de cristal (backdrop-blur) por encima;
 *   3. el botón, que hace vibrar el móvil y mete la cámara en el objetivo
 *      antes de pasar a los Estudios (/login).
 *
 * El 3D se carga aparte (dynamic, sin SSR) para que la página no espere por
 * él: mientras llega, un fondo con el brillo dorado y un indicador de carga.
 * Sin WebGL, con ahorro de datos o conexión lenta, no se carga: se queda ese
 * fondo, que ya se ve bien. Con «reducir movimiento» el objeto no flota ni
 * gira solo.
 */

const Escena3D = dynamic(() => import('@/components/hero-3d/escena-3d').then((m) => m.Escena3D), {
    ssr: false,
    loading: () => null,
});

const ORO = '#D4AF37';

const TARJETAS = [
    { icono: '📸', texto: 'Book Fotográfico Profesional', sitio: 'lg:left-[6%] lg:top-[46%]' },
    { icono: '🎬', texto: 'Escenas 4K a Medida', sitio: 'lg:right-[6%] lg:top-[46%]' },
    { icono: '🎙️', texto: 'Ensayo de Réplicas con IA', sitio: 'lg:bottom-[15%] lg:left-1/2 lg:-translate-x-1/2' },
];

/** ¿Hay WebGL en este navegador? */
function hayWebGL(): boolean {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
        return false;
    }
}

export function Hero3DSection() {
    const router = useRouter();
    const quieto = !!useReducedMotion();
    const seccion = useRef<HTMLElement | null>(null);
    const giro = useRef<Giro>({ activo: false, x: 0, y: 0 });

    const [con3D, setCon3D] = useState(false);
    const [calidad, setCalidad] = useState<'alta' | 'baja'>('alta');
    const [listo, setListo] = useState(false);
    const [foco, setFoco] = useState<number | null>(null);
    const [entrando, setEntrando] = useState(false);

    // ¿Se carga el 3D? Y con qué calidad (el cristal con refracción es lo caro).
    useEffect(() => {
        if (conexionPobre() || !hayWebGL()) return;
        const movil = window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
        queueMicrotask(() => {
            setCalidad(movil ? 'baja' : 'alta');
            setCon3D(true);
        });
    }, []);

    // El giroscopio: en Android funciona sin más; en iPhone hay que pedir
    // permiso, y sólo se puede pedir dentro de un toque.
    useEffect(() => {
        if (!con3D || quieto) return;
        const alInclinar = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return;
            const limitar = (v: number) => Math.max(-1, Math.min(1, v));
            giro.current = { activo: true, x: limitar(e.gamma / 30), y: limitar((45 - e.beta) / 30) };
        };
        const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
        const pedirPermiso = () => {
            DOE?.requestPermission?.()
                .then((r) => { if (r === 'granted') window.addEventListener('deviceorientation', alInclinar); })
                .catch(() => {});
        };
        if (DOE?.requestPermission) {
            window.addEventListener('touchend', pedirPermiso, { once: true });
        } else if (window.matchMedia('(pointer: coarse)').matches) {
            window.addEventListener('deviceorientation', alInclinar);
        }
        return () => {
            window.removeEventListener('touchend', pedirPermiso);
            window.removeEventListener('deviceorientation', alInclinar);
        };
    }, [con3D, quieto]);

    const entrar = () => {
        if (entrando) return;
        try { navigator.vibrate?.(12); } catch { /* iPhone no vibra desde la web */ }
        if (quieto || !con3D) {
            router.push('/login');
            return;
        }
        setEntrando(true);
        // Por si la escena no avisa (pestaña en segundo plano): nunca se queda colgado.
        window.setTimeout(() => router.push('/login'), 1800);
    };

    return (
        <section
            ref={seccion}
            aria-label="SCENE ME: tu book, tu escena y tu casting"
            className="relative isolate min-h-[100svh] overflow-hidden bg-[#111111] text-white"
        >
            {/* Fondo mientras llega el 3D (y el que se queda si no llega). */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    background: `radial-gradient(ellipse 45% 40% at 50% 52%, rgba(212,175,55,0.22), rgba(212,175,55,0.05) 55%, transparent 75%), #111111`,
                }}
            />
            {con3D && !listo && (
                <div aria-hidden="true" className="absolute inset-0 -z-10 grid place-items-center">
                    <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37]/25 border-t-[#D4AF37]" />
                </div>
            )}

            {con3D && (
                <div className={`absolute inset-0 -z-10 transition-opacity duration-700 ${listo ? 'opacity-100' : 'opacity-0'}`}>
                    <Escena3D
                        foco={foco}
                        entrando={entrando}
                        onEntrado={() => router.push('/login')}
                        onListo={() => setListo(true)}
                        quieto={quieto}
                        calidad={calidad}
                        giro={giro}
                        fuenteEventos={seccion}
                    />
                </div>
            )}

            {/* ---------- La capa de interfaz ---------- */}
            <motion.div
                animate={{ opacity: entrando ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className="relative flex min-h-[100svh] flex-col items-center justify-between gap-8 px-6 pb-10 pt-16 text-center sm:px-10 lg:pb-14 lg:pt-20"
            >
                <div className="flex max-w-6xl flex-col items-center gap-4">
                    <h1
                        className="text-balance text-[clamp(1.875rem,4.4vw,4.25rem)] leading-[0.98] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]"
                        style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontVariationSettings: "'wdth' 100, 'wght' 850", letterSpacing: '-0.02em' }}
                    >
                        Tu book. Tu escena. Tu casting. Todo en tu mano.
                    </h1>
                    <p className="max-w-[46ch] text-balance text-[1rem] leading-relaxed text-[#D8D8D8] [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] lg:text-[1.1875rem]">
                        La forma más rápida y profesional de obtener tu material audiovisual de alto nivel.
                    </p>
                </div>

                {/* Hueco para el objeto 3D. */}
                <div className="min-h-[34svh] flex-1" aria-hidden="true" />

                <div className="flex w-full flex-col items-center gap-6">
                    <ul className="flex flex-wrap justify-center gap-2 lg:contents">
                        {TARJETAS.map((t, i) => (
                            <motion.li
                                key={t.texto}
                                onHoverStart={() => setFoco(i)}
                                onHoverEnd={() => setFoco((f) => (f === i ? null : f))}
                                whileHover={quieto ? undefined : { y: -6 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className={`group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-left text-[0.8125rem] font-semibold lg:gap-3 lg:px-5 lg:py-3.5 lg:text-[0.9375rem] text-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_14px_44px_-10px_rgba(212,175,55,0.45)] lg:absolute ${t.sitio}`}
                            >
                                <span aria-hidden="true" className="text-[1.0625rem] lg:text-[1.25rem]">{t.icono}</span>
                                {t.texto}
                            </motion.li>
                        ))}
                    </ul>

                    <motion.button
                        type="button"
                        onClick={entrar}
                        whileHover={quieto ? undefined : { scale: 1.03, boxShadow: '0 0 44px rgba(212,175,55,0.55)' }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="rounded-full px-9 py-4 text-[0.9375rem] font-black uppercase tracking-[0.14em] text-[#0a0a0a] shadow-[0_0_24px_rgba(212,175,55,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
                        style={{ backgroundImage: `linear-gradient(100deg, ${ORO}, #E8A33D)` }}
                    >
                        Explorar el estudio
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
}
