"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Download, RefreshCw } from 'lucide-react';
import { calcularDatosCarta3D, type DatosCartaParams } from '@/lib/carta3d/datos-carta';

type Estado =
    | { fase: 'idle' }
    | { fase: 'generando'; segundos: number }
    | { fase: 'listo'; imageUrl: string }
    | { fase: 'error'; mensaje: string };

const POLL_MS = 5000;
const TIMEOUT_MS = 4 * 60 * 1000; // arranque frío del modelo: hasta ~2 min extra

interface Carta3DViewerProps extends DatosCartaParams {
    /** Nombre para el archivo descargado */
    title?: string;
}

export default function Carta3DViewer({ title = 'carta_3d', ...carta }: Carta3DViewerProps) {
    const [estado, setEstado] = useState<Estado>({ fase: 'idle' });
    const vivoRef = useRef(true);

    useEffect(() => {
        vivoRef.current = true;
        return () => { vivoRef.current = false; };
    }, []);

    const generar = async () => {
        const inicio = Date.now();
        setEstado({ fase: 'generando', segundos: 0 });
        const cronometro = setInterval(() => {
            if (vivoRef.current) {
                setEstado(prev => prev.fase === 'generando'
                    ? { fase: 'generando', segundos: Math.round((Date.now() - inicio) / 1000) }
                    : prev);
            }
        }, 1000);

        try {
            const datos = calcularDatosCarta3D(carta);
            const res = await fetch('/api/carta-3d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            let cuerpo = await res.json();

            // 202 = el modelo sigue calentando; seguimos preguntando por id
            while (cuerpo.status === 'processing' && cuerpo.predictionId) {
                if (!vivoRef.current) return;
                if (Date.now() - inicio > TIMEOUT_MS) {
                    throw new Error('El render tardó demasiado. Vuelve a intentarlo.');
                }
                await new Promise(r => setTimeout(r, POLL_MS));
                const poll = await fetch(`/api/carta-3d?id=${cuerpo.predictionId}`);
                cuerpo = await poll.json();
            }

            if (cuerpo.status !== 'ok' || !cuerpo.imageUrl) {
                throw new Error(cuerpo.error ?? 'No se pudo generar el render');
            }
            if (vivoRef.current) setEstado({ fase: 'listo', imageUrl: cuerpo.imageUrl });
        } catch (e: unknown) {
            const mensaje = e instanceof Error ? e.message : 'Error inesperado';
            if (vivoRef.current) setEstado({ fase: 'error', mensaje });
        } finally {
            clearInterval(cronometro);
        }
    };

    if (estado.fase === 'idle' || estado.fase === 'error') {
        return (
            <div className="w-full flex flex-col items-center gap-2 mt-4">
                <button
                    onClick={generar}
                    className="group flex items-center gap-3 px-8 py-3.5 bg-[#1a1a1a] text-white rounded-full shadow-xl hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                    <Sparkles size={16} className="text-[#D4AF37] group-hover:text-black transition-colors" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Ver en 3D · Astrolabio</span>
                </button>
                {estado.fase === 'error' && (
                    <p className="text-xs text-[#C55959] font-bold text-center max-w-xs" role="alert">
                        {estado.mensaje}
                    </p>
                )}
            </div>
        );
    }

    if (estado.fase === 'generando') {
        return (
            <div className="w-full flex flex-col items-center gap-3 mt-4 py-6" aria-live="polite">
                <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900">
                    Forjando el astrolabio… {estado.segundos}s
                </p>
                <p className="text-xs text-gray-500 text-center max-w-xs">
                    La IA está renderizando la carta en el espacio profundo.
                    Puede tardar 1–3 minutos la primera vez.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center gap-3 mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={estado.imageUrl}
                alt="Carta natal renderizada en 3D: astrolabio dorado en el espacio"
                width={1024}
                height={1024}
                className="w-full max-w-[440px] aspect-square rounded-2xl shadow-2xl border border-black/10"
            />
            <div className="flex items-center gap-2">
                <a
                    href={estado.imageUrl}
                    download={`${title.replace(/\s+/g, '_').toLowerCase()}_3d.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                    <Download size={14} /> Descargar
                </a>
                <button
                    onClick={generar}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-all"
                    title="Generar de nuevo (cada render es único)"
                >
                    <RefreshCw size={14} /> Regenerar
                </button>
            </div>
        </div>
    );
}
