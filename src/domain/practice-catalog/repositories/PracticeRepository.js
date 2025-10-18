/**
 * PracticeRepository - Repository Interface
 *
 * Defines the contract for practice persistence.
 * Domain layer defines the interface, infrastructure layer implements it.
 *
 * This is the "port" in hexagonal architecture.
 */
export class PracticeRepository {
	/**
	 * Find a practice by its ID
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<CDPractice|null>}
	 */
	async findById(_practiceId) {
		throw new Error('Not implemented - override in subclass')
	}

	/**
	 * Find all practices
	 * @returns {Promise<CDPractice[]>}
	 */
	async findAll() {
		throw new Error('Not implemented - override in subclass')
	}

	/**
	 * Find practices by category
	 * @param {PracticeCategory} _category
	 * @returns {Promise<CDPractice[]>}
	 */
	async findByCategory(_category) {
		throw new Error('Not implemented - override in subclass')
	}

	/**
	 * Find practice prerequisites for a given practice
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<Array>}
	 */
	async findPracticePrerequisites(_practiceId) {
		throw new Error('Not implemented - override in subclass')
	}

	/**
	 * Find capability prerequisites for a given practice
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<Array>}
	 */
	async findCapabilityPrerequisites(_practiceId) {
		throw new Error('Not implemented - override in subclass')
	}

	/**
	 * Get the complete practice tree starting from root
	 * @param {PracticeId} _rootId
	 * @returns {Promise<Object>}
	 */
	async getPracticeTree(_rootId) {
		throw new Error('Not implemented - override in subclass')
	}

	/**
	 * Save a practice
	 * @param {CDPractice} _practice
	 * @returns {Promise<void>}
	 */
	async save(_practice) {
		throw new Error('Not implemented - override in subclass')
	}
}
