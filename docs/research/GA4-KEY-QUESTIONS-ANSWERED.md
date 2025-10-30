# GA4 Subdomain Tracking - Key Questions Answered

## Research Questions & Answers

This document provides direct answers to the specific research questions posed for implementing Google Analytics to track both `minimumcd.org` (main site) and `practices.minimumcd.org` (this repository) under the same GA property.

---

## Q1: What GA measurement ID format is needed?

### Answer

**Format**: `G-XXXXXXXXXX` (starts with "G-" followed by alphanumeric characters)

**Examples**:

- `G-ABC1234567` ✅
- `UA-12345678-1` ❌ (This is Universal Analytics, deprecated)
- `GT-XXXXXXX` ❌ (This is Google Tag Manager)

### Key Points

- GA4 Measurement IDs always start with `G-`
- The same ID must be used on **both** `minimumcd.org` and `practices.minimumcd.org`
- Do NOT create separate Measurement IDs for each subdomain
- You need to get this ID from the owner of the main `minimumcd.org` GA4 property

### How to Find the Measurement ID

If you have access to the GA4 property:

1. Log in to Google Analytics
2. Click **Admin** (gear icon in bottom left)
3. Under **Property**, click **Data Streams**
4. Click on the web data stream
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Cookie Naming

When GA4 creates cookies, it uses this Measurement ID in the cookie name:

- Measurement ID: `G-ABC1234567`
- Cookie name: `_ga_ABC1234567` (note: "G-" prefix is omitted from cookie name)

---

## Q2: Does cross-domain tracking require special configuration for subdomains?

### Answer

**No. Cross-domain tracking is NOT needed for subdomains of the same parent domain.**

### Detailed Explanation

**Cross-domain tracking** is only required when tracking users across **different top-level domains**:

- ✅ Requires cross-domain tracking: `minimumcd.org` ↔ `example.com`
- ❌ Does NOT require cross-domain tracking: `minimumcd.org` ↔ `practices.minimumcd.org`

### Why Subdomains Work Automatically

GA4 has a `cookie_domain` parameter that defaults to `"auto"`. This means:

1. **Cookies are set at the top-level domain**: `.minimumcd.org` (note the leading dot)
2. **All subdomains can access these cookies**:
   - `minimumcd.org` → reads/writes `.minimumcd.org` cookies
   - `practices.minimumcd.org` → reads/writes `.minimumcd.org` cookies
   - `www.minimumcd.org` → reads/writes `.minimumcd.org` cookies

3. **Same user session is maintained** across all subdomains automatically

### Configuration Needed

**Minimal**: Just use the same Measurement ID on both domains.

**Optional** (usually not needed):

```javascript
gtag('config', 'G-XXXXXXXXXX', {
	cookie_domain: 'auto' // This is the default
})
```

### What About "Configure your domains" in GA4?

In GA4 Admin → Data Streams → Configure tag settings → Configure your domains, you can optionally list your subdomains. However:

- **Not required for subdomains** of the same parent domain
- **Doesn't hurt** if you add them
- **Primarily used** for true cross-domain tracking (different TLDs)

### Potential Self-Referral Issue

In rare cases, you might see your subdomains appearing as referrers in GA4 reports. If this happens:

1. Go to **Admin** → **Data Settings** → **Unwanted Referrals**
2. Add `minimumcd.org` to the list
3. GA4 will treat traffic between subdomains as internal

---

## Q3: What are the best practices for implementing GA in a Svelte application?

### Answer

**Best Practice**: Use a component-based approach in `+layout.svelte` with environment variables for control.

### Recommended Implementation Pattern

#### 1. Component-Based Approach (Recommended)

**Why**:

- ✅ Better control over initialization timing
- ✅ Can delay loading until user consent (GDPR)
- ✅ Easier to disable in development/testing
- ✅ Tracks SvelteKit page navigation properly
- ✅ Testable and mockable
- ✅ Follows Svelte best practices

**How**:

