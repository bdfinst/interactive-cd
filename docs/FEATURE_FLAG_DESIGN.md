# Feature Flag Design - Practice Adoption

## Overview

The Practice Adoption feature will be hidden behind a feature flag to allow:

- Development and testing in production
- Gradual rollout to users
- A/B testing (optional)
- Quick rollback if issues arise
- Beta testing with select users

---

## Feature Flag Strategy

### Approach: Environment Variable + URL Parameter

**Flag Name:** `ENABLE_PRACTICE_ADOPTION`

**Priority Order:**

1. **URL parameter** (highest) - For testing/preview
2. **Environment variable** (medium) - For production control
3. **Default: disabled** (lowest) - Safe default

---

## Implementation

### 1. Environment Variable Configuration

**File:** `.env` (local development)

```bash
# Feature Flags
PUBLIC_ENABLE_PRACTICE_ADOPTION=true
```

**File:** `.env.production` (production - initially disabled)

```bash
# Feature Flags
PUBLIC_ENABLE_PRACTICE_ADOPTION=false
```

**Note:** Use `PUBLIC_` prefix so it's available in browser (SvelteKit convention)

---

### 2. Feature Flag Store

**File:** `src/lib/stores/featureFlags.js`

```javascript
import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'

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
		const enabledFeatures = featuresParam.split(',').map(f => f.trim())

		// Map flag names to URL-friendly names
		const urlFlagName = flagName.replace('ENABLE_', '').replace(/_/g, '-').toLowerCase()

		if (enabledFeatures.includes(urlFlagName)) {
			console.info(`🚩 Feature flag "${flagName}" enabled via URL parameter`)
			return true
		}
	}

	// 2. Check environment variable
	const envValue = import.meta.env[`PUBLIC_${flagName}`]

	if (envValue === 'true' || envValue === '1') {
		console.info(`🚩 Feature flag "${flagName}" enabled via environment variable`)
		return true
	}

	// 3. Default: disabled
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
```

---

### 3. Usage in Components

#### Option A: Using Derived Store (Reactive)

**File:** `src/lib/components/GraphNode.svelte`

```svelte
<script>
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
	import AdoptionCheckbox from './AdoptionCheckbox.svelte'

	const { practice, isAdopted = false, ontoggleadoption = () => {} } = $props()
</script>

<button class="...">
	<!-- Only show adoption checkbox if feature flag is enabled -->
	{#if $isPracticeAdoptionEnabled}
		<div class="absolute top-2 right-2 z-10">
			<AdoptionCheckbox
				practiceId={practice.id}
				{isAdopted}
				size="md"
				ontoggle={ontoggleadoption}
			/>
		</div>
	{/if}

	<!-- Rest of component... -->
</button>
```

#### Option B: Using Feature Flag Function

```svelte
<script>
	import { featureFlags } from '$lib/stores/featureFlags.js'

	const showAdoptionFeature = featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)
</script>

{#if showAdoptionFeature}
	<!-- Adoption UI -->
{/if}
```

---

### 4. Hide Export/Import Buttons

**File:** `src/lib/components/PracticeGraph.svelte`

```svelte
<script>
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
	import ExportImportButtons from './ExportImportButtons.svelte'

	// ... other imports and code
</script>

<!-- Only show export/import if feature flag enabled -->
{#if $isPracticeAdoptionEnabled}
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-2xl font-bold">Practice Adoption</h2>

		<ExportImportButtons {totalPracticeCount} {validPracticeIds} />
	</div>
{/if}

<!-- Rest of graph UI -->
```

---

### 5. Prevent Store Initialization When Disabled

**File:** `src/lib/components/PracticeGraph.svelte`

```svelte
<script>
	import { onMount } from 'svelte'
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'

	let allPractices = []

	onMount(() => {
		// Only initialize adoption store if feature is enabled
		if ($isPracticeAdoptionEnabled) {
			const practiceIds = new Set(allPractices.map(p => p.id))
			adoptionStore.initialize(practiceIds)
		}
	})
</script>
```

---

## Testing URLs

### Enable Feature for Testing

