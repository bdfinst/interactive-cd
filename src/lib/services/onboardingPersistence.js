/* global localStorage */
/**
 * Onboarding Persistence Service
 * Handles localStorage operations for onboarding seen state
 */

export const ONBOARDING_STORAGE_KEY = 'cd-practices-onboarding-seen'

/**
 * Check if user has seen the onboarding
 * @returns {boolean} True if onboarding has been seen
 */
export const hasSeenOnboarding = () => {
	try {
		return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
	} catch {
		return false
	}
}

/**
 * Mark onboarding as seen
 */
export const markOnboardingSeen = () => {
	try {
		localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

/**
 * Reset onboarding seen state (for testing/replay)
 */
export const resetOnboardingSeen = () => {
	try {
		localStorage.removeItem(ONBOARDING_STORAGE_KEY)
	} catch {
		// Silently fail if localStorage is unavailable
	}
}
