'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect } from "react";
import { Video, Camera, Mic, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  {
    id: "book",
    title: "Book Actoral Premium",
    description: "Sesión fotográfica de alta calidad diseñada específicamente para perfiles actorales. Capturamos tu esencia para destacar en castings.",
    icon: Camera,
    color: "hsl(42, 90%, 65%)",
    href: "/login",
    images: ["/trabajos/1.jpg", "/trabajos/5.2.jpg", "/trabajos/6.2.jpg", "/trabajos/8.jpg", "/trabajos/10.jpg"]
  },
  {
    id: "escenas",
    title: "ESCENAS de CINE",
    description: "Grabación de escenas cinematográficas en resolución 4K con equipo profesional. Ideal para actualizar tu videobook con material de máxima calidad.",
    icon: Video,
    color: "hsl(42, 90%, 65%)",
    href: "/login",
    video: "/videos/MIX-cine-web.mp4"
  },
  {
    id: "selftapes",
    title: "Self-Tapes con Dirección",
    description: "Grabación de self-tapes con asesoramiento y dirección de casting profesional. Asegura tu mejor toma para esa prueba importante.",
    icon: Mic,
    color: "hsl(42, 90%, 65%)",
    href: "/login",
    video: "/videos/ACTING RODRIGUES SHOGUN2-web.mp4"
  },
  {
    id: "ai",
    title: "Ensayo con IA",
    description: "Nuestra plataforma revolucionaria. Ensaya tus textos con nuestra IA interactiva en tiempo real. Perfecto para memorizar y explorar tonos.",
    icon: Sparkles,
    color: "hsl(42, 90%, 55%)",
    href: "/login",
    video: "/videos/Acting1 OLIVER-web.mp4",
    featured: true
  }
];


const Carousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  );
};

const Card = ({ service, index, progress, range, targetScale }: any) => {
  const containerRef = useRef(null);
  const scale = useTransform(progress, range, [1, targetScale]);
  const isInView = useInView(containerRef, { once: true, margin: "200px" });
  
  return (
    <div ref={containerRef} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div 
        style={{ scale, top: `calc(-5vh + ${index * 25}px)` }} 
        className="relative flex flex-col md:flex-row w-full max-w-6xl h-[600px] rounded-3xl overflow-hidden origin-top bg-[#0a0a0a] border border-white/10" data-cursor-video={service.video ? service.video : undefined}
      >
        {/* Left Side: Content */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center h-full relative z-10 bg-black/40 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-white/20 bg-white/5">
            <service.icon size={32} color={service.color} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-4xl md:text-5xl font-display mb-6 tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
            {service.title}
          </h3>
          
          <p className="text-lg text-white/60 leading-relaxed mb-10 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            {service.description}
          </p>

          <Link 
            href={service.href}
            className="group relative inline-flex items-center gap-3 w-fit" data-cursor-magnetic="true"
          >
            <span className="text-sm font-bold uppercase tracking-[0.2em] relative z-10" style={{ color: service.color }}>
              {service.featured ? 'Probar gratis' : 'Reservar ahora'}
            </span>
            <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center relative z-10 overflow-hidden" style={{ color: service.color }}>
              <ArrowRight size={16} className="transform group-hover:translate-x-8 transition-transform duration-500 absolute" />
              <ArrowRight size={16} className="transform -translate-x-8 group-hover:translate-x-0 transition-transform duration-500 absolute" />
            </div>
            {/* Hover line */}
            <div className="absolute -bottom-2 left-0 h-[1px] w-0 bg-current group-hover:w-full transition-all duration-500" style={{ backgroundColor: service.color }} />
          </Link>
        </div>

        {/* Right Side: Background (Video or Carousel) */}
        <div className="absolute inset-0 md:relative md:w-1/2 h-full z-0">
          {service.images ? (
            <Carousel images={service.images} />
          ) : isInView ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover animate-in fade-in duration-1000"
            >
              <source src={service.video} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-[#0a0a0a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-black/50 to-transparent md:hidden z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-transparent hidden md:block w-1/3 z-10" />
        </div>
      </motion.div>
    </div>
  );
};

export function ServicesGrid() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} id="servicios" className="relative pb-[10vh] bg-black">
      <div className="pt-[15vh] pb-[5vh] text-center max-w-4xl mx-auto px-4 sticky top-0 z-0">
        <h2 className="text-5xl md:text-7xl font-display mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
          Servicios Premium
        </h2>
        <p className="text-xl text-white/50 tracking-widest uppercase font-light">
          Eleva tu carrera al estándar de la industria
        </p>
      </div>

      <div className="relative z-10 mt-[-20vh]">
        {SERVICES.map((service, index) => {
          const targetScale = 1 - ((SERVICES.length - index) * 0.05);
          return (
            <Card 
              key={service.id} 
              service={service} 
              index={index} 
              progress={scrollYProgress}
              range={[index * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </section>
  );
}
