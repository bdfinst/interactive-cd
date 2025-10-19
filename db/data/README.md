# Data Migrations

This directory contains data-only migrations for adding or updating practice data in the database.

**✨ Automated Migration System**: Migrations now apply automatically when you run `npm run dev`. See [Migration Guide](../../docs/ADDING-NEW-PRACTICES.md) for details.

## Migration Files

| File                              | Description                             | Date       | Status      |
| --------------------------------- | --------------------------------------- | ---------- | ----------- |
| `001_initial_data.sql`            | Initial 23 practices from MinimumCD.org | 2025-10-17 | ✅ Applied  |
| `002_example_new_practice.sql`    | Template for adding new practices       | 2025-10-17 | 📄 Template |
| `003_add_deterministic_tests.sql` | Deterministic Tests + BDD practices     | 2025-10-18 | ✅ Applied  |

**Check your migration status**: `npm run db:status`

## Latest Migration: Deterministic Tests (003)

**Migration 003** adds the critical dependency chain:

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

### What's Added

**New Practices:**

1. **Behavior-Driven Development (BDD)** - Foundation for testable acceptance criteria
2. **Deterministic Tests** - Tests that produce the same result every time

**New Dependencies:**

- `trunk-based-development` → `deterministic-tests`
- `deterministic-tests` → `automated-testing`
- `deterministic-tests` → `test-automation-framework`
- `deterministic-tests` → `test-data-management`
- `deterministic-tests` → `behavior-driven-development`
- `behavior-driven-development` → `version-control`

---

## 🚀 Applying Migrations (Automated)

### Local Development

Migrations apply **automatically** when you start development:

```bash
npm run dev
# ✅ Applied 1 migration(s) (0 schema, 1 data)
```

That's it! No manual steps required.

### Check Migration Status

```bash
# Check for pending migrations
npm run db:check

# View migration history
npm run db:status
```

### Manual Application (if needed)

```bash
# Apply all pending migrations
npm run db:migrate:local

# Apply specific migration
psql $DATABASE_URL -f db/data/003_add_deterministic_tests.sql
```

---

## Verification

After applying migration 003:

```bash
# Verify new practices were added
psql $DATABASE_URL -c "SELECT id, name, category FROM practices WHERE id IN ('behavior-driven-development', 'deterministic-tests');"

# Expected output:
#             id              |              name              | category
# ----------------------------+--------------------------------+----------
#  behavior-driven-development | Behavior-Driven Development    | behavior
#  deterministic-tests         | Deterministic Tests            | behavior

# Verify dependencies
psql $DATABASE_URL -c "
  SELECT p1.name as practice, p2.name as depends_on
  FROM practice_dependencies pd
  JOIN practices p1 ON pd.practice_id = p1.id
  JOIN practices p2 ON pd.depends_on_id = p2.id
  WHERE p1.id = 'deterministic-tests';
"

# Expected output:
#      practice       |         depends_on
# --------------------+-----------------------------
#  Deterministic Tests | Automated Testing
#  Deterministic Tests | Test Automation Framework
#  Deterministic Tests | Test Data Management
#  Deterministic Tests | Behavior-Driven Development

# Verify trunk-based development now depends on deterministic tests
psql $DATABASE_URL -c "
  SELECT p1.name as practice, p2.name as depends_on
  FROM practice_dependencies pd
  JOIN practices p1 ON pd.practice_id = p1.id
  JOIN practices p2 ON pd.depends_on_id = p2.id
  WHERE p1.id = 'trunk-based-development';
"

# Expected output:
#         practice         |      depends_on
# -------------------------+----------------------
#  Trunk-based Development | Version Control
#  Trunk-based Development | Feature Flags
#  Trunk-based Development | Deterministic Tests

# View full practice tree
psql $DATABASE_URL -c "SELECT * FROM get_practice_tree('trunk-based-development');"
```

---

## Practice Details

### Behavior-Driven Development (BDD)

**Category**: Behavior
**Type**: Practice

**Description**: Define software behavior using structured, human-readable scenarios (Gherkin) that serve as executable specifications and living documentation.

**Requirements**:

