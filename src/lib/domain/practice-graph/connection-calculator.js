/**
 * Connection Calculator - Pure functions for calculating SVG connection paths
 * Following functional programming principles from CLAUDE.md
 */

/**
 * Calculate center point of an element relative to container
 * @param {DOMRect} rect - Element bounding rectangle
 * @param {DOMRect} containerRect - Container bounding rectangle
 * @returns {{x: number, y: number, bottom: number}} Center coordinates
 */
const getRelativeCenter = (rect, containerRect) => ({
	x: rect.left - containerRect.left + rect.width / 2,
	y: rect.top - containerRect.top,
	bottom: rect.bottom - containerRect.top
})

/**
 * Create a connection object between two points
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {string} type - Connection type ('ancestor', 'dependency', 'selected')
 * @returns {{x1: number, y1: number, x2: number, y2: number, type: string}}
 */
export const createConnection = (x1, y1, x2, y2, type) => ({
	x1,
	y1,
	x2,
	y2,
	type
})

/**
 * Calculate connections between ancestor nodes
 * @param {HTMLElement[]} ancestorRefs - Array of ancestor DOM elements
 * @param {DOMRect} containerRect - Container bounding rectangle
 * @returns {Array} Array of connection objects
 */
export const calculateAncestorConnections = (ancestorRefs, containerRect) => {
	if (!ancestorRefs || ancestorRefs.length === 0) return []

	const connections = []

	for (let i = 0; i < ancestorRefs.length - 1; i++) {
		const currentRef = ancestorRefs[i]
		const nextRef = ancestorRefs[i + 1]

		if (currentRef && nextRef) {
			const current = getRelativeCenter(currentRef.getBoundingClientRect(), containerRect)
			const next = getRelativeCenter(nextRef.getBoundingClientRect(), containerRect)

			connections.push(createConnection(current.x, current.bottom, next.x, next.y, 'ancestor'))
		}
	}

	return connections
}

/**
 * Calculate connection from last ancestor to current node
 * @param {HTMLElement} lastAncestorRef - Last ancestor DOM element
 * @param {HTMLElement} currentRef - Current node DOM element
 * @param {DOMRect} containerRect - Container bounding rectangle
 * @returns {Object|null} Connection object or null
 */
export const calculateAncestorToCurrentConnection = (
	lastAncestorRef,
	currentRef,
	containerRect
) => {
	if (!lastAncestorRef || !currentRef) return null

	const ancestor = getRelativeCenter(lastAncestorRef.getBoundingClientRect(), containerRect)
	const current = getRelativeCenter(currentRef.getBoundingClientRect(), containerRect)

	return createConnection(ancestor.x, ancestor.bottom, current.x, current.y, 'ancestor')
}

/**
 * Calculate connections from current node to dependencies
 * @param {HTMLElement} currentRef - Current node DOM element
 * @param {HTMLElement[]} dependencyRefs - Array of dependency DOM elements
 * @param {Array} dependencies - Array of practice objects
 * @param {string} selectedNodeId - Currently selected node ID
 * @param {DOMRect} containerRect - Container bounding rectangle
 * @returns {Array} Array of connection objects
 */
export const calculateDependencyConnections = (
	currentRef,
	dependencyRefs,
	dependencies,
	selectedNodeId,
	containerRect
) => {
	if (!currentRef || !dependencyRefs || dependencyRefs.length === 0) return []

	const currentRect = currentRef.getBoundingClientRect()
	const current = getRelativeCenter(currentRect, containerRect)

	return dependencyRefs
		.filter(ref => ref !== null)
		.map((ref, index) => {
			const dep = getRelativeCenter(ref.getBoundingClientRect(), containerRect)
			const isSelected = dependencies[index] && selectedNodeId === dependencies[index].id

			return createConnection(
				current.x,
				current.bottom,
				dep.x,
				dep.y,
				isSelected ? 'selected' : 'dependency'
			)
		})
}

/**
 * Calculate all graph connections (drill-down view)
 * Pure function that calculates connections between nodes
 * @param {HTMLElement} containerRef - Container element
 * @param {HTMLElement[]} ancestorRefs - Array of ancestor elements
 * @param {HTMLElement} currentRef - Current node element
 * @param {HTMLElement[]} dependencyRefs - Array of dependency elements
 * @param {Array} dependencies - Array of practice objects
 * @param {string} selectedNodeId - Currently selected node ID
 * @returns {Array} Array of all connection objects
 */
export const calculateGraphConnections = (
	containerRef,
	ancestorRefs,
	currentRef,
	dependencyRefs,
	dependencies,
	selectedNodeId
) => {
	if (!containerRef) return []

	const containerRect = containerRef.getBoundingClientRect()

	// Calculate ancestor connections
	const ancestorConns = calculateAncestorConnections(ancestorRefs, containerRect)

	// Calculate ancestor-to-current connection
	const lastAncestorRef = ancestorRefs && ancestorRefs[ancestorRefs.length - 1]
	const ancestorToCurrentConn = lastAncestorRef
		? calculateAncestorToCurrentConnection(lastAncestorRef, currentRef, containerRect)
		: null

	// Calculate dependency connections
	const dependencyConns = calculateDependencyConnections(
		currentRef,
		dependencyRefs,
		dependencies,
		selectedNodeId,
		containerRect
	)

	// Combine all connections
	return [
		...ancestorConns,
		...(ancestorToCurrentConn ? [ancestorToCurrentConn] : []),
		...dependencyConns
	]
}
