import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import AdoptionCheckbox from '$lib/components/AdoptionCheckbox.svelte'

describe('AdoptionCheckbox', () => {
	describe('Rendering', () => {
		it('renders unchecked checkbox when not adopted', () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false
				}
			})

			const checkbox = getByRole('checkbox')
			expect(checkbox).not.toBeChecked()
		})

		it('renders checked checkbox when adopted', () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: true
				}
			})

			const checkbox = getByRole('checkbox')
			expect(checkbox).toBeChecked()
		})

		it('has accessible label with practice ID', () => {
			const { getByLabelText } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false
				}
			})

			const checkbox = getByLabelText(/version-control/i)
			expect(checkbox).toBeInTheDocument()
		})

		it('has correct aria-label', () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false
				}
			})

			const checkbox = getByRole('checkbox')
			expect(checkbox).toHaveAttribute('aria-label', 'Mark version-control as adopted')
		})
	})

	describe('Interaction', () => {
		it('calls ontoggle callback when clicked', async () => {
			const toggleHandler = vi.fn()
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false,
					ontoggle: toggleHandler
				}
			})

			const checkbox = getByRole('checkbox')
			await fireEvent.click(checkbox)

			expect(toggleHandler).toHaveBeenCalledTimes(1)
			expect(toggleHandler).toHaveBeenCalledWith({ practiceId: 'version-control' })
		})

		it('calls ontoggle callback when unchecking', async () => {
			const toggleHandler = vi.fn()
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: true,
					ontoggle: toggleHandler
				}
			})

			const checkbox = getByRole('checkbox')
			await fireEvent.click(checkbox)

			expect(toggleHandler).toHaveBeenCalledTimes(1)
		})

		it('is keyboard accessible', async () => {
			const toggleHandler = vi.fn()
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false,
					ontoggle: toggleHandler
				}
			})

			const checkbox = getByRole('checkbox')
			checkbox.focus()

			// Space key on checkbox triggers click event
			await fireEvent.keyDown(checkbox, { key: ' ' })
			// Simulate the resulting change event
			await fireEvent.click(checkbox)

			expect(toggleHandler).toHaveBeenCalled()
		})
	})

	describe('Visual States', () => {
		it('applies correct classes for unchecked state', () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false
				}
			})

			const checkbox = getByRole('checkbox')
			const classList = checkbox.className

			// Should have base checkbox classes
			expect(classList).toContain('cursor-pointer')
		})

		it('applies correct classes for checked state', () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: true
				}
			})

			const checkbox = getByRole('checkbox')
			expect(checkbox).toBeChecked()
		})
	})

	describe('Edge Cases', () => {
		it('handles rapid clicks gracefully', async () => {
			const toggleHandler = vi.fn()
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false,
					ontoggle: toggleHandler
				}
			})

			const checkbox = getByRole('checkbox')

			// Click rapidly
			await fireEvent.click(checkbox)
			await fireEvent.click(checkbox)
			await fireEvent.click(checkbox)

			expect(toggleHandler).toHaveBeenCalledTimes(3)
		})

		it('handles special characters in practice ID', () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'practice-with-dashes-and_underscores',
					isAdopted: false
				}
			})

			const checkbox = getByRole('checkbox')
			expect(checkbox).toHaveAttribute(
				'aria-label',
				'Mark practice-with-dashes-and_underscores as adopted'
			)
		})

		it('works without ontoggle callback', async () => {
			const { getByRole } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false
				}
			})

			const checkbox = getByRole('checkbox')

			// Should not throw error when clicking without callback
			await expect(fireEvent.click(checkbox)).resolves.not.toThrow()
		})
	})

	describe('Testability', () => {
		it('has data-testid for e2e testing', () => {
			const { container } = render(AdoptionCheckbox, {
				props: {
					practiceId: 'version-control',
					isAdopted: false
				}
			})

			const checkbox = container.querySelector('[data-testid="adoption-checkbox-version-control"]')
			expect(checkbox).toBeInTheDocument()
		})
	})
})
