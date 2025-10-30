# Google Analytics Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for Google Analytics (GA4) implementation in the Interactive CD application. The strategy follows BDD → ATDD → TDD principles and ensures the GA tracking works correctly across all environments and scenarios.

## Table of Contents

1. [Testing Objectives](#testing-objectives)
2. [Test Coverage Areas](#test-coverage-areas)
3. [Testing Approach](#testing-approach)
4. [Manual Testing Checklist](#manual-testing-checklist)
5. [Automated Testing Strategy](#automated-testing-strategy)
6. [Environment Configuration Testing](#environment-configuration-testing)
7. [Deployment Verification](#deployment-verification)
8. [Monitoring and Validation](#monitoring-and-validation)

---

## Testing Objectives

### Primary Goals

1. **Verify GA script injection** - Ensure the GA script loads correctly in the browser
2. **Validate environment handling** - Confirm proper behavior with/without GA measurement ID
3. **Test error scenarios** - Verify graceful degradation when GA is unavailable
4. **Ensure privacy compliance** - Validate opt-out mechanisms and cookie handling
5. **Cross-browser compatibility** - Test across different browsers and devices
6. **Performance validation** - Ensure GA doesn't negatively impact page load times

### Success Criteria

- ✅ GA script loads correctly when `VITE_GA_MEASUREMENT_ID` is configured
- ✅ Application works normally when GA is not configured (graceful degradation)
- ✅ No console errors related to GA implementation
- ✅ Page views and events are tracked correctly in GA4 console
- ✅ Privacy and opt-out mechanisms work as expected
- ✅ No performance degradation due to GA implementation

---

## Test Coverage Areas

### 1. Script Injection and Loading

**What to test:**

- GA script (`gtag.js`) is injected into the document head
- Script loads successfully without errors
- `window.dataLayer` is initialized correctly
- `window.gtag` function is available

### 2. Environment Variable Handling

**Scenarios to test:**

- ✅ With valid GA measurement ID (production)
- ✅ Without GA measurement ID (development)
- ✅ With empty string measurement ID
- ✅ With invalid measurement ID format

### 3. Page View Tracking

**Events to verify:**

- Initial page load tracked
- SPA route changes tracked (SvelteKit navigation)
- Page metadata sent correctly (title, path, referrer)

### 4. Error Handling

**Scenarios to test:**

- GA script fails to load (network error, ad blocker)
- Invalid measurement ID provided
- Browser with JavaScript disabled
- Privacy/tracking blockers enabled

### 5. Browser Compatibility

**Browsers to test:**

- Chrome (Desktop & Mobile)
- Firefox
- Safari (Desktop & iOS)
- Edge
- Mobile browsers (iOS Safari, Chrome Android)

### 6. Performance Impact

**Metrics to measure:**

- Page load time with/without GA
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)

---

## Testing Approach

### Phase 1: Unit Testing (Pure Functions)

**Test the GA initialization logic in isolation**

```javascript
// tests/unit/analytics/ga-init.test.js
describe('Google Analytics Initialization', () => {
	it('should initialize when measurement ID is provided', () => {
		const measurementId = 'G-XXXXXXXXXX'
		const result = shouldInitializeGA(measurementId)
		expect(result).toBe(true)
	})

	it('should not initialize when measurement ID is missing', () => {
		const result = shouldInitializeGA(undefined)
		expect(result).toBe(false)
	})

	it('should validate measurement ID format', () => {
		expect(isValidGAMeasurementId('G-XXXXXXXXXX')).toBe(true)
		expect(isValidGAMeasurementId('UA-12345-1')).toBe(false) // Old format
		expect(isValidGAMeasurementId('')).toBe(false)
		expect(isValidGAMeasurementId('invalid')).toBe(false)
	})

	it('should build correct GA script URL', () => {
		const measurementId = 'G-TEST123'
		const url = buildGAScriptUrl(measurementId)
		expect(url).toBe(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`)
	})
})
```

### Phase 2: Component Testing (SEO Component)

**Test GA integration within the SEO component**

```javascript
// tests/unit/components/SEO.test.js (additions)
describe('SEO - Google Analytics Integration', () => {
	beforeEach(() => {
		// Clean up DOM
		document.head.innerHTML = ''
		delete window.gtag
		delete window.dataLayer
	})

	it('should inject GA script when measurement ID is provided', () => {
		const measurementId = 'G-TEST123'
		render(SEO, { props: { gaMeasurementId: measurementId } })

		const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag"]')
		expect(gaScript).toBeTruthy()
		expect(gaScript?.src).toContain(measurementId)
	})

	it('should not inject GA script when measurement ID is missing', () => {
		render(SEO, { props: { gaMeasurementId: undefined } })

		const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag"]')
		expect(gaScript).toBeNull()
	})

	it('should initialize dataLayer when GA is enabled', () => {
		render(SEO, { props: { gaMeasurementId: 'G-TEST123' } })

		expect(window.dataLayer).toBeDefined()
		expect(Array.isArray(window.dataLayer)).toBe(true)
	})

	it('should call gtag config with measurement ID', () => {
		const mockGtag = vi.fn()
		window.gtag = mockGtag

		render(SEO, { props: { gaMeasurementId: 'G-TEST123' } })

		expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123')
	})

	it('should handle script loading errors gracefully', async () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		// Simulate script error
		const script = document.createElement('script')
		script.onerror = new Event('error')

		render(SEO, { props: { gaMeasurementId: 'G-TEST123' } })

		// Should not crash application
		expect(document.body).toBeTruthy()

		consoleErrorSpy.mockRestore()
	})
})
```

### Phase 3: Integration Testing (E2E with Playwright)

**Test GA in real browser environment**

```javascript
// tests/e2e/google-analytics.spec.js
import { test, expect } from '@playwright/test'

test.describe('Google Analytics Integration', () => {
	test('should load GA script when configured', async ({ page }) => {
		// Navigate to page with GA enabled
		await page.goto('/')

		// Check if GA script is present
		const gaScript = await page.locator('script[src*="googletagmanager.com/gtag"]')
		await expect(gaScript).toBeAttached()

		// Verify dataLayer is initialized
		const dataLayerExists = await page.evaluate(() => {
			return typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)
		})
		expect(dataLayerExists).toBe(true)
	})

	test('should track page views', async ({ page }) => {
		// Listen for GA requests
		const gaRequests = []
		page.on('request', request => {
			if (request.url().includes('google-analytics.com/g/collect')) {
				gaRequests.push(request)
			}
		})

		await page.goto('/')

		// Wait for GA to send pageview
		await page.waitForTimeout(2000)

		// Verify at least one GA request was made
		expect(gaRequests.length).toBeGreaterThan(0)
	})

	test('should handle missing GA measurement ID gracefully', async ({ page }) => {
		// Test with environment where GA is not configured
		await page.goto('/')

		// Should not have GA script
		const gaScript = await page.locator('script[src*="googletagmanager.com/gtag"]')
		await expect(gaScript).not.toBeAttached()

		// Should not have console errors
		const consoleErrors = []
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text())
			}
		})

		// Navigate to another page
		await page.goto('/about')

		// No errors should be present
		expect(
			consoleErrors.filter(err => err.includes('gtag') || err.includes('analytics'))
		).toHaveLength(0)
	})

	test('should work with ad blockers', async ({ context }) => {
		// Block GA script
		await context.route('**/googletagmanager.com/**', route => route.abort())

		const page = await context.newPage()
		await page.goto('/')

		// Application should still load
		await expect(page.locator('main')).toBeVisible()

		// No JavaScript errors
		const errors = []
		page.on('pageerror', error => errors.push(error))

		await page.waitForTimeout(1000)
		expect(errors).toHaveLength(0)
	})

	test('should track SPA navigation', async ({ page }) => {
		const gaRequests = []
		page.on('request', request => {
			if (request.url().includes('google-analytics.com/g/collect')) {
				gaRequests.push({
					url: request.url(),
					timestamp: Date.now()
				})
			}
		})

		await page.goto('/')
		const initialRequests = gaRequests.length

		// Navigate to another page (SPA navigation)
		await page.click('a[href="/about"]')
		await page.waitForURL('/about')
		await page.waitForTimeout(1000)

		// Should have sent another pageview
		expect(gaRequests.length).toBeGreaterThan(initialRequests)
	})
})
```

---

## Manual Testing Checklist

### Pre-deployment Checklist

#### Development Environment

- [ ] **GA script not loaded** when `VITE_GA_MEASUREMENT_ID` is not set
- [ ] **No console errors** related to GA
- [ ] Application functions normally without GA

#### Staging/Preview Environment

- [ ] **GA script loads** with test measurement ID
- [ ] Open browser DevTools Network tab
- [ ] **Verify requests** to `google-analytics.com/g/collect`
- [ ] **Check dataLayer** in console: `window.dataLayer`
- [ ] **Verify gtag function** exists: `typeof window.gtag === 'function'`

#### Production Environment

- [ ] **GA script loads** with production measurement ID
- [ ] **No console errors** in browser DevTools
- [ ] **GA DebugView** shows real-time events (in GA4 console)
- [ ] **Page views tracked** for initial load
- [ ] **Page views tracked** for SPA navigation

### Browser Testing Matrix

| Browser | Desktop | Mobile | Status |
| ------- | ------- | ------ | ------ |
| Chrome  | ✅      | ✅     | [ ]    |
| Firefox | ✅      | N/A    | [ ]    |
| Safari  | ✅      | ✅     | [ ]    |
| Edge    | ✅      | N/A    | [ ]    |

### Network Conditions Testing

- [ ] **Fast 3G** - GA loads without blocking page render
- [ ] **Slow 3G** - GA loads asynchronously, doesn't delay page
- [ ] **Offline** - Application works, GA fails gracefully
- [ ] **Ad blocker enabled** - No errors, application works normally

### Privacy and Compliance

- [ ] **Cookie consent** (if implemented) is respected
- [ ] **Do Not Track** (if implemented) is honored
- [ ] **GDPR compliance** - User can opt out if required
- [ ] **No PII** is sent to GA (personally identifiable information)

---

## Automated Testing Strategy

### Unit Tests (Vitest)

**Location:** `/tests/unit/analytics/`

**Coverage:**

- GA initialization logic
- Measurement ID validation
- Script URL generation
- Environment variable parsing
- Pure utility functions

**Example Test Structure:**

```javascript
// tests/unit/analytics/ga-utils.test.js
import { describe, it, expect } from 'vitest'
import { isValidGAMeasurementId, shouldInitializeGA, buildGAScriptUrl } from '$lib/utils/analytics'

