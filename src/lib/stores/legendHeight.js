/**
 * Store for tracking the category legend height
 * Used for dynamically spacing content below the fixed legend
 */
import { writable } from 'svelte/store'

export const legendHeight = writable(0)
