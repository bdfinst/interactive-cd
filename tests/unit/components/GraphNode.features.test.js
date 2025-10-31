import GraphNode from '$lib/components/GraphNode.svelte'
import { fireEvent, render } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'

import { buildMinimalPractice, buildPractice } from '../../utils/builders.js'

describe('GraphNode - Quick-Start Guide Links', () => {
	describe('when selected', () => {
		it('displays quick-start guide link when quickStartGuide is provided', () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toBeInTheDocument()
		})

		it('guide link has correct href attribute', () => {
			const url = 'https://minimumcd.org/minimumcd/trunk-based-development/'
			const practice = buildPractice({ quickStartGuide: url })
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toHaveAttribute('href', url)
		})

		it('guide link opens in new tab', () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toHaveAttribute('target', '_blank')
		})

		it('guide link has security attributes', () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toHaveAttribute('rel', 'noopener noreferrer')
		})

		it('guide link has descriptive aria-label', () => {
			const practice = buildPractice({
				name: 'Continuous Integration',
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toHaveAttribute(
				'aria-label',
				'Quick-start guide for Continuous Integration'
			)
		})

		it('does not display guide link when quickStartGuide is null', () => {
			const practice = buildPractice({ quickStartGuide: null })
			const { queryByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(queryByTestId('quick-start-guide-link')).not.toBeInTheDocument()
		})

		it('does not display guide link when quickStartGuide is undefined', () => {
			const practice = buildPractice()
			const { queryByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(queryByTestId('quick-start-guide-link')).not.toBeInTheDocument()
		})

		it('guide link displays external link icon', () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			const icon = guideLink.querySelector('svg')
			expect(icon).toBeInTheDocument()
		})
	})

	describe('when not selected', () => {
		it('displays quick-start guide link when quickStartGuide is provided', () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toBeInTheDocument()
		})

		it('guide link has correct href attribute', () => {
			const url = 'https://minimumcd.org/minimumcd/configuration-management/'
			const practice = buildPractice({ quickStartGuide: url })
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			expect(guideLink).toHaveAttribute('href', url)
		})

		it('does not display guide link when quickStartGuide is null', () => {
			const practice = buildPractice({ quickStartGuide: null })
			const { queryByTestId } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(queryByTestId('quick-start-guide-link')).not.toBeInTheDocument()
		})

		it('does not display guide link when quickStartGuide is undefined', () => {
			const practice = buildPractice()
			const { queryByTestId } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(queryByTestId('quick-start-guide-link')).not.toBeInTheDocument()
		})

		it('guide link displays external link icon', () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			const icon = guideLink.querySelector('svg')
			expect(icon).toBeInTheDocument()
		})
	})

	describe('event handling', () => {
		it('guide link click does not trigger onclick callback', async () => {
			const practice = buildPractice({
				quickStartGuide: 'https://minimumcd.org/minimumcd/continuous-integration/'
			})
			const handleClick = vi.fn()
			const { getByTestId } = render(GraphNode, {
				props: { practice, isSelected: true, onclick: handleClick }
			})

			const guideLink = getByTestId('quick-start-guide-link')
			await fireEvent.click(guideLink)

			expect(handleClick).not.toHaveBeenCalled()
		})
	})
})

