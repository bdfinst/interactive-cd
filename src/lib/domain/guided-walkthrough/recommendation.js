/**
 * Guided Walkthrough Recommendation Algorithm
 * Pure functions for calculating next practice to adopt
 */

/**
 * Calculate the next recommended practice to adopt.
 * Finds practices where all direct dependencies are already adopted,
 * prioritizing by maturity level (foundations first), then alphabetically.
 *
 * @param {Map} practiceMap - Map of practice ID to practice object
 * @param {Set<string>} adoptedSet - Set of adopted practice IDs
 * @returns {Object|null} Recommended practice or null if none available
 */
export const calculateNextRecommendation = (practiceMap, adoptedSet) => {
	const candidates = []

	for (const practice of practiceMap.values()) {
		if (adoptedSet.has(practice.id)) continue

		const deps = practice.dependencies || []
		const allDepsAdopted = deps.every(dep => {
			const depId = typeof dep === 'string' ? dep : dep.id
			return adoptedSet.has(depId)
		})

		if (allDepsAdopted) {
			candidates.push(practice)
		}
	}

	if (candidates.length === 0) return null

	candidates.sort((a, b) => {
		const aLevel = a.maturityLevel ?? 0
		const bLevel = b.maturityLevel ?? 0
		if (aLevel !== bLevel) {
			return aLevel - bLevel
		}
		return a.id.localeCompare(b.id)
	})

	return candidates[0]
}

/**
 * Calculate adoption progress statistics
 *
 * @param {Map} practiceMap - Map of practice ID to practice object
 * @param {Set<string>} adoptedSet - Set of adopted practice IDs
 * @returns {Object} Progress object with total, adopted, and percentage
 */
export const calculateAdoptionProgress = (practiceMap, adoptedSet) => {
	const total = practiceMap.size
	const adopted = adoptedSet.size
	const percentage = total > 0 ? Math.round((adopted / total) * 100) : 0

	return { total, adopted, percentage }
}
