// Tope de uso para las acciones de servidor que llaman a la IA.
//
// Una acción de servidor ('use server') es, a efectos prácticos, una dirección
// pública más: cualquiera puede llamarla con un script. Todas las que pagan
// Gemini comparten este contador por IP: 30 llamadas por minuto dan para
// analizar un guion entero con todos sus personajes, y frenan a quien quiera
// usar la app como Gemini gratis.

import { headers } from 'next/headers';
import { limitar } from '@/lib/seguridad';

export async function frenarAccionIA(max = 30, ventanaMs = 60_000): Promise<void> {
    let ip = '';
    try {
        const h = await headers();
        ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || '';
    } catch {
        // Llamada desde otro código del servidor (fuera de una petición): no se cuenta.
        return;
    }
    if (!ip) return;
    if (!limitar(`accion-ia:${ip}`, max, ventanaMs)) {
        throw new Error('Has hecho demasiadas peticiones seguidas. Espera un minuto y vuelve a probar.');
    }
}
