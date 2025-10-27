# Testing Best Practices Guide

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Testing Pyramid](#testing-pyramid)
4. [Test Organization](#test-organization)
5. [Naming Conventions](#naming-conventions)
6. [Unit Testing](#unit-testing)
7. [Integration Testing](#integration-testing)
8. [E2E Testing](#e2e-testing)
9. [Test Data Builders](#test-data-builders)
10. [Mocking and Fixtures](#mocking-and-fixtures)
11. [Coverage Expectations](#coverage-expectations)
12. [Test Performance](#test-performance)
13. [Common Patterns](#common-patterns)
14. [Anti-Patterns](#anti-patterns)
15. [Accessibility Testing](#accessibility-testing)
16. [CI Integration](#ci-integration)
17. [Test Maintenance](#test-maintenance)

---

## Overview

This project follows a comprehensive testing strategy aligned with **BDD → ATDD → TDD** workflow:

- **BDD (Behavior-Driven Development)**: Feature files define behavior in Gherkin
- **ATDD (Acceptance Test-Driven Development)**: E2E tests validate acceptance criteria
- **TDD (Test-Driven Development)**: Unit/integration tests drive implementation

**Core Testing Principles:**

- Tests define behavior before implementation
- Focus on user-visible behavior, not implementation details
- Maintain high test quality through Test Quality Reviewer agent
- Keep tests isolated, deterministic, and fast
- Use functional programming patterns (pure functions, immutability)

---

## Testing Strategy

### BDD → ATDD → TDD Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: BDD (Feature Definition)                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Write Gherkin feature file (features/*.feature)         │
│ 2. Review with BDD Expert agent                            │
│ 3. Validate with stakeholders                              │
│ 4. Document acceptance criteria                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: ATDD (Acceptance Tests)                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Convert Gherkin scenarios to Playwright tests           │
│ 2. Write failing E2E test                                   │
│ 3. Review with Test Quality Reviewer agent                 │
│ 4. Maintain traceability to feature file                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: TDD (Unit/Integration Tests)                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Write failing unit test (Red)                           │
│ 2. Write minimal code to pass (Green)                      │
│ 3. Refactor while keeping tests green                      │
│ 4. Review with Test Quality Reviewer agent                 │
│ 5. Repeat until feature complete                           │
└─────────────────────────────────────────────────────────────┘
```

### Test Types by Purpose

| Test Type       | Purpose                                     | Tool                     | Speed  | Coverage |
| --------------- | ------------------------------------------- | ------------------------ | ------ | -------- |
| **Unit**        | Test pure functions and business logic      | Vitest                   | Fast   | High     |
| **Integration** | Test component behavior with dependencies   | Vitest + Testing Library | Medium | Medium   |
| **E2E**         | Test user workflows and acceptance criteria | Playwright               | Slow   | Low      |

---

## Testing Pyramid

```
       /\
      /  \    E2E Tests (Playwright)
     /    \   - User acceptance criteria
    /______\  - Critical user journeys
   /        \ - Smoke tests for deployment
  /          \
 /Integration\ Integration Tests (Vitest + Testing Library)
/______________\ - Component behavior
/              \ - Store interactions
/                \ - Event handling
/                  \
/      Unit Tests    \ Unit Tests (Vitest)
/______________________\ - Pure functions
                         - Value objects
                         - Business logic

```

**Target Distribution:**

- **70% Unit Tests**: Fast, isolated, test business logic
- **20% Integration Tests**: Component behavior and interactions
- **10% E2E Tests**: Critical user flows and acceptance criteria

**Why this distribution?**

- Unit tests are fast, deterministic, and easy to maintain
- Integration tests catch component interaction bugs
- E2E tests validate critical user journeys without slowing down development

---

## Test Organization

### Directory Structure

```
interactive-cd/
├── features/                      # BDD feature files (Gherkin)
│   ├── practice-graph.feature
│   ├── practice-cards.feature
│   └── outline-view.feature
│
├── tests/
│   ├── e2e/                       # E2E tests (Playwright)
│   │   ├── practice-navigation.spec.js
│   │   └── [feature-name].spec.js
│   │
│   ├── unit/                      # Unit tests (Vitest)
│   │   ├── components/            # Component tests
│   │   │   ├── GraphNode.test.js
│   │   │   ├── Legend.test.js
│   │   │   └── SEO.test.js
│   │   │
│   │   ├── domain/                # Domain model tests
│   │   │   └── practice-catalog/
│   │   │       ├── PracticeId.test.js
│   │   │       ├── PracticeCategory.test.js
│   │   │       └── CDPractice.test.js
│   │   │
│   │   ├── application/           # Application service tests
│   │   │   └── [service].test.js
│   │   │
│   │   └── infrastructure/        # Infrastructure tests
│   │       └── [adapter].test.js
│   │
│   └── utils/                     # Test utilities
│       ├── builders.js            # Test data builders
│       ├── fixtures.js            # Test fixtures
│       └── helpers.js             # Test helpers
│
└── src/
    └── test/
        └── setup.js               # Global test setup
```

### File Naming Conventions

| File Type         | Pattern                   | Example                       |
| ----------------- | ------------------------- | ----------------------------- |
| **Unit Tests**    | `[ComponentName].test.js` | `GraphNode.test.js`           |
| **E2E Tests**     | `[feature-name].spec.js`  | `practice-navigation.spec.js` |
| **Test Builders** | `builders.js`             | `tests/utils/builders.js`     |
| **Test Fixtures** | `fixtures.js`             | `tests/utils/fixtures.js`     |
| **Feature Files** | `[feature-name].feature`  | `practice-graph.feature`      |

---

## Naming Conventions

### Test Suite Naming

**Use `describe()` for grouping related tests:**

```javascript
// ✅ Good: Clear hierarchical organization
describe('GraphNode', () => {
	describe('rendering', () => {
		it('renders practice name', () => {})
		it('renders category indicators', () => {})
	})

	describe('selection state', () => {
		it('shows description when selected', () => {})
		it('hides description when not selected', () => {})
	})

	describe('user interactions', () => {
		it('calls onClick when clicked', () => {})
	})

	describe('accessibility', () => {
		it('includes category information in aria-label', () => {})
	})

	describe('edge cases', () => {
		it('handles practice with no benefits', () => {})
	})
})
```

**Nested describes for component sections:**

```javascript
describe('ComponentName', () => {
	describe('feature group', () => {
		it('specific behavior', () => {})
	})
})
```

### Test Case Naming

**Use descriptive test names that explain the behavior:**

```javascript
// ✅ Good: Describes expected behavior
it('renders practice name', () => {})
it('shows description when selected', () => {})
it('calls onClick when clicked', () => {})
it('throws error when id is empty string', () => {})
it('returns true for same ID values', () => {})

// ❌ Bad: Vague or implementation-focused
it('works', () => {})
it('test component', () => {})
it('sets state', () => {})
it('calls function', () => {})
```

### E2E Test Naming

**Use `test.describe()` and `test()` for E2E:**

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
	test('user can complete primary workflow', async ({ page }) => {
		// Test implementation
	})

	test('shows error message for invalid input', async ({ page }) => {
		// Test implementation
	})
})
```

**Map Gherkin scenarios to E2E tests:**

```javascript
// Feature file: practice-graph.feature
// Scenario: Display root practice node

test.describe('Practice Dependency Graph', () => {
	test('displays root practice node', async ({ page }) => {
		// Given I am on the CD Practices application
		await page.goto('/')

		// Then I should see a graph node for "Continuous Delivery"
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()

		// And the node should display the practice title
		await expect(page.getByText('Continuous Delivery')).toBeVisible()
	})
})
```

---

## Unit Testing

### Test Pure Functions

**Pure functions are the easiest to test:**

```javascript
// lib/validators.js
export const isValidEmail = email => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export const validatePracticeId = id => {
	if (!id || typeof id !== 'string' || id.trim() === '') {
		throw new Error('Practice ID cannot be empty')
	}

	const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
	if (!kebabCaseRegex.test(id)) {
		throw new Error('Practice ID must be in kebab-case format')
	}

	return id
}
```

**Test:**

```javascript
// lib/validators.test.js
import { describe, it, expect } from 'vitest'
import { isValidEmail, validatePracticeId } from './validators'

describe('isValidEmail', () => {
	it('returns true for valid email', () => {
		expect(isValidEmail('user@example.com')).toBe(true)
	})

	it('returns false for invalid email', () => {
		expect(isValidEmail('invalid-email')).toBe(false)
	})

	it('returns false for null', () => {
		expect(isValidEmail(null)).toBe(false)
	})
})

describe('validatePracticeId', () => {
	it('accepts valid kebab-case IDs', () => {
		const validIds = ['continuous-delivery', 'trunk-based-development', 'version-control']

		validIds.forEach(id => {
			expect(() => validatePracticeId(id)).not.toThrow()
		})
	})

	it('throws error when id is empty string', () => {
		expect(() => validatePracticeId('')).toThrow('Practice ID cannot be empty')
	})

	it('throws error when id is not kebab-case', () => {
		expect(() => validatePracticeId('Continuous Delivery')).toThrow(
			'Practice ID must be in kebab-case format'
		)
	})
})
```

### Test Value Objects

**Value objects enforce domain invariants:**

```javascript
// domain/practice-catalog/value-objects/PracticeId.test.js
import { describe, it, expect } from 'vitest'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

describe('PracticeId', () => {
	describe('from', () => {
		it('creates a PracticeId from a valid string', () => {
			const id = PracticeId.from('continuous-integration')

			expect(PracticeId.is(id)).toBe(true)
			expect(id.toString()).toBe('continuous-integration')
		})

		it('throws error when id is null', () => {
			expect(() => PracticeId.from(null)).toThrow('Practice ID cannot be empty')
		})

		it('validates kebab-case format', () => {
			expect(() => PracticeId.from('Continuous Integration')).toThrow(
				'Practice ID must be in kebab-case format'
			)
		})
	})

	describe('equals', () => {
		it('returns true for same ID values', () => {
			const id1 = PracticeId.from('continuous-integration')
			const id2 = PracticeId.from('continuous-integration')

			expect(id1.equals(id2)).toBe(true)
		})

		it('returns false for different ID values', () => {
			const id1 = PracticeId.from('continuous-integration')
			const id2 = PracticeId.from('continuous-delivery')

			expect(id1.equals(id2)).toBe(false)
		})
	})

	describe('immutability', () => {
		it('cannot be modified after creation', () => {
			const id = PracticeId.from('continuous-integration')

			expect(() => {
				id.value = 'something-else'
			}).toThrow()

			expect(Object.isFrozen(id)).toBe(true)
		})
	})
})
```

### Test Domain Entities with Functional Approach

**Use functional transformations instead of mutable methods:**

```javascript
// domain/practice-catalog/entities/CDPractice.test.js
import { describe, it, expect } from 'vitest'
import {
	createCDPractice,
	withRequirement,
	withBenefit,
	pipePractice
} from '$domain/practice-catalog/entities/CDPractice.js'

describe('CDPractice (Functional)', () => {
	const validId = PracticeId.from('continuous-integration')
	const validCategory = PracticeCategory.BEHAVIOR

	describe('createCDPractice', () => {
		it('creates an immutable practice', () => {
			const practice = createCDPractice(
				validId,
				'Continuous Integration',
				validCategory,
				'Build and test on every commit'
			)

			expect(practice.id).toBe(validId)
			expect(practice.name).toBe('Continuous Integration')
			expect(Object.isFrozen(practice)).toBe(true)
		})
	})

	describe('withRequirement', () => {
		it('returns new practice with requirement added', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const updated = withRequirement(practice, 'Must have automated tests')

			// Original unchanged
			expect(practice.requirements).toEqual([])
			// New practice has requirement
			expect(updated.requirements).toEqual(['Must have automated tests'])
			// Returns new object
			expect(updated).not.toBe(practice)
		})
	})

	describe('composition', () => {
		it('pipePractice composes transformations left-to-right', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			const transform = pipePractice(
				p => withRequirement(p, 'Req 1'),
				p => withRequirement(p, 'Req 2'),
				p => withBenefit(p, 'Benefit 1')
			)

			const result = transform(practice)

			expect(result.requirements).toEqual(['Req 1', 'Req 2'])
			expect(result.benefits).toEqual(['Benefit 1'])
			expect(practice.requirements).toEqual([]) // Original unchanged
		})
	})
})
```

### AAA Pattern (Arrange-Act-Assert)

**Structure every test using AAA:**

```javascript
describe('PracticeStore', () => {
	it('adds practice to store', () => {
		// Arrange: Set up test data and initial state
		const store = createPracticeStore()
		const practice = buildPractice({ id: 'test-practice' })

		// Act: Execute the code being tested
		store.addPractice(practice)

		// Assert: Verify the expected outcome
		const state = get(store)
		expect(state.practices).toContainEqual(practice)
		expect(state.practices.length).toBe(1)
	})
})
```

---

## Integration Testing

### Component Testing with Svelte Testing Library

**Test user-visible behavior, not implementation:**

```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import GraphNode from '$lib/components/GraphNode.svelte'
import { buildPractice } from '../../utils/builders.js'

describe('GraphNode', () => {
	describe('rendering', () => {
		it('renders practice name', () => {
			// Arrange
			const practice = buildPractice({ name: 'Continuous Integration' })

			// Act
			const { getByText } = render(GraphNode, { props: { practice } })

			// Assert
			expect(getByText('Continuous Integration')).toBeInTheDocument()
		})

		it('renders category indicators', () => {
			const practice = buildPractice({ categories: ['behavior', 'tooling'] })
			const { container } = render(GraphNode, { props: { practice } })

			const categoryDots = container.querySelectorAll('.w-3\\.5')
			expect(categoryDots.length).toBe(2)
		})
	})

	describe('selection state', () => {
		it('shows description when selected', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { getByText } = render(GraphNode, {
				props: { practice, isSelected: true }
			})

			expect(getByText('Test description')).toBeInTheDocument()
		})

		it('hides description when not selected', () => {
			const practice = buildPractice({ description: 'Test description' })
			const { queryByText } = render(GraphNode, {
				props: { practice, isSelected: false }
			})

			expect(queryByText('Test description')).not.toBeInTheDocument()
		})
	})

	describe('user interactions', () => {
		it('calls onClick when clicked', async () => {
			const practice = buildPractice()
			const handleClick = vi.fn()
			const { getByTestId } = render(GraphNode, {
				props: { practice, onClick: handleClick }
			})

			await fireEvent.click(getByTestId('graph-node'))

			expect(handleClick).toHaveBeenCalledOnce()
		})
	})

	describe('accessibility', () => {
		it('includes category information in aria-label', () => {
			const practice = buildPractice({ categories: ['behavior', 'tooling'] })
			const { container } = render(GraphNode, { props: { practice } })

			const categoryContainer = container.querySelector('[role="img"]')
			expect(categoryContainer?.getAttribute('aria-label')).toContain('behavior')
			expect(categoryContainer?.getAttribute('aria-label')).toContain('tooling')
		})
	})
})
```

### Store Testing

**Test stores using functional composition:**

```javascript
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

	it('adds custom amount', () => {
		const store = createCounter(0)
		store.add(5)
		expect(get(store)).toBe(5)
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

### Async Operations

**Mock fetch API and test error handling:**

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPractices } from './api'

describe('fetchPractices', () => {
	beforeEach(() => {
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('fetches data successfully', async () => {
		const mockData = [{ id: 'ci', name: 'Continuous Integration' }]
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockData
		})

		const result = await fetchPractices()

		expect(result).toEqual(mockData)
		expect(global.fetch).toHaveBeenCalledWith('/api/practices')
	})

	it('throws error on failed request', async () => {
		global.fetch.mockResolvedValueOnce({
			ok: false,
			status: 404
		})

		await expect(fetchPractices()).rejects.toThrow('HTTP error! status: 404')
	})

	it('throws error on network failure', async () => {
		global.fetch.mockRejectedValueOnce(new Error('Network error'))

		await expect(fetchPractices()).rejects.toThrow('Failed to fetch')
	})
})
```

---

## E2E Testing

### E2E Test Structure

**Map feature files to E2E tests:**

```javascript
// features/practice-graph.feature
// Scenario: Display root practice node

import { test, expect } from '@playwright/test'

test.describe('Practice Dependency Graph', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('displays root practice node', async ({ page }) => {
		// Given I am on the CD Practices application
		// (handled in beforeEach)

		// When I visit the homepage
		// (already there)

		// Then I should see a graph node for "Continuous Delivery"
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()

		// And the node should display the practice title
		const rootNode = page.locator('[data-testid="graph-node"]').first()
		const practiceId = await rootNode.getAttribute('data-practice-id')
		expect(practiceId).toBeTruthy()
	})

	test('shows practice details when selected', async ({ page }) => {
		// Wait for selected practice
		await page.waitForSelector('[data-selected="true"]')

		// Practice description should be visible
		await expect(page.locator('[data-selected="true"] p').first()).toBeVisible()
	})
})
```

### E2E Best Practices

**1. Use data-testid for stable selectors:**

```javascript
// ✅ Good: Stable selector
await page.locator('[data-testid="graph-node"]').click()

// ❌ Bad: Fragile selector
await page.locator('.node-class-123').click()
```

**2. Wait for elements explicitly:**

```javascript
// ✅ Good: Explicit wait
await page.waitForSelector('[data-testid="graph-node"]')
await page.locator('[data-testid="graph-node"]').click()

// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(1000)
```

**3. Group related tests with beforeEach:**

```javascript
test.describe('Practice Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')
	})

	test('can select practice', async ({ page }) => {
		// Tests start with page already loaded
	})
})
```

**4. Use Playwright's auto-waiting:**

```javascript
// Playwright waits automatically
await expect(page.locator('[data-testid="welcome"]')).toBeVisible()
await page.click('[data-testid="button"]')
```

### Critical User Journeys

**Focus E2E tests on critical paths:**

```javascript
test.describe('Critical User Journey: Practice Navigation', () => {
	test('user can navigate through practice dependencies', async ({ page }) => {
		// 1. Visit homepage
		await page.goto('/')
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()

		// 2. Select root practice
		const rootNode = page.locator('[data-testid="graph-node"]').first()
		await rootNode.click()
		await expect(rootNode).toHaveAttribute('data-selected', 'true')

		// 3. Expand dependencies
		const expandButton = page.locator('button:has-text("Expand Dependencies")').first()
		if (await expandButton.isVisible()) {
			await expandButton.click()
			await page.waitForTimeout(500)
		}

		// 4. Verify dependencies are visible
		const nodeCount = await page.locator('[data-testid="graph-node"]').count()
		expect(nodeCount).toBeGreaterThan(1)

		// 5. Select dependency
		await page.locator('[data-testid="graph-node"]').nth(1).click()
		const selectedNode = page.locator('[data-testid="graph-node"]').nth(1)
		await expect(selectedNode).toHaveAttribute('data-selected', 'true')
	})
})
```

---

## Test Data Builders

### Builder Pattern

**Create reusable test data builders:**

```javascript
// tests/utils/builders.js

/**
 * Build a practice object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Practice object
 */
export const buildPractice = (overrides = {}) => ({
	id: 'test-practice',
	name: 'Test Practice',
	category: 'behavior',
	categories: ['behavior'],
	description: 'A test practice for unit testing',
	benefits: ['Improved test coverage', 'Better code quality'],
	requirements: [],
	dependencies: [],
	dependencyCount: 0,
	benefitCount: 2,
	...overrides
})

/**
 * Build a practice with dependencies
 * @param {Object} overrides - Properties to override
 * @returns {Object} Practice with dependencies
 */
export const buildPracticeWithDependencies = (overrides = {}) => ({
	...buildPractice(),
	dependencyCount: 3,
	dependencies: [
		buildPractice({ id: 'dep-1', name: 'Dependency 1' }),
		buildPractice({ id: 'dep-2', name: 'Dependency 2' }),
		buildPractice({ id: 'dep-3', name: 'Dependency 3' })
	],
	...overrides
})

/**
 * Build a minimal practice (leaf node)
 * @param {Object} overrides - Properties to override
 * @returns {Object} Minimal practice
 */
export const buildMinimalPractice = (overrides = {}) => ({
	id: 'minimal-practice',
	name: 'Minimal Practice',
	category: 'tooling',
	categories: ['tooling'],
	description: 'Minimal test practice',
	benefits: [],
	requirements: [],
	dependencies: [],
	dependencyCount: 0,
	benefitCount: 0,
	...overrides
})

/**
 * Build an array of practices
 * @param {number} count - Number of practices to create
 * @param {Object} baseOverrides - Base overrides for all practices
 * @returns {Array} Array of practices
 */
export const buildPractices = (count, baseOverrides = {}) => {
	return Array.from({ length: count }, (_, i) =>
		buildPractice({
			...baseOverrides,
			id: `practice-${i + 1}`,
			name: `Practice ${i + 1}`
		})
	)
}
```

### Using Builders in Tests

```javascript
import { buildPractice, buildPracticeWithDependencies } from '../../utils/builders'

describe('GraphNode', () => {
	it('renders practice name', () => {
		// Use builder with custom overrides
		const practice = buildPractice({ name: 'Continuous Integration' })
		const { getByText } = render(GraphNode, { props: { practice } })

		expect(getByText('Continuous Integration')).toBeInTheDocument()
	})

	it('shows expand button when practice has dependencies', () => {
		// Use specialized builder
		const practice = buildPracticeWithDependencies()
		const { getByText } = render(GraphNode, {
			props: { practice, isSelected: true, onExpand: vi.fn() }
		})

		expect(getByText(/Expand Dependencies/)).toBeInTheDocument()
	})
})
```

### API Response Builders

```javascript
/**
 * Build API response structure
 * @param {Array} data - Practice data
 * @param {Object} overrides - Response overrides
 * @returns {Object} API response
 */
export const buildApiResponse = (data = [], overrides = {}) => ({
	success: true,
	data,
	...overrides
})

/**
 * Build API error response
 * @param {string} message - Error message
 * @param {Object} overrides - Response overrides
 * @returns {Object} Error response
 */
export const buildApiError = (message = 'Test error', overrides = {}) => ({
	success: false,
	error: message,
	...overrides
})
```

---

## Mocking and Fixtures

### Mocking Functions with Vitest

```javascript
import { vi } from 'vitest'

describe('Component with callbacks', () => {
	it('calls onClick when clicked', async () => {
		const handleClick = vi.fn()
		const { getByTestId } = render(GraphNode, {
			props: { practice: buildPractice(), onClick: handleClick }
		})

		await fireEvent.click(getByTestId('graph-node'))

		expect(handleClick).toHaveBeenCalledOnce()
	})

	it('calls callback with correct arguments', async () => {
		const handleExpand = vi.fn()
		const practice = buildPractice({ id: 'test-practice' })
		const { getByText } = render(GraphNode, {
			props: { practice, isSelected: true, onExpand: handleExpand }
		})

		await fireEvent.click(getByText(/Expand Dependencies/))

		expect(handleExpand).toHaveBeenCalledWith('test-practice')
	})
})
```

### Mocking API Calls

```javascript
import { vi, beforeEach, afterEach } from 'vitest'

describe('API integration', () => {
	beforeEach(() => {
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('fetches practices successfully', async () => {
		const mockPractices = buildPractices(3)
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => buildApiResponse(mockPractices)
		})

		const result = await fetchPractices()

		expect(result.data).toEqual(mockPractices)
		expect(global.fetch).toHaveBeenCalledWith('/api/practices')
	})
})
```

### Fixture Files

**Create fixture files for complex test data:**

```javascript
// tests/utils/fixtures.js

export const practiceFixtures = {
	continuousDelivery: {
		id: 'continuous-delivery',
		name: 'Continuous Delivery',
		category: 'practice',
		categories: ['practice'],
		description: 'Ability to get changes into production safely and quickly',
		benefits: ['Improved delivery performance', 'Higher quality releases', 'Better team culture'],
		dependencyCount: 6
	},

	continuousIntegration: {
		id: 'continuous-integration',
		name: 'Continuous Integration',
		category: 'practice',
		categories: ['practice'],
		description: 'Integrate code changes frequently',
		benefits: ['Faster feedback', 'Reduced integration issues'],
		dependencyCount: 4
	}
}

export const categoryFixtures = {
	practice: { name: 'practice', icon: '🔄', color: '#3b82f6' },
	behavior: { name: 'behavior', icon: '👥', color: '#10b981' },
	culture: { name: 'culture', icon: '🌟', color: '#f59e0b' },
	tooling: { name: 'tooling', icon: '🛠️', color: '#8b5cf6' }
}
```

---

## Coverage Expectations

### Coverage Targets

| Layer                    | Coverage Target | Why                                      |
| ------------------------ | --------------- | ---------------------------------------- |
| **Domain Layer**         | 95-100%         | Business logic must be thoroughly tested |
| **Application Layer**    | 85-95%          | Service coordination and use cases       |
| **Infrastructure Layer** | 70-85%          | Adapters and external integrations       |
| **UI Components**        | 80-90%          | User-facing behavior                     |
| **Overall**              | 80%+            | Maintain high confidence in codebase     |

### Running Coverage Reports

```bash
# Run unit tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm test -- --coverage --reporter=html
```

### Coverage Configuration

```javascript
// vite.config.js
export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'tests/', '**/*.config.js', '**/*.spec.js', '**/*.test.js'],
			statements: 80,
			branches: 75,
			functions: 80,
			lines: 80
		}
	}
})
```

### What to Focus Coverage On

**✅ High Value Coverage:**

- Domain logic (value objects, entities, domain services)
- Business rules and validations
- Critical user workflows (E2E)
- Error handling and edge cases
- Security-sensitive code

**❌ Low Value Coverage:**

- Generated code
- Simple getters/setters
- Configuration files
- Third-party library wrappers

---

## Test Performance

### Keep Tests Fast

**Target performance:**

- Unit tests: < 10ms per test
- Integration tests: < 100ms per test
- E2E tests: < 5s per test

### Performance Best Practices

**1. Use test.concurrent for parallel execution:**

```javascript
import { describe, it } from 'vitest'

describe.concurrent('Fast parallel tests', () => {
	it('test 1', async () => {
		/* ... */
	})
	it('test 2', async () => {
		/* ... */
	})
	it('test 3', async () => {
		/* ... */
	})
})
```

**2. Avoid unnecessary setup:**

```javascript
// ✅ Good: Minimal setup
describe('PracticeId', () => {
	it('creates valid ID', () => {
		const id = PracticeId.from('test-id')
		expect(id.toString()).toBe('test-id')
	})
})

// ❌ Bad: Excessive setup
describe('PracticeId', () => {
	beforeEach(() => {
		// Unnecessary database connection
		// Unnecessary API calls
	})

	it('creates valid ID', () => {
		const id = PracticeId.from('test-id')
		expect(id.toString()).toBe('test-id')
	})
})
```

**3. Mock expensive operations:**

```javascript
// Mock API calls instead of real network requests
global.fetch = vi.fn().mockResolvedValue({
	ok: true,
	json: async () => mockData
})
```

**4. Use test-specific builds:**

```javascript
// vite.config.js
export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		// Skip source maps in tests for faster execution
		sourcemap: false
	}
})
```

---

## Common Patterns

### Pattern 1: Testing Immutability

```javascript
describe('immutability', () => {
	it('cannot be modified after creation', () => {
		const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

		expect(() => {
			practice.name = 'New Name'
		}).toThrow()

		expect(Object.isFrozen(practice)).toBe(true)
	})
})
```

### Pattern 2: Testing Function Composition

```javascript
describe('composition', () => {
	it('pipePractice composes transformations', () => {
		const practice = createCDPractice(validId, 'Name', validCategory, 'Desc')

		const transform = pipePractice(
			p => withRequirement(p, 'Req 1'),
			p => withBenefit(p, 'Benefit 1')
		)

		const result = transform(practice)

		expect(result.requirements).toEqual(['Req 1'])
		expect(result.benefits).toEqual(['Benefit 1'])
		expect(practice.requirements).toEqual([]) // Original unchanged
	})
})
```

### Pattern 3: Testing Error Boundaries

```javascript
describe('error handling', () => {
	it('throws descriptive error for invalid input', () => {
		expect(() => validatePracticeId('')).toThrow('Practice ID cannot be empty')
		expect(() => validatePracticeId('Invalid')).toThrow('must be in kebab-case')
	})
})
```

### Pattern 4: Testing Conditional Rendering

```javascript
describe('conditional rendering', () => {
	it('shows expand button when has dependencies', () => {
		const practice = buildPractice({ dependencyCount: 3 })
		const { getByText } = render(GraphNode, {
			props: { practice, isSelected: true, onExpand: vi.fn() }
		})

		expect(getByText(/Expand Dependencies/)).toBeInTheDocument()
	})

	it('hides expand button when no dependencies', () => {
		const practice = buildMinimalPractice()
		const { queryByText } = render(GraphNode, {
			props: { practice, isSelected: true, onExpand: vi.fn() }
		})

		expect(queryByText(/Expand Dependencies/)).not.toBeInTheDocument()
	})
})
```

### Pattern 5: Testing Event Propagation

```javascript
describe('event propagation', () => {
	it('prevents propagation when expand button is clicked', async () => {
		const handleClick = vi.fn()
		const handleExpand = vi.fn()
		const practice = buildPractice({ dependencyCount: 3 })

		const { getByText } = render(GraphNode, {
			props: { practice, isSelected: true, onClick: handleClick, onExpand: handleExpand }
		})

		await fireEvent.click(getByText(/Expand Dependencies/))

		expect(handleExpand).toHaveBeenCalledOnce()
		expect(handleClick).not.toHaveBeenCalled() // Propagation stopped
	})
})
```

---

## Anti-Patterns

### Anti-Pattern 1: Testing Implementation Details

```javascript
// ❌ Bad: Testing internal state
it('sets loading state to true', () => {
	const component = render(MyComponent)
	expect(component.instance().state.loading).toBe(true)
})

// ✅ Good: Testing user-visible behavior
it('shows loading spinner while fetching data', () => {
	const { getByTestId } = render(MyComponent)
	expect(getByTestId('loading-spinner')).toBeVisible()
})
```

### Anti-Pattern 2: Brittle Selectors

```javascript
// ❌ Bad: CSS class-based selector
await page.click('.css-class-xyz-123')

// ✅ Good: data-testid selector
await page.click('[data-testid="submit-button"]')
```

### Anti-Pattern 3: Over-Mocking

```javascript
// ❌ Bad: Mocking everything
vi.mock('./module-a')
vi.mock('./module-b')
vi.mock('./module-c')
// What are we actually testing?

// ✅ Good: Mock only external dependencies
vi.mock('node-fetch') // External API
// Test actual implementation
```

### Anti-Pattern 4: Non-Deterministic Tests

```javascript
// ❌ Bad: Relies on timing
it('updates after delay', async () => {
	component.update()
	await new Promise(resolve => setTimeout(resolve, 100))
	expect(component.state).toBe('updated')
})

// ✅ Good: Wait for specific condition
it('updates after delay', async () => {
	component.update()
	await waitFor(() => {
		expect(component.state).toBe('updated')
	})
})
```

### Anti-Pattern 5: Testing Multiple Behaviors

```javascript
// ❌ Bad: Tests too much
it('handles user workflow', () => {
	component.login()
	expect(user.isLoggedIn).toBe(true)
	component.createPost()
	expect(posts.length).toBe(1)
	component.logout()
	expect(user.isLoggedIn).toBe(false)
})

// ✅ Good: One behavior per test
it('logs user in successfully', () => {
	component.login()
	expect(user.isLoggedIn).toBe(true)
})

it('creates new post when logged in', () => {
	// Setup: user is logged in
	component.createPost()
	expect(posts.length).toBe(1)
})
```

### Anti-Pattern 6: Incomplete Error Testing

```javascript
// ❌ Bad: Only tests happy path
it('creates practice', () => {
	const practice = createPractice('valid-id', 'Name')
	expect(practice.id).toBe('valid-id')
})

// ✅ Good: Tests error cases
describe('createPractice', () => {
	it('creates practice with valid inputs', () => {
		const practice = createPractice('valid-id', 'Name')
		expect(practice.id).toBe('valid-id')
	})

	it('throws error when id is empty', () => {
		expect(() => createPractice('', 'Name')).toThrow('ID cannot be empty')
	})

	it('throws error when name is empty', () => {
		expect(() => createPractice('valid-id', '')).toThrow('Name is required')
	})
})
```

---

## Accessibility Testing

### Test Semantic HTML

```javascript
describe('accessibility', () => {
	it('uses semantic heading for title', () => {
		const { container } = render(Legend)

		const heading = container.querySelector('h3')
		expect(heading).toBeInTheDocument()
		expect(heading?.textContent).toBe('Requires')
	})

	it('uses list semantics for categories', () => {
		const { container } = render(Legend)

		const list = container.querySelector('ul.list-none')
		expect(list).toBeInTheDocument()
	})
})
```

### Test ARIA Attributes

```javascript
describe('ARIA attributes', () => {
	it('includes category information in aria-label', () => {
		const practice = buildPractice({ categories: ['behavior', 'tooling'] })
		const { container } = render(GraphNode, { props: { practice } })

		const categoryContainer = container.querySelector('[role="img"]')
		expect(categoryContainer?.getAttribute('aria-label')).toContain('behavior')
		expect(categoryContainer?.getAttribute('aria-label')).toContain('tooling')
	})

	it('provides accessible button labels', () => {
		const { getByRole } = render(ExpandButton)

		const button = getByRole('button', { name: /Expand Dependencies/i })
		expect(button).toBeInTheDocument()
	})
})
```

### Test Keyboard Navigation

```javascript
describe('keyboard navigation', () => {
	it('includes focus styles for keyboard navigation', () => {
		const practice = buildPractice()
		const { getByTestId } = render(GraphNode, { props: { practice } })

		const node = getByTestId('graph-node')
		expect(node.className).toContain('focus:outline-none')
		expect(node.className).toContain('focus:ring-2')
	})

	it('can be activated with Enter key', async () => {
		const handleClick = vi.fn()
		const { getByTestId } = render(GraphNode, {
			props: { practice: buildPractice(), onClick: handleClick }
		})

		const node = getByTestId('graph-node')
		await fireEvent.keyDown(node, { key: 'Enter' })

		expect(handleClick).toHaveBeenCalled()
	})
})
```

### Test Color Contrast

```javascript
describe('color accessibility', () => {
	it('does not rely solely on color for information', () => {
		const { container } = render(PracticeNode)

		// Categories use both color AND icon
		const categoryIcon = container.querySelector('[role="img"]')
		expect(categoryIcon).toBeInTheDocument()

		// Status uses both color AND text
		expect(container.textContent).toContain('Selected')
	})
})
```

---

## CI Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Pre-Commit Hooks

```json
// package.json
{
	"lint-staged": {
		"*.{js,svelte}": ["npm run lint:fix", "npm run format:fix", "npm test -- --run --changed"]
	}
}
```

### CI Performance Optimization

```javascript
// playwright.config.js
export default defineConfig({
	// Run fewer workers in CI
	workers: process.env.CI ? 1 : undefined,

	// Retry failed tests in CI
	retries: process.env.CI ? 2 : 0,

	// Don't allow test.only in CI
	forbidOnly: !!process.env.CI,

	// Use trace on first retry
	use: {
		trace: 'on-first-retry'
	}
})
```

---

## Test Maintenance

### Keeping Tests Green

**1. Fix Failing Tests Immediately:**

- Don't commit code with failing tests
- Don't skip tests without documenting why
- Don't disable test temporarily without creating a task

**2. Refactor Tests When Code Changes:**

```javascript
// When refactoring component, update tests to match
// Old implementation
it('calls setLoading when fetching', () => {
	component.fetchData()
	expect(mockSetLoading).toHaveBeenCalled()
})

// New implementation (using loading state differently)
it('shows loading spinner while fetching', () => {
	component.fetchData()
	expect(getByTestId('loading-spinner')).toBeVisible()
})
```

**3. Remove Obsolete Tests:**

```javascript
// When removing a feature, remove its tests
describe('Deprecated Feature', () => {
	// ❌ Delete these tests when feature is removed
})
```

### Handling Flaky Tests

**1. Identify flaky tests:**

```bash
# Run tests multiple times to catch flakiness
npm test -- --run --reporter=verbose --repeat=10
```

**2. Common causes of flakiness:**

- Race conditions (use proper waitFor)
- Non-deterministic data (use fixed test data)
- External dependencies (mock them)
- Time-based logic (mock Date/timers)

**3. Fix flaky tests:**

```javascript
// ❌ Flaky: Race condition
it('loads data', async () => {
	loadData()
	expect(data).toBeDefined()
})

// ✅ Fixed: Wait for condition
it('loads data', async () => {
	loadData()
	await waitFor(() => {
		expect(data).toBeDefined()
	})
})
```

### Test Documentation

**Document complex test setup:**

```javascript
describe('Complex Feature', () => {
	/**
	 * Setup explanation:
	 * 1. Create practice with specific dependencies
	 * 2. Mock API to return specific data
	 * 3. Simulate user navigating to practice detail
	 *
	 * This tests the edge case where a practice has circular dependencies.
	 */
	it('handles circular dependencies gracefully', async () => {
		// Test implementation
	})
})
```

### Reviewing Test Quality

**Use Test Quality Reviewer agent regularly:**

```bash
# After writing or updating tests
# Run Test Quality Reviewer agent to check:
# - Tests focus on behavior, not implementation
# - Tests would catch real bugs
# - Tests are maintainable and clear
# - No brittle selectors or anti-patterns
```

---

## Summary

### Testing Checklist

**Before Writing Code:**

- [ ] Write Gherkin feature file (BDD)
- [ ] Review with BDD Expert agent
- [ ] Convert to E2E test (ATDD)
- [ ] Write failing unit test (TDD)

**During Development:**

- [ ] Follow Red-Green-Refactor cycle
- [ ] Keep tests isolated and fast
- [ ] Use test data builders
- [ ] Focus on behavior, not implementation

**Before Committing:**

- [ ] All tests pass locally
- [ ] Run Test Quality Reviewer agent
- [ ] Coverage meets targets (80%+)
- [ ] No skipped or disabled tests
- [ ] E2E tests pass for critical flows

**In Code Review:**

- [ ] Tests are clear and maintainable
- [ ] Tests would catch regressions
- [ ] No anti-patterns present
- [ ] Accessibility tested where relevant

---

## Additional Resources

- **CLAUDE.md**: Full development workflow guide
- **Test Quality Reviewer Agent**: `.claude/agents/test-quality-reviewer.md`
- **BDD Expert Agent**: `.claude/agents/bdd-expert.md`
- **Vitest Documentation**: <https://vitest.dev>
- **Playwright Documentation**: <https://playwright.dev>
- **Testing Library**: <https://testing-library.com/docs/svelte-testing-library/intro>

---

**Remember:**

> "Tests are a love letter to the future maintainer of your code. Make them clear, focused, and reliable."

**Test First, Think Functionally, Refactor Confidently.**
