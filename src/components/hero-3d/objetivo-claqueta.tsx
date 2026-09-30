'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei';

/*
 * EL OBJETO: un objetivo de cine fundido con la claqueta dorada de SCENE ME.
 *
 * No hay modelo 3D de la marca, así que se construye con piezas geométricas:
 * cuerpo de cromo oscuro, anillos de oro pulido, un cristal frontal con
 * refracción de verdad (MeshTransmissionMaterial) y, detrás, la claqueta con
 * sus barras diagonales doradas y negras. Todo procedural: no se descarga
 * ningún fichero, así que no hay nada que tarde en llegar.
 */

export const ORO = '#D4AF37';

/** Oro pulido y cromo oscuro: los dos metales de toda la pieza. */
function useMateriales() {
    return useMemo(
        () => ({
            oro: new THREE.MeshStandardMaterial({ color: ORO, metalness: 1, roughness: 0.18 }),
            cromo: new THREE.MeshStandardMaterial({ color: '#1b1c1f', metalness: 1, roughness: 0.28 }),
            goma: new THREE.MeshStandardMaterial({ color: '#0d0d0e', metalness: 0.2, roughness: 0.75 }),
            // El tratamiento antirreflejos de las lentes: iridiscente, como en los objetivos de verdad.
            tratamiento: new THREE.MeshPhysicalMaterial({
                color: '#0a0c14',
                metalness: 0.4,
                roughness: 0.08,
                iridescence: 1,
                iridescenceIOR: 1.6,
                iridescenceThicknessRange: [200, 800],
                clearcoat: 1,
            }),
        }),
        [],
    );
}

/** Barras diagonales de la claqueta, dibujadas en un canvas: oro y negro a 104°. */
function useBarrasClaqueta() {
    return useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 128;
        const g = c.getContext('2d')!;
        g.fillStyle = '#0d0d0e';
        g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = ORO;
        const paso = 128;
        for (let x = -c.height; x < c.width + c.height; x += paso) {
            g.beginPath();
            g.moveTo(x, c.height);
            g.lineTo(x + paso / 2, c.height);
            g.lineTo(x + paso / 2 + c.height * 0.25, 0);
            g.lineTo(x + c.height * 0.25, 0);
            g.closePath();
            g.fill();
        }
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        return t;
    }, []);
}

/** Estrías del anillo de enfoque: unas cuantas costillas finas alrededor. */
function Estrias({ radio, z, largo, material }: { radio: number; z: number; largo: number; material: THREE.Material }) {
    const n = 48;
    return (
        <group position={[0, 0, z]}>
            {Array.from({ length: n }, (_, i) => {
                const a = (i / n) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(a) * radio, Math.sin(a) * radio, 0]} rotation={[0, 0, a]} material={material}>
                        <boxGeometry args={[0.05, 0.03, largo]} />
                    </mesh>
                );
            })}
        </group>
    );
}

