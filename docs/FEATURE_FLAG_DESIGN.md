# Feature Flag Design - Practice Adoption

## Overview

The Practice Adoption feature is hidden behind a feature flag to allow:

- Development and testing in production
- Gradual rollout to users
- Quick rollback if issues arise
- Beta testing with select users

---

## Feature Flag Strategy

### Approach: Environment Variable Only

**Flag Name:** `VITE_ENABLE_PRACTICE_ADOPTION`

**Important Changes (Latest Refactoring):**

- URL parameters (`?feature=practice-adoption`) are **NO LONGER** used to control the feature
- Feature control is now **ONLY** via the `VITE_ENABLE_PRACTICE_ADOPTION` environment variable
- URL parameters are preserved for backward compatibility but are ignored by the feature flag system
- This simplifies deployment and ensures consistent feature state across all users
- **NEW:** Feature flags are now configured in a centralized config file (`src/lib/config/featureFlags.config.js`)

**Control:**

1. **Environment variable (ONLY)** - `VITE_ENABLE_PRACTICE_ADOPTION`
2. **Default: disabled** - Safe default when env var is not set or is 'false'

---

## Implementation

### 1. Environment Variable Configuration

**File:** `.env` (local development)

```bash
# Feature Flags
VITE_ENABLE_PRACTICE_ADOPTION=true
```

**File:** `.env.production` (production - initially disabled)

```bash
# Feature Flags
VITE_ENABLE_PRACTICE_ADOPTION=false
```

**Note:** Use `VITE_` prefix so it's available in browser (Vite convention)

---

### 2. Feature Flag Configuration

**File:** `src/lib/config/featureFlags.config.js`

This centralized configuration file defines all feature flags with metadata:

```javascript
export const FEATURE_FLAGS = {
	PRACTICE_ADOPTION: {
		key: 'ENABLE_PRACTICE_ADOPTION',
		defaultValue: false,
		description: 'Practice adoption tracking with export/import functionality',
		owner: 'adoption-team',
		status: 'beta',
		createdAt: '2025-01-15'
	}
}
```

**Benefits:**

- Single source of truth for all feature flags
- Self-documenting with descriptions and metadata
- Easy to add new flags without modifying store code
- Supports tooling (documentation generation, dashboards)

---

### 3. Feature Flag Store

**File:** `src/lib/stores/featureFlags.js`

```javascript
import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { FEATURE_FLAGS, FLAGS } from '$lib/config/featureFlags.config.js'

/**
 * Check if a feature flag is enabled
 */
const isFeatureEnabled = flagConfig => {
	if (!browser) return false

	const { key: flagName, defaultValue } = flagConfig
	const envValue = import.meta.env[`VITE_${flagName}`]
	const isEnabled = envValue === 'true' || envValue === '1' || envValue === true || envValue === 1

	if (isEnabled) {
		console.info(`🚩 Feature flag "${flagName}" enabled via environment variable`)
		return true
	}

	// Use default value from config if env var not set
	if (envValue === undefined || envValue === null) {
		if (defaultValue) {
			console.info(`🚩 Feature flag "${flagName}" using default value (${defaultValue})`)
			return defaultValue
		}
	}

	console.info(`🚩 Feature flag "${flagName}" disabled`)
	return false
}

/**
 * Create feature flag store
 */
const createFeatureFlagStore = () => {
	// Initialize all feature flags from config
	const initialState = Object.entries(FEATURE_FLAGS).reduce((acc, [key, config]) => {
		acc[config.key] = isFeatureEnabled(config)
		return acc
	}, {})

	const { subscribe } = writable(initialState)

	return {
		subscribe,
		FLAGS, // Legacy compatibility
		FEATURE_FLAGS, // New config access

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

	const { practice, isAdopted = false, onToggleAdoption = () => {} } = $props()
</script>

<button class="...">
	<!-- Only show adoption checkbox if feature flag is enabled -->
	{#if $isPracticeAdoptionEnabled}
		<div class="absolute top-2 right-2 z-10">
			<AdoptionCheckbox
				practiceId={practice.id}
				{isAdopted}
				size="md"
				ontoggle={onToggleAdoption}
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

## Adding New Feature Flags

With the centralized configuration approach, adding a new feature flag is simple and requires no changes to the feature flag store code.

### Step 1: Add to Configuration

**File:** `src/lib/config/featureFlags.config.js`

```javascript
export const FEATURE_FLAGS = {
	PRACTICE_ADOPTION: {
		key: 'ENABLE_PRACTICE_ADOPTION',
		defaultValue: false,
		description: 'Practice adoption tracking with export/import functionality',
		owner: 'adoption-team',
		status: 'beta',
		createdAt: '2025-01-15'
	},

	// Add your new feature flag here:
	NEW_FEATURE: {
		key: 'ENABLE_NEW_FEATURE',
		defaultValue: false,
		description: 'Description of what this feature does',
		owner: 'team-name',
		status: 'alpha', // 'alpha' | 'beta' | 'stable' | 'deprecated'
		createdAt: '2025-MM-DD'
	}
}
```

### Step 2: Add Environment Variable

**File:** `.env`

```bash
VITE_ENABLE_NEW_FEATURE=true
```

### Step 3: Create Derived Store (Optional)

**File:** `src/lib/stores/featureFlags.js`

```javascript
export const isNewFeatureEnabled = derived(
	featureFlags,
	$flags => $flags[featureFlags.FLAGS.NEW_FEATURE]
)
```

### Step 4: Use in Components

```svelte
<script>
	import { isNewFeatureEnabled } from '$lib/stores/featureFlags.js'
