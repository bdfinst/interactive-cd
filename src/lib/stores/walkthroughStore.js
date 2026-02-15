import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { adoptionStore } from '$lib/stores/adoptionStore.js'
import {
	calculateNextRecommendation,
	calculateAdoptionProgress
} from '$lib/domain/guided-walkthrough/recommendation.js'

const DISMISSED_STORAGE_KEY = 'cd-walkthrough-dismissed'

/**
 * Store holding the practice map (populated by PracticeGraph on mount)
 */
export const practiceMapStore = writable(new Map())

/**
 * Store tracking whether the walkthrough panel is dismissed
 * Persisted to localStorage
 */
const createWalkthroughDismissed = () => {
	const initial = browser
		? globalThis.localStorage.getItem(DISMISSED_STORAGE_KEY) === 'true'
		: false
	const { subscribe, set } = writable(initial)

	return {
		subscribe,
		dismiss: () => {
			if (browser) globalThis.localStorage.setItem(DISMISSED_STORAGE_KEY, 'true')
			set(true)
		},
		show: () => {
			if (browser) globalThis.localStorage.removeItem(DISMISSED_STORAGE_KEY)
			set(false)
		}
	}
}

export const walkthroughDismissed = createWalkthroughDismissed()

/**
 * Derived store combining adoption state and practice map
 * to produce the current recommendation and progress
 */
export const walkthroughState = derived(
	[adoptionStore, practiceMapStore],
	([$adopted, $practiceMap]) => {
		if ($practiceMap.size === 0) {
			return {
				recommendation: null,
				progress: { total: 0, adopted: 0, percentage: 0 }
			}
		}

		const recommendation = calculateNextRecommendation($practiceMap, $adopted)
		const progress = calculateAdoptionProgress($practiceMap, $adopted)

		return { recommendation, progress }
	}
)
