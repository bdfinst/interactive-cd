# Adding New Practices - Migration Guide

This guide walks you through adding new Continuous Delivery practices to the database using the automated migration system.

## 📋 Quick Reference

```bash
# 1. Create migration file
cp db/data/002_example_new_practice.sql db/data/004_my_practice.sql

# 2. Edit migration
vim db/data/004_my_practice.sql

# 3. Test locally
npm run dev

# 4. Commit and push
git add db/data/004_my_practice.sql
git commit -m "feat: add practice: My Practice Name"
git push
```

---

## 🎯 Overview

When you add a new practice, you create a **data migration file** that:

- Inserts the practice into the `practices` table
- Defines its dependencies via `practice_dependencies` table
- Uses `ON CONFLICT` for idempotency (safe to run multiple times)
- Updates the `metadata` table with new version info

The migration applies **automatically** when:

- Developers run `npm run dev` locally
- CI/CD runs `npm run build` in production

---

## 📝 Step-by-Step Guide

### Step 1: Determine the Migration Number

Find the next available migration number:

```bash
ls db/data/[0-9][0-9][0-9]_*.sql | tail -1
```

**Example output:**

```
db/data/003_add_deterministic_tests.sql
```

Your new migration should be `004_*.sql`.

**Important:** If you're working on a team, coordinate to avoid duplicate numbers!

---

### Step 2: Copy the Template

Use the example template as a starting point:

```bash
cp db/data/002_example_new_practice.sql db/data/004_my_practice.sql
```

**Naming Convention:**

- Format: `NNN_description.sql`
- Use **kebab-case** for description
- Be descriptive but concise
- Example: `004_add_security_practices.sql`

---

### Step 3: Edit the Migration File

Open your migration file and customize it:

```sql
-- Migration: 004_add_security_practices
-- Description: Add security-related practices to the catalog
-- Date: 2025-10-19

BEGIN;

-- Insert the new practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'secret-management',                    -- Unique kebab-case ID
  'Secret Management',                    -- Human-readable name
  'practice',                             -- Type: 'root' or 'practice'
  'tooling',                              -- Category: practice, tooling, behavior, culture
  'Securely store and manage secrets, API keys, and credentials',
  '["Centralized secret storage", "Encryption at rest", "Access control"]'::jsonb,
  '["Reduced security risks", "Audit trail", "Automated rotation"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits,
  updated_at = CURRENT_TIMESTAMP;

-- Add dependencies (practice depends on these)
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('secret-management', 'version-control'),
  ('secret-management', 'automated-deployment')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Update metadata with new version and timestamp
INSERT INTO metadata (key, value)
VALUES (
  'version',
  '"1.2.0"'::jsonb
),
(
  'lastUpdated',
  to_jsonb(CURRENT_TIMESTAMP::text)
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
```

---

### Step 4: Understand the Fields

#### **Practice Fields**

| Field          | Type         | Required | Description                                     | Example                            |
| -------------- | ------------ | -------- | ----------------------------------------------- | ---------------------------------- |
| `id`           | VARCHAR(255) | ✅       | Unique kebab-case identifier                    | `'secret-management'`              |
| `name`         | VARCHAR(255) | ✅       | Human-readable name                             | `'Secret Management'`              |
| `type`         | VARCHAR(50)  | ✅       | `'root'` or `'practice'`                        | `'practice'`                       |
| `category`     | VARCHAR(50)  | ✅       | `practice`, `tooling`, `behavior`, or `culture` | `'tooling'`                        |
| `description`  | TEXT         | ✅       | Clear, concise description                      | `'Securely store...'`              |
| `requirements` | JSONB        | ✅       | Array of requirements (what you need)           | `["Encryption", "Access control"]` |
| `benefits`     | JSONB        | ✅       | Array of benefits (what you gain)               | `["Reduced risk", "Audit trail"]`  |

#### **Categories**

- **`practice`**: Specific development practices (TDD, pair programming)
- **`tooling`**: Tools and infrastructure (CI/CD, version control)
- **`behavior`**: Team behaviors (code reviews, retrospectives)
- **`culture`**: Cultural values (psychological safety, continuous learning)

#### **Types**

- **`root`**: Top-level practice (e.g., `'continuous-delivery'`)
- **`practice`**: All other practices

**Rule:** Only use `'root'` for the single top-level practice. Everything else is `'practice'`.

