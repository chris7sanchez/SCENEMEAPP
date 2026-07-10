'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, Clapperboard, Users, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
    { id: 'home', label: 'Inicio', icon: Home, path: '/creator' },
    { id: 'services', label: 'Servicios', icon: Clapperboard, path: '/creator?tab=services' },
    { id: 'workshop', label: 'Actorlogía', icon: Sparkles, path: '/actorlogia' },
    { id: 'talents', label: 'Talentos', icon: Users, path: '/talents' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/creator?tab=profile' },
] as const;

// Rutas donde NO mostrar la barra
const HIDDEN_ROUTES = ['/admin', '/exquisit', '/hub', '/login', '/astro-lab', '/astrologia', '/alquimia', '/xalvaje'];

function TabBarInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Ocultar en login, admin, y rutas internas especiales
    if (pathname === '/' || HIDDEN_ROUTES.some(r => pathname.startsWith(r))) {
        return null;
    }

    // La pestaña activa se decide por ruta + query: antes Servicios y Perfil
    // nunca se iluminaban (todo /creator contaba como "Inicio").
    const getActiveTab = () => {
        if (pathname === '/talents') return 'talents';
        if (pathname.startsWith('/actorlogia')) return 'workshop';
        if (pathname.startsWith('/creator')) {
            const tab = searchParams.get('tab');
            if (tab === 'profile') return 'profile';
            if (tab === 'services') return 'services';
            return 'home';
        }
        return 'home';
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
