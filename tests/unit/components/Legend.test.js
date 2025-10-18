import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Legend from '$lib/components/Legend.svelte'

describe('Legend', () => {
	describe('rendering', () => {
		it('renders legend title', () => {
			const { getByText } = render(Legend)

			expect(getByText('Requires')).toBeInTheDocument()
		})

		it('renders all category labels', () => {
			const { getByText } = render(Legend)

			expect(getByText('Behavior')).toBeInTheDocument()
			expect(getByText('Culture')).toBeInTheDocument()
			expect(getByText('Tooling')).toBeInTheDocument()
		})

		it('renders color indicators for each category', () => {
			const { container } = render(Legend)

			const colorDots = container.querySelectorAll('.w-3.h-3.rounded-full')
			expect(colorDots.length).toBe(3)
		})

		it('applies correct colors to category indicators', () => {
			const { container } = render(Legend)

			// Behavior - green
			const behaviorDot = container.querySelector('.bg-\\[\\#10b981\\]')
			expect(behaviorDot).toBeInTheDocument()

			// Culture - amber
			const cultureDot = container.querySelector('.bg-\\[\\#f59e0b\\]')
			expect(cultureDot).toBeInTheDocument()

			// Tooling - purple
			const toolingDot = container.querySelector('.bg-\\[\\#8b5cf6\\]')
			expect(toolingDot).toBeInTheDocument()
		})
	})

	describe('positioning', () => {
		it('uses fixed positioning', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.fixed')
			expect(legend).toBeInTheDocument()
		})

		it('positions in top-left area', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.top-32.left-4')
			expect(legend).toBeInTheDocument()
		})

		it('has high z-index for visibility', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.z-\\[900\\]')
			expect(legend).toBeInTheDocument()
		})

		it('has fit-content width', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.w-fit')
			expect(legend).toBeInTheDocument()
		})
	})

	describe('styling', () => {
		it('has white background', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.bg-white')
			expect(legend).toBeInTheDocument()
		})

		it('has rounded corners', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.rounded-xl')
			expect(legend).toBeInTheDocument()
		})

		it('has shadow for depth', () => {
			const { container } = render(Legend)

			const legend = container.querySelector('.shadow-lg')
			expect(legend).toBeInTheDocument()
		})
	})

	describe('structure', () => {
		it('renders items as an unordered list', () => {
			const { container } = render(Legend)

			const list = container.querySelector('ul')
			expect(list).toBeInTheDocument()

			const items = container.querySelectorAll('li')
			expect(items.length).toBe(3)
		})

		it('maintains consistent spacing between items', () => {
			const { container } = render(Legend)

			const list = container.querySelector('.flex.flex-col.gap-2')
			expect(list).toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('uses semantic heading for title', () => {
			const { container } = render(Legend)

			const heading = container.querySelector('h3')
			expect(heading).toBeInTheDocument()
			expect(heading?.textContent).toBe('Requires')
		})

		it('uses list semantics for categories', () => {
			const { container } = render(Legend)

			const list = container.querySelector('ul.list-none')
			expect(list).toBeInTheDocument()
		})
	})
})
