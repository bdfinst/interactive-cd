/**
 * Feature Flags Configuration
 *
 * This file defines all feature flags used in the application.
 * Each flag includes metadata for documentation and maintainability.
 *
 * Usage:
 *   import { FEATURE_FLAGS } from '$lib/config/featureFlags.config.js'
 *   const flagConfig = FEATURE_FLAGS.PRACTICE_ADOPTION
 *
 * Adding a new feature flag:
 * 1. Add entry to FEATURE_FLAGS object below
 * 2. Set environment variable in .env files (e.g., VITE_ENABLE_YOUR_FEATURE=true)
 * 3. Feature flag will be automatically available in components
 */

/**
 * Feature flag configuration object
 * @typedef {Object} FeatureFlagConfig
 * @property {string} key - Environment variable name (without VITE_ prefix)
 * @property {boolean} defaultValue - Default value if env var not set
 * @property {string} description - Human-readable description of the feature
 * @property {string} owner - Team or person responsible for the feature
 * @property {string} status - Current status: 'alpha' | 'beta' | 'stable' | 'deprecated'
 * @property {string} createdAt - Date when flag was created (YYYY-MM-DD)
 */

export const FEATURE_FLAGS = {
	/**
	 * Practice Adoption Feature
	 *
	 * Enables practice adoption tracking with checkboxes on practice cards.
	 * Users can mark practices as adopted and export/import adoption state.
	 */
	PRACTICE_ADOPTION: {
		key: 'ENABLE_PRACTICE_ADOPTION',
		defaultValue: false,
		description: 'Practice adoption tracking with export/import functionality',
		owner: 'adoption-team',
		status: 'beta',
		createdAt: '2025-01-15'
	}

	// Future feature flags can be added here:
	// NEW_FEATURE: {
	//   key: 'ENABLE_NEW_FEATURE',
	//   defaultValue: false,
	//   description: 'Description of the new feature',
	//   owner: 'team-name',
	//   status: 'alpha',
	//   createdAt: '2025-MM-DD'
	// }
}

/**
 * Legacy FLAGS object for backward compatibility
 * Maps old flag names to environment variable keys
 *
 * @deprecated Use FEATURE_FLAGS directly for new code
 */
export const FLAGS = Object.entries(FEATURE_FLAGS).reduce((acc, [key, config]) => {
	acc[key] = config.key
	return acc
}, {})
