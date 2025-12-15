import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="w-full py-6 px-4 border-t border-white/10 bg-black text-center text-zinc-500 text-xs">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
                <p>&copy; {new Date().getFullYear()} Scene Me. Todos los derechos reservados.</p>
                <div className="flex gap-6">
                    <Link href="/terms" className="hover:text-white transition-colors">
                        Términos y Condiciones
                    </Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                        Política de Privacidad
                    </Link>
                </div>
            </div>
        </footer>
    );
}
