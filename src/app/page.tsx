'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clapperboard } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        import('@/lib/auth').then(async ({ auth }) => {
            if (isLogin) {
                const result = await auth.login(email, password);
                if (result.success) {
                    // Force full reload to ensure auth state is picked up
                    window.location.href = '/creator';
                } else {
                    setError(result.error || 'Credenciales incorrectas o usuario no encontrado.');
                    setIsLoading(false);
                }
            } else {
                const result = await auth.register(email, password);
                if (result.success) {
                    window.location.href = '/creator';
                } else {
                    setError(result.error || 'Error al registrarse. El usuario podría ya existir.');
                    setIsLoading(false);
                }
            }
        });
    };

    // Auto-redirect if already logged in
    React.useEffect(() => {
        import('@/lib/auth').then(async ({ auth }) => {
            const user = await auth.getCurrentUser();
            if (user) {
                router.push('/creator');
            }
        });
    }, [router]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center py-6">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed top-0 left-0 w-full h-full object-cover opacity-40 z-0 pointer-events-none"
            >
                <source src="/login-video.mp4" type="video/mp4" />
                Tu navegador no soporta vídeos HTML5.
            </video>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center h-full justify-center">

                {/* 1. Header Section */}
                <div className="space-y-2 animate-in fade-in slide-in-from-top-10 duration-700 mb-6">
                    <div
                        className="cursor-pointer group relative inline-block"
                        onClick={() => router.push('/creator?guest=true')}
                        title="Entrar como invitado"
                    >
                        <Clapperboard className="w-14 h-14 md:w-16 md:h-16 mx-auto text-primary mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Entrar sin registro
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display tracking-wider text-white leading-none mb-2 drop-shadow-2xl">SCENE ME</h1>
                    <p className="text-xl md:text-3xl text-primary font-headline tracking-wide uppercase">THE ACTOR'S STORE CONCEPT</p>
                </div>

                {/* 2. Main Value Proposition */}
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 mb-6 text-center">
                    <h2 className="font-black text-white text-3xl md:text-5xl uppercase tracking-tighter leading-tight mb-2">
                        ¿Eres Actor / Actriz?
                    </h2>
                    <div className="flex flex-col items-center">
                        <p className="font-black text-white text-2xl md:text-3xl uppercase tracking-tighter leading-none">
                            ¿Necesitas Renovar
                        </p>
                        <p className="font-black text-white text-2xl md:text-3xl uppercase tracking-tighter leading-tight">
                            tu Mejor Material?
                        </p>
                        <span
                            className="christiangraphy text-red-500 text-4xl md:text-5xl leading-none block tracking-tighter"
                            style={{ transform: 'rotate(-2deg)', marginTop: '-0.1em' }}
                        >
                            urgentemente
                        </span>
                    </div>
                    <p className="mt-4 text-base md:text-lg font-bold leading-snug">
                        <span className="text-primary">de forma PLANEADA, o RÁPIDA, </span>
                        <span className="text-blue-400 font-black">EXPRESS</span>
                        <span className="text-primary"> — pero siempre profesional!</span>
                    </p>
                </div>

                {/* 3. Auth Section */}
                <div className="w-full max-w-sm mx-auto animate-in fade-in scale-in-95 duration-500 delay-300 mb-8 relative">
                    {/* Graffiti Overlay */}
                    <div className="absolute inset-x-0 -top-4 -bottom-4 flex flex-col items-center justify-center pointer-events-none z-20 opacity-60">
                        <span
                            className="christiangraphy text-red-600 text-4xl md:text-5xl block leading-tight filter drop-shadow-md"
                            style={{ transform: 'rotate(-4deg)' }}
                        >
                            LA APP para ACTORxS
                        </span>
                        <span
                            className="christiangraphy text-red-600 text-2xl md:text-3xl block leading-tight filter drop-shadow-md"
                            style={{ transform: 'rotate(-2deg)' }}
                        >
                            que NO quieren
                        </span>
                        <span
                            className="christiangraphy text-red-600 text-5xl md:text-6xl block leading-tight font-black filter drop-shadow-lg"
                            style={{ transform: 'rotate(-1deg)' }}
                        >
                            PERDER EL TIEMPO!
                        </span>
                    </div>

                    <div className="bg-black/60 backdrop-blur-xl rounded-xl shadow-2xl border border-primary/30 p-6 relative z-10">
                        <h2 className="text-xl font-bold text-white mb-4 text-center font-display tracking-wide">
                            {isLogin ? 'ACCESO ACTORES' : 'CREAR CUENTA'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 text-base px-3 focus:border-primary/50 transition-all text-center"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 text-base px-3 focus:border-primary/50 transition-all text-center"
                                    required
                                />
                            </div>

                            {error && <p className="text-destructive text-xs font-bold text-center bg-destructive/10 p-1 rounded">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-10 text-base font-bold tracking-wider bg-primary hover:bg-primary/90 text-black transition-all transform hover:scale-[1.02]"
                            >
                                {isLoading ? 'CARGANDO...' : (isLogin ? 'ENTRAR' : 'REGISTRARME')}
                            </Button>
                        </form>

                        <div className="mt-4 text-center pt-2 border-t border-white/10">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-white/70 hover:text-primary font-bold text-xs transition-colors uppercase tracking-widest"
                            >
                                {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                            </button>
                        </div>
                    </div>

                    {/* Talent Directory Link - INTEGRATED HERE */}
                    <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
                        <a
                            href="/talents"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 group"
                        >
                            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">★</span>
                            ¿Buscas actores? Explora el Directorio
                        </a>
                    </div>
                </div>

                {/* 4. Footer Placeholder */}
                <div className="h-4"></div>

            </div>

            {/* 5. Footer */}
            <footer className="w-full text-center py-6 text-xs text-white/40 mt-auto animate-in fade-in duration-1000 delay-700 relative z-10">
                <div className="flex justify-center gap-4 mb-2">
                    <a href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</a>
                    <span>•</span>
                    <a href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</a>
                </div>
                <p>© {new Date().getFullYear()} Scene Me. Todos los derechos reservados.</p>

                {/* PUBLIC ACCESS TO ANTIGRAVITY & EXQUISIT */}
                <div className="mt-4 flex flex-col items-center gap-2">
                    <a href="/exquisit" className="text-[#c9a961] font-bold hover:underline text-xs tracking-[0.2em] animate-pulse">
                        ⚗ ACCESO EXQUISIT: ALTA PERFUMERÍA
                    </a>
                    <a href="/hub" className="text-orange-500 font-bold hover:underline text-xs tracking-[0.3em] flex items-center gap-2 mt-1">
                        🎬 XPERIMENTAL: PRODUCTION HUB
                    </a>
                    <a href="/antigravity" className="text-purple-500 font-bold hover:underline text-[10px] tracking-widest opacity-60">
                        ✨ Character Alchemistery
                    </a>
                </div>
            </footer>

        </div>
    );
}
