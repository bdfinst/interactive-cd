import { browser } from '$app/environment'
import { derived, writable } from 'svelte/store'
import { FEATURE_FLAGS, FLAGS } from '$lib/config/featureFlags.config.js'

/**
 * Check if a feature flag is enabled
 * Uses ONLY environment variable - URL parameters are ignored
 *
 * @param {import('$lib/config/featureFlags.config.js').FeatureFlagConfig} flagConfig - Feature flag configuration
 * @returns {boolean}
 */
const isFeatureEnabled = flagConfig => {
	if (!browser) return false

	const { key: flagName, defaultValue } = flagConfig

	// Check environment variable (VITE_ prefix)
	const envValue = import.meta.env[`VITE_${flagName}`]
	const isEnabled = envValue === 'true' || envValue === '1' || envValue === true || envValue === 1

	if (isEnabled) {
		console.info(
			`🚩 Feature flag "${flagName}" enabled via environment variable (VITE_${flagName}=${envValue})`
		)
		return true
	}

	// Check if disabled explicitly or use default
	if (envValue === undefined || envValue === null) {
		if (defaultValue) {
			console.info(`🚩 Feature flag "${flagName}" using default value (${defaultValue})`)
			return defaultValue
		}
	}

	// Default: disabled
	console.info(`🚩 Feature flag "${flagName}" disabled (VITE_${flagName}: ${envValue})`)
	return false
}

/**
 * Create feature flag store
 */
const createFeatureFlagStore = () => {
	// Initialize all feature flags from config
	const initialState = Object.entries(FEATURE_FLAGS).reduce((acc, [_key, config]) => {
		acc[config.key] = isFeatureEnabled(config)
		return acc
	}, {})

	const { subscribe } = writable(initialState)

	return {
		subscribe,
		FLAGS, // Legacy compatibility
		FEATURE_FLAGS, // New config access

		/**
		 * Check if a specific feature is enabled
		 * @param {string} flagName - Flag name from FLAGS (e.g., 'ENABLE_PRACTICE_ADOPTION')
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
