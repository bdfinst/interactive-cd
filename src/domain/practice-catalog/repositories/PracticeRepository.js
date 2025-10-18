/**
 * PracticeRepository - Repository Interface (Functional)
 *
 * Defines the contract for practice persistence.
 * Domain layer defines the interface, infrastructure layer implements it.
 *
 * This is the "port" in hexagonal architecture.
 *
 * Usage:
 *   const repository = createPostgresPracticeRepository(dbClient)
 *   const practice = await repository.findById(practiceId)
 */

/**
 * Create a stub repository (throws "Not implemented" for all methods)
 * This serves as the interface definition
 *
 * @returns {Object} Repository object with method stubs
 */
export const createPracticeRepository = () => ({
	/**
	 * Find a practice by its ID
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<CDPractice|null>}
	 */
	findById: async _practiceId => {
		throw new Error('Not implemented - override in subclass')
	},

	/**
	 * Find all practices
	 * @returns {Promise<CDPractice[]>}
	 */
	findAll: async () => {
		throw new Error('Not implemented - override in subclass')
	},

	/**
	 * Find practices by category
	 * @param {PracticeCategory} _category
	 * @returns {Promise<CDPractice[]>}
	 */
	findByCategory: async _category => {
		throw new Error('Not implemented - override in subclass')
	},

	/**
	 * Find practice prerequisites for a given practice
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<Array>}
	 */
	findPracticePrerequisites: async _practiceId => {
		throw new Error('Not implemented - override in subclass')
	},

	/**
	 * Find capability prerequisites for a given practice
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<Array>}
	 */
	findCapabilityPrerequisites: async _practiceId => {
		throw new Error('Not implemented - override in subclass')
	},

	/**
	 * Get the complete practice tree starting from root
	 * @param {PracticeId} _rootId
	 * @returns {Promise<Object>}
	 */
	getPracticeTree: async _rootId => {
		throw new Error('Not implemented - override in subclass')
	},

	/**
	 * Save a practice
	 * @param {CDPractice} _practice
	 * @returns {Promise<void>}
	 */
	save: async _practice => {
		throw new Error('Not implemented - override in subclass')
	}
})
