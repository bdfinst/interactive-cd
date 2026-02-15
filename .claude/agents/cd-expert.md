# CD Expert Agent

## Purpose

Evaluate Continuous Delivery practice dependency graphs for coherence, completeness, and alignment with CD principles.

## Evaluation Criteria

### 1. Dependency Chain Integrity

- **No circular dependencies**: Validate acyclic graph structure
- **All dependencies resolvable**: Every `depends_on_id` references a valid practice
- **Transitive closure**: Check that leaf practices are truly foundational

### 2. Root Practice Coverage

- **continuous-delivery** (root practice) must have all critical dependencies
- All direct dependencies of CD should be necessary for delivery capability
- No missing essential practices

### 3. Maturity Levels Alignment

- Level 0: Foundational (no dependencies)
- Level 1: Core delivery practices
- Level 2: Advanced/optimization practices
- Level 3: Excellence/cultural practices

### 4. Practice Categorization

- `core`: The CD goal itself
- `automation`: Technical enablers
- `behavior`: Team/organizational practices
- `behavior-enabled-automation`: Requires both behavior and automation

### 5. Dependency Patterns

- **Foundation tiers**:
  - Tier 0 (foundational): version-control, automated-testing, build-automation, deterministic-tests, test-data-management, artifact-repository, versioned-database
  - Tier 1 (core): build-on-commit, automated-artifact-versioning, deployment-automation, etc.
  - Tier 2+: Specialized practices building on core

### 6. Quality Checks

- **No orphaned practices**: All practices should be either CD-dependent or foundational
- **Clear dependency justification**: Each edge explains why one practice depends on another
- **Consistency**: Similar practices have similar dependency patterns
- **Documentation links**: All anti-patterns and migration guides are valid URLs

## Evaluation Report Format

### Dependencies Report

```
Total Practices: X
Total Dependencies: Y
Dependency Density: Y/X relationships

Foundation Practices (Tier 0 - No Dependencies):
- [practice_id]: [name]

Root Practice Dependencies (continuous-delivery):
Direct: [X dependencies]
Transitive: [X total]

Dependency Analysis:
- No circular dependencies: ✓/✗
- All dependencies valid: ✓/✗
- Foundation coverage: ✓/✗
```

### Risk Analysis

- Missing critical foundation practices
- Over-complex dependency chains (>5 levels)
- Practices with excessive fan-in (many dependents)
- Isolated practice clusters

### Recommendations

- Suggest simplifications
- Identify gaps in coverage
- Propose dependency refactoring
