"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const PORTFOLIO_ITEMS = [
  { id: 1, type: "Book", actor: "María G.", image: "/trabajos/1.jpg", size: "large" },
  { id: 2, type: "Escena", actor: "Carlos Ruiz", image: "/trabajos/3.jpg", size: "medium", video: true },
  { id: 3, type: "Book", actor: "Ana S.", image: "/trabajos/5.jpg", size: "medium" },
  { id: 4, type: "Escena", actor: "David M.", image: "/trabajos/7.jpg", size: "large", video: true },
  { id: 5, type: "Book", actor: "Laura V.", image: "/trabajos/9.jpg", size: "medium" },
  { id: 6, type: "Self-Tape", actor: "Javier T.", image: "/trabajos/11.jpg", size: "medium" },
];

export function PortfolioGallery() {
  return (
    <section className="py-12 px-4 bg-[hsl(222,36%,5%)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display mb-4"
            >
              Nuestro Trabajo
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[hsl(220,15%,72%)] max-w-xl"
            >
              Resultados reales para actores reales. Un vistazo a las producciones que han ayudado a conseguir papeles.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/login" 
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(42,90%,55%,0.3)] text-[hsl(42,90%,60%)] font-bold uppercase tracking-widest text-sm hover:bg-[hsl(42,90%,55%,0.1)] transition-colors"
            >
              Ver Galería Completa
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[300px]">
          {PORTFOLIO_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl ${item.size === 'large' ? 'md:col-span-2' : ''}`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {item.video && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <Play className="text-white ml-1" size={24} fill="currentColor" />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[hsl(42,90%,55%)] text-black">
                    {item.type}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{item.actor}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