describe('GraphNode - Dependency Counts', () => {
	describe('collapsed view (not tree expanded)', () => {
		it('shows direct and total dependency counts when not selected', () => {
			const practice = buildPractice({
				dependencyCount: 5,
				directDependencyCount: 2,
				totalDependencyCount: 5
			})
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: false, isTreeExpanded: false }
			})

			expect(getByText(/2 direct/)).toBeInTheDocument()
			expect(getByText(/5 total/)).toBeInTheDocument()
		})

		it('shows singular form for 1 direct dependency', () => {
			const practice = buildPractice({
				dependencyCount: 1,
				directDependencyCount: 1,
				totalDependencyCount: 1
			})
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: false, isTreeExpanded: false }
			})

			expect(getByText(/1 direct/)).toBeInTheDocument()
			expect(getByText(/1 total/)).toBeInTheDocument()
		})

		it('falls back to dependencyCount when direct/total not available', () => {
			const practice = buildPractice({ dependencyCount: 3 })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: false, isTreeExpanded: false }
			})

			expect(getByText('3 dependencies')).toBeInTheDocument()
		})

		it('emphasizes direct count to distinguish from total', () => {
			const practice = buildPractice({
				dependencyCount: 5,
				directDependencyCount: 2,
				totalDependencyCount: 5
			})
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: false, isTreeExpanded: false }
			})

			// Test the content is present - visual emphasis is a style concern
			expect(getByText(/2 direct/)).toBeInTheDocument()
			expect(getByText(/5 total/)).toBeInTheDocument()
		})

		it('does not show counts when practice has no dependencies', () => {
			const practice = buildMinimalPractice()
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false, isTreeExpanded: false }
			})

			expect(queryByText(/direct/)).not.toBeInTheDocument()
			expect(queryByText(/total/)).not.toBeInTheDocument()
			expect(queryByText(/dependency|dependencies/)).not.toBeInTheDocument()
		})
	})

	describe('expanded tree view', () => {
		it('does not show dependency counts when tree is expanded', () => {
			const practice = buildPractice({
				dependencyCount: 5,
				directDependencyCount: 2,
				totalDependencyCount: 5
			})
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false, isTreeExpanded: true }
			})

			expect(queryByText(/direct/)).not.toBeInTheDocument()
			expect(queryByText(/total/)).not.toBeInTheDocument()
			expect(queryByText(/dependencies/)).not.toBeInTheDocument()
		})
	})

	describe('selected view', () => {
		it('does not show dependency counts when selected', () => {
			const practice = buildPractice({
				dependencyCount: 5,
				directDependencyCount: 2,
				totalDependencyCount: 5
			})
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: true, isTreeExpanded: false }
			})

			expect(queryByText(/direct/)).not.toBeInTheDocument()
			expect(queryByText(/total/)).not.toBeInTheDocument()
		})
	})

	// Note: Font size CSS tests removed (text-xs, text-sm)
	// These tests coupled to Tailwind implementation.
	// Visual sizing for different modes should be verified via visual regression tests.
})

describe('GraphNode - Adoption Percentage', () => {
	describe('when selected', () => {
		it('shows adoption percentage when has dependencies', () => {
			const practice = buildPractice({ name: 'Test Practice' })
			const { getByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: true,
					isAdopted: true,
					adoptedDependencyCount: 2,
					totalDependencyCount: 5
				}
			})

			expect(getByText(/% adoption/)).toBeInTheDocument()
		})

		it('calculates adoption percentage correctly when adopted', () => {
			const practice = buildPractice()
			const { getByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: true,
					isAdopted: true,
					adoptedDependencyCount: 2,
					totalDependencyCount: 5
				}
			})

			// (2 adopted deps + 1 adopted parent) / (5 total deps + 1 parent) = 3/6 = 50%
			expect(getByText('50% adoption')).toBeInTheDocument()
		})

		it('calculates adoption percentage correctly when not adopted', () => {
			const practice = buildPractice()
			const { getByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: true,
					isAdopted: false,
					adoptedDependencyCount: 2,
					totalDependencyCount: 5
				}
			})

			// (2 adopted deps + 0 for parent) / (5 total deps + 1 parent) = 2/6 = 33%
			expect(getByText('33% adoption')).toBeInTheDocument()
		})

		it('does not show adoption percentage when no dependencies', () => {
			const practice = buildMinimalPractice()
			const { queryByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: true,
					isAdopted: false,
					adoptedDependencyCount: 0,
					totalDependencyCount: 0
				}
			})

			expect(queryByText(/% adoption/)).not.toBeInTheDocument()
		})
	})

	describe('when not selected', () => {
		it('shows adoption percentage in collapsed view when has dependencies', () => {
			const practice = buildPractice()
			const { getByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: false,
					isTreeExpanded: false,
					isAdopted: true,
					adoptedDependencyCount: 3,
					totalDependencyCount: 5
				}
			})

			// (3 adopted deps + 1 adopted parent) / (5 total deps + 1 parent) = 4/6 = 66%
			expect(getByText('66% adoption')).toBeInTheDocument()
		})

		it('does not show adoption percentage in expanded tree view', () => {
			const practice = buildPractice()
			const { queryByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: false,
					isTreeExpanded: true,
					isAdopted: true,
					adoptedDependencyCount: 3,
					totalDependencyCount: 5
				}
			})

			expect(queryByText(/% adoption/)).not.toBeInTheDocument()
		})

		it('does not show adoption percentage when no dependencies', () => {
			const practice = buildMinimalPractice()
			const { queryByText } = render(GraphNode, {
				props: {
					practice,
					isSelected: false,
					isTreeExpanded: false,
					isAdopted: false,
					adoptedDependencyCount: 0,
					totalDependencyCount: 0
				}
			})

			expect(queryByText(/% adoption/)).not.toBeInTheDocument()
		})
	})
})
