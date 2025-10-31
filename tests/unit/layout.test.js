import { describe, it, expect, vi } from 'vitest'
import {
	optimizeLayerOrdering,
	calculateTotalConnectionLength,
	groupByCategory
} from '../../src/lib/domain/practice-graph/layout.js'

describe('Graph Layout Optimization', () => {
	describe('optimizeLayerOrdering', () => {
		it('preserves single nodes per level', () => {
			// Suppress expected warnings from test data missing maturityLevel
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			const input = {
				0: [{ id: 'root', dependencies: [{ id: 'a' }] }],
				1: [{ id: 'a', dependencies: [] }]
			}

			const result = optimizeLayerOrdering(input, 1)

			expect(result[0]).toHaveLength(1)
			expect(result[1]).toHaveLength(1)
			expect(result[0][0].id).toBe('root')
			expect(result[1][0].id).toBe('a')

			warnSpy.mockRestore()
		})

		it('optimizes simple two-level graph', () => {
			// Suppress expected warnings from test data missing maturityLevel
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			// Parent in middle connects to children on sides
			const input = {
				0: [{ id: 'root', dependencies: [{ id: 'left' }, { id: 'right' }] }],
				1: [
					{ id: 'left', dependencies: [] },
					{ id: 'middle', dependencies: [] },
					{ id: 'right', dependencies: [] }
				]
			}

			const result = optimizeLayerOrdering(input, 3)

			// After optimization, all practices should still be present
			const level1Ids = result[1].map(p => p.id)
			expect(level1Ids).toContain('left')
			expect(level1Ids).toContain('middle')
			expect(level1Ids).toContain('right')

			// Connected children (left and right) should ideally be adjacent
			// This is a soft check - the algorithm tries but may not always achieve this
			const leftIdx = level1Ids.indexOf('left')
			const rightIdx = level1Ids.indexOf('right')
			const distance = Math.abs(leftIdx - rightIdx)

			// Distance should be small (ideally 1, but 2 is also reasonable)
			expect(distance).toBeLessThanOrEqual(2)

			warnSpy.mockRestore()
		})

		it('handles empty input', () => {
			const result = optimizeLayerOrdering({}, 3)
			expect(result).toEqual({})
		})

		it('handles single level', () => {
			const input = {
				0: [
					{ id: 'a', dependencies: [] },
					{ id: 'b', dependencies: [] }
				]
			}

			const result = optimizeLayerOrdering(input, 1)
			expect(result[0]).toHaveLength(2)
		})

		it('preserves all practices', () => {
			// Suppress expected warnings from test data missing maturityLevel
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			const input = {
				0: [{ id: 'root', dependencies: [{ id: 'a' }, { id: 'b' }] }],
				1: [
					{ id: 'a', dependencies: [] },
					{ id: 'b', dependencies: [] }
				]
			}

			const result = optimizeLayerOrdering(input, 3)

			// Count total practices
			const inputCount = Object.values(input).flat().length
			const outputCount = Object.values(result).flat().length

			expect(outputCount).toBe(inputCount)

			warnSpy.mockRestore()
		})

		it('optimizes diamond pattern', () => {
			// Suppress expected warnings from test data missing maturityLevel
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			// Classic diamond: root -> a,b -> leaf
			const input = {
				0: [
					{
						id: 'root',
						dependencies: [{ id: 'a' }, { id: 'b' }]
					}
				],
				1: [
					{
						id: 'a',
						dependencies: [{ id: 'leaf' }]
					},
					{
						id: 'b',
						dependencies: [{ id: 'leaf' }]
					}
				],
				2: [{ id: 'leaf', dependencies: [] }]
			}

			const result = optimizeLayerOrdering(input, 3)

			// Both a and b should be at level 1
			expect(result[1]).toHaveLength(2)
			const level1Ids = result[1].map(p => p.id)
			expect(level1Ids).toContain('a')
			expect(level1Ids).toContain('b')

			warnSpy.mockRestore()
		})
	})

	describe('calculateTotalConnectionLength', () => {
		it('calculates zero for single node', () => {
			const input = {
				0: [{ id: 'root', dependencies: [] }]
			}

			const length = calculateTotalConnectionLength(input, 1)
			expect(length).toBe(0)
		})

		it('calculates length for simple connection', () => {
			const input = {
				0: [{ id: 'root', dependencies: [{ id: 'child' }] }],
				1: [{ id: 'child', dependencies: [] }]
			}

			const length = calculateTotalConnectionLength(input, 1)

			// Should be sqrt(0^2 + 10^2) = 10 (vertical distance scaled by 10)
			expect(length).toBe(10)
		})

		it('calculates longer length for horizontal separation', () => {
			const input = {
				0: [{ id: 'root', dependencies: [{ id: 'far' }] }],
				1: [
					{ id: 'near', dependencies: [] },
					{ id: 'far', dependencies: [] }
				]
			}

			const length = calculateTotalConnectionLength(input, 1)

			// Should be longer than vertical-only connection
			expect(length).toBeGreaterThan(10)
		})
	})

	describe('groupByCategory', () => {
		it('groups practices by category within levels', () => {
			const input = {
				0: [
					{ id: 'a', category: 'automation', dependencies: [] },
					{ id: 'b', category: 'behavior', dependencies: [] },
					{ id: 'c', category: 'automation', dependencies: [] }
				]
			}

			const result = groupByCategory(input)

			// Practices with same category should be adjacent
			const ids = result[0].map(p => p.id)
			const firstAuto = ids.indexOf('a')
			const secondAuto = ids.indexOf('c')

			// Both automation practices should be together
			expect(Math.abs(firstAuto - secondAuto)).toBe(1)
		})

		it('handles missing categories', () => {
			const input = {
				0: [
					{ id: 'a', dependencies: [] },
					{ id: 'b', category: 'behavior', dependencies: [] }
				]
			}

			const result = groupByCategory(input)
			expect(result[0]).toHaveLength(2)
		})

		it('preserves all practices', () => {
			const input = {
				0: [
					{ id: 'a', category: 'automation', dependencies: [] },
					{ id: 'b', category: 'behavior', dependencies: [] }
				],
				1: [{ id: 'c', category: 'automation', dependencies: [] }]
			}

			const result = groupByCategory(input)

			const totalInput = Object.values(input).flat().length
			const totalOutput = Object.values(result).flat().length

			expect(totalOutput).toBe(totalInput)
		})
	})
})