export function ObjetivoClaqueta({ calidad = 'alta' }: { calidad?: 'alta' | 'baja' }) {
    const m = useMateriales();
    const barras = useBarrasClaqueta();

    return (
        <group>
            {/* ---------- La claqueta, detrás del objetivo ---------- */}
            <group position={[0.35, 0.55, -1.6]} rotation={[0.08, -0.35, -0.12]}>
                {/* La pizarra */}
                <mesh material={m.cromo}>
                    <boxGeometry args={[3.1, 2.1, 0.1]} />
                </mesh>
                {/* Marco de oro */}
                {[
                    [0, 1.02, 3.1, 0.06],
                    [0, -1.02, 3.1, 0.06],
                    [-1.52, 0, 0.06, 2.1],
                    [1.52, 0, 0.06, 2.1],
                ].map(([x, y, w, h], i) => (
                    <mesh key={i} position={[x, y, 0.06]} material={m.oro}>
                        <boxGeometry args={[w, h, 0.03]} />
                    </mesh>
                ))}
                {/* La barra fija y la del golpe, entreabierta */}
                <mesh position={[0, 1.2, 0]}>
                    <boxGeometry args={[3.1, 0.34, 0.12]} />
                    <meshStandardMaterial map={barras} metalness={0.85} roughness={0.25} />
                </mesh>
                <group position={[-1.5, 1.38, 0]} rotation={[0, 0, 0.26]}>
                    <mesh position={[1.55, 0.17, 0]}>
                        <boxGeometry args={[3.1, 0.34, 0.12]} />
                        <meshStandardMaterial map={barras} metalness={0.85} roughness={0.25} />
                    </mesh>
                </group>
                {/* La bisagra */}
                <mesh position={[-1.5, 1.38, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.oro}>
                    <cylinderGeometry args={[0.09, 0.09, 0.16, 24]} />
                </mesh>
            </group>

            {/* ---------- El objetivo, apuntando a quien mira ---------- */}
            <group rotation={[0, 0, 0]}>
                {/* Cuerpo */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} material={m.cromo}>
                    <cylinderGeometry args={[0.95, 1.05, 2.4, 96]} />
                </mesh>
                {/* Anillo de enfoque de goma con sus estrías */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]} material={m.goma}>
                    <cylinderGeometry args={[1.08, 1.08, 0.7, 96]} />
                </mesh>
                <Estrias radio={1.08} z={0.1} largo={0.66} material={m.goma} />
                {/* Anillos de oro */}
                {[-1.1, -0.35, 0.55, 0.92].map((z) => (
                    <mesh key={z} position={[0, 0, z]} material={m.oro}>
                        <torusGeometry args={[z > 0.8 ? 1.16 : 1.1, 0.035, 16, 128]} />
                    </mesh>
                ))}
                {/* Parasol / aro frontal */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.05]} material={m.cromo}>
                    <cylinderGeometry args={[1.2, 1.12, 0.3, 96, 1, true]} />
                </mesh>
                <mesh position={[0, 0, 1.2]} material={m.oro}>
                    <torusGeometry args={[1.2, 0.04, 16, 128]} />
                </mesh>
                {/* Interior: el grupo óptico con su tratamiento iridiscente */}
                <mesh position={[0, 0, 0.78]} material={m.tratamiento}>
                    <circleGeometry args={[1.02, 96]} />
                </mesh>
                <mesh position={[0, 0, 0.8]} material={m.cromo}>
                    <torusGeometry args={[0.55, 0.05, 16, 96]} />
                </mesh>
                {/* Los elementos de dentro, que asoman a través del cristal: aros
                    de oro concéntricos y una lente interior brillante. */}
                {[0.32, 0.78].map((r) => (
                    <mesh key={r} position={[0, 0, 0.82]} material={m.oro}>
                        <torusGeometry args={[r, 0.018, 12, 96]} />
                    </mesh>
                ))}
                <mesh position={[0, 0, 0.84]}>
                    <circleGeometry args={[0.3, 64]} />
                    <meshPhysicalMaterial color="#1a2340" metalness={0.6} roughness={0.05} clearcoat={1} iridescence={1} iridescenceIOR={1.8} />
                </mesh>
                {/* El cristal frontal: refracción real. Un casquete de una esfera
                    de radio 2,2 cortado para que su borde mida lo mismo que el
                    objetivo (sen 0,482 · 2,2 ≈ 1,02) y abombe 0,25 hacia fuera. */}
                <mesh position={[0, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
                    <sphereGeometry args={[2.2, 64, 16, 0, Math.PI * 2, 0, 0.482]} />
                    {calidad === 'alta' ? (
                        <MeshTransmissionMaterial
                            transmission={1}
                            thickness={0.6}
                            roughness={0.02}
                            ior={1.52}
                            chromaticAberration={0.08}
                            anisotropy={0.2}
                            distortion={0.15}
                            distortionScale={0.3}
                            temporalDistortion={0}
                            color="#dfe8ff"
                            backside={false}
                            samples={6}
                            resolution={512}
                        />
                    ) : (
                        <meshPhysicalMaterial
                            transmission={1}
                            thickness={0.6}
                            roughness={0.02}
                            ior={1.52}
                            color="#dfe8ff"
                            clearcoat={1}
                        />
                    )}
                </mesh>
            </group>
        </group>
    );
}
