/**
 * CD Practices Data Validator
 *
 * Pure functional validation module for CD practices JSON data.
 * Uses Ajv for schema validation and additional business rule validation.
 *
 * All functions are pure - same input always produces same output.
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// Pure function: Create and configure Ajv instance
const createValidator = schema => {
	const ajv = new Ajv({
		allErrors: true,
		verbose: true,
		strict: true
	})
	addFormats(ajv)
	return ajv.compile(schema)
}

// Pure function: Validate against JSON Schema
export const validateSchema = schema => data => {
	const validate = createValidator(schema)
	const isValid = validate(data)

	return {
		isValid,
		errors: isValid ? [] : validate.errors || []
	}
}

// Pure function: Check for duplicate practice IDs
export const validateUniquePracticeIds = data => {
	const practiceIds = data.practices.map(p => p.id)
	const duplicates = practiceIds.filter((id, index) => practiceIds.indexOf(id) !== index)

	return {
		isValid: duplicates.length === 0,
		errors:
			duplicates.length > 0
				? [
						{
							message: 'Duplicate practice IDs found',
							duplicates: [...new Set(duplicates)]
						}
					]
				: []
	}
}

// Pure function: Validate all dependency references exist
export const validateDependencyReferences = data => {
	const practiceIds = new Set(data.practices.map(p => p.id))
	const invalidDependencies = data.dependencies.filter(
		dep => !practiceIds.has(dep.practice_id) || !practiceIds.has(dep.depends_on_id)
	)

	return {
		isValid: invalidDependencies.length === 0,
		errors:
			invalidDependencies.length > 0
				? invalidDependencies.map(dep => ({
						message: 'Invalid dependency reference',
						dependency: dep,
						reason: !practiceIds.has(dep.practice_id)
							? `practice_id "${dep.practice_id}" does not exist`
							: `depends_on_id "${dep.depends_on_id}" does not exist`
					}))
				: []
	}
}

// Pure function: Detect circular dependencies
export const validateNoCycles = data => {
	const buildGraph = dependencies => {
		const graph = new Map()
		dependencies.forEach(dep => {
			if (!graph.has(dep.practice_id)) {
				graph.set(dep.practice_id, [])
			}
			graph.get(dep.practice_id).push(dep.depends_on_id)
		})
		return graph
	}

	const detectCycle = (graph, node, visited = new Set(), recStack = new Set()) => {
		visited.add(node)
		recStack.add(node)

		const neighbors = graph.get(node) || []
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				const cycle = detectCycle(graph, neighbor, visited, recStack)
				if (cycle) return [node, ...cycle]
			} else if (recStack.has(neighbor)) {
				return [node, neighbor]
			}
		}

		recStack.delete(node)
		return null
	}

	const graph = buildGraph(data.dependencies)
	const allNodes = new Set([
		...data.dependencies.map(d => d.practice_id),
		...data.dependencies.map(d => d.depends_on_id)
	])

	for (const node of allNodes) {
		const cycle = detectCycle(graph, node)
		if (cycle) {
			return {
				isValid: false,
				errors: [
					{
						message: 'Circular dependency detected',
						cycle: cycle
					}
				]
			}
		}
	}

	return {
		isValid: true,
		errors: []
	}
}

// Pure function: Validate self-dependencies don't exist
export const validateNoSelfDependencies = data => {
	const selfDeps = data.dependencies.filter(dep => dep.practice_id === dep.depends_on_id)

	return {
		isValid: selfDeps.length === 0,
		errors:
			selfDeps.length > 0
				? selfDeps.map(dep => ({
						message: 'Self-dependency detected',
						practice_id: dep.practice_id
					}))
				: []
	}
}

// Pure function: Validate practice categories are valid
export const validateCategories = data => {
	const validCategories = ['automation', 'behavior', 'behavior-enabled-automation', 'core']
	const invalidPractices = data.practices.filter(p => !validCategories.includes(p.category))

	return {
		isValid: invalidPractices.length === 0,
		errors:
			invalidPractices.length > 0
				? invalidPractices.map(p => ({
						message: 'Invalid category',
						practice_id: p.id,
						category: p.category,
						validCategories
					}))
				: []
	}
}

// Pure function: Combine multiple validation results
export const combineValidations = validationResults => {
	const allErrors = validationResults.flatMap(result => result.errors)

	return {
		isValid: validationResults.every(result => result.isValid),
		errors: allErrors
	}
}

// Pure function: Format validation errors for display
export const formatValidationErrors = validationResult => {
	if (validationResult.isValid) {
		return {
			success: true,
			message: 'Validation passed',
			errors: []
		}
	}

	return {
		success: false,
		message: `Validation failed with ${validationResult.errors.length} error(s)`,
		errors: validationResult.errors.map((error, index) => ({
			index: index + 1,
			...error
		}))
	}
}

// Pure function: Main validation orchestrator
export const validateCdPractices = schema => data => {
	const validations = [
		validateSchema(schema)(data),
		validateUniquePracticeIds(data),
		validateDependencyReferences(data),
		validateNoCycles(data),
		validateNoSelfDependencies(data),
		validateCategories(data)
	]

	return formatValidationErrors(combineValidations(validations))
}

// Export individual validators for testing
export const validators = {
	validateSchema,
	validateUniquePracticeIds,
	validateDependencyReferences,
	validateNoCycles,
	validateNoSelfDependencies,
	validateCategories,
	combineValidations,
	formatValidationErrors
}
