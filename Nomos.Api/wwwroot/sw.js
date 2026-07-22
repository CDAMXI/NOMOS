// Service worker NETWORK-FIRST: siempre intenta la red primero y solo cae a la caché si no hay
// conexión. Así los despliegues se recogen al instante (adiós al "refresca/reancla") y la app
// sigue abriendo offline con la última versión vista. La API nunca se cachea.
const CACHE = 'pluto-v3';
const ASSETS = ['/', '/index.html', '/styles.css', '/manifest.json', '/icon.svg',
  '/js/i18n.js', '/js/format.js', '/js/categories.js', '/js/net.js', '/js/charts.js',
  '/js/state.js', '/js/views.js', '/js/sheet.js', '/js/sheets.js',
  '/js/profile.js', '/js/auth.js', '/js/main.js'];

self.addEventListener('install', event => {
  self.skipWaiting(); // el SW nuevo toma el control sin esperar a que se cierren las pestañas
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;                       // POST/PUT/DELETE: sin tocar
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // recursos de otros orígenes: sin tocar
  if (url.pathname.startsWith('/api/')) return;           // la API siempre a la red, sin caché

  event.respondWith((async () => {
    try {
      const res = await fetch(req);                       // red primero
      if (res && res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
      }
      return res;
    } catch {
      // Sin conexión: sirve la última versión cacheada (o el index para navegaciones).
      const cached = await caches.match(req);
      return cached || (req.mode === 'navigate' ? caches.match('/index.html') : Response.error());
    }
  })());
});
