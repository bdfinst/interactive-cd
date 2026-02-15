import { describe, it, expect } from 'vitest'
import {
	calculateNextRecommendation,
	calculateAdoptionProgress
} from '$lib/domain/guided-walkthrough/recommendation.js'

const buildPractice = (overrides = {}) => ({
	id: overrides.id || 'test-practice',
	name: overrides.name || 'Test Practice',
	maturityLevel: overrides.maturityLevel ?? 0,
	dependencies: overrides.dependencies || [],
	...overrides
})

const buildPracticeMap = practices => {
	const map = new Map()
	practices.forEach(p => map.set(p.id, p))
	return map
}

describe('calculateNextRecommendation', () => {
	it('returns practice with no dependencies when nothing is adopted', () => {
		const practices = [
			buildPractice({ id: 'a', name: 'A', dependencies: [] }),
			buildPractice({ id: 'b', name: 'B', dependencies: [{ id: 'a' }] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set()

		const result = calculateNextRecommendation(map, adopted)

		expect(result.id).toBe('a')
	})

	it('returns practice whose dependencies are all adopted', () => {
		const practices = [
			buildPractice({ id: 'a', name: 'A', dependencies: [] }),
			buildPractice({ id: 'b', name: 'B', dependencies: [{ id: 'a' }] }),
			buildPractice({ id: 'c', name: 'C', dependencies: [{ id: 'a' }, { id: 'b' }] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a'])

		const result = calculateNextRecommendation(map, adopted)

		expect(result.id).toBe('b')
	})

	it('prioritizes lower maturity level', () => {
		const practices = [
			buildPractice({ id: 'tier2', name: 'Tier 2', maturityLevel: 2, dependencies: [] }),
			buildPractice({ id: 'tier0', name: 'Tier 0', maturityLevel: 0, dependencies: [] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set()

		const result = calculateNextRecommendation(map, adopted)

		expect(result.id).toBe('tier0')
	})

	it('breaks maturity ties alphabetically by ID', () => {
		const practices = [
			buildPractice({ id: 'zebra', name: 'Zebra', maturityLevel: 0, dependencies: [] }),
			buildPractice({ id: 'alpha', name: 'Alpha', maturityLevel: 0, dependencies: [] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set()

		const result = calculateNextRecommendation(map, adopted)

		expect(result.id).toBe('alpha')
	})

	it('returns null when all practices are adopted', () => {
		const practices = [
			buildPractice({ id: 'a', name: 'A', dependencies: [] }),
			buildPractice({ id: 'b', name: 'B', dependencies: [] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a', 'b'])

		const result = calculateNextRecommendation(map, adopted)

		expect(result).toBeNull()
	})

	it('returns null when remaining practices have unmet dependencies', () => {
		const practices = [
			buildPractice({ id: 'a', name: 'A', dependencies: [{ id: 'b' }] }),
			buildPractice({ id: 'b', name: 'B', dependencies: [{ id: 'a' }] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set()

		const result = calculateNextRecommendation(map, adopted)

		expect(result).toBeNull()
	})

	it('returns null for an empty practice map', () => {
		const map = new Map()
		const adopted = new Set()

		const result = calculateNextRecommendation(map, adopted)

		expect(result).toBeNull()
	})

	it('handles dependencies as string IDs', () => {
		const practices = [
			buildPractice({ id: 'a', name: 'A', dependencies: [] }),
			buildPractice({ id: 'b', name: 'B', dependencies: ['a'] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a'])

		const result = calculateNextRecommendation(map, adopted)

		expect(result.id).toBe('b')
	})

	it('skips adopted practices from candidates', () => {
		const practices = [
			buildPractice({ id: 'a', name: 'A', maturityLevel: 0, dependencies: [] }),
			buildPractice({ id: 'b', name: 'B', maturityLevel: 1, dependencies: [] })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a'])

		const result = calculateNextRecommendation(map, adopted)

		expect(result.id).toBe('b')
	})
})

describe('calculateAdoptionProgress', () => {
	it('returns zero progress for empty map', () => {
		const map = new Map()
		const adopted = new Set()

		const result = calculateAdoptionProgress(map, adopted)

		expect(result).toEqual({ total: 0, adopted: 0, percentage: 0 })
	})

	it('calculates correct percentage', () => {
		const practices = [
			buildPractice({ id: 'a' }),
			buildPractice({ id: 'b' }),
			buildPractice({ id: 'c' }),
			buildPractice({ id: 'd' })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a', 'b'])

		const result = calculateAdoptionProgress(map, adopted)

		expect(result.total).toBe(4)
		expect(result.adopted).toBe(2)
		expect(result.percentage).toBe(50)
	})

	it('returns 100% when all adopted', () => {
		const practices = [buildPractice({ id: 'a' }), buildPractice({ id: 'b' })]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a', 'b'])

		const result = calculateAdoptionProgress(map, adopted)

		expect(result.percentage).toBe(100)
	})

	it('rounds percentage to nearest integer', () => {
		const practices = [
			buildPractice({ id: 'a' }),
			buildPractice({ id: 'b' }),
			buildPractice({ id: 'c' })
		]
		const map = buildPracticeMap(practices)
		const adopted = new Set(['a'])

		const result = calculateAdoptionProgress(map, adopted)

		expect(result.percentage).toBe(33)
	})
})
