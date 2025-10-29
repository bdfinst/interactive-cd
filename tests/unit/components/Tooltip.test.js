import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Tooltip from '$lib/components/Tooltip.svelte'

describe('Tooltip', () => {
	it('renders tooltip with text', () => {
		const { getByText } = render(Tooltip, {
			props: { text: 'Test tooltip', visible: true }
		})
		expect(getByText('Test tooltip')).toBeInTheDocument()
	})

	it('does not render when visible is false', () => {
		const { queryByText } = render(Tooltip, {
			props: { text: 'Test tooltip', visible: false }
		})
		expect(queryByText('Test tooltip')).not.toBeInTheDocument()
	})

	it('applies correct position classes for bottom position', () => {
		const { getByText } = render(Tooltip, {
			props: { text: 'Test', visible: true, position: 'bottom' }
		})
		const tooltip = getByText('Test')
		expect(tooltip).toHaveClass('top-[calc(100%+0.5rem)]')
	})

	it('applies correct size classes for medium size', () => {
		const { getByText } = render(Tooltip, {
			props: { text: 'Test', visible: true, size: 'md' }
		})
		const tooltip = getByText('Test')
		expect(tooltip).toHaveClass('md:px-3')
		expect(tooltip).toHaveClass('md:py-2')
		expect(tooltip).toHaveClass('md:text-sm')
	})

	it('applies correct size classes for small size', () => {
		const { getByText } = render(Tooltip, {
			props: { text: 'Test', visible: true, size: 'sm' }
		})
		const tooltip = getByText('Test')
		expect(tooltip).toHaveClass('px-2')
		expect(tooltip).toHaveClass('py-1.5')
	})

	it('is not interactive (pointer-events-none)', () => {
		const { getByText } = render(Tooltip, {
			props: { text: 'Test', visible: true }
		})
		const tooltip = getByText('Test')
		expect(tooltip).toHaveClass('pointer-events-none')
	})

	it('has high z-index for proper layering', () => {
		const { getByText } = render(Tooltip, {
			props: { text: 'Test', visible: true }
		})
		const tooltip = getByText('Test')
		expect(tooltip).toHaveClass('z-[2000]')
	})
})
