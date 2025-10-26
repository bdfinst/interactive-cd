/* global btoa, atob */
import { browser } from '$app/environment'

/**
 * Encode a Set of practice IDs to a base64 URL parameter
 * @param {Set<string>} practiceIds - Set of adopted practice IDs
 * @returns {string} Base64-encoded comma-separated practice IDs
 */
export const encodeAdoptionState = practiceIds => {
	if (!practiceIds || practiceIds.size === 0) {
		return ''
	}

	// Convert Set to sorted array and join with commas
	const idsArray = Array.from(practiceIds).sort()
	const idsString = idsArray.join(',')

	// Encode to base64
	return btoa(idsString)
}

/**
 * Decode a base64 URL parameter to a Set of practice IDs
 * @param {string} encoded - Base64-encoded practice IDs
 * @returns {Set<string>} Set of practice IDs
 */
export const decodeAdoptionState = encoded => {
	if (!encoded || encoded === '') {
		return new Set()
	}

	try {
		// Decode from base64
		const decoded = atob(encoded)

		// Split by comma, trim, and filter out empty strings
		const idsArray = decoded
			.split(',')
			.map(id => id.trim())
			.filter(id => id.length > 0)

		return new Set(idsArray)
	} catch (error) {
		// Invalid base64 or other error - return empty set
		console.warn('Failed to decode adoption state:', error)
		return new Set()
	}
}

/**
 * Get adoption state from current URL
 * @returns {Set<string> | null} Set of practice IDs or null if not in URL
 */
export const getAdoptionStateFromURL = () => {
	if (!browser) return null

	const urlParams = new URLSearchParams(window.location.search)
	const adoptedParam = urlParams.get('adopted')

	if (!adoptedParam || adoptedParam === '') {
		return null
	}

	const decoded = decodeAdoptionState(adoptedParam)

	// Return null if decoding resulted in empty set (malformed parameter)
	// but return the empty set if it was explicitly encoded
	if (decoded.size === 0 && adoptedParam !== encodeAdoptionState(new Set())) {
		return decoded.size === 0 ? decoded : null
	}

	return decoded
}

/**
 * Update URL with current adoption state
 * Uses history.replaceState to avoid creating new history entries
 * Note: URL parameters do NOT control feature flag - only VITE_ENABLE_PRACTICE_ADOPTION does
 *
 * @param {Set<string>} practiceIds - Set of adopted practice IDs
 */
export const updateURLWithAdoptionState = practiceIds => {
	if (!browser) return

	const urlParams = new URLSearchParams(window.location.search)

	// Note: We no longer add/remove the feature parameter
	// The feature flag is controlled solely by VITE_ENABLE_PRACTICE_ADOPTION
	// Existing URL parameters (like ?feature=practice-adoption) are preserved but ignored

	if (!practiceIds || practiceIds.size === 0) {
		// Remove adopted parameter if set is empty
		urlParams.delete('adopted')
	} else {
		// Encode and set the adopted parameter
		const encoded = encodeAdoptionState(practiceIds)
		urlParams.set('adopted', encoded)
	}

	// Construct new URL
	const newSearch = urlParams.toString()
	const newURL = window.location.pathname + (newSearch ? '?' + newSearch : '')

	// Update URL without reloading page
	window.history.replaceState({}, '', newURL)
}
