import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
	saveAdoptionState,
	loadAdoptionState,
	clearAdoptionState,
	STORAGE_KEY
} from '$lib/services/adoptionPersistence.js'

describe('adoptionPersistence', () => {
	let originalLocalStorage

	beforeEach(() => {
		// Save original localStorage
		originalLocalStorage = global.localStorage

		// Mock localStorage
		const store = {}
		global.localStorage = {
			getItem: vi.fn(key => store[key] || null),
			setItem: vi.fn((key, value) => {
				store[key] = value
			}),
			removeItem: vi.fn(key => {
				delete store[key]
			}),
			clear: vi.fn(() => {
				Object.keys(store).forEach(key => delete store[key])
			})
		}
	})

	afterEach(() => {
		// Restore original localStorage
		global.localStorage = originalLocalStorage
	})

	describe('saveAdoptionState', () => {
		it('saves empty set as empty array', () => {
			saveAdoptionState(new Set())

			expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '[]')
		})

		it('saves single practice ID', () => {
			const practiceIds = new Set(['version-control'])

			saveAdoptionState(practiceIds)

			expect(localStorage.setItem).toHaveBeenCalled()
			const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1])
			expect(savedData).toEqual(['version-control'])
		})

		it('saves multiple practice IDs as sorted array', () => {
			const practiceIds = new Set([
				'automated-testing',
				'version-control',
				'continuous-integration'
			])

			saveAdoptionState(practiceIds)

			expect(localStorage.setItem).toHaveBeenCalled()
			const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1])
			// Should be sorted
			expect(savedData).toEqual(['automated-testing', 'continuous-integration', 'version-control'])
		})

		it('uses correct storage key', () => {
			const practiceIds = new Set(['version-control'])

			saveAdoptionState(practiceIds)

			expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String))
		})

		it('handles null gracefully', () => {
			expect(() => saveAdoptionState(null)).not.toThrow()
			expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '[]')
		})

		it('handles undefined gracefully', () => {
			expect(() => saveAdoptionState(undefined)).not.toThrow()
			expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '[]')
		})

		it('handles localStorage errors gracefully', () => {
			// Suppress expected warning from localStorage quota exceeded
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			localStorage.setItem.mockImplementation(() => {
				throw new Error('QuotaExceededError')
			})

			expect(() => saveAdoptionState(new Set(['version-control']))).not.toThrow()

			warnSpy.mockRestore()
		})
	})

	describe('loadAdoptionState', () => {
		it('returns null when no data exists', () => {
			const result = loadAdoptionState()

			expect(result).toBeNull()
			expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
		})

		it('returns empty set when stored data is empty array', () => {
			localStorage.getItem.mockReturnValue('[]')

			const result = loadAdoptionState()

			expect(result).toEqual(new Set())
		})

		it('loads single practice ID', () => {
			localStorage.getItem.mockReturnValue('["version-control"]')

			const result = loadAdoptionState()

			expect(result).toEqual(new Set(['version-control']))
		})

		it('loads multiple practice IDs', () => {
			localStorage.getItem.mockReturnValue(
				'["version-control","automated-testing","continuous-integration"]'
			)

			const result = loadAdoptionState()

			expect(result).toEqual(
				new Set(['version-control', 'automated-testing', 'continuous-integration'])
			)
		})

		it('handles malformed JSON gracefully', () => {
			// Suppress expected warning from malformed JSON
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			localStorage.getItem.mockReturnValue('not-valid-json')

			const result = loadAdoptionState()

			expect(result).toBeNull()

			warnSpy.mockRestore()
		})

		it('handles non-array JSON gracefully', () => {
			// Suppress expected warning from non-array format
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			localStorage.getItem.mockReturnValue('{"key": "value"}')

			const result = loadAdoptionState()

			expect(result).toBeNull()

			warnSpy.mockRestore()
		})

		it('handles array with non-string values', () => {
			localStorage.getItem.mockReturnValue('[1, 2, 3]')

			const result = loadAdoptionState()

			// Should still create a Set, but with number strings
			expect(result).toBeInstanceOf(Set)
		})

		it('handles localStorage errors gracefully', () => {
			// Suppress expected warning from localStorage security error
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			localStorage.getItem.mockImplementation(() => {
				throw new Error('SecurityError')
			})

			const result = loadAdoptionState()

			expect(result).toBeNull()

			warnSpy.mockRestore()
		})

		it('filters out empty strings', () => {
			localStorage.getItem.mockReturnValue('["version-control", "", "automated-testing", ""]')

			const result = loadAdoptionState()

			expect(result).toEqual(new Set(['version-control', 'automated-testing']))
		})

		it('filters out null and undefined values', () => {
			localStorage.getItem.mockReturnValue('["version-control", null, "automated-testing", null]')

			const result = loadAdoptionState()

			expect(result).toEqual(new Set(['version-control', 'automated-testing']))
		})
	})

	describe('clearAdoptionState', () => {
		it('removes data from localStorage', () => {
			clearAdoptionState()

			expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY)
		})

		it('does not throw when localStorage fails', () => {
			// Suppress expected warning from localStorage security error
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			localStorage.removeItem.mockImplementation(() => {
				throw new Error('SecurityError')
			})

			expect(() => clearAdoptionState()).not.toThrow()

			warnSpy.mockRestore()
		})
	})

	describe('Round-trip save/load', () => {
		beforeEach(() => {
			// Use real-ish localStorage for round-trip tests
			const store = {}
			global.localStorage = {
				getItem: key => store[key] || null,
				setItem: (key, value) => {
					store[key] = value
				},
				removeItem: key => {
					delete store[key]
				},
				clear: () => {
					Object.keys(store).forEach(key => delete store[key])
				}
			}
		})

		it('maintains data integrity through save/load cycle', () => {
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
				saveAdoptionState(original)
				const loaded = loadAdoptionState()

				expect(loaded).toEqual(original)

				// Clean up for next iteration
				clearAdoptionState()
			})
		})

		it('handles clear after save', () => {
			const practiceIds = new Set(['version-control', 'automated-testing'])

			saveAdoptionState(practiceIds)
			expect(loadAdoptionState()).toEqual(practiceIds)

			clearAdoptionState()
			expect(loadAdoptionState()).toBeNull()
		})

		it('overwrites previous data on save', () => {
			const first = new Set(['version-control'])
			const second = new Set(['automated-testing', 'continuous-integration'])

			saveAdoptionState(first)
			expect(loadAdoptionState()).toEqual(first)

			saveAdoptionState(second)
			expect(loadAdoptionState()).toEqual(second)
		})
	})

	describe('STORAGE_KEY constant', () => {
		it('is exported and has expected value', () => {
			expect(STORAGE_KEY).toBe('cd-practices-adoption')
		})
	})
})
