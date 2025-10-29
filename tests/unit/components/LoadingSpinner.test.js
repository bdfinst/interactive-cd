import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'

describe('LoadingSpinner', () => {
	describe('rendering', () => {
		it('renders loading spinner', () => {
			const { container } = render(LoadingSpinner)

			const spinner = container.querySelector('.animate-spin')
			expect(spinner).toBeInTheDocument()
		})

		it('renders loading text', () => {
			const { getByText } = render(LoadingSpinner)

			expect(getByText('Loading dependencies...')).toBeInTheDocument()
		})

		it('renders custom loading text', () => {
			const { getByText } = render(LoadingSpinner, {
				props: { text: 'Custom loading message' }
			})

			expect(getByText('Custom loading message')).toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('includes role="status" for screen readers', () => {
			const { container } = render(LoadingSpinner)

			const statusDiv = container.querySelector('[role="status"]')
			expect(statusDiv).toBeInTheDocument()
		})

		it('includes aria-live="polite" for screen readers', () => {
			const { container } = render(LoadingSpinner)

			const statusDiv = container.querySelector('[aria-live="polite"]')
			expect(statusDiv).toBeInTheDocument()
		})

		it('hides spinner from screen readers with aria-hidden', () => {
			const { container } = render(LoadingSpinner)

			const spinner = container.querySelector('[aria-hidden="true"]')
			expect(spinner).toBeInTheDocument()
		})
	})

	describe('styling', () => {
		it('applies default sizing classes', () => {
			const { container } = render(LoadingSpinner)

			const spinner = container.querySelector('.animate-spin')
			expect(spinner).toHaveClass('h-12')
			expect(spinner).toHaveClass('w-12')
		})

		it('applies blue border color', () => {
			const { container } = render(LoadingSpinner)

			const spinner = container.querySelector('.animate-spin')
			expect(spinner).toHaveClass('border-blue-600')
		})

		it('centers content', () => {
			const { container } = render(LoadingSpinner)

			const wrapper = container.querySelector('.flex')
			expect(wrapper).toHaveClass('items-center')
			expect(wrapper).toHaveClass('justify-center')
		})
	})
})