---

### Step 5: Define Dependencies

Dependencies represent the **prerequisite practices** needed before implementing this practice.

```sql
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('my-practice', 'prerequisite-1'),
  ('my-practice', 'prerequisite-2')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;
```

**Guidelines:**

1. **Direct dependencies only** - Don't include transitive dependencies
   - ✅ Good: `('pair-programming', 'version-control')`
   - ❌ Bad: Adding `trunk-based-dev` if it already depends on `version-control`

2. **Check for cycles** - Don't create circular dependencies

   ```bash
   # Check before committing
   psql $DATABASE_URL -c "
     SELECT would_create_cycle('my-practice', 'potential-dependency');
   "
   ```

3. **Logical order** - Dependencies should make practical sense
   - Example: `automated-testing` depends on `version-control` ✅
   - Example: `version-control` depends on `automated-testing` ❌

---

### Step 6: Test Locally

The migration applies automatically when you restart dev:

```bash
npm run dev
```

**Expected output:**

```
✅ Applied 1 migration(s) (0 schema, 1 data)
VITE v5.0.0  ready in 543 ms
```

**If already applied:**

```
✅ Database migrations up-to-date
VITE v5.0.0  ready in 543 ms
```

---

### Step 7: Verify the Migration

#### Check the practice was inserted

```bash
psql $DATABASE_URL -c "
  SELECT id, name, type, category
  FROM practices
  WHERE id = 'secret-management';
"
```

**Expected output:**

```
        id         |       name        |  type    | category
-------------------+-------------------+----------+----------
 secret-management | Secret Management | practice | tooling
```

#### Check dependencies were created

```bash
psql $DATABASE_URL -c "
  SELECT pd.practice_id, pd.depends_on_id, p.name
  FROM practice_dependencies pd
  JOIN practices p ON pd.depends_on_id = p.id
  WHERE pd.practice_id = 'secret-management';
"
```

**Expected output:**

```
    practice_id    |    depends_on_id     |         name
-------------------+----------------------+----------------------
 secret-management | version-control      | Version Control
 secret-management | automated-deployment | Automated Deployment
```

#### Check for circular dependencies

```bash
psql $DATABASE_URL -c "
  SELECT * FROM practices p
  WHERE exists(
    SELECT 1 FROM get_practice_ancestors(p.id)
    WHERE id = p.id AND level > 0
  );
"
```

**Should return 0 rows** (empty = no cycles)

#### View the practice tree

```bash
psql $DATABASE_URL -c "
  SELECT id, name, level, path
  FROM get_practice_tree('continuous-delivery')
  WHERE id = 'secret-management';
"
```

---

### Step 8: Check Migration Status

View migration history:

```bash
npm run db:status
```

**Expected output:**

```
         migration_name          | migration_type |          applied_at           | success
---------------------------------+----------------+-------------------------------+---------
 004_add_security_practices.sql  | data           | 2025-10-19 08:45:12.104165-05 | t
 004_add_migration_tracking.sql  | schema         | 2025-10-19 08:22:37.104165-05 | t
 ...
```

---

### Step 9: Test Idempotency

Run the migration again to verify it's safe:

```bash
npm run dev
# Should show: ✅ Database migrations up-to-date
```

Or manually:

```bash
psql $DATABASE_URL -f db/data/004_add_security_practices.sql
# Should complete without errors
```

---

### Step 10: Commit and Push

```bash
git add db/data/004_add_security_practices.sql
git commit -m "feat: add security practices to catalog

- Add secret management practice
- Add dependencies on version control and automated deployment
- Update metadata to v1.2.0
"
git push
```

**Note:** The migration will apply automatically in CI/CD during the next deployment.

---

## 🎨 Advanced Patterns

### Adding Multiple Practices in One Migration

```sql
BEGIN;

-- First practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'practice-1', 'Practice 1', 'practice', 'tooling',
  'Description', '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- Second practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'practice-2', 'Practice 2', 'practice', 'behavior',
  'Description', '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- Dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('practice-1', 'version-control'),
  ('practice-2', 'practice-1')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Update metadata
INSERT INTO metadata (key, value)
VALUES ('version', '"1.3.0"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
```

---

### Updating Existing Practices

To modify an existing practice, create a new migration:

```sql
-- Migration: 005_update_practice_descriptions.sql
BEGIN;

-- Update description
UPDATE practices
SET
  description = 'Updated description with more detail',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'existing-practice';

-- Add new dependency
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES ('existing-practice', 'new-dependency')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

COMMIT;
```

---

### Adding Practice Hierarchies

For complex hierarchies with multiple levels:

```sql
BEGIN;

-- Level 1: Parent practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'observability', 'Observability', 'practice', 'tooling',
  'Monitor and understand system behavior',
  '["Metrics", "Logs", "Traces"]'::jsonb,
  '["Early detection", "Faster debugging"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Level 2: Child practices
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES
  ('monitoring', 'Monitoring', 'practice', 'tooling',
   'Collect and visualize metrics', '[]'::jsonb, '[]'::jsonb),
  ('logging', 'Logging', 'practice', 'tooling',
   'Centralized log aggregation', '[]'::jsonb, '[]'::jsonb),
  ('tracing', 'Distributed Tracing', 'practice', 'tooling',
   'Track requests across services', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Dependencies: children depend on parent
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('monitoring', 'observability'),
  ('logging', 'observability'),
  ('tracing', 'observability')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

COMMIT;
```

---

## ⚠️ Common Pitfalls

### 1. Duplicate Migration Numbers

**Problem:** Two people create `004_*.sql` on different branches

**Solution:**

```bash
# Before creating migration, pull latest
git pull origin main

# Check highest number
ls db/data/[0-9][0-9][0-9]_*.sql | tail -1

# Use next available number
```

---

### 2. Forgetting `ON CONFLICT`

**Problem:** Migration fails on second run

**Solution:** Always include `ON CONFLICT` clauses:

```sql
-- ✅ Good: Idempotent
INSERT INTO practices (id, name, ...)
VALUES ('my-practice', 'My Practice', ...)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- ❌ Bad: Fails on duplicate
INSERT INTO practices (id, name, ...)
VALUES ('my-practice', 'My Practice', ...);
```

---

### 3. Creating Circular Dependencies

**Problem:** Practice A depends on B, B depends on C, C depends on A

**Solution:** Use the cycle detection function:

```sql
-- Check before adding dependency
SELECT would_create_cycle('practice-a', 'practice-b');
-- Returns: true (cycle) or false (safe)
```

---

### 4. Invalid JSONB Format

**Problem:** Requirements/benefits not valid JSON

**Solution:** Always use proper JSON arrays:

```sql
-- ✅ Good
'["Requirement 1", "Requirement 2"]'::jsonb

-- ❌ Bad (missing quotes)
'[Requirement 1, Requirement 2]'::jsonb

-- ❌ Bad (not an array)
'"Requirement 1"'::jsonb
```

---

### 5. Missing Transaction Blocks

**Problem:** Partial application on error

**Solution:** Always wrap in `BEGIN`/`COMMIT`:

```sql
BEGIN;
-- All your INSERT/UPDATE statements
COMMIT;
```

---

### 6. Forgetting to Update Metadata

**Problem:** Version number doesn't reflect changes

**Solution:** Always update version and timestamp:

```sql
INSERT INTO metadata (key, value)
VALUES
  ('version', '"1.2.0"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text))
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;
```

---

## 🧪 Testing Checklist

Before committing, verify:

- [ ] Migration file follows naming convention (`NNN_description.sql`)
- [ ] File includes transaction block (`BEGIN`/`COMMIT`)
- [ ] All INSERT statements use `ON CONFLICT`
- [ ] Practice ID is unique and kebab-case
- [ ] JSONB fields are valid JSON arrays
- [ ] Dependencies are logical (no cycles)
- [ ] Migration applies successfully: `npm run dev`
- [ ] Migration is idempotent (run twice, no errors)
- [ ] Practice appears in database: `SELECT * FROM practices WHERE id = '...'`
- [ ] Dependencies are correct: `SELECT * FROM practice_dependencies WHERE practice_id = '...'`
- [ ] No circular dependencies: cycle check returns 0 rows
- [ ] Metadata updated with new version
- [ ] Migration tracked: `npm run db:status`

---

## 📚 Examples

### Example 1: Simple Practice with No Dependencies

