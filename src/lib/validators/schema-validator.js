/**
 * Schema Validator
 *
 * Pure functional validation module for the complete CD practices schema.
 * Orchestrates validation of practices, dependencies, and metadata.
 * All functions are pure - same input always produces same output.
 *
 * Following functional programming principles:
 * - Pure functions (no side effects)
 * - Immutability (no mutations)
 * - Composability (small functions compose into larger ones)
 */

import { validatePractices } from './practice-validator.js'
import { validateDependencies, findCircularDependencies } from './dependency-validator.js'
import { validateMetadata } from './metadata-validator.js'

// Pure function: Validate schema structure (top-level fields)
export const validateSchemaStructure = schema => {
	if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
		return {
			isValid: false,
			errors: {
				schema: 'Schema must be an object'
			}
		}
	}

	const errors = {}

	// Validate practices field
	if (!('practices' in schema)) {
		errors.practices = 'Field "practices" is required'
	} else if (!Array.isArray(schema.practices)) {
		errors.practices = 'Field "practices" must be an array'
	} else if (schema.practices.length === 0) {
		errors.practices = 'Field "practices" must contain at least one practice'
	}

	// Validate dependencies field
	if (!('dependencies' in schema)) {
		errors.dependencies = 'Field "dependencies" is required'
	} else if (!Array.isArray(schema.dependencies)) {
		errors.dependencies = 'Field "dependencies" must be an array'
	}

	// Validate metadata field
	if (!('metadata' in schema)) {
		errors.metadata = 'Field "metadata" is required'
	} else if (
		!schema.metadata ||
		typeof schema.metadata !== 'object' ||
		Array.isArray(schema.metadata)
	) {
		errors.metadata = 'Field "metadata" must be an object'
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	}
}

// Pure function: Find duplicate practice IDs (returns array of ID strings)
export const findDuplicatePracticeIds = practices => {
	const idCounts = new Map()

	practices.forEach(practice => {
		const id = practice.id
		idCounts.set(id, (idCounts.get(id) || 0) + 1)
	})

	const duplicates = []
	idCounts.forEach((count, id) => {
		if (count > 1) {
			duplicates.push(id)
		}
	})

	return duplicates
}

// Helper function: Find duplicate practice IDs with indices
const findDuplicatePracticeIdsWithIndices = practices => {
	const idCounts = new Map()
	const duplicates = []

	practices.forEach((practice, index) => {
		const id = practice.id
		if (!idCounts.has(id)) {
			idCounts.set(id, [index])
		} else {
			idCounts.get(id).push(index)
		}
	})

	idCounts.forEach((indices, id) => {
		if (indices.length > 1) {
			duplicates.push({ id, indices })
		}
	})

	return duplicates
}

// Pure function: Validate practice IDs are unique
export const validatePracticeIds = practices => {
	const duplicates = findDuplicatePracticeIdsWithIndices(practices)

	if (duplicates.length === 0) {
		return {
			isValid: true,
			errors: []
		}
	}

	const errors = duplicates.map(
		dup => `Duplicate practice ID "${dup.id}" found at indices: ${dup.indices.join(', ')}`
	)

	return {
		isValid: false,
		errors
	}
}

// Pure function: Validate schema has exactly one root practice
export const validateRootPractice = practices => {
	const rootPractices = practices.filter(p => p.type === 'root')

	if (rootPractices.length === 0) {
		return {
			isValid: false,
			errors: ['Schema must contain exactly one root practice (type: "root")']
		}
	}

	if (rootPractices.length > 1) {
		return {
			isValid: false,
			errors: [
				`Schema must contain exactly one root practice, found ${rootPractices.length}: ${rootPractices.map(p => p.id).join(', ')}`
			]
		}
	}

	// Validate root practice has 'core' category
	const rootPractice = rootPractices[0]
	if (rootPractice.category !== 'core') {
		return {
			isValid: false,
			errors: [
				`Root practice "${rootPractice.id}" must have category "core", but has "${rootPractice.category}"`
			]
		}
	}

	return {
		isValid: true,
		errors: []
	}
}

