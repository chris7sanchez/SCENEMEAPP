"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "¿Qué incluye la membresía Packtor Pro?",
    answer: "Incluye uso ilimitado de nuestra herramienta de ensayo con IA, feedback de casting, prioridad al agendar servicios audiovisuales (books y escenas), un 15% de descuento en todos los servicios presenciales y acceso a separatas exclusivas."
  },
  {
    question: "¿En qué resolución se graban las escenas?",
    answer: "Todas nuestras escenas se graban en resolución 4K real, con iluminación y etalonaje cinematográfico profesional, para que tu material luzca como una película de alto presupuesto."
  },
  {
    question: "¿Cuánto tardáis en entregar las fotos o el vídeo?",
    answer: "El tiempo de entrega estándar para las fotografías (Book) es de 5 a 7 días hábiles. Para las escenas en vídeo, que requieren montaje y etalonaje, el plazo es de 10 a 14 días hábiles."
  },
  {
    question: "¿Cómo funciona el ensayo con IA?",
    answer: "Solo tienes que subir tu separata (texto del casting), asignar qué personaje eres tú y cuál la IA. La plataforma reconocerá las líneas y te dará la réplica por voz en tiempo real, permitiéndote ensayar sin depender de otra persona."
  },
  {
    question: "¿Puedo probar la plataforma antes de pagar?",
    answer: "¡Sí! Puedes usar la versión básica de SCENE ME Studio de forma gratuita para probar la interfaz, y la suscripción Packtor Pro incluye 7 días de prueba sin coste."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 px-4 bg-[hsl(222,36%,5%)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display mb-4"
          >
            Preguntas Frecuentes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[hsl(220,15%,72%)]"
          >
            Resolvemos tus dudas sobre nuestros servicios y la plataforma.
          </motion.p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl overflow-hidden border border-[hsl(222,20%,15%)] bg-[hsl(222,30%,8%)]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-lg pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`text-[hsl(42,90%,55%)] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 pt-0 text-[hsl(220,15%,70%)] leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
