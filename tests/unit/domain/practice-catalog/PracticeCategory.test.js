import { describe, it, expect } from 'vitest'
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js'

describe('PracticeCategory', () => {
	describe('predefined categories', () => {
		it('has PRACTICE category', () => {
			expect(PracticeCategory.PRACTICE).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.PRACTICE)).toBe(true)
		})

		it('has BEHAVIOR category', () => {
			expect(PracticeCategory.BEHAVIOR).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.BEHAVIOR)).toBe(true)
		})

		it('has CULTURE category', () => {
			expect(PracticeCategory.CULTURE).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.CULTURE)).toBe(true)
		})

		it('has TOOLING category', () => {
			expect(PracticeCategory.TOOLING).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.TOOLING)).toBe(true)
		})

		it('each category has unique name', () => {
			const names = [
				PracticeCategory.PRACTICE.toString(),
				PracticeCategory.BEHAVIOR.toString(),
				PracticeCategory.CULTURE.toString(),
				PracticeCategory.TOOLING.toString()
			]

			const uniqueNames = new Set(names)
			expect(uniqueNames.size).toBe(4)
		})

		it('each category has an icon', () => {
			expect(PracticeCategory.PRACTICE.icon).toBeDefined()
			expect(PracticeCategory.BEHAVIOR.icon).toBeDefined()
			expect(PracticeCategory.CULTURE.icon).toBeDefined()
			expect(PracticeCategory.TOOLING.icon).toBeDefined()
		})

		it('all static instances are properly frozen', () => {
			expect(Object.isFrozen(PracticeCategory.PRACTICE)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.BEHAVIOR)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.CULTURE)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.TOOLING)).toBe(true)
		})
	})

	describe('from', () => {
		it('only allows predefined categories through factory method', () => {
			// Verify we can get valid categories
			const practice = PracticeCategory.from('practice')
			expect(practice).toBe(PracticeCategory.PRACTICE)

			const behavior = PracticeCategory.from('behavior')
			expect(behavior).toBe(PracticeCategory.BEHAVIOR)

			const culture = PracticeCategory.from('culture')
			expect(culture).toBe(PracticeCategory.CULTURE)

			const tooling = PracticeCategory.from('tooling')
			expect(tooling).toBe(PracticeCategory.TOOLING)

			// Verify invalid categories are rejected
			expect(() => PracticeCategory.from('custom-category')).toThrow('Invalid practice category')

			// Verify all valid categories are accessible
			const validCategories = ['practice', 'behavior', 'culture', 'tooling']
			validCategories.forEach(cat => {
				expect(() => PracticeCategory.from(cat)).not.toThrow()
			})
		})

		it('throws error for invalid inputs', () => {
			const invalidInputs = [null, undefined, '', 'invalid', 'PRACTICE', 123, {}, []]

			invalidInputs.forEach(input => {
				expect(() => PracticeCategory.from(input)).toThrow('Invalid practice category')
			})
		})

		it('is case-sensitive', () => {
			expect(() => PracticeCategory.from('PRACTICE')).toThrow('Invalid practice category')
			expect(() => PracticeCategory.from('Practice')).toThrow('Invalid practice category')
			expect(() => PracticeCategory.from('BEHAVIOR')).toThrow('Invalid practice category')
		})
	})

	describe('equals', () => {
		it('returns true for same category', () => {
			const cat1 = PracticeCategory.PRACTICE
			const cat2 = PracticeCategory.PRACTICE

			expect(cat1.equals(cat2)).toBe(true)
		})

		it('returns false for different categories', () => {
			const cat1 = PracticeCategory.PRACTICE
			const cat2 = PracticeCategory.BEHAVIOR

			expect(cat1.equals(cat2)).toBe(false)
		})

		it('returns false when comparing with null', () => {
			expect(PracticeCategory.PRACTICE.equals(null)).toBe(false)
		})
	})

	describe('toString', () => {
		it('returns "practice" for PRACTICE', () => {
			expect(PracticeCategory.PRACTICE.toString()).toBe('practice')
		})

		it('returns "behavior" for BEHAVIOR', () => {
			expect(PracticeCategory.BEHAVIOR.toString()).toBe('behavior')
		})

		it('returns "culture" for CULTURE', () => {
			expect(PracticeCategory.CULTURE.toString()).toBe('culture')
		})
	})

	describe('icon property', () => {
		it('PRACTICE has 🔄 icon', () => {
			expect(PracticeCategory.PRACTICE.icon).toBe('🔄')
		})

		it('BEHAVIOR has 👥 icon', () => {
			expect(PracticeCategory.BEHAVIOR.icon).toBe('👥')
		})

		it('CULTURE has 🌟 icon', () => {
			expect(PracticeCategory.CULTURE.icon).toBe('🌟')
		})

		it('TOOLING has 🛠️ icon', () => {
			expect(PracticeCategory.TOOLING.icon).toBe('🛠️')
		})
	})

	describe('immutability', () => {
		it('all categories are frozen', () => {
			expect(Object.isFrozen(PracticeCategory.PRACTICE)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.BEHAVIOR)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.CULTURE)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.TOOLING)).toBe(true)
		})

		it('PracticeCategory namespace is frozen', () => {
			expect(Object.isFrozen(PracticeCategory)).toBe(true)
		})
	})
})