describe('GA Utility Functions', () => {
	describe('isValidGAMeasurementId', () => {
		it('validates correct GA4 format', () => {
			expect(isValidGAMeasurementId('G-XXXXXXXXXX')).toBe(true)
		})

		it('rejects Universal Analytics format', () => {
			expect(isValidGAMeasurementId('UA-12345-1')).toBe(false)
		})

		it('rejects invalid formats', () => {
			expect(isValidGAMeasurementId('')).toBe(false)
			expect(isValidGAMeasurementId('invalid')).toBe(false)
			expect(isValidGAMeasurementId(null)).toBe(false)
		})
	})
})
```

### Component Tests (Vitest + Testing Library)

**Location:** `/tests/unit/components/SEO.test.js`

**Coverage:**

- Script injection into DOM
- dataLayer initialization
- Error handling
- Conditional rendering based on config

### E2E Tests (Playwright)

**Location:** `/tests/e2e/google-analytics.spec.js`

**Coverage:**

- Full browser GA lifecycle
- Network request verification
- Ad blocker scenarios
- SPA navigation tracking
- Cross-browser compatibility

### Test Execution Strategy

```bash
# Run all tests
npm test                    # Unit tests only
npm run test:e2e           # E2E tests only

# Development workflow
npm run test:watch         # Watch mode for TDD

