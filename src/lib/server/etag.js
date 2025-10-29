/**
 * ETag utility for API response caching
 *
 * Generates ETags based on response content to enable automatic cache invalidation
 * when data changes, while still benefiting from HTTP caching.
 */
import { createHash } from 'crypto'
import { dev } from '$app/environment'

/**
 * Generate an ETag from response data
 * @param {any} data - The data to hash
 * @returns {string} ETag value
 */
export function generateETag(data) {
	const content = JSON.stringify(data)
	const hash = createHash('md5').update(content).digest('hex')
	return `"${hash}"`
}

/**
 * Get cache control header based on environment
 * @param {number} maxAge - Cache duration in seconds (default: 3600)
 * @returns {string} Cache-Control header value
 */
export function getCacheControl(maxAge = 3600) {
	// In development, disable caching to avoid stale data issues
	if (dev) {
		return 'no-cache, no-store, must-revalidate'
	}

	// In production, use aggressive caching with ETag validation
	return `public, max-age=${maxAge}, must-revalidate`
}

/**
 * Check if client's cached version matches current ETag
 * @param {Request} request - The incoming request
 * @param {string} currentETag - The current ETag value
 * @returns {boolean} True if ETags match (cache is fresh)
 */
export function isCacheFresh(request, currentETag) {
	const clientETag = request.headers.get('if-none-match')
	return clientETag === currentETag
}
