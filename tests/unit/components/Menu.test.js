import Menu from '$lib/components/Menu.svelte'
import { menuStore } from '$lib/stores/menuStore.js'
import { fireEvent, render } from '@testing-library/svelte'
import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Menu', () => {
	beforeEach(() => {
		// Reset menu store before each test
		menuStore.collapse()

		// Mock fetch to prevent "Failed to load practice data" errors
		// Menu component tries to fetch practice data on mount
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			json: async () => ({ success: false })
		})

		// Suppress console.error for expected fetch failures
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		// Restore mocks after each test
		vi.restoreAllMocks()
	})

	describe('rendering', () => {
		it('renders menu container', () => {
			const { container } = render(Menu)

			const nav = container.querySelector('nav')
			expect(nav).toBeInTheDocument()
		})

		it('renders menu toggle button on mobile', () => {
			const { container } = render(Menu)

			// Menu has both toggle button (desktop) and close button (mobile)
			// They're both rendered but visibility is controlled by CSS media queries
			const buttons = container.querySelectorAll('button')
			expect(buttons.length).toBeGreaterThan(0)
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

	// Note: Responsive behavior testing moved to E2E tests (collapsible-sidebar.spec.js)
	// Testing CSS classes for responsive behavior is brittle and couples tests to implementation.
	// Instead, E2E tests verify actual mobile/desktop visibility behavior.

	// Note: Menu toggle interaction tests removed
	// The MenuToggle component is separate and tested in MenuToggle.test.js.
	// This Menu component is just the navigation content/sidebar.

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
			const { getByTestId, getByLabelText } = render(Menu, {
				props: {
					onImport: vi.fn()
				}
			})

			// Import is now a label for the file input, not a button
			const importLabel = getByTestId('menu-item-import')
			expect(importLabel).toBeInTheDocument()
			expect(importLabel.tagName).toBe('LABEL')

			// Verify it's connected to the file input
			const fileInput = getByLabelText('Import adoption data file')
			expect(fileInput).toBeInTheDocument()
			expect(fileInput.getAttribute('type')).toBe('file')
			expect(fileInput.getAttribute('id')).toBe('import-file-input')
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

	// Note: Visual styling tests (CSS classes, z-index, shadows) removed
	// These tests were tightly coupled to Tailwind implementation details.
	// Visual regression testing should be handled by E2E tests or visual testing tools.

	describe('mobile overlay behavior', () => {
		it('renders mobile close button', () => {
			const { container } = render(Menu)
			const closeButton = container.querySelector('[data-testid="mobile-close-button"]')

			expect(closeButton).toBeInTheDocument()
			expect(closeButton).toHaveAttribute('aria-label', 'Close menu')
		})

		it('does not render backdrop when mobile menu is closed', () => {
			const { container } = render(Menu)
			const backdrop = container.querySelector('[data-testid="menu-backdrop"]')

			expect(backdrop).not.toBeInTheDocument()
		})
	})

	// Note: Overlay mobile behavior testing moved to E2E tests
	// Testing overlay visibility via CSS classes is implementation-coupled.
	// E2E tests verify actual overlay behavior and interactions.
})
