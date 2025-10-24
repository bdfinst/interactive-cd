import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ListWithIcons from '$lib/components/ListWithIcons.svelte'

describe('ListWithIcons', () => {
	describe('rendering', () => {
		it('renders list with items', () => {
			const items = ['Item 1', 'Item 2', 'Item 3']
			const { getByText } = render(ListWithIcons, {
				props: { items }
			})

			items.forEach(item => {
				expect(getByText(item)).toBeInTheDocument()
			})
		})

		it('renders with custom icon', () => {
			const items = ['Item 1']
			const { container } = render(ListWithIcons, {
				props: { items, icon: '→' }
			})

			expect(container.textContent).toContain('→')
		})

		it('uses bullet as default icon', () => {
			const items = ['Item 1']
			const { container } = render(ListWithIcons, {
				props: { items }
			})

			expect(container.textContent).toContain('•')
		})
	})

	describe('styling', () => {
		it('applies custom icon color', () => {
			const items = ['Item 1']
			const { container } = render(ListWithIcons, {
				props: { items, iconColor: 'text-green-600' }
			})

			const iconSpan = container.querySelector('.text-green-600')
			expect(iconSpan).toBeInTheDocument()
		})

		it('applies default icon color', () => {
			const items = ['Item 1']
			const { container } = render(ListWithIcons, {
				props: { items }
			})

			const iconSpan = container.querySelector('.text-gray-400')
			expect(iconSpan).toBeInTheDocument()
		})

		it('applies compact mode spacing', () => {
			const items = ['Item 1', 'Item 2']
			const { container } = render(ListWithIcons, {
				props: { items, compact: true }
			})

			const list = container.querySelector('ul')
			expect(list).toHaveClass('space-y-0')
		})

		it('applies normal mode spacing', () => {
			const items = ['Item 1', 'Item 2']
			const { container } = render(ListWithIcons, {
				props: { items, compact: false }
			})

			const list = container.querySelector('ul')
			expect(list).toHaveClass('space-y-1')
		})
	})

	describe('edge cases', () => {
		it('handles empty array', () => {
			const { container } = render(ListWithIcons, {
				props: { items: [] }
			})

			const listItems = container.querySelectorAll('li')
			expect(listItems).toHaveLength(0)
		})

		it('handles array with one item', () => {
			const items = ['Single Item']
			const { getByText } = render(ListWithIcons, {
				props: { items }
			})

			expect(getByText('Single Item')).toBeInTheDocument()
		})

		it('handles long text items', () => {
			const items = [
				'This is a very long item that should wrap to multiple lines when the container is narrow'
			]
			const { getByText } = render(ListWithIcons, {
				props: { items }
			})

			expect(getByText(items[0])).toBeInTheDocument()
		})
	})
})
