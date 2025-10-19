# Deterministic Tests - Critical Dependency Chain Integration

**Date**: 2025-10-18
**Key Insight**: Trunk-based Development has a dependency on Deterministic Tests

---

## The Critical Dependency Chain

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

## Why This Matters

### Trunk-based Development Requires Deterministic Tests

Without deterministic (non-flaky) tests:

- Developers cannot trust failing tests
- Teams waste time investigating false failures
- CI/CD pipelines become unreliable
- Frequent merging to trunk becomes risky
- Continuous Integration breaks down

### Deterministic Tests Require Two Foundations

#### 1. Right Behavior & Patterns

- Isolate test state (no shared state between tests)
- Clean up test data (beforeEach/afterEach)
- Use explicit, predictable test data
- Await all async operations properly
- Control all inputs (time, randomness)

#### 2. Test Tooling & Infrastructure

- Mocking libraries (Vitest `vi.fn()`, `vi.mock()`)
- Fake timers (Vitest `vi.useFakeTimers()`)
- Test data builders (`buildUser`, `buildPractice`)
- Database fixtures and migrations
- API mocking capabilities

### Testable Acceptance Criteria → Deterministic Tests

**Bad (Non-Testable) Criteria:**

```gherkin
Scenario: User logs in
  Given a user
  When they log in
  Then they should see their dashboard
```

_Problem_: Vague, no specific data, timing unclear → leads to flaky tests

**Good (Testable) Criteria:**

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

_Solution_: Specific data, explicit state, clear actions → leads to deterministic tests

### BDD Provides Testable Acceptance Criteria

**Behavior-Driven Development creates the foundation:**

1. **Specific Data**: "user with email alice@example.com" not "a user"
2. **Explicit State**: "user exists in the system" not implied
3. **Clear Actions**: "clicks the Log In button" not "logs in"
4. **Measurable Outcomes**: "redirected to /dashboard" not "sees dashboard"
5. **No Timing Ambiguity**: Actions happen in sequence, fully awaited

**Result**: BDD → Testable Criteria → Deterministic Tests → Trunk-based Development

---

## How This Is Documented

### 1. New Practice Document Created

**File**: `/docs/practices/02-testing/deterministic-tests.md`

**Contents**:

- Complete guide to writing deterministic tests
- 6 common causes of flakiness (time, randomness, APIs, database, race conditions, floating-point)
- 5 principles for ensuring determinism
- The role of BDD in creating deterministic tests
- Right behavior patterns and required tooling
- Detection and fixing strategies
- Comprehensive examples with before/after refactoring
- Checklist for verifying test determinism

**Key Sections**:

- What Makes Tests Non-Deterministic
- Ensuring Deterministic Tests (5 principles)
- The Role of BDD in Deterministic Tests
- Right Behavior & Tooling
- Detecting and Fixing Flaky Tests
- Examples (time-dependent, database, API tests)

---

### 2. Integration with Main Development Guide

**File**: `/CLAUDE.md`

**Updates**:

- Added "Critical Dependency: Deterministic Tests" section in Philosophy
- Visual dependency chain diagram
- Explanation of why this matters
- Link to comprehensive deterministic tests guide

**Location**: CLAUDE.md lines 24-45

---

### 3. Integration with Practices Index

**File**: `/docs/practices/README.md`

**Updates**:

- Highlighted deterministic tests as "Foundation of trunk-based development"
- Added critical dependency chain diagram
- Linked to detailed practice document
- Emphasized importance in testing category

**Location**: docs/practices/README.md lines 50-59

---

## Practical Impact

### For Developers

**Before** (without this guidance):

- Flaky tests accepted as "just how tests are"
- Time wasted investigating false failures
- Trunk-based development difficult due to unreliable tests
- CI/CD pipelines frequently "red" with no real issues

**After** (with this guidance):

- Clear understanding of what causes flakiness
- Specific patterns to avoid non-determinism
- Tooling and techniques to ensure determinism
- Confidence in trunk-based development

### For the Project

**Enables**:

- ✅ Reliable trunk-based development
- ✅ Frequent integration to main branch
- ✅ Trustworthy CI/CD pipeline
- ✅ Fast feedback loops
- ✅ Reduced investigation time

**Prevents**:

- ❌ Flaky tests that erode trust
- ❌ False failures blocking development
- ❌ Wasted time on investigation
- ❌ Fear of frequent merging
- ❌ Breakdown of continuous integration

---

## Connection to Project Philosophy

This aligns perfectly with the project's BDD → ATDD → TDD approach:

### BDD Phase (Feature Definition)

- Write Gherkin with **specific, testable acceptance criteria**
- Avoid vague terms that lead to non-deterministic tests
- Include explicit data values in scenarios

### ATDD Phase (Acceptance Tests)

- Convert Gherkin to E2E tests with **controlled, predictable test data**
- Setup deterministic initial state
- Use explicit selectors and assertions
- Clean up test data after each test

### TDD Phase (Unit/Integration Tests)

- Write unit tests with **test data builders** (predictable data)
- Mock external dependencies (time, APIs, randomness)
- Ensure test isolation (no shared state)
- Verify tests pass 100% of the time

---

## Key Practices from the Document

### 1. Control All Inputs

```javascript
// ❌ Non-deterministic (depends on current time)
const token = createToken()

// ✅ Deterministic (inject time)
const now = new Date('2025-10-18T12:00:00Z')
const token = createToken({ now })
```

