// Service Worker for Interactive CD PWA
// Version 1.0.0

const CACHE_NAME = 'interactive-cd-v1'
const RUNTIME_CACHE = 'runtime-cache-v1'
const API_CACHE = 'api-cache-v1'
const IMAGE_CACHE = 'image-cache-v1'
const FONT_CACHE = 'font-cache-v1'

// Assets to cache on install
const PRECACHE_ASSETS = ['/', '/offline', '/manifest.webmanifest', '/images/logo.png']

// Install event - cache critical assets
self.addEventListener('install', event => {
	console.log('[SW] Install event')
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(cache => {
				console.log('[SW] Precaching assets')
				return cache.addAll(PRECACHE_ASSETS)
			})
			.then(() => {
				return self.skipWaiting()
			})
	)
})

// Listen for SKIP_WAITING message
self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
	console.log('[SW] Activate event')
	event.waitUntil(
		caches
			.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames
						.filter(
							name =>
								name !== CACHE_NAME &&
								name !== RUNTIME_CACHE &&
								name !== API_CACHE &&
								name !== IMAGE_CACHE &&
								name !== FONT_CACHE
						)
						.map(name => {
							console.log('[SW] Deleting old cache:', name)
							return caches.delete(name)
						})
				)
			})
			.then(() => {
				return self.clients.claim()
			})
	)
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
	const { request } = event
	const url = new URL(request.url)

	// Skip non-GET requests
	if (request.method !== 'GET') {
		return
	}

	// Google Fonts - Cache First
	if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
		event.respondWith(cacheFirst(request, FONT_CACHE))
		return
	}

	// API requests - Network First
	if (url.pathname.startsWith('/api/practices/')) {
		event.respondWith(networkFirst(request, API_CACHE, 10000)) // 10s timeout
		return
	}

	// Images - Cache First
	if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(url.pathname)) {
		event.respondWith(cacheFirst(request, IMAGE_CACHE))
		return
	}

	// JS, CSS, fonts - Stale While Revalidate
	if (
		request.destination === 'script' ||
		request.destination === 'style' ||
		request.destination === 'font' ||
		/\.(js|css|woff|woff2)$/i.test(url.pathname)
	) {
		event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
		return
	}

	// HTML pages - Network First
	if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
		event.respondWith(networkFirst(request, RUNTIME_CACHE, 5000)) // 5s timeout
		return
	}

	// Default - Network First
	event.respondWith(networkFirst(request, RUNTIME_CACHE))
})

// Cache First strategy
async function cacheFirst(request, cacheName) {
	const cachedResponse = await caches.match(request)
	if (cachedResponse) {
		console.log('[SW] Cache hit:', request.url)
		return cachedResponse
	}

	console.log('[SW] Cache miss, fetching:', request.url)
	const response = await fetch(request)

	if (response.ok) {
		const cache = await caches.open(cacheName)
		cache.put(request, response.clone())
	}

	return response
}

// Network First strategy with timeout
async function networkFirst(request, cacheName, timeout = 5000) {
	try {
		const response = await fetchWithTimeout(request, timeout)

		if (response.ok) {
			const cache = await caches.open(cacheName)
			cache.put(request, response.clone())
		}

		return response
	} catch (error) {
		console.log('[SW] Network failed, trying cache:', request.url)
		const cachedResponse = await caches.match(request)

		if (cachedResponse) {
			return cachedResponse
		}

		// Return offline page or error response
		if (request.destination === 'document') {
			const cache = await caches.open(CACHE_NAME)
			const offlineResponse = await cache.match('/offline')
			if (offlineResponse) {
				return offlineResponse
			}
		}

		throw error
	}
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
	const cachedResponse = await caches.match(request)

	const fetchPromise = fetch(request).then(response => {
		if (response.ok) {
			const cache = caches.open(cacheName)
			cache.then(c => c.put(request, response.clone()))
		}
		return response
	})

	return cachedResponse || fetchPromise
}

// Fetch with timeout helper
function fetchWithTimeout(request, timeout) {
	return Promise.race([
		fetch(request),
		new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeout))
	])
}