```
# Enable via URL parameter
https://example.com/?feature=practice-adoption

# Enable multiple features (future use)
https://example.com/?features=practice-adoption,other-feature

# Works with any URL
https://example.com/help?feature=practice-adoption
```

### Production URLs

```
# Normal production (feature hidden)
https://example.com/

# Beta testing link (feature visible)
https://example.com/?feature=practice-adoption
```

---

## Deployment Strategy

### Phase 1: Development (Now)

```bash
# .env
PUBLIC_ENABLE_PRACTICE_ADOPTION=true
```

- Feature visible in local development
- Build and test all functionality

### Phase 2: Staging (Before Production)

```bash
# .env.production (staging)
PUBLIC_ENABLE_PRACTICE_ADOPTION=true
```

- Feature visible on staging environment
- QA testing, performance testing
- Accessibility audit

### Phase 3: Production - Beta (Limited Rollout)

```bash
# .env.production
PUBLIC_ENABLE_PRACTICE_ADOPTION=false
```

- Feature hidden by default
- Share beta URL with select users: `?feature=practice-adoption`
- Collect feedback, monitor for issues

### Phase 4: Production - Full Launch

```bash
# .env.production
PUBLIC_ENABLE_PRACTICE_ADOPTION=true
```

- Feature visible to all users
- Monitor analytics and performance
- URL parameter still works for debugging

### Phase 5: Cleanup (Optional - Future)

- Remove feature flag code
- Make feature permanent
- Clean up conditional rendering

---

## Environment Variable Management

### SvelteKit Configuration

**File:** `svelte.config.js`

```javascript
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		// Make environment variables available
		env: {
			publicPrefix: 'PUBLIC_'
		}
	}
}

export default config
```

### Deployment Platforms

#### Vercel

```bash
# Environment Variables (Production)
PUBLIC_ENABLE_PRACTICE_ADOPTION=false

# Preview Deployments (Optional)
PUBLIC_ENABLE_PRACTICE_ADOPTION=true
```

#### Netlify

```toml
# netlify.toml
[build.environment]
  PUBLIC_ENABLE_PRACTICE_ADOPTION = "false"

[context.deploy-preview.environment]
  PUBLIC_ENABLE_PRACTICE_ADOPTION = "true"
```

#### GitHub Pages / Static Export

```bash
# Build with feature disabled
PUBLIC_ENABLE_PRACTICE_ADOPTION=false npm run build

# Or build with feature enabled
PUBLIC_ENABLE_PRACTICE_ADOPTION=true npm run build
```

---

## Testing

### Unit Tests

