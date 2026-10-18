import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { ref, uploadBytes, getBytes } from 'firebase/storage';
import { readFileSync } from 'node:fs';
import { describe, it, beforeAll, afterAll } from 'vitest';
let env;
beforeAll(async () => { env = await initializeTestEnvironment({ projectId: 'demo-reglas', storage: { rules: readFileSync(new URL('../../storage.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 9199 } }); });
afterAll(() => env.cleanup());
const st = (uid) => uid ? env.authenticatedContext(uid).storage() : env.unauthenticatedContext().storage();
const b = new Uint8Array([1,2,3]);
describe('storage', () => {
  it('lo legítimo funciona', async () => {
    await assertSucceeds(uploadBytes(ref(st('ana'), 'submissions/ana/2026-10-18/1_toma.mp4'), b, { contentType: 'video/mp4' }));
    await assertSucceeds(uploadBytes(ref(st('ana'), 'submissions/ana/2026-10-18/2_toma.mov'), b, { contentType: 'video/quicktime' }));
    await assertSucceeds(uploadBytes(ref(st('ana'), 'users/ana/avatar.jpg'), b, { contentType: 'image/jpeg' }));
    await assertSucceeds(uploadBytes(ref(st('ana'), 'users/ana/videos/v.mkv'), b));
    await assertSucceeds(uploadBytes(ref(st('ana'), 'users/ana/scenes/s1/script_g.pdf'), b, { contentType: 'application/pdf' }));
    await assertSucceeds(getBytes(ref(st('bea'), 'submissions/ana/2026-10-18/1_toma.mp4')));
  });
  it('lo que no', async () => {
    await assertFails(uploadBytes(ref(st('bea'), 'submissions/ana/2026-10-18/x.mp4'), b, { contentType: 'video/mp4' }));
    await assertFails(uploadBytes(ref(st('bea'), 'users/ana/avatar.jpg'), b, { contentType: 'image/jpeg' }));
    await assertFails(uploadBytes(ref(st(null), 'users/ana/x.jpg'), b, { contentType: 'image/jpeg' }));
    await assertFails(uploadBytes(ref(st('ana'), 'users/ana/pagina.html'), b, { contentType: 'text/html' }));
    await assertFails(uploadBytes(ref(st('ana'), 'otra/cosa.jpg'), b, { contentType: 'image/jpeg' }));
    await assertFails(getBytes(ref(st(null), 'submissions/ana/2026-10-18/1_toma.mp4')));
  });
});
