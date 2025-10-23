/**
 * Dev mode detection utility
 *
 * Pure functions for detecting development environment in Vite/SvelteKit applications.
 * Uses Vite's built-in import.meta.env for zero-config detection.
 *
 * In production builds, Vite tree-shakes away all dev mode code for zero runtime overhead.
 */

/**
 * Checks if the application is running in development mode
 *
 * @returns {boolean} true if in development mode, false otherwise
 *
 * @example
 * if (isDevMode()) {
 *   console.log('Running in development')
 * }
 */
export const isDevMode = () => {
	// Vite provides import.meta.env.DEV automatically
	// It's true during 'vite' or 'vite dev'
	// It's false during 'vite build' or in production
	return import.meta.env.DEV
}

/**
 * Determines if audit indicators should be displayed
 *
 * This is a semantic wrapper around isDevMode() for clarity
 * and future extensibility (e.g., could add user preference override)
 *
 * @returns {boolean} true if audit indicators should be shown
 *
 * @example
 * {#if shouldShowAuditIndicators()}
 *   <AuditBadge audited={practice.audited} />
 * {/if}
 */
export const shouldShowAuditIndicators = () => isDevMode()

/**
 * Gets the current environment name
 *
 * @returns {string} 'development', 'production', or custom mode
 *
 * @example
 * const env = getEnvironment() // 'development'
 */
export const getEnvironment = () => {
	return import.meta.env.MODE
}

/**
 * Checks if running in production mode
 *
 * @returns {boolean} true if in production
 */
export const isProdMode = () => {
	return import.meta.env.PROD
}
