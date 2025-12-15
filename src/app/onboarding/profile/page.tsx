import { ActorProfileForm } from "@/components/actor-profile-form";

export default function OnboardingProfilePage() {
    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <div className="text-center mb-8 space-y-2">
                <h1 className="text-3xl md:text-4xl font-display font-black text-black uppercase tracking-tight">
                    Entra en nuestra <br /> <span className="text-primary">Cartera de Actores</span>
                </h1>
                <p className="text-zinc-500 max-w-md mx-auto">
                    Completa tu perfil profesional para acceder a herramientas exclusivas y conectar con directores de casting.
                </p>
            </div>

            <div className="max-w-3xl mx-auto mb-6 bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg text-center animate-pulse">
                <p className="text-blue-800 font-bold text-lg">
                    ¡Casi estamos! Completa tu perfil para acceder al Panel de Control y ver las ofertas.
                </p>
            </div>

            <ActorProfileForm />
        </div>
    );
}
