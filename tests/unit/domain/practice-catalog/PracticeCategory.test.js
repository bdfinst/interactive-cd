import { describe, it, expect } from 'vitest'
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js'

describe('PracticeCategory', () => {
	describe('predefined categories', () => {
		it('has AUTOMATION category', () => {
			expect(PracticeCategory.AUTOMATION).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.AUTOMATION)).toBe(true)
		})

		it('has BEHAVIOR category', () => {
			expect(PracticeCategory.BEHAVIOR).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.BEHAVIOR)).toBe(true)
		})

		it('has BEHAVIOR_ENABLED_AUTOMATION category', () => {
			expect(PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION)).toBe(true)
		})

		it('has CORE category', () => {
			expect(PracticeCategory.CORE).toBeDefined()
			expect(PracticeCategory.is(PracticeCategory.CORE)).toBe(true)
		})

		it('each category has unique name', () => {
			const names = [
				PracticeCategory.AUTOMATION.toString(),
				PracticeCategory.BEHAVIOR.toString(),
				PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION.toString(),
				PracticeCategory.CORE.toString()
			]

			const uniqueNames = new Set(names)
			expect(uniqueNames.size).toBe(4)
		})

		it('all static instances are properly frozen', () => {
			expect(Object.isFrozen(PracticeCategory.AUTOMATION)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.BEHAVIOR)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.CORE)).toBe(true)
		})
	})

	describe('from', () => {
		it('only allows predefined categories through factory method', () => {
			// Verify we can get valid categories
			const automation = PracticeCategory.from('automation')
			expect(automation).toBe(PracticeCategory.AUTOMATION)

			const behavior = PracticeCategory.from('behavior')
			expect(behavior).toBe(PracticeCategory.BEHAVIOR)

			const behaviorEnabledAutomation = PracticeCategory.from('behavior-enabled-automation')
			expect(behaviorEnabledAutomation).toBe(PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION)

			const core = PracticeCategory.from('core')
			expect(core).toBe(PracticeCategory.CORE)

			// Verify invalid categories are rejected
			expect(() => PracticeCategory.from('custom-category')).toThrow('Invalid practice category')

			// Verify all valid categories are accessible
			const validCategories = ['automation', 'behavior', 'behavior-enabled-automation', 'core']
			validCategories.forEach(cat => {
				expect(() => PracticeCategory.from(cat)).not.toThrow()
			})
		})

		it('throws error for invalid inputs', () => {
			const invalidInputs = [null, undefined, '', 'invalid', 'AUTOMATION', 123, {}, []]

			invalidInputs.forEach(input => {
				expect(() => PracticeCategory.from(input)).toThrow('Invalid practice category')
			})
		})

		it('is case-sensitive', () => {
			expect(() => PracticeCategory.from('AUTOMATION')).toThrow('Invalid practice category')
			expect(() => PracticeCategory.from('Automation')).toThrow('Invalid practice category')
			expect(() => PracticeCategory.from('BEHAVIOR')).toThrow('Invalid practice category')
		})
	})

	describe('equals', () => {
		it('returns true for same category', () => {
			const cat1 = PracticeCategory.AUTOMATION
			const cat2 = PracticeCategory.AUTOMATION

			expect(cat1.equals(cat2)).toBe(true)
		})

		it('returns false for different categories', () => {
			const cat1 = PracticeCategory.AUTOMATION
			const cat2 = PracticeCategory.BEHAVIOR

			expect(cat1.equals(cat2)).toBe(false)
		})

		it('returns false when comparing with null', () => {
			expect(PracticeCategory.AUTOMATION.equals(null)).toBe(false)
		})
	})

	describe('toString', () => {
		it('returns "automation" for AUTOMATION', () => {
			expect(PracticeCategory.AUTOMATION.toString()).toBe('automation')
		})

		it('returns "behavior" for BEHAVIOR', () => {
			expect(PracticeCategory.BEHAVIOR.toString()).toBe('behavior')
		})

		it('returns "behavior-enabled-automation" for BEHAVIOR_ENABLED_AUTOMATION', () => {
			expect(PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION.toString()).toBe(
				'behavior-enabled-automation'
			)
		})

		it('returns "core" for CORE', () => {
			expect(PracticeCategory.CORE.toString()).toBe('core')
		})
	})

	describe('immutability', () => {
		it('all categories are frozen', () => {
			expect(Object.isFrozen(PracticeCategory.AUTOMATION)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.BEHAVIOR)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.BEHAVIOR_ENABLED_AUTOMATION)).toBe(true)
			expect(Object.isFrozen(PracticeCategory.CORE)).toBe(true)
		})

		it('PracticeCategory namespace is frozen', () => {
			expect(Object.isFrozen(PracticeCategory)).toBe(true)
		})
	})
})
