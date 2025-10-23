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
 * Count total number of unique dependencies recursively (direct + indirect)
 * @param {Object} node - Tree node with dependencies
 * @param {Set} visited - Set of already visited practice IDs (to avoid cycles)
 * @returns {number} Total count of unique dependencies
 */
const countTotalDependencies = (node, visited = new Set()) => {
	if (!node || !node.dependencies) return 0

	let total = 0
	node.dependencies.forEach(dep => {
		// Only count if not already visited (avoids duplicates)
		if (!visited.has(dep.id)) {
			visited.add(dep.id)
			total += 1 // Count this dependency
			total += countTotalDependencies(dep, visited) // Count its dependencies
		}
	})

	return total
}

/**
 * Enriches each node with dependency count information
 * @param {Object} node - Tree node with dependencies
 * @returns {Object} Node with added directDependencyCount and totalDependencyCount
 */
export const enrichWithDependencyCounts = node => {
	if (!node) return null

	const directCount = node.dependencies?.length || 0
	const totalCount = countTotalDependencies(node)

	const enriched = {
		...node,
		directDependencyCount: directCount,
		totalDependencyCount: totalCount,
		dependencyCount: directCount // Keep for backward compatibility
	}

	// Recursively enrich dependencies
	if (node.dependencies && node.dependencies.length > 0) {
		enriched.dependencies = node.dependencies.map(dep => enrichWithDependencyCounts(dep))
	}

	return enriched
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