**File:** `tests/unit/stores/featureFlags.test.js`

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { featureFlags, isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
import { get } from 'svelte/store'

describe('Feature Flags', () => {
	beforeEach(() => {
		// Mock window.location
		delete window.location
		window.location = { search: '' }
	})

	it('is disabled by default', () => {
		expect(get(isPracticeAdoptionEnabled)).toBe(false)
	})

	it('enables via URL parameter', () => {
		window.location.search = '?feature=practice-adoption'
		const flags = featureFlags
		expect(flags.isEnabled(flags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
	})

	it('enables via environment variable', () => {
		vi.stubEnv('PUBLIC_ENABLE_PRACTICE_ADOPTION', 'true')
		const flags = featureFlags
		expect(flags.isEnabled(flags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
	})

	it('URL parameter takes precedence over env var', () => {
		vi.stubEnv('PUBLIC_ENABLE_PRACTICE_ADOPTION', 'false')
		window.location.search = '?feature=practice-adoption'
		const flags = featureFlags
		expect(flags.isEnabled(flags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
	})
})
```

### E2E Tests

**File:** `tests/e2e/feature-flags.spec.js`

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Flags - Practice Adoption', () => {
	test('should hide adoption feature when flag disabled', async ({ page }) => {
		// Visit without feature flag
		await page.goto('/')

		// Wait for page load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Verify adoption checkboxes are NOT visible
		const checkboxes = page.locator('[role="checkbox"]')
		await expect(checkboxes).toHaveCount(0)

		// Verify export/import buttons are NOT visible
		const exportButton = page.locator('button:has-text("Export")')
		await expect(exportButton).not.toBeVisible()
	})

	test('should show adoption feature when flag enabled via URL', async ({ page }) => {
		// Visit WITH feature flag
		await page.goto('/?feature=practice-adoption')

		// Wait for page load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Verify adoption checkboxes ARE visible
		const checkboxes = page.locator('[role="checkbox"]')
		await expect(checkboxes.first()).toBeVisible()

		// Verify export/import buttons ARE visible
		const exportButton = page.locator('button:has-text("Export")')
		await expect(exportButton).toBeVisible()
	})

	test('should persist feature flag across navigation', async ({ page }) => {
		// Start with feature enabled
		await page.goto('/?feature=practice-adoption')

		// Verify feature is active
		const checkbox = page.locator('[role="checkbox"]').first()
		await expect(checkbox).toBeVisible()

		// Navigate to another page (if multi-page app)
		// await page.click('a[href="/help"]')

		// Feature should still be active (if using URL parameter)
		// await expect(checkbox).toBeVisible()
	})
})
```

---

## Logging & Debugging

### Development Console Messages

When feature flag is checked:

```javascript
// Console output example
🚩 Feature flag "ENABLE_PRACTICE_ADOPTION" enabled via URL parameter
🚩 Feature flag "ENABLE_PRACTICE_ADOPTION" enabled via environment variable
```

### Debug Panel (Optional Enhancement)

**File:** `src/lib/components/DebugPanel.svelte` (only in dev mode)

```svelte
<script>
	import { dev } from '$app/environment'
	import { featureFlags } from '$lib/stores/featureFlags.js'

	let showPanel = $state(false)
</script>

{#if dev}
	<div class="fixed bottom-4 right-4 z-50">
		<button
			onclick={() => (showPanel = !showPanel)}
			class="bg-gray-800 text-white px-3 py-1 rounded text-xs"
		>
			🚩 Flags
		</button>

		{#if showPanel}
			<div class="absolute bottom-10 right-0 bg-white border shadow-lg p-4 rounded min-w-[250px]">
				<h4 class="font-bold mb-2">Feature Flags</h4>
				<ul class="text-sm space-y-1">
					<li>
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								checked={$featureFlags[featureFlags.FLAGS.PRACTICE_ADOPTION]}
								disabled
							/>
							<span>Practice Adoption</span>
						</label>
					</li>
				</ul>
				<p class="text-xs text-gray-500 mt-2">Add ?feature=practice-adoption to URL to enable</p>
			</div>
		{/if}
	</div>
{/if}
```

---

## Summary

### Files to Create

- `src/lib/stores/featureFlags.js` - Feature flag store
- `tests/unit/stores/featureFlags.test.js` - Unit tests
- `tests/e2e/feature-flags.spec.js` - E2E tests
- `.env` - Local development config
- `.env.production` - Production config

### Changes to Existing Files

- `src/lib/components/GraphNode.svelte` - Wrap adoption UI in feature flag
- `src/lib/components/PracticeGraph.svelte` - Conditional store initialization + export/import buttons
- All adoption-related components - Wrap in feature flag conditionals

### Benefits

✅ **Safe Development** - Build in production without exposing to users
✅ **Gradual Rollout** - Test with beta users before full launch
✅ **Quick Rollback** - Disable via env var if issues found
✅ **Testing Flexibility** - URL parameter for easy testing/demoing
✅ **Zero Performance Impact** - No code runs when flag disabled
✅ **Clean Architecture** - Easy to remove flag post-launch

### Deployment Checklist

- [ ] Set `PUBLIC_ENABLE_PRACTICE_ADOPTION=true` in `.env` (local dev)
- [ ] Set `PUBLIC_ENABLE_PRACTICE_ADOPTION=false` in production env vars
- [ ] Test feature with URL parameter: `?feature=practice-adoption`
- [ ] Verify feature hidden without URL parameter
- [ ] Beta test with select users (share URL with parameter)
- [ ] Monitor for issues
- [ ] When ready: Set env var to `true` for full launch

---

## Estimated Time to Implement

- Feature flag store: 1 hour
- Update components with conditionals: 1 hour
- Unit tests: 30 minutes
- E2E tests: 30 minutes
- **Total: 3 hours**

---

**Feature Flag Design Complete ✅**
