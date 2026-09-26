"use client";

import { motion } from "framer-motion";
import { Bot, Play, Mic, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AiRehearsalPreview() {
  return (
    <section className="py-12 px-4 bg-[hsl(222,36%,7%)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[hsl(280,70%,65%,0.1)] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* Text Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(280,70%,65%,0.1)] text-[hsl(280,70%,65%)] text-sm font-bold tracking-widest uppercase mb-6">
            <Bot size={16} />
            <span>Inteligencia Artificial</span>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-display mb-6 leading-tight"
          >
            Tu compañero de <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(280,70%,65%)] to-[hsl(320,80%,60%)]">
              ensayo 24/7
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[hsl(220,15%,72%)] mb-8 max-w-lg leading-relaxed"
          >
            Sube tu separata, asigna los personajes y ensaya tus líneas. Nuestra IA interactiva escucha, te da la réplica con emoción real y te ofrece notas de dirección. Nunca más dependerás de un amigo para prepararte.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm tracking-widest uppercase bg-[hsl(280,70%,65%)] text-white hover:bg-[hsl(280,70%,60%)] transition-colors shadow-[0_0_20px_hsl(280,70%,65%,0.3)] hover:shadow-[0_0_30px_hsl(280,70%,65%,0.5)] hover:scale-105 duration-300"
            >
              Probar Studio Gratis
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Mock UI */}
        <div className="flex-1 w-full max-w-md lg:max-w-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-[hsl(222,20%,15%)] bg-[hsl(222,30%,10%)] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-[hsl(222,20%,15%)] flex items-center justify-between bg-[hsl(222,36%,7%)]">
              <div className="flex items-center gap-3">
                <FileText className="text-[hsl(220,15%,65%)]" size={20} />
                <span className="font-bold text-sm text-[hsl(220,15%,80%)]">ESCENA_CASTING_V2.pdf</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
            </div>

            {/* Script area */}
            <div className="p-6 space-y-6 font-mono text-sm">
              <div className="space-y-2 opacity-50">
                <p className="text-center font-bold text-[hsl(280,70%,65%)]">DIRECTORA (IA)</p>
                <p className="text-center max-w-[80%] mx-auto">Entonces, dime. ¿Por qué crees que eres adecuado para este trabajo?</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-center font-bold text-[hsl(42,90%,55%)]">TÚ</p>
                <p className="text-center max-w-[80%] mx-auto">Porque no me rindo. Y porque sé que nadie más va a poner el esfuerzo que yo pondré.</p>
              </div>

              <div className="space-y-2">
                <p className="text-center font-bold text-[hsl(280,70%,65%)] flex items-center justify-center gap-2">
                  DIRECTORA (IA)
                  <motion.span 
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-[hsl(280,70%,65%)]"
                  />
                </p>
                <div className="flex justify-center gap-1 mt-2 h-6 items-center">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${h * 20}%`, `${h * 10}%`, `${h * 20}%`] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      className="w-1 bg-[hsl(280,70%,65%)] rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-[hsl(222,20%,15%)] bg-[hsl(222,36%,7%)] flex items-center justify-center gap-4">
              <button className="w-12 h-12 rounded-full bg-[hsl(222,20%,15%)] flex items-center justify-center text-white hover:bg-[hsl(222,20%,20%)] transition-colors">
                <Play size={20} className="ml-1" />
              </button>
              <button className="w-14 h-14 rounded-full bg-[hsl(42,90%,55%)] flex items-center justify-center text-black shadow-[0_0_15px_hsl(42,90%,55%,0.5)] hover:scale-105 transition-transform">
                <Mic size={24} />
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
