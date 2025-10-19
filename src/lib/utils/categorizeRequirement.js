/**
 * Categorizes a requirement, returning all applicable categories
 * Requirements can span multiple dimensions (tooling + behavior + culture)
 * @param {string} requirement - The requirement text
 * @returns {Array<'culture' | 'behavior' | 'tooling'>} - Array of applicable categories
 */
export function categorizeRequirement(requirement) {
	const text = requirement.toLowerCase()
	const categories = []

	// High-level practices that span all three dimensions
	const comprehensivePractices = [
		'use continuous integration',
		'use trunk-based development',
		'continuous delivery',
		'continuous deployment'
	]

	// Check if this is a comprehensive practice first
	if (comprehensivePractices.some(practice => text.includes(practice))) {
		return ['culture', 'tooling', 'behavior']
	}

	// Culture keywords - organizational, team-based, mindset
	const cultureKeywords = [
		'team',
		'collaborate',
		'communication',
		'ownership',
		'culture',
		'organization',
		'shared',
		'trust',
		'responsibility',
		'empower',
		'value',
		'mindset',
		'cross-functional'
	]

	// Behavior keywords - practices, processes, actions
	const behaviorKeywords = [
		'practice',
		'process',
		'when',
		'stop',
		'maintain',
		'measure',
		'monitor',
		'validate',
		'review',
		'feedback',
		'improve',
		'commit',
		'merge',
		'release',
		'frequency',
		'only path',
		'must',
		'should',
		'ensure',
		'integrate',
		'daily',
		'at least'
	]

	// Tooling patterns - infrastructure, automation, technical systems
	const toolingPatterns = [
		'create.*artifact',
		'immutable artifact',
		'application pipeline',
		'pipeline.*only path',
		'pipeline determines',
		'pipeline',
		'on-demand rollback',
		'production-like.*environment',
		'test environment',
		'version control',
		'automated',
		'automation',
		'infrastructure',
		'configuration.*artifact',
		'deploy.*configuration',
		'artifact',
		'deployment',
		'build',
		'environment'
	]

	// Check all categories - a requirement can match multiple
	if (cultureKeywords.some(keyword => text.includes(keyword))) {
		categories.push('culture')
	}

	if (toolingPatterns.some(pattern => new RegExp(pattern).test(text))) {
		categories.push('tooling')
	}

	if (behaviorKeywords.some(keyword => text.includes(keyword))) {
		categories.push('behavior')
	}

	// If no categories matched, default to behavior
	return categories.length > 0 ? categories : ['behavior']
}
