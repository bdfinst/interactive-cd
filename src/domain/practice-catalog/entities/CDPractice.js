/**
 * CDPractice - Entity (Functional)
 *
 * Immutable practice entity using pure functions.
 * All operations return new objects instead of mutating.
 *
 * Usage:
 *   const practice = createCDPractice(id, name, category, description)
 *   const withReq = withRequirement(practice, "Must have CI/CD pipeline")
 *   const withBenefit = withBenefit(withReq, "Faster feedback")
 */

// ============================================================================
// Validation (Pure Functions)
// ============================================================================

const validateRequired = (value, fieldName) => {
	if (!value) {
		throw new Error(`${fieldName} is required`)
	}
}

const validateNonEmptyString = (value, fieldName) => {
	if (!value || value.trim() === '') {
		throw new Error(`${fieldName} is required`)
	}
}

// ============================================================================
// Factory Function (Creates Immutable Practice)
// ============================================================================

/**
 * Create an immutable CDPractice
 * @param {PracticeId} id
 * @param {string} name
 * @param {PracticeCategory} category
 * @param {string} description
 * @param {Object} options - Optional arrays for prerequisites, requirements, benefits
 * @returns {Object} Frozen practice object
 */
export const createCDPractice = (id, name, category, description, options = {}) => {
	// Validate
	validateRequired(id, 'Practice ID')
	validateNonEmptyString(name, 'Practice name')
	validateRequired(category, 'Practice category')
	validateNonEmptyString(description, 'Practice description')

	// Create immutable structure
	return Object.freeze({
		id,
		name: name.trim(),
		category,
		description: description.trim(),
		practicePrerequisites: Object.freeze([...(options.practicePrerequisites || [])]),
		capabilityPrerequisites: Object.freeze([...(options.capabilityPrerequisites || [])]),
		requirements: Object.freeze([...(options.requirements || [])]),
		benefits: Object.freeze([...(options.benefits || [])]),
		quickStartGuide: options.quickStartGuide,
		maturityLevel: options.maturityLevel
	})
}

// ============================================================================
// Transformations (Pure Functions - Return New Practices)
// ============================================================================

/**
 * Add a practice prerequisite (returns new practice)
 * @param {Object} practice
 * @param {PracticeId} practiceId
 * @param {string} rationale
 * @returns {Object} New practice with prerequisite added
 */
export const withPracticePrerequisite = (practice, practiceId, rationale) => {
	validateRequired(practiceId, 'Practice ID')
	validateNonEmptyString(rationale, 'Rationale')

	return createCDPractice(practice.id, practice.name, practice.category, practice.description, {
		...practice,
		practicePrerequisites: [
			...practice.practicePrerequisites,
			Object.freeze({ practiceId, rationale: rationale.trim() })
		]
	})
}

/**
 * Add a capability prerequisite (returns new practice)
 * @param {Object} practice
 * @param {string} capabilityId
 * @param {string} rationale
 * @returns {Object} New practice with prerequisite added
 */
export const withCapabilityPrerequisite = (practice, capabilityId, rationale) => {
	validateNonEmptyString(capabilityId, 'Capability ID')
	validateNonEmptyString(rationale, 'Rationale')

	return createCDPractice(practice.id, practice.name, practice.category, practice.description, {
		...practice,
		capabilityPrerequisites: [
			...practice.capabilityPrerequisites,
			Object.freeze({ capabilityId: capabilityId.trim(), rationale: rationale.trim() })
		]
	})
}

/**
 * Add a requirement (returns new practice)
 * @param {Object} practice
 * @param {string} requirement
 * @returns {Object} New practice with requirement added
 */
export const withRequirement = (practice, requirement) => {
	validateNonEmptyString(requirement, 'Requirement')

	return createCDPractice(practice.id, practice.name, practice.category, practice.description, {
		...practice,
		requirements: [...practice.requirements, requirement.trim()]
	})
}

/**
 * Add multiple requirements (returns new practice)
 * @param {Object} practice
 * @param {string[]} requirements
 * @returns {Object} New practice with requirements added
 */
export const withRequirements = (practice, requirements) =>
	requirements.reduce((p, req) => withRequirement(p, req), practice)

/**
 * Add a benefit (returns new practice)
 * @param {Object} practice
 * @param {string} benefit
 * @returns {Object} New practice with benefit added
 */
export const withBenefit = (practice, benefit) => {
	validateNonEmptyString(benefit, 'Benefit')

	return createCDPractice(practice.id, practice.name, practice.category, practice.description, {
		...practice,
		benefits: [...practice.benefits, benefit.trim()]
	})
}

/**
 * Add multiple benefits (returns new practice)
 * @param {Object} practice
 * @param {string[]} benefits
 * @returns {Object} New practice with benefits added
 */
export const withBenefits = (practice, benefits) =>
	benefits.reduce((p, benefit) => withBenefit(p, benefit), practice)

// ============================================================================
// Queries (Pure Functions)
// ============================================================================

/**
 * Get all prerequisites (both practice and capability)
 * @param {Object} practice
 * @returns {Array} All prerequisites
 */
export const getAllPrerequisites = practice => [
	...practice.practicePrerequisites,
	...practice.capabilityPrerequisites
]

/**
 * Check if practice has any prerequisites
 * @param {Object} practice
 * @returns {boolean}
 */
export const hasPrerequisites = practice =>
	practice.practicePrerequisites.length > 0 || practice.capabilityPrerequisites.length > 0

/**
 * Get requirement count
 * @param {Object} practice
 * @returns {number}
 */
export const getRequirementCount = practice => practice.requirements.length

/**
 * Get benefit count
 * @param {Object} practice
 * @returns {number}
 */
export const getBenefitCount = practice => practice.benefits.length

// ============================================================================
// Composition Helpers (Function Composition)
// ============================================================================

/**
 * Compose practice transformations
 * @param {...Function} fns - Transformation functions
 * @returns {Function} Composed transformation
 */
export const composePractice =
	(...fns) =>
	practice =>
		fns.reduce((p, fn) => fn(p), practice)

/**
 * Pipe practice transformations (left-to-right)
 * @param {...Function} fns - Transformation functions
 * @returns {Function} Piped transformation
 */
export const pipePractice =
	(...fns) =>
	practice =>
		fns.reduce((p, fn) => fn(p), practice)

// ============================================================================
// Example Usage
// ============================================================================

/*
import { PracticeId } from '../value-objects/PracticeId.js'
import { PracticeCategory } from '../value-objects/PracticeCategory.js'

// Create base practice
const practice = createCDPractice(
  PracticeId.from('trunk-based-development'),
  'Trunk-Based Development',
  PracticeCategory.BEHAVIOR,
  'Developers collaborate on a single branch'
)

// Functional composition - build up practice immutably
const fullPractice = pipePractice(
  p => withRequirement(p, 'Team must commit daily'),
  p => withRequirement(p, 'Feature flags for incomplete work'),
  p => withBenefit(p, 'Faster integration'),
  p => withBenefit(p, 'Reduced merge conflicts'),
  p => withPracticePrerequisite(p, PracticeId.from('version-control'), 'Need git repository')
)(practice)

// Or use reduce for dynamic lists
const requirements = ['Daily commits', 'Feature flags', 'Code review']
const withAllReqs = withRequirements(practice, requirements)
*/
