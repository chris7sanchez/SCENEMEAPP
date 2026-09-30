'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

/*
 * DOS PANTALLAS QUE SE RELEVAN GIRANDO («hero-scroll-animation» de ui-layout,
 * 21st.dev). La primera se queda fija y, al bajar, se encoge y gira un poco
 * hacia un lado; la segunda sube por encima girando al revés hasta quedar
 * recta, con las esquinas redondeadas. Recreado con framer-motion (que ya
 * usaba el proyecto) y con el contenido por props: `primera` y `segunda`.
 * Con «reducir movimiento», las dos pantallas van una debajo de otra, quietas.
 */

export interface HeroScrollAnimationProps {
    primera: React.ReactNode;
    segunda: React.ReactNode;
    className?: string;
    claseSegunda?: string;
}

function Primera({ progreso, children }: { progreso: MotionValue<number>; children: React.ReactNode }) {
    const scale = useTransform(progreso, [0, 1], [1, 0.8]);
    const rotate = useTransform(progreso, [0, 1], [0, -5]);
    return (
        <motion.section style={{ scale, rotate }} className="sticky top-0 h-screen overflow-hidden">
            {children}
        </motion.section>
    );
}

function Segunda({ progreso, children, className }: { progreso: MotionValue<number>; children: React.ReactNode; className?: string }) {
    const scale = useTransform(progreso, [0, 1], [0.8, 1]);
    const rotate = useTransform(progreso, [0, 1], [5, 0]);
    return (
        <motion.section style={{ scale, rotate }} className={cn('relative min-h-screen overflow-hidden rounded-[28px]', className)}>
            {children}
        </motion.section>
    );
}

export function HeroScrollAnimation({ primera, segunda, className, claseSegunda }: HeroScrollAnimationProps) {
    const contenedor = useRef<HTMLDivElement>(null);
    const quieto = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: contenedor, offset: ['start start', 'end end'] });

    if (quieto) {
        return (
            <div className={className}>
                <section className="h-screen overflow-hidden">{primera}</section>
                <section className={cn('min-h-screen overflow-hidden rounded-[28px]', claseSegunda)}>{segunda}</section>
            </div>
        );
    }
    return (
        <div ref={contenedor} className={cn('relative h-[200vh]', className)}>
            <Primera progreso={scrollYProgress}>{primera}</Primera>
            <Segunda progreso={scrollYProgress} className={claseSegunda}>{segunda}</Segunda>
        </div>
    );
}

export default HeroScrollAnimation;
