/**
 * Filter tree to show only related practices
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

	const relatedPracticeIds = new Set()

	// Add the selected practice itself
	relatedPracticeIds.add(selectedPracticeId)

	// Find all practices that depend ON the selected practice (ancestors/parents)
	// These are practices where the selected practice appears in their dependencies
	function addAncestors(practiceId) {
		flattenedTree.forEach(practice => {
			if (practice.dependencies && practice.dependencies.some(dep => dep.id === practiceId)) {
				if (!relatedPracticeIds.has(practice.id)) {
					relatedPracticeIds.add(practice.id)
					// Recursively add their ancestors too
					addAncestors(practice.id)
				}
			}
		})
	}

	// Find all practices that the selected practice depends ON (descendants/children)
	function addDescendants(practice) {
		if (practice.dependencies) {
			practice.dependencies.forEach(dep => {
				if (!relatedPracticeIds.has(dep.id)) {
					relatedPracticeIds.add(dep.id)
					// Find the full practice object and recurse
					const depPractice = flattenedTree.find(p => p.id === dep.id)
					if (depPractice) {
						addDescendants(depPractice)
					}
				}
			})
		}
	}

	// Build the set of related practices
	addAncestors(selectedPracticeId)
	addDescendants(selectedPractice)

	// Filter the tree to only include related practices
	return flattenedTree.filter(practice => relatedPracticeIds.has(practice.id))
}
