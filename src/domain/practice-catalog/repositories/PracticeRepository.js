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
	 * @param {PracticeId} practiceId
	 * @returns {Promise<CDPractice|null>}
	 */
	async findById(practiceId) {
		throw new Error('Not implemented - override in subclass');
	}

	/**
	 * Find all practices
	 * @returns {Promise<CDPractice[]>}
	 */
	async findAll() {
		throw new Error('Not implemented - override in subclass');
	}

	/**
	 * Find practices by category
	 * @param {PracticeCategory} category
	 * @returns {Promise<CDPractice[]>}
	 */
	async findByCategory(category) {
		throw new Error('Not implemented - override in subclass');
	}

	/**
	 * Find practice prerequisites for a given practice
	 * @param {PracticeId} practiceId
	 * @returns {Promise<Array>}
	 */
	async findPracticePrerequisites(practiceId) {
		throw new Error('Not implemented - override in subclass');
	}

	/**
	 * Find capability prerequisites for a given practice
	 * @param {PracticeId} practiceId
	 * @returns {Promise<Array>}
	 */
	async findCapabilityPrerequisites(practiceId) {
		throw new Error('Not implemented - override in subclass');
	}

	/**
	 * Get the complete practice tree starting from root
	 * @param {PracticeId} rootId
	 * @returns {Promise<Object>}
	 */
	async getPracticeTree(rootId) {
		throw new Error('Not implemented - override in subclass');
	}

	/**
	 * Save a practice
	 * @param {CDPractice} practice
	 * @returns {Promise<void>}
	 */
	async save(practice) {
		throw new Error('Not implemented - override in subclass');
	}
}
