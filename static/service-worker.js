/**
 * Service Worker for Cache Management
 *
 * Ensures users always get fresh API data by:
 * 1. Never caching API routes
 * 2. Using network-first for HTML pages
 * 3. Respecting ETag headers for validation
 */

/* global self, caches */

const CACHE_NAME = 'interactive-cd-v1'
const API_ROUTES = ['/api/']
const HTML_ROUTES = ['/']

// Install event - clean up old caches
self.addEventListener('install', () => {
	self.skipWaiting()
})

// Activate event - claim all clients
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames
					.filter(cacheName => cacheName !== CACHE_NAME)
					.map(cacheName => caches.delete(cacheName))
			)
		})
	)
	return self.clients.claim()
})

// Fetch event - intercept and handle requests
self.addEventListener('fetch', event => {
	const url = new URL(event.request.url)

	// Never cache API routes - always use network with ETag validation
	if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
		event.respondWith(
			fetch(event.request, {
				headers: {
					...event.request.headers,
					// Force revalidation even if cached
					'Cache-Control': 'no-cache'
				}
			})
		)
		return
	}

	// Network-first for HTML pages to get latest version
	if (
		event.request.mode === 'navigate' ||
		HTML_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route))
	) {
		event.respondWith(
			fetch(event.request)
				.then(response => {
					// Clone the response before caching
					const responseToCache = response.clone()

					// Cache the HTML for offline fallback
					caches.open(CACHE_NAME).then(cache => {
						cache.put(event.request, responseToCache)
					})

					return response
				})
				.catch(() => {
					// Fallback to cache if offline
					return caches.match(event.request)
				})
		)
		return
	}

	// For all other resources (CSS, JS, images), use cache-first
	event.respondWith(
		caches.match(event.request).then(cachedResponse => {
			if (cachedResponse) {
				return cachedResponse
			}

			return fetch(event.request).then(response => {
				// Don't cache if not a success response
				if (!response || response.status !== 200 || response.type === 'error') {
					return response
				}

				const responseToCache = response.clone()

				caches.open(CACHE_NAME).then(cache => {
					cache.put(event.request, responseToCache)
				})

				return response
			})
		})
	)
})
