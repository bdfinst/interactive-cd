/* global localStorage */
/**
 * Adoption State Persistence Service
 * Handles localStorage operations for practice adoption state
 */

export const STORAGE_KEY = 'cd-practices-adoption'

/**
 * Save adoption state to localStorage
 *
 * @param {Set<string>} adoptedSet - Set of adopted practice IDs
 */
export const saveAdoptionState = adoptedSet => {
	try {
		// Handle null/undefined by treating as empty set
		const practiceIds = adoptedSet ? Array.from(adoptedSet).sort() : []
		localStorage.setItem(STORAGE_KEY, JSON.stringify(practiceIds))
	} catch (error) {
		console.warn('Failed to save adoption state:', error)
	}
}

/**
 * Load adoption state from localStorage
 *
 * @returns {Set<string>|null} Set of adopted practice IDs or null if not found
 */
export const loadAdoptionState = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return null

		const data = JSON.parse(stored)

		// Validate it's an array
		if (!Array.isArray(data)) {
			console.warn('Invalid adoption state format, expected array')
			return null
		}

		// Filter out empty strings, null, undefined
		const validIds = data.filter(id => typeof id === 'string' && id.trim().length > 0)

		return new Set(validIds)
	} catch (error) {
		console.warn('Failed to load adoption state:', error)
		return null
	}
}

/**
 * Clear adoption state from localStorage
 */
export const clearAdoptionState = () => {
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch (error) {
		console.warn('Failed to clear adoption state:', error)
	}
}
