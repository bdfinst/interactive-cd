import { describe, it, expect } from 'vitest'
import { flattenTree } from '$lib/domain/practice-graph/tree.js'

describe('Practice Graph Tree Operations', () => {
	describe('flattenTree', () => {
		it('flattens single node tree', () => {
			const tree = {
				id: 'root',
				name: 'Root Practice',
				dependencies: []
			}

			const result = flattenTree(tree)

			expect(result).toEqual([
				{
					id: 'root',
					name: 'Root Practice',
					dependencies: [],
					level: 0
				}
			])
		})

		it('flattens tree with one level of dependencies', () => {
			const tree = {
				id: 'root',
				name: 'Root',
				dependencies: [
					{ id: 'child1', name: 'Child 1', dependencies: [] },
					{ id: 'child2', name: 'Child 2', dependencies: [] }
				]
			}

			const result = flattenTree(tree)

			expect(result).toHaveLength(3)
			expect(result[0]).toMatchObject({ id: 'root', level: 0 })
			expect(result[1]).toMatchObject({ id: 'child1', level: 1 })
			expect(result[2]).toMatchObject({ id: 'child2', level: 1 })
		})

		it('flattens deeply nested tree', () => {
			const tree = {
				id: 'root',
				dependencies: [
					{
						id: 'child',
						dependencies: [
							{
								id: 'grandchild',
								dependencies: [{ id: 'greatgrandchild', dependencies: [] }]
							}
						]
					}
				]
			}

			const result = flattenTree(tree)

			expect(result).toHaveLength(4)
			expect(result[0]).toMatchObject({ id: 'root', level: 0 })
			expect(result[1]).toMatchObject({ id: 'child', level: 1 })
			expect(result[2]).toMatchObject({ id: 'grandchild', level: 2 })
			expect(result[3]).toMatchObject({ id: 'greatgrandchild', level: 3 })
		})

		it('returns empty array for null node', () => {
			const result = flattenTree(null)

			expect(result).toEqual([])
		})

		it('returns empty array for undefined node', () => {
			const result = flattenTree(undefined)

			expect(result).toEqual([])
		})

		it('handles node with no dependencies property', () => {
			const tree = {
				id: 'root',
				name: 'Root'
			}

			const result = flattenTree(tree)

			expect(result).toEqual([
				{
					id: 'root',
					name: 'Root',
					level: 0
				}
			])
		})

		it('handles node with null dependencies', () => {
			const tree = {
				id: 'root',
				name: 'Root',
				dependencies: null
			}

			const result = flattenTree(tree)

			expect(result).toEqual([
				{
					id: 'root',
					name: 'Root',
					dependencies: null,
					level: 0
				}
			])
		})

		it('preserves all node properties', () => {
			const tree = {
				id: 'root',
				name: 'Root Practice',
				description: 'A root practice',
				category: 'practice',
				benefits: ['benefit1', 'benefit2'],
				dependencies: []
			}

			const result = flattenTree(tree)

			expect(result[0]).toEqual({
				id: 'root',
				name: 'Root Practice',
				description: 'A root practice',
				category: 'practice',
				benefits: ['benefit1', 'benefit2'],
				dependencies: [],
				level: 0
			})
		})

		it('handles multiple branches at same level', () => {
			const tree = {
				id: 'root',
				dependencies: [
					{
						id: 'branch1',
						dependencies: [
							{ id: 'branch1-child1', dependencies: [] },
							{ id: 'branch1-child2', dependencies: [] }
						]
					},
					{
						id: 'branch2',
						dependencies: [{ id: 'branch2-child1', dependencies: [] }]
					}
				]
			}

			const result = flattenTree(tree)

			expect(result).toHaveLength(6)
			expect(result.map(n => ({ id: n.id, level: n.level }))).toEqual([
				{ id: 'root', level: 0 },
				{ id: 'branch1', level: 1 },
				{ id: 'branch1-child1', level: 2 },
				{ id: 'branch1-child2', level: 2 },
				{ id: 'branch2', level: 1 },
				{ id: 'branch2-child1', level: 2 }
			])
		})
	})
})
