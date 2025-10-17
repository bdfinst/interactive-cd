# Database Files

This directory contains all database-related files for the CD Practices application.

## 📁 Directory Structure

```
db/
├── README.md                      # This file
├── schema.sql                     # Complete database schema
├── seed.sql                       # All-in-one for first release
├── client.example.js              # Database client implementation
├── deploy-initial.sh              # First deployment script
├── deploy-updates.sh              # Ongoing deployment script
│
├── migrations/                    # Schema migrations
│   ├── 001_initial_schema.sql
│   ├── 002_add_functions.sql
│   └── 003_add_views.sql
│
└── data/                          # Data-only migrations
    ├── 001_initial_data.sql       # Initial 23 practices
    └── 002_example_new_practice.sql  # Template for new practices
```

## 🚀 Deployment

### First Release (One-Time Setup)

```bash
export DATABASE_URL="postgresql://..."
./db/deploy-initial.sh
```

This will:
1. Create all tables, functions, and views
2. Load initial data (23 practices)
3. Verify the installation

### Ongoing Deployments (Adding New Data)

```bash
export DATABASE_URL="postgresql://..."
./db/deploy-updates.sh
```

This will:
1. Check database is initialized
2. Apply new data migrations in order
3. Skip already-applied migrations
4. Show updated statistics

## 📝 Adding New Practices

### Step 1: Create Data Migration File

Copy the template:

```bash
cp db/data/002_example_new_practice.sql db/data/003_my_new_practice.sql
```

### Step 2: Edit the Migration

```sql
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'my-new-practice',
  'My New Practice',
  'practice',
  'tooling',
  'Description of the new practice',
  '["Requirement 1", "Requirement 2"]'::jsonb,
  '["Benefit 1", "Benefit 2"]'::jsonb
);

-- Add dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES ('my-new-practice', 'version-control');
```

### Step 3: Test Locally

```bash
# Apply to local database
psql $DATABASE_URL -f db/data/003_my_new_practice.sql

# Verify
psql $DATABASE_URL -c "SELECT * FROM practices WHERE id = 'my-new-practice';"
```

### Step 4: Commit and Deploy

```bash
git add db/data/003_my_new_practice.sql
git commit -m "Add new practice: My New Practice"
git push

# Deploy to production
netlify deploy --prod
./db/deploy-updates.sh
```

## 🗂️ File Descriptions

### Schema Files

| File | Purpose | Run When |
|------|---------|----------|
| `schema.sql` | Complete schema (all-in-one) | First deployment only |
| `migrations/001_*.sql` | Initial tables and indexes | First deployment only |
| `migrations/002_*.sql` | Database functions | First deployment only |
| `migrations/003_*.sql` | Database views | First deployment only |

### Data Files

| File | Purpose | Run When |
|------|---------|----------|
| `seed.sql` | All-in-one initial data | First deployment only |
| `data/001_*.sql` | Initial 23 practices | First deployment only |
| `data/002_*.sql` | Example template | Never (it's a template) |
| `data/003+_*.sql` | Future practice additions | Each deployment |

### Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-initial.sh` | First-time setup | Run once |
| `deploy-updates.sh` | Apply new data | Run on each deploy |

### Application Files

| File | Purpose |
|------|---------|
| `client.example.js` | Database client implementation |

## 🔍 Naming Conventions

### Data Migration Files

Format: `NNN_description.sql`

- **NNN**: Three-digit number (001, 002, 003, etc.)
- **description**: Kebab-case description
- Files are applied in numerical order

Examples:
- `001_initial_data.sql`
- `003_add_security_practices.sql`
- `004_add_observability_practices.sql`

### Practice IDs

Format: `kebab-case-name`

Examples:
- `continuous-delivery`
- `trunk-based-development`
- `secret-management`

## 📊 Database Schema

### Tables

- **practices** - Core practices (id, name, type, category, description, requirements, benefits)
- **practice_dependencies** - Junction table (practice_id, depends_on_id)
- **metadata** - Version and source info

### Functions

- `get_practice_tree(root_id)` - Recursive tree query
- `get_practice_dependencies(id)` - Direct children
- `get_practice_dependents(id)` - Reverse dependencies
- `get_practice_ancestors(id)` - All parents
- `would_create_cycle(parent, child)` - Cycle detection
- `get_practice_depth(id)` - Distance from root

### Views

- `practice_summary` - Practices with dependency counts
- `leaf_practices` - Practices with no dependencies
- `root_practices` - Top-level practices

## 🧪 Testing

### Verify Schema

```bash
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\df"  # List functions
```

### Verify Data

```bash
# Count practices
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"

# View hierarchy
psql $DATABASE_URL -c "SELECT * FROM get_practice_tree('continuous-delivery') LIMIT 10;"

# Check for cycles
psql $DATABASE_URL -c "
  SELECT * FROM practices p
  WHERE exists(
    SELECT 1 FROM get_practice_ancestors(p.id)
    WHERE id = p.id AND level > 0
  );
"
# Should return 0 rows
```

## 🔄 Migration Strategy

### Schema Changes (Rare)

If you need to modify the schema:

1. Create new migration in `migrations/004_*.sql`
2. Update `schema.sql` with the same changes
3. Test thoroughly before deploying
4. Document breaking changes

### Data Changes (Common)

Adding new practices:

1. Create numbered file in `data/NNN_*.sql`
2. Follow the template format
3. Use `ON CONFLICT` for idempotency
4. Test locally first
5. Deploy and run `deploy-updates.sh`

## 📚 Best Practices

1. ✅ **Always use transactions** (BEGIN/COMMIT)
2. ✅ **Use ON CONFLICT** for idempotency
3. ✅ **Test locally** before deploying
4. ✅ **Increment numbers** sequentially
5. ✅ **Add comments** explaining the change
6. ✅ **Verify cycles** before adding dependencies
7. ✅ **Update metadata** with lastUpdated date

## 🆘 Troubleshooting

### Migration Failed

```bash
# Check error message
# Fix the migration file
# Re-run: psql $DATABASE_URL -f db/data/NNN_*.sql
```

### Rollback a Migration

```sql
BEGIN;
DELETE FROM practice_dependencies WHERE practice_id = 'bad-practice';
DELETE FROM practices WHERE id = 'bad-practice';
COMMIT;
```

### Reset Database (Development Only)

```bash
# ⚠️ DANGER: This deletes all data!
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
./db/deploy-initial.sh
```

## 📖 Related Documentation

- [Database Documentation](../docs/DATABASE.md)
- [Database Quick Start](../docs/DATABASE-QUICKSTART.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Data Structure](../docs/DATA-STRUCTURE.md)
