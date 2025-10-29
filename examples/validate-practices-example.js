/**
 * Example Usage: CD Practices Validator
 *
 * Demonstrates how to use the validation system in different scenarios.
 */

import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
	validateCdPractices,
	validateUniquePracticeIds,
	validateDependencyReferences,
	validateNoCycles,
	combineValidations
} from '../src/lib/validators/cd-practices-validator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Example 1: Full Validation
async function example1_FullValidation() {
	console.log('\n=== Example 1: Full Validation ===\n')

	const schema = JSON.parse(
		await readFile(join(__dirname, '../src/lib/schemas/cd-practices.schema.json'), 'utf-8')
	)
	const data = JSON.parse(
		await readFile(join(__dirname, '../src/lib/data/cd-practices.json'), 'utf-8')
	)

	const result = validateCdPractices(schema)(data)

	if (result.success) {
		console.log('✓ All validations passed!')
	} else {
		console.error(`✗ ${result.message}`)
		result.errors.forEach(err => {
			console.error(`  ${err.index}. ${err.message}`)
		})
	}
}

// Example 2: Individual Validators
async function example2_IndividualValidators() {
	console.log('\n=== Example 2: Individual Validators ===\n')

	const data = JSON.parse(
		await readFile(join(__dirname, '../src/lib/data/cd-practices.json'), 'utf-8')
	)

	// Check for duplicate IDs
	const uniqueResult = validateUniquePracticeIds(data)
	console.log('Unique IDs:', uniqueResult.isValid ? '✓ Pass' : '✗ Fail')

	// Check dependency references
	const refResult = validateDependencyReferences(data)
	console.log('Valid References:', refResult.isValid ? '✓ Pass' : '✗ Fail')

	// Check for cycles
	const cycleResult = validateNoCycles(data)
	console.log('No Cycles:', cycleResult.isValid ? '✓ Pass' : '✗ Fail')
	if (!cycleResult.isValid) {
		console.log('  Cycle detected:', cycleResult.errors[0].cycle.join(' → '))
	}
}

// Example 3: Custom Validation Chain
async function example3_CustomValidationChain() {
	console.log('\n=== Example 3: Custom Validation Chain ===\n')

	const data = JSON.parse(
		await readFile(join(__dirname, '../src/lib/data/cd-practices.json'), 'utf-8')
	)

	// Only validate specific rules
	const customValidations = combineValidations([
		validateUniquePracticeIds(data),
		validateNoCycles(data)
	])

	console.log('Custom validation:', customValidations.isValid ? '✓ Pass' : '✗ Fail')
	console.log('Error count:', customValidations.errors.length)
}

// Example 4: Validate Custom Data
function example4_ValidateCustomData() {
	console.log('\n=== Example 4: Validate Custom Data ===\n')

	// Create test data
	const testData = {
		practices: [
			{
				id: 'continuous-integration',
				name: 'Continuous Integration',
				type: 'practice',
				category: 'behavior',
				description: 'Integrate code changes frequently',
				requirements: ['Trunk-based development', 'Automated testing'],
				benefits: ['Early bug detection', 'Reduced merge conflicts']
			},
			{
				id: 'automated-testing',
				name: 'Automated Testing',
				type: 'practice',
				category: 'automation',
				description: 'Automated test suite',
				requirements: ['Test framework', 'CI integration'],
				benefits: ['Fast feedback', 'Quality assurance']
			}
		],
		dependencies: [
			{
				practice_id: 'continuous-integration',
				depends_on_id: 'automated-testing'
			}
		],
		metadata: {
			source: 'Example',
			description: 'Test data',
			version: '1.0.0',
			lastUpdated: '2025-01-21'
		}
	}

	// Validate
	const result = validateUniquePracticeIds(testData)
	console.log('Test data validation:', result.isValid ? '✓ Pass' : '✗ Fail')

	const depsResult = validateDependencyReferences(testData)
	console.log('Dependencies validation:', depsResult.isValid ? '✓ Pass' : '✗ Fail')
}

// Example 5: Error Handling
async function example5_ErrorHandling() {
	console.log('\n=== Example 5: Error Handling ===\n')

	// Create invalid data
	const invalidData = {
		practices: [
			{
				id: 'duplicate-id',
				name: 'Practice 1',
				type: 'practice',
				category: 'automation',
				description: 'Test practice',
				requirements: ['Requirement'],
				benefits: ['Benefit']
			},
			{
				id: 'duplicate-id', // Duplicate!
				name: 'Practice 2',
				type: 'practice',
				category: 'behavior',
				description: 'Another test practice',
				requirements: ['Requirement'],
				benefits: ['Benefit']
			}
		],
		dependencies: [],
		metadata: {
			source: 'Test',
			description: 'Invalid test data',
			version: '1.0.0',
			lastUpdated: '2025-01-21'
		}
	}

	const result = validateUniquePracticeIds(invalidData)

	if (!result.isValid) {
		console.log('Found errors:')
		result.errors.forEach(error => {
			console.log(`  - ${error.message}`)
			if (error.duplicates) {
				console.log(`    Duplicates: ${error.duplicates.join(', ')}`)
			}
		})
	}
}

// Example 6: Functional Composition
async function example6_FunctionalComposition() {
	console.log('\n=== Example 6: Functional Composition ===\n')

	const data = JSON.parse(
		await readFile(join(__dirname, '../src/lib/data/cd-practices.json'), 'utf-8')
	)

	// Compose validators
	const validate = data => {
		const validators = [validateUniquePracticeIds, validateDependencyReferences, validateNoCycles]

		const results = validators.map(validator => validator(data))
		return combineValidations(results)
	}

	const result = validate(data)
	console.log('Composed validation:', result.isValid ? '✓ Pass' : '✗ Fail')

	// Chain operations
	const summary = data => {
		const result = validate(data)
		return {
			isValid: result.isValid,
			errorCount: result.errors.length,
			practiceCount: data.practices.length,
			dependencyCount: data.dependencies.length
		}
	}

	console.log('Summary:', summary(data))
}

// Run all examples
async function runAllExamples() {
	try {
		await example1_FullValidation()
		await example2_IndividualValidators()
		await example3_CustomValidationChain()
		example4_ValidateCustomData()
		await example5_ErrorHandling()
		await example6_FunctionalComposition()
		console.log('\n=== All examples completed ===\n')
	} catch (error) {
		console.error('Error running examples:', error)
	}
}

runAllExamples()
