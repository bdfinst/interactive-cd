# Google Analytics Implementation

## Overview

This document describes the Google Analytics 4 (GA4) implementation for practices.minimumcd.org. The implementation follows functional programming principles and the BDD → ATDD → TDD workflow outlined in CLAUDE.md.

## Architecture

The GA implementation consists of three main components:

1. **Utility Functions** (`src/lib/utils/analytics.js`)
   - Pure functions for GA operations
   - Environment-based configuration
   - Error handling and fallbacks

2. **Svelte Component** (`src/lib/components/GoogleAnalytics.svelte`)
   - Manages GA lifecycle
   - Handles SSR gracefully
   - Tracks page views on route changes

3. **Environment Configuration** (`.env`)
   - GA measurement ID configuration
   - Feature flag for enabling/disabling analytics

## Key Features

### Functional Programming Principles

- **Pure Functions**: All utility functions are pure (except gtag calls which are necessary side effects)
- **Immutability**: Data structures are never mutated
- **Composability**: Functions can be composed for complex operations
- **Testability**: Pure functions are easily testable without mocks

### Subdomain Tracking

The implementation supports tracking across subdomains under the same GA property:

```javascript
cookie_domain: 'auto',
cookie_flags: 'SameSite=None;Secure'
```

This configuration allows:

- practices.minimumcd.org (subdomain)
- minimumcd.org (main domain)

To share the same GA4 property and track users across both domains.

### SSR Safety

The component handles Server-Side Rendering (SSR) gracefully:

- Only initializes in browser environment
- Uses `onMount` lifecycle for initialization
- Checks `browser` flag from `$app/environment`
- No errors during build or SSR

### Error Handling

Comprehensive error handling at every level:

- Invalid measurement ID detection
- Script loading failure handling
- gtag call error catching
- Graceful degradation when analytics fails

### Privacy & Security

- No tracking without explicit measurement ID
- XSS prevention in measurement ID validation
- Secure cookie flags for cross-site tracking
- Console logging for debugging transparency

## Configuration

### Environment Variables

Add to `.env` file (or set in Netlify environment variables):

```bash
# Google Analytics Configuration
# GA4 Measurement ID for tracking (format: G-XXXXXXXXXX)
VITE_GA_MEASUREMENT_ID=G-YOUR-ID-HERE
```

**Important**: Leave empty in development to disable tracking locally.

### Production Deployment (Netlify)

1. Go to Netlify site settings
2. Navigate to Environment Variables
3. Add new variable:
   - **Key**: `VITE_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (your actual GA4 measurement ID)
4. Redeploy the site

## Usage

### Automatic Integration

The GoogleAnalytics component is already integrated in the app layout (`src/routes/+layout.svelte`):

```svelte
<script>
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte'
	// ... other imports
</script>

<GoogleAnalytics />
```

### Custom Tracking Events

To track custom events, import and use the utility functions:

```javascript
import { trackEvent } from '$lib/utils/analytics.js'

// Track a button click
trackEvent(window, 'button_click', {
	button_name: 'subscribe',
	value: 1
})

// Track a practice adoption
trackEvent(window, 'practice_adopted', {
	practice_id: 'continuous-delivery',
	category: 'deployment'
})
```

### Manual Page View Tracking

Page views are tracked automatically on route changes via SvelteKit's `$page` store. To manually track:

```javascript
import { trackPageView, getPageData } from '$lib/utils/analytics.js'

const pageData = getPageData(window, document)
trackPageView(window, pageData)
```

## File Structure

```
src/lib/
├── utils/
│   └── analytics.js              # Pure utility functions
└── components/
    └── GoogleAnalytics.svelte    # GA component

tests/unit/
├── utils/
│   └── analytics.test.js         # Utility function tests (35 tests)
└── components/
    └── GoogleAnalytics.test.js   # Component tests (10 tests)

