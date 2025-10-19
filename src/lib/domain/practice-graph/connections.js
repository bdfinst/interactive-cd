/**
 * Pure functions for connection calculations and SVG path generation
 * Following functional programming principles from CLAUDE.md
 */

/**
 * Creates a curved SVG path between two points using cubic bezier
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @returns {string} SVG path string
 */
export const createCurvePath = (x1, y1, x2, y2) => {
	// Calculate the vertical distance between points
	const dy = y2 - y1

	// For vertical connections, use a smooth S-curve
	// Control points are placed vertically between start and end
	const controlOffset = Math.abs(dy) * 0.5

	// Control point 1: offset from start point
	const cx1 = x1
	const cy1 = y1 + controlOffset

	// Control point 2: offset from end point
	const cx2 = x2
	const cy2 = y2 - controlOffset

	// Create cubic bezier path
	return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`
}
