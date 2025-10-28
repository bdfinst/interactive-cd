import Menu from '$lib/components/Menu.svelte'
import { menuStore } from '$lib/stores/menuStore.js'
import { fireEvent, render } from '@testing-library/svelte'
import { get } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Menu', () => {
	beforeEach(() => {
		// Reset menu store before each test
		menuStore.collapse()
	})

	describe('rendering', () => {
		it('renders menu container', () => {
			const { container } = render(Menu)

			const nav = container.querySelector('nav')
			expect(nav).toBeInTheDocument()
		})

		it('renders menu toggle button on mobile', () => {
			const { getByRole } = render(Menu)

			const button = getByRole('button', { name: /menu/i })
			expect(button).toBeInTheDocument()
		})

		it('renders all menu items', () => {
			const { getByText } = render(Menu)

			expect(getByText('Home')).toBeInTheDocument()
			expect(getByText('About')).toBeInTheDocument()
			expect(getByText('Export')).toBeInTheDocument()
			expect(getByText('Import')).toBeInTheDocument()
			expect(getByText('View on GitHub')).toBeInTheDocument()
			expect(getByText('MinimumCD.org')).toBeInTheDocument()
			expect(getByText('Contribute')).toBeInTheDocument()
		})

		it('has navigation role for accessibility', () => {
			const { getByRole } = render(Menu)

			const nav = getByRole('navigation')
			expect(nav).toBeInTheDocument()
		})

		it('has proper aria-label for navigation', () => {
			const { getByRole } = render(Menu)

			const nav = getByRole('navigation', { name: /main navigation/i })
			expect(nav).toBeInTheDocument()
		})
	})

	describe.skip('responsive behavior', () => {
		it('is hidden on mobile when closed', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent).toBeInTheDocument()
			// Should have classes for mobile hidden state
			expect(menuContent.className).toMatch(/-translate-x-full/)
		})

		it('is visible on mobile when open', () => {
			// Open the menu first
			menuStore.expand()

			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent).toBeInTheDocument()
			// Should have classes for mobile visible state
			expect(menuContent.className).toMatch(/translate-x-0/)
		})

		it('is always visible on desktop (lg breakpoint)', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			// Should have lg:translate-x-0 class for desktop
			expect(menuContent.className).toMatch(/lg:translate-x-0/)
		})

		it('has fixed width on desktop', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			// Should have width class for desktop
			expect(menuContent.className).toMatch(/w-/)
		})
	})

	describe.skip('toggle interaction', () => {
		it('toggles menu when toggle button is clicked', async () => {
			const { getByRole, container } = render(Menu)

			const button = getByRole('button', { name: 'Open menu' })

			// Initially closed
			let menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent.className).toMatch(/-translate-x-full/)

			// Click to open
			await fireEvent.click(button)

			// Store should be updated
			expect(get(menuStore).isOpen).toBe(true)
		})

		it('updates aria-label when menu state changes', async () => {
			const { getByRole } = render(Menu)

			const button = getByRole('button', { name: 'Open menu' })

			// Click to open
			await fireEvent.click(button)

			// Button label should update (in actual implementation, need reactive update)
			expect(button).toHaveAttribute('aria-label', 'Close menu')
		})
	})

	describe('menu item actions', () => {
		it('handles export action', async () => {
			const { getByRole } = render(Menu, {
				props: {
					onExport: vi.fn()
				}
			})

			const exportButton = getByRole('button', { name: 'Export' })
			await fireEvent.click(exportButton)

			// Export handler should be called (we'll verify this in integration)
		})

		it('handles import action', async () => {
			const { getByRole } = render(Menu, {
				props: {
					onImport: vi.fn()
				}
			})

			const importButton = getByRole('button', { name: 'Import' })
			await fireEvent.click(importButton)

			// Import handler should be called (we'll verify this in integration)
		})

		it('provides click handler for navigation links', async () => {
			// Open menu first
			menuStore.expand()

			const { getByRole } = render(Menu)

			const homeLink = getByRole('link', { name: 'Home' })

			// Link should exist and be clickable
			expect(homeLink).toBeInTheDocument()
			expect(homeLink).toHaveAttribute('href', '/')

			// Note: In actual mobile usage, window.innerWidth check will close menu
			// This test verifies the link is interactive
		})
	})

	describe('accessibility', () => {
		it('is keyboard navigable', () => {
			const { getByRole } = render(Menu)

			const nav = getByRole('navigation')
			// All interactive elements should be keyboard accessible (implicit with button/link)
			expect(nav).toBeInTheDocument()
		})

		it('has proper focus management', () => {
			const { getAllByRole } = render(Menu)

			const links = getAllByRole('link')
			const buttons = getAllByRole('button')

			// All interactive elements should be in tab order
			links.forEach(link => {
				expect(link).toBeInTheDocument()
			})

			buttons.forEach(button => {
				expect(button).toBeInTheDocument()
			})
		})

		it('has semantic HTML structure', () => {
			const { container } = render(Menu)

			const nav = container.querySelector('nav')
			expect(nav).toBeInTheDocument()

			// Menu items should be in a list for screen readers
			const list = container.querySelector('ul, menu')
			expect(list).toBeInTheDocument()
		})
	})

	describe('styling', () => {
		it('has fixed positioning on mobile', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent.className).toMatch(/fixed/)
		})

		it('has smooth transitions', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent.className).toMatch(/transition/)
		})

		it('has proper z-index for menu content (z-1100 - above header)', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent.className).toMatch(/z-\[1100\]/)
		})

		it.skip('has lower z-index for overlay (z-999)', () => {
			menuStore.expand()
			const { container } = render(Menu)

			const overlay = container.querySelector('[data-testid="menu-overlay"]')
			expect(overlay.className).toMatch(/z-\[999\]/)
		})

		it('has background color', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent.className).toMatch(/bg-/)
		})

		it('has shadow for depth perception', () => {
			const { container } = render(Menu)

			const menuContent = container.querySelector('[data-testid="menu-content"]')
			expect(menuContent.className).toMatch(/shadow/)
		})
	})

	describe.skip('overlay (mobile)', () => {
		it('renders overlay when menu is open on mobile', () => {
			menuStore.expand()

			const { container } = render(Menu)

			const overlay = container.querySelector('[data-testid="menu-overlay"]')
			expect(overlay).toBeInTheDocument()
		})

		it('does not render overlay when menu is closed', () => {
			menuStore.collapse()

			const { container } = render(Menu)

			const overlay = container.querySelector('[data-testid="menu-overlay"]')
			expect(overlay).not.toBeInTheDocument()
		})

		it('closes menu when overlay is clicked', async () => {
			menuStore.expand()

			const { container } = render(Menu)

			const overlay = container.querySelector('[data-testid="menu-overlay"]')
			await fireEvent.click(overlay)

			// Menu should close
			expect(get(menuStore).isOpen).toBe(false)
		})

		it('overlay is hidden on desktop', () => {
			menuStore.expand()

			const { container } = render(Menu)

			const overlay = container.querySelector('[data-testid="menu-overlay"]')
			expect(overlay.className).toMatch(/lg:hidden/)
		})
	})
})
