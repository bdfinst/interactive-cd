/**
 * PracticeCategory - Value Object (Functional Enum)
 *
 * Represents the category of a CD practice based on the 2015 CD dependency model.
 *
 * Usage:
 *   const category = PracticeCategory.BEHAVIOR
 *   const fromString = PracticeCategory.from('behavior')
 *   console.log(category.name)  // 'behavior'
 */

/**
 * Create an immutable category object
 * @param {string} name
 * @returns {Object} Frozen category object
 */
const createCategory = name =>
	Object.freeze({
		name,
		toString: () => name,
		equals: other => {
			if (!other || other._type !== 'PracticeCategory') {
				return false
			}
			return other.name === name
		},
		_type: 'PracticeCategory'
	})

// Predefined category instances (frozen)
const AUTOMATION = createCategory('automation')
const BEHAVIOR = createCategory('behavior')
const BEHAVIOR_ENABLED_AUTOMATION = createCategory('behavior-enabled-automation')
const CORE = createCategory('core')

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