# CI/CD pipeline
npm test -- --coverage     # Unit tests with coverage
npm run test:e2e           # E2E tests on all browsers

# Specific test suites
npm test -- analytics      # Run only analytics tests
npm run test:e2e -- google-analytics.spec.js
```

---

## Environment Configuration Testing

### Test Matrix

| Environment | `VITE_GA_MEASUREMENT_ID` | Expected Behavior        |
| ----------- | ------------------------ | ------------------------ |
| Development | `undefined`              | No GA script loaded      |
| Development | `""`                     | No GA script loaded      |
| Staging     | `G-STAGING123`           | GA loads with staging ID |
| Production  | `G-PROD456`              | GA loads with prod ID    |

### Environment Files

```bash
# .env.development (local dev - no tracking)
VITE_GA_MEASUREMENT_ID=

# .env.staging (preview builds - test tracking)
VITE_GA_MEASUREMENT_ID=G-STAGING123

# .env.production (production - real tracking)
VITE_GA_MEASUREMENT_ID=G-PROD456
```

### Netlify Environment Variables

**Deployment Configuration:**

1. **Production (main branch)**
   - Set: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
   - Verify in Netlify UI: Site settings → Build & deploy → Environment

2. **Branch Deploys (feature branches)**
   - Use staging/test measurement ID or leave unset
   - Verify each deploy preview has correct behavior

3. **Deploy Preview**
   - Test GA integration before merging to main
   - Verify in browser DevTools

### Configuration Validation Script

```javascript
// scripts/validate-ga-config.js
/**
 * Validates GA configuration before deployment
 * Run in CI/CD pipeline to catch configuration errors
 */

