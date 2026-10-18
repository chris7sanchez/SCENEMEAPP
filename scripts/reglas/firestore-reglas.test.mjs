import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';

let env;
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-reglas', firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: '127.0.0.1', port: 8080 } });
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const ana = () => env.authenticatedContext('ana', { email: 'ana@x.com' }).firestore();
const bea = () => env.authenticatedContext('bea', { email: 'bea@x.com' }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const adminDb = () => env.authenticatedContext('admin-dashboard').firestore();
const URL_OK = 'https://firebasestorage.googleapis.com/v0/b/x/o/v.mp4?alt=media&token=1';
const escena = { title: 'T', synopsis: 'S', characters: ['A', 'B'], lines: [{ character: 'A', text: 'hola' }] };
const post = (uid) => ({ uid, autor: 'Ana', fecha: '2026-10-18', titulo: 'T', downloadURL: URL_OK, submissionId: 's1', creado: 1, bravos: 0 });
async function sembrar(path, data) { await env.withSecurityRulesDisabled(async c => { await setDoc(doc(c.firestore(), path), data); }); }

async function bravo(db, postId, uid) {
  const postRef = doc(db, 'comunidad', postId); const mio = doc(db, 'comunidad', postId, 'bravos', uid);
  return runTransaction(db, async (tx) => {
    const [p, ya] = await Promise.all([tx.get(postRef), tx.get(mio)]);
    const actual = p.data()?.bravos ?? 0;
    if (ya.exists()) { tx.delete(mio); tx.update(postRef, { bravos: Math.max(0, actual - 1) }); return false; }
    tx.set(mio, { creado: Date.now() }); tx.update(postRef, { bravos: actual + 1 }); return true;
  });
}

describe('lo que la app hace de verdad SIGUE funcionando', () => {
  it('users: perfil y subcolecciones propias', async () => {
    await assertSucceeds(setDoc(doc(ana(), 'users/ana'), { email: 'ana@x.com', createdAt: 'x', provider: 'password' }));
    await assertSucceeds(setDoc(doc(ana(), 'users/ana/estudios/ensayos'), { items: [], actualizado: 1 }));
    await assertSucceeds(addDoc(collection(ana(), 'users/ana/submissions'), { date: 'd', downloadURL: URL_OK }));
    await assertFails(setDoc(doc(bea(), 'users/ana'), { email: 'x' }));
  });
  it('dailyScenes: crear la del día', async () => {
    await assertSucceeds(setDoc(doc(ana(), 'dailyScenes/2026-10-18'), { scene: escena, createdAt: Date.now() }));
    await assertSucceeds(getDoc(doc(anon(), 'dailyScenes/2026-10-18')));
  });
  it('comunidad: publicar, comentar, bravo y quitar bravo, retirar', async () => {
    const ref = await assertSucceeds(addDoc(collection(ana(), 'comunidad'), post('ana')));
    await assertSucceeds(bravo(bea(), ref.id, 'bea'));
    await assertSucceeds(bravo(bea(), ref.id, 'bea'));
    await assertSucceeds(bravo(ana(), ref.id, 'ana'));
    await assertSucceeds(addDoc(collection(bea(), `comunidad/${ref.id}/comentarios`), { uid: 'bea', autor: 'Bea', texto: 'bien', creado: 1 }));
    await assertSucceeds(setDoc(doc(bea(), 'reportes/r1'), { postId: ref.id, comentarioId: null, tipo: 'p', denunciante: 'bea', motivo: 'm', creado: 1, recibido: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(ana(), 'comunidad', ref.id)));
  });
  it('quitar un bravo cuando el contador ya está en 0', async () => {
    await sembrar('comunidad/p0', post('ana'));
    await sembrar('comunidad/p0/bravos/bea', { creado: 1 });
    await assertSucceeds(bravo(bea(), 'p0', 'bea'));
  });
  it('orders: pedido con sesión; el admin los lee', async () => {
    await assertSucceeds(addDoc(collection(ana(), 'orders'), { genre: 'x', contact: { name: 'a', email: 'a@x', phone: '1' }, userId: 'ana', status: 'deposit_paid', createdAt: serverTimestamp(), totalAmount: 300, depositAmount: 0, remainingAmount: 300, paymentMethod: 'card', shootDates: [], preferredMonths: [] }));
    await assertSucceeds(getDoc(doc(adminDb(), 'orders/x')));
  });
});

describe('lo que NO debe poderse', () => {
  it('reescribir la escena del día ya creada', async () => {
    await sembrar('dailyScenes/2026-10-18', { scene: escena, createdAt: 1 });
    await assertFails(setDoc(doc(bea(), 'dailyScenes/2026-10-18'), { scene: { ...escena, title: 'HACKEADO' }, createdAt: 2 }));
    await assertFails(deleteDoc(doc(bea(), 'dailyScenes/2026-10-18')));
  });
  it('crear escena con campos raros o sin sesión', async () => {
    await assertFails(setDoc(doc(anon(), 'dailyScenes/2026-10-19'), { scene: escena, createdAt: 1 }));
    await assertFails(setDoc(doc(ana(), 'dailyScenes/2026-10-19'), { scene: escena, createdAt: 1, extra: '<script>' }));
    await assertFails(setDoc(doc(ana(), 'dailyScenes/hola'), { scene: escena, createdAt: 1 }));
  });
  it('poner bravos a mano', async () => {
    await sembrar('comunidad/p1', post('ana'));
    await assertFails(updateDoc(doc(bea(), 'comunidad/p1'), { bravos: 99999 }));
    await assertFails(updateDoc(doc(ana(), 'comunidad/p1'), { bravos: 99999 }));
    await assertFails(updateDoc(doc(bea(), 'comunidad/p1'), { bravos: 1 }));
  });
  it('el dueño reescribe su publicación (uid, vídeo)', async () => {
    await sembrar('comunidad/p2', post('ana'));
    await assertFails(updateDoc(doc(ana(), 'comunidad/p2'), { uid: 'bea' }));
    await assertFails(updateDoc(doc(ana(), 'comunidad/p2'), { downloadURL: 'https://malo.com/x' }));
  });
  it('publicar con bravos inflados, en nombre de otro o con vídeo de fuera', async () => {
    await assertFails(addDoc(collection(ana(), 'comunidad'), { ...post('ana'), bravos: 500 }));
    await assertFails(addDoc(collection(ana(), 'comunidad'), post('bea')));
    await assertFails(addDoc(collection(ana(), 'comunidad'), { ...post('ana'), downloadURL: 'https://malo.com/v.mp4' }));
  });
  it('comentario gigante', async () => {
    await sembrar('comunidad/p3', post('ana'));
    await assertFails(addDoc(collection(bea(), 'comunidad/p3/comentarios'), { uid: 'bea', autor: 'B', texto: 'x'.repeat(1201), creado: 1 }));
  });
  it('pedidos sin sesión, en nombre de otro o leer los de otros', async () => {
    const base = { userId: 'ana', status: 'deposit_paid', totalAmount: 1 };
    await assertFails(addDoc(collection(anon(), 'orders'), base));
    await assertFails(addDoc(collection(bea(), 'orders'), base));
    await assertFails(addDoc(collection(ana(), 'orders'), { ...base, status: 'completed' }));
    await assertFails(getDoc(doc(ana(), 'orders/x')));
  });
});
