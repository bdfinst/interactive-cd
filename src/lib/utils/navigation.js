import { browser } from '$app/environment'

/**
 * Get practice ID from URL search parameter
 * @returns {string|null} Practice ID or null
 */
export const getPracticeFromURL = () => {
	if (!browser) return null

	const params = new URLSearchParams(window.location.search)
	return params.get('practice') || null
}

/**
 * Update URL to include or remove practice parameter
 * Uses replaceState to avoid adding history entries
 *
 * @param {string|null} practiceId - Practice ID to set, or null to remove
 */
export const updatePracticeInURL = practiceId => {
	if (!browser) return

	const url = new URL(window.location.href)

	if (practiceId) {
		url.searchParams.set('practice', practiceId)
	} else {
		url.searchParams.delete('practice')
	}

	window.history.replaceState({}, '', url.toString())
}
