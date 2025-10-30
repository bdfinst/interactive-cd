<script>
	/**
	 * Google Analytics Component
	 *
	 * Manages Google Analytics tracking for the application
	 * Follows Svelte and functional programming best practices:
	 * - Uses lifecycle hooks properly
	 * - Handles SSR gracefully
	 * - Pure functions for logic
	 * - Proper cleanup
	 * - Environment-based configuration
	 */

	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import {
		shouldEnableAnalytics,
		createGtagScript,
		initializeDataLayer,
		createGtagConfig,
		safeGtagCall,
		trackPageView,
		getPageData
	} from '$lib/utils/analytics.js'

	/**
	 * Component props
	 * measurementId can be passed as prop or will use environment variable
	 */
	const { measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID } = $props()

	/**
	 * Track whether analytics is initialized
	 */
	let analyticsInitialized = $state(false)

	/**
	 * Initialize Google Analytics on component mount
	 * Only runs in browser, not during SSR
	 */
	onMount(() => {
		// Check if analytics should be enabled
		if (!shouldEnableAnalytics(measurementId, browser)) {
			console.info('[Analytics] Disabled: Invalid measurement ID or not in browser')
			return
		}

		try {
			// Step 1: Create and append the gtag script
			const script = createGtagScript(measurementId)
			if (!script) {
				console.error('[Analytics] Failed to create gtag script')
				return
			}

			// Step 2: Initialize data layer before script loads
			initializeDataLayer(window)

			// Step 3: Configure gtag with initial settings
			const config = createGtagConfig(measurementId, {
				sendPageView: false // We'll send page views manually via SvelteKit
			})

			// Use gtag to set up the initial configuration
			safeGtagCall(window, 'js', new Date())
			safeGtagCall(window, 'config', config.measurementId, config.config)

			// Step 4: Append script to document
			document.head.appendChild(script)

			analyticsInitialized = true
			console.info('[Analytics] Initialized successfully:', measurementId)

			// Step 5: Track initial page view
			const pageData = getPageData(window, document)
			trackPageView(window, pageData)
		} catch (error) {
			console.error('[Analytics] Initialization error:', error)
		}
	})

	/**
	 * Track page views when route changes
	 * Reactive statement that runs when $page changes
	 */
	$effect(() => {
		// Access $page.url to make this reactive
		const currentUrl = $page.url

		// Only track if analytics is initialized and we're in the browser
		if (analyticsInitialized && browser && currentUrl) {
			const pageData = getPageData(window, document)
			trackPageView(window, pageData)
		}
	})
</script>

<!--
  This component doesn't render any visible content
  It only manages the Google Analytics tracking script
-->
