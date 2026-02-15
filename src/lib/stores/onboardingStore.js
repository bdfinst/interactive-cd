import { writable } from 'svelte/store'

/**
 * Creates the onboarding store that manages tutorial overlay state
 * Following factory pattern used by other stores in the codebase
 */
const createOnboardingStore = () => {
	const { subscribe, update, set } = writable({
		isActive: false,
		currentStepIndex: 0
	})

	return {
		subscribe,

		/** Start the onboarding from step 0 */
		start: () => set({ isActive: true, currentStepIndex: 0 }),

		/** Advance to the next step */
		next: () =>
			update(s => ({
				...s,
				currentStepIndex: s.currentStepIndex + 1
			})),

		/** Skip/dismiss the onboarding */
		skip: () =>
			update(s => ({
				...s,
				isActive: false
			})),

		/** Complete the onboarding (same as skip but semantically different) */
		complete: () =>
			update(s => ({
				...s,
				isActive: false
			}))
	}
}

export const onboardingStore = createOnboardingStore()
