/**
 * Memoization utility - caches function results based on arguments
 * Following functional programming principles from CLAUDE.md
 */

/**
 * Memoize a function - caches results based on serialized arguments
 * @param {Function} func - The function to memoize
 * @param {Function} keyGenerator - Optional function to generate cache key from arguments
 * @returns {Function} Memoized version of the function
 *
 * @example
 * const expensiveCalc = (a, b) => {
 *   // expensive operation
 *   return a * b
 * }
 * const memoized = memoize(expensiveCalc)
 * memoized(5, 10) // calculates
 * memoized(5, 10) // returns cached result
 */
export const memoize = (func, keyGenerator = null) => {
	const cache = new Map()

	return function memoized(...args) {
		// Generate cache key
		const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

		// Return cached result if available
		if (cache.has(key)) {
			return cache.get(key)
		}

		// Calculate and cache result
		const result = func.apply(this, args)
		cache.set(key, result)

		return result
	}
}

/**
 * Memoize with expiration - caches results with time-to-live
 * @param {Function} func - The function to memoize
 * @param {number} ttl - Time to live in milliseconds
 * @param {Function} keyGenerator - Optional function to generate cache key
 * @returns {Function} Memoized version with TTL
 */
export const memoizeWithTTL = (func, ttl = 5000, keyGenerator = null) => {
	const cache = new Map()
	const timestamps = new Map()

	return function memoized(...args) {
		const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
		const now = Date.now()

		// Check if cache entry exists and is not expired
		if (cache.has(key)) {
			const timestamp = timestamps.get(key)
			if (now - timestamp < ttl) {
				return cache.get(key)
			}
			// Expired - remove from cache
			cache.delete(key)
			timestamps.delete(key)
		}

		// Calculate and cache result with timestamp
		const result = func.apply(this, args)
		cache.set(key, result)
		timestamps.set(key, now)

		return result
	}
}

/**
 * Memoize with max cache size - LRU (Least Recently Used) cache
 * @param {Function} func - The function to memoize
 * @param {number} maxSize - Maximum number of cached entries
 * @param {Function} keyGenerator - Optional function to generate cache key
 * @returns {Function} Memoized version with size limit
 */
export const memoizeWithLimit = (func, maxSize = 100, keyGenerator = null) => {
	const cache = new Map()

	return function memoized(...args) {
		const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

		// If key exists, delete and re-add to make it most recent
		if (cache.has(key)) {
			const value = cache.get(key)
			cache.delete(key)
			cache.set(key, value)
			return value
		}

		// If cache is full, delete oldest entry (first in Map)
		if (cache.size >= maxSize) {
			const firstKey = cache.keys().next().value
			cache.delete(firstKey)
		}

		// Calculate and cache result
		const result = func.apply(this, args)
		cache.set(key, result)

		return result
	}
}

/**
 * Clear all caches for a memoized function
 * Note: This requires the memoized function to expose a clear method
 * @param {Function} memoizedFunc - The memoized function
 */
export const clearMemoCache = memoizedFunc => {
	if (memoizedFunc.cache && memoizedFunc.cache.clear) {
		memoizedFunc.cache.clear()
	}
}
