'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clapperboard, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            {/* Fondo cinemático CSS */}
            <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center h-full justify-center">

                {/* Header Section */}
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

                {/* Value Proposition — SIN fuente manuscrita */}
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
                        <span className="text-red-500 text-3xl md:text-4xl leading-none block tracking-tight font-black uppercase mt-1">
                            ¡URGENTEMENTE!
                        </span>
                    </div>
                    <p className="mt-4 text-base md:text-lg font-bold leading-snug">
                        <span className="text-primary">de forma PLANEADA, o RÁPIDA, </span>
                        <span className="text-blue-400 font-black">EXPRESS</span>
                        <span className="text-primary"> — pero siempre profesional!</span>
                    </p>
                </div>

                {/* Auth Section — SIN graffiti overlay */}
                <div className="w-full max-w-sm mx-auto animate-in fade-in scale-in-95 duration-500 delay-300 mb-8 relative">
                    <div className="bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/30 p-6 relative z-10">
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
                                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 h-12 text-base px-5 focus:border-primary/50 transition-all rounded-xl focus:bg-white/20"
                                    required
                                />
                            </div>
                            <div className="space-y-1 relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 h-12 text-base px-5 pr-12 focus:border-primary/50 transition-all rounded-xl focus:bg-white/20"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {error && <p className="text-destructive text-xs font-bold text-center bg-destructive/10 p-2 rounded-lg">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 text-base font-black tracking-widest bg-primary hover:bg-primary/90 text-black transition-all transform active:scale-95 rounded-xl shadow-lg shadow-primary/20 uppercase"
                            >
                                {isLoading ? 'CARGANDO...' : (isLogin ? 'ENTRAR' : 'REGISTRARME')}
                            </Button>
                        </form>

                        {/* SSO Section */}
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-white/40"><span className="bg-black/40 px-2 backdrop-blur-sm">O continuar con</span></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl flex items-center gap-2"
                                    onClick={() => {}} // SSO Logic
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.12-1.92 4.12-1.2 1.2-3.08 2.48-6.12 2.48-4.92 0-8.96-4-8.96-8.92 0-4.92 4.04-8.92 8.96-8.92 2.68 0 4.6 1.04 6.04 2.44l2.32-2.32C18.64 1.16 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48S5.6 24.96 12.48 24.96c3.68 0 6.48-1.2 8.68-3.48 2.24-2.24 2.96-5.4 2.96-8.08 0-.68-.04-1.32-.12-1.92h-11.52z"/></svg>
                                    Google
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl flex items-center gap-2"
                                    onClick={() => {}} // SSO Logic
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.22 1.78-3.53 1.78-1.28 0-1.67-.83-3.15-.83-1.51 0-1.97.82-3.13.82-1.2 0-2.54-.91-3.6-2.47-1.1-1.63-1.92-4.63-1.92-7.14 0-3.97 2.35-6.07 4.54-6.07 1.04 0 1.95.6 2.76.6.77 0 1.88-.63 3.09-.63 1.3 0 2.44.57 3.25 1.57-2.61 1.44-2.18 5.17.47 6.27-.66 1.63-1.57 3.27-2.78 4.37v-.3zm-2.85-15.65c.57-.7 1-1.63 1-2.63 0-.12-.01-.25-.03-.37-.87.03-1.87.59-2.48 1.3-.5.58-.94 1.54-.94 2.53 0 .15.02.29.05.4.92-.01 1.83-.53 2.4-1.23z"/></svg>
                                    Apple
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 text-center pt-2 border-t border-white/10">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-white/70 hover:text-primary font-bold text-[10px] transition-colors uppercase tracking-widest"
                            >
                                {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-4"></div>

            </div>

            {/* Admin Access Link - Discreet */}
            <div className="relative z-10 mt-8 opacity-30 hover:opacity-100 transition-opacity">
                <a
                    href="/admin"
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 font-mono tracking-widest uppercase"
                >
                    Panel Admin
                </a>
            </div>
        </div>
    );
}
