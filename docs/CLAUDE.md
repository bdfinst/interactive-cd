# docs/ - BDD Feature Files & Documentation

## BDD with Gherkin

All features are documented using Gherkin syntax in `docs/features/*.feature`.

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

  @not-implemented
  Scenario: Future Feature
    # Tagged scenarios are not yet implemented
```

### BDD Workflow

1. Write feature file in `docs/features/`
2. Review with BDD Expert agent (`.claude/agents/bdd-expert.md`)
3. Convert Gherkin scenarios to Playwright E2E tests
4. Break down into component/unit tests
5. Implement code to pass tests
6. Keep feature files in sync with implementation

### Gherkin Best Practices

- Scenarios are declarative (what, not how)
- No implementation details in scenarios
- Use ubiquitous domain language
- One scenario per behavior
- Include explicit data values
- Features reviewed with stakeholders
