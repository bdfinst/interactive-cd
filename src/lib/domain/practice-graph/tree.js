/**
 * Pure functions for tree operations
 * Following functional programming principles from CLAUDE.md
 */

/**
 * Flattens a hierarchical tree structure into a flat array with levels
 * @param {Object} node - Tree node with dependencies
 * @param {number} level - Current depth level (default: 0)
 * @param {Array} result - Accumulated result array (default: [])
 * @returns {Array} Flattened tree with level information
 */
export const flattenTree = (node, level = 0, result = []) => {
	if (!node) return result

	result.push({
		...node,
		level
	})

	if (node.dependencies?.length > 0) {
		node.dependencies.forEach(dep => {
			flattenTree(dep, level + 1, result)
		})
	}

	return result
}
