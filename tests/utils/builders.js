/**
 * Test Data Builders
 *
 * Provides factory functions for creating test data with sensible defaults
 * and easy customization through overrides.
 */

/**
 * Build a practice object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Practice object
 */
export const buildPractice = (overrides = {}) => ({
	id: 'test-practice',
	name: 'Test Practice',
	category: 'behavior',
	categories: ['behavior'],
	description: 'A test practice for unit testing',
	benefits: ['Improved test coverage', 'Better code quality'],
	requirements: [],
	dependencies: [],
	dependencyCount: 0,
	benefitCount: 2,
	...overrides
})

/**
 * Build a practice with dependencies
 * @param {Object} overrides - Properties to override
 * @returns {Object} Practice with dependencies
 */
export const buildPracticeWithDependencies = (overrides = {}) => ({
	...buildPractice(),
	dependencyCount: 3,
	dependencies: [
		buildPractice({ id: 'dep-1', name: 'Dependency 1' }),
		buildPractice({ id: 'dep-2', name: 'Dependency 2' }),
		buildPractice({ id: 'dep-3', name: 'Dependency 3' })
	],
	...overrides
})

/**
 * Build a minimal practice (leaf node)
 * @param {Object} overrides - Properties to override
 * @returns {Object} Minimal practice
 */
export const buildMinimalPractice = (overrides = {}) => ({
	id: 'minimal-practice',
	name: 'Minimal Practice',
	category: 'tooling',
	categories: ['tooling'],
	description: 'Minimal test practice',
	benefits: [],
	requirements: [],
	dependencies: [],
	dependencyCount: 0,
	benefitCount: 0,
	...overrides
})

/**
 * Build a practice for a specific category
 * @param {string} category - Category type
 * @param {Object} overrides - Additional overrides
 * @returns {Object} Practice for category
 */
export const buildPracticeForCategory = (category, overrides = {}) => ({
	...buildPractice(),
	category,
	categories: [category],
	...overrides
})

/**
 * Build an array of practices
 * @param {number} count - Number of practices to create
 * @param {Object} baseOverrides - Base overrides for all practices
 * @returns {Array} Array of practices
 */
export const buildPractices = (count, baseOverrides = {}) => {
	return Array.from({ length: count }, (_, i) =>
		buildPractice({
			...baseOverrides,
			id: `practice-${i + 1}`,
			name: `Practice ${i + 1}`
		})
	)
}

/**
 * Build API response structure
 * @param {Array} data - Practice data
 * @param {Object} overrides - Response overrides
 * @returns {Object} API response
 */
export const buildApiResponse = (data = [], overrides = {}) => ({
	success: true,
	data,
	...overrides
})

/**
 * Build API error response
 * @param {string} message - Error message
 * @param {Object} overrides - Response overrides
 * @returns {Object} Error response
 */
export const buildApiError = (message = 'Test error', overrides = {}) => ({
	success: false,
	error: message,
	...overrides
})