### 2. Use Test Data Builders

```javascript
// tests/utils/builders.js
export const buildUser = (overrides = {}) => ({
	id: 'user-123',
	name: 'Test User',
	email: 'test@example.com',
	createdAt: new Date('2025-10-18T00:00:00Z'),
	...overrides
})
```

### 3. Mock External Dependencies

```javascript
// ✅ Mock API calls
global.fetch = vi.fn().mockResolvedValueOnce({
	ok: true,
	json: async () => ({ id: '123', name: 'Alice' })
})
```

### 4. Isolate Test State

```javascript
beforeEach(async () => {
	await db.query('DELETE FROM users')
})
```

### 5. Use Fake Timers

```javascript
beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2025-10-18T12:00:00Z'))
})
```

---

## Verification Checklist

Every test must satisfy these criteria:

- [ ] Produces same result on every run
- [ ] Does not depend on current time (or uses fake timers)
- [ ] Does not use random values (or uses seeded/injected IDs)
- [ ] Does not call real external APIs (or mocks them)
- [ ] Does not depend on database state (or cleans up)
- [ ] Does not have race conditions (awaits all promises)
- [ ] Does not depend on execution order
- [ ] Can run in parallel with other tests
- [ ] Uses explicit, predictable test data
- [ ] Passes 10+ times in a row

**Verification command**:

```bash
for i in {1..10}; do npm test || break; done
```

---

## Integration with Existing Practices

### Links to Related Documentation

1. **CLAUDE.md** - Main development guide now includes dependency chain
2. **TESTING-GUIDE.md** - Comprehensive testing guide references determinism
3. **docs/practices/README.md** - Practices index highlights this as critical
4. **docs/practices/02-testing/deterministic-tests.md** - Full practice document

### Integration with Expert Agents

**Test Quality Reviewer Agent** should check for:

- Non-deterministic patterns (time, randomness, external dependencies)
- Missing test data builders
- Lack of test isolation
- Uncontrolled external dependencies

---

## Real-World Examples from This Project

### Example 1: GraphNode Component Test

```javascript
// tests/unit/components/GraphNode.test.js
describe('GraphNode', () => {
	// ✅ Deterministic - uses specific test data
	const practice = buildPractice({
		id: 'test-practice',
		name: 'Test Practice',
		category: 'tooling',
		description: 'A test practice',
		requirements: ['Requirement 1'],
		benefits: ['Benefit 1']
	})

	test('renders practice name', () => {
		const { getByText } = render(GraphNode, { props: { practice } })
		expect(getByText('Test Practice')).toBeInTheDocument()
	})
})
```

### Example 2: PracticeId Value Object Test

```javascript
// tests/unit/domain/practice-catalog/PracticeId.test.js
describe('PracticeId.fromString', () => {
	// ✅ Deterministic - specific inputs, no external dependencies
	test('creates PracticeId from valid string', () => {
		const result = PracticeId.fromString('continuous-delivery')

		expect(result.isSuccess).toBe(true)
		expect(result.value.getValue()).toBe('continuous-delivery')
	})
})
```

### Example 3: Practice Repository (Would Need Improvement)

```javascript
// If this existed, it should be:
beforeEach(async () => {
	await db.query('DELETE FROM practices')
	await db.query('DELETE FROM practice_dependencies')
})

test('fetches practice tree', async () => {
	// Setup deterministic test data
	const practice = await db.insert('practices', {
		id: 'test-practice',
		name: 'Test Practice',
		category: 'tooling'
		// ... explicit values
	})

	const tree = await repository.getPracticeTree('test-practice')

	expect(tree.practice.id).toBe('test-practice')
})
```

---

## Next Steps

### Immediate

1. ✅ Document created and integrated
2. ✅ CLAUDE.md updated with dependency chain
3. ✅ Practices index updated
4. Review existing tests for non-deterministic patterns

### Short Term (Next Week)

1. Run test suite 10 times to detect flakiness
2. Refactor any non-deterministic tests found
3. Add test data builders for database fixtures
4. Update Test Quality Reviewer agent to check for determinism

### Long Term (Next Month)

1. Add determinism checks to pre-commit hooks
2. Create test template with deterministic patterns
3. Train team on deterministic testing principles
4. Measure and reduce flaky test rate to 0%

---

## References

- **CLAUDE.md**: Lines 24-45 (Philosophy section)
- **docs/practices/README.md**: Lines 50-59 (Testing category)
- **docs/practices/02-testing/deterministic-tests.md**: Complete practice document
- **TESTING-GUIDE.md**: Comprehensive testing guide (references determinism)

---

## Summary

**Critical Insight Captured:**

> Trunk-based Development has a dependency on Deterministic Tests. Deterministic Tests require the right behavior and tooling. Deterministic Tests require testable acceptance criteria. That depends on Behavior-Driven Development.

**Documentation Created:**

- ✅ Comprehensive practice document (deterministic-tests.md)
- ✅ Integration with CLAUDE.md (main development guide)
- ✅ Integration with practices index
- ✅ Visual dependency chain diagram
- ✅ Practical examples and checklists

**Impact:**
This documentation provides the missing link between BDD and trunk-based development, showing how behavior-driven development creates the foundation for reliable, deterministic tests that enable frequent integration to trunk.

---

**Status**: ✅ Complete
**Integration Level**: Full (CLAUDE.md, practices index, dedicated practice document)
**Availability**: Immediately accessible to all contributors
