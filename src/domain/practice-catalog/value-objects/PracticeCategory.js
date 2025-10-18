/**
 * PracticeCategory - Value Object (Functional Enum)
 *
 * Represents the category of a CD practice.
 * Practices are behaviors and processes teams adopt.
 *
 * - PRACTICE: Core CD practices (e.g., Continuous Integration)
 * - BEHAVIOR: Team behaviors (e.g., Trunk-based Development)
 * - CULTURE: Organizational culture (e.g., Blameless Culture)
 * - TOOLING: Tools and platforms (e.g., Version Control, CI/CD Pipeline)
 *
 * Note: TOOLING will be moved to CapabilityCategory (platform capabilities) in future iterations
 *
 * Usage:
 *   const category = PracticeCategory.BEHAVIOR
 *   const fromString = PracticeCategory.from('behavior')
 *   console.log(category.name)  // 'behavior'
 *   console.log(category.icon)  // '👥'
 */

/**
 * Create an immutable category object
 * @param {string} name
 * @param {string} icon
 * @returns {Object} Frozen category object
 */
const createCategory = (name, icon) =>
	Object.freeze({
		name,
		icon,
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
const PRACTICE = createCategory('practice', '🔄')
const BEHAVIOR = createCategory('behavior', '👥')
const CULTURE = createCategory('culture', '🌟')
const TOOLING = createCategory('tooling', '🛠️')

// Category lookup map
const CATEGORIES = Object.freeze({
	practice: PRACTICE,
	behavior: BEHAVIOR,
	culture: CULTURE,
	tooling: TOOLING
})

/**
 * Get category from string value
 * @param {string} value - Category name ('practice', 'behavior', 'culture', 'tooling')
 * @returns {Object} Category object
 * @throws {Error} if invalid category
 */
const fromString = value => {
	const category = CATEGORIES[value]

	if (!category) {
		throw new Error(
			`Invalid practice category: "${value}". Must be one of: practice, behavior, culture, tooling`
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
	PRACTICE,
	BEHAVIOR,
	CULTURE,
	TOOLING,

	// Factory method
	from: fromString,

	// Type guard
	is: isCategory
})