const GA_MEASUREMENT_ID = process.env.VITE_GA_MEASUREMENT_ID

const validateGAConfig = () => {
	// Production check
	if (process.env.NODE_ENV === 'production') {
		if (!GA_MEASUREMENT_ID) {
			console.warn('⚠️  WARNING: GA_MEASUREMENT_ID not set in production')
			return false
		}

		if (!GA_MEASUREMENT_ID.startsWith('G-')) {
			console.error('❌ ERROR: Invalid GA4 measurement ID format')
			process.exit(1)
		}

		console.log('✅ GA configuration valid for production')
		return true
	}

	// Development
	console.log('ℹ️  Development mode - GA tracking disabled')
	return true
}

validateGAConfig()
```

---

## Deployment Verification

### Pre-deployment Checklist

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] GA measurement ID configured for target environment
- [ ] Manual testing completed on preview deploy
- [ ] No console errors in browser DevTools
- [ ] GA DebugView shows events (for staging/prod)

### Post-deployment Verification

#### Immediate (< 5 minutes)

1. **Open deployed site** in browser
2. **Open DevTools** (F12) → Console tab
3. **Verify no errors** related to GA or analytics
4. **Check Network tab** for GA requests
5. **Verify** `window.dataLayer` exists in console
6. **Navigate** to different pages, verify tracking continues

#### Short-term (< 1 hour)

1. **Open GA4 Console** → Reports → Realtime
2. **Verify real-time data** shows current users
3. **Check events** are being recorded
4. **Verify page titles and paths** are correct

#### Long-term (< 24 hours)

1. **Review GA4 data** for accuracy
2. **Check for anomalies** in event tracking
3. **Verify bounce rate** and engagement metrics
4. **Confirm no data gaps** or missing events

### Rollback Plan

**If GA is broken after deployment:**

1. **Check console errors** - Identify root cause
2. **Verify environment variables** - Ensure measurement ID is correct
3. **Test in preview deploy** - Reproduce issue locally
4. **Hot fix options:**
   - Revert to previous deployment
   - Disable GA temporarily (set env var to empty string)
   - Deploy fix with fast-track approval

---

## Monitoring and Validation

### Browser Console Verification

```javascript
// Run in browser DevTools console to verify GA setup

// 1. Check if GA script loaded
console.log('GA Script:', document.querySelector('script[src*="googletagmanager.com"]'))

// 2. Check dataLayer
console.log('dataLayer:', window.dataLayer)

// 3. Check gtag function
console.log('gtag:', typeof window.gtag)

// 4. Manually trigger test event
if (window.gtag) {
	window.gtag('event', 'test_event', {
		event_category: 'manual_test',
		event_label: 'console_verification'
	})
	console.log('✅ Test event sent')
}

