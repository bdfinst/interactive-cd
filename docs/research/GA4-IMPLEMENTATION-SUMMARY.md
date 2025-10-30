# GA4 Subdomain Tracking - Quick Implementation Guide

## TL;DR

**You don't need cross-domain tracking for subdomains.** Just use the same GA4 Measurement ID on both `minimumcd.org` and `practices.minimumcd.org`.

---

## What You Need

1. **Single GA4 Measurement ID** (format: `G-XXXXXXXXXX`)
   - Get this from the main site owner
   - Use the same ID on both domains

2. **Environment Variable**
   - Already configured in `.env.example` as `VITE_GA_MEASUREMENT_ID`
   - Set in production environment (Netlify)

3. **Component Implementation**
   - Create `src/lib/components/GoogleAnalytics.svelte`
   - Add to `src/routes/+layout.svelte`

---

## How GA4 Handles Subdomains (Automatically)

```
minimumcd.org              → Sets cookie: .minimumcd.org
└── practices.minimumcd.org → Reads cookie: .minimumcd.org (same cookie!)
```

**Result**: Same user, same session, tracked across both subdomains automatically.

---

## Implementation Steps

### Step 1: Get Measurement ID

Coordinate with `minimumcd.org` owner to get the GA4 Measurement ID.

### Step 2: Set Environment Variable

**File**: `.env.production`

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**File**: `.env` (local - leave empty)

```bash
VITE_GA_MEASUREMENT_ID=
```

### Step 3: Create Analytics Component

**File**: `src/lib/components/GoogleAnalytics.svelte`

```svelte
<script>
  import { browser } from '$app/environment'
  import { page } from '$app/stores'

  export let measurementId
  export let enabled = true

  function initializeGA() {
    if (!browser || !enabled || !measurementId) return

    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      cookie_domain: 'auto',
    })
  }

  $: if (browser && enabled && measurementId) {
    initializeGA()
  }

  $: if (browser && enabled && $page.url && typeof window.gtag !== 'undefined') {
    window.gtag('config', measurementId, {
      page_path: $page.url.pathname,
    })
  }
</script>

{#if browser && enabled && measurementId}
  <svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id={measurementId}"></script>
  </svelte:head>
{/if}
```

### Step 4: Add to Layout

**File**: `src/routes/+layout.svelte` (add these changes)

```svelte
<script>
	// ... existing imports ...
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte'
	import { env } from '$env/dynamic/public'

	// ... existing code ...

	// Google Analytics Configuration
	const gaMeasurementId = env.PUBLIC_GA_MEASUREMENT_ID || import.meta.env.VITE_GA_MEASUREMENT_ID
	const gaEnabled = !!gaMeasurementId && import.meta.env.PROD
</script>

<SEO />

<!-- Google Analytics 4 -->
{#if gaEnabled}
	<GoogleAnalytics measurementId={gaMeasurementId} enabled={gaEnabled} />
{/if}

<!-- ... rest of layout ... -->
```

### Step 5: Deploy & Verify

1. **Deploy to staging**
2. **Open DevTools** → Application → Cookies
3. **Verify cookie**:
   - Name: `_ga`
   - Domain: `.minimumcd.org` (note the leading dot)
4. **Check GA4 Real-time reports** (traffic should appear)

---

## Viewing Subdomain Data in GA4

### Option 1: Add Hostname Dimension to Reports

1. Go to **Reports** → **Engagement** → **Pages and screens**
2. Click **+** button in first column
3. Search for **Hostname**
4. Add it as a dimension

### Option 2: Filter by Subdomain

1. Click **Add filter** in any report
2. Select **Hostname** dimension
3. Choose **exactly matches**
4. Enter `practices.minimumcd.org`

### Option 3: Create Exploration Report

1. Go to **Explore** → **Free Form Exploration**
2. Add **Hostname** as dimension
3. Add metrics (Users, Sessions, Page Views)
4. Drag to table

---

## Testing

### Disable in Development

Analytics is automatically disabled when:

- `VITE_GA_MEASUREMENT_ID` is empty (default in `.env`)
- `import.meta.env.PROD` is false (development mode)

### E2E Tests

Add to `.env.test`:

```bash
VITE_GA_MEASUREMENT_ID=
```

This ensures tests don't trigger analytics.

---

## GDPR Considerations (Future)

GA4 is **not GDPR-compliant by default**. If targeting EU users:

1. **Implement consent banner** (e.g., CookieYes, Cookiebot)
2. **Use Google Consent Mode V2**
3. **Create Privacy Policy and Cookie Policy**
4. **Configure data retention** (2-14 months)

See full research document for detailed GDPR implementation.

---

## Key Takeaways

✅ **Same Measurement ID** on both domains
✅ **No cross-domain config** needed (automatic for subdomains)
✅ **Cookie domain** `.minimumcd.org` (with leading dot)
✅ **Use hostname dimension** to filter reports
✅ **Environment variables** for easy control
✅ **Disabled in dev/test** by default

❌ **Don't create separate data streams** for each subdomain
❌ **Don't hardcode** the Measurement ID
❌ **Don't forget GDPR** if needed

---

## Resources

- **Full Research**: See `GA4-SUBDOMAIN-TRACKING-RESEARCH.md` for comprehensive details
- **GA4 Docs**: [Cross-domain measurement](https://support.google.com/analytics/answer/10071811)
- **SvelteKit Docs**: [Environment variables](https://kit.svelte.dev/docs/modules#$env-dynamic-public)

---

**Quick Start**: Copy the component code above, set the environment variable, deploy, and verify cookies. That's it!
