import { describe, it, expect } from 'vitest'
import {
	calculateAdoptedDependencies,
	calculateAdoptionPercentage,
	filterValidPracticeIds
} from '$lib/utils/adoption.js'

describe('adoption', () => {
	describe('calculateAdoptedDependencies', () => {
		it('returns 0 when practice has no dependencies', () => {
			const practice = {
				id: 'version-control',
				dependencies: []
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result).toBe(0)
		})

		it('returns 0 when no dependencies are adopted', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing']
			}
			const adoptedSet = new Set()

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result).toBe(0)
		})

		it('counts adopted dependencies correctly', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing', 'trunk-based-dev']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result).toBe(2)
		})

		it('returns total when all dependencies are adopted', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing', 'continuous-integration'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result).toBe(2)
		})

		it('handles single dependency', () => {
			const practice = {
				id: 'feature-flags',
				dependencies: ['version-control']
			}
			const adoptedSet = new Set(['version-control'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result).toBe(1)
		})

		it('handles practice with dependencies array containing duplicates', () => {
			const practice = {
				id: 'test-practice',
				dependencies: ['version-control', 'version-control', 'automated-testing']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			// Should count unique dependencies
			expect(result).toBe(2)
		})

		it('handles null or undefined practice gracefully', () => {
			const adoptedSet = new Set(['version-control'])

			expect(calculateAdoptedDependencies(null, adoptedSet, new Map())).toBe(0)
			expect(calculateAdoptedDependencies(undefined, adoptedSet, new Map())).toBe(0)
		})

		it('handles null or undefined dependencies array', () => {
			const practice = {
				id: 'test-practice',
				dependencies: null
			}
			const adoptedSet = new Set(['version-control'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result).toBe(0)
		})
	})

	describe('calculateAdoptionPercentage', () => {
		it('returns 0 when total is 0', () => {
			const result = calculateAdoptionPercentage(0, 0)
			expect(result).toBe(0)
		})

		it('returns 0 when adopted is 0', () => {
			const result = calculateAdoptionPercentage(0, 10)
			expect(result).toBe(0)
		})

		it('returns 100 when all practices are adopted', () => {
			const result = calculateAdoptionPercentage(10, 10)
			expect(result).toBe(100)
		})

		it('calculates percentage correctly', () => {
			expect(calculateAdoptionPercentage(1, 4)).toBe(25)
			expect(calculateAdoptionPercentage(2, 4)).toBe(50)
			expect(calculateAdoptionPercentage(3, 4)).toBe(75)
		})

		it('rounds to nearest integer', () => {
			expect(calculateAdoptionPercentage(1, 3)).toBe(33) // 33.333... → 33
			expect(calculateAdoptionPercentage(2, 3)).toBe(67) // 66.666... → 67
			expect(calculateAdoptionPercentage(5, 7)).toBe(71) // 71.428... → 71
		})

		it('handles 50% correctly', () => {
			expect(calculateAdoptionPercentage(5, 10)).toBe(50)
			expect(calculateAdoptionPercentage(27, 54)).toBe(50)
		})

		it('returns 0 when adopted is negative', () => {
			const result = calculateAdoptionPercentage(-5, 10)
			expect(result).toBe(0)
		})

		it('returns 0 when total is negative', () => {
			const result = calculateAdoptionPercentage(5, -10)
			expect(result).toBe(0)
		})

		it('handles very large numbers', () => {
			const result = calculateAdoptionPercentage(500, 1000)
			expect(result).toBe(50)
		})

		it('handles decimal inputs by rounding', () => {
			const result = calculateAdoptionPercentage(2.7, 5.3)
			expect(result).toBeGreaterThanOrEqual(0)
			expect(result).toBeLessThanOrEqual(100)
		})
	})

	describe('filterValidPracticeIds', () => {
		it('returns empty set when input is empty', () => {
			const validIds = new Set(['version-control', 'automated-testing'])
			const result = filterValidPracticeIds(new Set(), validIds)

			expect(result).toEqual(new Set())
		})

		it('returns empty set when all IDs are invalid', () => {
			const inputIds = new Set(['invalid-1', 'invalid-2'])
			const validIds = new Set(['version-control', 'automated-testing'])

			const result = filterValidPracticeIds(inputIds, validIds)

			expect(result).toEqual(new Set())
		})

		it('filters out invalid IDs', () => {
			const inputIds = new Set([
				'version-control',
				'invalid-id',
				'automated-testing',
				'another-invalid'
			])
			const validIds = new Set(['version-control', 'automated-testing', 'trunk-based-dev'])

			const result = filterValidPracticeIds(inputIds, validIds)

			expect(result).toEqual(new Set(['version-control', 'automated-testing']))
		})

		it('returns all IDs when all are valid', () => {
			const inputIds = new Set(['version-control', 'automated-testing'])
			const validIds = new Set(['version-control', 'automated-testing', 'trunk-based-dev'])

			const result = filterValidPracticeIds(inputIds, validIds)

			expect(result).toEqual(new Set(['version-control', 'automated-testing']))
		})

		it('handles null or undefined input gracefully', () => {
			const validIds = new Set(['version-control'])

			expect(filterValidPracticeIds(null, validIds)).toEqual(new Set())
			expect(filterValidPracticeIds(undefined, validIds)).toEqual(new Set())
		})

		it('handles null or undefined validIds gracefully', () => {
			const inputIds = new Set(['version-control'])

			expect(filterValidPracticeIds(inputIds, null)).toEqual(new Set())
			expect(filterValidPracticeIds(inputIds, undefined)).toEqual(new Set())
		})

		it('handles empty validIds set', () => {
			const inputIds = new Set(['version-control', 'automated-testing'])
			const validIds = new Set()

			const result = filterValidPracticeIds(inputIds, validIds)

			expect(result).toEqual(new Set())
		})

		it('is case-sensitive', () => {
			const inputIds = new Set(['Version-Control', 'AUTOMATED-TESTING'])
			const validIds = new Set(['version-control', 'automated-testing'])

			const result = filterValidPracticeIds(inputIds, validIds)

			// Should not match different case
			expect(result).toEqual(new Set())
		})

		it('handles large sets efficiently', () => {
			const inputIds = new Set()
			const validIds = new Set()

			// Create large sets
			for (let i = 0; i < 1000; i++) {
				validIds.add(`practice-${i}`)
				if (i % 2 === 0) {
					inputIds.add(`practice-${i}`)
				} else {
					inputIds.add(`invalid-${i}`)
				}
			}

			const result = filterValidPracticeIds(inputIds, validIds)

			// Should filter out all invalid IDs
			expect(result.size).toBe(500)
			result.forEach(id => {
				expect(id).toMatch(/^practice-\d+$/)
				expect(validIds.has(id)).toBe(true)
			})
		})
	})

	describe('Edge cases and integration', () => {
		it('handles practice with empty dependencies array', () => {
			const practice = {
				id: 'standalone-practice',
				dependencies: []
			}
			const adoptedSet = new Set(['standalone-practice', 'other-practice'])

			const count = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(count).toBe(0)
		})

		it('calculates 0% adoption correctly', () => {
			const percentage = calculateAdoptionPercentage(0, 54)

			expect(percentage).toBe(0)
		})

		it('calculates 100% adoption correctly', () => {
			const percentage = calculateAdoptionPercentage(54, 54)

			expect(percentage).toBe(100)
		})

		it('filters and calculates in sequence', () => {
			// Step 1: Filter valid IDs
			const inputIds = new Set(['version-control', 'invalid-id', 'automated-testing'])
			const validIds = new Set(['version-control', 'automated-testing', 'trunk-based-dev'])
			const filtered = filterValidPracticeIds(inputIds, validIds)

			expect(filtered).toEqual(new Set(['version-control', 'automated-testing']))

			// Step 2: Calculate adoption percentage
			const percentage = calculateAdoptionPercentage(filtered.size, validIds.size)

			expect(percentage).toBe(67) // 2/3 = 66.67% → 67%
		})
	})
})
