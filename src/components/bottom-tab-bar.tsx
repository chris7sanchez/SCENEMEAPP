'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Clapperboard, Film, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// 10/11/2026 (Christian): tres pestañas. Lo primero al entrar es comprar el
// material (Servicios: Book, Scene Me y Self-tape). Todo lo de entrenar va
// detrás de Studios: las salas, Fotogramas y el tablón (lo que antes eran las
// pestañas Fotogramas y Talentos). «Inicio» y «Servicios» abrían la misma
// pantalla, así que queda una sola.
const TABS = [
    { id: 'services', label: 'Servicios', icon: Clapperboard, path: '/creator' },
    { id: 'studios', label: 'Studios', icon: Film, path: '/los-estudios' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/creator?tab=profile' },
] as const;

// Rutas donde NO mostrar la barra
const HIDDEN_ROUTES = ['/actorlogia', '/admin', '/exquisit', '/hub', '/login', '/astro-lab', '/astrologia', '/alquimia', '/xalvaje', '/hero-3d', '/propuesta', '/scroll'];

// Todo lo que cuelga de la pestaña Studios.
const RUTAS_STUDIOS = ['/los-estudios', '/estudios', '/studio', '/comunidad', '/fotogramas', '/talents'];

function TabBarInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Ocultar en login, admin, y rutas internas especiales
    if (pathname === '/' || HIDDEN_ROUTES.some(r => pathname.startsWith(r))) {
        return null;
    }

    // La pestaña activa se decide por ruta + query.
    const getActiveTab = () => {
        if (RUTAS_STUDIOS.some(r => pathname === r || pathname.startsWith(r + '/'))) return 'studios';
        if (pathname.startsWith('/creator') && searchParams.get('tab') === 'profile') return 'profile';
        return 'services';
    };

    const activeTab = getActiveTab();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {TABS.map(({ id, label, icon: Icon, path }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => router.push(path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 active:scale-90",
                                isActive ? "text-primary" : "text-zinc-400"
                            )}
                        >
                            <div className={cn(
                                "relative p-1.5 rounded-xl transition-all duration-300",
                                isActive && "bg-primary/10"
                            )}>
                                <Icon className={cn(
                                    "w-5 h-5 transition-all",
                                    isActive && "stroke-[2.5]"
                                )} />
                                {isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-wide transition-all",
                                isActive ? "opacity-100" : "opacity-90"
                            )}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

// useSearchParams exige un límite de Suspense al prerenderizar: lo llevamos
// dentro del propio componente para no tocar el layout.
export function BottomTabBar() {
    return (
        <Suspense fallback={null}>
            <TabBarInner />
        </Suspense>
    );
}
