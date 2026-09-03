"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const BENEFITS = [
  "Uso ilimitado del Ensayo con IA",
  "Análisis de emociones y feedback de casting",
  "Prioridad en la reserva de sesiones de fotos y escenas",
  "15% de descuento en todos los servicios de productora",
  "Acceso a separatas exclusivas actualizadas mensualmente",
];

export function PacktorProSection() {
  return (
    <section className="py-12 px-4 bg-black relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(42,90%,55%,0.1)] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="rounded-3xl border border-[hsl(42,90%,55%,0.3)] bg-[hsl(222,30%,10%)] p-6 md:p-8 overflow-hidden relative">
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(42,90%,55%,0.1)] text-[hsl(42,90%,55%)] text-sm font-bold tracking-widest uppercase mb-6 border border-[hsl(42,90%,55%,0.2)]">
                <Star size={16} className="fill-current" />
                <span>Membresía Exclusiva</span>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-display mb-4"
              >
                Packtor Pro
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[hsl(220,15%,72%)] mb-8 text-lg"
              >
                Lleva tu preparación al siguiente nivel. Todo lo que necesitas para estar siempre a punto para el próximo casting, en un solo lugar.
              </motion.p>
              
              <ul className="space-y-4 mb-8">
                {BENEFITS.map((benefit, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 rounded-full bg-[hsl(42,90%,55%,0.2)] p-1">
                      <Check size={14} className="text-[hsl(42,90%,55%)]" />
                    </div>
                    <span className="text-[hsl(220,15%,85%)]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="w-full lg:w-[400px]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-[hsl(222,36%,7%)] p-8 text-center border border-[hsl(222,20%,20%)] relative overflow-hidden"
              >
                {/* Popular banner */}
                <div className="absolute top-4 right-[-35px] rotate-45 bg-[hsl(42,90%,55%)] text-black font-bold text-[10px] tracking-widest uppercase py-1 px-10">
                  Popular
                </div>

                <div className="text-[hsl(220,15%,65%)] font-bold uppercase tracking-widest text-sm mb-4">
                  Suscripción Mensual
                </div>
                
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold">14,99</span>
                  <span className="text-xl text-[hsl(220,15%,65%)] mb-1">€</span>
                </div>
                <div className="text-sm text-[hsl(220,15%,50%)] mb-8">/mes, cancela cuando quieras</div>
                
                <Link 
                  href="/login"
                  className="block w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase bg-[hsl(42,90%,55%)] text-black hover:bg-[hsl(42,90%,60%)] transition-colors shadow-[0_0_20px_hsl(42,90%,55%,0.3)] hover:shadow-[0_0_30px_hsl(42,90%,55%,0.5)] hover:scale-105 duration-300"
                >
                  Empezar Ahora
                </Link>
                
                <p className="text-xs text-[hsl(220,15%,40%)] mt-4">
                  7 días de prueba gratuita. Sin compromiso.
                </p>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
