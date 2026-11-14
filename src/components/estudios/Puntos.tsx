'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { conSesion, tokenSesion } from '@/lib/fotogramas-db';
import { PUNTOS, PREMIOS, DONDE_VALE, hacerResumen, type Resumen, type MotivoNoCanje } from '@/lib/puntos';

/*
 * «Tus puntos», en /los-estudios. El número lo calcula el servidor
 * (/api/puntos) con lo que hay de verdad en la Sala de visionado; aquí sólo se
 * pinta y se pide el canje. Ver lib/puntos.ts.
 */

export type Estado = 'cargando' | 'sin-sesion' | 'error' | 'listo';

const POR_QUE_NO: Record<MotivoNoCanje, string> = {
    premio: 'Ese premio ya no existe.',
    pendiente: 'Ya tienes un descuento pendiente de usar. Cuando lo gastes podrás pedir otro.',
    saldo: 'Todavía no te llegan los puntos para ese descuento.',
};

const ROTULO = 'text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/70';

export default function Puntos() {
    const [estado, setEstado] = useState<Estado>('cargando');
    const [r, setR] = useState<Resumen | null>(null);
    const [canjeando, setCanjeando] = useState<string | null>(null);
    const [aviso, setAviso] = useState('');
    const [provisional, setProvisional] = useState(false);

    const cargar = useCallback(async () => {
        try {
            // Hay que esperar a que Firebase recupere la sesión guardada.
            const { auth } = await import('@/lib/auth');
            const sesion = await auth.getSesion();
            if (!sesion || !(await tokenSesion())) { setEstado('sin-sesion'); return; }

            const res = await fetch('/api/puntos', await conSesion()).catch(() => null);
            if (res?.status === 401) { setEstado('sin-sesion'); return; }
            if (res?.ok) {
                setR(await res.json());
                setProvisional(false);
                setEstado('listo');
                return;
            }

            // El servidor no ha podido contar: se cuenta aquí, sólo para
            // enseñarlo. Los canjes quedan apagados hasta que él responda.
            const { actividadProvisional } = await import('@/lib/puntos-cliente');
            setR(hacerResumen(await actividadProvisional(sesion.uid), []));
            setProvisional(true);
            setEstado('listo');
        } catch {
            setEstado('error');
        }
    }, []);

    useEffect(() => {
        // La primera lectura va en el siguiente turno: así el efecto no cambia
        // el estado mientras React todavía está pintando.
        const t = setTimeout(cargar, 0);
        return () => clearTimeout(t);
    }, [cargar]);

    const canjear = async (premioId: string) => {
        setCanjeando(premioId);
        setAviso('');
        try {
            const res = await fetch('/api/puntos', await conSesion({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premio: premioId }),
            }));
            const datos = await res.json().catch(() => ({}));
            if (res.ok) setR(datos);
            else setAviso(POR_QUE_NO[datos?.error as MotivoNoCanje] ?? 'No se ha podido canjear. Inténtalo de nuevo en un momento.');
        } catch {
            setAviso('No se ha podido canjear. Inténtalo de nuevo en un momento.');
        } finally {
            setCanjeando(null);
        }
    };

    return (
        <PuntosVista
            estado={estado}
            r={r}
            provisional={provisional}
            canjeando={canjeando}
            aviso={aviso}
            onCanjear={canjear}
            onReintentar={() => { setEstado('cargando'); cargar(); }}
        />
    );
}

interface VistaProps {
    estado: Estado;
    r: Resumen | null;
    /** Recuento hecho en el navegador porque el servidor no respondía: se enseña, pero no se canjea. */
    provisional?: boolean;
    canjeando: string | null;
    aviso: string;
    onCanjear: (premioId: string) => void;
    onReintentar: () => void;
}

