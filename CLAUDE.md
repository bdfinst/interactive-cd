# CLAUDE.md - Svelte Application Development Guide

## Overview

This guide outlines the development approach for building a Svelte application using:

- **Behavior-Driven Development (BDD)** - Define features using Gherkin syntax
- **Acceptance Test Driven Development (ATDD)** - BDD scenarios inform acceptance tests
- **Test Driven Development (TDD)** - Write tests before implementation
- **Functional Programming (FP)** - Pure functions, immutability, composition
- **JavaScript** - No TypeScript, vanilla JS only

## Philosophy

**BDD → ATDD → TDD → Red → Green → Refactor**

1. Write Gherkin feature scenarios (BDD)
2. Convert scenarios to acceptance tests (ATDD)
3. Write failing unit/integration tests (TDD)
4. Write minimal code to pass tests
5. Refactor while keeping tests green
6. Repeat

## Expert Agents

This project uses specialized expert agents to ensure quality at each stage of development. These agents are integrated into the workflow and should be used proactively.

### Available Agents

#### 1. BDD Expert (`.claude/agents/bdd-expert.md`)

**Use for:**
- Reviewing and improving Gherkin feature files
- Ensuring scenarios are declarative (what, not how)
- Removing implementation details and technical coupling
- Making scenarios focus on user behavior
- Validating ubiquitous language usage

**When to use:**
- After creating or updating feature files
- When feature files feel too technical or imperative
- Before converting scenarios to acceptance tests
- When stakeholders struggle to understand scenarios

**Example workflow:**
```
1. Write initial feature file draft
2. Run BDD Expert agent to review
3. Apply agent recommendations
4. Review improved feature file with stakeholders
5. Proceed to ATDD phase
```

#### 2. DDD Expert (`.claude/agents/ddd-expert.md`)

**Use for:**
- Domain modeling and bounded context identification
- Designing entities, value objects, and aggregates
- Identifying ubiquitous language
- Ensuring domain logic stays in domain layer
- Preventing anemic domain models and primitive obsession

**When to use:**
- During initial project planning and domain discovery
- When designing new features with complex domain logic
- When refactoring to extract domain concepts
- When modeling relationships between domain concepts
- Before implementing domain-heavy features

**Example workflow:**
```
1. Identify domain concepts from BDD scenarios
2. Run DDD Expert agent for modeling guidance
3. Design domain model (entities, value objects, aggregates)
4. Implement domain layer with pure functions
5. Proceed to TDD implementation
```

#### 3. Test Quality Reviewer (`.claude/agents/test-quality-reviewer.md`)

**Use for:**
- Reviewing unit, integration, and E2E tests
- Ensuring tests focus on behavior, not implementation
- Validating meaningful test coverage
- Identifying brittle tests that will break on refactoring
- Checking that tests would catch real bugs

**When to use:**
- After writing or updating test files
- When tests keep breaking during refactoring
- During code review process
- When test suite feels fragile or hard to maintain
- Before considering tests "done"

**Example workflow:**
```
1. Write tests following TDD
2. Run Test Quality Reviewer agent
3. Refactor tests based on recommendations
4. Ensure tests focus on behavior
5. Verify tests catch real bugs
```

#### 4. Tailwind CSS Expert (`.claude/agents/tailwind-expert.md`)

**Use for:**
- Reviewing Tailwind CSS usage and layout patterns
- Improving responsive design with mobile-first approach
- Fixing CSS specificity conflicts
- Replacing inline styles with Tailwind utilities
- Optimizing component composition with utilities
- Ensuring accessibility in layouts

**When to use:**
- When inline styles are used instead of Tailwind utilities
- When experiencing CSS specificity conflicts
- When responsive layouts aren't working as expected
- During component styling and layout design
- When custom CSS conflicts with Tailwind utilities
- Before finalizing UI components

