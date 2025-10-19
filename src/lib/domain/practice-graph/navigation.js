/**
 * Pure functions for practice graph navigation
 * Following functional programming principles from CLAUDE.md
 */

/**
 * Adds a practice to the navigation path or removes it if it's the current practice
 * @param {string[]} navigationPath - Current navigation path
 * @param {string} practiceId - Practice ID to expand/collapse
 * @returns {string[]} New navigation path (immutable)
 */
export const expandPractice = (navigationPath, practiceId) => {
	const currentId = navigationPath[navigationPath.length - 1]

	if (practiceId === currentId) {
		// Trying to collapse current practice - navigate back
		return navigationPath.slice(0, -1)
	}

	// Expand - add to path
	return [...navigationPath, practiceId]
}

/**
 * Navigates back one level in the navigation path
 * @param {string[]} navigationPath - Current navigation path
 * @returns {string[]} New navigation path (immutable)
 */
export const navigateBack = navigationPath => {
	if (navigationPath.length <= 1) {
		return navigationPath
	}
	return navigationPath.slice(0, -1)
}

/**
 * Navigates to a specific ancestor by index
 * @param {string[]} navigationPath - Current navigation path
 * @param {number} ancestorIndex - Index of ancestor to navigate to
 * @returns {string[]} New navigation path (immutable)
 */
export const navigateToAncestor = (navigationPath, ancestorIndex) => {
	if (ancestorIndex < 0 || ancestorIndex >= navigationPath.length - 1) {
		return navigationPath
	}
	return navigationPath.slice(0, ancestorIndex + 1)
}

/**
 * Checks if a practice is currently expanded
 * @param {string[]} navigationPath - Current navigation path
 * @param {string} practiceId - Practice ID to check
 * @returns {boolean} True if practice is expanded
 */
export const isPracticeExpanded = (navigationPath, practiceId) => {
	const currentId = navigationPath[navigationPath.length - 1]
	return practiceId === currentId && navigationPath.length > 1
}
