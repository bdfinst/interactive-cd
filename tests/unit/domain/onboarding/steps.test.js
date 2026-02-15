import { describe, it, expect } from 'vitest'
import { getOnboardingSteps } from '$lib/domain/onboarding/steps.js'

describe('Onboarding Steps', () => {
	it('returns an array of steps', () => {
		const steps = getOnboardingSteps()

		expect(Array.isArray(steps)).toBe(true)
		expect(steps.length).toBe(6)
	})

	it('each step has required fields', () => {
		const steps = getOnboardingSteps()

		steps.forEach(step => {
			expect(step).toHaveProperty('id')
			expect(step).toHaveProperty('title')
			expect(step).toHaveProperty('content')
			expect(step).toHaveProperty('position')
			expect(step).toHaveProperty('width')
		})
	})

	it('first step is a centered welcome without target', () => {
		const steps = getOnboardingSteps()
		const welcome = steps[0]

		expect(welcome.id).toBe('welcome')
		expect(welcome.targetSelector).toBeNull()
		expect(welcome.position).toBe('center')
		expect(welcome.width).toBe('lg')
	})

	it('non-welcome steps have target selectors', () => {
		const steps = getOnboardingSteps()
		const targetedSteps = steps.slice(1)

		targetedSteps.forEach(step => {
			expect(step.targetSelector).toBeTruthy()
			expect(typeof step.targetSelector).toBe('string')
		})
	})

	it('all step IDs are unique', () => {
		const steps = getOnboardingSteps()
		const ids = steps.map(s => s.id)
		const uniqueIds = new Set(ids)

		expect(uniqueIds.size).toBe(ids.length)
	})

	it('returns a new array each call (no shared state)', () => {
		const steps1 = getOnboardingSteps()
		const steps2 = getOnboardingSteps()

		expect(steps1).not.toBe(steps2)
		expect(steps1).toEqual(steps2)
	})
})
