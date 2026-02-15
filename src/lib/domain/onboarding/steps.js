/**
 * Onboarding step configuration
 * Pure function returning step definitions for the onboarding overlay
 */

/**
 * Get the onboarding steps configuration
 * @returns {Array<Object>} Array of step objects
 */
export const getOnboardingSteps = () => [
	{
		id: 'welcome',
		targetSelector: null,
		title: 'Welcome to the CD Dependency Tree',
		content:
			'This interactive tool visualizes Continuous Delivery practices and their dependencies. Navigate the tree to understand what practices enable others, and track your adoption progress.',
		position: 'center',
		width: 'lg'
	},
	{
		id: 'card-click',
		targetSelector: '[data-testid="graph-node"]',
		title: 'Click Cards to Explore',
		content:
			'Click any practice card to view its details, requirements, and benefits. Click a dependency card to drill down into its own dependency tree.',
		position: 'bottom',
		width: 'md'
	},
	{
		id: 'breadcrumbs',
		targetSelector: 'nav[aria-label="Breadcrumb"]',
		title: 'Navigate the Tree',
		content:
			'Use breadcrumbs to navigate back up the dependency tree. Click any ancestor name to jump directly to that level.',
		position: 'bottom',
		width: 'md'
	},
	{
		id: 'expand-button',
		targetSelector: '[data-testid="toggle-full-tree"]',
		title: 'View the Full Tree',
		content:
			'Click "Expand" to see all practices at once in a hierarchical view. Click any card in the expanded view to focus on it.',
		position: 'bottom',
		width: 'md'
	},
	{
		id: 'adoption-checkbox',
		targetSelector: '[data-testid="graph-node"]',
		title: 'Track Your Progress',
		content:
			'Each card has a checkbox in the top-right corner. Mark practices as adopted to track your CD journey and see progress percentages update.',
		position: 'left',
		width: 'md'
	},
	{
		id: 'category-legend',
		targetSelector: '[data-testid="legend-items"]',
		title: 'Understand Categories',
		content:
			'Practices are color-coded by category: Automation (yellow), Behavior (blue), and Automation & Behavior (green). Hover over legend items for descriptions.',
		position: 'bottom',
		width: 'md'
	}
]
