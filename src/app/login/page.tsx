'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clapperboard, Eye, EyeOff, Lock } from 'lucide-react';

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
            await auth.completeRedirectLogin();
            const user = await auth.getCurrentUser();
            if (user) {
                router.push('/creator');
            }
        });
    }, [router]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center py-6"
             style={{ background: 'hsl(222, 36%, 7%)' }}>

            {/* Fondo cinemático — gradientes con color, no negro puro */}
            <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute inset-0"
                     style={{
                         background: 'radial-gradient(ellipse 80% 60% at 50% 30%, hsl(222, 40%, 14%) 0%, hsl(222, 36%, 7%) 70%)',
                     }} />
                {/* Glow dorado cálido */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-pulse"
                     style={{ background: 'radial-gradient(circle, hsla(42, 90%, 55%, 0.12) 0%, transparent 70%)' }} />
                {/* Glow azul cinematográfico */}
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full"
                     style={{ background: 'radial-gradient(circle, hsla(210, 60%, 40%, 0.08) 0%, transparent 70%)' }} />
                {/* Glow cálido inferior derecho */}
                <div className="absolute bottom-10 right-0 w-[400px] h-[400px] rounded-full"
                     style={{ background: 'radial-gradient(circle, hsla(15, 70%, 40%, 0.06) 0%, transparent 70%)' }} />
                {/* Film grain sutil */}
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{
                         backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                     }} />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center h-full justify-center">

                {/* Header Section */}
                <div className="space-y-2 animate-in fade-in slide-in-from-top-10 duration-700 mb-6">
                    <div
                        className="cursor-pointer group relative inline-block"
                        onClick={() => router.push('/creator?guest=true')}
                        title="Entrar como invitado"
                    >
                        <Clapperboard className="w-14 h-14 md:w-16 md:h-16 mx-auto text-primary mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg" />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Entrar sin registro
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display tracking-wider leading-none mb-2"
                        style={{
                            background: 'linear-gradient(180deg, hsl(45, 30%, 95%) 0%, hsl(42, 90%, 75%) 50%, hsl(42, 80%, 55%) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 4px 20px hsla(42, 90%, 55%, 0.25))',
                        }}>
                        SCENE ME
                    </h1>
                    <p className="text-xl md:text-3xl font-headline tracking-wide uppercase"
                       style={{ color: 'hsl(42, 80%, 65%)' }}>
                        THE ACTOR'S STORE CONCEPT
                    </p>
                </div>

                {/* Value Proposition */}
                <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 mb-8 text-center">
                    <p className="text-base md:text-lg font-light leading-relaxed tracking-wide"
                       style={{ color: 'hsl(220, 15%, 72%)' }}>
                        La forma más rápida y profesional de obtener tu mejor material.
                    </p>
                </div>

                {/* Auth Section */}
                <div className="w-full max-w-sm mx-auto animate-in fade-in scale-in-95 duration-500 delay-300 mb-8 relative">
                    <div className="rounded-2xl shadow-2xl p-6 relative z-10"
                         style={{
                             background: 'hsla(220, 30%, 12%, 0.85)',
                             backdropFilter: 'blur(24px) saturate(140%)',
                             WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                             border: '1px solid hsla(42, 60%, 50%, 0.2)',
                             boxShadow: '0 8px 40px hsla(222, 36%, 3%, 0.6), inset 0 1px 0 hsla(220, 30%, 30%, 0.15)',
                         }}>
                        <h2 className="text-xl font-bold mb-4 text-center font-display tracking-wide"
                            style={{ color: 'hsl(45, 20%, 92%)' }}>
                            {isLogin ? 'ACCESO ACTORES' : 'CREAR CUENTA'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 text-base px-5 rounded-xl transition-all"
                                    style={{
                                        background: 'hsla(220, 25%, 18%, 0.7)',
                                        borderColor: 'hsla(220, 20%, 35%, 0.5)',
                                        color: 'hsl(45, 20%, 92%)',
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-1 relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 text-base px-5 pr-12 rounded-xl transition-all"
                                    style={{
                                        background: 'hsla(220, 25%, 18%, 0.7)',
                                        borderColor: 'hsla(220, 20%, 35%, 0.5)',
                                        color: 'hsl(45, 20%, 92%)',
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'hsl(220, 15%, 55%)' }}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {error && <p className="text-destructive text-xs font-bold text-center bg-destructive/10 p-2 rounded-lg">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 text-base font-black tracking-widest transition-all transform active:scale-95 rounded-xl uppercase"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(42, 90%, 50%) 0%, hsl(38, 85%, 45%) 100%)',
                                    color: 'hsl(222, 36%, 7%)',
                                    boxShadow: '0 4px 20px hsla(42, 90%, 50%, 0.3), inset 0 1px 0 hsla(45, 100%, 80%, 0.3)',
                                }}
                            >
                                {isLoading ? 'CARGANDO...' : (isLogin ? 'ENTRAR' : 'REGISTRARME')}
                            </Button>
                        </form>

                        {/* SSO Section */}
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full" style={{ borderTop: '1px solid hsla(220, 18%, 30%, 0.5)' }}></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"
                                     style={{ color: 'hsl(220, 12%, 55%)' }}>
                                    <span className="px-2" style={{ background: 'hsla(220, 30%, 12%, 0.9)' }}>O continuar con</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={isLoading}
                                    className="h-11 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                                    style={{
                                        background: 'hsla(220, 25%, 18%, 0.5)',
                                        borderColor: 'hsla(220, 20%, 30%, 0.5)',
                                        color: 'hsl(220, 15%, 80%)',
                                    }}
                                    onClick={async () => {
                                        setError(''); setIsLoading(true);
                                        const { auth } = await import('@/lib/auth');
                                        const r = await auth.loginWithGoogle();
                                        if (r.redirecting) return; // la página redirige a Google
                                        if (r.success) { window.location.href = '/creator'; }
                                        else { setError(r.error || 'No se pudo iniciar con Google'); setIsLoading(false); }
                                    }}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.12-1.92 4.12-1.2 1.2-3.08 2.48-6.12 2.48-4.92 0-8.96-4-8.96-8.92 0-4.92 4.04-8.92 8.96-8.92 2.68 0 4.6 1.04 6.04 2.44l2.32-2.32C18.64 1.16 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48S5.6 24.96 12.48 24.96c3.68 0 6.48-1.2 8.68-3.48 2.24-2.24 2.96-5.4 2.96-8.08 0-.68-.04-1.32-.12-1.92h-11.52z"/></svg>
                                    Continuar con Google
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 text-center pt-2" style={{ borderTop: '1px solid hsla(220, 18%, 30%, 0.5)' }}>
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="font-bold text-[11px] transition-colors uppercase tracking-widest hover:text-primary"
                                style={{ color: 'hsl(220, 15%, 65%)' }}
                            >
                                {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-4"></div>

            </div>

            {/* Admin Access Link */}
            <div className="relative z-10 mt-4 opacity-30 hover:opacity-70 transition-opacity duration-500">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin')}
                    className="font-mono tracking-widest uppercase text-[9px] px-4"
                    style={{ color: 'hsl(220, 15%, 62%)' }}
                >
                    <Lock className="w-2.5 h-2.5 mr-1" /> admin
                </Button>
            </div>
        </div>
    );
}