docs/
└── GOOGLE-ANALYTICS-IMPLEMENTATION.md  # This file
```

## API Reference

### Utility Functions

#### `isValidMeasurementId(measurementId: string): boolean`

Validates GA4 measurement ID format.

**Example:**

```javascript
isValidMeasurementId('G-ABC123DEF4') // true
isValidMeasurementId('UA-123456-1') // false (old Universal Analytics)
```

#### `shouldEnableAnalytics(measurementId: string, isBrowser: boolean): boolean`

Determines if analytics should be enabled.

**Example:**

```javascript
shouldEnableAnalytics('G-ABC123DEF4', true) // true
shouldEnableAnalytics('', true) // false
```

#### `createGtagScript(measurementId: string): HTMLScriptElement | null`

Creates the Google Analytics script element.

**Example:**

```javascript
const script = createGtagScript('G-ABC123DEF4')
if (script) {
	document.head.appendChild(script)
}
```

#### `initializeDataLayer(windowObj: Window): void`

Initializes the gtag data layer on window object.

**Example:**

```javascript
initializeDataLayer(window)
// Creates window.dataLayer and window.gtag
```

#### `createGtagConfig(measurementId: string, config?: object): object`

Creates configuration object for gtag.

**Example:**

```javascript
const config = createGtagConfig('G-ABC123DEF4', {
	sendPageView: false,
	customParams: {
		anonymize_ip: true
	}
})
```

#### `safeGtagCall(windowObj: Window, command: string, ...args): boolean`

Safely calls gtag with error handling.

**Example:**

```javascript
safeGtagCall(window, 'config', 'G-ABC123DEF4', {
	cookie_domain: 'auto'
})
```

#### `trackPageView(windowObj: Window, pageData?: object): boolean`

Tracks a page view event.

**Example:**

```javascript
trackPageView(window, {
	page_path: '/about',
	page_title: 'About Page',
	page_location: 'https://example.com/about'
})
```

#### `trackEvent(windowObj: Window, eventName: string, eventParams?: object): boolean`

Tracks a custom event.

**Example:**

```javascript
trackEvent(window, 'button_click', {
	button_name: 'subscribe',
	value: 1
})
```

#### `getPageData(windowObj: Window, documentObj: Document): object`

Extracts current page data.

**Example:**

```javascript
const pageData = getPageData(window, document)
// Returns: { page_path, page_title, page_location }
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run analytics utility tests only
npm test -- tests/unit/utils/analytics.test.js

# Run GA component tests only
npm test -- tests/unit/components/GoogleAnalytics.test.js

# Run tests in watch mode
npm test:watch
```

### Test Coverage

- **Utility Functions**: 35 tests covering all edge cases
- **Component**: 10 tests covering initialization, SSR, and error handling
- **Total**: 45 tests specifically for GA implementation

### Test Philosophy

Following TDD principles from CLAUDE.md:

1. Tests focus on behavior, not implementation
2. Pure functions are easily testable
3. Each test verifies one specific behavior
4. Tests use AAA pattern (Arrange, Act, Assert)

## Troubleshooting

### Analytics Not Loading

1. **Check environment variable**: Ensure `VITE_GA_MEASUREMENT_ID` is set
2. **Verify format**: Must be `G-XXXXXXXXXX` format (GA4, not Universal Analytics)
3. **Check browser console**: Look for `[Analytics]` log messages
4. **Restart dev server**: Environment variables require restart

### Console Messages

**Success:**

```
[Analytics] Initialized successfully: G-XXXXXXXXXX
```

**Disabled:**

```
[Analytics] Disabled: Invalid measurement ID or not in browser
```

**Error:**

```
[Analytics] Initialization error: [error details]
```

### Debugging

Enable verbose logging by checking browser console for `[Analytics]` prefixed messages.

## Security Considerations

### XSS Prevention

The implementation validates measurement IDs to prevent XSS attacks:

```javascript
// Malicious input is rejected
isValidMeasurementId('G-ABC"><script>alert("xss")</script>') // false
```

### GDPR Compliance

To comply with GDPR:

1. Add cookie consent banner (not implemented in this phase)
2. Only initialize GA after user consent
3. Use `anonymize_ip` option if needed:

```javascript
const config = createGtagConfig('G-ABC123DEF4', {
	customParams: {
		anonymize_ip: true
	}
})
```

## Performance

### Script Loading

- Script loads asynchronously (`async` attribute)
- Non-blocking page load
- Minimal impact on performance

### Bundle Size

- No external dependencies
- Pure JavaScript implementation
- ~2KB added to bundle (uncompressed)

## Future Enhancements

Potential improvements for future iterations:

1. **Cookie Consent Integration**
   - Add consent management
   - Conditional GA initialization based on consent

2. **Custom Dimensions**
   - Track practice adoptions
   - Track user journey through the graph

3. **Event Tracking**
   - Graph interactions
   - Practice card clicks
   - Export/import actions

4. **Enhanced E-commerce Tracking**
   - Not applicable for this project, but structure supports it

## References

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Cross-domain Tracking](https://support.google.com/analytics/answer/10071811)
- [gtag.js Reference](https://developers.google.com/tag-platform/gtagjs/reference)
- [CLAUDE.md](../CLAUDE.md) - Project development guidelines

## Support

For issues or questions:

1. Check browser console for `[Analytics]` messages
2. Verify environment configuration
3. Review test suite for examples
4. Check GA4 property settings in Google Analytics console
