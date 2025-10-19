# Database Migration Quick Reference

**🚀 One-page cheat sheet for adding new practices**

---

## Quick Commands

```bash
# Create migration
cp db/data/002_example_new_practice.sql db/data/NNN_my_practice.sql

# Test locally
npm run dev

# Check status
npm run db:status

# Check for pending
npm run db:check

# Verify practice
psql $DATABASE_URL -c "SELECT * FROM practices WHERE id = 'my-id';"
```

---

## Migration Template

```sql
-- Migration: NNN_description
-- Description: What this migration does
-- Date: YYYY-MM-DD

BEGIN;

INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'kebab-case-id',
  'Human Readable Name',
  'practice',                    -- 'root' or 'practice'
  'category',                    -- practice, tooling, behavior, culture
  'Clear description',
  '["Req 1", "Req 2"]'::jsonb,
  '["Benefit 1", "Benefit 2"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('kebab-case-id', 'dependency-1'),
  ('kebab-case-id', 'dependency-2')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

INSERT INTO metadata (key, value)
VALUES ('version', '"X.Y.Z"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
```

---

## Field Reference

| Field          | Type   | Options                                              | Example                      |
| -------------- | ------ | ---------------------------------------------------- | ---------------------------- |
| `id`           | string | kebab-case, unique                                   | `'secret-management'`        |
| `name`         | string | Proper case                                          | `'Secret Management'`        |
| `type`         | enum   | `'root'`, `'practice'`                               | `'practice'`                 |
| `category`     | enum   | `'practice'`, `'tooling'`, `'behavior'`, `'culture'` | `'tooling'`                  |
| `description`  | text   | Clear, concise                                       | `'Securely store...'`        |
| `requirements` | jsonb  | Array of strings                                     | `["Req 1", "Req 2"]`         |
| `benefits`     | jsonb  | Array of strings                                     | `["Benefit 1", "Benefit 2"]` |

---

## Verification Checklist

- [ ] Migration number is next available (`ls db/data/*.sql | tail -1`)
- [ ] Filename uses kebab-case: `NNN_description.sql`
- [ ] Wrapped in `BEGIN`/`COMMIT`
- [ ] Uses `ON CONFLICT` for idempotency
- [ ] Practice ID is unique and kebab-case
- [ ] JSONB fields are valid JSON arrays
- [ ] No circular dependencies
- [ ] Tested locally: `npm run dev` succeeds
- [ ] Idempotent: can run twice without errors
- [ ] Verified: `SELECT * FROM practices WHERE id = '...'`
- [ ] Metadata version updated

---

## Common Patterns

**Single practice:**

```sql
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES ('my-practice', 'My Practice', 'practice', 'tooling', 'Desc', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
```

**With dependencies:**

```sql
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES ('my-practice', 'dependency-1')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;
```

**Update existing:**

```sql
UPDATE practices
SET description = 'New description', updated_at = CURRENT_TIMESTAMP
WHERE id = 'existing-practice';
```

---

## Troubleshooting

| Problem               | Solution                                           |
| --------------------- | -------------------------------------------------- |
| Duplicate key error   | Add `ON CONFLICT (id) DO UPDATE`                   |
| Foreign key violation | Ensure dependency exists first                     |
| Circular dependency   | Use `SELECT would_create_cycle('parent', 'child')` |
| Invalid JSONB         | Check quotes: `'["Item 1"]'::jsonb`                |
| Migration not applied | Check `npm run db:status`                          |

---

## Useful Queries

```sql
-- List all practices
SELECT id, name, category FROM practices ORDER BY name;

-- Show dependencies
SELECT pd.practice_id, p.name, pd.depends_on_id, p2.name
FROM practice_dependencies pd
JOIN practices p ON pd.practice_id = p.id
JOIN practices p2 ON pd.depends_on_id = p2.id;

-- Check for cycles
SELECT * FROM practices p
WHERE exists(
  SELECT 1 FROM get_practice_ancestors(p.id)
  WHERE id = p.id AND level > 0
);

-- View practice tree
SELECT id, name, level, path
FROM get_practice_tree('continuous-delivery')
ORDER BY level, name;

-- Migration history
SELECT migration_name, applied_at, success
FROM schema_migrations
ORDER BY applied_at DESC
LIMIT 10;
```

---

## Git Workflow

```bash
# 1. Pull latest
git pull origin main

# 2. Create migration
cp db/data/002_example_new_practice.sql db/data/NNN_my_practice.sql

# 3. Edit file
vim db/data/NNN_my_practice.sql

# 4. Test
npm run dev

# 5. Verify
psql $DATABASE_URL -c "SELECT * FROM practices WHERE id = 'my-id';"

# 6. Commit
git add db/data/NNN_my_practice.sql
git commit -m "feat: add practice: My Practice Name"

# 7. Push
git push origin main
```

---

## Categories Explained

| Category   | Use For                  | Examples                               |
| ---------- | ------------------------ | -------------------------------------- |
| `practice` | Development practices    | TDD, pair programming, code review     |
| `tooling`  | Tools and infrastructure | CI/CD, version control, monitoring     |
| `behavior` | Team behaviors           | Retrospectives, standups, demos        |
| `culture`  | Cultural values          | Psychological safety, learning culture |

---

## npm Scripts

| Command                    | Purpose                      |
| -------------------------- | ---------------------------- |
| `npm run dev`              | Auto-migrate + start dev     |
| `npm run dev:app`          | Skip migrations, start dev   |
| `npm run db:migrate:local` | Run migrations manually      |
| `npm run db:check`         | Check for pending migrations |
| `npm run db:status`        | View migration history       |

---

## Emergency Rollback (Local Only)

```sql
BEGIN;
DELETE FROM practice_dependencies WHERE practice_id = 'practice-to-remove';
DELETE FROM practices WHERE id = 'practice-to-remove';
DELETE FROM schema_migrations WHERE migration_name = 'NNN_migration.sql';
COMMIT;
```

**⚠️ Never do this in production!** Create a forward migration instead.

---

## Related Docs

- [Complete Migration Guide](./ADDING-NEW-PRACTICES.md) - Detailed walkthrough
- [Database README](../db/README.md) - Database overview
- [Data Structure](./DATA-STRUCTURE.md) - Schema documentation

---

**Need help?** Check `npm run db:status` or read the [complete guide](./ADDING-NEW-PRACTICES.md).
