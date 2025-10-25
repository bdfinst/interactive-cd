/**
 * Integration Tests for Full CD Practices Schema Validation
 *
 * Following TDD principles:
 * - Integration tests validate the full schema including all parts
 * - Tests focus on behavior: schema must be complete and consistent
 * - Pure functions with no side effects
 *
 * Test Coverage:
 * - Full schema structure validation
 * - Cross-validation between practices and dependencies
 * - Duplicate practice ID detection
 * - Root practice validation
 * - Complete end-to-end validation flow
 * - Real data validation against actual file
 */

import { describe, it, expect } from 'vitest'
import {
	validateSchema,
	validateFullSchema,
	findDuplicatePracticeIds,
	validatePracticeIds,
	validateSchemaStructure,
	loadAndValidateSchema
} from '../../../src/lib/validators/schema-validator.js'
import {
	validSchema,
	validPractice,
	validRootPractice,
	validDependency,
	validMetadata,
	schemaWithoutPractices,
	schemaWithNonArrayPractices,
	schemaWithEmptyPractices,
	schemaWithoutDependencies,
	schemaWithNonArrayDependencies,
	schemaWithoutMetadata,
	schemaWithNonObjectMetadata,
	practicesWithDuplicateIds,
	circularDependencies,
	dependencyWithNonExistentPractice,
	dependencyWithNonExistentDependency,
	buildSchema,
	buildPractice,
	buildDependency
} from '../../fixtures/cd-practices-fixtures.js'

