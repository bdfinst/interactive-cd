import GraphNode from '$lib/components/GraphNode.svelte'
import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'

import { buildPractice } from '../../utils/builders.js'

describe('GraphNode - Node Sizing', () => {
	it('applies tiny size variant data attribute', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice, nodeSize: 'tiny' }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-node-size')).toBe('tiny')
	})

	it('applies compact size variant data attribute', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice, nodeSize: 'compact' }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-node-size')).toBe('compact')
	})

	it('applies standard size variant data attribute by default', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-node-size')).toBe('standard')
	})

	it('applies expanded size variant data attribute', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice, nodeSize: 'expanded' }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-node-size')).toBe('expanded')
	})

	it('applies selected-dependency size variant data attribute', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, {
			props: { practice, nodeSize: 'selected-dependency' }
		})

		const node = getByTestId('graph-node')
		expect(node.getAttribute('data-node-size')).toBe('selected-dependency')
	})

	// Note: Tests for specific CSS classes (text-xs, text-sm) removed
	// These tests coupled to Tailwind implementation details.
	// The data-node-size attribute defines the semantic contract,
	// and the actual visual sizing can be refactored independently.
})
