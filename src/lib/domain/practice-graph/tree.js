/**
 * Pure functions for tree operations
 * Following functional programming principles from CLAUDE.md
 */

/**
 * Recursively collects all practice occurrences with their levels
 * @param {Object} node - Tree node with dependencies
 * @param {number} level - Current depth level
 * @param {Map} occurrences - Map of practice ID to array of occurrences
 * @returns {Map} Map of practice ID to all occurrences
 */
const collectOccurrences = (node, level = 0, occurrences = new Map()) => {
	if (!node) return occurrences

	// Add this occurrence to the map
	if (!occurrences.has(node.id)) {
		occurrences.set(node.id, [])
	}
	occurrences.get(node.id).push({
		...node,
		level
	})

	// Recursively collect dependencies
	if (node.dependencies?.length > 0) {
		node.dependencies.forEach(dep => {
			collectOccurrences(dep, level + 1, occurrences)
		})
	}

	return occurrences
}

/**
 * Flattens a hierarchical tree structure into a flat array with levels.
 * Each practice appears only once at its deepest (lowest) level in the tree.
 * @param {Object} node - Tree node with dependencies
 * @returns {Array} Flattened tree with level information, deduplicated at deepest level
 */
export const flattenTree = node => {
	if (!node) return []

	// Collect all occurrences of each practice
	const occurrences = collectOccurrences(node)

	// For each practice, keep only the deepest occurrence (maximum level)
	const result = []
	occurrences.forEach(practiceOccurrences => {
		// Find the occurrence with the maximum level (deepest in tree)
		const deepestOccurrence = practiceOccurrences.reduce((deepest, current) =>
			current.level > deepest.level ? current : deepest
		)
		result.push(deepestOccurrence)
	})

	// Sort by level (0, 1, 2, ...) then by ID for consistent ordering
	return result.sort((a, b) => {
		if (a.level !== b.level) return a.level - b.level
		return a.id.localeCompare(b.id)
	})
}