```svelte
<!-- src/lib/components/GoogleAnalytics.svelte -->
<script>
  import { browser } from '$app/environment'
  import { page } from '$app/stores'

  export let measurementId
  export let enabled = true

  // Initialize GA4
  $: if (browser && enabled && measurementId) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', measurementId)
  }

  // Track page navigation
  $: if (browser && enabled && $page.url && typeof window.gtag !== 'undefined') {
    window.gtag('config', measurementId, { page_path: $page.url.pathname })
  }
</script>

{#if browser && enabled && measurementId}
  <svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id={measurementId}"></script>
  </svelte:head>
{/if}
```

Then in `+layout.svelte`:

```svelte
<script>
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte'
	import { env } from '$env/dynamic/public'

	const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
	const gaEnabled = !!gaMeasurementId && import.meta.env.PROD
</script>

{#if gaEnabled}
	<GoogleAnalytics measurementId={gaMeasurementId} enabled={gaEnabled} />
{/if}
```

#### 2. Direct Embedding in `app.html` (Simpler but Less Flexible)

**Why**:

- ✅ Simplest implementation
- ✅ Works immediately on all pages
- ❌ Less control over initialization
- ❌ Harder to disable conditionally
- ❌ Not ideal for GDPR compliance

**When to use**: Only if you don't need consent management and want the absolute simplest setup.

### Best Practices Specific to Svelte/SvelteKit

#### ✅ DO

1. **Use `browser` check** from `$app/environment`

   ```javascript
   import { browser } from '$app/environment'
   if (browser) {
   	// GA4 code here
   }
   ```

2. **Use `$page` store** to track navigation

   ```javascript
   import { page } from '$app/stores'
   $: trackPageView($page.url.pathname)
   ```

