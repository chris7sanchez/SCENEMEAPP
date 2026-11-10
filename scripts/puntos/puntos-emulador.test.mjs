import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

// Los puntos, contra un Firestore de verdad (el emulador): comprueba las
// consultas, el recuento y que un canje no se pueda gastar dos veces.
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-puntos';

const { admin, ensureAdmin } = await import('@/lib/firebase-admin');
const { leerActividad, resumenDe, canjear, cambiarEstadoCanje, listarCanjesAdmin, NoSePuedeCanjear } = await import('@/lib/puntos-servidor');
const { PUNTOS, PREMIOS } = await import('@/lib/puntos');

let db;
beforeAll(() => { ensureAdmin(); db = admin.firestore(); });
beforeEach(async () => {
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-puntos/databases/(default)/documents`, { method: 'DELETE' });
});

const YO = { uid: 'yo', email: 'yo@x.com' };
let n = 0;
async function toma(uid, extra = {}) {
  const ref = await db.collection('comunidad').add({ uid, autor: uid, fecha: '2026-11-10', titulo: 'T', downloadURL: 'https://firebasestorage.googleapis.com/x', creado: Date.now() + (n++), bravos: 0, ...extra });
  return ref;
}
const bravo = (ref, votante) => ref.collection('bravos').doc(votante).set({ creado: Date.now() });
const comentario = (ref, uid, texto) => ref.collection('comentarios').add({ uid, autor: uid, texto, creado: Date.now() });

describe('leerActividad', () => {
  it('cuenta tomas por día real, bravos de otros y un comentario por toma ajena', async () => {
    const mia1 = await toma('yo');
    const mia2 = await toma('yo', { fecha: '2020-01-01' }); // fecha falseada: el día lo pone el servidor
    await bravo(mia1, 'yo'); await bravo(mia1, 'ana'); await bravo(mia1, 'luis');
    await bravo(mia2, 'ana');
    // El contador escrito a mano no cuenta: sólo los bravos de la subcolección.
    await mia2.update({ bravos: 9999 });

    const deAna = await toma('ana');
    const deLuis = await toma('luis');
    await comentario(deAna, 'yo', 'Me creo el silencio del principio.');
    await comentario(deAna, 'yo', 'Y otra cosa más que añado después.');
    await comentario(deLuis, 'yo', 'ok');
    await comentario(mia1, 'yo', 'Comentarme a mí mismo no da puntos.');
    await comentario(deLuis, 'ana', 'Este comentario es de otra persona.');

    const a = await leerActividad('yo');
    expect(a).toEqual({ diasConToma: 1, bravosRecibidos: 3, comentarios: 1 });
  });

  it('quien no ha hecho nada tiene cero', async () => {
    await toma('ana');
    expect(await leerActividad('yo')).toEqual({ diasConToma: 0, bravosRecibidos: 0, comentarios: 0 });
  });
});

describe('canjear', () => {
  async function conPuntos(bravos) {
    const mia = await toma('yo');
    await Promise.all(Array.from({ length: bravos }, (_, i) => bravo(mia, `fan${i}`)));
    return mia;
  }

  it('sin puntos suficientes no deja', async () => {
    await conPuntos(3);
    await expect(canjear(YO, 'd5')).rejects.toMatchObject({ motivo: 'saldo' });
    expect((await listarCanjesAdmin()).length).toBe(0);
  });

  it('canjea, descuenta los puntos y deja un código para el admin', async () => {
    await conPuntos(75); // 10 de la toma + 150 de bravos
    const antes = await resumenDe('yo');
    expect(antes.saldo).toBe(PUNTOS.toma + 75 * PUNTOS.bravo);

    const r = await canjear(YO, 'd5');
    expect(r.saldo).toBe(antes.saldo - PREMIOS[0].puntos);
    expect(r.canjes).toHaveLength(1);
    expect(r.canjes[0]).toMatchObject({ estado: 'pendiente', descuento: 5 });
    expect(r.canjes[0].codigo).toMatch(/^SM-[A-Z2-9]{6}$/);

    const [enPanel] = await listarCanjesAdmin();
    expect(enPanel).toMatchObject({ email: 'yo@x.com', codigo: r.canjes[0].codigo, ganados: antes.saldo });
    expect(enPanel.actividad).toEqual({ diasConToma: 1, bravosRecibidos: 75, comentarios: 0 });
  });

  it('con un descuento pendiente no se pide otro; al usarlo, sí', async () => {
    await conPuntos(300);
    const r = await canjear(YO, 'd5');
    await expect(canjear(YO, 'd5')).rejects.toBeInstanceOf(NoSePuedeCanjear);
    await cambiarEstadoCanje(r.canjes[0].id, 'usado');
    const r2 = await canjear(YO, 'd10');
    expect(r2.canjes).toHaveLength(2);
    expect(r2.saldo).toBe(PUNTOS.toma + 300 * PUNTOS.bravo - 150 - 300);
  });

  it('anular un canje devuelve los puntos', async () => {
    await conPuntos(75);
    const r = await canjear(YO, 'd5');
    await cambiarEstadoCanje(r.canjes[0].id, 'anulado');
    expect((await resumenDe('yo')).saldo).toBe(PUNTOS.toma + 75 * PUNTOS.bravo);
  });

  it('dos toques a la vez sólo gastan una vez', async () => {
    await conPuntos(300);
    const dos = await Promise.allSettled([canjear(YO, 'd5'), canjear(YO, 'd5')]);
    expect(dos.filter(x => x.status === 'fulfilled')).toHaveLength(1);
    expect(await listarCanjesAdmin()).toHaveLength(1);
  });

  it('un premio inventado no existe', async () => {
    await conPuntos(300);
    await expect(canjear(YO, 'todo-gratis')).rejects.toMatchObject({ motivo: 'premio' });
  });
});
