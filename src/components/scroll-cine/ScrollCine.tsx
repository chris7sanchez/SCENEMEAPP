'use client';

// EL SCROLL CINEMATOGRÁFICO.
//
// El vídeo de la cabecera (una tira de película que se desenrolla y forma el
// logo) deja de reproducirse solo: lo gobierna el scroll. Como el MP4 sólo tiene
// un fotograma clave, mover su currentTime iría a saltos; por eso el vídeo está
// troceado en 121 imágenes (public/scroll/frames, y una versión de 720 px en
// frames-s para móvil) que se pintan en un canvas según el progreso.
//
// El recorrido (p = progreso 0..1 dentro de la sección alta):
//   0 – .30  la tira se desenrolla y se forma el logo; entran las dos frases
//   .30 – .46 el logo se asienta con un leve acercamiento; entra el titular
//   .46 – .92 la escena se oscurece y suben las fotos reales, en 3D, por delante
//   .92 – 1   el cierre, con los dos botones
//
// Con «reducir movimiento» no hay sección alta ni scrub: se ve el último
// fotograma y todo el contenido seguido, en una pantalla normal.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './scroll-cine.css';

import { N, rampa, ventana, frameDe, tc, progreso } from './recorrido';

const FW = 1280;
const FH = 720;
const url = (i: number, ligero: boolean) =>
    `/scroll/${ligero ? 'frames-s' : 'frames'}/f${String(i + 1).padStart(3, '0')}.webp`;

interface Foto { src: string; alt: string; apaisada?: boolean }
const B = (n: string, alt = 'Retrato de book actoral realizado en SCENE ME'): Foto => ({ src: `/trabajos/web/${n}.webp`, alt });
const V = (n: string, alt: string): Foto => ({ src: `/videos/${n}-loop-poster.jpg`, alt, apaisada: true });
const COLUMNAS: Foto[][] = [
    [B('1'), V('SHOGUN', 'Escena SHOGUN rodada en SCENE ME'), B('3'), B('4')],
    [V('AMANDA', 'Escena AMANDA rodada en SCENE ME'), B('5'), B('6'), V('MUDANZA', 'Escena MUDANZA rodada en SCENE ME')],
    [B('7'), V('OLIVER', 'Escena OLIVER rodada en SCENE ME'), B('8'), B('9')],
];
const VELOCIDAD = [1.0, 1.32, 1.12];

const TOMAS = [
    { codigo: 'Toma 01 · El book', texto: 'Fotografía pensada para una dirección de casting, no para un perfil. Sales tú, y sale el personaje que de verdad puedes defender.', a: 0.50, b: 0.56, c: 0.62, d: 0.67 },
    { codigo: 'Toma 02 · La escena', texto: 'Hecha entera a tu medida: guion, tono y horario. Y cuando un director quiere verte hoy, la rodamos en cuarenta y ocho horas.', a: 0.64, b: 0.69, c: 0.75, d: 0.80 },
    { codigo: 'Toma 03 · El self‑tape', texto: 'El que gana el papel: con dirección de casting delante. En packs de cinco y de diez, al mejor precio que vas a encontrar.', a: 0.77, b: 0.82, c: 0.88, d: 0.92 },
];

