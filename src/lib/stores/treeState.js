import { writable, get } from 'svelte/store'

/**
 * Creates an encapsulated store for tree expansion state
 * @returns {Object} Store with controlled API
 */
function createTreeState() {
	const store = writable(false)
	const { subscribe, set } = store

	return {
		subscribe,
		expand: () => set(true),
		collapse: () => set(false),
		toggle: () => set(!get(store))
	}
}

export const treeState = createTreeState()

// Legacy export for backward compatibility
export const isFullTreeExpanded = treeState
