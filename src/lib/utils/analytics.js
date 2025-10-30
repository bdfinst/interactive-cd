/**
 * Google Analytics Utilities
 *
 * Pure functions for managing Google Analytics tracking
 * Follows functional programming principles:
 * - Pure functions with no side effects (except gtag calls which are necessary)
 * - Immutable data
 * - Error handling with fallbacks
 * - Testable and composable
 */

/**
 * Validates a GA4 measurement ID format
 * @param {string} measurementId - The GA4 measurement ID to validate
 * @returns {boolean} True if the format is valid (G-XXXXXXXXXX)
 *
 * @example
 * isValidMeasurementId('G-ABC123DEF4') // true
 * isValidMeasurementId('UA-123456-1') // false (old Universal Analytics)
 * isValidMeasurementId('') // false
 */
export const isValidMeasurementId = measurementId => {
	if (typeof measurementId !== 'string') {
		return false
	}
	// GA4 format: G- followed by 10 alphanumeric characters
	const ga4Pattern = /^G-[A-Z0-9]{10}$/
	return ga4Pattern.test(measurementId)
}

/**
 * Checks if analytics should be enabled based on environment
 * @param {string} measurementId - The GA4 measurement ID
 * @param {boolean} isBrowser - Whether code is running in browser
 * @returns {boolean} True if analytics should be enabled
 *
 * @example
 * shouldEnableAnalytics('G-ABC123DEF4', true) // true
 * shouldEnableAnalytics('', true) // false
 * shouldEnableAnalytics('G-ABC123DEF4', false) // false (SSR)
 */
export const shouldEnableAnalytics = (measurementId, isBrowser) => {
	return isBrowser && isValidMeasurementId(measurementId)
}

/**
 * Creates a script element for Google Analytics
 * Pure function that returns DOM element (side effects handled by caller)
 * @param {string} measurementId - The GA4 measurement ID
 * @returns {HTMLScriptElement | null} Script element or null if invalid
 */
export const createGtagScript = measurementId => {
	if (!isValidMeasurementId(measurementId)) {
		return null
	}

	const script = document.createElement('script')
	script.async = true
	script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
	return script
}

/**
 * Initializes gtag data layer
 * Note: This function has side effects (modifies window.dataLayer)
 * Separated for easier testing and control
 * @param {Window} windowObj - The window object (injected for testability)
 * @returns {void}
 */
export const initializeDataLayer = windowObj => {
	if (typeof windowObj !== 'object' || !windowObj) {
		console.warn('[Analytics] Invalid window object provided')
		return
	}

	windowObj.dataLayer = windowObj.dataLayer || []
	windowObj.gtag = function gtag() {
		windowObj.dataLayer.push(arguments)
	}
}

/**
 * Configures Google Analytics with initial settings
 * @param {string} measurementId - The GA4 measurement ID
 * @param {object} config - Configuration options
 * @param {boolean} config.sendPageView - Whether to send initial page view
 * @param {object} config.customParams - Additional custom parameters
 * @returns {object} Configuration object for gtag
 */
export const createGtagConfig = (measurementId, config = {}) => {
	const { sendPageView = true, customParams = {} } = config

	return {
		measurementId,
		config: {
			send_page_view: sendPageView,
			// Enable subdomain tracking for practices.minimumcd.org
			// This allows tracking across main domain and subdomains
			cookie_domain: 'auto',
			cookie_flags: 'SameSite=None;Secure',
			...customParams
		}
	}
}

/**
 * Safely calls gtag function with error handling
 * @param {Window} windowObj - The window object
 * @param {string} command - The gtag command (e.g., 'config', 'event')
 * @param {...any} args - Additional arguments for gtag
 * @returns {boolean} True if call succeeded, false otherwise
 */
export const safeGtagCall = (windowObj, command, ...args) => {
	try {
		if (typeof windowObj !== 'object' || !windowObj || typeof windowObj.gtag !== 'function') {
			console.warn('[Analytics] gtag is not available')
			return false
		}

		windowObj.gtag(command, ...args)
		return true
	} catch (error) {
		console.error('[Analytics] Error calling gtag:', error)
		return false
	}
}

/**
 * Tracks a page view event
 * @param {Window} windowObj - The window object
 * @param {object} pageData - Page view data
 * @param {string} pageData.page_path - The page path
 * @param {string} pageData.page_title - The page title
 * @param {string} pageData.page_location - The full page URL
 * @returns {boolean} True if tracking succeeded
 */
export const trackPageView = (windowObj, pageData = {}) => {
	const { page_path, page_title, page_location } = pageData

	return safeGtagCall(windowObj, 'event', 'page_view', {
		page_path,
		page_title,
		page_location
	})
}

/**
 * Tracks a custom event
 * @param {Window} windowObj - The window object
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Event parameters
 * @returns {boolean} True if tracking succeeded
 */
export const trackEvent = (windowObj, eventName, eventParams = {}) => {
	if (typeof eventName !== 'string' || !eventName) {
		console.warn('[Analytics] Invalid event name provided')
		return false
	}

	return safeGtagCall(windowObj, 'event', eventName, eventParams)
}

/**
 * Gets the current page data for tracking
 * Pure function that extracts page information
 * @param {Window} windowObj - The window object
 * @param {Document} documentObj - The document object
 * @returns {object} Page data object
 */
export const getPageData = (windowObj, documentObj) => {
	if (!windowObj?.location || !documentObj) {
		return {
			page_path: '/',
			page_title: 'Unknown',
			page_location: ''
		}
	}

	return {
		page_path: windowObj.location.pathname,
		page_title: documentObj.title,
		page_location: windowObj.location.href
	}
}
