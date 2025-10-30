# Google Analytics 4 (GA4) Subdomain Tracking Research

## Executive Summary

This document provides comprehensive research findings on implementing Google Analytics 4 to track both `minimumcd.org` (main site) and `practices.minimumcd.org` (this repository) under a single GA4 property.

**Key Finding**: GA4 automatically handles subdomain tracking without requiring cross-domain configuration. You only need to use the same GA4 Measurement ID across all subdomains.

---

## Table of Contents

1. [GA4 Subdomain Tracking Overview](#ga4-subdomain-tracking-overview)
2. [Configuration Requirements](#configuration-requirements)
3. [Implementation for SvelteKit](#implementation-for-sveltekit)
4. [Cookie Domain Handling](#cookie-domain-handling)
5. [Reporting & Analytics](#reporting--analytics)
6. [Privacy & GDPR Considerations](#privacy--gdpr-considerations)
7. [Implementation Recommendations](#implementation-recommendations)
8. [Code Examples](#code-examples)

---

## GA4 Subdomain Tracking Overview

### How GA4 Handles Subdomains

**Good News**: GA4 treats subdomains of the same domain automatically when using the same Measurement ID.

- **No cross-domain tracking needed** for subdomains under the same parent domain
- GA4 cookies are written to the main domain by default (e.g., `.minimumcd.org`)
- These cookies are automatically accessible to all subdomains
- GA4's `cookie_domain` parameter defaults to `"auto"`, which handles this automatically

### When Cross-Domain Tracking Is NOT Needed

Cross-domain tracking is **only** required for different top-level domains (e.g., `minimumcd.org` and `example.com`). For subdomains like:

- `minimumcd.org`
- `practices.minimumcd.org`
- `www.minimumcd.org`

You do **NOT** need cross-domain tracking configuration.

### Sources

- [Analytics Mania - Subdomain Tracking with GA4 (2025)](https://www.analyticsmania.com/post/subdomain-tracking-with-google-analytics-and-google-tag-manager/)
- [Analytify - GA4 Subdomain Tracking Explained (2025)](https://analytify.io/ga4-subdomain-tracking/)
- [Google Official Documentation - Cross-domain measurement](https://support.google.com/analytics/answer/10071811?hl=en)

---

## Configuration Requirements

### 1. Single GA4 Property & Data Stream

**Critical Requirement**: Use ONE GA4 property and ONE web data stream for all subdomains.

- ❌ **Do NOT** create separate data streams for each subdomain
- ✅ **Do** use the same Measurement ID across all subdomains

### 2. GA4 Measurement ID Format

- Format: `G-XXXXXXXXXX` (starts with "G-")
- Example: `G-ABC1234567`
- This same ID must be used on both `minimumcd.org` and `practices.minimumcd.org`

### 3. Cookie Domain Configuration

GA4 supports a `cookie_domain` parameter:

- Default value: `"auto"`
- This automatically sets cookies at the top-level domain
- Cookies are set with a leading dot (e.g., `.minimumcd.org`)
- All subdomains can access these cookies

**Optional explicit configuration**:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
	cookie_domain: 'auto' // This is the default, usually not needed
})
```

---

## Implementation for SvelteKit

### Current Project Structure

The `interactive-cd` project uses:

- **Framework**: SvelteKit with Vite
- **Adapter**: `@sveltejs/adapter-netlify`
- **Files**:
  - `/Users/bryan/_git/interactive-cd/src/app.html` - Base HTML template
  - `/Users/bryan/_git/interactive-cd/src/routes/+layout.svelte` - Root layout
  - `/Users/bryan/_git/interactive-cd/.env.example` - Already has `VITE_GA_MEASUREMENT_ID`

### Implementation Approaches

#### Option 1: Direct Embedding in `app.html` (Recommended for Simple Setup)

**Pros**:

- Simplest implementation
- Works immediately on all pages
- No reactive state needed
- Tracks page views automatically on navigation

**Cons**:

- Less control over initialization timing
- Harder to conditionally enable/disable

#### Option 2: Component-Based in `+layout.svelte` (Recommended for GDPR/Consent)

**Pros**:

- Better control over initialization
- Can delay loading until user consent
- Can track SvelteKit page navigation reactively
- Easier to disable in development

**Cons**:

- Slightly more complex
- Requires understanding of Svelte reactivity

### Best Practice for This Project

Given the project's emphasis on **BDD, TDD, and clean architecture**, I recommend **Option 2 (Component-Based)** for the following reasons:

1. **Testability**: Easier to test and mock
2. **Feature Flag Support**: Already uses `VITE_` environment variables
3. **GDPR Compliance**: Easier to add consent management later
4. **Development Control**: Can disable in development/test environments

---

## Cookie Domain Handling

### How GA4 Cookies Work Across Subdomains

When GA4 is properly configured:

1. **Cookie Creation**: GA4 creates cookies with names like:
   - `_ga` (client ID cookie)
   - `_ga_<container-id>` (session tracking, e.g., `_ga_ABC1234567`)

2. **Cookie Domain**: Set to `.minimumcd.org` (note the leading dot)

3. **Subdomain Access**: All subdomains can read/write these cookies:
   - `minimumcd.org`
   - `practices.minimumcd.org`
   - `www.minimumcd.org`

4. **User Tracking**: Same user visiting both domains maintains the same Client ID

### Verification Steps

After implementation, verify cookies are set correctly:

1. Visit `practices.minimumcd.org`
2. Open browser DevTools → Application → Cookies
3. Check for `_ga` cookies
4. Verify the **Domain** column shows `.minimumcd.org` (with leading dot)

---

## Reporting & Analytics

### Viewing Subdomain Traffic in GA4

#### Using the Hostname Dimension

GA4 automatically collects the `hostname` dimension for every page view. To view subdomain-specific data:

1. **In Standard Reports**:
   - Go to **Reports** → **Engagement** → **Pages and screens**
   - Click the **+** button in the first column
   - Search for and select **Hostname**
   - Data will show traffic split by subdomain

2. **In Exploration Reports**:
   - Go to **Explore** → **Free Form Exploration**
   - Add **Hostname** as a dimension
   - Add metrics like Users, Sessions, Page Views
   - Filter by specific hostnames

#### Creating Filters

To view only traffic from a specific subdomain:

1. Click **Add filter** in any report
2. Select **Hostname** dimension
3. Choose match type: **exactly matches**
4. Enter: `practices.minimumcd.org`

#### Example Report Segments

Create custom segments for:

- All traffic: No filter
- Main site only: `hostname = minimumcd.org`
- Practices site only: `hostname = practices.minimumcd.org`
- Exclude www: `hostname != www.minimumcd.org`

### Best Practices for Reporting

1. **Use Hostname as a secondary dimension** in standard reports
2. **Create custom Exploration reports** for subdomain comparison
3. **Set up Comparisons** to analyze traffic differences
4. **Create custom reports** for stakeholders showing subdomain metrics

### Sources

- [Go Fish Digital - How To Track Subdomains In GA4](https://gofishdigital.com/blog/a-guide-to-ga4-subdomain-tracking/)
- [Vakulski Group - How to use a hostname filter in GA4](https://www.vakulski-group.com/blog/post/how-to-use-a-hostname-filter-in-ga4/)

---

## Privacy & GDPR Considerations

### GDPR Compliance Status

**Important**: Google Analytics 4 is **not fully GDPR-compliant** by default. Website owners must take additional steps.

### Required Steps for GDPR Compliance

#### 1. Implement Cookie Consent

**Requirement**: Users must provide explicit, affirmative consent before GA4 cookies are set.

**Best Practice**:

```javascript
// Default: Deny consent
gtag('consent', 'default', {
	ad_storage: 'denied',
	analytics_storage: 'denied'
})

// After user grants consent
gtag('consent', 'update', {
	ad_storage: 'granted',
	analytics_storage: 'granted'
})
```

#### 2. Use Google Consent Mode V2

**Benefits**:

- Adjusts GA4 behavior based on user consent
- Allows privacy-preserving measurement without cookies (if consent denied)
- Complies with GDPR/ePrivacy requirements

**Implementation**:

```javascript
gtag('consent', 'default', {
	ad_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
	analytics_storage: 'denied'
})
```

#### 3. Deploy a Consent Management Platform (CMP)

**Options**:

- [CookieYes](https://www.cookieyes.com/)
- [OneTrust](https://www.onetrust.com/)
- [Cookiebot](https://www.cookiebot.com/)
- [Termly](https://termly.io/)
- Custom implementation

**Features Required**:

- Display consent banner on first visit
- Granular cookie categories (necessary, analytics, marketing)
- Easy consent withdrawal
- Respect "Do Not Track" signals

#### 4. Create Privacy Documentation

**Required Documents**:

1. **Privacy Policy**
   - Explain what data GA4 collects
   - How data is used
   - Data retention periods
   - User rights (access, deletion, export)

2. **Cookie Policy**
   - List all cookies used
   - Purpose of each cookie
   - Duration/expiration
   - Third-party cookies (GA4)

#### 5. Configure GA4 Settings

**Data Retention**:

- Go to **Admin** → **Data Settings** → **Data Retention**
- Options: 2 months or 14 months
- Shorter retention = better GDPR compliance

**IP Anonymization**:

- GA4 anonymizes IP addresses by default (no configuration needed)

**User Deletion**:

- GA4 supports user data deletion requests
- Go to **Admin** → **Data Deletion Requests**

### Privacy-Focused Features in GA4

GA4 includes several privacy improvements over Universal Analytics:

1. **IP Anonymization by Default**: No configuration needed
2. **No User ID tracking**: Unless explicitly enabled
3. **Consent Mode**: Adjusts tracking based on user consent
4. **Data Deletion API**: Allows deletion of individual user data
5. **Shorter Data Retention**: Options for 2-14 months

### Implementation Considerations for This Project

Given this project is about **Continuous Delivery best practices**, consider:

1. **Start Simple**: Implement basic GA4 without consent (for testing)
2. **Document Privacy Requirements**: In a `docs/PRIVACY.md` file
3. **Plan for Consent Mode**: Design but don't implement yet
4. **Use Environment Variables**: Easy to disable analytics in dev/test
5. **Follow GDPR Best Practices**: Even if not required, it's good practice

### Sources

- [SecurePrivacy - Google Analytics GDPR Compliance 2024](https://secureprivacy.ai/blog/google-analytics-4-gdpr-compliance)
- [CookieScript - Is GA4 GDPR Compliant?](https://cookie-script.com/blog/google-analytics-4-and-gdpr)
- [TermsFeed - GDPR and Google Analytics 4](https://www.termsfeed.com/blog/gdpr-google-analytics-ga4/)
- [Google - Consent Mode Implementation](https://secureprivacy.ai/blog/google-consent-mode-analytics-implementation)

---

## Implementation Recommendations

### Phase 1: Basic Implementation (Immediate)

**Goal**: Get GA4 tracking working on `practices.minimumcd.org`

**Steps**:

1. Obtain GA4 Measurement ID from main site owner
2. Add to `.env.production`:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Implement component-based approach in `+layout.svelte`
4. Deploy to staging and verify cookies
5. Deploy to production

**Estimated Effort**: 1-2 hours

### Phase 2: Testing & Verification (After Phase 1)

**Goal**: Ensure tracking works correctly across both domains

**Steps**:

1. Verify cookies are set correctly (`.minimumcd.org` domain)
2. Check GA4 Real-time reports for traffic from both domains
3. Test page navigation tracking
4. Verify hostname dimension shows correct values
5. Create custom reports for subdomain analysis

**Estimated Effort**: 2-3 hours

### Phase 3: Privacy & Consent (Future)

**Goal**: Implement GDPR-compliant consent management

**Steps**:

1. Research CMP options
2. Implement Google Consent Mode V2
3. Create Privacy Policy and Cookie Policy
4. Add consent banner
5. Test consent acceptance/rejection flows
6. Document privacy setup in `docs/PRIVACY.md`

**Estimated Effort**: 4-8 hours (depending on CMP choice)

### Phase 4: Advanced Analytics (Optional)

**Goal**: Enhanced tracking and custom events

**Steps**:

1. Define custom events (e.g., "practice_adopted", "export_clicked")
2. Implement event tracking
3. Create custom dimensions
4. Set up conversion tracking
5. Configure enhanced measurement

**Estimated Effort**: 4-6 hours

---

## Code Examples

### Example 1: Simple Implementation in `app.html`

**File**: `src/app.html`

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<!-- ... existing head content ... -->

		<!-- Google Analytics 4 -->
		%sveltekit.env.PUBLIC_GA_MEASUREMENT_ID%
		<script
			async
			src="https://www.googletagmanager.com/gtag/js?id=%sveltekit.env.PUBLIC_GA_MEASUREMENT_ID%"
		></script>
		<script>
			window.dataLayer = window.dataLayer || []
			function gtag() {
				dataLayer.push(arguments)
			}
			gtag('js', new Date())
			gtag('config', '%sveltekit.env.PUBLIC_GA_MEASUREMENT_ID%')
		</script>

		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

**Note**: This approach requires using `PUBLIC_` prefix for environment variables accessible in `app.html`.

---

### Example 2: Component-Based Implementation (RECOMMENDED)

**File**: `src/lib/components/GoogleAnalytics.svelte`

```svelte
<script>
  import { browser } from '$app/environment'
  import { page } from '$app/stores'

  /**
   * Google Analytics Measurement ID (format: G-XXXXXXXXXX)
   */
  export let measurementId

  /**
   * Enable or disable analytics (useful for development)
   */
  export let enabled = true

  /**
   * Initialize Google Analytics
   */
  function initializeGA() {
    if (!browser || !enabled || !measurementId) return

    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || []

    // Define gtag function
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }

    // Initialize with current date
    window.gtag('js', new Date())

    // Configure with measurement ID
    window.gtag('config', measurementId, {
      // Optional: Add custom configuration
      send_page_view: true,
      cookie_domain: 'auto', // Default, handles subdomains automatically
    })

    console.log('[GA4] Initialized:', measurementId)
  }

  /**
   * Track page view when URL changes
   */
  function trackPageView(url) {
    if (!browser || !enabled || typeof window.gtag === 'undefined') return

    window.gtag('config', measurementId, {
      page_path: url.pathname,
      page_title: document.title,
    })

    console.log('[GA4] Page view:', url.pathname)
  }

  // Initialize on component mount
  $: if (browser && enabled && measurementId) {
    initializeGA()
  }

  // Track page changes
  $: if (browser && enabled && $page.url) {
    trackPageView($page.url)
  }
</script>

{#if browser && enabled && measurementId}
  <svelte:head>
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id={measurementId}"
    ></script>
  </svelte:head>
{/if}
```

**File**: `src/routes/+layout.svelte` (updated)

```svelte
<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import CategoryLegend from '$lib/components/CategoryLegend.svelte'
	import LegendSpacer from '$lib/components/LegendSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import Menu from '$lib/components/Menu.svelte'
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { menuStore } from '$lib/stores/menuStore.js'
	import { exportAdoptionState } from '$lib/utils/exportImport.js'
	import { get } from 'svelte/store'
	import { version } from '../../package.json'
	import { env } from '$env/dynamic/public'
	import '../app.css'

	/**
	 * Children snippet for layout content (Svelte 5)
	 */
	const { children } = $props()

	let totalPracticesCount = $state(0)

	/**
	 * Subscribe to menu store to get expanded state
	 */
	const isExpanded = $derived($menuStore.isExpanded)

	/**
	 * Google Analytics Configuration
	 */
	const gaMeasurementId = env.PUBLIC_GA_MEASUREMENT_ID || import.meta.env.VITE_GA_MEASUREMENT_ID
	const gaEnabled = !!gaMeasurementId && import.meta.env.PROD

	onMount(async () => {
		// Register service worker for cache management
		if (browser && 'serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/service-worker.js')
				console.log('Service Worker registered:', registration.scope)

				// Listen for updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing
					if (newWorker) {
						newWorker.addEventListener('statechange', () => {
							if (newWorker.state === 'activated') {
								console.log('New Service Worker activated - reloading for fresh content')
								window.location.reload()
							}
						})
					}
				})
			} catch (error) {
				console.error('Service Worker registration failed:', error)
			}
		}

		// Load practice data for total count
		loadPracticeData()
	})

	const loadPracticeData = async () => {
		try {
			const response = await fetch('/api/practices/tree?root=continuous-delivery')
			const result = await response.json()

			if (result.success) {
				// eslint-disable-next-line svelte/prefer-svelte-reactivity -- temporary Set, not reactive state
				const allIds = new Set()
				const extractIds = node => {
					allIds.add(node.id)
					if (node.dependencies) {
						node.dependencies.forEach(extractIds)
					}
				}
				extractIds(result.data)

				totalPracticesCount = allIds.size
			}
		} catch (error) {
			console.error('Failed to load practice data:', error)
		}
	}

	const handleExport = () => {
		const adoptedPractices = get(adoptionStore)
		exportAdoptionState(adoptedPractices, totalPracticesCount, version)
	}
</script>

<SEO />

<!-- Google Analytics 4 -->
{#if gaEnabled}
	<GoogleAnalytics measurementId={gaMeasurementId} enabled={gaEnabled} />
{/if}

<!-- Menu Sidebar (now handles import internally) -->
<Menu onExport={handleExport} />

<Header />
<HeaderSpacer />
<CategoryLegend />
<LegendSpacer />

<!-- Main content area with dynamic sidebar spacing -->
<main class="min-h-screen transition-all duration-300 {isExpanded ? 'ml-64' : 'ml-16'}">
	{@render children()}
</main>
```

---

### Example 3: With GDPR Consent Mode (Future Implementation)

**File**: `src/lib/components/GoogleAnalytics.svelte` (with consent)

```svelte
<script>
  import { browser } from '$app/environment'
  import { page } from '$app/stores'

  export let measurementId
  export let enabled = true
  export let requireConsent = true

  let consentGranted = $state(false)

  function initializeGA() {
    if (!browser || !enabled || !measurementId) return

    window.dataLayer = window.dataLayer || []

    window.gtag = function () {
      window.dataLayer.push(arguments)
    }

    window.gtag('js', new Date())

    // Set default consent state (denied)
    if (requireConsent) {
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })
    }

    // Configure GA4
    window.gtag('config', measurementId, {
      send_page_view: true,
      cookie_domain: 'auto',
    })

    console.log('[GA4] Initialized (consent mode enabled)')
  }

  function grantConsent() {
    if (!browser || typeof window.gtag === 'undefined') return

    window.gtag('consent', 'update', {
      ad_storage: 'denied', // Keep ads denied
      analytics_storage: 'granted', // Grant analytics
    })

    consentGranted = true
    console.log('[GA4] Consent granted')
  }

  function trackPageView(url) {
    if (!browser || !enabled || typeof window.gtag === 'undefined') return
    if (requireConsent && !consentGranted) return

    window.gtag('config', measurementId, {
      page_path: url.pathname,
      page_title: document.title,
    })
  }

  $: if (browser && enabled && measurementId) {
    initializeGA()
  }

  $: if (browser && enabled && $page.url) {
    trackPageView($page.url)
  }

  // Expose consent functions globally for consent banner
  if (browser) {
    window.grantGAConsent = grantConsent
  }
</script>

{#if browser && enabled && measurementId}
  <svelte:head>
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id={measurementId}"
    ></script>
  </svelte:head>
{/if}
```

---

### Example 4: Custom Event Tracking

**File**: `src/lib/utils/analytics.js`

```javascript
/**
 * Track a custom event in Google Analytics
 * @param {string} eventName - Name of the event (e.g., 'practice_adopted')
 * @param {Object} eventParams - Additional parameters
 */
export function trackEvent(eventName, eventParams = {}) {
	if (typeof window === 'undefined' || typeof window.gtag === 'undefined') {
		console.warn('[GA4] Event tracking not available:', eventName)
		return
	}

	window.gtag('event', eventName, eventParams)
	console.log('[GA4] Event tracked:', eventName, eventParams)
}

/**
 * Track practice adoption
 * @param {string} practiceId - ID of the practice
 * @param {string} practiceTitle - Title of the practice
 * @param {string} category - Practice category
 */
export function trackPracticeAdoption(practiceId, practiceTitle, category) {
	trackEvent('practice_adopted', {
		practice_id: practiceId,
		practice_title: practiceTitle,
		category: category
	})
}

/**
 * Track export action
 * @param {number} adoptedCount - Number of adopted practices
 * @param {number} totalCount - Total number of practices
 */
export function trackExport(adoptedCount, totalCount) {
	trackEvent('export_adoption', {
		adopted_count: adoptedCount,
		total_count: totalCount,
		adoption_percentage: Math.round((adoptedCount / totalCount) * 100)
	})
}

/**
 * Track import action
 * @param {number} importedCount - Number of practices imported
 */
export function trackImport(importedCount) {
	trackEvent('import_adoption', {
		imported_count: importedCount
	})
}
```

**Usage Example**:

```svelte
<script>
	import { trackPracticeAdoption } from '$lib/utils/analytics.js'

	function handleAdoptPractice(practice) {
		// ... existing adoption logic ...

		// Track in GA4
		trackPracticeAdoption(practice.id, practice.title, practice.category)
	}
</script>
```

---

### Example 5: Environment Variable Configuration

**File**: `.env.example` (already exists, update if needed)

```bash
# Google Analytics Configuration
# GA4 Measurement ID for tracking (format: G-XXXXXXXXXX)
# Leave empty to disable analytics in development
# In production (Netlify), set this environment variable to enable tracking
# This supports subdomain tracking under the same GA property
VITE_GA_MEASUREMENT_ID=

# Alternative for SvelteKit (if using PUBLIC_ prefix)
PUBLIC_GA_MEASUREMENT_ID=
```

**File**: `.env.production`

```bash
# Production-only GA configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**File**: `.env` (local development)

```bash
# Leave empty to disable analytics in development
VITE_GA_MEASUREMENT_ID=
```

---

## Testing Recommendations

### Unit Tests for Analytics Component

**File**: `src/lib/components/GoogleAnalytics.test.js`

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import GoogleAnalytics from './GoogleAnalytics.svelte'

describe('GoogleAnalytics Component', () => {
	beforeEach(() => {
		// Mock browser environment
		global.window = {
			dataLayer: []
		}
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('does not initialize when measurementId is missing', () => {
		const { container } = render(GoogleAnalytics, {
			props: { measurementId: '' }
		})

		expect(window.dataLayer).toHaveLength(0)
	})

	it('does not initialize when disabled', () => {
		const { container } = render(GoogleAnalytics, {
			props: {
				measurementId: 'G-TEST123',
				enabled: false
			}
		})

		expect(window.dataLayer).toHaveLength(0)
	})

	it('initializes when enabled with valid ID', () => {
		const { container } = render(GoogleAnalytics, {
			props: {
				measurementId: 'G-TEST123',
				enabled: true
			}
		})

		// Check that gtag function is defined
		expect(typeof window.gtag).toBe('function')
	})
})
```

### E2E Tests for Analytics

**File**: `tests/e2e/analytics.spec.js`

```javascript
import { test, expect } from '@playwright/test'

test.describe('Google Analytics', () => {
	test('should load GA4 script in production', async ({ page }) => {
		// Skip in development
		if (!process.env.VITE_GA_MEASUREMENT_ID) {
			test.skip()
		}

		await page.goto('/')

		// Check for GA4 script
		const gaScript = await page.locator('script[src*="googletagmanager.com/gtag"]')
		await expect(gaScript).toBeAttached()
	})

	test('should set GA4 cookies', async ({ page, context }) => {
		// Skip in development
		if (!process.env.VITE_GA_MEASUREMENT_ID) {
			test.skip()
		}

		await page.goto('/')
		await page.waitForTimeout(2000) // Wait for GA to initialize

		// Get cookies
		const cookies = await context.cookies()

		// Check for _ga cookie
		const gaCookie = cookies.find(c => c.name === '_ga')
		expect(gaCookie).toBeDefined()

		// Verify cookie domain (should be .minimumcd.org)
		expect(gaCookie.domain).toMatch(/^\.?minimumcd\.org$/)
	})

	test('should track page views on navigation', async ({ page }) => {
		// Skip in development
		if (!process.env.VITE_GA_MEASUREMENT_ID) {
			test.skip()
		}

		// Listen for gtag calls
		const gtagCalls = []
		await page.exposeFunction('captureGtagCall', (...args) => {
			gtagCalls.push(args)
		})

		await page.addInitScript(() => {
			const originalGtag = window.gtag
			window.gtag = function (...args) {
				window.captureGtagCall(...args)
				if (originalGtag) originalGtag(...args)
			}
		})

		await page.goto('/')
		await page.waitForTimeout(1000)

		// Navigate to another page
		await page.click('a[href="/practices"]')
		await page.waitForTimeout(1000)

		// Verify gtag was called for page view
		const pageViewCalls = gtagCalls.filter(call => call[0] === 'config')
		expect(pageViewCalls.length).toBeGreaterThan(0)
	})
})
```

---

## Common Pitfalls to Avoid

### 1. Creating Multiple Data Streams

❌ **Don't**: Create separate data streams for each subdomain
✅ **Do**: Use one data stream for all subdomains

### 2. Forgetting the Same Measurement ID

❌ **Don't**: Use different Measurement IDs on different subdomains
✅ **Do**: Use the exact same ID everywhere

### 3. Not Checking Cookie Domain

❌ **Don't**: Assume cookies work without verification
✅ **Do**: Check DevTools to verify `.minimumcd.org` domain

### 4. Enabling Analytics in Tests

❌ **Don't**: Load GA4 in E2E tests or unit tests
✅ **Do**: Use environment variables to disable in test environments

### 5. Hardcoding the Measurement ID

❌ **Don't**: Put the ID directly in code
✅ **Do**: Use environment variables

### 6. Ignoring GDPR

❌ **Don't**: Assume GA4 is automatically compliant
✅ **Do**: Implement proper consent management

### 7. Not Testing in Production

❌ **Don't**: Deploy without verifying tracking works
✅ **Do**: Test in staging first, then verify in production

---

## Verification Checklist

After implementation, verify the following:

### Cookies

- [ ] `_ga` cookie is present
- [ ] Cookie domain is `.minimumcd.org` (with leading dot)
- [ ] Cookie is accessible from both `minimumcd.org` and `practices.minimumcd.org`

### GA4 Reports

- [ ] Real-time report shows traffic from `practices.minimumcd.org`
- [ ] Hostname dimension shows correct subdomain
- [ ] Page views are tracked on navigation
- [ ] No duplicate page views

### Development Environment

- [ ] Analytics is disabled in development (no Measurement ID)
- [ ] No console errors related to GA4
- [ ] E2E tests pass without GA4 interference

### Production Environment

- [ ] Analytics loads correctly
- [ ] Traffic appears in GA4 within 24 hours
- [ ] Both subdomains show in hostname reports

---

## Next Steps

1. **Immediate**: Coordinate with `minimumcd.org` owner to get GA4 Measurement ID
2. **Week 1**: Implement component-based approach in this repository
3. **Week 2**: Deploy to staging and verify tracking
4. **Week 3**: Deploy to production and monitor for 7 days
5. **Month 2**: Research and plan GDPR consent implementation
6. **Month 3**: Implement consent management (if needed)

---

## Additional Resources

### Official Documentation

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Cross-domain Measurement](https://support.google.com/analytics/answer/10071811)
- [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)

### Community Resources

- [Joy of Code - Google Analytics with SvelteKit](https://joyofcode.xyz/sveltekit-google-analytics)
- [Analytics Mania - GA4 Subdomain Tracking](https://www.analyticsmania.com/post/subdomain-tracking-with-google-analytics-and-google-tag-manager/)
- [Simo Ahava - Cross-domain Tracking in GA4](https://www.simoahava.com/gtm-tips/cross-domain-tracking-google-analytics-4/)

### Tools

- [Google Tag Assistant](https://tagassistant.google.com/)
- [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
- [Cookie Inspector](https://chrome.google.com/webstore/detail/cookie-inspector/)

---

## Conclusion

Implementing GA4 subdomain tracking for `minimumcd.org` and `practices.minimumcd.org` is straightforward:

1. **Use the same GA4 Measurement ID** on both domains
2. **No cross-domain configuration needed** (GA4 handles subdomains automatically)
3. **Implement in SvelteKit** using a component-based approach
4. **Verify cookies** are set to `.minimumcd.org`
5. **Use hostname dimension** in GA4 reports to filter subdomain traffic
6. **Plan for GDPR compliance** if targeting EU users

The recommended implementation uses a reusable `GoogleAnalytics.svelte` component in the root layout, controlled by environment variables, with future support for consent management.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-29
**Author**: Research Agent (Hive Mind Collective)
**Status**: Complete
