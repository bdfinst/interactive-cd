# Deterministic Tests

**Category**: Testing
**Last Updated**: 2025-10-18
**Related Practices**:

- [Behavior-Driven Development](#behavior-driven-development)
- [Unit Testing](./unit-testing.md)
- [Integration Testing](./integration-testing.md)
- [Test Data Builders](./test-data-builders.md)

---

## Overview

Deterministic tests are tests that produce the same result every time they run with the same inputs. They are the foundation of **Trunk-based Development** and essential for continuous integration. Non-deterministic (flaky) tests erode trust in the test suite and slow down development.

## Why This Matters

**Trunk-based Development depends on Deterministic Tests.**

Without deterministic tests:

- Developers cannot trust failing tests (is it a real bug or flakiness?)
- CI/CD pipelines become unreliable
- Teams waste time investigating false failures
- Trunk-based development becomes impractical (can't safely merge frequently)
- Continuous Integration breaks down

**The Dependency Chain:**

```
Trunk-based Development
         ↓
Deterministic Tests
         ↓
    ┌────────────────────────┐
    ↓                        ↓
Right Behavior          Test Tooling
  & Patterns           & Infrastructure
         ↓
Testable Acceptance Criteria
         ↓
Behavior-Driven Development (BDD)
```

---

## Core Principles

1. **Same Input → Same Output**: Tests must produce identical results on every run
2. **No External Dependencies**: Tests control all inputs (time, randomness, external services)
3. **Isolated Execution**: Tests don't depend on execution order or shared state
4. **Explicit Over Implicit**: All test data and conditions are explicitly defined
5. **Fast Feedback**: Deterministic tests can run quickly in parallel

---

## What Makes Tests Non-Deterministic (Flaky)?

### 1. Time-Based Dependencies

**Problem**: Tests that depend on current time or delays

```javascript
// ❌ Non-deterministic (depends on current time)
test('sets expiry to 30 days from now', () => {
	const token = createToken()

	const expectedExpiry = new Date()
	expectedExpiry.setDate(expectedExpiry.getDate() + 30)

	expect(token.expiresAt).toEqual(expectedExpiry)
	// Fails if milliseconds differ between calls
})

// ✅ Deterministic (control time)
test('sets expiry to 30 days from creation', () => {
	const now = new Date('2025-10-18T12:00:00Z')
	const token = createToken({ now })

	const expectedExpiry = new Date('2025-11-17T12:00:00Z')

	expect(token.expiresAt).toEqual(expectedExpiry)
})
```

**Solution**: Inject time as a dependency

```javascript
// lib/auth.js
export const createToken = ({ now = new Date() } = {}) => ({
	token: crypto.randomUUID(),
	createdAt: now,
	expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
})
```

---

### 2. Random Data

**Problem**: Tests that use random values without seeding

```javascript
// ❌ Non-deterministic (random values)
test('generates user ID', () => {
	const user = createUser({ name: 'Alice' })

	expect(user.id).toBe(/* what value? it's random! */)
})

// ✅ Deterministic (predictable IDs in tests)
test('generates user ID from provided value', () => {
	const user = createUser({
		name: 'Alice',
		id: 'user-123' // Explicit ID for testing
	})

	expect(user.id).toBe('user-123')
})
```

**Solution**: Make randomness controllable

```javascript
// lib/user.js
export const createUser = ({ name, id = crypto.randomUUID() }) => ({
	id,
	name,
	createdAt: new Date()
})
```

---

### 3. External API Dependencies

**Problem**: Tests that call real external services

```javascript
// ❌ Non-deterministic (depends on external API)
test('fetches user from API', async () => {
	const user = await fetchUser('user-123')

	expect(user.name).toBe('Alice')
	// Fails if API is down or data changes
})

// ✅ Deterministic (mock external API)
test('fetches user from API', async () => {
	global.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => ({ id: 'user-123', name: 'Alice' })
	})

	const user = await fetchUser('user-123')

	expect(user.name).toBe('Alice')
})
```

**Solution**: Mock external dependencies

```javascript
// tests/utils/mocks.js
export const mockFetch = response => {
	global.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => response
	})
}
```

---

### 4. Database State Dependencies

**Problem**: Tests that depend on database state from previous tests

```javascript
// ❌ Non-deterministic (depends on test execution order)
test('creates user', async () => {
	await db.insert('users', { id: 1, name: 'Alice' })
	const users = await db.query('SELECT * FROM users')
	expect(users).toHaveLength(1) // Fails if another test already created users
})

// ✅ Deterministic (clean state before each test)
beforeEach(async () => {
	await db.query('DELETE FROM users')
})

test('creates user', async () => {
	await db.insert('users', { id: 1, name: 'Alice' })
	const users = await db.query('SELECT * FROM users')
	expect(users).toHaveLength(1)
})
```

**Solution**: Isolate test data

```javascript
// tests/setup.js
import { afterEach } from 'vitest'

afterEach(async () => {
	// Clean up all test data
	await db.query('DELETE FROM users')
	await db.query('DELETE FROM sessions')
})
```

---

### 5. Timing and Race Conditions

**Problem**: Tests that depend on timing or async operations completing in a specific order

```javascript
// ❌ Non-deterministic (race condition)
test('updates counter', async () => {
	const counter = createCounter()

	// Multiple async operations racing
	counter.increment()
	counter.increment()
	await counter.save()

	expect(counter.value).toBe(2) // May be 1 or 2 depending on timing
})

// ✅ Deterministic (await all operations)
test('updates counter', async () => {
	const counter = createCounter()

	await counter.increment()
	await counter.increment()
	await counter.save()

	expect(counter.value).toBe(2)
})
```

**Solution**: Properly await async operations

```javascript
// Ensure all promises resolve before assertions
await Promise.all([operation1(), operation2()])
```

---

### 6. Floating-Point Arithmetic

**Problem**: Tests that compare floating-point numbers with strict equality

```javascript
// ❌ Non-deterministic (floating-point precision)
test('calculates average', () => {
	const average = calculateAverage([0.1, 0.2, 0.3])

	expect(average).toBe(0.2) // May fail due to floating-point precision
})

// ✅ Deterministic (use approximate equality)
test('calculates average', () => {
	const average = calculateAverage([0.1, 0.2, 0.3])

	expect(average).toBeCloseTo(0.2, 5) // Within 5 decimal places
})
```

**Solution**: Use approximate equality for floating-point comparisons

---

## Ensuring Deterministic Tests

### Principle 1: Control All Inputs

**Tests should explicitly provide all inputs, not rely on globals or environment**

```javascript
// ❌ Relies on environment
test('formats date', () => {
	const formatted = formatDate(new Date('2025-10-18'))
	expect(formatted).toBe(/* depends on timezone */)
})

// ✅ Explicit timezone
test('formats date in UTC', () => {
	const formatted = formatDate(new Date('2025-10-18T00:00:00Z'), { timezone: 'UTC' })
	expect(formatted).toBe('2025-10-18')
})
```

---

### Principle 2: Isolate Tests

**Each test should set up its own state and clean up after itself**

```javascript
// ✅ Test isolation with beforeEach/afterEach
describe('userStore', () => {
	let store

	beforeEach(() => {
		store = createUserStore() // Fresh store for each test
	})

	afterEach(() => {
		store.reset() // Clean up
	})

	test('adds user', () => {
		store.addUser({ name: 'Alice' })
		expect(get(store).users).toHaveLength(1)
	})

	test('removes user', () => {
		store.addUser({ name: 'Alice' })
		const userId = get(store).users[0].id

		store.removeUser(userId)

		expect(get(store).users).toHaveLength(0)
	})
})
```

---

### Principle 3: Mock External Dependencies

**Never call real external services (APIs, databases, filesystems) in unit tests**

```javascript
// tests/utils/mocks.js
export const mockApi = {
	fetchUser: vi.fn().mockResolvedValue({ id: '123', name: 'Alice' }),
	createUser: vi.fn().mockResolvedValue({ id: '456', name: 'Bob' }),
	deleteUser: vi.fn().mockResolvedValue({ success: true })
}

// tests/unit/userService.test.js
import { mockApi } from '../utils/mocks'

beforeEach(() => {
	vi.clearAllMocks()
})

test('fetches user by ID', async () => {
	const user = await userService.getUser('123', { api: mockApi })

	expect(mockApi.fetchUser).toHaveBeenCalledWith('123')
	expect(user.name).toBe('Alice')
})
```

---

### Principle 4: Use Test Data Builders

**Create predictable, reusable test data**

```javascript
// tests/utils/builders.js
export const buildUser = (overrides = {}) => ({
	id: 'user-123',
	name: 'Test User',
	email: 'test@example.com',
	createdAt: new Date('2025-10-18T00:00:00Z'),
	...overrides
})

export const buildPractice = (overrides = {}) => ({
	id: 'practice-123',
	name: 'Test Practice',
	category: 'tooling',
	requirements: ['Requirement 1'],
	benefits: ['Benefit 1'],
	...overrides
})

// Usage
test('displays user name', () => {
	const user = buildUser({ name: 'Alice' })

	const { getByText } = render(UserCard, { props: { user } })

	expect(getByText('Alice')).toBeInTheDocument()
})
```

---

### Principle 5: Freeze Time and Randomness

**Control time and random values in tests**

```javascript
// Using vitest's fake timers
import { beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2025-10-18T12:00:00Z'))
})

afterEach(() => {
	vi.useRealTimers()
})

test('expires token after 30 days', () => {
	const token = createToken()

	// Fast-forward 30 days
	vi.advanceTimersByTime(30 * 24 * 60 * 60 * 1000)

	expect(isTokenExpired(token)).toBe(true)
})
```

---

## The Role of BDD in Deterministic Tests

**Behavior-Driven Development provides testable acceptance criteria that lead to deterministic tests.**

### BDD → Testable Acceptance Criteria → Deterministic Tests

**Bad (Non-Testable) Acceptance Criteria:**

```gherkin
Scenario: User logs in
  Given a user
  When they log in
  Then they should see their dashboard
```

_Problem_: Vague, no specific data, timing unclear

**Good (Testable) Acceptance Criteria:**

```gherkin
Scenario: Successful login redirects to dashboard
  Given a user with email "alice@example.com" and password "password123"
  And the user exists in the system
  When the user enters email "alice@example.com"
  And the user enters password "password123"
  And the user clicks the "Log In" button
  Then the user should be redirected to "/dashboard"
  And the user should see "Welcome, Alice"
```

_Solution_: Specific data, explicit actions, clear outcomes

### Testable Acceptance Criteria Characteristics

1. **Specific Data**: Exact values, not "some user"
2. **Explicit State**: "user exists in the system" not "a user"
3. **Clear Actions**: "clicks the Log In button" not "logs in"
4. **Measurable Outcomes**: "redirected to /dashboard" not "sees dashboard"
5. **No Timing Ambiguity**: Actions happen in sequence, not "eventually"

### From BDD to Deterministic E2E Test

```javascript
// tests/e2e/login.spec.js
import { test, expect } from '@playwright/test'

test.describe('User Login', () => {
	test('successful login redirects to dashboard', async ({ page }) => {
		// Given a user with specific credentials
		const user = {
			email: 'alice@example.com',
			password: 'password123',
			name: 'Alice'
		}

		// Setup: Ensure user exists (deterministic state)
		await setupTestUser(user)

		// When: Navigate to login page
		await page.goto('/login')

		// And: Enter specific email
		await page.fill('[data-testid="email-input"]', user.email)

		// And: Enter specific password
		await page.fill('[data-testid="password-input"]', user.password)

		// And: Click the login button
		await page.click('[data-testid="login-button"]')

		// Then: Redirected to specific URL
		await expect(page).toHaveURL('/dashboard')

		// And: See specific welcome message
		await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, Alice')
	})
})
```

**This test is deterministic because:**

- ✅ Specific test data (alice@example.com, password123)
- ✅ Controlled initial state (setupTestUser)
- ✅ Explicit actions (fill, click)
- ✅ Measurable outcomes (URL, text content)
- ✅ No timing dependencies (await ensures completion)

---

## Right Behavior & Tooling

### Right Behavior Patterns

1. **Always Clean Up Test Data**

```javascript
afterEach(async () => {
	await db.query('DELETE FROM users WHERE email LIKE "%@test.com"')
})
```

2. **Use Explicit Test Data**

```javascript
const testUser = buildUser({
	email: 'alice@test.com',
	createdAt: new Date('2025-10-18T00:00:00Z')
})
```

3. **Await All Async Operations**

```javascript
await Promise.all([user.save(), session.create()])
```

4. **Isolate External Dependencies**

```javascript
vi.mock('../api/client', () => ({
	fetchUser: vi.fn()
}))
```

### Required Tooling

1. **Mocking Library** (Vitest `vi.fn()`, `vi.mock()`)
2. **Fake Timers** (Vitest `vi.useFakeTimers()`)
3. **Test Data Builders** (`buildUser`, `buildPractice`)
4. **Database Fixtures** (Seed scripts, migrations)
5. **API Mocking** (Mock Service Worker, `vi.mock('node:fetch')`)
6. **Deterministic IDs** (Fixed UUIDs in tests)

---

## Detecting and Fixing Flaky Tests

### Detection Strategies

1. **Run Tests Multiple Times**

```bash
# Run tests 10 times to detect flakiness
for i in {1..10}; do npm test || break; done
```

2. **Run Tests in Random Order**

```javascript
// vitest.config.js
export default defineConfig({
	test: {
		sequence: {
			shuffle: true // Randomize test order
		}
	}
})
```

3. **Run Tests in Parallel**

```bash
npm test -- --reporter=verbose --pool=threads
```

### Common Fixes

| Problem         | Solution                    |
| --------------- | --------------------------- |
| Time-dependent  | Inject time as dependency   |
| Random data     | Use builders with fixed IDs |
| External API    | Mock with `vi.fn()`         |
| Database state  | Clean up in `afterEach`     |
| Race conditions | Await all promises          |
| Execution order | Isolate state per test      |
| Timing delays   | Use fake timers             |

---

## Workflow Integration

### BDD Phase

- Write Gherkin with **specific, testable acceptance criteria**
- Avoid vague terms ("a user", "eventually", "should work")
- Include explicit data values in scenarios

### ATDD Phase

- Convert Gherkin to E2E tests with **controlled test data**
- Setup deterministic initial state (`beforeEach`)
- Use explicit selectors (`data-testid`, `getByRole`)
- Clean up test data (`afterEach`)

### TDD Phase

- Write unit tests with **test data builders**
- Mock external dependencies (APIs, time, randomness)
- Ensure test isolation (no shared state)
- Verify tests pass 100 times in a row

---

## Checklist: Is My Test Deterministic?

Before committing, verify:

- [ ] Test produces the same result on every run
- [ ] Test does not depend on current time (or uses fake timers)
- [ ] Test does not use random values (or uses seeded random)
- [ ] Test does not call real external APIs (or mocks them)
- [ ] Test does not depend on database state (or cleans up)
- [ ] Test does not have race conditions (awaits all promises)
- [ ] Test does not depend on execution order
- [ ] Test can run in parallel with other tests
- [ ] Test uses explicit, predictable test data
- [ ] Test passes 10+ times in a row: `for i in {1..10}; do npm test || break; done`

---

## Examples

### Example 1: Making a Time-Dependent Test Deterministic

**Original (Non-Deterministic):**

```javascript
// lib/session.js
export const createSession = userId => ({
	id: crypto.randomUUID(),
	userId,
	createdAt: new Date(),
	expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
})

// tests/session.test.js
test('creates session expiring in 24 hours', () => {
	const session = createSession('user-123')

	const expectedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

	expect(session.expiresAt).toEqual(expectedExpiry)
	// ❌ Fails because milliseconds differ between Date.now() calls
})
```

**Refactored (Deterministic):**

```javascript
// lib/session.js - Inject time dependency
export const createSession = (userId, { now = new Date(), ttl = 24 * 60 * 60 * 1000 } = {}) => ({
	id: crypto.randomUUID(),
	userId,
	createdAt: now,
	expiresAt: new Date(now.getTime() + ttl)
})

// tests/session.test.js - Control time
test('creates session expiring in 24 hours', () => {
	const now = new Date('2025-10-18T12:00:00Z')
	const session = createSession('user-123', { now })

	const expectedExpiry = new Date('2025-10-19T12:00:00Z')

	expect(session.expiresAt).toEqual(expectedExpiry)
	// ✅ Always passes - time is controlled
})
```

---

### Example 2: Making a Database Test Deterministic

**Original (Non-Deterministic):**

```javascript
test('counts users', async () => {
	await db.insert('users', { name: 'Alice' })

	const count = await db.count('users')

	expect(count).toBe(1)
	// ❌ Fails if previous tests left data in database
})

test('finds user by name', async () => {
	const user = await db.findOne('users', { name: 'Alice' })

	expect(user.name).toBe('Alice')
	// ❌ Depends on previous test running first
})
```

**Refactored (Deterministic):**

```javascript
beforeEach(async () => {
	await db.query('DELETE FROM users')
})

test('counts users', async () => {
	await db.insert('users', { name: 'Alice' })

	const count = await db.count('users')

	expect(count).toBe(1)
	// ✅ Always passes - clean state before each test
})

test('finds user by name', async () => {
	// Setup own data - don't depend on other tests
	await db.insert('users', { name: 'Alice' })

	const user = await db.findOne('users', { name: 'Alice' })

	expect(user.name).toBe('Alice')
	// ✅ Always passes - creates own data
})
```

---

### Example 3: Making an API Test Deterministic

**Original (Non-Deterministic):**

```javascript
test('fetches practice from API', async () => {
	const practice = await fetchPractice('continuous-delivery')

	expect(practice.name).toBe('Continuous Delivery')
	// ❌ Fails if API is down or data changes
})
```

**Refactored (Deterministic):**

```javascript
test('fetches practice from API', async () => {
	// Mock the fetch call
	global.fetch = vi.fn().mockResolvedValueOnce({
		ok: true,
		json: async () => ({
			id: 'continuous-delivery',
			name: 'Continuous Delivery',
			category: 'practice'
		})
	})

	const practice = await fetchPractice('continuous-delivery')

	expect(practice.name).toBe('Continuous Delivery')
	// ✅ Always passes - mocked response is predictable
})
```

---

## Common Pitfalls

### Pitfall 1: "Tests pass locally but fail in CI"

**Problem**: Different timezone, different Node version, different environment variables
**Solution**: Use Docker for consistent environment, inject time, use explicit configuration

### Pitfall 2: "Tests pass individually but fail in suite"

**Problem**: Tests share state or depend on execution order
**Solution**: Isolate tests with `beforeEach`/`afterEach`, use test data builders

### Pitfall 3: "Tests fail randomly 1 out of 10 runs"

**Problem**: Race condition or timing issue
**Solution**: Properly await all async operations, use fake timers

### Pitfall 4: "Tests fail on weekends"

**Problem**: Time-based logic depending on day of week
**Solution**: Inject current time as dependency, use fake timers

---

## References

- [CLAUDE.md - Testing Best Practices](/CLAUDE.md#testing-pyramid)
- [TESTING-GUIDE.md - Comprehensive Testing](/docs/TESTING-GUIDE.md)
- [Test Data Builders](./test-data-builders.md)
- [Testing Anti-Patterns](./testing-anti-patterns.md)
- [Martin Fowler - Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)

---

## Summary

**Trunk-based Development requires Deterministic Tests.**

Deterministic tests depend on:

1. **Right Behavior**: Isolate tests, clean up state, explicit data
2. **Right Tooling**: Mocking, fake timers, test data builders
3. **Testable Acceptance Criteria**: Specific, measurable, explicit
4. **Behavior-Driven Development**: BDD provides testable criteria

**Every test must:**

- Control all inputs (time, randomness, external data)
- Isolate state (no dependencies between tests)
- Mock external dependencies (APIs, databases)
- Use explicit, predictable test data
- Pass 100% of the time

**Non-deterministic tests break trunk-based development and continuous integration.**

---

## Change Log

- **2025-10-18**: Initial version documenting deterministic test practices and dependency chain
