/**
 * Dependency Validator
 *
 * Pure functional validation module for dependency relationships between practices.
 * All functions are pure - same input always produces same output.
 *
 * Following functional programming principles:
 * - Pure functions (no side effects)
 * - Immutability (no mutations)
 * - Composability (small functions compose into larger ones)
 */

// Pure function: Validate dependency IDs are valid strings
export const isValidDependencyIds = (practiceId, dependsOnId) => {
	const isValidString = str => typeof str === 'string' && str.trim() !== '' && str.length > 0

	return isValidString(practiceId) && isValidString(dependsOnId)
}

// Pure function: Check if dependency has self-reference (returns true if IDs are the same)
export const hasSelfReference = (practiceId, dependsOnId) => {
	if (typeof practiceId !== 'string' || typeof dependsOnId !== 'string') return false
	return practiceId === dependsOnId
}

// Pure function: Validate a single dependency object
export const validateDependency = dependency => {
	if (!dependency || typeof dependency !== 'object' || Array.isArray(dependency)) {
		return {
			isValid: false,
			errors: {
				dependency: 'Dependency must be an object'
			}
		}
	}

	const errors = {}

	// Check required fields
	if (!('practice_id' in dependency)) {
		errors.practice_id = 'Missing required field: practice_id'
	}

	if (!('depends_on_id' in dependency)) {
		errors.depends_on_id = 'Missing required field: depends_on_id'
	}

	// Return early if required fields missing
	if (Object.keys(errors).length > 0) {
		return { isValid: false, errors }
	}

	// Validate field types individually
	const isValidString = str => typeof str === 'string' && str.trim() !== '' && str.length > 0

	if (!isValidString(dependency.practice_id)) {
		errors.practice_id = 'practice_id must be a non-empty string'
	}

	if (!isValidString(dependency.depends_on_id)) {
		errors.depends_on_id = 'depends_on_id must be a non-empty string'
	}

	// Check for self-reference
	if (hasSelfReference(dependency.practice_id, dependency.depends_on_id)) {
		errors.selfReference = `Self-reference detected: practice "${dependency.practice_id}" cannot depend on itself`
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	}
}

// Pure function: Find duplicate dependencies
export const findDuplicateDependencies = dependencies => {
	const seen = new Map()
	const duplicates = []

	dependencies.forEach((dep, index) => {
		const key = `${dep.practice_id}->${dep.depends_on_id}`
		if (seen.has(key)) {
			duplicates.push({
				practice_id: dep.practice_id,
				depends_on_id: dep.depends_on_id,
				firstIndex: seen.get(key),
				duplicateIndex: index
			})
		} else {
			seen.set(key, index)
		}
	})

	return duplicates
}

// Pure function: Build dependency graph from dependencies array
export const buildDependencyGraph = dependencies => {
	const graph = {}

	dependencies.forEach(dep => {
		if (!graph[dep.practice_id]) {
			graph[dep.practice_id] = []
		}
		graph[dep.practice_id].push(dep.depends_on_id)
	})

	return graph
}

// Pure function: Find circular dependencies using DFS
export const findCircularDependencies = dependencies => {
	const graph = buildDependencyGraph(dependencies)

	// Get all unique nodes in the graph
	const allNodes = new Set([
		...dependencies.map(d => d.practice_id),
		...dependencies.map(d => d.depends_on_id)
	])

	const globalVisited = new Set()
	const cycles = []

	// DFS to detect cycle
	const detectCycle = (node, recStack = new Set(), path = []) => {
		globalVisited.add(node)
		recStack.add(node)
		path.push(node)

		const neighbors = graph[node] || []
		for (const neighbor of neighbors) {
			if (!globalVisited.has(neighbor)) {
				detectCycle(neighbor, recStack, [...path])
			} else if (recStack.has(neighbor)) {
				// Cycle detected - build the cycle path
				const cycleStartIndex = path.indexOf(neighbor)
				const cycle = [...path.slice(cycleStartIndex), neighbor]
				// Add cycle if not already found
				const cycleKey = cycle.join('->')
				const alreadyFound = cycles.some(c => c.join('->') === cycleKey)
				if (!alreadyFound) {
					cycles.push(cycle)
				}
			}
		}

		recStack.delete(node)
	}

	// Check each node for cycles
	for (const node of allNodes) {
		if (!globalVisited.has(node)) {
			detectCycle(node)
		}
	}

	return cycles
}

// Pure function: Validate dependencies against practice list
export const validateDependenciesAgainstPractices = (dependencies, practices) => {
	const practiceIds = new Set(practices.map(p => p.id))
	const errors = []

	dependencies.forEach((dep, index) => {
		if (!practiceIds.has(dep.practice_id)) {
			errors.push(
				`Dependency ${index}: practice_id "${dep.practice_id}" does not reference an existing practice`
			)
		}

		if (!practiceIds.has(dep.depends_on_id)) {
			errors.push(
				`Dependency ${index}: depends_on_id "${dep.depends_on_id}" does not reference an existing practice`
			)
		}
	})

	return {
		isValid: errors.length === 0,
		errors
	}
}

// Pure function: Get all dependencies for a specific practice (returns array of unique depends_on_id strings)
export const getAllDependenciesForPractice = (practiceId, dependencies) => {
	const deps = dependencies
		.filter(dep => dep.practice_id === practiceId)
		.map(dep => dep.depends_on_id)
	return [...new Set(deps)]
}

// Pure function: Validate array of dependencies
export const validateDependencies = (dependencies, practices = null) => {
	if (!Array.isArray(dependencies)) {
		return {
			isValid: false,
			errors: ['Dependencies must be an array']
		}
	}

	const errors = []

	// Validate each dependency structure
	dependencies.forEach((dep, index) => {
		const validation = validateDependency(dep)
		if (!validation.isValid) {
			// validation.errors is an object, convert to array
			Object.entries(validation.errors).forEach(([_field, message]) => {
				errors.push(`Dependency ${index} (${dep.practice_id || 'unknown'}): ${message}`)
			})
		}
	})

	// Check for duplicates
	const duplicates = findDuplicateDependencies(dependencies)
	if (duplicates.length > 0) {
		duplicates.forEach(dup => {
			errors.push(
				`Duplicate dependency: ${dup.practice_id} -> ${dup.depends_on_id} (indices ${dup.firstIndex}, ${dup.duplicateIndex})`
			)
		})
	}

	// Check for circular dependencies
	const cycles = findCircularDependencies(dependencies)
	if (cycles.length > 0) {
		cycles.forEach(cycle => {
			errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`)
		})
	}

	// Validate against practices if provided
	if (practices) {
		const practiceValidation = validateDependenciesAgainstPractices(dependencies, practices)
		if (!practiceValidation.isValid) {
			errors.push(...practiceValidation.errors)
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	}
}
