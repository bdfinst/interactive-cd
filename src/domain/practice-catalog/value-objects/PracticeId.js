/**
 * PracticeId - Value Object (Functional)
 *
 * Type-safe identifier for CD practices.
 * Enforces kebab-case format (e.g., "continuous-integration")
 * Immutable - once created, cannot be changed.
 *
 * Usage:
 *   const id = PracticeId.from('continuous-integration')
 *   console.log(id.value)  // 'continuous-integration'
 *   console.log(id.toString())  // 'continuous-integration'
 */

const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Validate practice ID value
 * @param {string} value
 * @throws {Error} if invalid
 */
const validatePracticeId = value => {
	if (!value || typeof value !== 'string' || value.trim() === '') {
		throw new Error('Practice ID cannot be empty')
	}

	const trimmedValue = value.trim()

	if (!KEBAB_CASE_PATTERN.test(trimmedValue)) {
		throw new Error('Practice ID must be in kebab-case format (e.g., "continuous-integration")')
	}

	return trimmedValue
}

/**
 * Create a PracticeId value object
 * @param {string} value - The ID value
 * @returns {Object} Frozen PracticeId object
 */
const createPracticeId = value => {
	const validatedValue = validatePracticeId(value)

	return Object.freeze({
		value: validatedValue,
		toString: () => validatedValue,
		equals: other => {
			if (!other || other._type !== 'PracticeId') {
				return false
			}
			return other.value === validatedValue
		},
		_type: 'PracticeId' // Type marker for runtime type checking
	})
}

/**
 * PracticeId factory with static from method
 */
export const PracticeId = {
	/**
	 * Factory method to create a PracticeId from a string
	 * @param {string} value - The ID value
	 * @returns {Object} PracticeId object
	 */
	from: createPracticeId,

	/**
	 * Check if an object is a PracticeId
	 * @param {any} obj
	 * @returns {boolean}
	 */
	is: obj => obj && obj._type === 'PracticeId'
}
