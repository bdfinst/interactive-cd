/* global localStorage */
import { browser } from '$app/environment'

/**
 * localStorage key for storing adoption state
 */
export const STORAGE_KEY = 'cd-practices-adoption'

/**
 * Save adoption state to localStorage
 * @param {Set<string>} practiceIds - Set of adopted practice IDs
 */
export const saveAdoptionState = practiceIds => {
	if (!browser) return

	try {
		// Convert Set to sorted array for consistent storage
		const idsArray = practiceIds && practiceIds.size > 0 ? Array.from(practiceIds).sort() : []

		// Store as JSON
		localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray))
	} catch (error) {
		// Handle QuotaExceededError or other localStorage errors
		console.warn('Failed to save adoption state to localStorage:', error)
	}
}

/**
 * Load adoption state from localStorage
 * @returns {Set<string> | null} Set of practice IDs or null if not found
 */
export const loadAdoptionState = () => {
	if (!browser) return null

	try {
		const stored = localStorage.getItem(STORAGE_KEY)

		if (!stored) {
			return null
		}

		// Parse JSON
		const parsed = JSON.parse(stored)

		// Validate that it's an array
		if (!Array.isArray(parsed)) {
			console.warn('Invalid adoption state format in localStorage')
			return null
		}

		// Filter out null, undefined, and empty strings, then create Set
		const filtered = parsed.filter(id => id && typeof id === 'string' && id.length > 0)

		return new Set(filtered)
	} catch (error) {
		// Handle JSON parse errors or other localStorage errors
		console.warn('Failed to load adoption state from localStorage:', error)
		return null
	}
}

/**
 * Clear adoption state from localStorage
 */
export const clearAdoptionState = () => {
	if (!browser) return

	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch (error) {
		console.warn('Failed to clear adoption state from localStorage:', error)
	}
}
