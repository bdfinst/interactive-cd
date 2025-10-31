import GraphNode from '$lib/components/GraphNode.svelte'
import { fireEvent, render } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'

import { buildMinimalPractice, buildPractice } from '../../utils/builders.js'

describe('GraphNode - User Interactions', () => {
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

	it('calls onclick when maximize button clicked (auto-expand removed)', async () => {
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

		// Auto-expand behavior was intentionally removed
		// Now only onclick is called, navigation logic is in PracticeGraph
		expect(handleClick).toHaveBeenCalledOnce()
		expect(handleExpand).not.toHaveBeenCalled()
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

describe('GraphNode - Accessibility', () => {
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

describe('GraphNode - Edge Cases', () => {
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
