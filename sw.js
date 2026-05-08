/* NEPA Gold — Service Worker
 * App-shell PWA. Versioned cache. Safe offline experience.
 * - HTML: network-first (so updates ship instantly when online)
 * - Same-origin assets: cache-first with background refresh
 * - Google Fonts: stale-while-revalidate
 * - gold-api.com (live spot prices): network-only (never cache stale prices)
 */

const VERSION = 'npg-v1.8.0';
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const FONT_CACHE = `fonts-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './favicon.ico',
  './favicon-16.png',
  './favicon-32.png',
  './apple-touch-icon.png',
  './apple-touch-icon-152.png',
  './apple-touch-icon-167.png',
  './mask-icon.svg',
  './404.html',
  './llms.txt',
  './humans.txt',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './icon.svg',
  './og-card.png',
  './og-card.svg'
];

// --- Install: precache the app shell ---------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// --- Activate: clean up old caches -----------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// --- Helpers ---------------------------------------------------------------
const isHTML = (request) =>
  request.mode === 'navigate' ||
  (request.method === 'GET' &&
    request.headers.get('accept') &&
    request.headers.get('accept').includes('text/html'));

const isFont = (url) =>
  url.hostname === 'fonts.googleapis.com' ||
  url.hostname === 'fonts.gstatic.com';

const isLivePrice = (url) => url.hostname === 'api.gold-api.com';

// SEO-critical files: never cache. Search engine crawlers must see the
// live versions every time, never a stale service-worker cache.
const isSEOFile = (url) =>
  url.origin === self.location.origin &&
  /\/(robots\.txt|sitemap\.xml|llms\.txt|humans\.txt)$/i.test(url.pathname);

// --- Fetch strategy --------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1) Live spot prices: never cache. Let the page handle failures gracefully.
  if (isLivePrice(url)) return;

  // 1b) SEO-critical files (robots.txt, sitemap.xml, llms.txt, humans.txt):
  //     never cache. Crawlers must always see the live version.
  if (isSEOFile(url)) return;

  // 2) HTML navigations: network-first with cache fallback.
  if (isHTML(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // 3) Google Fonts: stale-while-revalidate.
  if (isFont(url)) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 4) Same-origin assets: cache-first with background refresh.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 5) Everything else: network with cache fallback.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// --- Allow page to trigger an immediate update -----------------------------
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
