import { describe, it, expect } from 'vitest'
import { CATEGORY_COLORS, CATEGORY_BG_CLASSES, CATEGORY_METADATA } from '$lib/constants/colors.js'

describe('CATEGORY_COLORS', () => {
	it('is frozen (immutable)', () => {
		expect(Object.isFrozen(CATEGORY_COLORS)).toBe(true)
	})

	it('has automation color', () => {
		expect(CATEGORY_COLORS.automation).toBe('#ffffcc')
	})

	it('has behavior color', () => {
		expect(CATEGORY_COLORS.behavior).toBe('#ccccff')
	})

	it('has behavior-enabled-automation color', () => {
		expect(CATEGORY_COLORS['behavior-enabled-automation']).toBe('#d7f8d7')
	})

	it('has core color', () => {
		expect(CATEGORY_COLORS.core).toBe('#e9d5ff')
	})

	it('all colors are valid hex codes', () => {
		const hexColorRegex = /^#[0-9a-f]{6}$/i

		Object.values(CATEGORY_COLORS).forEach(color => {
			expect(color).toMatch(hexColorRegex)
		})
	})
})

describe('CATEGORY_METADATA', () => {
	it('is frozen (immutable)', () => {
		expect(Object.isFrozen(CATEGORY_METADATA)).toBe(true)
	})

	it('has 4 categories', () => {
		expect(CATEGORY_METADATA).toHaveLength(4)
	})

	it('each category has required fields', () => {
		CATEGORY_METADATA.forEach(category => {
			expect(category).toHaveProperty('name')
			expect(category).toHaveProperty('key')
			expect(category).toHaveProperty('color')
			expect(category).toHaveProperty('description')

			expect(typeof category.name).toBe('string')
			expect(typeof category.key).toBe('string')
			expect(typeof category.color).toBe('string')
			expect(typeof category.description).toBe('string')
		})
	})

	it('automation category has correct metadata', () => {
		const automation = CATEGORY_METADATA.find(c => c.key === 'automation')

		expect(automation).toBeDefined()
		expect(automation.name).toBe('Automation')
		expect(automation.color).toBe('#ffffcc')
		expect(automation.description).toBe('Tools and automation platforms')
	})

	it('behavior category has correct metadata', () => {
		const behavior = CATEGORY_METADATA.find(c => c.key === 'behavior')

		expect(behavior).toBeDefined()
		expect(behavior.name).toBe('Behavior')
		expect(behavior.color).toBe('#ccccff')
		expect(behavior.description).toBe('Team behaviors and processes')
	})

	it('behavior-enabled-automation category has correct metadata', () => {
		const behaviorEnabled = CATEGORY_METADATA.find(c => c.key === 'behavior-enabled-automation')

		expect(behaviorEnabled).toBeDefined()
		expect(behaviorEnabled.name).toBe('Behavior Enabled')
		expect(behaviorEnabled.color).toBe('#d7f8d7')
		expect(behaviorEnabled.description).toBe('Automation that depends on behavioral practices')
	})

	it('core category has correct metadata', () => {
		const core = CATEGORY_METADATA.find(c => c.key === 'core')

		expect(core).toBeDefined()
		expect(core.name).toBe('Core')
		expect(core.color).toBe('#e9d5ff')
		expect(core.description).toBe('Core Continuous Delivery practice')
	})

	it('category colors match CATEGORY_COLORS', () => {
		CATEGORY_METADATA.forEach(category => {
			expect(category.color).toBe(CATEGORY_COLORS[category.key])
		})
	})

	it('each category has bgClass property', () => {
		CATEGORY_METADATA.forEach(category => {
			expect(category).toHaveProperty('bgClass')
			expect(typeof category.bgClass).toBe('string')
			expect(category.bgClass).toMatch(/^bg-category-/)
		})
	})

	it('category bgClass matches CATEGORY_BG_CLASSES', () => {
		CATEGORY_METADATA.forEach(category => {
			expect(category.bgClass).toBe(CATEGORY_BG_CLASSES[category.key])
		})
	})
})

describe('CATEGORY_BG_CLASSES', () => {
	it('is frozen (immutable)', () => {
		expect(Object.isFrozen(CATEGORY_BG_CLASSES)).toBe(true)
	})

	it('has automation class', () => {
		expect(CATEGORY_BG_CLASSES.automation).toBe('bg-category-automation')
	})

	it('has behavior class', () => {
		expect(CATEGORY_BG_CLASSES.behavior).toBe('bg-category-behavior')
	})

	it('has behavior-enabled-automation class', () => {
		expect(CATEGORY_BG_CLASSES['behavior-enabled-automation']).toBe('bg-category-behavior-enabled')
	})

	it('has core class', () => {
		expect(CATEGORY_BG_CLASSES.core).toBe('bg-category-core')
	})

	it('all classes follow naming convention', () => {
		Object.values(CATEGORY_BG_CLASSES).forEach(className => {
			expect(className).toMatch(/^bg-category-/)
		})
	})
})
