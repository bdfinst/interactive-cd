# Data Migration Testing Plan

## Executive Summary

This comprehensive testing plan ensures data migrations for the Interactive CD project follow BDD principles, maintain data integrity, and can be safely applied to production databases. The plan focuses on behavioral validation rather than implementation details.

## Test Strategy Overview

### Testing Philosophy

Following the project's BDD → ATDD → TDD approach:

1. **Behavior-Driven**: Tests focus on observable outcomes, not implementation
2. **Declarative**: Tests describe WHAT should happen, not HOW
3. **Idempotent**: Migrations can be run multiple times safely
4. **Reversible**: All changes can be rolled back cleanly
5. **Traceable**: Every test maps to a business requirement

### Test Pyramid for Migrations

```
     /\
    /  \    Acceptance Tests (BDD Scenarios)
   /____\   - Business requirements met
   /      \  Integration Tests (Database State)
  /________\ - Data integrity maintained
 /          \ Unit Tests (Individual Queries)
/____________\ - Cycle detection, constraints
```

## Test Files Created

| File                                       | Purpose                             | Type    |
| ------------------------------------------ | ----------------------------------- | ------- |
| `/docs/features/data-migration.feature`    | BDD scenarios for migration testing | Gherkin |
| `/db/tests/pre-migration-validation.sql`   | Pre-conditions verification         | SQL     |
| `/db/tests/post-migration-validation.sql`  | Success criteria validation         | SQL     |
| `/db/tests/cycle-detection-tests.sql`      | Dependency cycle prevention         | SQL     |
| `/db/tests/idempotency-test-procedure.sql` | Multi-run safety verification       | SQL     |
| `/db/tests/rollback-procedure.sql`         | Rollback and recovery               | SQL     |

## Test Execution Workflow

### 1. Pre-Migration Phase

```bash
# Run pre-migration validation
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/tests/pre-migration-validation.sql

# Expected output:
# - All tables exist
# - No conflicting IDs
# - Required dependencies present
# - No existing cycles
# - Database ready for migration
```

**Key Validations:**

- Schema structure verification
- Existing data conflict detection
- Dependency target existence
- Current state baseline capture
- Foreign key integrity check

### 2. First Migration Run

```bash
# Apply the migration
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/data/003_add_deterministic_tests.sql

# Run post-migration validation
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/tests/post-migration-validation.sql
```

**Expected Results:**

- All new practices inserted
- All dependencies created
- No circular dependencies
- Metadata updated
- Migration tracked in schema_migrations

### 3. Idempotency Test (Second Run)

```bash
# Run the same migration again
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/data/003_add_deterministic_tests.sql

# Verify idempotency
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/tests/idempotency-test-procedure.sql
```

**Expected Behavior:**

- No duplicate records created
- No errors on second run
- Data remains unchanged
- ON CONFLICT clauses work correctly

### 4. Cycle Detection

```bash
# Run comprehensive cycle detection
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/tests/cycle-detection-tests.sql
```

**Tests Performed:**

- Direct cycles (A → B → A)
- Self-references (A → A)
- Multi-hop cycles (A → B → C → A)
- Strongly connected components
- DAG property validation

### 5. Rollback Testing

```bash
# Execute rollback if needed
psql $DATABASE_URL -f /Users/bryan/_git/interactive-cd/db/tests/rollback-procedure.sql
```

**Rollback Verification:**

- All new records removed
- Dependencies cleaned up
- Metadata restored
- No orphaned records
- Database matches pre-migration state

## Test Scenarios (BDD)

### Critical Path Tests

#### Scenario: First-time Migration Success

```gherkin
Given no practices with IDs 'behavior-driven-development' or 'deterministic-tests' exist
When I apply migration 003_add_deterministic_tests.sql
Then 2 new practices should be inserted
And 6 new dependencies should be created
And the version should be updated to "1.1.0"
And no circular dependencies should exist
```

#### Scenario: Idempotent Re-run

```gherkin
Given migration 003 has already been applied
When I apply migration 003 again
Then no duplicate practices should exist
And practice count should remain at 25
And dependency count should remain at 47
And no errors should occur
```