3. **Use environment variables** for the Measurement ID

   ```bash
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Disable in development** by default

   ```javascript
   const gaEnabled = !!measurementId && import.meta.env.PROD
   ```

5. **Use reactive statements** (`$:`) for automatic tracking

   ```javascript
   $: if (browser && $page.url) {
   	trackPageView($page.url)
   }
   ```

6. **Add to root layout** (`+layout.svelte`) to track all pages

7. **Use `<svelte:head>`** for dynamic script injection
   ```svelte
   <svelte:head>
   	<script async src="..."></script>
   </svelte:head>
   ```

#### ❌ DON'T

1. **Don't use `window` without browser check**

   ```javascript
   // ❌ BAD: Will break SSR
   window.gtag('config', id)

   // ✅ GOOD
   if (browser) {
   	window.gtag('config', id)
   }
   ```

2. **Don't hardcode the Measurement ID**

   ```javascript
   // ❌ BAD
   const id = 'G-ABC123'

   // ✅ GOOD
   const id = import.meta.env.VITE_GA_MEASUREMENT_ID
   ```

3. **Don't load GA4 in tests**

   ```javascript
   // ✅ GOOD: Use environment check
   if (import.meta.env.PROD) {
   	initGA()
   }
   ```

4. **Don't forget to track page navigation**
   - SvelteKit does client-side navigation (no full page reload)
   - GA4 won't automatically track these without reactive tracking

5. **Don't use `onMount` for page tracking**

   ```javascript
   // ❌ BAD: Won't track subsequent navigation
   onMount(() => {
   	trackPageView()
   })

   // ✅ GOOD: Reactive statement tracks all navigation
   $: if ($page.url) {
   	trackPageView($page.url)
   }
   ```

### Alternative: Using Third-Party Libraries

**Options**:

- [`@beyonk/svelte-google-analytics`](https://github.com/beyonk-group/svelte-google-analytics)
- [`@sajuthankappan/sveltekit-google-analytics`](https://www.npmjs.com/package/@sajuthankappan/sveltekit-google-analytics)

**Recommendation**: For this project, a custom component is better because:

- ✅ Full control over behavior
- ✅ No external dependencies
- ✅ Easy to customize for GDPR
- ✅ Simple codebase (< 50 lines)
- ✅ Follows project's BDD/TDD principles

---

## Q4: Are there any privacy or cookie consent considerations?

### Answer

**Yes. Google Analytics 4 is NOT GDPR-compliant by default.** If you have users in the EU, you must implement proper consent management.

### Legal Requirements (GDPR/ePrivacy)

#### When Consent is Required

**You must get explicit consent before loading GA4 if**:

- ✅ You have users in the European Union
- ✅ You have users in California (CCPA)
- ✅ You have users in the UK (UK GDPR)
- ✅ Your privacy policy promises to ask for consent

#### What "Consent" Means

- **Affirmative action required**: Users must click "Accept" or "Allow"
- **Pre-ticked boxes don't count**: Must be opt-in, not opt-out
- **Granular control**: Users should be able to accept analytics but reject marketing
- **Easy withdrawal**: Users can change consent later

### Privacy Considerations for This Project

#### Scenario 1: Public Educational Site (No Login)

**Current Status**: `practices.minimumcd.org` is a public educational resource about CD practices.

**Privacy Impact**: **Low to Medium**

- No user accounts or personal data storage
- No e-commerce or sensitive transactions
- Public content consumption only

**Recommendation**:

1. **Short term**: Implement basic GA4 without consent (document the decision)
2. **Long term** (3-6 months): Add consent banner for best practices

**Rationale**:

- Educational/non-commercial sites have lower privacy risk
- Main purpose is improving content (legitimate interest argument)
- However, best practice is still to get consent

#### Scenario 2: If You Want Full GDPR Compliance Now

**Required Steps**:

1. **Implement Google Consent Mode V2**
2. **Add consent banner** (CookieYes, Cookiebot, or custom)
3. **Create Privacy Policy**
4. **Create Cookie Policy**
5. **Default to "denied" consent**
6. **Only load GA4 after consent**

### Implementing Consent Mode (Code Example)

```svelte
<script>
	import { browser } from '$app/environment'

	export let measurementId
	export let requireConsent = true

	let consentGranted = $state(false)

	function initializeGA() {
		if (!browser || !measurementId) return

		window.dataLayer = window.dataLayer || []
		window.gtag = function () {
			window.dataLayer.push(arguments)
		}
		window.gtag('js', new Date())

		// Default: DENY all consent
		if (requireConsent) {
			window.gtag('consent', 'default', {
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
				analytics_storage: 'denied'
			})
		}

		// Configure GA4
		window.gtag('config', measurementId)
	}

	function grantConsent() {
		if (typeof window.gtag === 'undefined') return

		// Update: GRANT analytics only
		window.gtag('consent', 'update', {
			analytics_storage: 'granted'
		})

		consentGranted = true
	}

	$: if (browser && measurementId) {
		initializeGA()
	}
</script>

