import { writable, get } from 'svelte/store'
import { browser } from '$app/environment'

/**
 * Pure function to check if a link is external
 * @param {string} href - The link to check
 * @returns {boolean} True if the link is external
 */
export const isExternalLink = href => {
	return href.startsWith('http://') || href.startsWith('https://')
}

/**
 * Pure function to get menu items configuration
 * @returns {Array} Array of menu item objects
 */
export const getMenuItems = () => [
	{
		id: 'home',
		label: 'Home',
		href: '/',
		icon: 'home',
		external: false
	},
	{
		id: 'import',
		label: 'Import',
		icon: 'upload',
		action: 'import',
		external: false
	},
	{
		id: 'export',
		label: 'Export',
		icon: 'download',
		action: 'export',
		external: false
	},
	{
		id: 'help',
		label: 'About',
		href: '/help',
		icon: 'circle-info',
		external: false
	},
	{
		id: 'github',
		label: 'View on GitHub',
		href: 'https://github.com/bdfinst/interactive-cd',
		icon: 'github',
		external: true
	},
	{
		id: 'minimum-cd',
		label: 'MinimumCD.org',
		href: 'https://minimumcd.org',
		icon: 'minimumcd',
		external: true
	},
	{
		id: 'support',
		label: 'Support this Project',
		href: 'https://ko-fi.com/bryanfinster',
		icon: 'whiskey',
		external: true
	}
]

/**
 * Pure function to determine initial expanded state based on screen size
 * @returns {boolean} True if menu should be expanded (desktop), false if collapsed (mobile)
 */
const getInitialExpanded = () => {
	if (!browser) return true // Default to expanded for SSR
	return window.innerWidth >= 1024 // Desktop (lg breakpoint): expanded, Mobile: collapsed
}

/**
 * Creates a menu store to manage menu state
 * Following functional programming principles with pure functions
 *
 * @param {boolean} initialExpanded - Initial expanded state
 * @returns {Object} Menu store with methods
 */
export const createMenuStore = (initialExpanded = false) => {
	// Private writable store
	const {
		subscribe,
		set: _set,
		update
	} = writable({
		isExpanded: initialExpanded
	})

	/**
	 * Toggle the menu expanded/collapsed state
	 */
	const toggle = () => {
		update(state => ({
			...state,
			isExpanded: !state.isExpanded
		}))
	}

	/**
	 * Expand the menu (show labels)
	 */
	const expand = () => {
		update(state => ({
			...state,
			isExpanded: true
		}))
	}

	/**
	 * Collapse the menu (hide labels, show icons only)
	 */
	const collapse = () => {
		update(state => ({
			...state,
			isExpanded: false
		}))
	}

	/**
	 * Get current expanded state
	 * @returns {boolean} True if menu is expanded
	 */
	const isExpanded = () => {
		const state = get({ subscribe })
		return state.isExpanded
	}

	return {
		subscribe,
		toggle,
		expand,
		collapse,
		isExpanded
	}
}

// Export singleton store instance
// Initialize based on screen size (desktop: expanded, mobile: collapsed)
export const menuStore = createMenuStore(getInitialExpanded())
