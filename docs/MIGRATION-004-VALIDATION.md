# Migration 004 Validation Guide

## Overview

This document provides validation queries to verify that migration `004_add_cd_diagram_practices.sql` was applied successfully.

## Quick Status Check

The migration was successfully applied as indicated by the dev server output:
```
✅ Applied 1 migration(s) (0 schema, 1 data)
```

## Validation Queries

### 1. Check Practice Count

```sql
-- Should return 51 total practices (25 existing + 26 new)
SELECT COUNT(*) as total_practices FROM practices;
```

**Expected Result:** 51

### 2. Check Dependency Count

```sql
-- Should return ~113 total dependencies
SELECT COUNT(*) as total_dependencies FROM practice_dependencies;
```

**Expected Result:** ~113

### 3. Verify New Practices Added

```sql
-- List all new practices from migration 004
SELECT id, name, category, type
FROM practices
WHERE id IN (
  'static-analysis',
  'unified-team-backlog',
  'versioned-database',
  'evolutionary-database',
  'functional-testing',
  'contract-testing',
  'integration-testing',
  'performance-testing',
  'resilience-testing',
  'exploratory-testing',
  'usability-testing',
  'pre-commit-test-automation',
  'continuous-testing',
  'evolutionary-coding',
  'prioritized-features',
  'build-on-commit',
  'api-management',
  'modular-system',
  'component-ownership',
  'automated-artifact-versioning',
  'automated-environment-provisioning',
  'automated-db-changes',
  'developer-driven-support',
  'monitoring-and-alerting',
  'self-healing-services',
  'automated-build'
)
ORDER BY id;
```

**Expected Result:** 26 rows

### 4. Check Metadata Version

```sql
-- Should show version 1.2.0
SELECT key, value
FROM metadata
WHERE key IN ('version', 'lastUpdated', 'changelog');
```

**Expected Result:**
- version: "1.2.0"
- lastUpdated: (current timestamp)
- changelog: "Added 26 practices from CD diagram..."

### 5. Check for Circular Dependencies

```sql
-- Should return 0 rows (no circular dependencies)
SELECT p.id, p.name
FROM practices p
WHERE exists(
  SELECT 1
  FROM get_practice_ancestors(p.id)
  WHERE id = p.id AND level > 0
);
```

**Expected Result:** 0 rows (empty result set)

### 6. Verify Practice Tree Structure

```sql
-- View the complete practice tree starting from continuous-delivery
SELECT
  id,
  name,
  level,
  array_length(path, 1) as depth
FROM get_practice_tree('continuous-delivery')
ORDER BY level, name;
```

**Expected Result:** Hierarchical tree with continuous-delivery at level 0

### 7. Check New Practice Dependencies

```sql
-- Verify self-healing-services chain
SELECT
  pd.practice_id,
  p1.name as practice_name,
  pd.depends_on_id,
  p2.name as depends_on_name
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE pd.practice_id IN (
  'self-healing-services',
  'monitoring-and-alerting',
  'developer-driven-support'
)
ORDER BY pd.practice_id, pd.depends_on_id;
```

**Expected Result:** Multiple dependencies showing the self-healing chain

### 8. Verify Testing Practices Hierarchy

```sql
-- Check all testing practices and their dependencies
SELECT
  p.id,
  p.name,
  p.category,
  COUNT(pd.depends_on_id) as dependency_count
FROM practices p
LEFT JOIN practice_dependencies pd ON p.id = pd.practice_id
WHERE p.id IN (
  'continuous-testing',
  'integration-testing',
  'performance-testing',
  'resilience-testing',
  'exploratory-testing',
  'usability-testing',
  'functional-testing',
  'contract-testing'
)
GROUP BY p.id, p.name, p.category
ORDER BY p.name;
```

**Expected Result:** 8 testing practices with their dependency counts

### 9. Check Orphaned Practices

```sql
-- Should return 0 rows (no orphaned practices)
-- All practices should either be the root or have incoming dependencies
SELECT
  p.id,
  p.name,
  p.type
FROM practices p
WHERE p.type != 'root'
  AND NOT EXISTS (
    SELECT 1
    FROM practice_dependencies pd
    WHERE pd.depends_on_id = p.id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM practice_dependencies pd
    WHERE pd.practice_id = p.id
  );
```

**Expected Result:** 0 rows (all practices are connected)

### 10. Verify Continuous Delivery Dependencies

```sql
-- Check that continuous-delivery now depends on new practices
SELECT
  pd.depends_on_id as practice_id,
  p.name as practice_name
FROM practice_dependencies pd
JOIN practices p ON pd.depends_on_id = p.id
WHERE pd.practice_id = 'continuous-delivery'
ORDER BY p.name;
```

**Expected Result:** Should include new practices like:
- self-healing-services
- automated-db-changes
- continuous-testing
- modular-system
- automated-artifact-versioning
- automated-environment-provisioning
- component-ownership

### 11. Migration Tracking

```sql
-- Verify migration was tracked
SELECT
  migration_name,
  migration_type,
  applied_at,
  success
FROM schema_migrations
WHERE migration_name = '004_add_cd_diagram_practices.sql';
```

**Expected Result:** 1 row showing successful migration

## Success Criteria

✅ All 26 new practices inserted
✅ Version updated to 1.2.0
✅ No circular dependencies
✅ All practices connected to graph
✅ Practice count = 51
✅ Dependency count ≈ 113
✅ Migration tracked in schema_migrations

## Running Validations

To run these validations manually:

```bash
# Set your DATABASE_URL
export DATABASE_URL="postgresql://localhost/your_database"

# Run any validation query
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"
```

Or use the provided test files in `db/tests/`:

```bash
# Post-migration validation
psql $DATABASE_URL -f db/tests/post-migration-validation.sql

# Cycle detection
psql $DATABASE_URL -f db/tests/cycle-detection-tests.sql
```

## Test Idempotency

To verify the migration is idempotent, run it again:

```bash
npm run dev
# Should show: ✅ Database migrations up-to-date
```

Or manually:

```bash
psql $DATABASE_URL -f db/data/004_add_cd_diagram_practices.sql
# Should complete without errors
```

## Rollback (if needed)

If you need to rollback this migration in development:

```bash
psql $DATABASE_URL -f db/tests/rollback-procedure.sql
```

**Note:** This is for local development only. In production, create a new forward migration to undo changes.

## Summary

Migration 004 successfully added the complete CD diagram practice hierarchy to the database, expanding the catalog from 25 to 51 practices with comprehensive dependency mapping. The migration is idempotent and can be safely re-run.

For questions or issues, refer to:
- [Adding New Practices Guide](/docs/ADDING-NEW-PRACTICES.md)
- [Database Documentation](/docs/DATABASE.md)
- [Database Quick Start](/docs/DATABASE-QUICKSTART.md)
