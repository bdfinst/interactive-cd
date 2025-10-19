# Svelte/SvelteKit Best Practices (2024-2025)

**Research Date:** 2025-10-18
**Focus:** BDD → ATDD → TDD workflow with Functional Programming principles

---

## Table of Contents

1. [Component Organization](#component-organization)
2. [State Management Patterns](#state-management-patterns)
3. [Routing and Data Loading](#routing-and-data-loading)
4. [Performance Optimization](#performance-optimization)
5. [Accessibility Guidelines](#accessibility-guidelines)
6. [Testing Strategies](#testing-strategies)
7. [SEO Best Practices](#seo-best-practices)
8. [Common Anti-Patterns to Avoid](#common-anti-patterns-to-avoid)
9. [Functional Programming Patterns](#functional-programming-patterns)

---

## Component Organization

### Project Structure Approaches

SvelteKit's `src/routes` directory uses filesystem-based routing with `$lib` for library code and `$lib/server` for server-only modules.

**Two Main Organizational Strategies:**

#### 1. Co-location (Recommended for 2024-2025)

Co-locate route-specific components near where they're used, keeping only truly reusable components in `$lib`.

```
src/
├── lib/
│   ├── components/     # Reusable cross-cutting components
│   ├── utils/          # Pure utility functions
│   └── stores/         # Global stores
└── routes/
    ├── dashboard/
    │   ├── +page.svelte
    │   ├── +page.server.js
    │   ├── DashboardCard.svelte    # Route-specific component
    │   └── dashboardHelpers.js     # Route-specific logic
    └── login/
        ├── +page.svelte
        ├── +page.server.js
        └── LoginForm.svelte
```

**Why co-location?**

- Keeps related code together
- Reduces cognitive overhead
- Easier to find and modify components
- Aligns with SvelteKit demo apps
- Works well with ORMs (Prisma, Drizzle)

#### 2. Library Separation (Alternative)

Keep all components, models, and types in `$lib` with routes purely handling route logic.

**Use this when:**

- Building component libraries
- Need strict separation of concerns
- Working with complex shared domain models

### Key Rules

- All files can run on the server
- All files run on the client except `+server` files
- `+layout` and `+error` files apply to subdirectories
- Use `$lib/server` for server-only code (prevents client imports)

---

## State Management Patterns

### Component-Level State (Svelte 5 Runes)

**Recommended for 2024-2025:** Use Svelte 5's universal reactivity (runes) instead of traditional stores when possible.

```javascript
<script>
  // Simple reactive state
  let count = $state(0);

  // Derived state
  let doubled = $derived(count * 2);

  // Effect (side effects)
  $effect(() => {
    console.log(`Count is ${count}`);
  });
</script>
```

### Stores (Global State)

**Three types of stores:**

1. **Writable** - Read and write access
2. **Readable** - Read-only, useful for external data sources
3. **Derived** - Computed from other stores

```javascript
// stores/counter.js
import { writable } from 'svelte/store'

export const createCounter = (initialValue = 0) => {
	const { subscribe, update, set } = writable(initialValue)

	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(initialValue),
		add: amount => update(n => n + amount)
	}
}

export const counter = createCounter()
```

**Usage in components:**

```svelte
<script>
	import { counter } from '$lib/stores/counter'

	// Auto-subscribe with $ prefix
	$: currentValue = $counter
</script>

<p>Count: {$counter}</p>
<button on:click={counter.increment}>+</button>
```

### Important Considerations

**DON'T use stores on the server in SvelteKit!**

```javascript
// ❌ BAD - Server stores are shared across requests
import { writable } from 'svelte/store'
export const userStore = writable(null) // Shared across all users!

// ✅ GOOD - Use event.locals for request-scoped data
export async function load({ locals }) {
	return {
		user: locals.user
	}
}
```

**State Management Decision Tree:**

```
Is it component-local state?
├─ Yes → Use $state() rune
└─ No → Is it global state?
    ├─ Yes → Use stores (client-side only)
    └─ No → Is it request-scoped?
        └─ Yes → Use event.locals + load functions
```

### Context API

For localized sharing within a component tree:

```javascript
// Parent.svelte
<script>
  import { setContext } from 'svelte';

  setContext('theme', {
    mode: 'dark',
    toggle: () => { /* ... */ }
  });
</script>

// Child.svelte
<script>
  import { getContext } from 'svelte';

  const theme = getContext('theme');
</script>
```

---

## Routing and Data Loading

### Filesystem-Based Routing

Routes are defined by directory structure:

```
src/routes/
├── +page.svelte              # /
├── about/
│   └── +page.svelte          # /about
├── blog/
│   ├── +page.svelte          # /blog
│   └── [slug]/
│       └── +page.svelte      # /blog/my-post
└── api/
    └── users/
        └── +server.js        # /api/users
```

### Load Functions

**Two types of load functions:**

#### 1. Server Load (`+page.server.js`)

Runs only on the server:

```javascript
// src/routes/blog/[slug]/+page.server.js
export async function load({ params }) {
	const post = await db.posts.findUnique({
		where: { slug: params.slug }
	})

	return {
		post
	}
}
```

**Use when:**

- Accessing database directly
- Using private environment variables
- Need server-side only code

#### 2. Universal Load (`+page.js`)

Runs on server during SSR and browser during hydration:

```javascript
// src/routes/blog/+page.js
export async function load({ fetch }) {
	const response = await fetch('/api/posts')
	const posts = await response.json()

	return {
		posts
	}
}
```

**Use when:**

- Fetching from external APIs without credentials
- Need same code on server and client
- Want client-side navigation without re-fetching

### Data Flow Pattern

```
1. User navigates to /blog/my-post
2. SvelteKit calls load function
3. load function returns data
4. Data available as $page.data in components
5. Component renders with data
```

### Hooks

**Server Hooks (`hooks.server.js`):**

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
	// Runs on every request
	const session = await getSession(event.cookies.get('sessionid'))

	// Make available to load functions via event.locals
	event.locals.user = session?.user || null

	const response = await resolve(event)
	return response
}

export function handleError({ error, event }) {
	// Log errors
	console.error(error)

	return {
		message: 'An error occurred',
		code: error?.code ?? 'UNKNOWN'
	}
}
```

**Passing data via event.locals:**

```javascript
// hooks.server.js
event.locals.user = user

// +page.server.js
export async function load({ locals }) {
	return {
		user: locals.user
	}
}
```

### Route Files Cheat Sheet

| File                | Runs On         | Purpose            |
| ------------------- | --------------- | ------------------ |
| `+page.svelte`      | Server + Client | UI component       |
| `+page.js`          | Server + Client | Universal load     |
| `+page.server.js`   | Server only     | Server load        |
| `+layout.svelte`    | Server + Client | Layout UI          |
| `+layout.js`        | Server + Client | Layout load        |
| `+layout.server.js` | Server only     | Layout server load |
| `+server.js`        | Server only     | API endpoint       |
| `+error.svelte`     | Server + Client | Error boundary     |

---

## Performance Optimization

### Automatic Code Splitting

SvelteKit automatically code-splits by route:

```
routes/
├── dashboard/     # Separate chunk
├── settings/      # Separate chunk
└── profile/       # Separate chunk
```

Each route becomes a separate chunk loaded on demand.

### Lazy Loading Components

For conditionally rendered components, use dynamic imports:

```svelte
<script>
	let showModal = false

	// Only load when needed
	async function openModal() {
		const { default: Modal } = await import('./Modal.svelte')
		showModal = true
	}
</script>

{#if showModal}
	{#await import('./Modal.svelte') then { default: Modal }}
		<Modal />
	{/await}
{/if}
```

### Preloading Data

Speed up navigation by preloading:

```svelte
<script>
	import { preloadData } from '$app/navigation'
</script>

<a href="/blog/post-1" on:mouseenter={() => preloadData('/blog/post-1')}> Read article </a>
```

### Image Optimization

```svelte
<script>
	// Lazy load images
	export let src
	export let alt
</script>

<img {src} {alt} loading="lazy" decoding="async" />
```

### Bundle Size Optimization

**Analyze bundle:**

```bash
npm run build
# Check .svelte-kit/output for chunk sizes
```

**Tree-shaking:**

```javascript
// ✅ GOOD - Named imports enable tree-shaking
import { map, filter } from 'lodash-es'

// ❌ BAD - Imports entire library
import _ from 'lodash'
```

### Performance Checklist

- [ ] Use route-based code splitting (automatic)
- [ ] Lazy load non-critical components
- [ ] Preload data on hover/focus
- [ ] Optimize images (lazy loading, responsive)
- [ ] Minimize third-party dependencies
- [ ] Use HTTP/2 for better caching
- [ ] Enable compression (gzip/brotli)
- [ ] Monitor bundle sizes

---

## Accessibility Guidelines

### Built-in Accessibility Warnings

Svelte is an "a11y-first framework" with compiler warnings for:

- Missing `alt` attributes on images
- Incorrect ARIA roles
- Missing keyboard event handlers
- Non-interactive elements with click handlers
- Form accessibility issues

### ARIA Best Practices

#### 1. Use Semantic HTML First

```svelte
<!-- ✅ GOOD - Semantic HTML -->
<button on:click={handleClick}>Click me</button>

<!-- ❌ BAD - Non-semantic with ARIA -->
<div role="button" tabindex="0" on:click={handleClick}>Click me</div>
```

#### 2. Avoid Redundant Roles

```svelte
<!-- ❌ BAD - Redundant role -->
<button role="button">Click</button>

<!-- ✅ GOOD - No role needed -->
<button>Click</button>
```

#### 3. Use `aria-current` for Navigation

```svelte
<script>
	import { page } from '$app/stores'
</script>

<nav>
	<a href="/home" aria-current={$page.url.pathname === '/home' ? 'page' : undefined}> Home </a>
</nav>

<style>
	a[aria-current='page'] {
		font-weight: bold;
	}
</style>
```

### Keyboard Accessibility

```svelte
<script>
	function handleKeydown(event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleClick()
		}
	}
</script>

<!-- If you use on:click, also add on:keydown -->
<div role="button" tabindex="0" on:click={handleClick} on:keydown={handleKeydown}>
	Interactive element
</div>
```

### Form Accessibility

```svelte
<form>
	<label for="email">
		Email address
		<input
			id="email"
			type="email"
			name="email"
			aria-required="true"
			aria-invalid={errors.email ? 'true' : 'false'}
			aria-describedby={errors.email ? 'email-error' : undefined}
		/>
	</label>

	{#if errors.email}
		<p id="email-error" role="alert">
			{errors.email}
		</p>
	{/if}
</form>
```

### Language Attribute

Update `src/app.html`:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

### SvelteKit's ARIA Live Region

SvelteKit automatically announces page changes to screen readers using an ARIA live region during client-side navigation.

### Focus Management

```svelte
<script>
	import { onMount } from 'svelte'

	let dialogElement

	onMount(() => {
		// Focus first interactive element
		dialogElement.querySelector('button')?.focus()
	})
</script>

<dialog bind:this={dialogElement}>
	<h2>Dialog Title</h2>
	<button>Action</button>
</dialog>
```

### Accessibility Checklist

- [ ] Use semantic HTML elements
- [ ] Add `alt` text to images
- [ ] Ensure keyboard navigation works
- [ ] Use proper ARIA attributes (sparingly)
- [ ] Test with screen readers
- [ ] Set correct `lang` attribute
- [ ] Provide focus indicators
- [ ] Ensure sufficient color contrast
- [ ] Make forms accessible with labels
- [ ] Use `aria-live` for dynamic content

---

## Testing Strategies

### Testing Pyramid for Svelte

```
       /\
      /  \     E2E (Playwright)
     /____\    - User flows
    /      \   - Critical paths
   /________\  Integration (Vitest + Testing Library)
  /          \ - Component behavior
 /____________\ Unit (Vitest)
               - Pure functions
```

### Unit Testing with Vitest

**Test pure functions:**

```javascript
// lib/utils/validators.js
export const isValidEmail = email => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

// lib/utils/validators.test.js
import { describe, it, expect } from 'vitest'
import { isValidEmail } from './validators'

describe('isValidEmail', () => {
	it('returns true for valid email', () => {
		expect(isValidEmail('user@example.com')).toBe(true)
	})

	it('returns false for invalid email', () => {
		expect(isValidEmail('invalid-email')).toBe(false)
	})
})
```

### Component Testing with Testing Library

**Query Priority (Best to Worst):**

1. `getByRole` - Accessibility tree (BEST)
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort (WORST)

```javascript
// components/Counter.test.js
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Counter from './Counter.svelte'

describe('Counter Component', () => {
	it('increments count when button clicked', async () => {
		const { getByRole, getByText } = render(Counter)

		// ✅ GOOD - Use getByRole for accessibility
		const incrementButton = getByRole('button', { name: /increment/i })

		await fireEvent.click(incrementButton)

		expect(getByText('Count: 1')).toBeInTheDocument()
	})
})
```

### When to Use `data-testid`

Use sparingly - only when semantic queries aren't practical:

```svelte
<!-- For complex component structures -->
<div data-testid="complex-widget">
	<!-- Complex nested structure -->
</div>
```

```javascript
// In E2E tests (Playwright)
const widget = page.locator('[data-testid="complex-widget"]')
await expect(widget).toBeVisible()
```

### E2E Testing with Playwright

**Focus on user flows:**

```javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
	test('user can log in successfully', async ({ page }) => {
		// Given: User is on login page
		await page.goto('/login')

		// When: User enters credentials and submits
		await page.fill('[name="email"]', 'user@example.com')
		await page.fill('[name="password"]', 'password123')
		await page.click('button[type="submit"]')

		// Then: User is redirected to dashboard
		await expect(page).toHaveURL('/dashboard')
		await expect(page.locator('h1')).toContainText('Dashboard')
	})
})
```

### Testing Best Practices

#### 1. AAA Pattern

```javascript
it('updates user name', async () => {
	// Arrange
	const user = { id: 1, name: 'John' }

	// Act
	const updated = updateUserName(user, 'Jane')

	// Assert
	expect(updated.name).toBe('Jane')
	expect(updated.id).toBe(1) // Unchanged
})
```

#### 2. Test Behavior, Not Implementation

```javascript
// ❌ BAD - Testing implementation
it('calls handleClick when button clicked', () => {
	const spy = vi.spyOn(component, 'handleClick')
	// ...
})

// ✅ GOOD - Testing behavior
it('increments counter when button clicked', async () => {
	const { getByRole, getByText } = render(Counter)
	const button = getByRole('button', { name: /increment/i })

	await fireEvent.click(button)

	expect(getByText('Count: 1')).toBeInTheDocument()
})
```

#### 3. Keep Tests Isolated

```javascript
// ❌ BAD - Tests depend on each other
let sharedState

it('creates user', () => {
	sharedState = createUser()
})

it('updates user', () => {
	updateUser(sharedState) // Depends on previous test
})

// ✅ GOOD - Independent tests
it('creates user', () => {
	const user = createUser()
	expect(user).toBeDefined()
})

it('updates user', () => {
	const user = createUser() // Fresh state
	const updated = updateUser(user)
	expect(updated).toBeDefined()
})
```

#### 4. Use Test Helpers

```javascript
// test/helpers/builders.js
export const buildUser = (overrides = {}) => ({
	id: crypto.randomUUID(),
	email: 'test@example.com',
	name: 'Test User',
	createdAt: new Date().toISOString(),
	...overrides
})

// Usage
const user = buildUser({ email: 'custom@example.com' })
```

#### 5. Mock External Dependencies

```javascript
import { vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		json: async () => ({ data: 'mock' })
	})
)
```

### Store Testing

```javascript
// stores/counter.test.js
import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { createCounter } from './counter'

describe('Counter Store', () => {
	it('initializes with default value', () => {
		const store = createCounter()
		expect(get(store)).toBe(0)
	})

	it('increments by 1', () => {
		const store = createCounter(5)
		store.increment()
		expect(get(store)).toBe(6)
	})

	it('resets to initial value', () => {
		const store = createCounter(10)
		store.increment()
		store.increment()
		store.reset()
		expect(get(store)).toBe(10)
	})
})
```

### Testing Complex Components

For components with two-way bindings, context, or snippets:

```javascript
// Create wrapper component for testing
import { render } from '@testing-library/svelte'
import ComplexComponent from './ComplexComponent.svelte'

const TestWrapper = {
	Component: ComplexComponent,
	props: {
		// Test-specific props
	}
}

const { container } = render(TestWrapper)
```

### Mocking in E2E Tests

Use MSW (Mock Service Worker) for API mocking:

```javascript
// tests/mocks/handlers.js
import { http, HttpResponse } from 'msw'

export const handlers = [
	http.get('/api/users', () => {
		return HttpResponse.json([
			{ id: 1, name: 'John' },
			{ id: 2, name: 'Jane' }
		])
	})
]
```

### Testing Checklist

- [ ] Write tests before implementation (TDD)
- [ ] Use semantic queries (getByRole, etc.)
- [ ] Test user behavior, not implementation
- [ ] Keep tests isolated and independent
- [ ] Use AAA pattern (Arrange, Act, Assert)
- [ ] Mock external dependencies
- [ ] Avoid over-testing with E2E (slow)
- [ ] Extract logic to pure functions when possible
- [ ] Use test builders for complex data
- [ ] Focus on critical user flows

---

## SEO Best Practices

### Essential Meta Tags

Every page should have:

```svelte
<!-- src/routes/+page.svelte -->
<svelte:head>
	<title>Page Title - Site Name</title>
	<meta name="description" content="Clear, concise page description" />
	<link rel="canonical" href="https://example.com/page" />
</svelte:head>
```

### Open Graph Tags

**Recommended image sizes:**

- Facebook/LinkedIn: 1200px × 627px
- WhatsApp/Signal: 400px × 400px (square)
- Twitter: 800px × 418px

```svelte
<svelte:head>
	<!-- Essential OG tags -->
	<meta property="og:title" content="Page Title" />
	<meta property="og:description" content="Page description" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://example.com/page" />
	<meta property="og:locale" content="en_US" />

	<!-- Multiple images for different platforms -->
	<meta property="og:image" content="https://example.com/og-image-1200x627.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="627" />
	<meta property="og:image" content="https://example.com/og-image-400x400.jpg" />
	<meta property="og:image:width" content="400" />
	<meta property="og:image:height" content="400" />

	<!-- Twitter Card (falls back to OG tags) -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://example.com/twitter-800x418.jpg" />
</svelte:head>
```

### Dynamic Meta Tags

```javascript
// src/routes/blog/[slug]/+page.server.js
export async function load({ params }) {
	const post = await getPost(params.slug)

	return {
		post,
		meta: {
			title: post.title,
			description: post.excerpt,
			image: post.coverImage,
			url: `https://example.com/blog/${params.slug}`
		}
	}
}
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
	export let data
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:image" content={data.meta.image} />
	<meta property="og:url" content={data.meta.url} />
</svelte:head>
```

### SEO Component Pattern

```svelte
<!-- lib/components/SEO.svelte -->
<script>
  export let title;
  export let description;
  export let image = '/default-og-image.jpg';
  export let url;
  export let type = 'website';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />

  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<!-- Usage -->
<script>
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="My Blog Post"
  description="Learn about SvelteKit best practices"
  image="https://example.com/post-image.jpg"
  url="https://example.com/blog/sveltekit-best-practices"
/>
```

### JSON-LD Structured Data

```svelte
<svelte:head>
	{@html `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${data.post.title}",
      "description": "${data.post.excerpt}",
      "image": "${data.post.coverImage}",
      "datePublished": "${data.post.publishedAt}",
      "author": {
        "@type": "Person",
        "name": "${data.post.author.name}"
      }
    }
    </script>
  `}
</svelte:head>
```

### SEO Packages

Consider using established packages:

- **svelte-seo** - Comprehensive SEO helper
- **svelte-meta-tags** - Dedicated meta tag management

### SEO Checklist

- [ ] Unique title and description per page
- [ ] Canonical URLs
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Structured data (JSON-LD)
- [ ] Responsive OG images (1200×627, 400×400)
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Semantic HTML structure

---

## Common Anti-Patterns to Avoid

### 1. Using Stores on the Server

```javascript
// ❌ BAD - Server-side stores are shared across requests
// src/lib/stores/user.js
import { writable } from 'svelte/store'
export const currentUser = writable(null)

// ✅ GOOD - Use event.locals for request-scoped data
// src/hooks.server.js
export async function handle({ event, resolve }) {
	event.locals.user = await getUser(event.cookies)
	return resolve(event)
}
```

### 2. Not Trusting User Input

```javascript
// ❌ BAD - Only client-side validation
<script>
  function handleSubmit() {
    if (!isValidEmail(email)) {
      // Client-side only
    }
  }
</script>

// ✅ GOOD - Both client and server validation
// +page.svelte (client)
<script>
  function handleSubmit() {
    if (!isValidEmail(email)) {
      errors.email = 'Invalid email';
    }
  }
</script>

// +page.server.js (server)
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');

    if (!isValidEmail(email)) {
      return fail(400, { email, error: 'Invalid email' });
    }
  }
};
```

### 3. Accidental Redirect Consumption

```javascript
// ❌ BAD - Catching thrown redirects
export async function load() {
	try {
		// Some logic
		throw redirect(303, '/login')
	} catch (error) {
		// This catches the redirect!
		console.error(error)
	}
}

// ✅ GOOD - Let redirects propagate
export async function load() {
	// Some logic
	throw redirect(303, '/login') // Not caught
}
```

### 4. Modal State Surviving Page Changes

```javascript
// ❌ BAD - Modal in layout with page-specific state
// +layout.svelte
<script>
  let showModal = false;
  let modalContent = '';
</script>

{#if showModal}
  <Modal>{modalContent}</Modal>
{/if}

<slot />

// ✅ GOOD - Modal in specific pages or use URL state
// +page.svelte
<script>
  let showModal = false;
</script>

{#if showModal}
  <Modal>Page-specific content</Modal>
{/if}
```

### 5. Not Repopulating Forms After Validation Errors

```javascript
// ❌ BAD - User must re-enter everything
<input name="email" />

// ✅ GOOD - Preserve valid values
<script>
  export let form; // From form actions
</script>

<input
  name="email"
  value={form?.email ?? ''}
/>
{#if form?.errors?.email}
  <p>{form.errors.email}</p>
{/if}
```

### 6. Forgetting Action Attributes

```svelte
<!-- ❌ BAD - No action attribute for named actions -->
<form method="POST">
	<button>Submit</button>
</form>

<!-- ✅ GOOD - Include action for named handlers -->
<form method="POST" action="?/register">
	<button>Register</button>
</form>
```

### 7. Over-Testing with E2E

```javascript
// ❌ BAD - Testing edge cases with slow E2E tests
test('validates 20 different email formats', async ({ page }) => {
	// Slow and fragile
})

// ✅ GOOD - Use unit tests for edge cases
describe('email validation', () => {
	const testCases = [
		'user@example.com',
		'user+tag@example.com'
		// ... 18 more cases
	]

	testCases.forEach(email => {
		it(`validates ${email}`, () => {
			expect(isValidEmail(email)).toBe(true)
		})
	})
})
```

### 8. Not Handling Component Reuse

```svelte
<!-- ❌ BAD - Derived state doesn't update on navigation -->
<script>
  import { page } from '$app/stores';

  // This might not update when navigating
  let userId = $page.params.id;
</script>

<!-- ✅ GOOD - Use reactive declarations -->
<script>
  import { page } from '$app/stores';

  $: userId = $page.params.id; // Updates on navigation
</script>
```

### 9. Mixing Server and Client Code

```javascript
// ❌ BAD - Importing server code in client
// +page.svelte
import { db } from '$lib/server/database' // Error!

// ✅ GOOD - Use load functions
// +page.server.js
import { db } from '$lib/server/database'

export async function load() {
	return {
		users: await db.users.findMany()
	}
}
```

### 10. Ignoring Accessibility Warnings

```svelte
<!-- ❌ BAD - Suppressing all warnings -->
<!-- svelte-ignore a11y-* -->
<div on:click={handleClick}>Click me</div>

<!-- ✅ GOOD - Fix the actual issue -->
<button on:click={handleClick}>Click me</button>
```

---

## Functional Programming Patterns

### Pure Functions

Functions with same input → same output, no side effects:

```javascript
// ✅ GOOD - Pure function
export const calculateTotal = items => {
	return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ GOOD - Pure transformation
export const addItem = (cart, item) => {
	return [...cart, { ...item, id: crypto.randomUUID() }]
}

// ❌ BAD - Mutates input
export const addItemMutating = (cart, item) => {
	cart.push(item) // Mutation!
	return cart
}
```

### Immutability

Always create new data structures:

```javascript
// Array operations
const users = [{ id: 1, name: 'John' }]

// ✅ GOOD - Immutable operations
const withNewUser = [...users, { id: 2, name: 'Jane' }]
const withoutFirst = users.filter(u => u.id !== 1)
const updated = users.map(u => (u.id === 1 ? { ...u, name: 'Johnny' } : u))

// Object operations
const user = { id: 1, name: 'John', age: 30 }

// ✅ GOOD - Immutable update
const olderUser = { ...user, age: 31 }
const withEmail = { ...user, email: 'john@example.com' }
```

### Function Composition

Build complex operations from simple functions:

```javascript
// utils/compose.js
export const compose =
	(...fns) =>
	x =>
		fns.reduceRight((acc, fn) => fn(acc), x)

export const pipe =
	(...fns) =>
	x =>
		fns.reduce((acc, fn) => fn(acc), x)

// utils/transformers.js
export const trim = str => str.trim()
export const toLowerCase = str => str.toLowerCase()
export const removeSpaces = str => str.replace(/\s+/g, '')

export const normalizeEmail = pipe(trim, toLowerCase, removeSpaces)

// Usage
const email = normalizeEmail('  User@Example.com  ')
// Result: 'user@example.com'
```

### Higher-Order Functions

Functions that take or return functions:

```javascript
// utils/array.js
export const map = fn => array => array.map(fn)
export const filter = predicate => array => array.filter(predicate)
export const reduce = (fn, initial) => array => array.reduce(fn, initial)

// Usage
const double = x => x * 2
const isEven = x => x % 2 === 0
const sum = (acc, x) => acc + x

const processNumbers = pipe(filter(isEven), map(double), reduce(sum, 0))

const result = processNumbers([1, 2, 3, 4, 5])
// Result: 12 (evens: [2, 4], doubled: [4, 8], sum: 12)
```

### Reactive Declarations as Pure Transformations

```svelte
<script>
	import { pipe } from '$lib/utils/compose'

	let items = []
	let searchTerm = ''
	let sortBy = 'name'

	// Pure functions
	const filterBySearch = term => items =>
		items.filter(item => item.name.toLowerCase().includes(term.toLowerCase()))

	const sortByField = field => items => [...items].sort((a, b) => a[field].localeCompare(b[field]))

	// Reactive declaration using composition
	$: processedItems = pipe(filterBySearch(searchTerm), sortByField(sortBy))(items)
</script>

{#each processedItems as item}
	<div>{item.name}</div>
{/each}
```

### Declarative Event Handlers

```svelte
<script>
	import { validateLoginForm } from '$lib/utils/validators'

	let formData = { email: '', password: '' }
	let errors = {}

	// Higher-order function returning handler
	const handleInputChange = field => event => {
		formData = { ...formData, [field]: event.target.value }
	}

	const handleSubmit = onSuccess => async event => {
		event.preventDefault()

		const validation = validateLoginForm(formData)

		if (!validation.isValid) {
			errors = validation.errors
			return
		}

		try {
			await onSuccess(formData)
		} catch (error) {
			errors = { form: error.message }
		}
	}

	async function loginUser(credentials) {
		// API call
	}
</script>

<form on:submit={handleSubmit(loginUser)}>
	<input value={formData.email} on:input={handleInputChange('email')} />
	<input type="password" value={formData.password} on:input={handleInputChange('password')} />
	<button type="submit">Login</button>
</form>
```

### Stores as Functional State

```javascript
// stores/shoppingCart.js
import { writable } from 'svelte/store'

export const createShoppingCart = () => {
	const { subscribe, update } = writable([])

	// All operations are pure transformations
	const addItem = item => update(items => [...items, { ...item, id: crypto.randomUUID() }])

	const removeItem = itemId => update(items => items.filter(item => item.id !== itemId))

	const updateQuantity = (itemId, quantity) =>
		update(items => items.map(item => (item.id === itemId ? { ...item, quantity } : item)))

	const clear = () => update(() => [])

	return {
		subscribe,
		addItem,
		removeItem,
		updateQuantity,
		clear
	}
}

export const cart = createShoppingCart()
```

### Derived Stores as Computed Values

```javascript
// stores/cart.js
import { derived } from 'svelte/store'
import { cart } from './shoppingCart'

// Pure computation
export const cartTotal = derived(cart, $cart =>
	$cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export const cartItemCount = derived(cart, $cart =>
	$cart.reduce((count, item) => count + item.quantity, 0)
)

export const cartTax = derived(cartTotal, $total => $total * 0.08)

export const cartGrandTotal = derived([cartTotal, cartTax], ([$total, $tax]) => $total + $tax)
```

### Functional Programming Principles Summary

1. **Pure Functions** - Predictable, testable, no side effects
2. **Immutability** - Never mutate, always create new
3. **Composition** - Build complex from simple
4. **Higher-Order Functions** - Functions as values
5. **Declarative** - What, not how
6. **Referential Transparency** - Can replace function call with result

**Benefits:**

- Easier to test
- Easier to reason about
- Easier to refactor
- Fewer bugs
- Better for concurrent operations

---

## Summary: Key Takeaways

### Architecture

- ✅ Co-locate route-specific code
- ✅ Keep reusable components in `$lib`
- ✅ Use `$lib/server` for server-only code
- ✅ Prefer Svelte 5 runes over stores (when possible)
- ✅ Never use stores on the server

### Performance

- ✅ Leverage automatic code splitting
- ✅ Lazy load non-critical components
- ✅ Preload data on hover/focus
- ✅ Optimize images (lazy, responsive)
- ✅ Monitor bundle sizes

### Accessibility

- ✅ Use semantic HTML first
- ✅ Avoid redundant ARIA
- ✅ Test with keyboard navigation
- ✅ Use `aria-current` for navigation
- ✅ Set correct `lang` attribute

### Testing

- ✅ Follow BDD → ATDD → TDD workflow
- ✅ Prefer `getByRole` over `getByTestId`
- ✅ Test behavior, not implementation
- ✅ Keep tests isolated
- ✅ Use unit tests for edge cases, E2E for flows

### SEO

- ✅ Unique title/description per page
- ✅ Include Open Graph tags
- ✅ Use multiple image sizes (1200×627, 400×400)
- ✅ Add JSON-LD structured data
- ✅ Generate sitemap.xml

### Functional Programming

- ✅ Write pure functions
- ✅ Maintain immutability
- ✅ Use composition and higher-order functions
- ✅ Keep side effects at boundaries
- ✅ Make stores functional and composable

### Anti-Patterns to Avoid

- ❌ Using stores on the server
- ❌ Only client-side validation
- ❌ Catching thrown redirects
- ❌ Not repopulating forms after errors
- ❌ Over-testing with E2E
- ❌ Ignoring accessibility warnings
- ❌ Mixing server and client code

---

## Additional Resources

### Official Documentation

- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Svelte Examples](https://svelte.dev/examples)

### Testing

- [Vitest Documentation](https://vitest.dev)
- [Testing Library - Svelte](https://testing-library.com/docs/svelte-testing-library/intro)
- [Playwright Documentation](https://playwright.dev)

### Community

- [Svelte Discord](https://svelte.dev/chat)
- [Svelte Reddit](https://reddit.com/r/sveltejs)
- [Awesome Svelte](https://github.com/TheComputerM/awesome-svelte)

---

**Last Updated:** 2025-10-18
**Framework Versions:** Svelte 5.x, SvelteKit 2.x
**Testing:** Vitest 2.x, Playwright 1.x
