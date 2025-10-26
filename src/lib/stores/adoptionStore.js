import { writable, derived, get } from 'svelte/store'
import { browser } from '$app/environment'
import { debounce } from '$lib/utils/debounce.js'
import { getAdoptionStateFromURL, updateURLWithAdoptionState } from '$lib/utils/urlState.js'
import { saveAdoptionState, loadAdoptionState } from '$lib/services/adoptionPersistence.js'
import { filterValidPracticeIds } from '$lib/utils/adoption.js'
import { isPracticeAdoptionEnabled } from './featureFlags.js'

/**
 * Creates the adoption store that manages practice adoption state
 * with URL and localStorage synchronization
 */
const createAdoptionStore = () => {
	// Private writable store containing Set of adopted practice IDs
	const { subscribe, set, update } = writable(new Set())

	// Debounced localStorage save to avoid excessive writes
	const debouncedSaveToStorage = debounce(adoptedSet => {
		if (browser) {
			saveAdoptionState(adoptedSet)
		}
	}, 500)

	/**
	 * Initialize the store from URL, localStorage, or empty state
	 * Priority: URL > localStorage > Empty
	 *
	 * @param {Set<string>} allPracticeIds - Set of valid practice IDs for filtering
	 */
	const initialize = (allPracticeIds = new Set()) => {
		if (!browser) {
			set(new Set())
			return
		}

		// Priority: URL > localStorage > empty
		const urlState = getAdoptionStateFromURL()
		const storageState = urlState ? null : loadAdoptionState()

		let initialState = urlState || storageState || new Set()

		// Filter out invalid practice IDs when validation set is provided
		initialState = filterValidPracticeIds(initialState, allPracticeIds)

		set(initialState)

		// Sync URL and localStorage
		if (urlState) {
			// URL takes precedence, save to localStorage
			saveAdoptionState(initialState)
		} else if (initialState.size > 0) {
			// Update URL to match localStorage
			updateURLWithAdoptionState(initialState, get(isPracticeAdoptionEnabled))
		}
	}

	/**
	 * Toggle a practice's adoption state
	 *
	 * @param {string} practiceId - The practice ID to toggle
	 */
	const toggle = practiceId => {
		if (!browser) return

		update(adoptedSet => {
			const newSet = new Set(adoptedSet)

			if (newSet.has(practiceId)) {
				newSet.delete(practiceId)
			} else {
				newSet.add(practiceId)
			}

			// Immediately update URL (replaceState doesn't trigger navigation)
			updateURLWithAdoptionState(newSet, get(isPracticeAdoptionEnabled))

			// Debounced save to localStorage
			debouncedSaveToStorage(newSet)

			return newSet
		})
	}

	/**
	 * Check if a practice is adopted
	 *
	 * @param {string} practiceId - The practice ID to check
	 * @returns {boolean} True if adopted
	 */
	const isAdopted = practiceId => {
		const adoptedSet = get({ subscribe })
		return adoptedSet.has(practiceId)
	}

	/**
	 * Get the count of adopted practices
	 *
	 * @returns {number} Number of adopted practices
	 */
	const getCount = () => {
		const adoptedSet = get({ subscribe })
		return adoptedSet.size
	}

	/**
	 * Clear all adoptions
	 */
	const clearAll = () => {
		if (!browser) return

		const emptySet = new Set()
		set(emptySet)
		updateURLWithAdoptionState(emptySet, get(isPracticeAdoptionEnabled))
		saveAdoptionState(emptySet)
	}

	/**
	 * Import multiple practices at once
	 *
	 * @param {Set<string>} practiceIds - Set of practice IDs to import
	 */
	const importPractices = practiceIds => {
		if (!browser) return

		const newSet = new Set(practiceIds)
		set(newSet)
		updateURLWithAdoptionState(newSet, get(isPracticeAdoptionEnabled))
		saveAdoptionState(newSet)
	}

	return {
		subscribe,
		initialize,
		toggle,
		isAdopted,
		getCount,
		clearAll,
		importPractices
	}
}

// Export the singleton store instance
export const adoptionStore = createAdoptionStore()

// Derived store for adoption count (reactive to changes)
export const adoptionCount = derived(adoptionStore, $adopted => $adopted.size)