#### Scenario: Cycle Prevention

```gherkin
Given a migration that would create practice A depending on B and B depending on A
When I attempt to apply the migration
Then the would_create_cycle function should return true
And the migration should fail
And no partial changes should be committed
```

## Validation Queries

### Pre-Migration Checklist

```sql
-- 1. Check for ID conflicts
SELECT id FROM practices
WHERE id IN ('behavior-driven-development', 'deterministic-tests');
-- Expected: 0 rows

-- 2. Verify dependency targets exist
SELECT id FROM practices
WHERE id IN ('version-control', 'automated-testing', 'trunk-based-development');
-- Expected: 3 rows

-- 3. Current counts baseline
SELECT
  (SELECT COUNT(*) FROM practices) as practices,
  (SELECT COUNT(*) FROM practice_dependencies) as dependencies;
-- Expected: 23 practices, 41 dependencies (adjust for your baseline)
```

### Post-Migration Success Criteria

```sql
-- 1. New practices exist
SELECT COUNT(*) FROM practices
WHERE id IN ('behavior-driven-development', 'deterministic-tests');
-- Expected: 2

-- 2. Dependencies created
SELECT COUNT(*) FROM practice_dependencies
WHERE practice_id = 'deterministic-tests';
-- Expected: 4

-- 3. No cycles
SELECT would_create_cycle('continuous-delivery', 'continuous-delivery');
-- Expected: true (self-cycle detection works)

-- 4. Migration tracked
SELECT success FROM schema_migrations
WHERE migration_name = '003_add_deterministic_tests.sql';
-- Expected: true
```

### Cycle Detection Query

```sql
-- Comprehensive cycle check
WITH RECURSIVE cycle_check AS (
  SELECT practice_id, depends_on_id,
         ARRAY[practice_id, depends_on_id] as path,
         false as has_cycle
  FROM practice_dependencies
  UNION ALL
  SELECT cc.practice_id, pd.depends_on_id,
         cc.path || pd.depends_on_id,
         pd.depends_on_id = cc.practice_id
  FROM cycle_check cc
  JOIN practice_dependencies pd ON cc.depends_on_id = pd.practice_id
  WHERE array_length(cc.path, 1) < 50 AND NOT cc.has_cycle
)
SELECT COUNT(*) as cycles FROM cycle_check WHERE has_cycle;
-- Expected: 0
```

## Expected Results Summary

### Successful Migration

| Metric            | Before | After | Change  |
| ----------------- | ------ | ----- | ------- |
| Practices         | 23     | 25    | +2      |
| Dependencies      | 41     | 47    | +6      |
| Version           | 1.0.0  | 1.1.0 | Updated |
| Cycles            | 0      | 0     | None    |
| Migration Records | N      | N+1   | +1      |

### Failed Migration Indicators

- **Red Flags:**
  - Practice count != expected
  - Duplicate key violations
  - Circular dependency detected
  - Foreign key constraints violated
  - Migration not tracked in schema_migrations

### Idempotency Verification

- **Second Run Results:**
  - No errors or warnings
  - Counts remain unchanged
  - No duplicate records
  - ON CONFLICT clauses triggered
  - Migration tracking handles appropriately

## Rollback Procedure

### When to Rollback

- Circular dependencies introduced
- Data corruption detected
- Business logic violations
- Failed post-migration validation

### Rollback Steps

1. **Capture current state** for audit
2. **Delete dependencies** (respects FK constraints)
3. **Delete practices**
4. **Restore metadata** to previous version
5. **Update migration tracking** to show rollback
6. **Verify consistency** post-rollback

### Rollback Verification

```sql
-- Confirm rollback success
SELECT
  (SELECT COUNT(*) FROM practices WHERE id IN
    ('behavior-driven-development', 'deterministic-tests')) as remaining_new,
  (SELECT COUNT(*) FROM practice_dependencies WHERE
    practice_id = 'deterministic-tests') as remaining_deps;
-- Expected: 0, 0
```

## Automation Integration

### CI/CD Pipeline Integration

