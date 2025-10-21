import { writable } from 'svelte/store'

/**
 * Store to track the dynamic height of the fixed header
 * This ensures the header spacer always matches the actual header height
 * across different screen sizes and content changes
 */
export const headerHeight = writable(0)
