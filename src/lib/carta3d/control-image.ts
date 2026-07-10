/**
 * Carta 3D — imagen de control "limpia" para ControlNet (server-side, node-canvas).
 * Solo geometría: anillos, divisiones, marcadores de planetas y líneas de aspectos.
 * Sin texto ni números: los bordes de texto confunden a la IA.
 */

import { createCanvas } from 'canvas';
import type { Carta3DInput } from './prompt-builder';

const TAMANO = 1024;
const CENTRO = TAMANO / 2;
const RADIO_EXTERIOR = 470;
const RADIO_INTERIOR = 380;
const RADIO_PLANETAS = 330;
const GROSOR_LINEA = 5;

const ASPECTOS_ARMONICOS = new Set(['Trígono', 'Sextil', 'Conjunción']);
const ES_LUMINARIA = (n: string) => ['Sun', 'Sol', 'Moon', 'Luna'].includes(n);

/** Misma convención polar que NatalChart2D: Asc al Este, signos en antihorario. */
function punto(longitudEcliptica: number, radio: number, ascLongitud: number): [number, number] {
    const theta = (-(longitudEcliptica + 180 - ascLongitud) * Math.PI) / 180;
    return [CENTRO + radio * Math.cos(theta), CENTRO + radio * Math.sin(theta)];
}

export function generarImagenControl(carta: Carta3DInput): Buffer {
    const canvas = createCanvas(TAMANO, TAMANO);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, TAMANO, TAMANO);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';

    const asc = carta.ascendant;

    // Anillos concéntricos
    for (const r of [RADIO_EXTERIOR, RADIO_INTERIOR]) {
        ctx.lineWidth = GROSOR_LINEA;
        ctx.beginPath();
        ctx.arc(CENTRO, CENTRO, r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // Divisiones de los 12 signos (solo en el anillo zodiacal)
    for (let i = 0; i < 12; i++) {
        const [ax, ay] = punto(i * 30, RADIO_INTERIOR, asc);
        const [bx, by] = punto(i * 30, RADIO_EXTERIOR, asc);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
    }

    // Marcadores de planetas en su longitud exacta.
    // Grandes (30-40px): con marcadores pequeños la IA pinta bolitas anónimas
    const posiciones = new Map<string, [number, number]>();
    for (const p of carta.planets) {
        const xy = punto(p.longitude, RADIO_PLANETAS, asc);
        posiciones.set(p.name, xy);
        const radioMarca = ES_LUMINARIA(p.name) ? 40 : 30;
        ctx.beginPath();
        ctx.arc(xy[0], xy[1], radioMarca, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Líneas de aspectos entre planetas (finas para no competir con los orbes)
    for (const asp of carta.aspects) {
        const a = posiciones.get(asp.planet1);
        const b = posiciones.get(asp.planet2);
        if (!a || !b) continue;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
    }

    // Marca del Ascendente: doble tick en el punto Este
    for (const r of [RADIO_EXTERIOR + 10, RADIO_EXTERIOR + 25]) {
        const [x, y] = punto(asc, r, asc);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }

    return canvas.toBuffer('image/png');
}
