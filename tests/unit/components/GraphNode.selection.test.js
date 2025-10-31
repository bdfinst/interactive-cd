import GraphNode from '$lib/components/GraphNode.svelte'
import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import { buildMinimalPractice, buildPractice } from '../../utils/builders.js'

describe('GraphNode - Selection State', () => {
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
		const { getByText } = render(GraphNode, {
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

	it('applies selected data attribute', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice, isSelected: true }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-selected')).toBe('true')
	})

	it('applies unselected data attribute', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice, isSelected: false }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-selected')).toBe('false')
	})
})

describe('GraphNode - Dependency Display', () => {
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
