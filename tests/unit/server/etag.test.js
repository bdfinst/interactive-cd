import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateETag, getCacheControl, isCacheFresh } from '$lib/server/etag.js'

describe('ETag Utilities', () => {
	describe('generateETag', () => {
		it('generates consistent ETags for identical data', () => {
			const data = { id: 1, name: 'Test' }
			const etag1 = generateETag(data)
			const etag2 = generateETag(data)

			expect(etag1).toBe(etag2)
		})

		it('generates different ETags for different data', () => {
			const data1 = { id: 1, name: 'Test1' }
			const data2 = { id: 2, name: 'Test2' }

			const etag1 = generateETag(data1)
			const etag2 = generateETag(data2)

			expect(etag1).not.toBe(etag2)
		})

		it('wraps hash in double quotes (HTTP ETag format)', () => {
			const data = { test: 'data' }
			const etag = generateETag(data)

			expect(etag).toMatch(/^"[a-f0-9]+"$/)
		})

		it('generates ETags for complex nested objects', () => {
			const data = {
				root: {
					id: 'test',
					dependencies: [
						{ id: 'dep1', maturityLevel: 1 },
						{ id: 'dep2', maturityLevel: 2 }
					]
				}
			}

			const etag = generateETag(data)
			expect(etag).toBeTruthy()
			expect(typeof etag).toBe('string')
		})

		it('generates different ETags when nested data changes', () => {
			const data1 = {
				practice: { id: 'test', maturityLevel: 1 }
			}
			const data2 = {
				practice: { id: 'test', maturityLevel: 2 }
			}

			const etag1 = generateETag(data1)
			const etag2 = generateETag(data2)

			expect(etag1).not.toBe(etag2)
		})
	})

	describe('getCacheControl', () => {
		it('returns appropriate cache control header', () => {
			const cacheControl = getCacheControl()

			// Should return a valid Cache-Control header
			expect(cacheControl).toBeTruthy()
			expect(typeof cacheControl).toBe('string')

			// In development mode: no-cache
			// In production mode: public with max-age
			const isNoCacheMode = cacheControl.includes('no-cache')
			const isCacheMode = cacheControl.includes('public') && cacheControl.includes('max-age')

			// Should be one or the other
			expect(isNoCacheMode || isCacheMode).toBe(true)
		})

		it('accepts custom max-age parameter', () => {
			const cacheControl = getCacheControl(7200)

			expect(cacheControl).toBeTruthy()
			expect(typeof cacheControl).toBe('string')

			// In production, should use custom max-age if provided
			// In development, will be no-cache regardless
			const hasCustomMaxAge = cacheControl.includes('max-age=7200')
			const isNoCacheMode = cacheControl.includes('no-cache')

			expect(hasCustomMaxAge || isNoCacheMode).toBe(true)
		})

		it('includes must-revalidate directive when caching is enabled', () => {
			const cacheControl = getCacheControl()

			// If caching is enabled (production), should have must-revalidate
			// If no-cache (development), that's also acceptable
			const hasMustRevalidate = cacheControl.includes('must-revalidate')

			expect(hasMustRevalidate).toBe(true)
		})
	})

	describe('isCacheFresh', () => {
		it('returns true when ETags match', () => {
			const etag = '"abc123"'
			const request = new Request('http://localhost', {
				headers: {
					'if-none-match': etag
				}
			})

			expect(isCacheFresh(request, etag)).toBe(true)
		})

		it('returns false when ETags do not match', () => {
			const currentETag = '"abc123"'
			const clientETag = '"xyz789"'
			const request = new Request('http://localhost', {
				headers: {
					'if-none-match': clientETag
				}
			})

			expect(isCacheFresh(request, currentETag)).toBe(false)
		})

		it('returns false when no If-None-Match header present', () => {
			const etag = '"abc123"'
			const request = new Request('http://localhost')

			expect(isCacheFresh(request, etag)).toBe(false)
		})

		it('returns false when If-None-Match header is empty', () => {
			const etag = '"abc123"'
			const request = new Request('http://localhost', {
				headers: {
					'if-none-match': ''
				}
			})

			expect(isCacheFresh(request, etag)).toBe(false)
		})
	})

	describe('Integration: Full ETag flow', () => {
		it('detects cache invalidation when data changes', () => {
			// Initial data
			const data1 = { id: 1, maturityLevel: 1 }
			const etag1 = generateETag(data1)

			// Client makes request with old ETag
			const request = new Request('http://localhost', {
				headers: {
					'if-none-match': etag1
				}
			})

			// Data changes (maturity level updated)
			const data2 = { id: 1, maturityLevel: 2 }
			const etag2 = generateETag(data2)

			// ETags should be different
			expect(etag1).not.toBe(etag2)

			// Cache should not be fresh
			expect(isCacheFresh(request, etag2)).toBe(false)
		})

		it('serves from cache when data has not changed', () => {
			const data = { id: 1, maturityLevel: 1 }
			const etag = generateETag(data)

			// Client makes request with current ETag
			const request = new Request('http://localhost', {
				headers: {
					'if-none-match': etag
				}
			})

			// Cache should be fresh
			expect(isCacheFresh(request, etag)).toBe(true)
		})
	})
})
