/**
 * Somiti 360 - Enterprise Service Worker (v2.1.0)
 * ------------------------------------------------
 * Offline-first hybrid app shell caching, assets persistence,
 * and background sync management.
 *
 * Rules:
 * 1. Cache App Shell & Static assets (HTML, CSS, JS, Fonts, Icons)
 * 2. NEVER cache authenticated / private financial /api/ responses in HTTP cache
 * 3. Automatic old cache cleanup on activation
 */

const CACHE_NAME = 'somiti360-shell-v2.1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/logo-512.png',
  '/somiti-emblem.svg',
  '/shopnochoa-logo.svg'
];

// 1. Install & Precache Critical Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.info('[ServiceWorker] Pre-caching offline app shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial fail (acceptable in dev):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate & Purge Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.info('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network / Cache Interception
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. Never cache /api/ or Supabase API calls in service worker HTTP cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    return;
  }

  // B. For HTML navigation: Stale-While-Revalidate with network first fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return fallback;
        })
    );
    return;
  }

  // C. For static assets (JS, CSS, images, fonts): Cache-First then Network
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(png|svg|ico|webp|jpg|jpeg|woff|woff2|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});