/** Sólo pinta: lo que enseña depende de lo que le pasen. */
export function PuntosVista({ estado, r, provisional = false, canjeando, aviso, onCanjear, onReintentar }: VistaProps) {
    return (
        <section id="puntos" aria-labelledby="puntos-titulo" className="mt-12 scroll-mt-6">
            <h2 id="puntos-titulo" className={ROTULO}>Tus puntos</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Entrenar en comunidad tiene premio: los puntos se canjean por descuentos para {DONDE_VALE}.
            </p>

            <div className="mt-4 overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-primary/[0.04]">
                <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr),minmax(0,1.2fr)] md:gap-8">
                    {/* Cuántos tiene y de dónde salen */}
                    <div>
                        {estado === 'cargando' && <p className="py-6 text-sm text-zinc-500">Contando tus puntos…</p>}

                        {estado === 'sin-sesion' && (
                            <div>
                                <p className="text-sm leading-relaxed text-zinc-400">Los puntos van con tu cuenta. Entra para ver los tuyos.</p>
                                <Link href="/login" className="mt-3 inline-block text-sm font-bold text-amber-300 underline-offset-4 hover:underline">
                                    Entrar con mi cuenta
                                </Link>
                            </div>
                        )}

                        {estado === 'error' && (
                            <div>
                                <p className="text-sm leading-relaxed text-zinc-400">No se han podido contar tus puntos ahora mismo. No has perdido nada: se calculan cada vez.</p>
                                <button type="button" onClick={onReintentar} className="mt-3 text-sm font-bold text-amber-300 underline-offset-4 hover:underline">
                                    Volver a intentarlo
                                </button>
                            </div>
                        )}

                        {estado === 'listo' && r && (
                            <>
                                <p className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black leading-none tracking-tighter text-primary tabular-nums">{r.saldo}</span>
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-white/70">{r.saldo === 1 ? 'punto' : 'puntos'}</span>
                                </p>

                                {r.siguiente ? (
                                    <div className="mt-4">
                                        <div
                                            role="progressbar"
                                            aria-valuemin={0}
                                            aria-valuemax={r.siguiente.puntos}
                                            aria-valuenow={r.saldo}
                                            aria-label={`Camino al ${r.siguiente.descuento} % de descuento`}
                                            className="h-2 overflow-hidden rounded-full bg-white/10"
                                        >
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((r.saldo / r.siguiente.puntos) * 100))}%` }} />
                                        </div>
                                        <p className="mt-2 text-xs text-zinc-400">
                                            Te faltan <strong className="font-black text-white">{r.faltan}</strong> para el{' '}
                                            <strong className="font-black text-primary">{r.siguiente.descuento} % de descuento</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-xs text-zinc-400">Te llegan para el descuento más alto.</p>
                                )}

                                <dl className="mt-5 space-y-1.5 text-sm">
                                    <Fila que="Días compartiendo toma" cuantos={r.actividad.diasConToma} puntos={r.actividad.diasConToma * PUNTOS.toma} />
                                    <Fila que="Bravos recibidos" cuantos={r.actividad.bravosRecibidos} puntos={r.actividad.bravosRecibidos * PUNTOS.bravo} />
                                    <Fila que="Tomas comentadas" cuantos={r.actividad.comentarios} puntos={r.actividad.comentarios * PUNTOS.comentario} />
                                    {r.gastados > 0 && (
                                        <div className="flex justify-between gap-3 border-t border-white/10 pt-1.5 text-zinc-400">
                                            <dt>Canjeados</dt>
                                            <dd className="font-bold tabular-nums">−{r.gastados}</dd>
                                        </div>
                                    )}
                                </dl>
                            </>
                        )}
                    </div>

                    {/* Cómo se ganan y qué premios hay */}
                    <div className="space-y-6">
                        <div>
                            <h3 className={ROTULO}>Cómo se ganan</h3>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                                <Regla puntos={PUNTOS.toma}>por cada día que compartes una toma en la Sala de visionado.</Regla>
                                <Regla puntos={PUNTOS.bravo}>por cada bravo que otro actor da a tus tomas.</Regla>
                                <Regla puntos={PUNTOS.comentario}>por comentar la toma de otro actor (una vez por toma).</Regla>
                            </ul>
                        </div>

                        <div>
                            <h3 className={ROTULO}>Tus premios</h3>
                            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                                {PREMIOS.map(p => {
                                    const alcanza = estado === 'listo' && !!r && r.saldo >= p.puntos;
                                    return (
                                        <li key={p.id} className={cn('flex flex-col rounded-2xl border p-3 text-center', alcanza ? 'border-primary/60 bg-primary/10' : 'border-white/10 bg-white/[0.03]')}>
                                            <span className="text-2xl font-black leading-none tracking-tighter text-primary">{p.descuento} %</span>
                                            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">de descuento</span>
                                            <span className="mt-2 text-xs text-zinc-400 tabular-nums">{p.puntos} puntos</span>
                                            {estado === 'listo' && !provisional && (
                                                <button
                                                    type="button"
                                                    disabled={!alcanza || canjeando !== null}
                                                    onClick={() => onCanjear(p.id)}
                                                    className={cn(
                                                        'mt-3 min-h-11 rounded-xl px-2 text-[11px] font-black uppercase tracking-[0.15em] transition-colors',
                                                        alcanza ? 'bg-primary text-black hover:bg-amber-300' : 'cursor-not-allowed bg-white/5 text-white/45',
                                                    )}
                                                >
                                                    {canjeando === p.id ? 'Canjeando…' : 'Canjear'}
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            {provisional ? (
                                <p className="mt-3 text-xs leading-relaxed text-amber-200/80">
                                    Los canjes se activan muy pronto. Mientras tanto tus puntos ya se están sumando: no se pierde nada.
                                </p>
                            ) : (
                                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                                    Al canjear recibes un código. Díselo a SCENE ME al reservar y el descuento se aplica al confirmar tu sesión. Un descuento por sesión.
                                </p>
                            )}
                            {aviso && <p role="alert" className="mt-3 text-sm font-bold text-amber-300">{aviso}</p>}
                        </div>
                    </div>
                </div>

                {estado === 'listo' && r && r.canjes.length > 0 && (
                    <div className="border-t border-primary/20 bg-black/30 p-5 sm:p-6">
                        <h3 className={ROTULO}>Tus descuentos</h3>
                        <ul className="mt-3 space-y-2">
                            {r.canjes.map(c => (
                                <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                    <span>
                                        <span className={cn('block font-mono text-lg font-black tracking-[0.15em]', c.estado === 'pendiente' ? 'text-primary' : 'text-white/45 line-through')}>
                                            {c.codigo}
                                        </span>
                                        <span className="block text-xs text-zinc-400">{c.descuento} % de descuento · {c.puntos} puntos</span>
                                    </span>
                                    <span className={cn('text-[10px] font-black uppercase tracking-[0.2em]', c.estado === 'pendiente' ? 'text-amber-300' : 'text-white/45')}>
                                        {c.estado === 'pendiente' ? 'Listo para usar' : c.estado === 'usado' ? 'Usado' : 'Anulado'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}

function Fila({ que, cuantos, puntos }: { que: string; cuantos: number; puntos: number }) {
    return (
        <div className="flex justify-between gap-3 text-zinc-300">
            <dt>{que} <span className="text-zinc-500 tabular-nums">× {cuantos}</span></dt>
            <dd className="font-bold tabular-nums text-white">+{puntos}</dd>
        </div>
    );
}

function Regla({ puntos, children }: { puntos: number; children: ReactNode }) {
    return (
        <li className="flex gap-3">
            <span className="w-12 shrink-0 text-right font-black tabular-nums text-primary">+{puntos}</span>
            <span className="leading-snug">{children}</span>
        </li>
    );
}
