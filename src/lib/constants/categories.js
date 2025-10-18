/**
 * Category Configuration
 *
 * These represent the types of requirements a practice may have:
 * - Behavior: Team behaviors and working patterns
 * - Culture: Organizational culture and mindset
 * - Tooling: Technical infrastructure and tools
 */

export const CATEGORIES = {
	behavior: {
		color: '#10b981', // Green
		label: 'Behavior'
	},
	culture: {
		color: '#f59e0b', // Amber
		label: 'Culture'
	},
	tooling: {
		color: '#8b5cf6', // Purple
		label: 'Tooling'
	}
}

export const CATEGORY_KEYS = Object.keys(CATEGORIES)
