/**
 * CDPractice - Entity (Aggregate Root)
 *
 * Represents a Continuous Delivery practice that teams adopt.
 * Contains both practice and capability prerequisites.
 *
 * Domain behavior:
 * - Add practice prerequisites (depends on other practices)
 * - Add capability prerequisites (depends on platform capabilities)
 * - Add requirements and benefits
 * - Validate prerequisites
 */
export class CDPractice {
	#id;
	#name;
	#category;
	#description;
	#practicePrerequisites = [];
	#capabilityPrerequisites = [];
	#requirements = [];
	#benefits = [];

	constructor(id, name, category, description) {
		// Validate required fields
		if (!id) {
			throw new Error('Practice ID is required');
		}
		if (!name || name.trim() === '') {
			throw new Error('Practice name is required');
		}
		if (!category) {
			throw new Error('Practice category is required');
		}
		if (!description || description.trim() === '') {
			throw new Error('Practice description is required');
		}

		this.#id = id;
		this.#name = name.trim();
		this.#category = category;
		this.#description = description.trim();
	}

	// Getters - expose internal state
	get id() {
		return this.#id;
	}

	get name() {
		return this.#name;
	}

	get category() {
		return this.#category;
	}

	get description() {
		return this.#description;
	}

	get practicePrerequisites() {
		return [...this.#practicePrerequisites];
	}

	get capabilityPrerequisites() {
		return [...this.#capabilityPrerequisites];
	}

	get requirements() {
		return [...this.#requirements];
	}

	get benefits() {
		return [...this.#benefits];
	}

	/**
	 * Add a practice prerequisite
	 * @param {PracticeId} practiceId - The prerequisite practice ID
	 * @param {string} rationale - Why this prerequisite is needed
	 */
	requiresPractice(practiceId, rationale) {
		if (!practiceId) {
			throw new Error('Practice ID is required for prerequisite');
		}
		if (!rationale || rationale.trim() === '') {
			throw new Error('Rationale is required for prerequisite');
		}

		this.#practicePrerequisites.push({
			practiceId,
			rationale: rationale.trim()
		});
	}

	/**
	 * Add a capability prerequisite
	 * @param {string} capabilityId - The prerequisite capability ID
	 * @param {string} rationale - Why this capability is needed
	 */
	requiresCapability(capabilityId, rationale) {
		if (!capabilityId || capabilityId.trim() === '') {
			throw new Error('Capability ID is required for prerequisite');
		}
		if (!rationale || rationale.trim() === '') {
			throw new Error('Rationale is required for prerequisite');
		}

		this.#capabilityPrerequisites.push({
			capabilityId: capabilityId.trim(),
			rationale: rationale.trim()
		});
	}

	/**
	 * Add a requirement for implementing this practice
	 * @param {string} requirement - The requirement text
	 */
	addRequirement(requirement) {
		if (!requirement || requirement.trim() === '') {
			throw new Error('Requirement cannot be empty');
		}

		this.#requirements.push(requirement.trim());
	}

	/**
	 * Add a benefit of adopting this practice
	 * @param {string} benefit - The benefit text
	 */
	addBenefit(benefit) {
		if (!benefit || benefit.trim() === '') {
			throw new Error('Benefit cannot be empty');
		}

		this.#benefits.push(benefit.trim());
	}

	/**
	 * Get all requirements
	 * @returns {string[]} - Copy of requirements array
	 */
	getRequirements() {
		return [...this.#requirements];
	}

	/**
	 * Get all benefits
	 * @returns {string[]} - Copy of benefits array
	 */
	getBenefits() {
		return [...this.#benefits];
	}

	/**
	 * Get all prerequisites (both practice and capability)
	 * @returns {Array} - All prerequisites
	 */
	getAllPrerequisites() {
		return [...this.#practicePrerequisites, ...this.#capabilityPrerequisites];
	}

	/**
	 * Check if this practice has any prerequisites
	 * @returns {boolean}
	 */
	hasPrerequisites() {
		return this.#practicePrerequisites.length > 0 || this.#capabilityPrerequisites.length > 0;
	}

	/**
	 * Get count of requirements
	 * @returns {number}
	 */
	getRequirementCount() {
		return this.#requirements.length;
	}

	/**
	 * Get count of benefits
	 * @returns {number}
	 */
	getBenefitCount() {
		return this.#benefits.length;
	}
}
