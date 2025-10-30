import { createMenuStore } from '$lib/stores/menuStore.js'
import { get } from 'svelte/store'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Menu Store', () => {
	let menuStore

	beforeEach(() => {
		menuStore = createMenuStore()
	})

	describe('initialization', () => {
		it('initializes with menu collapsed (default)', () => {
			const state = get(menuStore)
			expect(state.isExpanded).toBe(false)
		})

		it('initializes with provided expanded state', () => {
			const store = createMenuStore(true)
			const state = get(store)
			expect(state.isExpanded).toBe(true)
		})
	})

	describe('toggle', () => {
		it('toggles menu from collapsed to expanded', () => {
			menuStore.toggle()
			const state = get(menuStore)
			expect(state.isExpanded).toBe(true)
		})

		it('toggles menu from expanded to collapsed', () => {
			menuStore.toggle()
			menuStore.toggle()
			const state = get(menuStore)
			expect(state.isExpanded).toBe(false)
		})

		it('can be toggled multiple times', () => {
			menuStore.toggle() // expand
			menuStore.toggle() // collapse
			menuStore.toggle() // expand
			const state = get(menuStore)
			expect(state.isExpanded).toBe(true)
		})
	})

	describe('expand', () => {
		it('expands collapsed menu', () => {
			menuStore.expand()
			const state = get(menuStore)
			expect(state.isExpanded).toBe(true)
		})

		it('keeps menu expanded when already expanded', () => {
			menuStore.expand()
			menuStore.expand()
			const state = get(menuStore)
			expect(state.isExpanded).toBe(true)
		})
	})

	describe('collapse', () => {
		it('collapses expanded menu', () => {
			menuStore.expand()
			menuStore.collapse()
			const state = get(menuStore)
			expect(state.isExpanded).toBe(false)
		})

		it('keeps menu collapsed when already collapsed', () => {
			menuStore.collapse()
			const state = get(menuStore)
			expect(state.isExpanded).toBe(false)
		})
	})

	describe('isExpanded getter', () => {
		it('returns false when menu is collapsed', () => {
			expect(menuStore.isExpanded()).toBe(false)
		})

		it('returns true when menu is expanded', () => {
			menuStore.expand()
			expect(menuStore.isExpanded()).toBe(true)
		})
	})

	describe('mobile overlay state', () => {
		it('initializes with mobile menu closed', () => {
			const state = get(menuStore)
			expect(state.isOpen).toBe(false)
		})

		it('opens mobile menu when openMobile is called', () => {
			menuStore.openMobile()
			const state = get(menuStore)
			expect(state.isOpen).toBe(true)
		})

		it('closes mobile menu when closeMobile is called', () => {
			menuStore.openMobile()
			menuStore.closeMobile()
			const state = get(menuStore)
			expect(state.isOpen).toBe(false)
		})

		it('toggles mobile menu open and closed', () => {
			// Initially closed
			let state = get(menuStore)
			expect(state.isOpen).toBe(false)

			// Toggle open
			menuStore.toggleMobile()
			state = get(menuStore)
			expect(state.isOpen).toBe(true)

			// Toggle closed
			menuStore.toggleMobile()
			state = get(menuStore)
			expect(state.isOpen).toBe(false)
		})

		it('maintains isExpanded state independently from isOpen', () => {
			// Expand the sidebar
			menuStore.expand()
			let state = get(menuStore)
			expect(state.isExpanded).toBe(true)
			expect(state.isOpen).toBe(false)

			// Open mobile overlay
			menuStore.openMobile()
			state = get(menuStore)
			expect(state.isExpanded).toBe(true) // Should remain expanded
			expect(state.isOpen).toBe(true)

			// Close mobile overlay
			menuStore.closeMobile()
			state = get(menuStore)
			expect(state.isExpanded).toBe(true) // Should still be expanded
			expect(state.isOpen).toBe(false)
		})

		it('allows multiple open/close cycles', () => {
			menuStore.openMobile()
			menuStore.closeMobile()
			menuStore.openMobile()
			const state = get(menuStore)
			expect(state.isOpen).toBe(true)
		})
	})

	describe('reactivity', () => {
		it('notifies subscribers when state changes', () => {
			let notificationCount = 0
			let latestState = null

			menuStore.subscribe(state => {
				notificationCount++
				latestState = state
			})

			// Initial subscription counts as 1
			expect(notificationCount).toBe(1)
			expect(latestState.isExpanded).toBe(false)

			menuStore.toggle()
			expect(notificationCount).toBe(2)
			expect(latestState.isExpanded).toBe(true)

			menuStore.collapse()
			expect(notificationCount).toBe(3)
			expect(latestState.isExpanded).toBe(false)
		})
	})
})

describe('Menu Data Utils', () => {
	describe('getMenuItems', () => {
		it('returns array of menu items', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()

			expect(Array.isArray(items)).toBe(true)
			expect(items.length).toBeGreaterThan(0)
		})

		it('each menu item has required properties', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()

			items.forEach(item => {
				expect(item).toHaveProperty('id')
				expect(item).toHaveProperty('label')
				expect(item).toHaveProperty('icon')
				expect(typeof item.id).toBe('string')
				expect(typeof item.label).toBe('string')
				expect(typeof item.icon).toBe('string')
			})
		})

		it('menu items have unique IDs', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()
			const ids = items.map(item => item.id)
			const uniqueIds = new Set(ids)

			expect(ids.length).toBe(uniqueIds.size)
		})

		it('includes home menu item', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()
			const homeItem = items.find(item => item.id === 'home')

			expect(homeItem).toBeDefined()
			expect(homeItem.label).toBe('Home')
			expect(homeItem.href).toBe('/')
		})

		it('includes help menu item', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()
			const helpItem = items.find(item => item.id === 'help')

			expect(helpItem).toBeDefined()
			expect(helpItem.label).toBe('About')
			expect(helpItem.href).toBe('/about')
		})

		it('includes export menu item', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()
			const exportItem = items.find(item => item.id === 'export')

			expect(exportItem).toBeDefined()
			expect(exportItem.label).toBe('Export')
		})

		it('includes import menu item', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()
			const importItem = items.find(item => item.id === 'import')

			expect(importItem).toBeDefined()
			expect(importItem.label).toBe('Import')
		})

		it('includes external links', async () => {
			const { getMenuItems } = await import('$lib/stores/menuStore.js')
			const items = getMenuItems()

			const githubItem = items.find(item => item.id === 'github')
			expect(githubItem).toBeDefined()
			expect(githubItem.external).toBe(true)

			const minimumCDItem = items.find(item => item.id === 'minimum-cd')
			expect(minimumCDItem).toBeDefined()
			expect(minimumCDItem.external).toBe(true)

			const supportItem = items.find(item => item.id === 'support')
			expect(supportItem).toBeDefined()
			expect(supportItem.external).toBe(true)
		})
	})

	describe('isExternalLink', () => {
		it('returns true for external links', async () => {
			const { isExternalLink } = await import('$lib/stores/menuStore.js')

			expect(isExternalLink('https://github.com')).toBe(true)
			expect(isExternalLink('http://example.com')).toBe(true)
		})

		it('returns false for internal links', async () => {
			const { isExternalLink } = await import('$lib/stores/menuStore.js')

			expect(isExternalLink('/')).toBe(false)
			expect(isExternalLink('/about')).toBe(false)
		})
	})
})
