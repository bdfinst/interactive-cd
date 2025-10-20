import { writable } from 'svelte/store'

/**
 * Creates an encapsulated store for tree expansion state
 * @returns {Object} Store with controlled API
 */
function createTreeState() {
	const { subscribe, set } = writable(false)

	return {
		subscribe,
		expand: () => set(true),
		collapse: () => set(false),
		toggle: () => {
			let currentValue
			subscribe(value => {
				currentValue = value
			})()
			set(!currentValue)
		}
	}
}

export const treeState = createTreeState()

// Legacy export for backward compatibility
export const isFullTreeExpanded = treeState
