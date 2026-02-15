# tests/ - Testing Guide

## Testing Pyramid

```
    /\       E2E (Playwright) - User acceptance criteria
   /  \      Integration (Vitest + Testing Library) - Component behavior
  /    \     Unit (Vitest) - Pure functions
 /______\
```

## ATDD Workflow (from BDD)

1. Write Gherkin feature file (`docs/features/*.feature`)
2. Convert scenarios to Playwright E2E tests (`tests/e2e/`)
3. Break down into component tests (`src/**/*.test.js`)
4. Write unit tests for pure functions (`src/**/*.test.js`)
5. Implement code to pass tests (Red -> Green -> Refactor)

## Test Structure

```
tests/
├── e2e/          # Playwright E2E tests (from Gherkin scenarios)
├── fixtures/     # Shared test fixtures
├── unit/         # Unit tests for utilities
├── utils/        # Test helpers
└── validators/   # Validation test utilities
```

## Conventions

- **AAA pattern**: Arrange, Act, Assert
- **One assertion per test** for clear failure messages
- **Test behavior, not implementation**: test user-visible outcomes
- **Descriptive names**: `it('returns error when email is invalid')`
- **Isolated tests**: no shared mutable state between tests
- **No classes**: use factory functions for test builders

### Test Data Builders

```javascript
export const buildUser = (overrides = {}) => ({
	id: crypto.randomUUID(),
	email: 'test@example.com',
	name: 'Test User',
	...overrides
})
```

### E2E Tests Reference Gherkin Steps

```javascript
test('successful login', async ({ page }) => {
	// Given I am on the login page
	await page.goto('/login')
	// When I enter valid credentials
	await page.fill('[data-testid="email"]', 'user@example.com')
	// Then I should see the dashboard
	await expect(page).toHaveURL('/dashboard')
})
```

## Running Tests

```bash
npm test              # Unit/integration tests
npm test -- --watch   # Watch mode
npm run test:e2e      # E2E tests (Playwright)
npm run test:e2e:ui   # E2E with UI
```