- Write features using Gherkin syntax (Given/When/Then)
- Scenarios focus on user behavior, not implementation
- Use specific, testable acceptance criteria
- Include explicit data values in scenarios
- Scenarios are declarative (what, not how)
- Features reviewed with stakeholders
- Scenarios converted to automated tests
- Features serve as living documentation

**Benefits**:

- Shared understanding between technical and business teams
- Testable acceptance criteria
- Living documentation stays current
- Reduces ambiguity in requirements
- Foundation for deterministic tests
- Enables collaboration
- Clear definition of done

**Dependencies**:

- Version Control (feature files are versioned)

---

### Deterministic Tests

**Category**: Behavior
**Type**: Practice

**Description**: Tests that produce the same result every time they run, eliminating flakiness and enabling reliable trunk-based development.

**Requirements**:

- Same input produces same output every time
- Control all inputs (time, randomness, external services)
- Isolate test execution (no shared state)
- Mock external dependencies (APIs, databases)
- Use test data builders for predictable data
- Clean up test data after each test
- Await all async operations properly
- Tests can run in parallel
- Tests pass 100% of the time
- Fix flaky tests immediately

**Benefits**:

- Enables trunk-based development
- Builds trust in test suite
- Eliminates wasted time on false failures
- Reliable CI/CD pipelines
- Supports frequent integration
- Fast, confident merging to trunk
- Reduces investigation time
- Enables parallel test execution

**Dependencies**:

- Automated Testing
- Test Automation Framework
- Test Data Management
- Behavior-Driven Development

---

## Rollback

If you need to rollback migration 003:

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

-- Restore previous metadata
UPDATE metadata SET value = '"1.0.0"' WHERE key = 'version';
UPDATE metadata SET value = '"2025-10-17"' WHERE key = 'lastUpdated';
DELETE FROM metadata WHERE key = 'changelog';

COMMIT;
```

---

## ➕ Creating New Migrations

**Quick Start:**

```bash
# 1. Copy template
cp db/data/002_example_new_practice.sql db/data/004_my_practice.sql

# 2. Edit migration
vim db/data/004_my_practice.sql

# 3. Test (applies automatically)
npm run dev

# 4. Commit
git add db/data/004_my_practice.sql
git commit -m "feat: add practice: My Practice"
git push
```

**📖 For detailed instructions:**

👉 **[Complete Migration Guide](../../docs/ADDING-NEW-PRACTICES.md)**
👉 **[Quick Reference Cheat Sheet](../../docs/MIGRATION-QUICK-REFERENCE.md)**

The guides cover:

- Step-by-step walkthrough with examples
- Field descriptions and validation rules
- Advanced patterns (multiple practices, hierarchies, updates)
- Common pitfalls and how to avoid them
- Complete testing checklist
- Rollback procedures

---

## Migration Best Practices

✅ **Use transactions**: Wrap in `BEGIN;`/`COMMIT;`
✅ **Use ON CONFLICT**: Make migrations idempotent
✅ **Test locally**: Run `npm run dev` to verify
✅ **Check for cycles**: Use `would_create_cycle()` function
✅ **Update metadata**: Increment version number
✅ **Follow naming**: `NNN_kebab-case-description.sql`
✅ **Verify**: Check with `npm run db:status`

---

## Related Documentation

### Migration Guides

- **[Adding New Practices Guide](../../docs/ADDING-NEW-PRACTICES.md)** - Complete walkthrough with examples
- **[Migration Quick Reference](../../docs/MIGRATION-QUICK-REFERENCE.md)** - One-page cheat sheet
- **[Database README](../README.md)** - Database overview and architecture

### Practice Documentation

- **[Deterministic Tests Practice](../../docs/practices/02-testing/deterministic-tests.md)** - Full practice guide
- **[BDD in CLAUDE.md](../../CLAUDE.md)** - BDD/ATDD/TDD workflow
- **[Testing Guide](../../docs/TESTING-GUIDE.md)** - Testing best practices

---

**Last Updated**: 2025-10-19
**Current Version**: 1.1.0
**Total Practices**: 25 (23 original + 2 new)
**Total Dependencies**: 47 (41 original + 6 new)
**Migration System**: ✨ Automated (tracking enabled)
