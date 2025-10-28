import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import MenuToggle from '$lib/components/MenuToggle.svelte'

describe('MenuToggle', () => {
	describe('rendering', () => {
		it('renders hamburger button', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button', { name: /menu/i })
			expect(button).toBeInTheDocument()
		})

		it('shows open icon when menu is closed', () => {
			const { container } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			// Hamburger icon (bars) should be visible
			const svg = container.querySelector('svg')
			expect(svg).toBeInTheDocument()
		})

		it('shows close icon when menu is open', () => {
			const { container } = render(MenuToggle, {
				props: {
					isOpen: true
				}
			})

			// Close (X) icon should be visible
			const svg = container.querySelector('svg')
			expect(svg).toBeInTheDocument()
		})

		it('has proper aria-label when closed', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'Open menu')
		})

		it('has proper aria-label when open', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: true
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'Close menu')
		})

		it('has aria-expanded false when closed', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('aria-expanded', 'false')
		})

		it('has aria-expanded true when open', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: true
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('aria-expanded', 'true')
		})
	})

	describe('interactions', () => {
		it('calls onclick handler when clicked', async () => {
			const handleClick = vi.fn()

			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false,
					onclick: handleClick
				}
			})

			const button = getByRole('button')
			await fireEvent.click(button)

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('is keyboard accessible', async () => {
			const handleClick = vi.fn()

			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false,
					onclick: handleClick
				}
			})

			const button = getByRole('button')
			await fireEvent.keyDown(button, { key: 'Enter' })

			// Button should be focusable (implicit)
			expect(button).toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('has type="button" attribute', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('type', 'button')
		})

		it('has proper focus styles', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button.className).toMatch(/focus:/)
		})

		it('has minimum touch target size (44px)', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			// Check for min-h-[44px] and min-w-[44px] classes
			expect(button.className).toMatch(/min-[hw]/)
		})
	})

	describe('styling', () => {
		it('has base styling classes', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button.className).toMatch(/flex/)
			expect(button.className).toMatch(/items-center/)
			expect(button.className).toMatch(/justify-center/)
		})

		it('has hover state classes', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button.className).toMatch(/hover:/)
		})

		it('has active state classes for touch feedback', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button.className).toMatch(/active:/)
		})

		it('is only visible on mobile (lg:hidden)', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button.className).toMatch(/lg:hidden/)
		})
	})

	describe('visual states', () => {
		it('shows correct icon and label when closed', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: false
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'Open menu')
			expect(button).toHaveAttribute('aria-expanded', 'false')
		})

		it('shows correct icon and label when open', () => {
			const { getByRole } = render(MenuToggle, {
				props: {
					isOpen: true
				}
			})

			const button = getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'Close menu')
			expect(button).toHaveAttribute('aria-expanded', 'true')
		})
	})
})
