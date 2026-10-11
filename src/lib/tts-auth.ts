// Quién pide la voz. El cliente manda `Authorization: Bearer <ID token de
// Firebase>`; aquí se verifica. Cualquier fallo es "sin sesión", nunca un 500.

export type Verificador = (token: string) => Promise<{ uid: string }>;

export async function uidDeLaPeticion(req: Request, verificar: Verificador | null): Promise<string | null> {
    const cabecera = req.headers.get('authorization') || '';
    const m = /^Bearer\s+(.+)$/i.exec(cabecera);
    if (!m || !verificar) return null;
    try {
        return (await verificar(m[1].trim())).uid || null;
    } catch {
        return null;
    }
}
