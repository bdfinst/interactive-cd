/**
 * PracticeId - Value Object
 *
 * Type-safe identifier for CD practices.
 * Enforces kebab-case format (e.g., "continuous-integration")
 * Immutable - once created, cannot be changed.
 */
export class PracticeId {
	#value

	constructor(value) {
		if (!value || typeof value !== 'string' || value.trim() === '') {
			throw new Error('Practice ID cannot be empty')
		}

		const trimmedValue = value.trim()

		// Validate kebab-case format: lowercase letters, numbers, and hyphens only
		const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
		if (!kebabCasePattern.test(trimmedValue)) {
			throw new Error('Practice ID must be in kebab-case format (e.g., "continuous-integration")')
		}

		this.#value = trimmedValue

		// Freeze object to prevent modifications
		Object.freeze(this)
	}

	/**
	 * Factory method to create a PracticeId from a string
	 * @param {string} value - The ID value
	 * @returns {PracticeId}
	 */
	static from(value) {
		return new PracticeId(value)
	}

	/**
	 * Compare this PracticeId with another for equality
	 * @param {PracticeId} other - Another PracticeId
	 * @returns {boolean}
	 */
	equals(other) {
		if (!other || !(other instanceof PracticeId)) {
			return false
		}
		return this.#value === other.#value
	}

	/**
	 * Get string representation of this ID
	 * @returns {string}
	 */
	toString() {
		return this.#value
	}

	/**
	 * Get the raw value (for serialization)
	 * @returns {string}
	 */
	get value() {
		return this.#value
	}

	/**
	 * Prevent setting value from outside
	 */
	set value(newValue) {
		throw new Error('PracticeId is immutable')
	}
}
