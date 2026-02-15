import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { onboardingStore } from '$lib/stores/onboardingStore.js'

describe('onboardingStore', () => {
	beforeEach(() => {
		// Reset to inactive state
		onboardingStore.skip()
	})

	it('starts inactive with step index 0', () => {
		const state = get(onboardingStore)

		expect(state.isActive).toBe(false)
		expect(state.currentStepIndex).toBe(0)
	})

	it('activates and resets step index on start', () => {
		onboardingStore.start()
		const state = get(onboardingStore)

		expect(state.isActive).toBe(true)
		expect(state.currentStepIndex).toBe(0)
	})

	it('increments step index on next', () => {
		onboardingStore.start()
		onboardingStore.next()
		const state = get(onboardingStore)

		expect(state.currentStepIndex).toBe(1)
	})

	it('increments step index multiple times', () => {
		onboardingStore.start()
		onboardingStore.next()
		onboardingStore.next()
		onboardingStore.next()
		const state = get(onboardingStore)

		expect(state.currentStepIndex).toBe(3)
	})

	it('deactivates on skip', () => {
		onboardingStore.start()
		onboardingStore.next()
		onboardingStore.skip()
		const state = get(onboardingStore)

		expect(state.isActive).toBe(false)
	})

	it('deactivates on complete', () => {
		onboardingStore.start()
		onboardingStore.complete()
		const state = get(onboardingStore)

		expect(state.isActive).toBe(false)
	})

	it('resets step index on restart after skip', () => {
		onboardingStore.start()
		onboardingStore.next()
		onboardingStore.next()
		onboardingStore.skip()
		onboardingStore.start()
		const state = get(onboardingStore)

		expect(state.isActive).toBe(true)
		expect(state.currentStepIndex).toBe(0)
	})
})