```sql
-- Migration: 004_add_documentation_practice.sql
BEGIN;

INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'living-documentation',
  'Living Documentation',
  'practice',
  'practice',
  'Maintain documentation that evolves with the code',
  '["Automated doc generation", "Code examples", "Up-to-date diagrams"]'::jsonb,
  '["Accurate documentation", "Reduced maintenance", "Self-service onboarding"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO metadata (key, value)
VALUES ('version', '"1.2.0"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
```

---

### Example 2: Practice with Multiple Dependencies

```sql
-- Migration: 005_add_canary_deployment.sql
BEGIN;

INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'canary-deployment',
  'Canary Deployment',
  'practice',
  'tooling',
  'Gradually roll out changes to a subset of users',
  '["Traffic routing", "Monitoring", "Automated rollback"]'::jsonb,
  '["Reduced risk", "Early feedback", "Safe experimentation"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('canary-deployment', 'automated-deployment'),
  ('canary-deployment', 'monitoring'),
  ('canary-deployment', 'feature-flags')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

INSERT INTO metadata (key, value)
VALUES ('version', '"1.3.0"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
```

---

### Example 3: Updating an Existing Practice

```sql
-- Migration: 006_update_tdd_description.sql
-- Description: Improve TDD practice description and add benefits
BEGIN;

UPDATE practices
SET
  description = 'Write tests before implementation to drive design and ensure correctness',
  benefits = jsonb_set(
    benefits,
    '{3}',
    '"Faster debugging"'::jsonb
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'test-driven-development';

INSERT INTO metadata (key, value)
VALUES ('version', '"1.4.0"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
```

---

## 🔄 Rollback Process

If you need to undo a migration in local development:

```sql
BEGIN;

-- Remove dependencies first (foreign key constraint)
DELETE FROM practice_dependencies
WHERE practice_id = 'practice-to-remove';

-- Remove the practice
DELETE FROM practices
WHERE id = 'practice-to-remove';

-- Remove from migration tracking
DELETE FROM schema_migrations
WHERE migration_name = '004_my_migration.sql';

-- Revert metadata if needed
UPDATE metadata
SET value = '"1.1.0"'::jsonb
WHERE key = 'version';

COMMIT;
```

**Important:** This is for local development only. In production, create a new forward migration to undo changes.

---

## 🚀 Production Deployment

Your migration applies automatically in CI/CD:

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **GitHub Actions runs**
   - Checks out code
   - Runs `npm run build`
   - Executes `db:migrate` (applies your migration)
   - Builds application

3. **Netlify deploys**
   - Serves updated application
   - Database now includes your new practice

4. **Verify in production**

   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="postgresql://prod-host/prod-db"

   # Check migration was applied
   npm run db:status
   ```

---

## 📞 Getting Help

**Check migration status:**

```bash
npm run db:status
```

**Check for pending migrations:**

```bash
npm run db:check
```

**View migration tracking table:**

```bash
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY applied_at DESC;"
```

**Test migration locally:**

```bash
psql $DATABASE_URL -f db/data/004_my_migration.sql
```

**View database schema:**

```bash
psql $DATABASE_URL -c "\d practices"
psql $DATABASE_URL -c "\d practice_dependencies"
```

---

## 📖 Related Documentation

- [Database README](../db/README.md) - Database overview and architecture
- [Data Structure Documentation](./DATA-STRUCTURE.md) - Practice catalog structure
- [Database Quick Start](./DATABASE-QUICKSTART.md) - Quick reference guide
- [CLAUDE.md](../CLAUDE.md) - BDD/ATDD/TDD workflow

---

## 🎓 Best Practices Summary

1. ✅ **Use descriptive migration names** - `004_add_security_practices.sql`
2. ✅ **Always include transactions** - Wrap in `BEGIN`/`COMMIT`
3. ✅ **Make migrations idempotent** - Use `ON CONFLICT` clauses
4. ✅ **Test locally first** - Run `npm run dev` and verify
5. ✅ **Check for cycles** - Use `would_create_cycle()` function
6. ✅ **Update metadata** - Increment version, update timestamp
7. ✅ **Write clear descriptions** - Help future developers understand
8. ✅ **Commit with good messages** - Follow conventional commits format
9. ✅ **Verify in production** - Check `db:status` after deployment
10. ✅ **Document complex migrations** - Add comments for clarity

---

**Happy migrating! 🎉**

For questions or issues, check the [Database README](../db/README.md) or consult the team.
