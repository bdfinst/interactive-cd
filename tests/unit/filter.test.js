import { describe, it, expect } from 'vitest'
import { filterTreeBySelection } from '../../src/lib/domain/practice-graph/filter.js'

describe('filterTreeBySelection', () => {
	const buildPractice = (id, dependencyIds = []) => ({
		id,
		name: `Practice ${id}`,
		level: 0,
		dependencies: dependencyIds.map(depId => ({ id: depId }))
	})

	it('returns full tree when no practice is selected', () => {
		const tree = [buildPractice('a'), buildPractice('b'), buildPractice('c')]

		const result = filterTreeBySelection(tree, null)

		expect(result).toEqual(tree)
		expect(result.length).toBe(3)
	})

	it('returns full tree when selected practice not found', () => {
		const tree = [buildPractice('a'), buildPractice('b')]

		const result = filterTreeBySelection(tree, 'nonexistent')

		expect(result).toEqual(tree)
	})

	it('returns only selected practice when it has no dependencies or dependents', () => {
		const tree = [buildPractice('a'), buildPractice('b'), buildPractice('c')]

		const result = filterTreeBySelection(tree, 'b')

		expect(result.length).toBe(1)
		expect(result[0].id).toBe('b')
	})

	it('includes practices that the selected practice depends on', () => {
		const tree = [
			buildPractice('root', ['a', 'b']),
			buildPractice('a', ['c']),
			buildPractice('b'),
			buildPractice('c')
		]

		const result = filterTreeBySelection(tree, 'a')

		const resultIds = result.map(p => p.id).sort()
		expect(resultIds).toEqual(['a', 'c', 'root'])
	})

	it('includes practices that depend on the selected practice', () => {
		const tree = [
			buildPractice('root', ['a']),
			buildPractice('a', ['b']),
			buildPractice('b'),
			buildPractice('unrelated')
		]

		const result = filterTreeBySelection(tree, 'b')

		const resultIds = result.map(p => p.id).sort()
		// Should include: b (selected), a (depends on b), root (depends on a)
		expect(resultIds).toEqual(['a', 'b', 'root'])
	})

	it('handles complex dependency graph', () => {
		const tree = [
			buildPractice('root', ['a', 'b']),
			buildPractice('a', ['c', 'd']),
			buildPractice('b', ['d']),
			buildPractice('c', ['e']),
			buildPractice('d', ['e']),
			buildPractice('e'),
			buildPractice('unrelated')
		]

		const result = filterTreeBySelection(tree, 'd')

		const resultIds = result.map(p => p.id).sort()
		// Should include: d (selected), e (d depends on it),
		// a and b (depend on d), root (depends on a and b)
		expect(resultIds).toEqual(['a', 'b', 'd', 'e', 'root'])
		expect(resultIds).not.toContain('c')
		expect(resultIds).not.toContain('unrelated')
	})

	it('handles diamond dependency pattern', () => {
		const tree = [
			buildPractice('root', ['a', 'b']),
			buildPractice('a', ['leaf']),
			buildPractice('b', ['leaf']),
			buildPractice('leaf')
		]

		const result = filterTreeBySelection(tree, 'leaf')

		const resultIds = result.map(p => p.id).sort()
		// Should include all practices since they all relate to leaf
		expect(resultIds).toEqual(['a', 'b', 'leaf', 'root'])
	})

	it('handles selecting a middle practice in chain', () => {
		const tree = [
			buildPractice('top', ['middle']),
			buildPractice('middle', ['bottom']),
			buildPractice('bottom'),
			buildPractice('sibling')
		]

		const result = filterTreeBySelection(tree, 'middle')

		const resultIds = result.map(p => p.id).sort()
		// Should include: middle (selected), bottom (middle depends on it), top (depends on middle)
		expect(resultIds).toEqual(['bottom', 'middle', 'top'])
		expect(resultIds).not.toContain('sibling')
	})

	it('handles empty tree', () => {
		const result = filterTreeBySelection([], 'any')

		expect(result).toEqual([])
	})

	it('includes transitive dependencies', () => {
		const tree = [
			buildPractice('root', ['a']),
			buildPractice('a', ['b']),
			buildPractice('b', ['c']),
			buildPractice('c', ['d']),
			buildPractice('d')
		]

		const result = filterTreeBySelection(tree, 'b')

		const resultIds = result.map(p => p.id).sort()
		// Should include entire chain: root->a->b->c->d
		expect(resultIds).toEqual(['a', 'b', 'c', 'd', 'root'])
	})
})
