# Deployment Workflow

## Overview

This document describes the deployment process for the CD Practices application, separating schema from data and enabling incremental data updates.

## Architecture

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────┐
│                    First Release                        │
├─────────────────────────────────────────────────────────┤
│  Schema (db/schema.sql or db/migrations/*.sql)          │
│  ↓                                                       │
│  Initial Data (db/data/001_initial_data.sql)            │
│  ↓                                                       │
│  23 Practices + 41 Dependencies                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Ongoing Deployments                      │
├─────────────────────────────────────────────────────────┤
│  New Data Migrations (db/data/003_*.sql, 004_*.sql)     │
│  ↓                                                       │
│  Incremental Practice Additions                         │
│  ↓                                                       │
│  Updated Practice Count                                 │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
db/
├── schema.sql                     # All-in-one schema (first release)
├── seed.sql                       # All-in-one data (first release)
├── deploy-initial.sh              # First deployment automation
├── deploy-updates.sh              # Ongoing deployment automation
│
├── migrations/                    # Schema changes (rare)
│   ├── 001_initial_schema.sql    # Tables, indexes, triggers
│   ├── 002_add_functions.sql     # Database functions
│   └── 003_add_views.sql         # Database views
│
└── data/                          # Data changes (common)
    ├── 001_initial_data.sql      # 23 initial practices
    ├── 002_example_*.sql         # Template (not applied)
    ├── 003_*.sql                 # Future additions
    └── 004_*.sql                 # Future additions
```

## First Release Deployment

### Prerequisites

1. Netlify Postgres database created
2. `DATABASE_URL` environment variable set
3. Database is empty (fresh install)

### Deployment Steps

```bash
# 1. Set database connection
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# 2. Run initial deployment
./db/deploy-initial.sh
```

### What Happens

The `deploy-initial.sh` script:

1. ✅ Validates `DATABASE_URL` is set
2. ✅ Confirms with user
3. ✅ Creates schema (tables, functions, views)
4. ✅ Loads initial data (23 practices)
5. ✅ Verifies installation
6. ✅ Shows practice count and root practice

### Expected Output

```
============================================================================
  CD PRACTICES - INITIAL DEPLOYMENT
============================================================================

📊 Database: postgresql://***@***

⚠️  This will create tables and load initial data.
Continue? (y/N) y

============================================================================
  STEP 1: Creating Schema
============================================================================

[SQL output]

✅ Schema created successfully

============================================================================
  STEP 2: Loading Initial Data
============================================================================

[SQL output]

✅ Initial data loaded successfully

============================================================================
  STEP 3: Verification
============================================================================

📊 Practice count:
 practice_count
----------------
             23

📊 Dependency count:
 dependency_count
------------------
               41

📊 Root practice:
         id          |        name
---------------------+---------------------
 continuous-delivery | Continuous Delivery

============================================================================
  ✅ DEPLOYMENT COMPLETE
============================================================================
```

## Ongoing Deployments

### When to Deploy Updates

- Adding new practices
- Updating existing practice descriptions
- Adding new dependencies
- Updating metadata

### Deployment Process

```bash
# 1. Create data migration file
cp db/data/002_example_new_practice.sql db/data/003_security_practices.sql

# 2. Edit the migration
vim db/data/003_security_practices.sql

# 3. Test locally
psql $DATABASE_URL -f db/data/003_security_practices.sql

# 4. Commit to git
git add db/data/003_security_practices.sql
git commit -m "Add security practices"
git push

# 5. Deploy application
netlify deploy --prod

# 6. Apply data migrations
./db/deploy-updates.sh
```

### What Happens

The `deploy-updates.sh` script:

1. ✅ Validates `DATABASE_URL` is set
2. ✅ Checks database is initialized
3. ✅ Shows current state (practice count, last updated)
4. ✅ Applies new data migrations in order
5. ✅ Skips initial data (001) and examples
6. ✅ Shows updated state

### Expected Output

```
============================================================================
  CD PRACTICES - DEPLOYMENT UPDATES
============================================================================

📊 Database: postgresql://***@***

============================================================================
  Current State
============================================================================

📊 Current practice count:
 practice_count
----------------
             23

📊 Last updated:
   value
------------
 "2025-10-17"

============================================================================
  Applying Data Migrations
============================================================================

▶️  Applying: 003_security_practices.sql
   ✅ Applied successfully

✅ Applied 1 migration(s)

============================================================================
  Updated State
============================================================================

📊 Practice count:
 practice_count
----------------
             26

📊 Category breakdown:
  category  | count
------------+-------
 tooling    |    20
 practice   |     3
 behavior   |     2
 culture    |     1

============================================================================
  ✅ DEPLOYMENT COMPLETE
============================================================================
```

## Data Migration Template

### File Naming

Format: `NNN_description.sql`

Examples:

- `003_add_security_practices.sql`
- `004_add_observability_practices.sql`
- `005_update_ci_descriptions.sql`

### Template Structure

```sql
-- ============================================================================
-- Data Migration: 003_add_security_practices
-- Description: Add security-related CD practices
-- Date: 2025-10-17
-- ============================================================================

BEGIN;

-- Add new practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'security-scanning',
  'Security Scanning',
  'practice',
  'tooling',
  'Automated security scanning in the CI/CD pipeline',
  '[
    "Integrate security scanning tools",
    "Scan on every commit",
    "Block builds on critical vulnerabilities"
  ]'::jsonb,
  '[
    "Early vulnerability detection",
    "Reduced security debt",
    "Compliance automation"
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits;

-- Add dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('security-scanning', 'build-automation'),
  ('security-scanning', 'automated-testing')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Update metadata
INSERT INTO metadata (key, value)
VALUES ('lastUpdated', to_jsonb(CURRENT_DATE::text))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
```

## Best Practices

### ✅ DO

1. **Use transactions** - Wrap all changes in BEGIN/COMMIT
2. **Use ON CONFLICT** - Makes migrations idempotent
3. **Test locally first** - Always test before deploying
4. **Sequential numbering** - Use next available number
5. **Descriptive names** - Make purpose clear in filename
6. **Update metadata** - Set lastUpdated date
7. **Validate cycles** - Check for circular dependencies

### ❌ DON'T

1. **Skip numbers** - Don't use 003, 005 (missing 004)
2. **Reuse numbers** - Don't overwrite existing migrations
3. **Modify applied migrations** - Create new ones instead
4. **Forget transactions** - Always use BEGIN/COMMIT
5. **Skip testing** - Test locally before production
6. **Add cycles** - Validate dependencies first

## Rollback Strategy

### Undo a Migration

```sql
BEGIN;

-- Remove dependencies first
DELETE FROM practice_dependencies
WHERE practice_id = 'bad-practice';

-- Remove practice
DELETE FROM practices
WHERE id = 'bad-practice';

COMMIT;
```

### Full Database Reset (Development Only)

```bash
# ⚠️ DANGER: Deletes all data!
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
./db/deploy-initial.sh
```

## Continuous Deployment Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Netlify
        run: netlify deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      - name: Apply Database Migrations
        run: ./db/deploy-updates.sh
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Netlify Build Settings

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-postgresql"
```

## Monitoring

### Verify Deployment

```bash
# Check practice count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"

# View recent practices
psql $DATABASE_URL -c "
  SELECT id, name, created_at
  FROM practices
  ORDER BY created_at DESC
  LIMIT 5;
"

# Check for orphaned dependencies
psql $DATABASE_URL -c "
  SELECT pd.*
  FROM practice_dependencies pd
  LEFT JOIN practices p1 ON pd.practice_id = p1.id
  LEFT JOIN practices p2 ON pd.depends_on_id = p2.id
  WHERE p1.id IS NULL OR p2.id IS NULL;
"
```

## Troubleshooting

### Migration Failed

```bash
# Check the error message
# Fix the SQL file
# Re-run the specific migration
psql $DATABASE_URL -f db/data/003_failed_migration.sql
```

### Database Out of Sync

```bash
# Export current data
psql $DATABASE_URL -c "SELECT json_agg(p) FROM practices p;" > backup.json

# Reset and redeploy
./db/deploy-initial.sh
./db/deploy-updates.sh
```

### Can't Find New Practices

```bash
# Verify migration was applied
psql $DATABASE_URL -c "SELECT * FROM practices WHERE id = 'new-practice-id';"

# Check migration file was run
ls -la db/data/
```

## Summary

| Stage             | Command                     | Purpose                     | Frequency    |
| ----------------- | --------------------------- | --------------------------- | ------------ |
| **First Release** | `./db/deploy-initial.sh`    | Setup schema + initial data | Once         |
| **Add Data**      | Create `db/data/NNN_*.sql`  | Add new practices           | As needed    |
| **Deploy**        | `./db/deploy-updates.sh`    | Apply new migrations        | Each deploy  |
| **Verify**        | `psql -c "SELECT COUNT(*)"` | Check practice count        | After deploy |

---

**Next Steps**: See [db/README.md](db/README.md) for detailed instructions on creating data migrations.