// 5. View all dataLayer commands
console.table(window.dataLayer)
```

### Network Request Validation

**What to look for in DevTools Network tab:**

1. **Script load:** `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - Status: `200 OK`
   - Type: `script`

2. **Data collection:** `https://www.google-analytics.com/g/collect?v=2&...`
   - Status: `200 OK`
   - Type: `xhr` or `fetch`
   - Contains: `tid=G-XXXXXXXXXX` (measurement ID)

3. **Page view events:** Multiple requests with `en=page_view`

### GA4 DebugView Validation

**How to enable:**

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Open GA4 → Configure → DebugView
3. Visit your site with debugger enabled
4. See real-time events in GA4 console

**What to verify:**

- ✅ `page_view` event fires on initial load
- ✅ `page_view` fires on SPA navigation
- ✅ Correct page title and path sent
- ✅ User properties set correctly
- ✅ No error events

### Automated Monitoring (Future Enhancement)

**Potential monitoring solutions:**

1. **Synthetic monitoring** - Automated browser tests checking GA
2. **Log aggregation** - Track GA initialization failures
3. **Custom events** - Track GA load success/failure
4. **Alerts** - Notify team if GA stops working

---

## Testing Tools and Resources

### Development Tools

- **Browser DevTools** - Network tab, Console, Sources
- **Google Analytics Debugger** - Chrome extension
- **GA4 DebugView** - Real-time event viewer
- **Lighthouse** - Performance impact measurement

### Testing Frameworks

- **Vitest** - Unit and component testing
- **Testing Library** - Component behavior testing
- **Playwright** - E2E browser testing
- **axe-core** - Accessibility testing (via Playwright)

### CI/CD Integration

```yaml
# .github/workflows/test-ga.yml (example)
name: Test Google Analytics

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci

      # Unit tests
      - run: npm test -- analytics
        name: Run GA unit tests

      # E2E tests with GA enabled
      - run: npx playwright install --with-deps
      - run: npm run test:e2e -- google-analytics.spec.js
        env:
          VITE_GA_MEASUREMENT_ID: 'G-TEST123'
        name: Run GA E2E tests (enabled)

      # E2E tests with GA disabled
      - run: npm run test:e2e
        env:
          VITE_GA_MEASUREMENT_ID: ''
        name: Run E2E tests (GA disabled)
```

---

## FAQ and Troubleshooting

### Common Issues

**Q: GA script not loading in browser**

A: Check:

1. Environment variable is set correctly
2. No ad blocker is blocking the script
3. Network tab shows 200 OK response
4. No Content Security Policy (CSP) blocking script

**Q: dataLayer is undefined**

A: Verify:

1. GA script loaded successfully
2. Script executed before component initialization
3. No JavaScript errors preventing execution

**Q: Events not showing in GA4**

A: Verify:

1. Correct measurement ID configured
2. DebugView shows events (install GA Debugger extension)
3. Wait up to 24 hours for data processing
4. Check filters in GA4 reports

**Q: Application broken when GA fails to load**

A: This indicates improper error handling:

1. Review error handling in GA initialization
2. Ensure GA failures don't throw uncaught exceptions
3. Add defensive checks before calling `gtag()`

**Q: GA slowing down page load**

A: Optimize:

1. Ensure async/defer attributes on script tag
2. Load GA after critical content
3. Consider using `requestIdleCallback` for initialization
4. Measure with Lighthouse to quantify impact

---

## Conclusion

This testing strategy ensures robust and reliable Google Analytics integration following the project's BDD → ATDD → TDD workflow. By combining unit tests, component tests, E2E tests, and manual verification, we can confidently deploy GA tracking while maintaining application quality and user experience.

### Key Takeaways

1. **Test at multiple levels** - Unit, component, and E2E
2. **Verify graceful degradation** - App works without GA
3. **Test environment configs** - Dev, staging, and production
4. **Monitor in production** - Use GA4 DebugView and DevTools
5. **Document verification steps** - Make testing repeatable
6. **Automate where possible** - Reduce manual testing burden

### Next Steps

1. Wait for coder agent to complete implementation
2. Review implemented code against this strategy
3. Execute manual testing checklist
4. Write and run automated tests
5. Deploy to staging and verify
6. Monitor production after deployment
