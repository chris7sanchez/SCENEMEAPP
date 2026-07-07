// SERVICE WORKER AUTODESTRUCTIVO
// La app ya no usa service worker, pero los dispositivos que instalaron la PWA
// antigua siguen teniendo el SW viejo sirviendo una versión cacheada y rota.
// Como /sw.js daba 404, el navegador nunca podía actualizarlo. Este archivo
// se instala en su lugar, borra todas las cachés, se desinstala y recarga
// la app real desde la red. (Patrón estándar "self-destroying service worker".)
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (e) { /* seguir aunque falle el borrado de caché */ }
        try { await self.registration.unregister(); } catch (e) { }
        try {
            const clients = await self.clients.matchAll({ type: 'window' });
            clients.forEach((client) => client.navigate(client.url));
        } catch (e) { }
    })());
});
// Sin manejador de fetch: todas las peticiones van directas a la red.
