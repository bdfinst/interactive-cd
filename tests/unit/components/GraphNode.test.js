import GraphNode from '$lib/components/GraphNode.svelte'
import { fireEvent, render } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'

import { buildMinimalPractice, buildPractice } from '../../utils/builders.js'

describe('GraphNode', () => {
	describe('rendering', () => {
		it('renders practice name', () => {
			const practice = buildPractice({ name: 'Continuous Integration' })
			const { getByText } = render(GraphNode, { props: { practice } })

			expect(getByText('Continuous Integration')).toBeInTheDocument()
		})

		it('applies background color class based on category', () => {
			const practice = buildPractice({ category: 'automation' })
			const { getByTestId } = render(GraphNode, { props: { practice } })

			const node = getByTestId('graph-node')
			expect(node.classList.contains('bg-category-automation')).toBe(true)
		})

		it('renders as a div element', () => {
			const practice = buildPractice()
			const { getByTestId } = render(GraphNode, { props: { practice } })

			const node = getByTestId('graph-node')
			expect(node.tagName).toBe('DIV')
		})

		it('includes practice id in data attribute', () => {
			const practice = buildPractice({ id: 'test-practice-id' })
			const { getByTestId } = render(GraphNode, { props: { practice } })

			const node = getByTestId('graph-node')
			expect(node.getAttribute('data-practice-id')).toBe('test-practice-id')
		})

		it('renders maximize button when not selected', () => {
			const practice = buildPractice()
			const { getByLabelText } = render(GraphNode, { props: { practice, isSelected: false } })

			expect(getByLabelText(`View details for ${practice.name}`)).toBeInTheDocument()
		})

		it('renders close button when selected', () => {
			const practice = buildPractice()
			const { getByLabelText } = render(GraphNode, { props: { practice, isSelected: true } })

			expect(getByLabelText(`Close details for ${practice.name}`)).toBeInTheDocument()
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

	describe('dependency display', () => {
		it('shows dependency count when not selected and has dependencies', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(getByText('3 dependencies')).toBeInTheDocument()
		})

		it('shows singular form when has one dependency', () => {
			const practice = buildPractice({ dependencyCount: 1 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(getByText('1 dependency')).toBeInTheDocument()
		})

		it('hides dependency count when selected', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(queryByText('3 dependencies')).not.toBeInTheDocument()
		})

		it('hides dependency count when has no dependencies', () => {
			const practice = buildMinimalPractice()
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(queryByText(/dependency|dependencies/)).not.toBeInTheDocument()
		})
	})

	describe('user interactions', () => {
		it('calls onclick callback when maximize button is clicked', async () => {
			const practice = buildPractice()
			const handleClick = vi.fn()
			const { getByLabelText } = render(GraphNode, {
				props: { practice, onclick: handleClick, isSelected: false }
			})

			await fireEvent.click(getByLabelText(`View details for ${practice.name}`))

			expect(handleClick).toHaveBeenCalledOnce()
			expect(handleClick).toHaveBeenCalledWith()
		})

		it('calls onclick callback when close button is clicked', async () => {
			const practice = buildPractice()
			const handleClick = vi.fn()
			const { getByLabelText } = render(GraphNode, {
				props: { practice, onclick: handleClick, isSelected: true }
			})

			await fireEvent.click(getByLabelText(`Close details for ${practice.name}`))

			expect(handleClick).toHaveBeenCalledOnce()
			expect(handleClick).toHaveBeenCalledWith()
		})

		it('auto-expands dependencies when maximize button clicked if has dependencies and not root', async () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const handleClick = vi.fn()
			const handleExpand = vi.fn()
			const { getByLabelText } = render(GraphNode, {
				props: {
					practice,
					isRoot: false,
					isSelected: false,
					onclick: handleClick,
					onExpand: handleExpand
				}
			})

			await fireEvent.click(getByLabelText(`View details for ${practice.name}`))

			expect(handleClick).toHaveBeenCalledOnce()
			expect(handleExpand).toHaveBeenCalledOnce()
			expect(handleExpand).toHaveBeenCalledWith()
		})

		it('does not auto-expand when practice is root', async () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const handleClick = vi.fn()
			const handleExpand = vi.fn()
			const { getByLabelText } = render(GraphNode, {
				props: {
					practice,
					isRoot: true,
					isSelected: false,
					onclick: handleClick,
					onExpand: handleExpand
				}
			})

			await fireEvent.click(getByLabelText(`View details for ${practice.name}`))

			expect(handleClick).toHaveBeenCalledOnce()
			expect(handleExpand).not.toHaveBeenCalled()
		})

		it('does not auto-expand when practice has no dependencies', async () => {
			const practice = buildMinimalPractice()
			const handleClick = vi.fn()
			const handleExpand = vi.fn()
			const { getByLabelText } = render(GraphNode, {
				props: {
					practice,
					isRoot: false,
					isSelected: false,
					onclick: handleClick,
					onExpand: handleExpand
				}
			})

			await fireEvent.click(getByLabelText(`View details for ${practice.name}`))

			expect(handleClick).toHaveBeenCalledOnce()
			expect(handleExpand).not.toHaveBeenCalled()
		})
	})

	describe('accessibility', () => {
		it('maximize button is keyboard accessible', () => {
			const practice = buildPractice()
			const { getByLabelText } = render(GraphNode, { props: { practice, isSelected: false } })

			const maximizeButton = getByLabelText(`View details for ${practice.name}`)
			expect(maximizeButton).toBeInTheDocument()
			expect(maximizeButton.tagName).toBe('BUTTON')
		})

		it('close button is keyboard accessible when selected', () => {
			const practice = buildPractice()
			const { getByLabelText } = render(GraphNode, { props: { practice, isSelected: true } })

			const closeButton = getByLabelText(`Close details for ${practice.name}`)
			expect(closeButton).toBeInTheDocument()
			expect(closeButton.tagName).toBe('BUTTON')
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

		it('handles practice with no requirements', () => {
			const practice = buildPractice({ requirements: [] })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(queryByText('Requirements')).not.toBeInTheDocument()
		})
	})
})
