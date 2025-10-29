/**
 * Graph Layout Optimization
 *
 * Algorithms to minimize connection line lengths in hierarchical graph layout.
 * Uses the Barycenter heuristic for layer-by-layer sweep.
 */

/**
 * Calculate the barycenter (average position) of a node's connections
 * @param {string} nodeId - The practice ID
 * @param {Array} connections - Array of {from, to} connections
 * @param {Map} positions - Map of nodeId to horizontal position
 * @param {boolean} useParents - True to consider parents, false for children
 * @returns {number} Average position of connected nodes
 */
const calculateBarycenter = (nodeId, connections, positions, useParents = true) => {
	const connectedNodes = connections
		.filter(conn => (useParents ? conn.to === nodeId : conn.from === nodeId))
		.map(conn => (useParents ? conn.from : conn.to))
		.filter(id => positions.has(id))

	if (connectedNodes.length === 0) return 0

	const sum = connectedNodes.reduce((acc, id) => acc + positions.get(id), 0)
	return sum / connectedNodes.length
}

/**
 * Build connection map from tree structure
 * @param {Array} flatTree - Flattened tree array with level information
 * @returns {Array} Array of {from: parentId, to: childId} connections
 */
const buildConnectionMap = flatTree => {
	const connections = []
	flatTree.forEach(practice => {
		if (practice.dependencies?.length > 0) {
			practice.dependencies.forEach(dep => {
				connections.push({
					from: practice.id,
					to: dep.id
				})
			})
		}
	})
	return connections
}

/**
 * Optimize node ordering within levels to minimize connection crossings
 * Uses the Barycenter method with bidirectional sweeps
 * Pure function - creates new object instead of mutating
 *
 * @param {Object} groupedByLevel - Practices grouped by level {level: [practices]}
 * @param {number} iterations - Number of optimization passes (default: 3)
 * @returns {Object} Optimized groupedByLevel with reordered practices
 */
export const optimizeLayerOrdering = (groupedByLevel, iterations = 3) => {
	const levels = Object.keys(groupedByLevel)
		.map(Number)
		.sort((a, b) => a - b)

	if (levels.length === 0) return groupedByLevel

	// Flatten to get all practices
	const allPractices = levels.flatMap(level => groupedByLevel[level])

	// Build connection map
	const connections = buildConnectionMap(allPractices)

	// Initialize with current ordering
	let optimized = { ...groupedByLevel }

	// Perform multiple sweep iterations
	for (let iter = 0; iter < iterations; iter++) {
		// Sweep down (top to bottom)
		for (let i = 1; i < levels.length; i++) {
			const level = levels[i]
			const practices = optimized[level]

			// Calculate barycenter for each practice based on parent positions
			const positions = new Map()
			optimized[levels[i - 1]].forEach((p, idx) => positions.set(p.id, idx))

			const withBarycenters = practices.map(practice => ({
				practice,
				barycenter: calculateBarycenter(practice.id, connections, positions, true)
			}))

			// Sort by barycenter
			withBarycenters.sort((a, b) => a.barycenter - b.barycenter)

			// Create new object with updated ordering (immutable)
			optimized = {
				...optimized,
				[level]: withBarycenters.map(item => item.practice)
			}
		}

		// Sweep up (bottom to top)
		for (let i = levels.length - 2; i >= 0; i--) {
			const level = levels[i]
			const practices = optimized[level]

			// Calculate barycenter for each practice based on child positions
			const positions = new Map()
			optimized[levels[i + 1]].forEach((p, idx) => positions.set(p.id, idx))

			const withBarycenters = practices.map(practice => ({
				practice,
				barycenter: calculateBarycenter(practice.id, connections, positions, false)
			}))

			// Sort by barycenter
			withBarycenters.sort((a, b) => a.barycenter - b.barycenter)

			// Create new object with updated ordering (immutable)
			optimized = {
				...optimized,
				[level]: withBarycenters.map(item => item.practice)
			}
		}
	}

	return optimized
}

/**
 * Calculate total connection length for a layout
 * Useful for comparing different layouts
 *
 * @param {Object} groupedByLevel - Practices grouped by level
 * @param {number} cardWidth - Approximate card width in grid units
 * @returns {number} Total connection length (in arbitrary units)
 */
export const calculateTotalConnectionLength = (groupedByLevel, cardWidth = 1) => {
	const levels = Object.keys(groupedByLevel)
		.map(Number)
		.sort((a, b) => a - b)

	// Build position map
	const positions = new Map()
	levels.forEach(level => {
		groupedByLevel[level].forEach((practice, idx) => {
			positions.set(practice.id, { level, x: idx * cardWidth })
		})
	})

	// Calculate total connection length
	let totalLength = 0
	const allPractices = levels.flatMap(level => groupedByLevel[level])

	allPractices.forEach(practice => {
		if (practice.dependencies?.length > 0) {
			const parentPos = positions.get(practice.id)
			practice.dependencies.forEach(dep => {
				const childPos = positions.get(dep.id)
				if (parentPos && childPos) {
					// Euclidean distance
					const dx = parentPos.x - childPos.x
					const dy = (parentPos.level - childPos.level) * 10 // Scale vertical distance
					totalLength += Math.sqrt(dx * dx + dy * dy)
				}
			})
		}
	})

	return totalLength
}

/**
 * Group practices by category within each level
 * This can help create visual clusters and reduce line lengths
 *
 * @param {Object} groupedByLevel - Practices grouped by level
 * @returns {Object} Grouped by level with category-based ordering
 */
export const groupByCategory = groupedByLevel => {
	const result = {}

	Object.keys(groupedByLevel).forEach(level => {
		const practices = groupedByLevel[level]

		// Group by category
		const byCategory = practices.reduce((acc, practice) => {
			const cat = practice.category || 'other'
			if (!acc[cat]) acc[cat] = []
			acc[cat].push(practice)
			return acc
		}, {})

		// Flatten back, sorted by category
		result[level] = Object.keys(byCategory)
			.sort()
			.flatMap(cat => byCategory[cat])
	})

	return result
}
