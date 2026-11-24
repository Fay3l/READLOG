// Service worker minimal de ReadLog.
// Rôle : rendre l'app installable (PWA) et garder une copie de la page d'accueil et des
// fichiers statiques pour que l'app s'ouvre même avec un réseau capricieux.
// Les appels à l'API ne sont JAMAIS mis en cache : les données restent toujours à jour.
const CACHE = 'readlog-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.webmanifest'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // supprime les anciennes versions du cache
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Uniquement les GET de notre propre site (pas l'API, qui est sur un autre sous-domaine)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Pages : réseau d'abord, page d'accueil en cache si hors ligne
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }
  if (url.pathname.startsWith('/_expo/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    // Fichiers statiques versionnés (leur nom contient un hash) : cache d'abord
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return res;
      }))
    );
  }
});
