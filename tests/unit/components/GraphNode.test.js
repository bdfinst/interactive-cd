import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import GraphNode from '$lib/components/GraphNode.svelte'
import { buildPractice, buildMinimalPractice } from '../../utils/builders.js'

describe('GraphNode', () => {
	describe('rendering', () => {
		it('renders practice name', () => {
			const practice = buildPractice({ name: 'Continuous Integration' })
			const { getByText } = render(GraphNode, { props: { practice } })

			expect(getByText('Continuous Integration')).toBeInTheDocument()
		})

		it('renders category indicators', () => {
			const practice = buildPractice({ categories: ['behavior', 'tooling'] })
			const { container } = render(GraphNode, { props: { practice } })

			const categoryDots = container.querySelectorAll('.w-3\\.5')
			expect(categoryDots.length).toBe(2)
		})

		it('renders as a button element', () => {
			const practice = buildPractice()
			const { getByTestId } = render(GraphNode, { props: { practice } })

			const node = getByTestId('graph-node')
			expect(node.tagName).toBe('BUTTON')
		})

		it('includes practice id in data attribute', () => {
			const practice = buildPractice({ id: 'test-practice-id' })
			const { getByTestId } = render(GraphNode, { props: { practice } })

			const node = getByTestId('graph-node')
			expect(node.getAttribute('data-practice-id')).toBe('test-practice-id')
		})
	})

	describe('selection state', () => {
		it('shows description when selected', () => {
			const practice = buildPractice({ description: 'Test description for practice' })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			// Description should be visible when selected
			expect(getByText('Test description for practice')).toBeInTheDocument()
		})

		it('hides description when not selected', () => {
			const practice = buildPractice({ description: 'Test description for practice' })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			// Description should not be visible when not selected
			expect(queryByText('Test description for practice')).not.toBeInTheDocument()
		})

		it('shows benefits when selected', () => {
			const practice = buildPractice({ benefits: ['Faster delivery', 'Better quality'] })
			const { getByText, queryByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(getByText('Benefits')).toBeInTheDocument()
			expect(getByText('Faster delivery')).toBeInTheDocument()
			expect(getByText('Better quality')).toBeInTheDocument()
		})

		it('hides benefits when not selected', () => {
			const practice = buildPractice({ benefits: ['Faster delivery'] })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(queryByText('Benefits')).not.toBeInTheDocument()
			expect(queryByText('Faster delivery')).not.toBeInTheDocument()
		})

		it('applies selected visual style', () => {
			const practice = buildPractice()
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const node = getByTestId('graph-node')
			expect(node.getAttribute('data-selected')).toBe('true')
			expect(node.className).toContain('border-4')
			expect(node.className).toContain('border-blue-600')
		})

		it('applies unselected visual style', () => {
			const practice = buildPractice()
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			const node = getByTestId('graph-node')
			expect(node.getAttribute('data-selected')).toBe('false')
			expect(node.className).toContain('border-2')
		})
	})

	describe('expand functionality', () => {
		it('shows expand button when selected and has dependencies', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(getByText(/Expand Dependencies/)).toBeInTheDocument()
		})

		it('hides expand button when not selected', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(queryByText(/Expand Dependencies/)).not.toBeInTheDocument()
		})

		it('hides expand button when has no dependencies', () => {
			const practice = buildMinimalPractice()
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(queryByText(/Expand Dependencies/)).not.toBeInTheDocument()
		})

		it('hides expand button when isRoot is true', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: true, isRoot: true }
			})

			expect(queryByText(/Expand Dependencies/)).not.toBeInTheDocument()
		})

		it('shows correct button text when expanded', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: true, isExpanded: true }
			})

			expect(getByText(/Collapse Dependencies/)).toBeInTheDocument()
		})

		it('shows dependency count in button text', () => {
			const practice = buildPractice({ dependencyCount: 5 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(getByText('Expand Dependencies (5)')).toBeInTheDocument()
		})
	})

	describe('user interactions', () => {
		it('dispatches click event when clicked', async () => {
			const practice = buildPractice()
			const handleClick = vi.fn()
			const { component, getByTestId } = render(GraphNode, {
				props: { practice }
			})

			component.$on('click', handleClick)
			await fireEvent.click(getByTestId('graph-node'))

			expect(handleClick).toHaveBeenCalledOnce()
			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: { practiceId: practice.id }
				})
			)
		})

		it('dispatches expand event when expand button is clicked', async () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const handleExpand = vi.fn()
			const { component, getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			component.$on('expand', handleExpand)
			await fireEvent.click(getByText(/Expand Dependencies/))

			expect(handleExpand).toHaveBeenCalledOnce()
			expect(handleExpand).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: { practiceId: practice.id }
				})
			)
		})

		it('prevents event propagation when expand button is clicked', async () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const handleClick = vi.fn()
			const handleExpand = vi.fn()
			const { component, getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			component.$on('click', handleClick)
			component.$on('expand', handleExpand)
			await fireEvent.click(getByText(/Expand Dependencies/))

			expect(handleExpand).toHaveBeenCalledOnce()
			// click event should not be dispatched when expand button is clicked
			expect(handleClick).not.toHaveBeenCalled()
		})
	})

	describe('accessibility', () => {
		it('includes category information in aria-label', () => {
			const practice = buildPractice({ categories: ['behavior', 'tooling'] })
			const { container } = render(GraphNode, { props: { practice } })

			const categoryContainer = container.querySelector('[role="img"]')
			expect(categoryContainer?.getAttribute('aria-label')).toContain('behavior')
			expect(categoryContainer?.getAttribute('aria-label')).toContain('tooling')
		})

		it('includes focus styles for keyboard navigation', () => {
			const practice = buildPractice()
			const { getByTestId } = render(GraphNode, { props: { practice } })

			const node = getByTestId('graph-node')
			expect(node.className).toContain('focus:outline-none')
			expect(node.className).toContain('focus:ring-2')
		})
	})

	describe('edge cases', () => {
		it('handles practice with no benefits', () => {
			const practice = buildPractice({ benefits: [] })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(queryByText('Benefits')).not.toBeInTheDocument()
		})

		it('handles practice with single category', () => {
			const practice = buildPractice({ categories: ['behavior'] })
			const { container } = render(GraphNode, { props: { practice } })

			const categoryDots = container.querySelectorAll('.w-3\\.5')
			expect(categoryDots.length).toBe(1)
		})

		it('handles practice with fallback category from category field', () => {
			const practice = { ...buildPractice(), categories: undefined, category: 'tooling' }
			const { container } = render(GraphNode, { props: { practice } })

			// Should still render category dot
			const categoryDots = container.querySelectorAll('.w-3\\.5')
			expect(categoryDots.length).toBeGreaterThan(0)
		})

		it('shows expand button even without event listener', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			// Expand button should show if there are dependencies, regardless of event listeners
			expect(getByText(/Expand Dependencies/)).toBeInTheDocument()
		})
	})
})