**Example workflow:**
```
1. Identify styling issues (inline styles, specificity conflicts)
2. Run Tailwind Expert agent for recommendations
3. Replace inline styles with Tailwind utilities
4. Implement proper @layer structure for custom styles
5. Verify responsive behavior across breakpoints
6. Ensure accessibility and performance
```

### Agent Integration in Development Workflow

The agents enhance each phase of the BDD → ATDD → TDD workflow:

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: BDD (Feature Definition)                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Write Gherkin feature file                              │
│ 2. → RUN BDD EXPERT AGENT                                  │
│ 3. Apply recommendations                                    │
│ 4. Review with stakeholders                                │
│ 5. → RUN DDD EXPERT AGENT (for domain modeling)           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: ATDD (Acceptance Tests)                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Convert Gherkin to Playwright tests                     │
│ 2. Write failing E2E tests                                  │
│ 3. → RUN TEST QUALITY REVIEWER AGENT                       │
│ 4. Refactor tests based on feedback                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: TDD (Unit/Integration Tests)                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Write failing unit tests                                │
│ 2. Implement code (Red → Green)                            │
│ 3. → RUN TEST QUALITY REVIEWER AGENT                       │
│ 4. Refactor tests and code                                 │
│ 5. Ensure all tests pass                                   │
└─────────────────────────────────────────────────────────────┘
```

### Best Practices for Using Agents

1. **Use agents proactively** - Don't wait for problems; review early and often
2. **Apply recommendations iteratively** - Improve incrementally
3. **Understand the "why"** - Learn from agent feedback to improve future work
4. **Maintain traceability** - Keep feature files, tests, and code aligned
5. **Review with team** - Share agent feedback to build shared understanding

## BDD with Gherkin

All features are documented using Gherkin syntax in `docs/features/*.feature` files.

### Why Gherkin?

- **Human-readable** - Non-technical stakeholders can understand
- **Executable specification** - Can be automated with Cucumber/Playwright
- **Living documentation** - Features stay up-to-date with implementation
- **Shared understanding** - Bridge between business and technical teams

### Feature File Structure

```gherkin
Feature: Feature Name
  As a [role]
  I want [feature]
  So that [benefit]

  Background:
    Given [common setup for all scenarios]

  Scenario: Scenario Name
    Given [initial context]
    When [action occurs]
    Then [expected outcome]
    And [additional outcome]

  @not-implemented
  Scenario: Future Feature
    # Tagged scenarios are not yet implemented
```

### BDD Workflow

1. **Write Feature File** (`docs/features/feature-name.feature`)
   - Define feature with user story
   - Write scenarios in Gherkin
   - Review with stakeholders

2. **Implement Acceptance Tests** (Playwright)
   - Convert Gherkin scenarios to Playwright tests
   - Use Gherkin language in test descriptions
   - Keep tests aligned with feature file

3. **Implement Unit/Integration Tests** (Vitest)
   - Break down scenarios into components
   - Test individual behaviors
   - Keep functions pure and testable

4. **Implement Code**
   - Make tests pass
   - Follow functional programming principles
   - Refactor continuously

### Example: From Gherkin to Code

**Step 1: Feature File** (`docs/features/login.feature`)

```gherkin
Feature: User Login
  As a user
  I want to log in to the application
  So that I can access my dashboard

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message
```

**Step 2: Acceptance Test** (`tests/e2e/login.spec.js`)

```javascript
import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    // Given I am on the login page
    await page.goto('/login');

    // When I enter valid credentials
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');

    // And I click the login button
    await page.click('[data-testid="login-button"]');

    // Then I should be redirected to the dashboard
    await expect(page).toHaveURL('/dashboard');

    // And I should see a welcome message
    await expect(page.locator('[data-testid="welcome"]'))
      .toContainText('Welcome');
  });
});
```

**Step 3: Unit Tests** (following TDD)

```javascript
// lib/auth.test.js
describe('validateCredentials', () => {
  it('returns true for valid credentials', () => {
    expect(validateCredentials('user@example.com', 'password123')).toBe(true);
  });
});
```

**Step 4: Implementation**

Write code to make all tests pass.

## Project Setup

### Installation

```bash
npm create vite@latest my-app -- --template svelte
cd my-app
npm install
npm install -D vitest jsdom @testing-library/svelte @testing-library/jest-dom
npm install -D @playwright/test
```

### Configuration Files

**vite.config.js**

```javascript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js']
  }
});
```

**src/test/setup.js**

```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**playwright.config.js**

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Testing Pyramid

```
    /\
   /  \    E2E Tests (Playwright)
  /____\   - User acceptance criteria
  /      \  Integration Tests (Vitest + Testing Library)
 /________\ - Component behavior
/          \ Unit Tests (Vitest)
/____________\ - Pure functions
```

## ATDD Workflow (Informed by BDD)

ATDD acceptance tests are derived directly from BDD feature files.

### Step 1: Start with BDD Feature File

Write Gherkin scenarios first (see **BDD with Gherkin** section above).

Example: `docs/features/login.feature`

### Step 2: Convert to Acceptance Tests

Translate Gherkin scenarios to Playwright E2E tests.

**From:** Gherkin scenario in `docs/features/login.feature`
**To:** Playwright test in `tests/e2e/login.spec.js`

```javascript
// tests/e2e/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  // Scenario: Successful login
  test('successful login redirects to dashboard', async ({ page }) => {
    // Given I am on the login page
    await page.goto('/login');

    // When I enter valid credentials
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // And I click the login button
    await page.click('[data-testid="login-button"]');

    // Then I should be redirected to the dashboard
    await expect(page).toHaveURL('/dashboard');

    // And I should see a welcome message
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome back!');
  });

  // Scenario: Invalid credentials
  test('invalid credentials show error message', async ({ page }) => {
    // Given I am on the login page
    await page.goto('/login');

    // When I enter invalid credentials
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpass');

    // And I click the login button
    await page.click('[data-testid="login-button"]');

    // Then I should see an error message
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });
});
```

**Note:** Comments in tests reference the Gherkin steps to maintain traceability.

### Step 3: Break Down Into Components

Identify components needed to fulfill the scenarios.

### Step 4: TDD Each Component

Write unit and integration tests for each component.

## Functional Programming Principles

### 1. Pure Functions

Functions that:

- Always return the same output for the same input
- Have no side effects
- Don't mutate arguments

**Good:**

```javascript
// utils/validators.js
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

**Test:**

```javascript
// utils/validators.test.js
import { describe, it, expect } from 'vitest';
import { isValidEmail, validateLoginForm } from './validators';

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns false for invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});

describe('validateLoginForm', () => {
  it('returns valid for correct form data', () => {
    const result = validateLoginForm({
      email: 'user@example.com',
      password: 'password123'
    });
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns errors for invalid email', () => {
    const result = validateLoginForm({
      email: 'invalid',
      password: 'password123'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Invalid email format');
  });
});
```

### 2. Immutability

Always create new data structures instead of modifying existing ones.

**Good:**

```javascript
// stores/userStore.js
import { writable } from 'svelte/store';

const createUserStore = () => {
  const { subscribe, set, update } = writable({
    users: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    addUser: (user) => update(state => ({
      ...state,
      users: [...state.users, { ...user, id: crypto.randomUUID() }]
    })),
    removeUser: (userId) => update(state => ({
      ...state,
      users: state.users.filter(u => u.id !== userId)
    })),
    updateUser: (userId, updates) => update(state => ({
      ...state,
      users: state.users.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      )
    })),
    setLoading: (loading) => update(state => ({ ...state, loading })),
    setError: (error) => update(state => ({ ...state, error })),
    reset: () => set({ users: [], loading: false, error: null })
  };
};

export const userStore = createUserStore();
```

### 3. Function Composition

Build complex operations from simple functions.

```javascript
// utils/compose.js
export const compose = (...fns) => (x) => 
  fns.reduceRight((acc, fn) => fn(acc), x);

export const pipe = (...fns) => (x) => 
  fns.reduce((acc, fn) => fn(acc), x);

// Example usage
// utils/transformers.js
export const trim = (str) => str.trim();
export const toLowerCase = (str) => str.toLowerCase();
export const removeSpaces = (str) => str.replace(/\s+/g, '');

export const normalizeEmail = pipe(
  trim,
  toLowerCase,
  removeSpaces
);

// Test
import { describe, it, expect } from 'vitest';
import { normalizeEmail } from './transformers';

describe('normalizeEmail', () => {
  it('normalizes email address', () => {
    expect(normalizeEmail('  User@Example.com  ')).toBe('user@example.com');
  });
});
```

### 4. Higher-Order Functions

Functions that take or return other functions.

```javascript
// utils/array.js
export const map = (fn) => (array) => array.map(fn);
export const filter = (predicate) => (array) => array.filter(predicate);
export const reduce = (fn, initial) => (array) => array.reduce(fn, initial);

// Usage
const double = (x) => x * 2;
const isEven = (x) => x % 2 === 0;
const sum = (acc, x) => acc + x;

const processNumbers = pipe(
  filter(isEven),
  map(double),
  reduce(sum, 0)
);

expect(processNumbers([1, 2, 3, 4, 5])).toBe(12); // (2 + 4) * 2 = 12
```

## Component Testing Pattern

### Unit Test (Pure Logic)

```javascript
// lib/calculator.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export const divide = (a, b) => b !== 0 ? a / b : null;

// lib/calculator.test.js
import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide } from './calculator';

describe('Calculator', () => {
  describe('add', () => {
    it('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
    
    it('adds negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });
  });

  describe('divide', () => {
    it('divides two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });
    
    it('returns null when dividing by zero', () => {
      expect(divide(10, 0)).toBe(null);
    });
  });
});
```

### Integration Test (Component)

```javascript
// components/Calculator.test.js
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Calculator from './Calculator.svelte';

describe('Calculator Component', () => {
  it('displays initial value of 0', () => {
    const { getByTestId } = render(Calculator);
    expect(getByTestId('display')).toHaveTextContent('0');
  });

  it('adds two numbers correctly', async () => {
    const { getByTestId } = render(Calculator);
    
    await fireEvent.click(getByTestId('button-2'));
    await fireEvent.click(getByTestId('button-add'));
    await fireEvent.click(getByTestId('button-3'));
    await fireEvent.click(getByTestId('button-equals'));
    
    expect(getByTestId('display')).toHaveTextContent('5');
  });

  it('handles division by zero', async () => {
    const { getByTestId } = render(Calculator);
    
    await fireEvent.click(getByTestId('button-5'));
    await fireEvent.click(getByTestId('button-divide'));
    await fireEvent.click(getByTestId('button-0'));
    await fireEvent.click(getByTestId('button-equals'));
    
    expect(getByTestId('display')).toHaveTextContent('Error');
  });
});
```

### Component Implementation

```svelte
<!-- components/Calculator.svelte -->
<script>
  import { add, subtract, multiply, divide } from '../lib/calculator.js';

  let display = '0';
  let firstOperand = null;
  let operator = null;
  let waitingForSecond = false;

  const operations = {
    '+': add,
    '-': subtract,
    '*': multiply,
    '/': divide
  };

  const handleNumber = (num) => {
    if (waitingForSecond || display === '0') {
      display = String(num);
      waitingForSecond = false;
    } else {
      display = display + num;
    }
  };

  const handleOperator = (op) => {
    if (firstOperand === null) {
      firstOperand = parseFloat(display);
    } else if (operator) {
      const result = calculate();
      display = String(result);
      firstOperand = result;
    }
    operator = op;
    waitingForSecond = true;
  };

  const calculate = () => {
    const second = parseFloat(display);
    const operation = operations[operator];
    const result = operation(firstOperand, second);
    return result === null ? 'Error' : result;
  };

  const handleEquals = () => {
    if (firstOperand !== null && operator) {
      display = String(calculate());
      firstOperand = null;
      operator = null;
      waitingForSecond = false;
    }
  };

  const handleClear = () => {
    display = '0';
    firstOperand = null;
    operator = null;
    waitingForSecond = false;
  };
</script>

<div class="calculator">
  <div class="display" data-testid="display">{display}</div>
  
  <div class="buttons">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as num}
      <button 
        data-testid="button-{num}"
        on:click={() => handleNumber(num)}
      >
        {num}
      </button>
    {/each}
    
    <button data-testid="button-add" on:click={() => handleOperator('+')}>+</button>
    <button data-testid="button-subtract" on:click={() => handleOperator('-')}>-</button>
    <button data-testid="button-multiply" on:click={() => handleOperator('*')}>*</button>
    <button data-testid="button-divide" on:click={() => handleOperator('/')}>/</button>
    <button data-testid="button-equals" on:click={handleEquals}>=</button>
    <button data-testid="button-clear" on:click={handleClear}>C</button>
  </div>
</div>

<style>
  .calculator {
    max-width: 300px;
    margin: 2rem auto;
  }
  
  .display {
    background: #333;
    color: #fff;
    padding: 1rem;
    text-align: right;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  button {
    padding: 1rem;
    font-size: 1.2rem;
    cursor: pointer;
  }
</style>
```

## Store Testing

```javascript
// stores/counter.js
import { writable } from 'svelte/store';

export const createCounter = (initialValue = 0) => {
  const { subscribe, update, set } = writable(initialValue);

  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(initialValue),
    add: (amount) => update(n => n + amount)
  };
};

export const counter = createCounter();

// stores/counter.test.js
import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createCounter } from './counter';

describe('Counter Store', () => {
  it('initializes with default value', () => {
    const store = createCounter();
    expect(get(store)).toBe(0);
  });

  it('initializes with custom value', () => {
    const store = createCounter(10);
    expect(get(store)).toBe(10);
  });

  it('increments by 1', () => {
    const store = createCounter(5);
    store.increment();
    expect(get(store)).toBe(6);
  });

  it('decrements by 1', () => {
    const store = createCounter(5);
    store.decrement();
    expect(get(store)).toBe(4);
  });

  it('adds custom amount', () => {
    const store = createCounter(0);
    store.add(5);
    expect(get(store)).toBe(5);
  });

  it('resets to initial value', () => {
    const store = createCounter(10);
    store.increment();
    store.increment();
    store.reset();
    expect(get(store)).toBe(10);
  });
});
```

## Async Operations

```javascript
// services/api.js
export const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch: ${error.message}`);
  }
};

// services/api.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchData } from './api';

describe('fetchData', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchData('https://api.example.com/data');
    
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data');
  });

  it('throws error on failed request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(fetchData('https://api.example.com/data'))
      .rejects.toThrow('HTTP error! status: 404');
  });

  it('throws error on network failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchData('https://api.example.com/data'))
      .rejects.toThrow('Failed to fetch: Network error');
  });
});
```

## Best Practices

### 1. Test Structure

Use the AAA pattern:

- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the results

### 2. Test Naming

Be descriptive: `it('should return error when email is invalid')`

### 3. One Assertion Per Test

Each test should verify one specific behavior.

### 4. Test Data Builders

```javascript
// test/builders/userBuilder.js
export const buildUser = (overrides = {}) => ({
  id: crypto.randomUUID(),
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  ...overrides
});

// Usage in tests
const user = buildUser({ email: 'custom@example.com' });
```

### 5. Test Helpers

```javascript
// test/helpers/render.js
import { render } from '@testing-library/svelte';

export const renderWithProps = (Component, props = {}) => {
  return render(Component, { props });
};

export const renderWithStore = (Component, store, initialValue) => {
  store.set(initialValue);
  return render(Component);
};
```

### 6. Avoid Implementation Details

Test behavior, not implementation:

**Bad:**

```javascript
it('calls handleClick when button is clicked', () => {
  // Testing implementation detail
});
```

**Good:**

```javascript
it('increments counter when button is clicked', () => {
  // Testing user-visible behavior
});
```

### 7. Keep Tests Isolated

Each test should be independent and not rely on others.

## FP Patterns in Svelte

### Reactive Declarations as Pure Transformations

```svelte
<script>
  import { pipe } from '../utils/compose.js';
  
  let items = [];
  let searchTerm = '';
  let sortBy = 'name';

  // Pure functions
  const filterBySearch = (term) => (items) => 
    items.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    );

  const sortByField = (field) => (items) =>
    [...items].sort((a, b) => a[field].localeCompare(b[field]));

  // Reactive declaration using function composition
  $: processedItems = pipe(
    filterBySearch(searchTerm),
    sortByField(sortBy)
  )(items);
</script>
```

### Declarative Event Handlers

```svelte
<script>
  import { createEventHandler } from '../utils/events.js';

  let formData = { email: '', password: '' };
  let errors = {};

  const handleInputChange = (field) => (event) => {
    formData = { ...formData, [field]: event.target.value };
  };

  const handleSubmit = (onSuccess) => async (event) => {
    event.preventDefault();
    
    const validation = validateLoginForm(formData);
    
    if (!validation.isValid) {
      errors = validation.errors;
      return;
    }

    try {
      await onSuccess(formData);
    } catch (error) {
      errors = { form: error.message };
    }
  };
</script>

<form on:submit={handleSubmit(loginUser)}>
  <input 
    value={formData.email}
    on:input={handleInputChange('email')}
  />
  <input 
    value={formData.password}
    on:input={handleInputChange('password')}
  />
  <button type="submit">Login</button>
</form>
```

## Development Workflow

1. **Write BDD Feature File** (`docs/features/*.feature`)
   - Define user story in Gherkin
   - Write scenarios with Given/When/Then
   - Review with stakeholders
   - Tag scenarios (@not-implemented for future work)

2. **Write Acceptance Test** (E2E with Playwright)
   - Convert Gherkin scenarios to Playwright tests
   - Keep comments referencing Gherkin steps
   - Write failing E2E test

3. **Write Component Tests** (Integration with Testing Library)
   - Break down scenarios into components
   - Write failing component tests
   - Test user-visible behavior

4. **Write Unit Tests** (Pure functions with Vitest)
   - Extract business logic
   - Write failing unit tests
   - Keep functions pure

5. **Implement** (Make tests pass)
   - Write minimal code
   - Keep functions pure
   - Maintain immutability

6. **Refactor** (Improve code quality)
   - Extract common patterns
   - Compose functions
   - Ensure tests still pass
   - Keep feature file up-to-date

7. **Repeat**

### Feature Files Location

All BDD feature files are stored in:
```
docs/features/
├── outline-view.feature
├── login.feature (example)
└── ...
```

These serve as:
- Living documentation
- Specification for acceptance tests
- Communication tool with stakeholders
- Single source of truth for feature behavior

## Running Tests

```bash
# Run all unit/integration tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

## Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm ci
      - run: npm test -- --coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Summary

This approach ensures:

- ✅ Tests define behavior before implementation
- ✅ Code is testable and maintainable
- ✅ Business logic is pure and predictable
- ✅ Components are simple and focused
- ✅ Refactoring is safe with comprehensive test coverage
- ✅ No TypeScript overhead while maintaining quality

Remember: **Test First, Think Functionally, Refactor Confidently**