</script>

{#if $isNewFeatureEnabled}
	<!-- Your new feature UI -->
{/if}
```

**That's it!** The feature flag store automatically initializes all flags from the configuration.

---

## Testing URLs

### Enable Feature for Testing

**Important:** URL parameters NO LONGER control the feature flag.

To enable the feature for testing:

1. **Local Development:**
   - Set `VITE_ENABLE_PRACTICE_ADOPTION=true` in `.env`
   - Restart the dev server with `npm run dev`

2. **Production/Staging:**
   - Set `VITE_ENABLE_PRACTICE_ADOPTION=true` in environment variables
   - Redeploy the application

### URL Parameters (Backward Compatibility)

```
# These URLs are valid but the parameter is IGNORED for feature control
https://example.com/?feature=practice-adoption
https://example.com/?features=practice-adoption,other-feature

# The feature flag is controlled ONLY by VITE_ENABLE_PRACTICE_ADOPTION
# URL parameters are preserved for backward compatibility (e.g., adoption state data)
```

---

## Deployment Strategy

### Phase 1: Development (Now)

```bash
# .env
VITE_ENABLE_PRACTICE_ADOPTION=true
```

- Feature visible in local development
- Build and test all functionality
- **Must restart dev server** after changing env var

### Phase 2: Staging (Before Production)

```bash
# .env.production (staging)
VITE_ENABLE_PRACTICE_ADOPTION=true
```

- Feature visible on staging environment
- QA testing, performance testing
- Accessibility audit

### Phase 3: Production - Beta (Limited Rollout)

```bash
# .env.production
VITE_ENABLE_PRACTICE_ADOPTION=false
```

- Feature hidden from all users
- Enable via deployment configuration for beta environment only
- Collect feedback, monitor for issues
- **Note:** URL parameters no longer enable the feature

### Phase 4: Production - Full Launch

```bash
# .env.production
VITE_ENABLE_PRACTICE_ADOPTION=true
```

- Feature visible to all users
- Monitor analytics and performance
- Consistent experience for all users

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
VITE_ENABLE_PRACTICE_ADOPTION=false

# Preview Deployments (Optional)
VITE_ENABLE_PRACTICE_ADOPTION=true
```

#### Netlify

```toml
# netlify.toml
[build.environment]
  VITE_ENABLE_PRACTICE_ADOPTION = "false"

[context.deploy-preview.environment]
  VITE_ENABLE_PRACTICE_ADOPTION = "true"
```

#### GitHub Pages / Static Export

```bash
# Build with feature disabled
VITE_ENABLE_PRACTICE_ADOPTION=false npm run build

# Or build with feature enabled
VITE_ENABLE_PRACTICE_ADOPTION=true npm run build
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

	it('ignores URL parameters', () => {
		window.location.search = '?feature=practice-adoption'
		const flags = featureFlags
		// URL parameters are ignored
		expect(flags.isEnabled(flags.FLAGS.PRACTICE_ADOPTION)).toBe(false)
	})

	it('enables via environment variable', () => {
		vi.stubEnv('VITE_ENABLE_PRACTICE_ADOPTION', 'true')
		const flags = featureFlags
		expect(flags.isEnabled(flags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
	})

	it('environment variable controls feature regardless of URL', () => {
		vi.stubEnv('VITE_ENABLE_PRACTICE_ADOPTION', 'true')
		window.location.search = '?feature=wrong-feature'
		const flags = featureFlags
		// Env var controls feature, URL is ignored
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
		// Visit page (VITE_ENABLE_PRACTICE_ADOPTION=false in config)
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

	test('should ignore URL parameters for feature control', async ({ page }) => {
		// Visit WITH URL parameter (but env var is false)
		await page.goto('/?feature=practice-adoption')

		// Wait for page load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Verify adoption checkboxes are NOT visible (URL param ignored)
		const checkboxes = page.locator('[role="checkbox"]')
		await expect(checkboxes).toHaveCount(0)

		// Verify export/import buttons are NOT visible
		const exportButton = page.locator('button:has-text("Export")')
		await expect(exportButton).not.toBeVisible()
	})

	// Note: Tests that require feature enabled should use a separate config
	// with VITE_ENABLE_PRACTICE_ADOPTION=true or be marked as .skip()
})
```

---

## Logging & Debugging

### Development Console Messages

When feature flag is checked:

```javascript
// Console output examples
🚩 Feature flag "ENABLE_PRACTICE_ADOPTION" enabled via environment variable (VITE_ENABLE_PRACTICE_ADOPTION=true)
🚩 Feature flag "ENABLE_PRACTICE_ADOPTION" disabled (VITE_ENABLE_PRACTICE_ADOPTION: false)
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
✅ **Gradual Rollout** - Test with beta users before full launch via separate deployments
✅ **Quick Rollback** - Disable via env var if issues found
✅ **Consistent Experience** - All users see the same feature state (no URL-based variations)
✅ **Zero Performance Impact** - No code runs when flag disabled
✅ **Clean Architecture** - Easy to remove flag post-launch
✅ **Simplified Deployment** - No need to manage URL parameters for feature control

### Deployment Checklist

- [ ] Set `VITE_ENABLE_PRACTICE_ADOPTION=true` in `.env` (local dev)
- [ ] **Restart dev server** after changing env var (required for Vite)
- [ ] Set `VITE_ENABLE_PRACTICE_ADOPTION=false` in production env vars
- [ ] Test feature is enabled in local dev
- [ ] Verify feature hidden in production
- [ ] Beta test: Deploy separate environment with env var = `true`
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
