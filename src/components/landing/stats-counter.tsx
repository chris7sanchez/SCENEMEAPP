"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STATS = [
  { label: "Actores en la plataforma", value: 1200, suffix: "+" },
  { label: "Escenas Grabadas", value: 500, suffix: "+" },
  { label: "Horas ensayadas con IA", value: 3500, suffix: "h" },
  { label: "Tasa de éxito en casting", value: 40, suffix: "%" }
];

function Counter({ value, suffix }: { value: number, suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-4xl md:text-5xl font-display text-[hsl(42,90%,55%)]">
      {count}{suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <section className="py-8 bg-black border-y border-[hsl(222,20%,15%)] relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[hsl(222,20%,15%)]">
          {STATS.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <Counter value={stat.value} suffix={stat.suffix} />
              <span className="text-sm text-[hsl(220,15%,65%)] mt-2 uppercase tracking-wider font-bold">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
