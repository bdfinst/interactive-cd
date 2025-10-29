/**
 * Filter tree to show only related practices
 * Pure functional approach with immutable Set operations
 *
 * When a practice is selected, show only:
 * - The selected practice itself
 * - Practices that depend on it (ancestors in the tree)
 * - Practices it depends on (descendants in the tree)
 *
 * @param {Array} flattenedTree - The flattened tree data
 * @param {string} selectedPracticeId - ID of the selected practice
 * @returns {Array} Filtered tree containing only related practices
 */
export function filterTreeBySelection(flattenedTree, selectedPracticeId) {
	if (!selectedPracticeId || flattenedTree.length === 0) {
		return flattenedTree
	}

	const selectedPractice = flattenedTree.find(p => p.id === selectedPracticeId)
	if (!selectedPractice) {
		return flattenedTree
	}

	// Find all practices that depend ON the selected practice (ancestors/parents)
	// These are practices where the selected practice appears in their dependencies
	// Pure function - returns new Set instead of mutating
	function collectAncestors(practiceId, visited = new Set()) {
		const newAncestors = flattenedTree
			.filter(
				practice =>
					practice.dependencies &&
					practice.dependencies.some(dep => dep.id === practiceId) &&
					!visited.has(practice.id)
			)
			.map(p => p.id)

		if (newAncestors.length === 0) return visited

		// Recursively collect ancestors of the new ancestors
		return newAncestors.reduce(
			(acc, ancestorId) => collectAncestors(ancestorId, acc),
			new Set([...visited, ...newAncestors])
		)
	}

	// Find all practices that the selected practice depends ON (descendants/children)
	// Pure function - returns new Set instead of mutating
	function collectDescendants(practice, visited = new Set()) {
		if (!practice.dependencies || practice.dependencies.length === 0) {
			return visited
		}

		const newDescendants = practice.dependencies
			.filter(dep => !visited.has(dep.id))
			.map(dep => dep.id)

		if (newDescendants.length === 0) return visited

		// Recursively collect descendants of the new descendants
		return newDescendants.reduce(
			(acc, depId) => {
				const depPractice = flattenedTree.find(p => p.id === depId)
				return depPractice ? collectDescendants(depPractice, acc) : acc
			},
			new Set([...visited, ...newDescendants])
		)
	}

	// Build the set of related practices
	const ancestors = collectAncestors(selectedPracticeId)
	const descendants = collectDescendants(selectedPractice)
	const relatedPracticeIds = new Set([selectedPracticeId, ...ancestors, ...descendants])

	// Filter the tree to only include related practices
	return flattenedTree.filter(practice => relatedPracticeIds.has(practice.id))
}
