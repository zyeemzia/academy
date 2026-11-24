/* ZyeemZia Academy: offline support and smart updates.  Copyright © ZyeemZia
 *
 * This file never needs editing for a release. Pages are served from the cache
 * at once (fast, and they open with no signal), then refreshed from the network
 * in the background. When the fresh page differs from the cached one, the page
 * is told and offers "Update now"; the new copy is already saved, so a reload is
 * the whole update. Styles and scripts are network-first, so they are always
 * current when online. Only this origin and only GET requests are touched.
 * Recovery: open any page with ?nosw=1. */
const CACHE = 'zz-academy-v7';
const SHELL = ['/', '/index.html', '/style.css', '/app.js', '/data-academy.js', '/zz-app.js',
  '/manifest.webmanifest', '/favicon.ico', '/favicon-32.png', '/icon-192.png', '/icon-512.png',
  '/icon-maskable-512.png', '/apple-touch-icon.png', '/img/z-mark.webp', '/404.html'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('zz-academy-') && n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

const isDoc = req => req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

async function tell(msg) {
  const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  cs.forEach(c => c.postMessage(msg));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isDoc(req)) {
    const key = url.pathname === '/' ? '/index.html' : url.pathname;
    /* Both promises start now, and waitUntil is called synchronously: called
       later, from inside an async callback, browsers may refuse it and stop the
       worker before the refresh is saved. */
    const cache = caches.open(CACHE);
    const cachedP = cache.then(c => c.match(key, { ignoreSearch: true })).then(r => r || null, () => null);
    /* The copy to compare is read now, before the cached response is handed to
       the browser: once its body has been sent it can no longer be read. */
    const oldText = cachedP.then(r => (r ? r.clone().text() : null), () => null);
    const fresh = (async () => {
      try {
        const res = await fetch(key, { cache: 'no-store', credentials: 'same-origin' });
        if (!res || !res.ok) return res && res.status === 404 ? res : null;
        const c = await cache;
        const a = await res.clone().text();
        const b = await oldText;
        if (a !== b) await c.put(key, new Response(a, { headers: { 'Content-Type': res.headers.get('Content-Type') || 'text/html; charset=utf-8' } }));
        if (b !== null && a !== b) await tell({ type: 'sw-update' });
        return res;
      } catch { return null; }
    })();
    e.waitUntil(fresh);
    e.respondWith((async () => {
      const cached = await cachedP;
      if (cached) return cached;
      const c = await cache;
      return (await fresh) || (await c.match('/index.html')) ||
        new Response('<h1>Offline</h1><p>Open ZyeemZia Academy once while online.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') c.put(req, res.clone());
      return res;
    } catch {
      return (await c.match(req, { ignoreSearch: true })) || Response.error();
    }
  })());
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'skip-waiting') self.skipWaiting(); });
