/**
 * Tug of War Mathematics - Service Worker
 * Handles offline caching and resource delivery for the PWA.
 */

// Name of the cache storage
const CACHE_NAME = 'tug-of-war-math-v1';

// List of critical assets to cache for offline use
const ASSETS = [
    '/',
    '/index.html',
    '/src/main.js',
    '/src/style.css',
    '/src/math.js',
    '/src/state.js',
    '/manifest.json'
];

/**
 * INSTALL Event:
 * Opens the cache and stores all the specified assets.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching assets');
            return cache.addAll(ASSETS);
        })
    );
});

/**
 * FETCH Event:
 * Intercepts network requests. 
 * Serves from cache if available, otherwise falls back to network.
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response OR fetch from network
            return response || fetch(event.request);
        })
    );
});
