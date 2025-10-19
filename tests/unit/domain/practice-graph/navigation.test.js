import { describe, it, expect } from 'vitest'
import {
	expandPractice,
	navigateBack,
	navigateToAncestor,
	isPracticeExpanded
} from '$lib/domain/practice-graph/navigation.js'

describe('Practice Graph Navigation', () => {
	describe('expandPractice', () => {
		it('adds practice to path when expanding', () => {
			const path = ['continuous-delivery']
			const result = expandPractice(path, 'trunk-based-development')

			expect(result).toEqual(['continuous-delivery', 'trunk-based-development'])
		})

		it('navigates back when collapsing current practice', () => {
			const path = ['continuous-delivery', 'trunk-based-development']
			const result = expandPractice(path, 'trunk-based-development')

			expect(result).toEqual(['continuous-delivery'])
		})

		it('does not mutate original path', () => {
			const path = ['continuous-delivery']
			const originalPath = [...path]

			expandPractice(path, 'trunk-based-development')

			expect(path).toEqual(originalPath)
		})

		it('can expand multiple levels deep', () => {
			let path = ['continuous-delivery']
			path = expandPractice(path, 'continuous-integration')
			path = expandPractice(path, 'trunk-based-development')

			expect(path).toEqual([
				'continuous-delivery',
				'continuous-integration',
				'trunk-based-development'
			])
		})

		it('handles collapse at any level', () => {
			const path = ['a', 'b', 'c']
			const result = expandPractice(path, 'c')

			expect(result).toEqual(['a', 'b'])
		})
	})

	describe('navigateBack', () => {
		it('removes last item from path', () => {
			const path = ['a', 'b', 'c']
			const result = navigateBack(path)

			expect(result).toEqual(['a', 'b'])
		})

		it('returns same path when at root', () => {
			const path = ['continuous-delivery']
			const result = navigateBack(path)

			expect(result).toEqual(['continuous-delivery'])
		})

		it('does not mutate original path', () => {
			const path = ['a', 'b']
			const originalPath = [...path]

			navigateBack(path)

			expect(path).toEqual(originalPath)
		})

		it('can navigate back multiple times', () => {
			let path = ['a', 'b', 'c', 'd']
			path = navigateBack(path)
			path = navigateBack(path)

			expect(path).toEqual(['a', 'b'])
		})

		it('stops at root and does not go below', () => {
			let path = ['root']
			path = navigateBack(path)
			path = navigateBack(path)

			expect(path).toEqual(['root'])
		})
	})

	describe('navigateToAncestor', () => {
		it('navigates to ancestor at specific index', () => {
			const path = ['a', 'b', 'c', 'd']
			const result = navigateToAncestor(path, 1)

			expect(result).toEqual(['a', 'b'])
		})

		it('navigates to root when index is 0', () => {
			const path = ['a', 'b', 'c']
			const result = navigateToAncestor(path, 0)

			expect(result).toEqual(['a'])
		})

		it('returns same path for invalid negative index', () => {
			const path = ['a', 'b', 'c']
			const result = navigateToAncestor(path, -1)

			expect(result).toEqual(['a', 'b', 'c'])
		})

		it('returns same path for index >= length - 1', () => {
			const path = ['a', 'b', 'c']
			const result = navigateToAncestor(path, 2) // length is 3, so 2 >= 3-1

			expect(result).toEqual(['a', 'b', 'c'])
		})

		it('does not mutate original path', () => {
			const path = ['a', 'b', 'c']
			const originalPath = [...path]

			navigateToAncestor(path, 1)

			expect(path).toEqual(originalPath)
		})
	})

	describe('isPracticeExpanded', () => {
		it('returns true when practice is current and path length > 1', () => {
			const path = ['a', 'b']
			const result = isPracticeExpanded(path, 'b')

			expect(result).toBe(true)
		})

		it('returns false when practice is current but at root', () => {
			const path = ['continuous-delivery']
			const result = isPracticeExpanded(path, 'continuous-delivery')

			expect(result).toBe(false)
		})

		it('returns false when practice is not current', () => {
			const path = ['a', 'b', 'c']
			const result = isPracticeExpanded(path, 'b')

			expect(result).toBe(false)
		})

		it('returns false for practice not in path', () => {
			const path = ['a', 'b']
			const result = isPracticeExpanded(path, 'z')

			expect(result).toBe(false)
		})

		it('handles empty string practice IDs', () => {
			const path = ['a', '']
			const result = isPracticeExpanded(path, '')

			expect(result).toBe(true)
		})
	})
})
