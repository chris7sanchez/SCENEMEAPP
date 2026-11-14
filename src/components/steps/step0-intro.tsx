import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { type FormData } from "@/lib/types";
import { LetrasSceneMe } from '@/components/marca/letras-scene-me';

/*
 * 14/11/2026 (Christian): la pantalla de Servicios pasa a ser como una app de
 * móvil normal: muy visual y casi sin texto. «Tu éxito en 3 pasos» y tres
 * tarjetas con foto a sangre (Book, Escena, Selftape), cada una con su número
 * y su nombre, y debajo una tira para entrenar gratis en los Estudios.
 *
 * Fuera de esta pantalla: los eslóganes y botones sueltos de las tarjetas, la
 * galería «Ver trabajos» y el bloque PACKTOR PRO. Las fotos están en
 * public/portada/ y son material propio de SCENE ME.
 *
 * Las dos tipografías (Archivo y Instrument Serif cursiva) ya las carga el
 * layout.
 */

const ARCHIVO = { fontFamily: "'Archivo', system-ui, sans-serif" } as const;
const SERIF = { fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' } as const;

// Velo oscuro bajo el texto: PRODUCT.md exige que todo texto sobre foto lleve
// una capa de contraste detrás.
const VELO = 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.35) 42%, rgba(0,0,0,0) 68%)';

interface Step0IntroProps {
    setStep: (step: number) => void;
    setFlowType?: (type: 'scene' | 'photo') => void;
    updateForm?: (data: Partial<FormData>) => void;
}

interface TarjetaProps {
    n: number;
    titulo: string;
    frase: string;
    foto: string;
    // Qué parte de la foto se queda dentro del recorte (object-position).
    posicion: string;
    // Altura relativa respecto a las otras tarjetas.
    peso: number;
    prioridad?: boolean;
    onClick: () => void;
}

function Tarjeta({ n, titulo, frase, foto, posicion, peso, prioridad, onClick }: TarjetaProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="relative block min-h-24 w-full overflow-hidden rounded-[20px] bg-[#151517] text-left transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4B625]"
            style={{ flex: `${peso} 1 0px` }}
        >
            <Image
                src={foto}
                alt=""
                fill
                sizes="(min-width: 768px) 448px, 100vw"
                priority={prioridad}
                className="object-cover"
                style={{ objectPosition: posicion }}
            />
            <span aria-hidden="true" className="absolute inset-0" style={{ background: VELO }} />
            <span className="absolute bottom-3 left-4 right-[68px] flex flex-col items-start gap-[5px]">
                <span className="flex items-baseline gap-2.5">
                    <span className="text-[40px] leading-[.8] text-[#F4B625]" style={SERIF}>{n}</span>
                    <span className="whitespace-nowrap text-[25px] font-extrabold uppercase leading-none tracking-[-0.02em] text-white" style={ARCHIVO}>{titulo}</span>
                </span>
                <span className="text-[13px] font-medium leading-[1.3] text-white/90">{frase}</span>
            </span>
            <span aria-hidden="true" className="absolute bottom-3 right-3.5 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-white/70 text-white">
                <ChevronRight className="h-5 w-5" />
            </span>
        </button>
    );
}

export default function Step0Intro({ setStep, setFlowType, updateForm }: Step0IntroProps) {
    const router = useRouter();

    // Splash Screen Logic
    const [showSplash, setShowSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('hasSeenSplash');
        if (hasSeen) {
            setShowSplash(false);
            setSplashFading(true);
            return;
        }

        const timer1 = setTimeout(() => {
            setSplashFading(true);
        }, 800);

        const timer2 = setTimeout(() => {
            setShowSplash(false);
            sessionStorage.setItem('hasSeenSplash', 'true');
        }, 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const irA = (flujo: 'photo' | 'scene') => {
        if (setFlowType) setFlowType(flujo);
        if (updateForm) updateForm({ serviceType: flujo });
        setStep(1);
    };

    return (
        <div id="servicios" className="w-full flex flex-col bg-transparent scroll-mt-20">
            <InstallPrompt />

            {/* SPLASH SCREEN */}
            {showSplash && (
                <div className={`fixed inset-0 z-[99999] bg-[hsl(var(--sm-bg-base))] flex items-center justify-center transition-opacity duration-500 ${splashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-700 fade-in-0">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-2xl relative">
                            <Image
                                src="/android-chrome-512x512.png"
                                alt="Scene Me Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <h1 className="animate-pulse"><LetrasSceneMe className="h-7 w-auto" /></h1>
                    </div>
                </div>
            )}

            {/* La altura reparte lo que queda entre la cabecera y la barra inferior
                (en móvil, 4 rem de cabecera y 4 rem de barra; en escritorio, 5 rem y 7 rem):
                las cuatro piezas caben sin scroll y se reparten en proporción
                1 : 1,15 : 1 : 0,85. */}
            <div className="mx-auto flex min-h-[calc(100dvh-8rem-env(safe-area-inset-bottom,0px))] w-full max-w-md flex-col px-4 pb-2 md:min-h-[calc(100dvh-12rem)]" style={ARCHIVO}>
                <h2
                    className="shrink-0 whitespace-nowrap py-3 text-center text-[30px] font-extrabold uppercase leading-none tracking-[-0.02em] text-white"
                    style={ARCHIVO}
                >
                    Tu éxito{' '}
                    <span className="text-[36px] font-normal normal-case tracking-normal text-[#F4B625]" style={SERIF}>en 3 pasos</span>
                </h2>

                <div className="flex min-h-0 flex-1 flex-col gap-2.5">
                    <Tarjeta
                        n={1}
                        titulo="Tu book"
                        frase="Fotos hechas en nuestro estudio de Madrid."
                        foto="/portada/book.webp"
                        posicion="center 30%"
                        peso={1}
                        prioridad
                        onClick={() => irA('photo')}
                    />
                    <Tarjeta
                        n={2}
                        titulo="Tu escena"
                        frase="Una escena a tu medida, dirigida y grabada."
                        foto="/portada/escena-bano.webp"
                        posicion="55% 40%"
                        peso={1.15}
                        prioridad
                        onClick={() => irA('scene')}
                    />
                    <Tarjeta
                        n={3}
                        titulo="Tu selftape"
                        frase="Lista para enviar al casting."
                        foto="/portada/selftape-beige.webp"
                        posicion="center 100%"
                        peso={1}
                        onClick={() => router.push('/booking?service=selftape')}
                    />

                    {/* El envoltorio no lleva relleno: un elemento con relleno pesa más que
                        uno sin él al repartir la altura y rompería la proporción. */}
                    <div className="flex" style={{ flex: '0.85 1 0px', minHeight: '7.25rem' }}>
                        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] border border-[#F4B625]/65 bg-[#111113] px-3.5 py-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-base font-extrabold uppercase leading-[1.1] tracking-[-0.01em] text-white" style={ARCHIVO}>Entrena gratis cada día</p>
                                <p className="mt-1 text-[13px] leading-[1.3] text-zinc-300">Una escena nueva hoy y una réplica que te contesta.</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-center gap-2">
                                <Link
                                    href="/studio"
                                    className="flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F4B625] px-3.5 text-[13px] font-extrabold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Entrar a ensayar <ArrowRight className="h-4 w-4" />
                                </Link>
                                <span className="rounded-full border border-white/35 px-2 py-[3px] text-[9.5px] font-bold uppercase leading-[1.2] tracking-[0.1em] text-zinc-300">Escena creada con IA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
