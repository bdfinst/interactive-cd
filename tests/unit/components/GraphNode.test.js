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

	describe('node sizing', () => {
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

		it('tiny size uses compact display mode', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { container } = render(GraphNode, {
				props: { practice, nodeSize: 'tiny', isSelected: true }
			})

			const description = container.querySelector('p.text-xs')
			expect(description).toBeInTheDocument()
		})

		it('compact size uses compact display mode', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { container } = render(GraphNode, {
				props: { practice, nodeSize: 'compact', isSelected: true }
			})

			const description = container.querySelector('p.text-xs')
			expect(description).toBeInTheDocument()
		})

		it('standard size uses normal display mode', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { container } = render(GraphNode, {
				props: { practice, nodeSize: 'standard', isSelected: true }
			})

			const description = container.querySelector('p.text-sm')
			expect(description).toBeInTheDocument()
		})

		it('expanded size uses normal display mode', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { container } = render(GraphNode, {
				props: { practice, nodeSize: 'expanded', isSelected: true }
			})

			const description = container.querySelector('p.text-sm')
			expect(description).toBeInTheDocument()
		})

		it('selected-dependency size uses normal display mode', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { container } = render(GraphNode, {
				props: { practice, nodeSize: 'selected-dependency', isSelected: true }
			})

			const description = container.querySelector('p.text-sm')
			expect(description).toBeInTheDocument()
		})
	})

	describe('quick-start guide links', () => {
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

	describe('dependency counts', () => {
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

			it('direct count text is bold', () => {
				const practice = buildPractice({
					dependencyCount: 5,
					directDependencyCount: 2,
					totalDependencyCount: 5
				})
				const { container } = render(GraphNode, {
					props: { practice, isSelected: false, isTreeExpanded: false }
				})

				const directSpan = container.querySelector('.font-semibold')
				expect(directSpan).toBeInTheDocument()
				expect(directSpan.textContent).toContain('2 direct')
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

		describe('font sizes in different modes', () => {
			it('uses text-xs for counts in compact mode', () => {
				const practice = buildPractice({
					dependencyCount: 5,
					directDependencyCount: 2,
					totalDependencyCount: 5
				})
				const { container } = render(GraphNode, {
					props: { practice, isSelected: false, isTreeExpanded: false, nodeSize: 'compact' }
				})

				const countDiv = container.querySelector('.dependency-count')
				expect(countDiv.classList.contains('text-xs')).toBe(true)
			})

			it('uses text-sm for counts in standard mode', () => {
				const practice = buildPractice({
					dependencyCount: 5,
					directDependencyCount: 2,
					totalDependencyCount: 5
				})
				const { container } = render(GraphNode, {
					props: { practice, isSelected: false, isTreeExpanded: false, nodeSize: 'standard' }
				})

				const countDiv = container.querySelector('.dependency-count')
				expect(countDiv.classList.contains('text-sm')).toBe(true)
			})
		})
	})

	describe('adoption percentage', () => {
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
})
