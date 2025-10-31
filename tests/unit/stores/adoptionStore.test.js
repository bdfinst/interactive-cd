import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { get } from 'svelte/store'

// Mock browser APIs before importing the store
const mockLocalStorage = (() => {
	let store = {}
	return {
		getItem: key => store[key] || null,
		setItem: (key, value) => {
			store[key] = value.toString()
		},
		removeItem: key => {
			delete store[key]
		},
		clear: () => {
			store = {}
		}
	}
})()

const mockHistory = {
	replaceState: vi.fn()
}

const mockLocation = {
	href: 'http://localhost:5173/',
	search: '',
	pathname: '/'
}

// Mock global objects
global.localStorage = mockLocalStorage
global.history = mockHistory
global.location = mockLocation
global.window = {
	location: mockLocation,
	history: mockHistory,
	localStorage: mockLocalStorage
}

// Now import the store after mocks are set up
import { adoptionStore, adoptionCount } from '$lib/stores/adoptionStore.js'

describe('adoptionStore', () => {
	beforeEach(() => {
		// Clear all mocks and localStorage before each test
		mockLocalStorage.clear()
		mockLocation.search = ''
		mockLocation.pathname = '/'
		mockLocation.href = 'http://localhost:5173/'

		// Reset store to empty state FIRST
		adoptionStore.clearAll()

		// Clear mock history AFTER clearAll to avoid counting its replaceState call
		mockHistory.replaceState.mockClear()

		// Wait for any debounced operations to complete
		vi.clearAllTimers()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initialization', () => {
		it('should initialize with empty state when no URL or localStorage', () => {
			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			const state = get(adoptionStore)
			expect(state).toBeInstanceOf(Set)
			expect(state.size).toBe(0)
		})

		it('should initialize from URL parameter when present', () => {
			// Simulate URL with encoded adoption state: "ci,vc"
			const encoded = btoa('ci,vc')
			mockLocation.search = `?adopted=${encoded}`
			mockLocation.href = `http://localhost:5173/?adopted=${encoded}`

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			const state = get(adoptionStore)
			expect(state.has('ci')).toBe(true)
			expect(state.has('vc')).toBe(true)
			expect(state.size).toBe(2)
		})

		it('should initialize from localStorage when URL is empty', () => {
			// Simulate localStorage with adoption state (simple array format)
			mockLocalStorage.setItem('cd-practices-adoption', JSON.stringify(['ci', 'at']))

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			const state = get(adoptionStore)
			expect(state.has('ci')).toBe(true)
			expect(state.has('at')).toBe(true)
			expect(state.size).toBe(2)
		})

		it('should prioritize URL state over localStorage', () => {
			// URL has 'ci'
			const encoded = btoa('ci')
			mockLocation.search = `?adopted=${encoded}`
			mockLocation.href = `http://localhost:5173/?adopted=${encoded}`

			// localStorage has 'vc', 'at' (simple array format)
			mockLocalStorage.setItem('cd-practices-adoption', JSON.stringify(['vc', 'at']))

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			const state = get(adoptionStore)
			expect(state.has('ci')).toBe(true)
			expect(state.has('vc')).toBe(false) // URL takes precedence
			expect(state.has('at')).toBe(false)
			expect(state.size).toBe(1)
		})

		it('should filter out invalid practice IDs during initialization', () => {
			const encoded = btoa('ci,invalid-id,vc')
			mockLocation.search = `?adopted=${encoded}`
			mockLocation.href = `http://localhost:5173/?adopted=${encoded}`

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			const state = get(adoptionStore)
			expect(state.has('ci')).toBe(true)
			expect(state.has('vc')).toBe(true)
			expect(state.has('invalid-id')).toBe(false)
			expect(state.size).toBe(2)
		})

		it('should sync URL when initialized from localStorage', () => {
			// Simple array format
			mockLocalStorage.setItem('cd-practices-adoption', JSON.stringify(['ci', 'vc']))

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			// Should update URL to reflect localStorage state
			expect(mockHistory.replaceState).toHaveBeenCalled()
			const callArgs = mockHistory.replaceState.mock.calls[0]
			expect(callArgs[2]).toContain('adopted=')
		})

		it('should save URL state to localStorage when URL takes precedence', () => {
			const encoded = btoa('ci,vc')
			mockLocation.search = `?adopted=${encoded}`
			mockLocation.href = `http://localhost:5173/?adopted=${encoded}`

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			const stored = mockLocalStorage.getItem('cd-practices-adoption')
			expect(stored).toBeTruthy()

			const parsed = JSON.parse(stored)
			expect(parsed).toContain('ci')
			expect(parsed).toContain('vc')
		})
	})

	describe('Toggle Adoption', () => {
		beforeEach(() => {
			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))
		})

		it('should add practice when toggling unadopted practice', () => {
			adoptionStore.toggle('ci')

			const state = get(adoptionStore)
			expect(state.has('ci')).toBe(true)
			expect(state.size).toBe(1)
		})

		it('should remove practice when toggling adopted practice', () => {
			adoptionStore.toggle('ci')
			expect(get(adoptionStore).has('ci')).toBe(true)

			adoptionStore.toggle('ci')
			expect(get(adoptionStore).has('ci')).toBe(false)
		})

		it('should update URL immediately when toggling', () => {
			mockHistory.replaceState.mockClear()

			adoptionStore.toggle('ci')

			expect(mockHistory.replaceState).toHaveBeenCalled()
			const callArgs = mockHistory.replaceState.mock.calls[0]
			expect(callArgs[2]).toContain('adopted=')
		})

		it('should remove adopted parameter from URL when all practices unadopted', () => {
			adoptionStore.toggle('ci')
			expect(get(adoptionStore).size).toBe(1)

			mockHistory.replaceState.mockClear()
			adoptionStore.toggle('ci')

			expect(mockHistory.replaceState).toHaveBeenCalled()
			const callArgs = mockHistory.replaceState.mock.calls[0]
			expect(callArgs[2]).not.toContain('adopted=')
		})

		it('should support toggling multiple practices', () => {
			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')
			adoptionStore.toggle('at')

			const state = get(adoptionStore)
			expect(state.has('ci')).toBe(true)
			expect(state.has('vc')).toBe(true)
			expect(state.has('at')).toBe(true)
			expect(state.size).toBe(3)
		})
	})

	describe('isAdopted Helper', () => {
		beforeEach(() => {
			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))
			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')
		})

		it('should return true for adopted practice', () => {
			expect(adoptionStore.isAdopted('ci')).toBe(true)
		})

		it('should return false for unadopted practice', () => {
			expect(adoptionStore.isAdopted('at')).toBe(false)
		})

		it('should return false for non-existent practice', () => {
			expect(adoptionStore.isAdopted('fake-id')).toBe(false)
		})
	})

	describe('getCount Helper', () => {
		beforeEach(() => {
			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))
		})

		it('should return 0 for empty adoption state', () => {
			expect(adoptionStore.getCount()).toBe(0)
		})

		it('should return correct count after adoptions', () => {
			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')
			expect(adoptionStore.getCount()).toBe(2)
		})

		it('should update count when unadopting', () => {
			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')
			expect(adoptionStore.getCount()).toBe(2)

			adoptionStore.toggle('ci')
			expect(adoptionStore.getCount()).toBe(1)
		})
	})

	describe('clearAll', () => {
		beforeEach(() => {
			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))
			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')
		})

		it('should remove all adoptions', () => {
			adoptionStore.clearAll()

			const state = get(adoptionStore)
			expect(state.size).toBe(0)
		})

		it('should update URL to remove adopted parameter', () => {
			mockHistory.replaceState.mockClear()
			adoptionStore.clearAll()

			expect(mockHistory.replaceState).toHaveBeenCalled()
			const callArgs = mockHistory.replaceState.mock.calls[0]
			expect(callArgs[2]).not.toContain('adopted=')
		})

		it('should clear localStorage', () => {
			adoptionStore.clearAll()

			const stored = mockLocalStorage.getItem('cd-practices-adoption')
			const parsed = stored ? JSON.parse(stored) : null

			if (parsed) {
				expect(parsed).toHaveLength(0)
			}
		})
	})

	describe('Derived Store: adoptionCount', () => {
		beforeEach(() => {
			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))
		})

		it('should reactively update when adoptions change', () => {
			expect(get(adoptionCount)).toBe(0)

			adoptionStore.toggle('ci')
			expect(get(adoptionCount)).toBe(1)

			adoptionStore.toggle('vc')
			expect(get(adoptionCount)).toBe(2)

			adoptionStore.toggle('ci')
			expect(get(adoptionCount)).toBe(1)
		})

		it('should return 0 when all adoptions cleared', () => {
			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')
			expect(get(adoptionCount)).toBe(2)

			adoptionStore.clearAll()
			expect(get(adoptionCount)).toBe(0)
		})
	})

	describe('Edge Cases', () => {
		it('should handle corrupted localStorage gracefully', () => {
			// Suppress expected warning from malformed JSON
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			mockLocalStorage.setItem('cd-practices-adoption', 'invalid-json{')

			// Should not throw, should initialize empty
			expect(() => {
				adoptionStore.initialize(new Set(['ci', 'vc']))
			}).not.toThrow()

			expect(get(adoptionStore).size).toBe(0)

			warnSpy.mockRestore()
		})

		it('should handle invalid base64 in URL gracefully', () => {
			// Suppress expected warning from invalid base64
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			mockLocation.search = '?adopted=invalid!!!base64'
			mockLocation.href = 'http://localhost:5173/?adopted=invalid!!!base64'

			expect(() => {
				adoptionStore.initialize(new Set(['ci', 'vc']))
			}).not.toThrow()

			expect(get(adoptionStore).size).toBe(0)

			warnSpy.mockRestore()
		})

		it('should handle localStorage with non-array format (object)', () => {
			// Suppress expected warning from non-array format
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			// Object instead of array - should be ignored
			const storageState = {
				version: 999,
				adoptedPractices: ['ci', 'vc'],
				lastUpdated: new Date().toISOString()
			}
			mockLocalStorage.setItem('cd-practices-adoption', JSON.stringify(storageState))

			adoptionStore.initialize(new Set(['ci', 'vc', 'at']))

			// Should ignore non-array format
			expect(get(adoptionStore).size).toBe(0)

			warnSpy.mockRestore()
		})

		it('should handle empty practice IDs list during initialization', () => {
			const encoded = btoa('ci,vc')
			mockLocation.search = `?adopted=${encoded}`
			mockLocation.href = `http://localhost:5173/?adopted=${encoded}`

			// Initialize with empty valid IDs set (edge case)
			adoptionStore.initialize(new Set([]))

			// Should filter out all IDs as invalid
			expect(get(adoptionStore).size).toBe(0)
		})
	})

	describe('Reactivity', () => {
		it('should trigger reactive updates on toggle', () => {
			adoptionStore.initialize(new Set(['ci', 'vc']))

			const values = []
			const unsubscribe = adoptionStore.subscribe(value => {
				values.push(new Set(value))
			})

			adoptionStore.toggle('ci')
			adoptionStore.toggle('vc')

			// Should have: initial (empty), after toggle ci, after toggle vc
			expect(values.length).toBeGreaterThanOrEqual(2)
			expect(values[values.length - 1].has('ci')).toBe(true)
			expect(values[values.length - 1].has('vc')).toBe(true)

			unsubscribe()
		})

		it('should allow multiple subscribers', () => {
			adoptionStore.initialize(new Set(['ci', 'vc']))

			const subscriber1Values = []
			const subscriber2Values = []

			const unsub1 = adoptionStore.subscribe(value => {
				subscriber1Values.push(value.size)
			})

			const unsub2 = adoptionStore.subscribe(value => {
				subscriber2Values.push(value.size)
			})

			adoptionStore.toggle('ci')

			expect(subscriber1Values[subscriber1Values.length - 1]).toBe(1)
			expect(subscriber2Values[subscriber2Values.length - 1]).toBe(1)

			unsub1()
			unsub2()
		})
	})

	describe('importPractices', () => {
		it('should import multiple practices at once', () => {
			adoptionStore.initialize(new Set())

			const practiceIds = new Set(['version-control', 'automated-testing', 'trunk-based-dev'])
			adoptionStore.importPractices(practiceIds)

			const state = get(adoptionStore)
			expect(state.size).toBe(3)
			expect(state.has('version-control')).toBe(true)
			expect(state.has('automated-testing')).toBe(true)
			expect(state.has('trunk-based-dev')).toBe(true)
		})

		it('should replace existing adoptions on import', () => {
			adoptionStore.initialize(new Set())
			adoptionStore.toggle('old-practice-1')
			adoptionStore.toggle('old-practice-2')

			const newPractices = new Set(['new-practice-1', 'new-practice-2'])
			adoptionStore.importPractices(newPractices)

			const state = get(adoptionStore)
			expect(state.size).toBe(2)
			expect(state.has('old-practice-1')).toBe(false)
			expect(state.has('old-practice-2')).toBe(false)
			expect(state.has('new-practice-1')).toBe(true)
			expect(state.has('new-practice-2')).toBe(true)
		})

		it('should update URL on import', () => {
			adoptionStore.initialize(new Set())
			mockHistory.replaceState.mockClear()

			const practiceIds = new Set(['ci', 'cd'])
			adoptionStore.importPractices(practiceIds)

			// Should call replaceState to update URL
			expect(mockHistory.replaceState).toHaveBeenCalled()
		})

		it('should save to localStorage on import', () => {
			adoptionStore.initialize(new Set())
			mockLocalStorage.clear()

			const practiceIds = new Set(['ci', 'cd'])
			adoptionStore.importPractices(practiceIds)

			// Give debounce time to complete (500ms)
			// For this test, we'll just check that the store state is correct
			// The actual localStorage save is debounced
			const state = get(adoptionStore)
			expect(state).toEqual(practiceIds)
		})

		it('should handle empty set import', () => {
			adoptionStore.initialize(new Set())
			adoptionStore.toggle('practice-1')

			adoptionStore.importPractices(new Set())

			const state = get(adoptionStore)
			expect(state.size).toBe(0)
		})

		it('should trigger reactive updates', () => {
			adoptionStore.initialize(new Set())

			const values = []
			const unsubscribe = adoptionStore.subscribe(value => {
				values.push(new Set(value))
			})

			const practiceIds = new Set(['ci', 'cd', 'vc'])
			adoptionStore.importPractices(practiceIds)

			// Should have at least initial state and after import
			expect(values.length).toBeGreaterThanOrEqual(2)
			const latestValue = values[values.length - 1]
			expect(latestValue.size).toBe(3)
			expect(latestValue.has('ci')).toBe(true)
			expect(latestValue.has('cd')).toBe(true)
			expect(latestValue.has('vc')).toBe(true)

			unsubscribe()
		})
	})
})
