/**
 * Color Constants for CD Practices
 *
 * Single source of truth for category colors and Tailwind classes.
 * Colors are defined in src/app.css as CSS custom properties (@theme directive).
 *
 * This file exports:
 * - Tailwind class names (for static elements like CategoryLegend)
 * - Hex color values (for dynamic elements like GraphNode with color intensity)
 *
 * Color mixing approach:
 * - Primary colors are mixed with 80% white for a light, pastel appearance
 * - Calculation: (primaryColor × 0.2) + (white × 0.8)
 */

/**
 * Category color and Tailwind class definitions
 *
 * Each category has:
 * - color: Hex value matching CSS custom property in app.css
 * - bgClass: Tailwind utility class (bg-category-{name})
 */
const CATEGORY_DEFINITIONS = Object.freeze({
	automation: {
		color: '#ffffcc', // Primary yellow (255,255,0) with 80% white
		bgClass: 'bg-category-automation'
	},
	behavior: {
		color: '#ccccff', // Primary blue (0,0,255) with 80% white
		bgClass: 'bg-category-behavior'
	},
	'behavior-enabled-automation': {
		color: '#d7f8d7', // Green pastel
		bgClass: 'bg-category-behavior-enabled'
	},
	core: {
		color: '#e9d5ff', // Light purple
		bgClass: 'bg-category-core'
	}
})

/**
 * Hex color values for categories
 * Use for inline styles with dynamic color intensity
 */
export const CATEGORY_COLORS = Object.freeze(
	Object.fromEntries(Object.entries(CATEGORY_DEFINITIONS).map(([key, val]) => [key, val.color]))
)

/**
 * Tailwind background color classes for categories
 * Use for static elements where color doesn't change
 */
export const CATEGORY_BG_CLASSES = Object.freeze(
	Object.fromEntries(Object.entries(CATEGORY_DEFINITIONS).map(([key, val]) => [key, val.bgClass]))
)

/**
 * Category metadata including colors, classes, and descriptions
 * Builds on CATEGORY_DEFINITIONS with additional display information
 */
const CATEGORY_METADATA_DEFINITIONS = [
	{
		name: 'Automation',
		key: 'automation',
		description: 'Tools and automation platforms'
	},
	{
		name: 'Behavior',
		key: 'behavior',
		description: 'Team behaviors and processes'
	},
	{
		name: 'Behavior Enabled',
		key: 'behavior-enabled-automation',
		description: 'Automation that depends on behavioral practices'
	},
	{
		name: 'Core',
		key: 'core',
		description: 'Core Continuous Delivery practice'
	}
]

/**
 * Category metadata including colors and descriptions
 */
export const CATEGORY_METADATA = Object.freeze(
	CATEGORY_METADATA_DEFINITIONS.map(meta => ({
		...meta,
		color: CATEGORY_DEFINITIONS[meta.key].color,
		bgClass: CATEGORY_DEFINITIONS[meta.key].bgClass
	}))
)