<!-- Show consent banner -->
{#if requireConsent && !consentGranted}
	<div class="consent-banner">
		<p>We use cookies to improve your experience. Do you accept analytics cookies?</p>
		<button onclick={grantConsent}>Accept</button>
		<button onclick={() => (consentGranted = true)}>Reject</button>
	</div>
{/if}
```

### Privacy-Friendly Features in GA4

GA4 has several privacy improvements over Universal Analytics:

1. **IP Anonymization by Default**: No configuration needed
2. **Consent Mode**: Adjusts tracking based on user consent
3. **Data Deletion API**: Can delete individual user data
4. **Shorter Data Retention**: Options for 2-14 months
5. **No persistent User ID**: Unless explicitly enabled

### Recommended Privacy Practices

#### For Immediate Implementation

1. **Document your decision**: Add a note in your privacy docs
2. **Use environment variables**: Easy to disable GA4 if needed
3. **Minimize data retention**: Set to 2 months in GA4 settings
4. **Don't collect PII**: Avoid tracking email, names, etc.
5. **Honor Do Not Track**: Consider respecting DNT header

#### For Future Implementation (3-6 months)

1. **Add consent banner**: Use a CMP or custom solution
2. **Implement Consent Mode V2**: Default to "denied"
3. **Create Privacy Policy**: Document data collection
4. **Create Cookie Policy**: List all cookies
5. **Add opt-out mechanism**: Let users disable tracking

### Cookie Policy Requirements

If you implement GA4, your Cookie Policy should include:

| Cookie Name         | Purpose            | Duration | Provider | Category  |
| ------------------- | ------------------ | -------- | -------- | --------- |
| \_ga                | User tracking      | 2 years  | Google   | Analytics |
| \_ga\_[container]   | Session tracking   | 2 years  | Google   | Analytics |
| \_gid               | User tracking      | 24 hours | Google   | Analytics |
| \_gat               | Request throttling | 1 minute | Google   | Analytics |
| \_\_Secure-3PSIDCC  | Ad personalization | 2 years  | Google   | Marketing |
| \_\_Secure-3PAPISID | Ad personalization | 2 years  | Google   | Marketing |

### Privacy Policy Requirements

Your Privacy Policy should mention:

- **What data is collected**: Page views, device info, location (city/country), referrer
- **Why it's collected**: Improve content, understand user behavior
- **Who processes it**: Google LLC
- **Where it's stored**: Google servers (may include US)
- **How long it's kept**: 2-14 months (specify your setting)
- **User rights**: Access, deletion, export, opt-out
- **Third-party sharing**: Google's privacy policy
- **Contact information**: How users can request data deletion

### Consent Management Platform (CMP) Options

#### Free Options

- [CookieYes](https://www.cookieyes.com/) - Free tier available
- [Termly](https://termly.io/) - Free for small sites
- Custom implementation (requires development)

#### Paid Options

- [OneTrust](https://www.onetrust.com/) - Enterprise-grade
- [Cookiebot](https://www.cookiebot.com/) - Popular in EU
- [Usercentrics](https://usercentrics.com/) - GDPR-focused

#### Recommendation for This Project

**Phase 1** (Now): No CMP, just basic GA4 with documentation
**Phase 2** (3-6 months): Custom consent banner (simple implementation)
**Phase 3** (If needed): Paid CMP if you need advanced features

### Key Privacy Takeaways

✅ **GA4 is NOT GDPR-compliant by default**
✅ **Consent is legally required in EU**
✅ **Consent Mode V2 is the recommended approach**
✅ **Privacy Policy and Cookie Policy are required**
✅ **IP anonymization is automatic in GA4**
✅ **Minimize data retention to 2 months**

❌ **Don't assume GA4 is automatically compliant**
❌ **Don't use pre-ticked checkboxes for consent**
❌ **Don't collect personal information (email, names)**
❌ **Don't ignore user data deletion requests**

### Recommended Approach for This Project

Given this is an educational/open-source project:

1. **Start simple**: Implement GA4 without consent (document the decision)
2. **Add disclaimers**: "This site uses Google Analytics to improve content"
3. **Honor DNT**: Optionally respect Do Not Track header
4. **Plan for consent**: Design the consent system for future implementation
5. **Monitor regulations**: GDPR enforcement is evolving

**Rationale**:

- Low risk: Educational content, no PII collection
- Pragmatic: Focus on value delivery first, compliance second
- Transparent: Document the approach and rationale
- Future-proof: Design allows easy consent addition later

---

## Summary of Answers

| Question                                           | Answer                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| **What GA measurement ID format is needed?**       | `G-XXXXXXXXXX` (same ID on both subdomains)                                 |
| **Does cross-domain tracking need configuration?** | **No** - GA4 handles subdomains automatically                               |
| **Best practices for implementing GA in Svelte?**  | Component-based approach in `+layout.svelte` with environment variables     |
| **Are there privacy/consent considerations?**      | **Yes** - GA4 is not GDPR-compliant by default; implement consent if needed |

---

## Next Steps

1. **Get Measurement ID** from `minimumcd.org` owner
2. **Implement component** (30 minutes)
3. **Test in staging** (1 hour)
4. **Deploy to production** (30 minutes)
5. **Verify tracking** (24 hours)
6. **Plan consent implementation** (future, if needed)

**Total Estimated Time**: 2-3 hours for basic implementation

---

**Document Version**: 1.0
**Last Updated**: 2025-10-29
**Research Agent**: Hive Mind Collective
**Status**: Complete
