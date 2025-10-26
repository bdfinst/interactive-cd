/**
 * Calculate how many of a practice's dependencies have been adopted
 * @param {Object} practice - Practice object with dependencies array
 * @param {Set<string>} adoptedSet - Set of adopted practice IDs
 * @param {Map} _practiceMap - Map of practice ID to practice object (currently unused, for future use)
 * @returns {number} Count of adopted dependencies
 */
export const calculateAdoptedDependencies = (practice, adoptedSet, _practiceMap) => {
	if (!practice || !practice.dependencies || !Array.isArray(practice.dependencies)) {
		return 0
	}

	if (!adoptedSet || adoptedSet.size === 0) {
		return 0
	}

	// Count how many dependencies are in the adopted set
	// Use Set to handle duplicates in dependencies array
	const uniqueDependencies = new Set(practice.dependencies)
	let adoptedCount = 0

	for (const depId of uniqueDependencies) {
		if (adoptedSet.has(depId)) {
			adoptedCount++
		}
	}

	return adoptedCount
}

/**
 * Calculate adoption percentage
 * @param {number} adopted - Number of adopted practices
 * @param {number} total - Total number of practices
 * @returns {number} Percentage (0-100), rounded to nearest integer
 */
export const calculateAdoptionPercentage = (adopted, total) => {
	// Handle edge cases
	if (!total || total <= 0 || !adopted || adopted < 0) {
		return 0
	}

	if (adopted >= total) {
		return 100
	}

	// Calculate percentage and round to nearest integer
	const percentage = (adopted / total) * 100
	return Math.round(percentage)
}

/**
 * Filter a set of practice IDs to only include valid IDs
 * @param {Set<string>} inputIds - Set of practice IDs to filter
 * @param {Set<string>} validIds - Set of all valid practice IDs
 * @returns {Set<string>} Filtered set containing only valid IDs
 */
export const filterValidPracticeIds = (inputIds, validIds) => {
	if (!inputIds || !validIds) {
		return new Set()
	}

	const filtered = new Set()

	for (const id of inputIds) {
		if (validIds.has(id)) {
			filtered.add(id)
		}
	}

	return filtered
}
