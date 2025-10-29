/**
 * Practice Validator
 *
 * Pure functional validation module for individual practice objects.
 * All functions are pure - same input always produces same output.
 *
 * Following functional programming principles:
 * - Pure functions (no side effects)
 * - Immutability (no mutations)
 * - Composability (small functions compose into larger ones)
 */

// Constants
export const VALID_TYPES = ['practice', 'root']
export const VALID_CATEGORIES = ['automation', 'behavior', 'behavior-enabled-automation', 'core']

// Pure function: Validate practice ID format (kebab-case)
export const isValidPracticeId = id => {
	if (typeof id !== 'string') return false
	if (id.trim() === '') return false

	// Kebab-case pattern: lowercase letters, numbers, hyphens
	const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
	return kebabCasePattern.test(id)
}

// Pure function: Validate practice name
export const isValidPracticeName = name => {
	if (typeof name !== 'string') return false
	if (name.trim() === '') return false
	return name.length >= 3 && name.length <= 200
}

// Pure function: Validate practice type
export const isValidPracticeType = type => {
	if (typeof type !== 'string') return false
	return VALID_TYPES.includes(type)
}

// Pure function: Validate practice category
export const isValidPracticeCategory = category => {
	if (typeof category !== 'string') return false
	return VALID_CATEGORIES.includes(category)
}

// Pure function: Validate practice description
export const isValidPracticeDescription = description => {
	if (typeof description !== 'string') return false
	if (description.trim() === '') return false
	return description.length >= 10 && description.length <= 2000
}

// Pure function: Validate requirements array
export const isValidRequirements = requirements => {
	if (!Array.isArray(requirements)) return false
	if (requirements.length === 0) return false // Empty array is invalid

	// Protect against prototype pollution - verify array methods are available
	if (typeof requirements.every !== 'function') return false

	// Check for sparse arrays - all indices must have values (no undefined)
	for (let i = 0; i < requirements.length; i++) {
		if (requirements[i] === undefined) return false
	}

	// All items must be non-empty strings
	return requirements.every(
		req => typeof req === 'string' && req.trim() !== '' && req.length >= 3 && req.length <= 500
	)
}

// Pure function: Validate benefits array
export const isValidBenefits = benefits => {
	if (!Array.isArray(benefits)) return false
	if (benefits.length === 0) return false // Empty array is invalid

	// Protect against prototype pollution - verify array methods are available
	if (typeof benefits.every !== 'function') return false

	// Check for sparse arrays - all indices must have values (no undefined)
	for (let i = 0; i < benefits.length; i++) {
		if (benefits[i] === undefined) return false
	}

	// All items must be non-empty strings
	return benefits.every(
		benefit =>
			typeof benefit === 'string' &&
			benefit.trim() !== '' &&
			benefit.length >= 3 &&
			benefit.length <= 500
	)
}

// Pure function: Validate all required fields are present and valid
export const validatePracticeFields = practice => {
	const requiredFields = [
		'id',
		'name',
		'type',
		'category',
		'description',
		'requirements',
		'benefits'
	]

	const errors = {}

	// Check for missing fields
	const missingFields = requiredFields.filter(field => !(field in practice))
	missingFields.forEach(field => {
		errors[field] = `Missing required field: ${field}`
	})

	// If fields are missing, return early
	if (missingFields.length > 0) {
		return {
			isValid: false,
			errors
		}
	}

	// Validate field values
	if (!isValidPracticeId(practice.id)) {
		errors.id = `Invalid practice ID format: "${practice.id}". Must be kebab-case (e.g., "continuous-integration")`
	}

	if (!isValidPracticeName(practice.name)) {
		errors.name = `Invalid practice name: "${practice.name}". Must be 3-200 characters and non-empty`
	}

	if (!isValidPracticeType(practice.type)) {
		errors.type = `Invalid practice type: "${practice.type}". Must be one of: ${VALID_TYPES.join(', ')}`
	}

	if (!isValidPracticeCategory(practice.category)) {
		errors.category = `Invalid practice category: "${practice.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`
	}

	if (!isValidPracticeDescription(practice.description)) {
		errors.description = `Invalid practice description. Must be 10-2000 characters and non-empty`
	}

	if (!isValidRequirements(practice.requirements)) {
		if (!Array.isArray(practice.requirements)) {
			errors.requirements = 'Requirements must be an array'
		} else if (practice.requirements.length === 0) {
			errors.requirements = 'Requirements must contain at least one item'
		} else {
			errors.requirements = 'All requirements must be non-empty strings (3-500 characters)'
		}
	}

	if (!isValidBenefits(practice.benefits)) {
		if (!Array.isArray(practice.benefits)) {
			errors.benefits = 'Benefits must be an array'
		} else if (practice.benefits.length === 0) {
			errors.benefits = 'Benefits must contain at least one item'
		} else {
			errors.benefits = 'All benefits must be non-empty strings (3-500 characters)'
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	}
}

// Pure function: Validate a complete practice object
export const validatePractice = practice => {
	// Check if practice is an object
	if (!practice || typeof practice !== 'object' || Array.isArray(practice)) {
		return {
			isValid: false,
			errors: { practice: 'Practice must be an object' },
			practice: null
		}
	}

	// Validate all fields (presence and validity)
	const fieldValidation = validatePracticeFields(practice)

	return {
		isValid: fieldValidation.isValid,
		errors: fieldValidation.errors,
		practice
	}
}

// Pure function: Validate array of practices
export const validatePractices = practices => {
	if (!Array.isArray(practices)) {
		return {
			isValid: false,
			errors: ['Practices must be an array']
		}
	}

	const results = practices.map((practice, index) => {
		const validation = validatePractice(practice)
		return {
			index,
			practiceId: practice?.id || `unknown-${index}`,
			...validation
		}
	})

	const failures = results.filter(r => !r.isValid)

	return {
		isValid: failures.length === 0,
		errors: failures.flatMap(f => {
			// Convert errors object to array of error messages
			return Object.entries(f.errors).map(([_field, message]) => `[${f.practiceId}] ${message}`)
		}),
		results
	}
}
