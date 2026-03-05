import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    vx: number;
    vy: number;
}

interface InteractiveStarsProps {
    count?: number;
    attractionStrength?: number;
    repulsionStrength?: number;
}

const InteractiveStars: React.FC<InteractiveStarsProps> = ({
    count = 80,
    attractionStrength = 0.5,
    repulsionStrength = 100
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const starsRef = useRef<Star[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize stars
        starsRef.current = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2
        }));

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            starsRef.current.forEach(star => {
                // Calculate distance to mouse
                const dx = mouseRef.current.x - star.x;
                const dy = mouseRef.current.y - star.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Repulsion force (stars flee from cursor)
                if (distance < repulsionStrength) {
                    const force = (repulsionStrength - distance) / repulsionStrength;
                    star.vx -= (dx / distance) * force * 2;
                    star.vy -= (dy / distance) * force * 2;
                }

                // Apply velocity with damping
                star.x += star.vx;
                star.y += star.vy;
                star.vx *= 0.95; // Damping
                star.vy *= 0.95;

                // Gentle drift
                star.x += Math.sin(Date.now() * 0.001 + star.id) * 0.1;
                star.y += Math.cos(Date.now() * 0.001 + star.id) * 0.1;

                // Wrap around screen
                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;

                // Draw star with glow
                const glowSize = distance < 150 ? star.size * 2 : star.size;
                const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
                gradient.addColorStop(0, `rgba(255, 215, 100, ${star.opacity})`);
                gradient.addColorStop(0.5, `rgba(255, 215, 100, ${star.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 215, 100, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                ctx.fill();

                // Core star
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 1.5})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connections between nearby stars
            starsRef.current.forEach((star1, i) => {
                starsRef.current.slice(i + 1).forEach(star2 => {
                    const dx = star2.x - star1.x;
                    const dy = star2.y - star1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(197, 160, 89, ${(1 - distance / 150) * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(star1.x, star1.y);
                        ctx.lineTo(star2.x, star2.y);
                        ctx.stroke();
                    }
                });
            });

            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [count, attractionStrength, repulsionStrength]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{ opacity: 0.6 }}
        />
    );
};

export default InteractiveStars;
