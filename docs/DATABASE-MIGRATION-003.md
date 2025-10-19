# Database Migration 003: Deterministic Tests & BDD

**Migration File**: `/db/data/003_add_deterministic_tests.sql`
**Date**: 2025-10-18
**Status**: Ready to Apply

---

## Summary

This migration adds the critical dependency chain identified in the project's development practices:

```
Trunk-based Development
         ↓
Deterministic Tests
         ↓
    ┌────────────────────────────────┐
    ↓                                ↓
Automated Testing              BDD
Test Automation Framework      (Testable Acceptance Criteria)
Test Data Management
```

---

## What's Being Added

### New Practices (2)

#### 1. Behavior-Driven Development (BDD)

- **ID**: `behavior-driven-development`
- **Category**: Behavior
- **Type**: Practice
- **Description**: Define software behavior using structured, human-readable scenarios (Gherkin)
- **8 Requirements**: Gherkin syntax, testable criteria, stakeholder review, etc.
- **7 Benefits**: Shared understanding, testable criteria, living documentation, etc.

#### 2. Deterministic Tests

- **ID**: `deterministic-tests`
- **Category**: Behavior
- **Type**: Practice
- **Description**: Tests that produce the same result every time, enabling trunk-based development
- **10 Requirements**: Control inputs, isolate execution, mock dependencies, etc.
- **8 Benefits**: Enables trunk-based dev, builds trust, reliable CI/CD, etc.

---

### New Dependencies (6)

1. `trunk-based-development` → `deterministic-tests`
2. `deterministic-tests` → `automated-testing`
3. `deterministic-tests` → `test-automation-framework`
4. `deterministic-tests` → `test-data-management`
5. `deterministic-tests` → `behavior-driven-development`
6. `behavior-driven-development` → `version-control`

---

## Database Impact

**Before Migration**:

- Total Practices: 23
- Total Dependencies: 41
- Version: 1.0.0

**After Migration**:

- Total Practices: 25 (+2)
- Total Dependencies: 47 (+6)
- Version: 1.1.0

---

## How to Apply

### Option 1: Direct SQL Execution

```bash
# Set database URL
export DATABASE_URL="postgresql://cduser:cdpassword@localhost:5432/interactive_cd"

# Apply migration
psql $DATABASE_URL -f db/data/003_add_deterministic_tests.sql

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) as total_practices FROM practices;"
# Expected: 25

psql $DATABASE_URL -c "SELECT COUNT(*) as total_dependencies FROM practice_dependencies;"
# Expected: 47
```

### Option 2: Using Deployment Script

```bash
export DATABASE_URL="postgresql://..."
./db/deploy-updates.sh
```

The script will:

- Detect migration 003 has not been applied
- Execute it in a transaction
- Show updated statistics

---

## Verification Queries

### 1. Verify New Practices Exist

```sql
SELECT id, name, category, type
FROM practices
WHERE id IN ('behavior-driven-development', 'deterministic-tests')
ORDER BY id;
```

**Expected Output**:

```
             id              |              name              | category | type
-----------------------------+--------------------------------+----------+----------
 behavior-driven-development | Behavior-Driven Development    | behavior | practice
 deterministic-tests         | Deterministic Tests            | behavior | practice
```

---

### 2. Verify Deterministic Tests Dependencies

```sql
SELECT p1.name as practice, p2.name as depends_on
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id = 'deterministic-tests'
ORDER BY p2.name;
```

**Expected Output**:

```
      practice       |         depends_on
---------------------+-----------------------------
 Deterministic Tests | Automated Testing
 Deterministic Tests | Behavior-Driven Development
 Deterministic Tests | Test Automation Framework
 Deterministic Tests | Test Data Management
```

---

### 3. Verify Trunk-based Development Dependencies

```sql
SELECT p1.name as practice, p2.name as depends_on
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id = 'trunk-based-development'
ORDER BY p2.name;
```

**Expected Output**:

```
         practice         |      depends_on
--------------------------+----------------------
 Trunk-based Development  | Deterministic Tests
 Trunk-based Development  | Feature Flags
 Trunk-based Development  | Version Control
```

