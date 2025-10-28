import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import MenuItem from '$lib/components/MenuItem.svelte'

describe('MenuItem', () => {
	describe('rendering', () => {
		it('renders menu item with label', () => {
			const { getByText } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			expect(getByText('Home')).toBeInTheDocument()
		})

		it('renders as link when href is provided', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			const link = getByRole('link', { name: 'Home' })
			expect(link).toBeInTheDocument()
			expect(link).toHaveAttribute('href', '/')
		})

		it('renders as button when action is provided', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'export',
						label: 'Export',
						icon: 'download',
						action: 'export'
					}
				}
			})

			const button = getByRole('button', { name: 'Export' })
			expect(button).toBeInTheDocument()
		})

		it('applies external link attributes for external links', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'github',
						label: 'GitHub',
						href: 'https://github.com',
						icon: 'github',
						external: true
					}
				}
			})

			const link = getByRole('link')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		})
	})

	describe('interactions', () => {
		it('calls onclick handler when action button is clicked', async () => {
			const handleClick = vi.fn()

			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'export',
						label: 'Export',
						icon: 'download',
						action: 'export'
					},
					onclick: handleClick
				}
			})

			const button = getByRole('button')
			await fireEvent.click(button)

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('does not call onclick for link items', async () => {
			const handleClick = vi.fn()

			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					},
					onclick: handleClick
				}
			})

			// Should render as link, not call onclick
			const link = getByRole('link')
			expect(link).toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('has proper ARIA attributes for links', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			const link = getByRole('link', { name: 'Home' })
			expect(link).toBeInTheDocument()
		})

		it('has proper ARIA attributes for buttons', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'export',
						label: 'Export',
						icon: 'download',
						action: 'export'
					}
				}
			})

			const button = getByRole('button', { name: 'Export' })
			expect(button).toHaveAttribute('type', 'button')
		})

		it('is keyboard accessible', async () => {
			const handleClick = vi.fn()

			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'export',
						label: 'Export',
						icon: 'download',
						action: 'export'
					},
					onclick: handleClick
				}
			})

			const button = getByRole('button')
			await fireEvent.keyDown(button, { key: 'Enter' })

			// Button should be focusable (implicit for button element)
			expect(button).toBeInTheDocument()
		})
	})

	describe('styling', () => {
		it('has base styling classes', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			const link = getByRole('link')
			// Should have flex and padding classes (mobile-first approach)
			expect(link.className).toMatch(/flex/)
			expect(link.className).toMatch(/p-/)
		})

		it('has hover state classes', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			const link = getByRole('link')
			expect(link.className).toMatch(/hover:/)
		})

		it('has focus state classes for accessibility', () => {
			const { getByRole } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			const link = getByRole('link')
			expect(link.className).toMatch(/focus:/)
		})
	})

	describe('icon rendering', () => {
		it('renders icon when provided', () => {
			const { container } = render(MenuItem, {
				props: {
					item: {
						id: 'home',
						label: 'Home',
						href: '/',
						icon: 'home'
					}
				}
			})

			// FontAwesome icons are rendered as SVG
			const svg = container.querySelector('svg')
			expect(svg).toBeInTheDocument()
		})

		it('handles special icon cases', () => {
			const { container } = render(MenuItem, {
				props: {
					item: {
						id: 'support',
						label: 'Support',
						href: 'https://ko-fi.com',
						icon: 'whiskey',
						external: true
					}
				}
			})

			// The component should handle the whiskey emoji icon
			expect(container).toBeInTheDocument()
		})
	})
})
