'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<'normal' | 'magnetic' | 'video'>('normal');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Ref for the video element so we can play/pause
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look up the DOM tree for our data attributes
      const videoEl = target.closest('[data-cursor-video]') as HTMLElement;
      const magneticEl = target.closest('[data-cursor-magnetic]') as HTMLElement;
      
      if (videoEl) {
        setCursorState('video');
        setVideoUrl(videoEl.getAttribute('data-cursor-video'));
      } else if (magneticEl || target.tagName.toLowerCase() === 'button' || target.closest('button')) {
        setCursorState('magnetic');
        setVideoUrl(null);
      } else {
        setCursorState('normal');
        setVideoUrl(null);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center overflow-hidden"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          width: cursorState === 'video' ? 160 : cursorState === 'magnetic' ? 60 : 20,
          height: cursorState === 'video' ? 160 : cursorState === 'magnetic' ? 60 : 20,
          borderRadius: '50%',
          backgroundColor: cursorState === 'normal' ? 'white' : cursorState === 'magnetic' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          border: cursorState === 'magnetic' ? '1px solid rgba(255,255,255,0.5)' : 'none',
          x: mousePosition.x - (cursorState === 'video' ? 80 : cursorState === 'magnetic' ? 30 : 10),
          y: mousePosition.y - (cursorState === 'video' ? 80 : cursorState === 'magnetic' ? 30 : 10),
        }}
        transition={{
          type: "spring",
          stiffness: cursorState === 'video' ? 100 : 150,
          damping: cursorState === 'video' ? 20 : 15,
          mass: 0.1
        }}
      >
        <AnimatePresence>
          {cursorState === 'video' && videoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full h-full relative"
            >
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 border border-white/20 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-white text-xs font-bold tracking-widest uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>VER</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Small dot for normal and magnetic */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          opacity: cursorState === 'video' ? 0 : 1
        }}
        transition={{ type: "tween", duration: 0.1 }}
      />
    </>
  );
}