```yaml
# .github/workflows/migration-test.yml
name: Test Database Migration
on: [pull_request]
jobs:
  test-migration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup test database
        run: |
          psql $TEST_DATABASE_URL -f db/schema.sql
          psql $TEST_DATABASE_URL -f db/data/001_initial_data.sql

      - name: Pre-migration validation
        run: psql $TEST_DATABASE_URL -f db/tests/pre-migration-validation.sql

      - name: Apply migration
        run: psql $TEST_DATABASE_URL -f db/data/003_add_deterministic_tests.sql

      - name: Post-migration validation
        run: psql $TEST_DATABASE_URL -f db/tests/post-migration-validation.sql

      - name: Test idempotency
        run: |
          psql $TEST_DATABASE_URL -f db/data/003_add_deterministic_tests.sql
          psql $TEST_DATABASE_URL -c "SELECT 'Idempotency test passed'"

      - name: Cycle detection
        run: psql $TEST_DATABASE_URL -f db/tests/cycle-detection-tests.sql
```

### Local Testing Script

```bash
#!/bin/bash
# db/tests/run-migration-tests.sh

set -e

echo "Starting migration test suite..."

echo "1. Pre-migration validation..."
psql $DATABASE_URL -f db/tests/pre-migration-validation.sql

echo "2. Applying migration..."
psql $DATABASE_URL -f db/data/003_add_deterministic_tests.sql

echo "3. Post-migration validation..."
psql $DATABASE_URL -f db/tests/post-migration-validation.sql

echo "4. Testing idempotency..."
psql $DATABASE_URL -f db/data/003_add_deterministic_tests.sql

echo "5. Cycle detection..."
psql $DATABASE_URL -f db/tests/cycle-detection-tests.sql

echo "✓ All migration tests passed!"
```

## Behavioral Test Coverage

### What We Test (Behavior)

✅ New practices appear in the system
✅ Dependencies are correctly established
✅ System prevents circular dependencies
✅ Multiple runs don't corrupt data
✅ Rollback restores previous state
✅ Migration history is accurately tracked

### What We Don't Test (Implementation)

❌ Specific SQL syntax used
❌ Internal PostgreSQL operations
❌ Transaction log details
❌ Index creation methods
❌ Query execution plans

## Success Criteria

The migration is considered successful when:

1. **All BDD scenarios pass** - Business requirements met
2. **Data integrity maintained** - No orphaned records or cycles
3. **Idempotency verified** - Can run multiple times safely
4. **Rollback tested** - Can revert if needed
5. **Performance acceptable** - Completes in reasonable time
6. **Tracking accurate** - Migration history updated correctly

## Troubleshooting Guide

### Common Issues and Solutions

| Issue                   | Diagnosis Query                                                                                               | Solution                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Duplicate key violation | `SELECT id, COUNT(*) FROM practices GROUP BY id HAVING COUNT(*) > 1`                                          | Add ON CONFLICT clause   |
| Circular dependency     | `SELECT would_create_cycle(practice_id, depends_on_id)`                                                       | Review dependency logic  |
| Orphaned dependencies   | `SELECT pd.* FROM practice_dependencies pd LEFT JOIN practices p ON pd.practice_id = p.id WHERE p.id IS NULL` | Add CASCADE or fix order |
| Migration not tracked   | `SELECT * FROM schema_migrations WHERE migration_name LIKE '%003%'`                                           | Check transaction commit |

## Recommendations

1. **Always test migrations on a copy of production data** before applying to production
2. **Use transactions** - Wrap migrations in BEGIN/COMMIT
3. **Include ON CONFLICT clauses** for idempotency
4. **Test rollback procedures** before you need them
5. **Monitor migration performance** - Set reasonable timeouts
6. **Document assumptions** about initial state
7. **Version control all test files** alongside migrations

## Conclusion

This comprehensive testing strategy ensures that data migrations:

- Follow BDD principles focusing on behavior
- Maintain database integrity and consistency
- Can be safely applied multiple times
- Support rollback when necessary
- Provide clear visibility into success/failure

By following this plan, migrations can be deployed with confidence, knowing that all edge cases have been considered and tested.
