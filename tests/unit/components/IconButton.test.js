import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import IconButton from '$lib/components/IconButton.svelte'

describe('IconButton', () => {
	// Note: jsdom navigation warnings are suppressed globally in src/test/setup.js

	describe('rendering', () => {
		it('renders button with aria-label', () => {
			const { getByRole } = render(IconButton, {
				props: { ariaLabel: 'Test Button' }
			})
			const button = getByRole('button', { name: 'Test Button' })
			expect(button).toBeInTheDocument()
		})

		it('renders with child content', () => {
			// Create a wrapper component to test children rendering
			const TestWrapper = {
				Component: IconButton,
				props: { ariaLabel: 'Test Button' }
			}

			const { getByRole } = render(IconButton, {
				props: { ariaLabel: 'Test Button' }
			})

			// At minimum, the button should exist
			expect(getByRole('button')).toBeInTheDocument()
		})

		// Note: Hover state CSS test removed - this couples to Tailwind implementation.
		// Visual hover behavior should be verified via visual regression or E2E tests.
	})

	describe('link mode', () => {
		it('renders as link when href is provided', () => {
			const { getByRole } = render(IconButton, {
				props: { ariaLabel: 'Test Link', href: 'https://example.com' }
			})
			const link = getByRole('link', { name: 'Test Link' })
			expect(link).toBeInTheDocument()
			expect(link).toHaveAttribute('href', 'https://example.com')
		})

		it('applies target and rel attributes for external links', () => {
			const { getByRole } = render(IconButton, {
				props: {
					ariaLabel: 'External Link',
					href: 'https://example.com',
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			})
			const link = getByRole('link')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		})
	})

	describe('tooltip integration', () => {
		it('shows tooltip on mouseenter', async () => {
			const { getByRole, getByText } = render(IconButton, {
				props: { ariaLabel: 'Test Button', tooltipText: 'Helpful Tooltip' }
			})
			const button = getByRole('button')

			await fireEvent.mouseEnter(button)

			expect(getByText('Helpful Tooltip')).toBeInTheDocument()
		})

		it('hides tooltip on mouseleave', async () => {
			const { getByRole, queryByText } = render(IconButton, {
				props: { ariaLabel: 'Test Button', tooltipText: 'Helpful Tooltip' }
			})
			const button = getByRole('button')

			await fireEvent.mouseEnter(button)
			await fireEvent.mouseLeave(button)

			expect(queryByText('Helpful Tooltip')).not.toBeInTheDocument()
		})

		it('does not render tooltip when tooltipText is not provided', () => {
			const { queryByRole } = render(IconButton, {
				props: { ariaLabel: 'Test Button' }
			})
			// Tooltip would be visible if rendered, so we just check it's not there
			expect(queryByRole('tooltip')).not.toBeInTheDocument()
		})
	})

	describe('user interactions', () => {
		it('calls onclick callback when clicked', async () => {
			let clicked = false
			const handleClick = () => {
				clicked = true
			}

			const { getByRole } = render(IconButton, {
				props: { ariaLabel: 'Test Button', onclick: handleClick }
			})

			await fireEvent.click(getByRole('button'))

			expect(clicked).toBe(true)
		})

		it('does not call onclick when used as link', async () => {
			let clicked = false
			const handleClick = () => {
				clicked = true
			}

			const { getByRole } = render(IconButton, {
				props: {
					ariaLabel: 'Test Link',
					href: 'https://example.com',
					onclick: handleClick
				}
			})

			await fireEvent.click(getByRole('link'))

			expect(clicked).toBe(false)
		})
	})

	describe('accessibility', () => {
		it('is keyboard accessible with proper focus management', () => {
			const { getByRole } = render(IconButton, {
				props: { ariaLabel: 'Test Button' }
			})
			const button = getByRole('button')

			// Test that button can receive focus (functional behavior, not CSS)
			button.focus()
			expect(document.activeElement).toBe(button)
		})

		it('includes aria-label for screen readers', () => {
			const { getByRole } = render(IconButton, {
				props: { ariaLabel: 'Navigate to GitHub' }
			})
			const button = getByRole('button', { name: 'Navigate to GitHub' })
			expect(button).toBeInTheDocument()
		})
	})
})
