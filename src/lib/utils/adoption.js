/**
 * Calculate how many of a practice's dependencies (including transitive) have been adopted
 * @param {Object} practice - Practice object with dependencies array (can be IDs or objects)
 * @param {Set<string>} adoptedSet - Set of adopted practice IDs
 * @param {Map} practiceMap - Map of practice ID to practice object (for traversing transitive dependencies)
 * @returns {{adoptedCount: number, totalCount: number}} Object with adopted and total dependency counts
 */
export const calculateAdoptedDependencies = (practice, adoptedSet, practiceMap) => {
	if (!practice || !practice.id) {
		return { adoptedCount: 0, totalCount: 0 }
	}

	if (!adoptedSet || adoptedSet.size === 0) {
		// Still need to calculate total count even if no adoptions
		if (practiceMap && practiceMap.size > 0) {
			const fullPractice = practiceMap.get(practice.id)
			if (
				!fullPractice ||
				!fullPractice.dependencies ||
				!Array.isArray(fullPractice.dependencies)
			) {
				return { adoptedCount: 0, totalCount: 0 }
			}

			// Calculate total transitive dependencies
			const allDependencies = new Set()
			const visited = new Set()
			const getDependencyId = dep => (typeof dep === 'string' ? dep : dep?.id)

			const collectTransitiveDependencies = practiceId => {
				if (visited.has(practiceId)) {
					return
				}
				visited.add(practiceId)

				const currentPractice = practiceMap.get(practiceId)
				if (!currentPractice || !currentPractice.dependencies) {
					return
				}

				for (const dep of currentPractice.dependencies) {
					const depId = getDependencyId(dep)
					if (depId) {
						allDependencies.add(depId)
						collectTransitiveDependencies(depId)
					}
				}
			}

			collectTransitiveDependencies(practice.id)
			return { adoptedCount: 0, totalCount: allDependencies.size }
		}
		return { adoptedCount: 0, totalCount: 0 }
	}

	// Helper to normalize a dependency to an ID (handles both strings and objects)
	const getDependencyId = dep => (typeof dep === 'string' ? dep : dep?.id)

	// If practice map is provided, use it to get the full practice with dependencies
	if (practiceMap && practiceMap.size > 0) {
		const fullPractice = practiceMap.get(practice.id)
		if (!fullPractice || !fullPractice.dependencies || !Array.isArray(fullPractice.dependencies)) {
			return { adoptedCount: 0, totalCount: 0 }
		}

		// Count all transitive dependencies (including direct)
		const allDependencies = new Set()
		const visited = new Set()

		const collectTransitiveDependencies = practiceId => {
			if (visited.has(practiceId)) {
				return
			}
			visited.add(practiceId)

			const currentPractice = practiceMap.get(practiceId)
			if (!currentPractice || !currentPractice.dependencies) {
				return
			}

			// Handle both object and string dependencies
			for (const dep of currentPractice.dependencies) {
				const depId = getDependencyId(dep)
				if (depId) {
					allDependencies.add(depId)
					collectTransitiveDependencies(depId)
				}
			}
		}

		// Start from the practice's direct dependencies
		collectTransitiveDependencies(practice.id)

		// Count how many of these are adopted
		let adoptedCount = 0
		for (const depId of allDependencies) {
			if (adoptedSet.has(depId)) {
				adoptedCount++
			}
		}

		return { adoptedCount, totalCount: allDependencies.size }
	}

	// Backward compatibility: if no practice map and practice has dependencies array
	if (!practice.dependencies || !Array.isArray(practice.dependencies)) {
		return { adoptedCount: 0, totalCount: 0 }
	}

	// Count how many direct dependencies are in the adopted set
	const uniqueDependencies = new Set(practice.dependencies.map(getDependencyId).filter(Boolean))

	let adoptedCount = 0

	for (const depId of uniqueDependencies) {
		if (adoptedSet.has(depId)) {
			adoptedCount++
		}
	}

	return { adoptedCount, totalCount: uniqueDependencies.size }
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
