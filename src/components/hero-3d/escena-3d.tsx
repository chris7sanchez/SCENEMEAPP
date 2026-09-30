'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Environment, Float, Lightformer, Sparkles } from '@react-three/drei';
import { ObjetivoClaqueta, ORO } from '@/components/hero-3d/objetivo-claqueta';

/*
 * LA ESCENA 3D del hero: el objetivo-claqueta, la luz y lo que reacciona.
 *
 * - Luz: una ambiente tenue, un foco dorado (#D4AF37) desde arriba a la
 *   derecha y un contraluz azul noche desde atrás a la izquierda. Los reflejos
 *   del cromo salen de un entorno hecho con paneles de luz (Lightformer), sin
 *   descargar ningún HDR.
 * - Movimiento: el objeto sigue al ratón (o a la inclinación del móvil) y,
 *   si se señala una de las tres tarjetas, gira un poco hacia ella.
 * - Destello anamórfico dorado que se enciende con el giro, y polvo en
 *   suspensión (Sparkles) para dar profundidad.
 * - Al pulsar el botón, la cámara se mete en el objetivo (onEntrado avisa).
 * - Con «reducir movimiento»: ni flotación, ni giro continuo, ni polvo que se
 *   mueva; el objeto sólo sigue al ratón, sin prisas.
 */

export type Giro = { activo: boolean; x: number; y: number };

type Props = {
    foco: number | null;
    entrando: boolean;
    onEntrado: () => void;
    onListo: () => void;
    quieto: boolean;
    calidad: 'alta' | 'baja';
    giro: MutableRefObject<Giro>;
    fuenteEventos: MutableRefObject<HTMLElement | null>;
};

/** Un degradado radial dorado para el destello, dibujado una vez. */
function useTexturaDestello(anamorfico: boolean) {
    return useMemo(() => {
        const c = document.createElement('canvas');
        c.width = anamorfico ? 512 : 256;
        c.height = anamorfico ? 32 : 256;
        const g = c.getContext('2d')!;
        const grad = anamorfico
            ? g.createLinearGradient(0, 0, c.width, 0)
            : g.createRadialGradient(128, 128, 0, 128, 128, 128);
        if (anamorfico) {
            grad.addColorStop(0, 'rgba(212,175,55,0)');
            grad.addColorStop(0.5, 'rgba(255,236,190,1)');
            grad.addColorStop(1, 'rgba(212,175,55,0)');
        } else {
            grad.addColorStop(0, 'rgba(255,244,214,1)');
            grad.addColorStop(0.25, 'rgba(212,175,55,0.6)');
            grad.addColorStop(1, 'rgba(212,175,55,0)');
        }
        g.fillStyle = grad;
        g.fillRect(0, 0, c.width, c.height);
        if (anamorfico) {
            // Afinar la raya por arriba y por abajo.
            const v = g.createLinearGradient(0, 0, 0, c.height);
            v.addColorStop(0, 'rgba(0,0,0,1)');
            v.addColorStop(0.5, 'rgba(0,0,0,0)');
            v.addColorStop(1, 'rgba(0,0,0,1)');
            g.globalCompositeOperation = 'destination-out';
            g.fillStyle = v;
            g.fillRect(0, 0, c.width, c.height);
        }
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    }, [anamorfico]);
}