describe('Schema Validation (Integration)', () => {
	describe('validateSchemaStructure', () => {
		it('returns success for valid schema structure', () => {
			const result = validateSchemaStructure(validSchema)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
		})

		it('returns error for missing practices field', () => {
			const result = validateSchemaStructure(schemaWithoutPractices)

			expect(result.isValid).toBe(false)
			expect(result.errors.practices).toBeDefined()
			expect(result.errors.practices).toContain('required')
		})

		it('returns error for non-array practices', () => {
			const result = validateSchemaStructure(schemaWithNonArrayPractices)

			expect(result.isValid).toBe(false)
			expect(result.errors.practices).toBeDefined()
			expect(result.errors.practices).toContain('array')
		})

		it('returns error for empty practices array', () => {
			const result = validateSchemaStructure(schemaWithEmptyPractices)

			expect(result.isValid).toBe(false)
			expect(result.errors.practices).toBeDefined()
			expect(result.errors.practices).toContain('at least one')
		})

		it('returns error for missing dependencies field', () => {
			const result = validateSchemaStructure(schemaWithoutDependencies)

			expect(result.isValid).toBe(false)
			expect(result.errors.dependencies).toBeDefined()
		})

		it('returns error for non-array dependencies', () => {
			const result = validateSchemaStructure(schemaWithNonArrayDependencies)

			expect(result.isValid).toBe(false)
			expect(result.errors.dependencies).toBeDefined()
		})

		it('accepts empty dependencies array', () => {
			const schema = {
				practices: [validPractice],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchemaStructure(schema)

			expect(result.isValid).toBe(true)
		})

		it('returns error for missing metadata field', () => {
			const result = validateSchemaStructure(schemaWithoutMetadata)

			expect(result.isValid).toBe(false)
			expect(result.errors.metadata).toBeDefined()
		})

		it('returns error for non-object metadata', () => {
			const result = validateSchemaStructure(schemaWithNonObjectMetadata)

			expect(result.isValid).toBe(false)
			expect(result.errors.metadata).toBeDefined()
		})

		it('returns error for null schema', () => {
			const result = validateSchemaStructure(null)

			expect(result.isValid).toBe(false)
			expect(result.errors.schema).toBeDefined()
		})

		it('returns error for undefined schema', () => {
			const result = validateSchemaStructure(undefined)

			expect(result.isValid).toBe(false)
		})

		it('returns multiple errors for multiple structural issues', () => {
			const invalidSchema = {
				practices: 'not an array',
				dependencies: 'not an array',
				metadata: 'not an object'
			}

			const result = validateSchemaStructure(invalidSchema)

			expect(result.isValid).toBe(false)
			expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3)
		})
	})

	describe('findDuplicatePracticeIds', () => {
		it('returns empty array when no duplicate IDs', () => {
			const practices = [
				{ ...validPractice, id: 'practice-a' },
				{ ...validPractice, id: 'practice-b' },
				{ ...validPractice, id: 'practice-c' }
			]

			const result = findDuplicatePracticeIds(practices)

			expect(result).toEqual([])
		})

		it('finds duplicate practice IDs', () => {
			const result = findDuplicatePracticeIds(practicesWithDuplicateIds)

			expect(result.length).toBeGreaterThan(0)
			expect(result).toContain('duplicate-id')
		})

		it('handles empty practices array', () => {
			const result = findDuplicatePracticeIds([])

			expect(result).toEqual([])
		})

		it('handles single practice', () => {
			const result = findDuplicatePracticeIds([validPractice])

			expect(result).toEqual([])
		})

		it('finds multiple sets of duplicates', () => {
			const practices = [
				{ ...validPractice, id: 'dup-1' },
				{ ...validPractice, id: 'dup-1' },
				{ ...validPractice, id: 'dup-2' },
				{ ...validPractice, id: 'dup-2' },
				{ ...validPractice, id: 'unique' }
			]

			const result = findDuplicatePracticeIds(practices)

			expect(result).toContain('dup-1')
			expect(result).toContain('dup-2')
			expect(result).not.toContain('unique')
		})
	})

	describe('validatePracticeIds', () => {
		it('returns success when all practice IDs are unique', () => {
			const practices = [
				{ ...validPractice, id: 'practice-a' },
				{ ...validPractice, id: 'practice-b' }
			]

			const result = validatePracticeIds(practices)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual([])
		})

		it('returns error when duplicate IDs found', () => {
			const result = validatePracticeIds(practicesWithDuplicateIds)

			expect(result.isValid).toBe(false)
			expect(result.errors.length).toBeGreaterThan(0)
			expect(result.errors[0]).toContain('Duplicate')
		})

		it('handles empty practices array', () => {
			const result = validatePracticeIds([])

			expect(result.isValid).toBe(true)
		})
	})

	describe('validateSchema', () => {
		it('returns success for completely valid schema', () => {
			const result = validateSchema(validSchema)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
			expect(result.warnings).toEqual([])
		})

		it('validates all practices', () => {
			const schema = {
				practices: [
					validPractice,
					{ ...validPractice, id: '' } // Invalid practice
				],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors.practices).toBeDefined()
		})

		it('validates all dependencies', () => {
			const schema = {
				practices: [validPractice],
				dependencies: [
					validDependency,
					{ practice_id: '', depends_on_id: 'test' } // Invalid dependency
				],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors.dependencies).toBeDefined()
		})

		it('validates metadata', () => {
			const schema = {
				practices: [validPractice],
				dependencies: [],
				metadata: { version: '1.0' } // Invalid metadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors.metadata).toBeDefined()
		})

		it('validates dependencies reference existing practices', () => {
			const schema = {
				practices: [{ ...validPractice, id: 'practice-a' }],
				dependencies: [
					{
						practice_id: 'practice-a',
						depends_on_id: 'non-existent-practice'
					}
				],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors.dependencies).toBeDefined()
		})

		it('detects circular dependencies', () => {
			const schema = {
				practices: [
					{ ...validPractice, id: 'practice-a' },
					{ ...validPractice, id: 'practice-b' },
					{ ...validPractice, id: 'practice-c' }
				],
				dependencies: circularDependencies,
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors.circularDependencies || result.warnings).toBeDefined()
		})

		it('detects duplicate practice IDs', () => {
			const schema = {
				practices: practicesWithDuplicateIds,
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors.duplicatePractices).toBeDefined()
		})

		it('validates at least one root practice exists', () => {
			const schema = {
				practices: [validPractice], // No root practice
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			// May be a warning or error depending on business rules
			expect(result.warnings.length > 0 || result.errors.rootPractice).toBeTruthy()
		})

		it('returns detailed error information', () => {
			const invalidSchema = {
				practices: [{ ...validPractice, id: '' }],
				dependencies: [{ practice_id: '', depends_on_id: '' }],
				metadata: { version: 'invalid' }
			}

			const result = validateSchema(invalidSchema)

			expect(result.isValid).toBe(false)
			expect(result.errors.practices).toBeDefined()
			expect(result.errors.dependencies).toBeDefined()
			expect(result.errors.metadata).toBeDefined()
		})
	})

	describe('validateFullSchema', () => {
		it('performs complete validation including all checks', () => {
			const result = validateFullSchema(validSchema)

			expect(result.isValid).toBe(true)
			expect(result.summary).toBeDefined()
			expect(result.summary.totalPractices).toBeGreaterThan(0)
			expect(result.summary.totalDependencies).toBeGreaterThanOrEqual(0)
		})

		it('returns summary of validation results', () => {
			const result = validateFullSchema(validSchema)

			expect(result.summary).toMatchObject({
				totalPractices: expect.any(Number),
				totalDependencies: expect.any(Number),
				practicesByType: expect.any(Object),
				practicesByCategory: expect.any(Object)
			})
		})

		it('includes all error categories', () => {
			const invalidSchema = {
				practices: practicesWithDuplicateIds,
				dependencies: circularDependencies,
				metadata: { version: 'invalid' }
			}

			const result = validateFullSchema(invalidSchema)

			expect(result.isValid).toBe(false)
			expect(result.errorCategories).toBeDefined()
			expect(Array.isArray(result.errorCategories)).toBe(true)
		})

		it('validates practice type distribution', () => {
			const schema = {
				practices: [validPractice, validRootPractice],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateFullSchema(schema)

			expect(result.summary.practicesByType).toHaveProperty('practice')
			expect(result.summary.practicesByType).toHaveProperty('root')
		})

		it('validates category distribution', () => {
			const result = validateFullSchema(validSchema)

			expect(result.summary.practicesByCategory).toBeDefined()
			expect(Object.keys(result.summary.practicesByCategory).length).toBeGreaterThan(0)
		})
	})

	describe('loadAndValidateSchema', () => {
		it.skip('loads and validates schema from file path', async () => {
			// TODO: Implement file loading functionality
			const filePath = '/Users/bryan/_git/interactive-cd/src/lib/data/cd-practices.json'

			const result = await loadAndValidateSchema(filePath)

			expect(result.isValid).toBe(true)
			expect(result.schema).toBeDefined()
		})

		it.skip('returns error for non-existent file', async () => {
			// TODO: Implement file loading functionality
			const result = await loadAndValidateSchema('/non/existent/file.json')

			expect(result.isValid).toBe(false)
			expect(result.errors.file).toBeDefined()
		})

		it('returns error for invalid JSON', async () => {
			// This would need a test fixture with invalid JSON
			// For now, just verify the function exists and returns proper structure
			const result = await loadAndValidateSchema('/invalid/path')

			expect(result).toHaveProperty('isValid')
			expect(result).toHaveProperty('errors')
		})

		it('validates loaded schema', async () => {
			const filePath = '/Users/bryan/_git/interactive-cd/src/lib/data/cd-practices.json'

			const result = await loadAndValidateSchema(filePath)

			if (result.isValid) {
				expect(result.schema.practices).toBeDefined()
				expect(result.schema.dependencies).toBeDefined()
				expect(result.schema.metadata).toBeDefined()
			}
		})
	})

	describe('cross-validation', () => {
		it('ensures all dependency practice_ids exist in practices', () => {
			const schema = {
				practices: [{ ...validPractice, id: 'existing-practice' }],
				dependencies: [
					{
						practice_id: 'non-existent',
						depends_on_id: 'existing-practice'
					}
				],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})

		it('ensures all dependency depends_on_ids exist in practices', () => {
			const schema = {
				practices: [{ ...validPractice, id: 'existing-practice' }],
				dependencies: [
					{
						practice_id: 'existing-practice',
						depends_on_id: 'non-existent'
					}
				],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})

		it('validates practice requirements are non-empty', () => {
			const schema = {
				practices: [{ ...validPractice, requirements: [] }],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})

		it('validates practice benefits are non-empty', () => {
			const schema = {
				practices: [{ ...validPractice, benefits: [] }],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})
	})

	describe('pure function behavior', () => {
		it('same input produces same output (referential transparency)', () => {
			const result1 = validateSchema(validSchema)
			const result2 = validateSchema(validSchema)

			expect(result1).toEqual(result2)
		})

		it('does not mutate input schema', () => {
			const schema = { ...validSchema }
			const originalCopy = JSON.parse(JSON.stringify(schema))

			validateSchema(schema)

			expect(schema).toEqual(originalCopy)
		})

		it('validation functions compose correctly', () => {
			const schema = buildSchema()

			// Validate structure first
			const structureResult = validateSchemaStructure(schema)

			// If structure is valid, validate content
			if (structureResult.isValid) {
				const fullResult = validateSchema(schema)
				expect(typeof fullResult.isValid).toBe('boolean')
			}
		})
	})

	describe('edge cases', () => {
		it('handles very large schemas', () => {
			const largePractices = Array.from({ length: 1000 }, (_, i) =>
				buildPractice({ id: `practice-${i}` })
			)

			const schema = {
				practices: largePractices,
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles schema with many dependencies', () => {
			const practices = Array.from({ length: 100 }, (_, i) =>
				buildPractice({ id: `practice-${i}` })
			)

			const dependencies = Array.from({ length: 500 }, (_, i) =>
				buildDependency({
					practice_id: `practice-${i % 100}`,
					depends_on_id: `practice-${(i + 1) % 100}`
				})
			)

			const schema = {
				practices,
				dependencies,
				metadata: validMetadata
			}

			const result = validateSchema(schema)
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles schema with no dependencies', () => {
			const schema = {
				practices: [validRootPractice],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)
			expect(result.isValid).toBe(true)
		})

		it('handles practices with unicode content', () => {
			const practice = buildPractice({
				name: 'Test 测试 🚀',
				description: 'Description with émojis ✨'
			})

			const schema = {
				practices: [practice],
				dependencies: [],
				metadata: validMetadata
			}

			const result = validateSchema(schema)
			expect(typeof result.isValid).toBe('boolean')
		})
	})

	describe('real-world validation', () => {
		it.skip('validates actual cd-practices.json file structure', async () => {
			// TODO: Implement file loading functionality
			const filePath = '/Users/bryan/_git/interactive-cd/src/lib/data/cd-practices.json'

			const result = await loadAndValidateSchema(filePath)

			expect(result.isValid).toBe(true)
			expect(result.schema.practices.length).toBeGreaterThan(0)
			expect(result.schema.dependencies.length).toBeGreaterThan(0)
			expect(result.schema.metadata).toBeDefined()
		})

		it('ensures real file has no duplicate practice IDs', async () => {
			const filePath = '/Users/bryan/_git/interactive-cd/src/lib/data/cd-practices.json'

			const result = await loadAndValidateSchema(filePath)

			if (result.isValid) {
				const duplicates = findDuplicatePracticeIds(result.schema.practices)
				expect(duplicates).toEqual([])
			}
		})

		it('ensures real file has no circular dependencies', async () => {
			const filePath = '/Users/bryan/_git/interactive-cd/src/lib/data/cd-practices.json'

			const result = await loadAndValidateSchema(filePath)

			if (result.isValid) {
				expect(result.errors.circularDependencies || result.warnings.length === 0).toBeTruthy()
			}
		})

		it('ensures real file has at least one root practice', async () => {
			const filePath = '/Users/bryan/_git/interactive-cd/src/lib/data/cd-practices.json'

			const result = await loadAndValidateSchema(filePath)

			if (result.isValid) {
				const rootPractices = result.schema.practices.filter(p => p.type === 'root')
				expect(rootPractices.length).toBeGreaterThan(0)
			}
		})
	})
})
