'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LazyVideo } from '@/components/landing/lazy-video';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We make the container very tall (300vh) to have enough scroll space for the animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 1. Text Mask Zoom (0 to 0.4)
  // The text starts at normal size (scale 1) and zooms in massively (scale 100) until the 'C' or 'O' floods the screen
  const maskSize = useTransform(scrollYProgress, [0, 0.4], ["100%", "10000%"]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.4], [1, 0]);

  // 2. Main Video Parallax & Fade (0.4 to 0.6)
  // After the mask floods the screen, the main video stays for a bit then fades out/moves up
  const mainVideoY = useTransform(scrollYProgress, [0.4, 0.6], ["0%", "-50%"]);
  const mainVideoOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);

  // 3. Grid Parallax (0.5 to 1.0)
  const gridY1 = useTransform(scrollYProgress, [0.5, 1], ["50%", "-10%"]);
  const gridY2 = useTransform(scrollYProgress, [0.5, 1], ["100%", "-40%"]);
  const gridY3 = useTransform(scrollYProgress, [0.5, 1], ["80%", "-20%"]);
  const gridOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-black">
      {/* Sticky Container holds the actual visual experience */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        
        {/* The Text Mask Video layer */}
        <motion.div 
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          {/* We use a div with text that masks the video behind it. 
              Using mix-blend-mode or WebkitBackgroundClip */}
          <motion.div 
            className="w-full h-full flex items-center justify-center bg-black"
            style={{ 
              backgroundSize: maskSize,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 300"><text x="50%" y="50%" font-family="Cinzel" font-size="180" font-weight="900" text-anchor="middle" dominant-baseline="middle">SCENE ME</text></svg>')`,
              WebkitMaskSize: maskSize,
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
            }}
          >
            <video
              poster="/videos/mix-cine-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/MIX-cine-web.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>

        {/* The Unmasked Main Video (revealed after mask floods the screen) */}
        <motion.div 
          className="absolute inset-0 z-10"
          style={{ y: mainVideoY, opacity: mainVideoOpacity }}
        >
          <video
            poster="/videos/mix-cine-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/videos/MIX-cine-web.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-50" />
        </motion.div>

        {/* Grid Parallax Section */}
        <motion.div 
          className="absolute inset-0 z-30 flex gap-4 p-4 md:p-10"
          style={{ opacity: gridOpacity }}
        >
          {/* Column 1 */}
          <motion.div className="flex-1 flex flex-col gap-4" style={{ y: gridY1 }}>
            <div className="h-[40vh] rounded-2xl overflow-hidden relative">
              <LazyVideo src="/videos/MUDANZA-cut-web.mp4#t=15" className="w-full h-full object-cover" />
            </div>
            <div className="h-[60vh] rounded-2xl overflow-hidden relative">
              <LazyVideo src="/videos/Mel_cuban-web.mp4" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Column 2 */}
          <motion.div className="flex-1 flex flex-col gap-4 mt-20" style={{ y: gridY2 }}>
            <div className="h-[50vh] rounded-2xl overflow-hidden relative">
              <LazyVideo src="/videos/AMANDA_OK_22_01-web.mp4" className="w-full h-full object-cover" />
            </div>
            <div className="h-[40vh] rounded-2xl overflow-hidden relative bg-zinc-900 flex flex-col items-center justify-center p-8 text-center border border-white/5">
               <h2 className="text-3xl font-display mb-4 leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                  TUS MEJORES TOMAS
               </h2>
               <p className="text-white/50 tracking-widest uppercase text-xs md:text-sm">El Actor's Store Definitivo</p>
            </div>
          </motion.div>

          {/* Column 3 (Hidden on mobile) */}
          <motion.div className="hidden md:flex flex-1 flex-col gap-4" style={{ y: gridY3 }}>
            <div className="h-[45vh] rounded-2xl overflow-hidden relative">
              <LazyVideo src="/videos/SONIA_DORADO_DW2-web.mp4" className="w-full h-full object-cover" />
            </div>
            <div className="h-[55vh] rounded-2xl overflow-hidden relative">
              <LazyVideo src="/videos/Acting1 OLIVER-web.mp4" className="w-full h-full object-cover" />
            </div>
          </motion.div>

        </motion.div>
        
        {/* CTA & Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-6">
           {/* CTA Button */}
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
           >
             <Link href="/login" className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors rounded-full overflow-hidden">
               <span className="relative z-10">MEJORA TU MATERIAL</span>
               
             </Link>
           </motion.div>

           {/* Scroll Indicator */}
           <div className="animate-bounce">
             <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">Scroll</span>
           </div>
        </div>
      </div>
    </section>
  );
}