function Pieza({ foco, entrando, onEntrado, quieto, giro, calidad }: Omit<Props, 'onListo' | 'fuenteEventos'>) {
    const grupo = useRef<THREE.Group>(null);
    const destello = useRef<THREE.MeshBasicMaterial>(null);
    const raya = useRef<THREE.MeshBasicMaterial>(null);
    const antes = useRef(0);
    const avisado = useRef(false);
    // El tamaño se adapta al ancho visible: en el móvil, el objeto entero
    // cabe sin tapar el texto; en pantalla ancha no pasa de su tamaño.
    const anchoVisible = useThree((s) => s.viewport.width);
    const escala = Math.min(0.66, anchoVisible / 5.6);
    const texDestello = useTexturaDestello(false);
    const texRaya = useTexturaDestello(true);

    useFrame((state, dt) => {
        const g = grupo.current;
        if (!g) return;
        const d = Math.min(dt, 0.05);
        const px = giro.current.activo ? giro.current.x : state.pointer.x;
        const py = giro.current.activo ? giro.current.y : state.pointer.y;

        let objY = px * 0.45;
        let objX = -py * 0.3;
        // Girar hacia la tarjeta señalada: izquierda, derecha, abajo.
        if (foco === 0) objY -= 0.55;
        if (foco === 1) objY += 0.55;
        if (foco === 2) objX += 0.35;
        if (!quieto) objY += Math.sin(state.clock.elapsedTime * 0.3) * 0.12;

        const suavidad = quieto ? 2 : 4;
        g.rotation.y = THREE.MathUtils.damp(g.rotation.y, objY, suavidad, d);
        g.rotation.x = THREE.MathUtils.damp(g.rotation.x, objX, suavidad, d);

        // El destello se enciende con la velocidad del giro.
        const velocidad = Math.abs(g.rotation.y - antes.current) / Math.max(d, 1e-3);
        antes.current = g.rotation.y;
        const brillo = 0.35 + Math.min(0.65, velocidad * 1.6);
        if (destello.current) destello.current.opacity = THREE.MathUtils.damp(destello.current.opacity, brillo, 6, d);
        if (raya.current) raya.current.opacity = THREE.MathUtils.damp(raya.current.opacity, brillo * 0.8, 6, d);

        // Entrar en el objetivo.
        if (entrando) {
            const camera = state.camera;
            camera.position.z = THREE.MathUtils.damp(camera.position.z, 0.6, 2.6, d);
            g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0, 6, d);
            g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 6, d);
            if (!avisado.current && camera.position.z < 1.6) {
                avisado.current = true;
                onEntrado();
            }
        }
    });

    const cuerpo = (
        <group ref={grupo} scale={escala} position={[0, -0.42, 0]}>
            <ObjetivoClaqueta calidad={calidad} />
            {/* El destello, en el borde del cristal, siempre de cara a quien mira. */}
            <Billboard position={[-0.55, 0.5, 1.3]}>
                <mesh>
                    <planeGeometry args={[0.9, 0.9]} />
                    <meshBasicMaterial ref={destello} map={texDestello} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                </mesh>
                <mesh>
                    <planeGeometry args={[3.6, 0.08]} />
                    <meshBasicMaterial ref={raya} map={texRaya} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                </mesh>
            </Billboard>
        </group>
    );

    return quieto ? cuerpo : (
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.45}>
            {cuerpo}
        </Float>
    );
}

export function Escena3D({ onListo, fuenteEventos, calidad, quieto, ...resto }: Props) {
    const listo = useRef(false);

    return (
        <Canvas
            eventSource={fuenteEventos as MutableRefObject<HTMLElement>}
            eventPrefix="client"
            dpr={calidad === 'alta' ? [1, 1.75] : [1, 1.25]}
            camera={{ position: [0, 0, 7.4], fov: 32 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={() => {
                if (!listo.current) { listo.current = true; onListo(); }
            }}
            aria-hidden="true"
        >
            <color attach="background" args={['#111111']} />

            {/* Luz: ambiente tenue + foco dorado + contraluz azul noche. */}
            <ambientLight intensity={0.25} />
            <spotLight position={[5, 6, 5]} angle={0.45} penumbra={0.8} intensity={120} color={ORO} />
            <directionalLight position={[-6, 2, -5]} intensity={2.2} color="#2a4a9a" />

            {/* Reflejos del metal, sin descargar nada. */}
            <Environment resolution={256}>
                <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 4, 3]} scale={[8, 1.5, 1]} />
                <Lightformer form="rect" intensity={3} color={ORO} position={[5, 0, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 2, 1]} />
                <Lightformer form="rect" intensity={1.5} color="#3355aa" position={[-5, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
                <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 0, 6]} scale={3} />
            </Environment>

            <Pieza {...resto} quieto={quieto} calidad={calidad} />

            {/* Polvo de rodaje en suspensión. */}
            <Sparkles
                count={calidad === 'alta' ? 80 : 40}
                scale={[10, 6, 5]}
                size={2.2}
                speed={quieto ? 0 : 0.25}
                opacity={0.55}
                color={ORO}
            />
        </Canvas>
    );
}