// Pure function: Validate complete schema
export const validateSchema = schema => {
	// First validate structure
	const structureValidation = validateSchemaStructure(schema)
	if (!structureValidation.isValid) {
		return {
			isValid: false,
			errors: {
				structure: structureValidation.errors
			},
			warnings: []
		}
	}

	const allErrors = {}
	const warnings = []

	// Validate practices
	const practicesValidation = validatePractices(schema.practices)
	if (!practicesValidation.isValid) {
		allErrors.practices = practicesValidation.errors
	}

	// Validate unique practice IDs - store in dedicated field
	const idValidation = validatePracticeIds(schema.practices)
	if (!idValidation.isValid) {
		allErrors.duplicatePractices = idValidation.errors
	}

	// Validate root practice - store in dedicated field
	const rootValidation = validateRootPractice(schema.practices)
	if (!rootValidation.isValid) {
		allErrors.rootPractice = rootValidation.errors[0] // Single error message
	}

	// Detect circular dependencies separately
	const cycles = findCircularDependencies(schema.dependencies || [])
	if (cycles.length > 0) {
		allErrors.circularDependencies = cycles.map(
			cycle => `Circular dependency: ${cycle.join(' -> ')}`
		)
	}

	// Validate dependencies (with cross-reference to practices)
	const dependenciesValidation = validateDependencies(schema.dependencies, schema.practices)
	if (!dependenciesValidation.isValid) {
		allErrors.dependencies = dependenciesValidation.errors
	}

	// Validate metadata
	const metadataValidation = validateMetadata(schema.metadata)
	if (!metadataValidation.isValid) {
		allErrors.metadata = metadataValidation.errors
	}

	// Check for empty dependencies array (warning, not error)
	if (schema.dependencies && schema.dependencies.length === 0) {
		warnings.push('Schema has no dependencies defined')
	}

	return {
		isValid: Object.keys(allErrors).length === 0,
		errors: allErrors,
		warnings
	}
}

// Pure function: Validate full schema with detailed reporting
export const validateFullSchema = schema => {
	const validation = validateSchema(schema)

	// Calculate detailed summary statistics
	const practices = schema.practices || []
	const dependencies = schema.dependencies || []

	// Count practices by type
	const practicesByType = practices.reduce((acc, p) => {
		acc[p.type] = (acc[p.type] || 0) + 1
		return acc
	}, {})

	// Count practices by category
	const practicesByCategory = practices.reduce((acc, p) => {
		acc[p.category] = (acc[p.category] || 0) + 1
		return acc
	}, {})

	const summary = {
		totalPractices: practices.length,
		totalDependencies: dependencies.length,
		practicesByType,
		practicesByCategory,
		hasErrors: !validation.isValid,
		hasWarnings: validation.warnings.length > 0,
		errorCount: Object.keys(validation.errors).length,
		warningCount: validation.warnings.length
	}

	// Extract error categories (keys from errors object)
	const errorCategories = Object.keys(validation.errors)

	return {
		...validation,
		summary,
		errorCategories
	}
}

// Pure function: Format validation results for display
export const formatValidationResults = validationResult => {
	if (validationResult.isValid) {
		return {
			success: true,
			message: 'Schema validation passed',
			stats: validationResult.stats || {}
		}
	}

	const errorMessages = []

	Object.entries(validationResult.errors).forEach(([section, errors]) => {
		if (Array.isArray(errors)) {
			errorMessages.push(`\n[${section.toUpperCase()}]`)
			errors.forEach((error, index) => {
				errorMessages.push(`  ${index + 1}. ${error}`)
			})
		} else if (typeof errors === 'object') {
			errorMessages.push(`\n[${section.toUpperCase()}]`)
			Object.entries(errors).forEach(([key, value]) => {
				errorMessages.push(`  ${key}: ${value}`)
			})
		}
	})

	return {
		success: false,
		message: `Schema validation failed with ${validationResult.stats?.errorCount || 'multiple'} error(s)`,
		errors: errorMessages,
		stats: validationResult.stats || {}
	}
}

// Pure function: Load and validate schema (for use in scripts)
export const loadAndValidateSchema = schema => {
	// Return full validation result with isValid, errors, warnings, summary
	return validateFullSchema(schema)
}
