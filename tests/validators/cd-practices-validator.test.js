/**
 * Unit tests for CD Practices Validator
 *
 * Following TDD principles and testing behavior, not implementation.
 * All tests use pure functions and predictable data.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
	validateUniquePracticeIds,
	validateDependencyReferences,
	validateNoCycles,
	validateNoSelfDependencies,
	validateCategories,
	combineValidations,
	formatValidationErrors,
	validateCdPractices
} from '../../src/lib/validators/cd-practices-validator.js'

// Test data builders (pure functions)
const buildPractice = (overrides = {}) => ({
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	description: 'A test practice for validation',
	requirements: ['Requirement 1', 'Requirement 2'],
	benefits: ['Benefit 1', 'Benefit 2'],
	...overrides
})

const buildDependency = (overrides = {}) => ({
	practice_id: 'practice-a',
	depends_on_id: 'practice-b',
	...overrides
})

const buildValidData = (overrides = {}) => ({
	practices: [
		buildPractice({ id: 'practice-a', name: 'Practice A' }),
		buildPractice({ id: 'practice-b', name: 'Practice B' })
	],
	dependencies: [buildDependency()],
	metadata: {
		source: 'MinimumCD.org',
		description: 'Test data',
		version: '1.0.0',
		lastUpdated: '2025-01-01'
	},
	...overrides
})

describe('CD Practices Validator', () => {
	describe('validateUniquePracticeIds', () => {
		it('returns valid result when all practice IDs are unique', () => {
			const data = buildValidData()
			const result = validateUniquePracticeIds(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('returns invalid result when duplicate practice IDs exist', () => {
			const data = buildValidData({
				practices: [
					buildPractice({ id: 'duplicate-id' }),
					buildPractice({ id: 'duplicate-id' }),
					buildPractice({ id: 'unique-id' })
				]
			})

			const result = validateUniquePracticeIds(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].message).toBe('Duplicate practice IDs found')
			expect(result.errors[0].duplicates).toContain('duplicate-id')
		})

		it('handles empty practices array', () => {
			const data = buildValidData({ practices: [] })
			const result = validateUniquePracticeIds(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('validateDependencyReferences', () => {
		it('returns valid result when all dependencies reference existing practices', () => {
			const data = buildValidData()
			const result = validateDependencyReferences(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('returns invalid result when practice_id does not exist', () => {
			const data = buildValidData({
				dependencies: [
					buildDependency({ practice_id: 'non-existent', depends_on_id: 'practice-a' })
				]
			})

			const result = validateDependencyReferences(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].message).toBe('Invalid dependency reference')
			expect(result.errors[0].reason).toContain('non-existent')
		})

		it('returns invalid result when depends_on_id does not exist', () => {
			const data = buildValidData({
				dependencies: [
					buildDependency({ practice_id: 'practice-a', depends_on_id: 'non-existent' })
				]
			})

			const result = validateDependencyReferences(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].reason).toContain('non-existent')
		})

		it('handles empty dependencies array', () => {
			const data = buildValidData({ dependencies: [] })
			const result = validateDependencyReferences(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('validateNoCycles', () => {
		it('returns valid result when no circular dependencies exist', () => {
			const data = buildValidData({
				practices: [
					buildPractice({ id: 'a' }),
					buildPractice({ id: 'b' }),
					buildPractice({ id: 'c' })
				],
				dependencies: [
					buildDependency({ practice_id: 'a', depends_on_id: 'b' }),
					buildDependency({ practice_id: 'b', depends_on_id: 'c' })
				]
			})

			const result = validateNoCycles(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('detects simple circular dependency (A -> B -> A)', () => {
			const data = buildValidData({
				practices: [buildPractice({ id: 'a' }), buildPractice({ id: 'b' })],
				dependencies: [
					buildDependency({ practice_id: 'a', depends_on_id: 'b' }),
					buildDependency({ practice_id: 'b', depends_on_id: 'a' })
				]
			})

			const result = validateNoCycles(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].message).toBe('Circular dependency detected')
			expect(result.errors[0].cycle).toBeDefined()
		})

		it('detects complex circular dependency (A -> B -> C -> A)', () => {
			const data = buildValidData({
				practices: [
					buildPractice({ id: 'a' }),
					buildPractice({ id: 'b' }),
					buildPractice({ id: 'c' })
				],
				dependencies: [
					buildDependency({ practice_id: 'a', depends_on_id: 'b' }),
					buildDependency({ practice_id: 'b', depends_on_id: 'c' }),
					buildDependency({ practice_id: 'c', depends_on_id: 'a' })
				]
			})

			const result = validateNoCycles(data)

			expect(result.isValid).toBe(false)
			expect(result.errors[0].message).toBe('Circular dependency detected')
		})

		it('handles empty dependencies array', () => {
			const data = buildValidData({ dependencies: [] })
			const result = validateNoCycles(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('validateNoSelfDependencies', () => {
		it('returns valid result when no self-dependencies exist', () => {
			const data = buildValidData()
			const result = validateNoSelfDependencies(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('returns invalid result when self-dependency exists', () => {
			const data = buildValidData({
				dependencies: [buildDependency({ practice_id: 'self-dep', depends_on_id: 'self-dep' })]
			})

			const result = validateNoSelfDependencies(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].message).toBe('Self-dependency detected')
			expect(result.errors[0].practice_id).toBe('self-dep')
		})

		it('detects multiple self-dependencies', () => {
			const data = buildValidData({
				dependencies: [
					buildDependency({ practice_id: 'self-1', depends_on_id: 'self-1' }),
					buildDependency({ practice_id: 'self-2', depends_on_id: 'self-2' })
				]
			})

			const result = validateNoSelfDependencies(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(2)
		})
	})

	describe('validateCategories', () => {
		it('returns valid result when all categories are valid', () => {
			const data = buildValidData({
				practices: [
					buildPractice({ id: 'p1', category: 'automation' }),
					buildPractice({ id: 'p2', category: 'behavior' }),
					buildPractice({ id: 'p3', category: 'behavior-enabled-automation' }),
					buildPractice({ id: 'p4', category: 'core' })
				]
			})

			const result = validateCategories(data)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('returns invalid result when invalid category exists', () => {
			const data = buildValidData({
				practices: [buildPractice({ id: 'invalid', category: 'invalid-category' })]
			})

			const result = validateCategories(data)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].message).toBe('Invalid category')
			expect(result.errors[0].practice_id).toBe('invalid')
			expect(result.errors[0].category).toBe('invalid-category')
		})
	})

	describe('combineValidations', () => {
		it('returns valid result when all validations pass', () => {
			const validations = [
				{ isValid: true, errors: [] },
				{ isValid: true, errors: [] },
				{ isValid: true, errors: [] }
			]

			const result = combineValidations(validations)

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('returns invalid result when any validation fails', () => {
			const validations = [
				{ isValid: true, errors: [] },
				{ isValid: false, errors: [{ message: 'Error 1' }] },
				{ isValid: true, errors: [] }
			]

			const result = combineValidations(validations)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(1)
		})

		it('combines all errors from failed validations', () => {
			const validations = [
				{ isValid: false, errors: [{ message: 'Error 1' }] },
				{ isValid: false, errors: [{ message: 'Error 2' }, { message: 'Error 3' }] }
			]

			const result = combineValidations(validations)

			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(3)
		})

		it('handles empty validations array', () => {
			const result = combineValidations([])

			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('formatValidationErrors', () => {
		it('formats success result correctly', () => {
			const validationResult = { isValid: true, errors: [] }
			const result = formatValidationErrors(validationResult)

			expect(result.success).toBe(true)
			expect(result.message).toBe('Validation passed')
			expect(result.errors).toHaveLength(0)
		})

		it('formats failure result with errors', () => {
			const validationResult = {
				isValid: false,
				errors: [{ message: 'Error 1' }, { message: 'Error 2' }]
			}

			const result = formatValidationErrors(validationResult)

			expect(result.success).toBe(false)
			expect(result.message).toContain('2 error(s)')
			expect(result.errors).toHaveLength(2)
			expect(result.errors[0].index).toBe(1)
			expect(result.errors[1].index).toBe(2)
		})
	})

	describe('validateCdPractices (integration)', () => {
		const schema = {
			type: 'object',
			required: ['practices', 'dependencies', 'metadata'],
			properties: {
				practices: { type: 'array' },
				dependencies: { type: 'array' },
				metadata: { type: 'object' }
			}
		}

		it('validates correct data successfully', () => {
			const data = buildValidData()
			const result = validateCdPractices(schema)(data)

			expect(result.success).toBe(true)
		})

		it('detects multiple validation errors', () => {
			const data = buildValidData({
				practices: [
					buildPractice({ id: 'dup' }),
					buildPractice({ id: 'dup' }) // Duplicate ID
				],
				dependencies: [
					buildDependency({ practice_id: 'self', depends_on_id: 'self' }) // Self-dependency
				]
			})

			const result = validateCdPractices(schema)(data)

			expect(result.success).toBe(false)
			expect(result.errors.length).toBeGreaterThan(0)
		})
	})
})

describe('Validator purity', () => {
	it('produces same output for same input (idempotent)', () => {
		const data = buildValidData()
		const result1 = validateUniquePracticeIds(data)
		const result2 = validateUniquePracticeIds(data)

		expect(result1).toEqual(result2)
	})

	it('does not mutate input data', () => {
		const data = buildValidData()
		const originalData = JSON.parse(JSON.stringify(data))

		validateUniquePracticeIds(data)
		validateDependencyReferences(data)
		validateNoCycles(data)

		expect(data).toEqual(originalData)
	})
})
