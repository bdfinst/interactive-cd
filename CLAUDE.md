# Interactive CD - Development Guide

## Overview

Interactive visualization of Continuous Delivery practices and their dependencies.
Built with **SvelteKit** + **Svelte 5** (runes). **JavaScript only** -- no TypeScript.

## Key Principles

- **BDD -> ATDD -> TDD -> Red -> Green -> Refactor**
- **Functional Programming**: pure functions, immutability, composition
- **No classes**: use factory functions and closures
- **Test behavior, not implementation**

## Project Structure

```
src/
  application/     # Use cases
  domain/          # Pure domain logic
  infrastructure/  # External concerns (storage, APIs)
  lib/components/  # Svelte components
  lib/data/        # Static data (cd-practices.json)
  lib/stores/      # Svelte stores (factory pattern)
  routes/          # SvelteKit routes
docs/features/     # Gherkin BDD feature files
tests/e2e/         # Playwright E2E tests
.claude/agents/    # Expert agents (BDD, DDD, Test Quality, Tailwind, Svelte)
```

## Development Workflow

1. Write Gherkin feature (`docs/features/*.feature`)
2. Convert to Playwright E2E test (`tests/e2e/`)
3. Write failing unit/integration tests
4. Implement with pure functions
5. Refactor, keeping tests green

## Commands

```bash
npm test              # Unit/integration (Vitest)
npm test -- --watch   # Watch mode
npm run test:e2e      # E2E (Playwright)
npm run dev           # Dev server
npm run build         # Production build
```

## Commit Messages

- Only list the changes. No author information (no `Co-Authored-By` lines).

## Conventions

- Svelte 5 runes: `$props()`, `$derived()`, `$state()`
- `data-testid` for test selectors
- Pure functions for all business logic
- Stores use factory pattern with `writable()`
- Feature files are living documentation

## Expert Agents

Specialized agents in `.claude/agents/` for review at each development phase:

- **BDD Expert** -- feature file quality
- **DDD Expert** -- domain modeling
- **Test Quality Reviewer** -- test quality and behavior focus
- **Tailwind Expert** -- CSS and layout
- **Svelte Expert** -- component patterns and reactivity

## Detailed Guides

- Component patterns and FP in Svelte: `src/CLAUDE.md`
- BDD workflow and Gherkin: `docs/CLAUDE.md`
- Testing pyramid and ATDD: `tests/CLAUDE.md`

## Strategic Patterns

Strategic patterns help understand CD adoption:

- **[DevOps Trilogy](./docs/patterns/devops-trilogy.md)** -- Three interdependent capabilities (Continuous Delivery, Architecture, Product & Process)
- **[Critical Path](./docs/patterns/critical-path.md)** -- Load-bearing practices (version-control, deterministic-tests, automated-testing, build-automation) that deliver 70% of capability with 40% of effort
- **[Implementation Roadmap](./docs/patterns/implementation-roadmap.md)** -- 52-week timeline across 5 phases for achieving CD excellence

See [Patterns Index](./docs/patterns/README.md) for full strategic guidance.