---

### 4. View Full Practice Tree

```sql
SELECT * FROM get_practice_tree('trunk-based-development');
```

This should now show the complete dependency tree including deterministic-tests and its dependencies.

---

### 5. View BDD Dependencies

```sql
SELECT p1.name as practice, p2.name as depends_on
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id = 'behavior-driven-development';
```

**Expected Output**:

```
            practice            | depends_on
--------------------------------+----------------
 Behavior-Driven Development    | Version Control
```

---

## What This Enables

### For the Application

The practice tree visualization will now show:

- Trunk-based Development depends on Deterministic Tests
- Deterministic Tests depends on BDD and test infrastructure
- Complete dependency chain is visible

### For Documentation

The database now reflects the critical insight:

> Trunk-based Development → Deterministic Tests → (Right Behavior + Test Tooling) → Testable Acceptance Criteria → BDD

### For Future Practices

This establishes the pattern for adding behavioral practices that support development workflows.

---

## Rollback (If Needed)

```sql
BEGIN;

-- Remove dependencies
DELETE FROM practice_dependencies
WHERE (practice_id, depends_on_id) IN (
  ('trunk-based-development', 'deterministic-tests'),
  ('deterministic-tests', 'automated-testing'),
  ('deterministic-tests', 'test-automation-framework'),
  ('deterministic-tests', 'test-data-management'),
  ('deterministic-tests', 'behavior-driven-development'),
  ('behavior-driven-development', 'version-control')
);

-- Remove practices
DELETE FROM practices
WHERE id IN ('behavior-driven-development', 'deterministic-tests');

-- Restore metadata
UPDATE metadata SET value = '"1.0.0"' WHERE key = 'version';
UPDATE metadata SET value = '"2025-10-17"' WHERE key = 'lastUpdated';
DELETE FROM metadata WHERE key = 'changelog';

COMMIT;
```

---

## Testing the Migration

### Local Testing (Docker)

```bash
# Start database
docker-compose up -d

# Apply migration
export DATABASE_URL="postgresql://cduser:cdpassword@localhost:5432/interactive_cd"
psql $DATABASE_URL -f db/data/003_add_deterministic_tests.sql

# Run verification queries
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"
# Should return: 25

# View practice tree
psql $DATABASE_URL -c "SELECT * FROM get_practice_tree('trunk-based-development');"
```

### Production Testing (Netlify)

```bash
# Get production database URL
export DATABASE_URL=$(netlify env:get DATABASE_URL)

# Apply migration
psql $DATABASE_URL -f db/data/003_add_deterministic_tests.sql

# Verify
psql $DATABASE_URL -c "SELECT version FROM metadata WHERE key = 'version';"
# Should return: "1.1.0"
```

---

## Related Documentation

- **Migration File**: [/db/data/003_add_deterministic_tests.sql](/db/data/003_add_deterministic_tests.sql)
- **Data Migrations README**: [/db/data/README.md](/db/data/README.md)
- **Database Guide**: [/docs/DATABASE.md](/docs/DATABASE.md)
- **Deterministic Tests Practice**: [/docs/practices/02-testing/deterministic-tests.md](/docs/practices/02-testing/deterministic-tests.md)
- **CLAUDE.md Philosophy**: [/CLAUDE.md](/CLAUDE.md) (lines 24-45)

---

## API Impact

After applying this migration, the following API endpoints will return updated data:

### `/api/practices/tree`

- Will now show deterministic-tests and behavior-driven-development in the tree
- Trunk-based-development will show deterministic-tests as a dependency

### `/api/practices/cards`

- Will include 2 new practice cards
- Total practice count will be 25

---

## Deployment Checklist

- [ ] Migration file created: `003_add_deterministic_tests.sql`
- [ ] Migration tested locally with Docker
- [ ] Verification queries pass
- [ ] Documentation updated (db/data/README.md)
- [ ] This deployment guide created
- [ ] Ready to apply to production

---

**Migration Status**: ✅ Ready to Apply
**Impact Level**: Medium (adds 2 practices, 6 dependencies)
**Breaking Changes**: None
**Rollback Available**: Yes
