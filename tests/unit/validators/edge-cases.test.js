/**
 * Edge Case Tests for CD Practices Validation
 *
 * Following TDD principles:
 * - Tests focus on boundary conditions and unusual inputs
 * - Ensures validators are robust and handle unexpected data gracefully
 * - Tests the "unhappy paths" that might be missed in normal testing
 *
 * Test Coverage:
 * - Null/undefined handling
 * - Empty strings and whitespace
 * - Very large inputs (strings, arrays, objects)
 * - Unicode and special characters
 * - Type coercion edge cases
 * - Boundary values
 * - Malformed data structures
 */

import { describe, it, expect } from 'vitest'
import { validatePractice } from '../../../src/lib/validators/practice-validator.js'
import { validateDependency } from '../../../src/lib/validators/dependency-validator.js'
import { validateMetadata } from '../../../src/lib/validators/metadata-validator.js'
import { validateSchema } from '../../../src/lib/validators/schema-validator.js'
import {
	buildPractice,
	buildDependency,
	buildMetadata,
	buildSchema
} from '../../fixtures/cd-practices-fixtures.js'

describe('Edge Cases - Validation Robustness', () => {
	describe('null and undefined handling', () => {
		it('handles null practice gracefully', () => {
			const result = validatePractice(null)

			expect(result.isValid).toBe(false)
			expect(result.errors).toBeDefined()
		})

		it('handles undefined practice gracefully', () => {
			const result = validatePractice(undefined)

			expect(result.isValid).toBe(false)
			expect(result.errors).toBeDefined()
		})

		it('handles practice with all null fields', () => {
			const practice = {
				id: null,
				name: null,
				type: null,
				category: null,
				description: null,
				requirements: null,
				benefits: null
			}

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
			expect(Object.keys(result.errors).length).toBeGreaterThan(0)
		})

		it('handles null dependency gracefully', () => {
			const result = validateDependency(null)

			expect(result.isValid).toBe(false)
			expect(result.errors).toBeDefined()
		})

		it('handles null metadata gracefully', () => {
			const result = validateMetadata(null)

			expect(result.isValid).toBe(false)
			expect(result.errors).toBeDefined()
		})

		it('handles null schema gracefully', () => {
			const result = validateSchema(null)

			expect(result.isValid).toBe(false)
			expect(result.errors).toBeDefined()
		})
	})

	describe('empty and whitespace strings', () => {
		it('rejects practice with empty string ID', () => {
			const practice = buildPractice({ id: '' })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
			expect(result.errors.id).toBeDefined()
		})

		it('rejects practice with whitespace-only ID', () => {
			const practice = buildPractice({ id: '   ' })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
			expect(result.errors.id).toBeDefined()
		})

		it('rejects practice with tabs and newlines as ID', () => {
			const practice = buildPractice({ id: '\t\n\r' })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects practice with empty string name', () => {
			const practice = buildPractice({ name: '' })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects practice with whitespace-only description', () => {
			const practice = buildPractice({ description: '     ' })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects requirements array with empty strings', () => {
			const practice = buildPractice({
				requirements: ['Valid requirement', '', 'Another valid']
			})

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects benefits array with whitespace-only strings', () => {
			const practice = buildPractice({
				benefits: ['Valid benefit', '   ', 'Another valid']
			})

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})
	})

	describe('very large inputs', () => {
		it('handles extremely long practice ID', () => {
			const longId = 'a'.repeat(10000)
			const practice = buildPractice({ id: longId })

			const result = validatePractice(practice)

			// Should handle gracefully, valid or not
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles extremely long description', () => {
			const longDescription = 'A'.repeat(100000)
			const practice = buildPractice({ description: longDescription })

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles practice with hundreds of requirements', () => {
			const manyRequirements = Array.from({ length: 1000 }, (_, i) => `Requirement ${i}`)
			const practice = buildPractice({ requirements: manyRequirements })

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles practice with hundreds of benefits', () => {
			const manyBenefits = Array.from({ length: 1000 }, (_, i) => `Benefit ${i}`)
			const practice = buildPractice({ benefits: manyBenefits })

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles schema with thousands of practices', () => {
			const manyPractices = Array.from({ length: 5000 }, (_, i) =>
				buildPractice({ id: `practice-${i}` })
			)
			const schema = buildSchema({ practices: manyPractices })

			const result = validateSchema(schema)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles very long version string', () => {
			const longVersion = '1.0.0-' + 'alpha.'.repeat(1000)
			const metadata = buildMetadata({ version: longVersion })

			const result = validateMetadata(metadata)

			expect(typeof result.isValid).toBe('boolean')
		})
	})

	describe('unicode and special characters', () => {
		it('handles practice ID with unicode characters', () => {
			const practice = buildPractice({ id: 'test-测试-practice' })

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles practice name with emojis', () => {
			const practice = buildPractice({ name: 'Test Practice 🚀✨' })

			const result = validatePractice(practice)

			// Should be valid - emojis in names are acceptable
			expect(result.isValid).toBe(true)
		})

		it('handles description with mixed unicode', () => {
			const practice = buildPractice({
				description: 'Test with 中文, العربية, עברית, русский, 日本語 🌍'
			})

			const result = validatePractice(practice)

			expect(result.isValid).toBe(true)
		})

		it('handles special characters in requirements', () => {
			const practice = buildPractice({
				requirements: [
					'Use API & Security',
					'Monitor 24/7',
					'Support @mentions',
					'Handle <tags>',
					'Process $variables'
				]
			})

			const result = validatePractice(practice)

			expect(result.isValid).toBe(true)
		})

		it('handles zero-width characters', () => {
			const practice = buildPractice({
				id: 'test\u200B\u200C\u200Dpractice'
			})

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles right-to-left characters', () => {
			const practice = buildPractice({
				name: 'Test \u202Eecitcarp\u202C'
			})

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})
	})

	describe('type coercion and wrong types', () => {
		it('rejects practice ID as number', () => {
			const practice = buildPractice({ id: 12345 })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects practice ID as boolean', () => {
			const practice = buildPractice({ id: true })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects practice ID as object', () => {
			const practice = buildPractice({ id: { value: 'test' } })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects practice ID as array', () => {
			const practice = buildPractice({ id: ['test-practice'] })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects requirements as string instead of array', () => {
			const practice = buildPractice({ requirements: 'Single requirement' })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects requirements array with mixed types', () => {
			const practice = buildPractice({
				requirements: ['String requirement', 123, true, { value: 'test' }, null]
			})

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects benefits as object instead of array', () => {
			const practice = buildPractice({ benefits: { benefit: 'Test' } })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
		})

		it('rejects dependency with numeric IDs', () => {
			const dependency = buildDependency({
				practice_id: 123,
				depends_on_id: 456
			})

			const result = validateDependency(dependency)

			expect(result.isValid).toBe(false)
		})
	})

	describe('boundary values', () => {
		it('handles practice with minimum required fields', () => {
			const minimal = {
				id: 'abc',
				name: 'ABC',
				type: 'practice',
				category: 'automation',
				description: 'A basic test description',
				requirements: ['ABC'],
				benefits: ['ABC']
			}

			const result = validatePractice(minimal)

			expect(result.isValid).toBe(true)
		})

		it('handles date at year boundary', () => {
			const metadata = buildMetadata({ lastUpdated: '2025-01-01' })

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(true)
		})

		it('handles date at leap year boundary', () => {
			const metadata = buildMetadata({ lastUpdated: '2024-02-29' })

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(true)
		})

		it('handles version at maximum values', () => {
			const metadata = buildMetadata({ version: '999.999.999' })

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(true)
		})

		it('handles practice with single requirement', () => {
			const practice = buildPractice({ requirements: ['Single requirement'] })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(true)
		})

		it('handles practice with single benefit', () => {
			const practice = buildPractice({ benefits: ['Single benefit'] })

			const result = validatePractice(practice)

			expect(result.isValid).toBe(true)
		})
	})

	describe('malformed data structures', () => {
		it('handles practice as array instead of object', () => {
			const result = validatePractice([])

			expect(result.isValid).toBe(false)
		})

		it('handles practice as string', () => {
			const result = validatePractice('not a practice')

			expect(result.isValid).toBe(false)
		})

		it('handles practice as number', () => {
			const result = validatePractice(12345)

			expect(result.isValid).toBe(false)
		})

		it('handles schema with practices as object instead of array', () => {
			const schema = buildSchema({
				practices: { 'practice-1': buildPractice() }
			})

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})

		it('handles schema with dependencies as object instead of array', () => {
			const schema = buildSchema({
				dependencies: { 'dep-1': buildDependency() }
			})

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})

		it('handles schema with metadata as array instead of object', () => {
			const schema = buildSchema({
				metadata: [buildMetadata()]
			})

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
		})

		it('handles practice with extra unknown fields', () => {
			const practice = {
				...buildPractice(),
				unknownField1: 'value1',
				unknownField2: 123,
				nested: { deep: { field: true } }
			}

			const result = validatePractice(practice)

			// Extra fields should not cause failure
			expect(result.isValid).toBe(true)
		})

		it('handles circular object references', () => {
			const circular = buildPractice()
			circular.self = circular

			const result = validatePractice(circular)

			// Should handle without infinite loop
			expect(typeof result.isValid).toBe('boolean')
		})
	})

	describe('special numeric values', () => {
		it('handles Infinity in numeric context', () => {
			const practice = buildPractice({ id: String(Infinity) })

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles NaN in numeric context', () => {
			const practice = buildPractice({ id: String(NaN) })

			const result = validatePractice(practice)

			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles negative zero', () => {
			const metadata = buildMetadata({ version: String(-0) })

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(false)
		})
	})

	describe('edge cases in arrays', () => {
		it('handles sparse arrays in requirements', () => {
			const requirements = new Array(10)
			requirements[0] = 'First requirement'
			requirements[9] = 'Last requirement'

			const practice = buildPractice({ requirements })

			const result = validatePractice(practice)

			// Should reject due to undefined elements
			expect(result.isValid).toBe(false)
		})

		it('handles requirements with prototype pollution attempt', () => {
			const requirements = ['Valid requirement']
			requirements.__proto__ = { polluted: true }

			const practice = buildPractice({ requirements })

			const result = validatePractice(practice)

			// Should reject arrays with prototype pollution (security protection)
			expect(result.isValid).toBe(false)
		})
	})

	describe('validation error resilience', () => {
		it('continues validation despite multiple errors', () => {
			const practice = {
				id: '',
				name: '',
				type: 'invalid',
				category: 'invalid',
				description: '',
				requirements: [],
				benefits: []
			}

			const result = validatePractice(practice)

			expect(result.isValid).toBe(false)
			// Should collect all errors, not stop at first
			expect(Object.keys(result.errors).length).toBeGreaterThan(3)
		})

		it('handles validation of deeply nested invalid schema', () => {
			const schema = {
				practices: [
					{
						id: '',
						name: '',
						type: 'invalid',
						category: 'invalid',
						description: '',
						requirements: ['', null, 123],
						benefits: []
					}
				],
				dependencies: [
					{ practice_id: '', depends_on_id: '' },
					{ practice_id: null, depends_on_id: null }
				],
				metadata: {
					version: 'invalid',
					lastUpdated: 'invalid'
				}
			}

			const result = validateSchema(schema)

			expect(result.isValid).toBe(false)
			expect(result.errors).toBeDefined()
		})
	})

	describe('memory and performance edge cases', () => {
		it('handles validation without memory leaks (large practice)', () => {
			const largePractice = buildPractice({
				requirements: Array.from({ length: 10000 }, (_, i) => `Requirement ${i}`),
				benefits: Array.from({ length: 10000 }, (_, i) => `Benefit ${i}`)
			})

			// Run validation multiple times
			for (let i = 0; i < 100; i++) {
				validatePractice(largePractice)
			}

			// If we get here without OOM, test passes
			expect(true).toBe(true)
		})

		it('handles validation of same object repeatedly', () => {
			const practice = buildPractice()

			// Validate same object many times
			for (let i = 0; i < 1000; i++) {
				const result = validatePractice(practice)
				expect(result.isValid).toBe(true)
			}
		})
	})
})
