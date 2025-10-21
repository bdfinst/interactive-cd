/**
 * PracticeCategory - Value Object (Functional Enum)
 *
 * Represents the category of a CD practice based on the 2015 CD dependency model.
 * Categories indicate the type of practice and are visualized with background colors:
 *
 * - AUTOMATION: Tools and automation platforms (red/pink background: #f9d5d3)
 * - BEHAVIOR: Team behaviors and processes (blue background: #d7e6ff)
 * - BEHAVIOR_ENABLED_AUTOMATION: Automation that depends on behavioral practices (green background: #d7f8d7)
 * - CORE: The core Continuous Delivery practice (yellow background: #ffe66a)
 *
 * Usage:
 *   const category = PracticeCategory.BEHAVIOR
 *   const fromString = PracticeCategory.from('behavior')
 *   console.log(category.name)  // 'behavior'
 *   console.log(category.color) // '#d7e6ff'
 */

/**
 * Create an immutable category object
 * @param {string} name
 * @param {string} color - Background color from mermaid diagram
 * @returns {Object} Frozen category object
 */
const createCategory = (name, color) =>
	Object.freeze({
		name,
		color,
		toString: () => name,
		equals: other => {
			if (!other || other._type !== 'PracticeCategory') {
				return false
			}
			return other.name === name
		},
		_type: 'PracticeCategory'
	})

// Predefined category instances (frozen) with colors from mermaid diagram
const AUTOMATION = createCategory('automation', '#f9d5d3')
const BEHAVIOR = createCategory('behavior', '#d7e6ff')
const BEHAVIOR_ENABLED_AUTOMATION = createCategory('behavior-enabled-automation', '#d7f8d7')
const CORE = createCategory('core', '#fff9e6')

// Category lookup map
const CATEGORIES = Object.freeze({
	automation: AUTOMATION,
	behavior: BEHAVIOR,
	'behavior-enabled-automation': BEHAVIOR_ENABLED_AUTOMATION,
	core: CORE
})

/**
 * Get category from string value
 * @param {string} value - Category name ('automation', 'behavior', 'behavior-enabled-automation', 'core')
 * @returns {Object} Category object
 * @throws {Error} if invalid category
 */
const fromString = value => {
	const category = CATEGORIES[value]

	if (!category) {
		throw new Error(
			`Invalid practice category: "${value}". Must be one of: automation, behavior, behavior-enabled-automation, core`
		)
	}

	return category
}

/**
 * Check if object is a PracticeCategory
 * @param {any} obj
 * @returns {boolean}
 */
const isCategory = obj => obj && obj._type === 'PracticeCategory'

/**
 * PracticeCategory namespace with enum-like static properties
 */
export const PracticeCategory = Object.freeze({
	// Static category instances
	AUTOMATION,
	BEHAVIOR,
	BEHAVIOR_ENABLED_AUTOMATION,
	CORE,

	// Factory method
	from: fromString,

	// Type guard
	is: isCategory
})
