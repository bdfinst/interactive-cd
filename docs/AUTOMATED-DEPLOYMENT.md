# Automated Database Migration Deployment

**Status**: ✅ Configured
**Last Updated**: 2025-10-18

---

## Overview

Database migrations are now **automatically deployed** as part of the build process on Netlify. Every time you push to `main`, the migrations run before the application builds.

---

## How It Works

### 1. Build Process Flow

```
Push to main
    ↓
GitHub Actions CI
    ↓
Run Tests
    ↓
✅ Tests Pass
    ↓
Install PostgreSQL Client
    ↓
Run Database Migrations (npm run db:migrate)
    ↓
Build Application (npm run build:app)
    ↓
Deploy to Netlify
    ↓
✅ Live on Production
```

### 2. Migration Script

**File**: `/db/deploy-migrations.sh`

**What it does**:
- ✅ Checks if DATABASE_URL is set
- ✅ Installs PostgreSQL client if needed (Netlify environment)
- ✅ Verifies database connection
- ✅ Checks if database is initialized
- ✅ Applies new migrations in order (skips 001_initial_data.sql)
- ✅ Skips already-applied migrations (idempotent)
- ✅ Reports what changed
- ✅ Exits gracefully on errors (doesn't fail the build)

**Safety Features**:
- Migrations are **idempotent** (safe to run multiple times)
- Uses `ON CONFLICT DO UPDATE/NOTHING` in SQL
- Gracefully handles missing database
- Continues build even if migrations fail

---

## Configuration Files

### package.json

```json
{
  "scripts": {
    "build": "npm run db:migrate && vite build",
    "build:app": "vite build",
    "db:migrate": "bash db/deploy-migrations.sh"
  }
}
```

**Changes**:
- ✅ `build` now runs migrations before building
- ✅ `build:app` for app-only builds
- ✅ `db:migrate` runs the migration script

---

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "build"

  [build.environment]
    NODE_VERSION = "24.8.0"
    # Migrations run automatically via npm run build
```

**Changes**:
- ✅ Build command includes migrations
- ✅ Comment explains the process

---

### .github/workflows/deploy.yml

```yaml
- name: Install PostgreSQL client
  run: |
    sudo apt-get update
    sudo apt-get install -y postgresql-client

- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run db:migrate
  continue-on-error: true

- name: Build application
  run: npm run build:app
```

**Changes**:
- ✅ Installs `psql` in CI environment
- ✅ Runs migrations with DATABASE_URL secret
- ✅ Continues build even if migrations fail
- ✅ Builds app separately

---

## Environment Variables

### Required in Netlify

Set in **Site Settings → Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |

### Required in GitHub Secrets

Set in **Repository → Settings → Secrets**:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Production database connection |
| `NETLIFY_AUTH_TOKEN` | Netlify authentication token |
| `NETLIFY_SITE_ID` | Netlify site ID |
| `NETLIFY_SITE_NAME` | Netlify site name |

---

## Workflow

### Adding a New Practice

**1. Create Migration File**

```bash
# Create new migration (next number: 004)
cp db/data/002_example_new_practice.sql db/data/004_my_practice.sql

# Edit the file
vim db/data/004_my_practice.sql
```

**2. Test Locally**

```bash
export DATABASE_URL="postgresql://cduser:cdpassword@localhost:5432/interactive_cd"
npm run db:migrate
```

**3. Commit and Push**

```bash
git add db/data/004_my_practice.sql
git commit -m "feat(db): add new practice"
git push origin main
```

**4. Automatic Deployment**

- ✅ GitHub Actions runs tests
- ✅ Migrations run automatically
- ✅ App builds with new data
- ✅ Deploys to Netlify
- ✅ New practice visible in production

**No manual steps needed!** 🎉

---

## Verification

### Check Migration Logs

**In Netlify Build Logs**, look for:

```
============================================================================
  DATABASE MIGRATIONS - CI/CD DEPLOYMENT
============================================================================

📊 Database connection detected
🔍 Checking database connection...
✅ Database connection successful

============================================================================
  Current Database State
============================================================================

📊 Current practices: 23
📦 Current version: 1.0.0

============================================================================
  Applying Data Migrations
============================================================================

▶️  Applying: 003_add_deterministic_tests.sql
   ✅ Applied successfully

✅ Applied 1 new migration(s)

============================================================================
  Updated Database State
============================================================================

📊 Total practices: 25
🔗 Total dependencies: 47
📦 Version: 1.1.0

🆕 Added 2 new practice(s)

============================================================================
  ✅ DATABASE MIGRATIONS COMPLETE
============================================================================
```

### Verify in Production

```bash
# Get production database URL
export DATABASE_URL=$(netlify env:get DATABASE_URL)

# Check practice count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"

# Check version
psql $DATABASE_URL -c "SELECT value FROM metadata WHERE key = 'version';"
```

---

## Troubleshooting

### Migration Failed in CI

**Symptom**: Build logs show migration errors

**Check**:
1. Is `DATABASE_URL` set in GitHub Secrets?
2. Is the migration SQL syntax valid?
3. Does the migration use `ON CONFLICT` for idempotency?

**Fix**:
```bash
# Test migration locally first
export DATABASE_URL="postgresql://..."
psql $DATABASE_URL -f db/data/00X_migration.sql

# Fix any SQL errors
# Commit and push again
```

---

### Migration Didn't Run

**Symptom**: No migration output in build logs

**Check**:
1. Is the migration file in `db/data/` directory?
2. Does filename match pattern `[0-9][0-9][0-9]_*.sql`?
3. Is the file committed to git?

**Fix**:
```bash
# Verify file exists and is committed
ls -la db/data/
git status

# Ensure proper naming
mv db/data/my_migration.sql db/data/004_my_migration.sql
git add db/data/004_my_migration.sql
git commit -m "fix: rename migration file"
git push
```

---

### Database Connection Failed

**Symptom**: "Cannot connect to database" in logs

**Check**:
1. Is `DATABASE_URL` set in Netlify environment?
2. Is database accessible from Netlify?
3. Are database credentials correct?

**Fix**:
```bash
# Verify DATABASE_URL is set
netlify env:list

# Test connection locally
psql $DATABASE_URL -c "SELECT 1;"

# Update DATABASE_URL if needed
netlify env:set DATABASE_URL "postgresql://..."
```

---

## Manual Override

If you need to run migrations manually (e.g., for testing):

### Skip Automatic Migrations

**Temporarily disable in package.json**:

```json
{
  "scripts": {
    "build": "vite build",  // Remove npm run db:migrate
    "db:migrate": "bash db/deploy-migrations.sh"
  }
}
```

### Run Migrations Manually

```bash
export DATABASE_URL=$(netlify env:get DATABASE_URL)
./db/deploy-migrations.sh
```

### Re-enable Automatic Migrations

```json
{
  "scripts": {
    "build": "npm run db:migrate && vite build"
  }
}
```

---

## Best Practices

### 1. Test Migrations Locally First

```bash
# Always test before pushing
export DATABASE_URL="postgresql://..."
npm run db:migrate

# Verify changes
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"
```

### 2. Use Idempotent Migrations

```sql
-- ✅ Good - can run multiple times safely
INSERT INTO practices (id, name, ...) VALUES (...)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  ...;

-- ❌ Bad - fails on second run
INSERT INTO practices (id, name, ...) VALUES (...);
```

### 3. Include Rollback Instructions

```sql
-- At the end of migration file:
-- ROLLBACK:
-- DELETE FROM practices WHERE id = 'new-practice-id';
```

### 4. Update Metadata

```sql
-- Always update version and timestamp
INSERT INTO metadata (key, value) VALUES
  ('version', '"1.2.0"'),
  ('lastUpdated', '"2025-10-18"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## Migration Checklist

Before pushing a new migration:

- [ ] Migration file named correctly (`00X_description.sql`)
- [ ] Uses `BEGIN;` and `COMMIT;` transaction
- [ ] Uses `ON CONFLICT` for idempotency
- [ ] Updates metadata (version, lastUpdated)
- [ ] Tested locally with `npm run db:migrate`
- [ ] Verified changes with `psql` queries
- [ ] Documented in `/db/data/README.md`
- [ ] Includes rollback instructions in comments
- [ ] Committed and ready to push

---

## Deployment Timeline

**When you push to main:**

| Time | Action |
|------|--------|
| 0:00 | Push to GitHub |
| 0:10 | GitHub Actions starts |
| 0:30 | Tests complete |
| 0:40 | Migrations run |
| 0:50 | App builds |
| 1:00 | Deploys to Netlify |
| 1:10 | ✅ Live with new data |

**Total Time**: ~1-2 minutes from push to production

---

## Related Documentation

- **Migration Script**: [/db/deploy-migrations.sh](/db/deploy-migrations.sh)
- **Data Migrations**: [/db/data/README.md](/db/data/README.md)
- **Deployment Guide**: [/docs/DEPLOYMENT.md](/docs/DEPLOYMENT.md)
- **Database Guide**: [/docs/DATABASE.md](/docs/DATABASE.md)

---

## Summary

✅ **Fully Automated**: Push to main → migrations run → app deploys
✅ **Safe**: Idempotent migrations, graceful error handling
✅ **Fast**: Migrations complete in seconds
✅ **Transparent**: Full logging in build output
✅ **No Manual Steps**: Zero-touch deployment

**Just push your code, and everything else is automatic!** 🚀

---

**Status**: Fully Configured and Ready
**Last Migration**: 003_add_deterministic_tests.sql
**Current Version**: 1.1.0
