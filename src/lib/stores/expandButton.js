/**
 * Store for tracking the expand button renderer
 * Used to render the tree expand/collapse button in the legend
 */
import { writable } from 'svelte/store'

export const expandButtonRenderer = writable(null)
