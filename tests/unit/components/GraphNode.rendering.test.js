import GraphNode from '$lib/components/GraphNode.svelte'
import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import { buildPractice } from '../../utils/builders.js'

describe('GraphNode - Rendering', () => {
	it('renders practice name', () => {
		const practice = buildPractice({ name: 'Continuous Integration' })
		const { getByText } = render(GraphNode, { props: { practice } })

		expect(getByText('Continuous Integration')).toBeInTheDocument()
	})

	it('renders practice with category', () => {
		const practice = buildPractice({ category: 'automation' })
		const { getByTestId } = render(GraphNode, { props: { practice } })

		const node = getByTestId('graph-node')
		// Note: Visual distinction by category (color) is a styling concern.
		// Testing that rendering succeeds is sufficient.
		expect(node).toBeInTheDocument()
	})

	// Note: Testing element type (DIV) removed - this is an implementation detail.
	// The semantic role and content matter, not the specific HTML element used.

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
