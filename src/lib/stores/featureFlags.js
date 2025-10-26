import { browser } from '$app/environment'
import { derived, writable } from 'svelte/store'

/**
 * Feature flag configuration
 */
const FLAGS = {
	PRACTICE_ADOPTION: 'ENABLE_PRACTICE_ADOPTION'
}

/**
 * Check if a feature flag is enabled
 * Priority: URL param > env var > default (false)
 *
 * @param {string} flagName - Feature flag name
 * @returns {boolean}
 */
const isFeatureEnabled = flagName => {
	if (!browser) return false

	// 1. Check URL parameter (for testing/preview)
	// Example: ?feature=practice-adoption or ?features=practice-adoption,other-feature
	const urlParams = new URLSearchParams(window.location.search)
	const featuresParam = urlParams.get('feature') || urlParams.get('features')

	if (featuresParam) {
		// Split, trim, lowercase, and filter out empty strings
		const enabledFeatures = featuresParam
			.split(',')
			.map(f => f.trim().toLowerCase())
			.filter(f => f.length > 0)

		// Map flag names to URL-friendly names
		const urlFlagName = flagName.replace('ENABLE_', '').replace(/_/g, '-').toLowerCase()

		if (enabledFeatures.includes(urlFlagName)) {
			console.info(`🚩 Feature flag "${flagName}" enabled via URL parameter`)
			return true
		}
	}

	// 2. Check environment variable (VITE_ prefix)
	const envValue = import.meta.env[`VITE_${flagName}`]
	const isEnabled = envValue === 'true' || envValue === '1' || envValue === true || envValue === 1

	if (isEnabled) {
		console.info(
			`🚩 Feature flag "${flagName}" enabled via environment variable (VITE_${flagName}=${envValue})`
		)
		return true
	}

	// 3. Default: disabled
	console.info(`🚩 Feature flag "${flagName}" disabled (VITE_${flagName}: ${envValue})`)
	return false
}

/**
 * Create feature flag store
 */
const createFeatureFlagStore = () => {
	const { subscribe, update } = writable({
		[FLAGS.PRACTICE_ADOPTION]: isFeatureEnabled(FLAGS.PRACTICE_ADOPTION)
	})

	// Re-check flags when URL changes (for SPA navigation)
	if (browser) {
		window.addEventListener('popstate', () => {
			update(flags => ({
				...flags,
				[FLAGS.PRACTICE_ADOPTION]: isFeatureEnabled(FLAGS.PRACTICE_ADOPTION)
			}))
		})
	}

	return {
		subscribe,
		FLAGS,

		/**
		 * Check if a specific feature is enabled
		 * @param {string} flagName - Flag name from FLAGS
		 * @returns {boolean}
		 */
		isEnabled: flagName => {
			let enabled = false
			subscribe(flags => {
				enabled = flags[flagName] || false
			})()
			return enabled
		}
	}
}

export const featureFlags = createFeatureFlagStore()

// Derived stores for specific features (for convenience)
export const isPracticeAdoptionEnabled = derived(
	featureFlags,
	$flags => $flags[featureFlags.FLAGS.PRACTICE_ADOPTION]
)
