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

			expect(result).toEqual({ adoptedCount: 0, totalCount: 0 })
		})

		it('returns 0 when no dependencies are adopted', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing']
			}
			const adoptedSet = new Set()

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(0)
		})

		it('counts adopted dependencies correctly', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing', 'trunk-based-dev']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(2)
		})

		it('returns total when all dependencies are adopted', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing', 'continuous-integration'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(2)
		})

		it('handles single dependency', () => {
			const practice = {
				id: 'feature-flags',
				dependencies: ['version-control']
			}
			const adoptedSet = new Set(['version-control'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(1)
		})

		it('handles practice with dependencies array containing duplicates', () => {
			const practice = {
				id: 'test-practice',
				dependencies: ['version-control', 'version-control', 'automated-testing']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			// Should count unique dependencies
			expect(result.adoptedCount).toBe(2)
		})

		it('handles null or undefined practice gracefully', () => {
			const adoptedSet = new Set(['version-control'])

			expect(calculateAdoptedDependencies(null, adoptedSet, new Map())).toEqual({
				adoptedCount: 0,
				totalCount: 0
			})
			expect(calculateAdoptedDependencies(undefined, adoptedSet, new Map())).toEqual({
				adoptedCount: 0,
				totalCount: 0
			})
		})

		it('handles null or undefined dependencies array', () => {
			const practice = {
				id: 'test-practice',
				dependencies: null
			}
			const adoptedSet = new Set(['version-control'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(0)
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

	describe('Transitive Dependencies', () => {
		it('counts transitive dependencies when practice map is provided', () => {
			// Build practice map: CI -> VC, CI -> AT, VC -> TBD
			const practiceMap = new Map()
			practiceMap.set('continuous-integration', {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing']
			})
			practiceMap.set('version-control', {
				id: 'version-control',
				dependencies: ['trunk-based-dev']
			})
			practiceMap.set('automated-testing', {
				id: 'automated-testing',
				dependencies: ['test-automation', 'tdd']
			})
			practiceMap.set('trunk-based-dev', {
				id: 'trunk-based-dev',
				dependencies: []
			})
			practiceMap.set('test-automation', {
				id: 'test-automation',
				dependencies: []
			})
			practiceMap.set('tdd', {
				id: 'tdd',
				dependencies: []
			})

			// Adopt version-control (direct), trunk-based-dev (transitive), tdd (transitive)
			const adoptedSet = new Set(['version-control', 'trunk-based-dev', 'tdd'])

			const result = calculateAdoptedDependencies(
				practiceMap.get('continuous-integration'),
				adoptedSet,
				practiceMap
			)

			// Should count: version-control (direct) + trunk-based-dev (transitive via VC) + tdd (transitive via AT)
			expect(result.adoptedCount).toBe(3)
		})

		it('counts only direct dependencies when practice map is empty', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: ['version-control', 'automated-testing']
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])
			const emptyMap = new Map()

			const result = calculateAdoptedDependencies(practice, adoptedSet, emptyMap)

			// Should only count direct dependencies
			expect(result.adoptedCount).toBe(2)
		})

		it('handles cyclic dependencies gracefully', () => {
			const practiceMap = new Map()
			practiceMap.set('practice-a', {
				id: 'practice-a',
				dependencies: ['practice-b']
			})
			practiceMap.set('practice-b', {
				id: 'practice-b',
				dependencies: ['practice-c']
			})
			practiceMap.set('practice-c', {
				id: 'practice-c',
				dependencies: ['practice-a'] // Cycle!
			})

			const adoptedSet = new Set(['practice-b', 'practice-c'])

			const result = calculateAdoptedDependencies(
				practiceMap.get('practice-a'),
				adoptedSet,
				practiceMap
			)

			// Should handle cycle and count unique dependencies
			expect(result.adoptedCount).toBe(2) // practice-b and practice-c
		})

		it('counts all levels of transitive dependencies', () => {
			const practiceMap = new Map()
			// CD -> CI -> VC -> TBD -> GIT
			practiceMap.set('continuous-delivery', {
				id: 'continuous-delivery',
				dependencies: ['continuous-integration']
			})
			practiceMap.set('continuous-integration', {
				id: 'continuous-integration',
				dependencies: ['version-control']
			})
			practiceMap.set('version-control', {
				id: 'version-control',
				dependencies: ['trunk-based-dev']
			})
			practiceMap.set('trunk-based-dev', {
				id: 'trunk-based-dev',
				dependencies: ['git-basics']
			})
			practiceMap.set('git-basics', {
				id: 'git-basics',
				dependencies: []
			})

			// Adopt all practices
			const adoptedSet = new Set([
				'continuous-integration',
				'version-control',
				'trunk-based-dev',
				'git-basics'
			])

			const result = calculateAdoptedDependencies(
				practiceMap.get('continuous-delivery'),
				adoptedSet,
				practiceMap
			)

			// Should count all 4 levels of transitive dependencies
			expect(result.adoptedCount).toBe(4)
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

			expect(count).toEqual({ adoptedCount: 0, totalCount: 0 })
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

	describe('Object-based dependencies', () => {
		it('handles dependencies as objects with id property', () => {
			const practice = {
				id: 'continuous-integration',
				dependencies: [
					{ id: 'version-control', name: 'Version Control' },
					{ id: 'automated-testing', name: 'Automated Testing' }
				]
			}
			const adoptedSet = new Set(['version-control'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(1)
		})

		it('handles mixed string and object dependencies', () => {
			const practice = {
				id: 'test-practice',
				dependencies: [
					'version-control', // String
					{ id: 'automated-testing', name: 'Automated Testing' } // Object
				]
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(2)
		})

		it('counts transitive dependencies with object structure', () => {
			const practiceMap = new Map()
			practiceMap.set('continuous-delivery', {
				id: 'continuous-delivery',
				dependencies: [{ id: 'continuous-integration', name: 'CI' }]
			})
			practiceMap.set('continuous-integration', {
				id: 'continuous-integration',
				dependencies: [
					{ id: 'version-control', name: 'VC' },
					{ id: 'automated-testing', name: 'AT' }
				]
			})
			practiceMap.set('version-control', {
				id: 'version-control',
				dependencies: [{ id: 'trunk-based-dev', name: 'TBD' }]
			})
			practiceMap.set('trunk-based-dev', {
				id: 'trunk-based-dev',
				dependencies: []
			})
			practiceMap.set('automated-testing', {
				id: 'automated-testing',
				dependencies: []
			})

			// Adopt version-control, trunk-based-dev, and automated-testing
			const adoptedSet = new Set(['version-control', 'trunk-based-dev', 'automated-testing'])

			const result = calculateAdoptedDependencies(
				practiceMap.get('continuous-delivery'),
				adoptedSet,
				practiceMap
			)

			// Should count: CI -> VC (adopted), VC -> TBD (adopted), CI -> AT (adopted)
			// Total: 4 dependencies (CI, VC, TBD, AT), 3 adopted (VC, TBD, AT)
			expect(result.adoptedCount).toBe(3)
		})

		it('handles null or undefined object dependencies', () => {
			const practice = {
				id: 'test-practice',
				dependencies: [{ id: 'version-control' }, null, undefined, { id: 'automated-testing' }]
			}
			const adoptedSet = new Set(['version-control', 'automated-testing'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(2)
		})

		it('handles object dependencies without id property', () => {
			const practice = {
				id: 'test-practice',
				dependencies: [
					{ name: 'Invalid' }, // No id property
					{ id: 'version-control' }
				]
			}
			const adoptedSet = new Set(['version-control'])

			const result = calculateAdoptedDependencies(practice, adoptedSet, new Map())

			expect(result.adoptedCount).toBe(1)
		})
	})
})
