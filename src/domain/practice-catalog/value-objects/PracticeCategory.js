/**
 * PracticeCategory - Value Object (Enumeration)
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
 */
export class PracticeCategory {
	#name
	#icon

	constructor(name, icon, isStatic = false) {
		// Prevent direct instantiation - only allow predefined static instances
		if (!isStatic) {
			throw new Error(
				'Cannot instantiate PracticeCategory directly. Use PracticeCategory.from() or static constants.'
			)
		}

		this.#name = name
		this.#icon = icon

		// Freeze to prevent modifications
		Object.freeze(this)
	}

	static PRACTICE = new PracticeCategory('practice', '🔄', true)
	static BEHAVIOR = new PracticeCategory('behavior', '👥', true)
	static CULTURE = new PracticeCategory('culture', '🌟', true)
	static TOOLING = new PracticeCategory('tooling', '🛠️', true)

	/**
	 * Factory method to create a PracticeCategory from a string
	 * @param {string} value - The category name ('practice', 'behavior', 'culture', 'tooling')
	 * @returns {PracticeCategory}
	 */
	static from(value) {
		const categories = {
			practice: PracticeCategory.PRACTICE,
			behavior: PracticeCategory.BEHAVIOR,
			culture: PracticeCategory.CULTURE,
			tooling: PracticeCategory.TOOLING
		}

		const category = categories[value]

		if (!category) {
			throw new Error(
				`Invalid practice category: "${value}". Must be one of: practice, behavior, culture, tooling`
			)
		}

		return category
	}

	/**
	 * Compare this category with another for equality
	 * @param {PracticeCategory} other - Another category
	 * @returns {boolean}
	 */
	equals(other) {
		if (!other || !(other instanceof PracticeCategory)) {
			return false
		}
		return this.#name === other.#name
	}

	/**
	 * Get string representation
	 * @returns {string}
	 */
	toString() {
		return this.#name
	}

	/**
	 * Get the category icon
	 * @returns {string}
	 */
	get icon() {
		return this.#icon
	}

	/**
	 * Get the category name
	 * @returns {string}
	 */
	get name() {
		return this.#name
	}

	/**
	 * Prevent setting name from outside
	 */
	set name(value) {
		throw new Error('PracticeCategory is immutable')
	}

	/**
	 * Prevent setting icon from outside
	 */
	set icon(value) {
		throw new Error('PracticeCategory is immutable')
	}
}
