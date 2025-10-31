import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
	encodeAdoptionState,
	decodeAdoptionState,
	getAdoptionStateFromURL,
	updateURLWithAdoptionState
} from '$lib/utils/urlState.js'

describe('urlState', () => {
	let originalLocation

	beforeEach(() => {
		originalLocation = window.location
		delete window.location
		window.location = {
			search: '',
			href: 'http://localhost:5173/',
			pathname: '/'
		}
		// Mock history.replaceState
		window.history.replaceState = () => {}
	})

	afterEach(() => {
		window.location = originalLocation
	})

	describe('encodeAdoptionState', () => {
		it('encodes an empty set to empty string', () => {
			const result = encodeAdoptionState(new Set())
			expect(result).toBe('')
		})

		it('encodes a single practice ID', () => {
			const practiceIds = new Set(['version-control'])
			const result = encodeAdoptionState(practiceIds)

			// Decode to verify
			const decoded = atob(result)
			expect(decoded).toBe('version-control')
		})

		it('encodes multiple practice IDs as comma-separated', () => {
			const practiceIds = new Set(['version-control', 'automated-testing', 'trunk-based-dev'])
			const result = encodeAdoptionState(practiceIds)

			// Decode to verify
			const decoded = atob(result)
			const ids = decoded.split(',').sort()

			expect(ids).toEqual(['automated-testing', 'trunk-based-dev', 'version-control'])
		})

		it('produces URL-safe base64 encoding', () => {
			const practiceIds = new Set(['version-control', 'automated-testing'])
			const result = encodeAdoptionState(practiceIds)

			// Should not contain characters that need URL encoding
			expect(result).toMatch(/^[A-Za-z0-9+/=]*$/)
		})

		it('handles special characters in practice IDs', () => {
			const practiceIds = new Set(['api-management', 'feature-flags'])
			const result = encodeAdoptionState(practiceIds)
			const decoded = decodeAdoptionState(result)

			expect(decoded).toEqual(practiceIds)
		})
	})

	describe('decodeAdoptionState', () => {
		it('decodes empty string to empty set', () => {
			const result = decodeAdoptionState('')
			expect(result).toEqual(new Set())
		})

		it('decodes null to empty set', () => {
			const result = decodeAdoptionState(null)
			expect(result).toEqual(new Set())
		})

		it('decodes undefined to empty set', () => {
			const result = decodeAdoptionState(undefined)
			expect(result).toEqual(new Set())
		})

		it('decodes a single practice ID', () => {
			const encoded = btoa('version-control')
			const result = decodeAdoptionState(encoded)

			expect(result).toEqual(new Set(['version-control']))
		})

		it('decodes multiple comma-separated practice IDs', () => {
			const encoded = btoa('version-control,automated-testing,trunk-based-dev')
			const result = decodeAdoptionState(encoded)

			expect(result).toEqual(new Set(['version-control', 'automated-testing', 'trunk-based-dev']))
		})

		it('handles invalid base64 gracefully', () => {
			// Suppress expected warning from invalid base64
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			const result = decodeAdoptionState('not-valid-base64!')
			expect(result).toEqual(new Set())

			warnSpy.mockRestore()
		})

		it('trims whitespace from decoded IDs', () => {
			const encoded = btoa('version-control, automated-testing , trunk-based-dev')
			const result = decodeAdoptionState(encoded)

			expect(result).toEqual(new Set(['version-control', 'automated-testing', 'trunk-based-dev']))
		})

		it('filters out empty strings', () => {
			const encoded = btoa('version-control,,automated-testing,')
			const result = decodeAdoptionState(encoded)

			expect(result).toEqual(new Set(['version-control', 'automated-testing']))
		})

		it('is inverse of encodeAdoptionState', () => {
			const original = new Set(['version-control', 'automated-testing', 'continuous-integration'])
			const encoded = encodeAdoptionState(original)
			const decoded = decodeAdoptionState(encoded)

			expect(decoded).toEqual(original)
		})
	})

	describe('getAdoptionStateFromURL', () => {
		it('returns null when no adopted parameter exists', () => {
			window.location.search = ''
			const result = getAdoptionStateFromURL()

			expect(result).toBeNull()
		})

		it('returns null when adopted parameter is empty', () => {
			window.location.search = '?adopted='
			const result = getAdoptionStateFromURL()

			expect(result).toBeNull()
		})

		it('returns decoded set when adopted parameter exists', () => {
			const practiceIds = new Set(['version-control', 'automated-testing'])
			const encoded = encodeAdoptionState(practiceIds)
			window.location.search = `?adopted=${encoded}`

			const result = getAdoptionStateFromURL()

			expect(result).toEqual(practiceIds)
		})

		it('handles adopted parameter with other parameters', () => {
			const practiceIds = new Set(['version-control'])
			const encoded = encodeAdoptionState(practiceIds)
			window.location.search = `?feature=practice-adoption&adopted=${encoded}&other=value`

			const result = getAdoptionStateFromURL()

			expect(result).toEqual(practiceIds)
		})

		it('returns empty set for malformed adopted parameter', () => {
			// Suppress expected warning from malformed adopted parameter
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			window.location.search = '?adopted=invalid-base64!'
			const result = getAdoptionStateFromURL()

			expect(result).toEqual(new Set())

			warnSpy.mockRestore()
		})

		it('handles URL-encoded adopted parameter', () => {
			const practiceIds = new Set(['version-control', 'automated-testing'])
			const encoded = encodeAdoptionState(practiceIds)
			window.location.search = `?adopted=${encodeURIComponent(encoded)}`

			const result = getAdoptionStateFromURL()

			expect(result).toEqual(practiceIds)
		})
	})

	describe('updateURLWithAdoptionState', () => {
		it('adds adopted parameter when set is not empty', () => {
			window.location.search = ''
			const practiceIds = new Set(['version-control', 'automated-testing'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(practiceIds)

			expect(capturedURL).toContain('adopted=')
			expect(capturedURL).toContain('?')
		})

		it('does NOT add feature flag parameter (feature param no longer used)', () => {
			window.location.search = ''
			const practiceIds = new Set(['version-control'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(practiceIds)

			// Feature parameter is no longer added to URL
			expect(capturedURL).not.toContain('feature=practice-adoption')
			// Only adopted parameter is added
			expect(capturedURL).toContain('adopted=')
		})

		it('preserves existing feature parameter if present (backward compatibility)', () => {
			window.location.search = '?feature=practice-adoption'
			const practiceIds = new Set(['version-control'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(practiceIds)

			// Feature parameter is preserved but not controlled
			expect(capturedURL).toContain('feature=practice-adoption')
			expect(capturedURL).toContain('adopted=')
		})

		it('removes adopted parameter when set is empty', () => {
			window.location.search = '?adopted=somevalue'

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(new Set(), false)

			expect(capturedURL).not.toContain('adopted')
		})

		it('preserves other URL parameters', () => {
			window.location.search = '?feature=practice-adoption&other=value'
			const practiceIds = new Set(['version-control'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(practiceIds)

			expect(capturedURL).toContain('feature=practice-adoption')
			expect(capturedURL).toContain('other=value')
			expect(capturedURL).toContain('adopted=')
		})

		it('updates existing adopted parameter', () => {
			const oldEncoded = encodeAdoptionState(new Set(['old-practice']))
			window.location.search = `?adopted=${oldEncoded}`

			const newPracticeIds = new Set(['new-practice'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(newPracticeIds)

			expect(capturedURL).toContain('adopted=')
			expect(capturedURL).not.toContain(oldEncoded)
		})

		it('preserves pathname', () => {
			window.location.pathname = '/about'
			window.location.search = ''
			const practiceIds = new Set(['version-control'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(practiceIds)

			expect(capturedURL).toContain('/about')
		})

		it('handles empty set by removing parameter completely', () => {
			window.location.search = '?adopted=somevalue&feature=practice-adoption'

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
			}

			updateURLWithAdoptionState(new Set(), false)

			expect(capturedURL).not.toContain('adopted')
			expect(capturedURL).toContain('feature=practice-adoption')
		})
	})

	describe('Round-trip encoding/decoding', () => {
		it('maintains data integrity through encode/decode cycle', () => {
			const testSets = [
				new Set(),
				new Set(['single']),
				new Set(['one', 'two']),
				new Set(['version-control', 'automated-testing', 'trunk-based-dev']),
				new Set([
					'api-management',
					'feature-flags',
					'database-migrations',
					'continuous-integration'
				])
			]

			testSets.forEach(original => {
				const encoded = encodeAdoptionState(original)
				const decoded = decodeAdoptionState(encoded)
				expect(decoded).toEqual(original)
			})
		})

		it('maintains data integrity through URL write/read cycle', () => {
			const practiceIds = new Set(['version-control', 'automated-testing', 'trunk-based-dev'])

			let capturedURL = null
			window.history.replaceState = (state, title, url) => {
				capturedURL = url
				window.location.search = new URL(url, 'http://localhost:5173').search
			}

			updateURLWithAdoptionState(practiceIds)
			const retrieved = getAdoptionStateFromURL()

			expect(retrieved).toEqual(practiceIds)
		})
	})
})
