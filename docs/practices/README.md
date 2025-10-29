# Development Practices Guide

Welcome to the comprehensive development practices documentation. This guide complements the [main development guide (CLAUDE.md)](/CLAUDE.md) and [contributing guide](/docs/CONTRIBUTING.md).

## Philosophy

All practices align with our core development philosophy:

**BDD → ATDD → TDD → Red → Green → Refactor**

Emphasizing:

- Behavior-driven development with Gherkin feature files
- Functional programming principles (pure functions, immutability, composition)
- Test-first approach with comprehensive coverage
- Clean architecture with DDD patterns
- Continuous improvement and learning

---

## Practice Categories

### 01. Code Quality

**Focus**: Writing clean, maintainable, functional code

**Key Practices**:

- Pure functions with no side effects
- Immutability using Object.freeze
- Function composition with pipe/compose
- Declarative programming over imperative
- No classes - functional approach only

**Quick Start**: Review [CLAUDE.md Functional Programming section](/CLAUDE.md#functional-programming-principles)

---

### 02. Testing

**Focus**: Comprehensive test coverage following the testing pyramid

**Coverage Targets**:

- Domain layer: 95-100% (enforced)
- Application layer: 85-95%
- Infrastructure layer: 75-85%
- UI components: 70-80%

**Testing Stack**:

- Unit/Integration: Vitest + @testing-library/svelte
- E2E: Playwright
- Test data: Builder pattern in `/tests/utils/builders.js`

**Key Practices**:

- [Deterministic Tests](./02-testing/deterministic-tests.md) - **Foundation of trunk-based development**
- Unit, integration, and E2E testing strategies
- Test data builders and fixtures
- Mocking and test isolation

**Critical Dependency Chain**:

```
Trunk-based Development → Deterministic Tests → (Behavior + Tooling) → Testable Acceptance Criteria → BDD
```

**Quick Start**: See [TESTING-GUIDE.md](/docs/TESTING-GUIDE.md) and [Deterministic Tests](./02-testing/deterministic-tests.md).

**Related Agents**: [Test Quality Reviewer](/.claude/agents/test-quality-reviewer.md)

---

### 03. Git Workflow

**Focus**: Version control best practices and collaboration

**Key Practices**:

- Conventional commits (enforced by commitlint)
- Feature branches with descriptive names
- Pre-commit hooks with lint-staged
- Pull request reviews required
- Clean, atomic commits

**Quick Start**: See [CONTRIBUTING.md](/docs/CONTRIBUTING.md) for commit message format.

---

### 04. CI/CD

**Focus**: Continuous integration and deployment automation

**Current Setup**:

- GitHub Actions for CI
- Automated testing on every push
- Static site deployment via Netlify
- File-based data architecture (no database required)

**Quick Start**: See [RELEASE-WORKFLOW.md](/docs/RELEASE-WORKFLOW.md) for release process.

---

### 05. Security

**Focus**: Application security and data protection

**Key Practices**:

- Input validation using value objects
- File-based data architecture (no SQL injection vectors)
- Secure handling of user input
- npm audit in CI pipeline
- OWASP Top 10 awareness

**Quick Start**: Review data validation in [FILE-BASED-DATA.md](/docs/FILE-BASED-DATA.md)

---

### 06. Accessibility

**Focus**: Building inclusive, accessible applications

**Key Practices**:

- Semantic HTML first
- ARIA attributes when necessary (sparingly)
- Keyboard navigation support
- Screen reader testing
- Color contrast compliance (WCAG 2.1 AA)

**Quick Start**: Use `data-testid` for elements and test with `getByRole` queries.

**Related Agents**: [Tailwind Expert](/.claude/agents/tailwind-expert.md) includes accessibility checks.

---

### 07. Performance

**Focus**: Optimizing application speed and efficiency

**Key Practices**:

- Code splitting by route (automatic with SvelteKit)
- Lazy loading components with dynamic imports
- Bundle size monitoring
- Static site generation for optimal performance
- Core Web Vitals tracking

**Quick Start**: Use Vite's bundle analyzer to identify large dependencies.

---

### 08. Documentation

**Focus**: Writing effective code and feature documentation

**Key Practices**:

- Gherkin feature files in `/features` directory
- Living documentation aligned with implementation
- JSDoc for public APIs
- README files for major directories
- Inline comments explaining "why" not "what"

**Quick Start**: See [CLAUDE.md BDD section](/CLAUDE.md#bdd-with-gherkin) for feature file examples.

**Related Agents**: [BDD Expert](/.claude/agents/bdd-expert.md) reviews feature documentation.

---

### 09. Architecture

**Focus**: System design and architectural patterns

**Current Architecture**:

- Hexagonal architecture (Domain, Application, Infrastructure)
- Domain-Driven Design with value objects and entities
- Repository pattern for data access (file-based)
- Functional core, imperative shell
- No framework dependencies in domain layer

**Quick Start**: Review [DATA-STRUCTURE.md](/docs/DATA-STRUCTURE.md) and [FILE-BASED-DATA.md](/docs/FILE-BASED-DATA.md).

**Related Agents**: [DDD Expert](/.claude/agents/ddd-expert.md)

---

## How to Use This Guide

### For New Contributors

1. Read [CLAUDE.md](/CLAUDE.md) for complete development workflow
2. Review [CONTRIBUTING.md](/docs/CONTRIBUTING.md) and [COMMIT-CONVENTIONS.md](/docs/COMMIT-CONVENTIONS.md) for Git practices
3. Study [TESTING-GUIDE.md](/docs/TESTING-GUIDE.md) for testing approach
4. Set up local environment with `npm install` and `npm run dev`

### For Existing Contributors

1. Refer to [TESTING-GUIDE.md](/docs/TESTING-GUIDE.md) when writing tests
2. Use [Test Quality Reviewer agent](/.claude/agents/test-quality-reviewer.md) before committing
3. Follow [BDD Expert agent](/.claude/agents/bdd-expert.md) for feature files
4. Consult [DDD Expert agent](/.claude/agents/ddd-expert.md) for domain modeling

### For Reviewers

1. Verify all tests pass (unit, integration, E2E)
2. Check test coverage meets targets by layer
3. Ensure feature files align with implementation
4. Validate functional programming patterns (no classes, immutability)
5. Run expert agents for automated review

---

## Practice Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: BDD (Feature Definition)                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Write Gherkin feature file in /features                 │
│ 2. → RUN BDD EXPERT AGENT for review                       │
│ 3. Apply recommendations and refine scenarios              │
│ 4. Review with stakeholders                                │
│ 5. → RUN DDD EXPERT AGENT for domain modeling             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: ATDD (Acceptance Tests)                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Convert Gherkin scenarios to Playwright E2E tests       │
│ 2. Write failing E2E tests in /tests/e2e                   │
│ 3. → RUN TEST QUALITY REVIEWER AGENT                       │
│ 4. Refactor tests based on feedback                        │
│ 5. Ensure accessibility requirements covered               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: TDD (Unit/Integration Tests)                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Write failing unit tests in /tests/unit                 │
│ 2. Implement domain models with pure functions             │
│ 3. → RUN TEST QUALITY REVIEWER AGENT                       │
│ 4. Refactor using functional patterns                      │
│ 5. Ensure all tests pass and coverage targets met          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Implementation                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Implement UI components (Svelte)                        │
│ 2. Implement application services                          │
│ 3. Implement infrastructure (file repositories)             │
│ 4. → RUN TAILWIND EXPERT AGENT for styling                │
│ 5. Optimize performance and accessibility                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Review & Merge                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Run linting: npm run lint                               │
│ 2. Run tests: npm test                                     │
│ 3. Run E2E tests: npm run test:e2e                         │
│ 4. Create PR with descriptive title                        │
│ 5. Address code review feedback                            │
│ 6. Merge when all checks pass                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| When you need...                   | Consult...                                                              |
| ---------------------------------- | ----------------------------------------------------------------------- |
| To understand development workflow | [CLAUDE.md](/CLAUDE.md)                                                 |
| To write tests                     | [TESTING-GUIDE.md](/docs/TESTING-GUIDE.md)                              |
| To make a commit                   | [CONTRIBUTING.md](/docs/CONTRIBUTING.md)                                |
| To understand release process      | [RELEASE-WORKFLOW.md](/docs/RELEASE-WORKFLOW.md)                        |
| To understand data architecture    | [FILE-BASED-DATA.md](/docs/FILE-BASED-DATA.md)                          |
| To understand domain model         | [DATA-STRUCTURE.md](/docs/DATA-STRUCTURE.md)                            |
| To review feature files            | [BDD Expert Agent](/.claude/agents/bdd-expert.md)                       |
| To review tests                    | [Test Quality Reviewer Agent](/.claude/agents/test-quality-reviewer.md) |
| To model domain                    | [DDD Expert Agent](/.claude/agents/ddd-expert.md)                       |
| To style components                | [Tailwind Expert Agent](/.claude/agents/tailwind-expert.md)             |

---

## Gap Analysis Summary

Based on comprehensive project analysis, here are the **priority improvements** identified:

### HIGH PRIORITY (Next 1 month)

1. **Error Handling Strategy** - Create centralized error classes and handling utilities
2. **Logging and Monitoring** - Implement structured logging with levels
3. **Environment Configuration** - Add validation for required environment variables

### MEDIUM PRIORITY (Next 3 months)

4. **Security Documentation** - Create SECURITY.md with vulnerability disclosure
5. **Performance Monitoring** - Add Lighthouse CI and Core Web Vitals tracking
6. **Code Review Guidelines** - Create PR template and review checklist
7. **Dependency Management** - Configure Dependabot for automated updates

### LOW PRIORITY (Next 6 months)

8. **Developer Experience** - Add VS Code workspace settings and .nvmrc
9. **Data Management** - Document data file update procedures and validation

**Full Gap Analysis**: See `/docs/research/project-gap-analysis.md` (if created by analyst agent)

---

## Agent Integration

This project uses specialized expert agents to ensure quality at each stage of development:

### BDD Expert

**Use for**: Reviewing Gherkin feature files
**When**: After creating or updating feature files
**Run**: Via Claude Code Task tool

### DDD Expert

**Use for**: Domain modeling and bounded context identification
**When**: During initial feature planning and domain design
**Run**: Via Claude Code Task tool

### Test Quality Reviewer

**Use for**: Reviewing unit, integration, and E2E tests
**When**: After writing or updating test files
**Run**: Via Claude Code Task tool

### Tailwind CSS Expert

**Use for**: Reviewing Tailwind usage and responsive design
**When**: During component styling and layout design
**Run**: Via Claude Code Task tool

**See**: [CLAUDE.md Expert Agents section](/CLAUDE.md#expert-agents) for detailed workflows

---

## Contributing to Practices

Found a better practice? Want to improve documentation?

1. Follow [CONTRIBUTING.md](/docs/CONTRIBUTING.md) commit conventions
2. Ensure examples use functional programming (no classes)
3. Include tests where applicable
4. Link related agents if relevant
5. Update this README if adding new practice categories

---

## Related Documentation

- **[CLAUDE.md](/CLAUDE.md)** - Main development guide with BDD/ATDD/TDD workflow
- **[TESTING-GUIDE.md](/docs/TESTING-GUIDE.md)** - Comprehensive testing practices
- **[CONTRIBUTING.md](/docs/CONTRIBUTING.md)** - Contributor guidelines and Git workflow
- **[FILE-BASED-DATA.md](/docs/FILE-BASED-DATA.md)** - File-based data architecture
- **[DATA-STRUCTURE.md](/docs/DATA-STRUCTURE.md)** - Domain model and data structures
- **[RELEASE-WORKFLOW.md](/docs/RELEASE-WORKFLOW.md)** - Release process and automation
- **[COMMIT-CONVENTIONS.md](/docs/COMMIT-CONVENTIONS.md)** - Commit message format
- **[Expert Agents](/.claude/agents/)** - AI-powered code review agents

---

## Research and Analysis

The following research documents informed these practices:

- **Svelte/SvelteKit Best Practices** - Latest 2024-2025 practices (created by research agent)
- **Project Gap Analysis** - Comprehensive analysis of missing practices (created by analyst agent)
- **Documentation Structure Design** - Scalable practices organization (created by coder agent)
- **Testing Practices Documentation** - Complete testing guide (created by tester agent)

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0

---

## Feedback and Improvements

This is a living document. If you find:

- Missing practices or gaps in coverage
- Outdated information or incorrect examples
- Better approaches or more efficient patterns
- Areas needing clarification

Please open an issue or submit a PR following [CONTRIBUTING.md](/docs/CONTRIBUTING.md)!
