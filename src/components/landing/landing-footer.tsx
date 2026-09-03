"use client";

import Link from "next/link";
import { Instagram, Twitter, Mail, MapPin } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black pt-20 pb-10 px-4 border-t border-[hsl(222,20%,15%)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-display tracking-widest text-white">SCENE ME</span>
            </Link>
            <p className="text-[hsl(220,15%,60%)] text-sm mb-6 max-w-xs">
              La plataforma definitiva para actores profesionales. Creada por y para la industria audiovisual.
            </p>
            <div className="flex items-center gap-4 text-[hsl(220,15%,60%)]">
              <a href="#" className="hover:text-[hsl(42,90%,55%)] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-[hsl(42,90%,55%)] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="mailto:contacto@scenemeapp.com" className="hover:text-[hsl(42,90%,55%)] transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Servicios</h4>
            <ul className="space-y-4 text-[hsl(220,15%,60%)] text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Book Actoral</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Escenas en 4K</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Self-Tapes</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Ensayo con IA</Link></li>
              <li><Link href="/login" className="text-[hsl(42,90%,55%)] hover:text-[hsl(42,90%,60%)] font-bold transition-colors">Packtor Pro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Plataforma</h4>
            <ul className="space-y-4 text-[hsl(220,15%,60%)] text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Registro</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Contacto</h4>
            <ul className="space-y-4 text-[hsl(220,15%,60%)] text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>Madrid, España<br/>Disponible para desplazamientos</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-shrink-0" />
                <a href="mailto:info@scenemeapp.com" className="hover:text-white transition-colors">info@scenemeapp.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[hsl(222,20%,15%)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[hsl(220,15%,50%)]">
          <p>© {currentYear} SCENE ME. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Términos de Servicio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
