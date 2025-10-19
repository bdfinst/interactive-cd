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
				{ id: 'branch2', level: 1 },
				{ id: 'branch1-child1', level: 2 },
				{ id: 'branch1-child2', level: 2 },
				{ id: 'branch2-child1', level: 2 }
			])
		})

		it('deduplicates practices appearing at multiple levels (shows at deepest level only)', () => {
			const sharedDependency = {
				id: 'shared',
				name: 'Shared Practice',
				dependencies: []
			}

			const tree = {
				id: 'root',
				dependencies: [
					{
						id: 'branch1',
						dependencies: [sharedDependency] // shared at level 2
					},
					{
						id: 'branch2',
						dependencies: [
							{
								id: 'intermediate',
								dependencies: [sharedDependency] // shared at level 3 (deeper)
							}
						]
					}
				]
			}

			const result = flattenTree(tree)

			// Should only include 'shared' once
			const sharedOccurrences = result.filter(n => n.id === 'shared')
			expect(sharedOccurrences).toHaveLength(1)

			// Should be at the deepest level (3, not 2)
			expect(sharedOccurrences[0].level).toBe(3)

			// Total should be 5 unique practices
			expect(result).toHaveLength(5)
			expect(result.map(n => ({ id: n.id, level: n.level }))).toEqual([
				{ id: 'root', level: 0 },
				{ id: 'branch1', level: 1 },
				{ id: 'branch2', level: 1 },
				{ id: 'intermediate', level: 2 },
				{ id: 'shared', level: 3 }
			])
		})

		it('deduplicates multiple shared practices at various levels', () => {
			const versionControl = { id: 'version-control', name: 'Version Control', dependencies: [] }
			const automation = { id: 'automation', name: 'Automation', dependencies: [] }

			const tree = {
				id: 'continuous-delivery',
				dependencies: [
					{
						id: 'continuous-integration',
						dependencies: [versionControl, automation] // level 2
					},
					{
						id: 'trunk-based-development',
						dependencies: [
							versionControl, // level 2 (same as above)
							{
								id: 'feature-toggles',
								dependencies: [automation] // level 3 (deeper than above)
							}
						]
					}
				]
			}

			const result = flattenTree(tree)

			// version-control appears at level 2 (both occurrences same depth)
			const vcOccurrences = result.filter(n => n.id === 'version-control')
			expect(vcOccurrences).toHaveLength(1)
			expect(vcOccurrences[0].level).toBe(2)

			// automation appears at level 3 (deeper occurrence wins)
			const autoOccurrences = result.filter(n => n.id === 'automation')
			expect(autoOccurrences).toHaveLength(1)
			expect(autoOccurrences[0].level).toBe(3)

			// Total unique practices
			expect(result).toHaveLength(6)
		})
	})
})