export default function ScrollCine() {
    const seccion = useRef<HTMLElement>(null);
    const escenario = useRef<HTMLDivElement>(null);
    const lienzo = useRef<HTMLCanvasElement>(null);
    const [quieto, setQuieto] = useState(false);
    const [cargados, setCargados] = useState(0);

    const imgs = useRef<(HTMLImageElement | null)[]>([]);
    const objetivo = useRef(0);
    const mostrado = useRef(0);
    const ultimoFrame = useRef(-1);
    const ligero = useRef(false);

    // --- preferencias: sin movimiento / móvil ---
    useEffect(() => {
        setQuieto(matchMedia('(prefers-reduced-motion: reduce)').matches);
        ligero.current = innerWidth < 900;
    }, []);

    // --- carga de fotogramas: primero una malla gruesa, luego se rellena ---
    useEffect(() => {
        if (quieto) return;
        let vivo = true;
        const orden: number[] = [];
        const visto = new Set<number>();
        for (const paso of [20, 10, 5, 2, 1]) {
            for (let i = 0; i < N; i += paso) if (!visto.has(i)) { visto.add(i); orden.push(i); }
        }
        if (!visto.has(N - 1)) orden.push(N - 1);
        let n = 0;
        const cargar = (i: number) => new Promise<void>(res => {
            const im = new Image();
            im.decoding = 'async';
            im.onload = () => { if (vivo) { imgs.current[i] = im; ultimoFrame.current = -1; setCargados(++n); } res(); };
            im.onerror = () => res();
            im.src = url(i, ligero.current);
        });
        (async () => {
            // de 6 en 6 en paralelo: no satura la red y la malla gruesa llega antes
            for (let k = 0; k < orden.length && vivo; k += 6) await Promise.all(orden.slice(k, k + 6).map(cargar));
        })();
        return () => { vivo = false; };
    }, [quieto]);

    // --- dibujo ---
    const dibujar = useCallback((frame: number) => {
        const c = lienzo.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        const i = Math.round(frame);
        let im: HTMLImageElement | null = null;
        for (let d = 0; d < N && !im; d++) im = imgs.current[i - d] ?? imgs.current[i + d] ?? null;
        if (!im) return;
        const W = c.width, H = c.height;
        const vertical = H > W;
        // apaisado: cubre la pantalla. Vertical: el logo mide el 58 % del ancho del
        // fotograma, así que se amplía hasta que ocupe el ancho, centrado en él.
        const esc = vertical ? (W * 1.55) / FW : Math.max(W / FW, H / FH);
        const dw = FW * esc, dh = FH * esc;
        const top = (H - dh) / 2 - (vertical ? H * 0.06 : 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, W, H);   // el fondo del escenario es el mismo #0E0A04
        ctx.drawImage(im, W / 2 - dw / 2, top, dw, dh);
        if (vertical) {
            // en vertical el fotograma es una franja: se funden sus bordes de arriba y de abajo
            const g = ctx.createLinearGradient(0, top, 0, top + dh);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(0.22, 'rgba(0,0,0,1)');
            g.addColorStop(0.78, 'rgba(0,0,0,1)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'source-over';
        }
    }, []);

    // --- bucle: lee el scroll, suaviza y aplica el recorrido ---
    useEffect(() => {
        const sec = seccion.current, esc = escenario.current, c = lienzo.current;
        if (!sec || !esc || !c) return;

        const ajustar = () => {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            c.width = Math.round(esc.clientWidth * dpr);
            c.height = Math.round(esc.clientHeight * dpr);
            ultimoFrame.current = -1;
        };
        ajustar();
        addEventListener('resize', ajustar);

        if (quieto) {
            // sin scrub: último fotograma, quieto
            const im = new Image();
            im.onload = () => { imgs.current[N - 1] = im; dibujar(N - 1); };
            im.src = url(N - 1, innerWidth < 900);
            return () => removeEventListener('resize', ajustar);
        }

        const leer = () => {
            const r = sec.getBoundingClientRect();
            objetivo.current = progreso(r.top, r.height, innerHeight);
        };
        leer();
        addEventListener('scroll', leer, { passive: true });

        let raf = 0;
        const el = (sel: string) => esc.querySelector<HTMLElement>(sel);
        const f1 = el('[data-f="def1"]'), f2 = el('[data-f="def2"]'), tit = el('[data-f="titulo"]'),
              osc = el('[data-f="oscuro"]'), fotos = el('[data-f="fotos"]'), cierre = el('[data-f="cierre"]'),
              railI = el('[data-f="railI"]'), railD = el('[data-f="railD"]'), reloj = el('[data-f="reloj"]'), pista = el('[data-f="pista"]');
        const cols = Array.from(esc.querySelectorAll<HTMLElement>('[data-col]'));
        const tomas = Array.from(esc.querySelectorAll<HTMLElement>('[data-toma]'));

        const aplicar = (p: number, frame: number) => {
            const zoom = 1 + 0.07 * rampa(p, 0.30, 0.46);
            c.style.transform = `scale(${zoom})`;
            if (f1) { const o = ventana(p, 0.03, 0.09, 0.15, 0.20); f1.style.opacity = String(o); f1.style.transform = `translateY(${(1 - o) * 14}px)`; }
            if (f2) { const o = ventana(p, 0.17, 0.23, 0.29, 0.34); f2.style.opacity = String(o); f2.style.transform = `translateY(${(1 - o) * 14}px)`; }
            if (tit) { const o = ventana(p, 0.33, 0.40, 0.46, 0.52); tit.style.opacity = String(o); tit.style.transform = `translateY(${(1 - o) * 18}px)`; }
            if (osc) osc.style.opacity = String(0.80 * rampa(p, 0.44, 0.56));
            if (fotos) {
                const q = rampa(p, 0.44, 0.94);
                fotos.style.opacity = String(rampa(p, 0.44, 0.50) * (1 - rampa(p, 0.93, 0.97)));
                cols.forEach((col, k) => {
                    const alto = col.offsetHeight;
                    const y = innerHeight * 1.05 - q * (alto + innerHeight * 1.15) * VELOCIDAD[k] * 0.78;
                    col.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
                });
            }
            tomas.forEach((t, k) => { const d = TOMAS[k]; const o = ventana(p, d.a, d.b, d.c, d.d); t.style.opacity = String(o); t.style.transform = `translateY(${(1 - o) * 16}px)`; });
            if (cierre) { const o = rampa(p, 0.93, 0.99); cierre.style.opacity = String(o); cierre.style.pointerEvents = o > 0.5 ? 'auto' : 'none'; cierre.style.transform = `translateY(${(1 - o) * 24}px)`; }
            const py = `${(-p * 2600).toFixed(0)}px`;
            if (railI) railI.style.backgroundPositionY = py;
            if (railD) railD.style.backgroundPositionY = py;
            if (reloj) reloj.textContent = tc(frame);
            if (pista) pista.style.opacity = String(1 - rampa(p, 0.01, 0.05));
        };

        const bucle = () => {
            mostrado.current += (objetivo.current - mostrado.current) * 0.14;
            if (Math.abs(objetivo.current - mostrado.current) < 0.0004) mostrado.current = objetivo.current;
            const p = mostrado.current;
            const frame = frameDe(p);
            const fi = Math.round(frame);
            if (fi !== ultimoFrame.current) { ultimoFrame.current = fi; dibujar(frame); }
            aplicar(p, frame);
            raf = requestAnimationFrame(bucle);
        };
        raf = requestAnimationFrame(bucle);
        return () => { cancelAnimationFrame(raf); removeEventListener('scroll', leer); removeEventListener('resize', ajustar); };
    }, [quieto, dibujar]);

    const listo = cargados > 0 || quieto;

    return (
        <section ref={seccion} className={`sc-seccion${quieto ? ' sc-quieto' : ''}`} aria-label="SCENE ME Studios: de actor a estrella en 3 pasos">
            <div ref={escenario} className="sc-escenario">
                <canvas ref={lienzo} className={`sc-lienzo${listo ? ' sc-listo' : ''}`} aria-hidden="true" />
                <div className="sc-velo" aria-hidden="true" />
                <div data-f="oscuro" className="sc-oscuro" aria-hidden="true" />
                <div data-f="railI" className="sc-perfo sc-perfo-izq" aria-hidden="true" />
                <div data-f="railD" className="sc-perfo sc-perfo-der" aria-hidden="true" />

                {/* Las dos frases de la definición */}
                <p data-f="def1" className="sc-texto sc-def sc-def1">Un actor interpreta historias a través de un personaje.</p>
                <p data-f="def2" className="sc-texto sc-def sc-def2">Una estrella inspira y transforma a otros, a través de un personaje.</p>

                {/* Titular */}
                <div data-f="titulo" className="sc-texto sc-titulo">
                    <h2><span className="sc-oro">De actor a estrella</span><br /><em>en 3 pasos</em></h2>
                    <p>Tu book, tu escena y tu self‑tape</p>
                </div>

                {/* Las fotos, en tres columnas que suben en 3D */}
                <div data-f="fotos" className="sc-fotos" aria-hidden="true">
                    <div className="sc-fotos-3d">
                        {COLUMNAS.map((col, k) => (
                            <div key={k} data-col={k} className={`sc-col sc-col-${k}`}>
                                {col.map((f, j) => (
                                    <figure key={j} className={f.apaisada ? 'sc-ap' : ''}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={f.src} alt={f.alt} loading="eager" decoding="async" fetchPriority="low" />
                                    </figure>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Los rótulos de las tomas */}
                <div className="sc-tomas">
                    {TOMAS.map((t, k) => (
                        <div key={k} data-toma={k} className="sc-texto sc-toma">
                            <span className="sc-codigo">{t.codigo}</span>
                            <p>{t.texto}</p>
                        </div>
                    ))}
                </div>

                {/* Cierre */}
                <div data-f="cierre" className="sc-cierre">
                    <h2>Empieza a creer en ti,<br /><span className="sc-oro">accede a Scene Me</span></h2>
                    <div className="sc-botones">
                        <Link href="/login" className="sc-boton sc-primario">Entrar gratis a los Estudios</Link>
                        <Link href="/booking" className="sc-boton sc-secundario">Reservar sesión</Link>
                    </div>
                </div>

                <div data-f="reloj" className="sc-reloj" aria-hidden="true">00:00:00:00</div>
                <div data-f="pista" className="sc-pista" aria-hidden="true"><span /></div>
            </div>
        </section>
    );
}
