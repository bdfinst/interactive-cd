# Database Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Netlify Postgres Database

```bash
# Via Netlify Dashboard
1. Go to https://app.netlify.com
2. Navigate to Add-ons → Databases
3. Create PostgreSQL database (free tier)
4. Copy DATABASE_URL
```

### 2. Set Environment Variable

```bash
export DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### 3. Initialize Database

```bash
# Option 1: All-in-one schema
psql $DATABASE_URL -f schema.sql

# Option 2: Step-by-step migrations
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_add_functions.sql
psql $DATABASE_URL -f migrations/003_add_views.sql
```

### 4. Load Data

```bash
# Generate seed SQL from JSON
node seed-data.js > seed.sql

# Load into database
psql $DATABASE_URL -f seed.sql
```

### 5. Verify

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM practices;"
# Should return: 23

psql $DATABASE_URL -c "SELECT * FROM root_practices;"
# Should show: Continuous Delivery
```

## 📊 Database Schema Overview

### Tables

```
practices
├── id (PK)
├── name
├── type (root | practice)
├── category (practice | tooling | behavior | culture)
├── description
├── requirements (JSONB)
└── benefits (JSONB)

practice_dependencies (junction table)
├── id (PK)
├── practice_id (FK → practices)
└── depends_on_id (FK → practices)

metadata
├── key (PK)
└── value (JSONB)
```

### Key Features

✅ **Unlimited depth** - Recursive queries support infinite nesting
✅ **Prevents cycles** - Built-in validation function
✅ **Many-to-many** - Practices can have multiple dependencies
✅ **Efficient** - Indexed for fast queries
✅ **Type-safe** - CHECK constraints enforce valid data

## 🔧 Essential Queries

### Get All Practices

```sql
SELECT * FROM practices ORDER BY name;
```

### Get Practice with Dependencies

```sql
SELECT p.*,
  array_agg(d.name) FILTER (WHERE d.name IS NOT NULL) as dependency_names
FROM practices p
LEFT JOIN practice_dependencies pd ON p.id = pd.practice_id
LEFT JOIN practices d ON pd.depends_on_id = d.id
WHERE p.id = 'continuous-integration'
GROUP BY p.id;
```

### Get Full Tree (Recursive)

```sql
SELECT * FROM get_practice_tree('continuous-delivery');
```

### Get Leaf Practices (No Dependencies)

```sql
SELECT * FROM leaf_practices;
```

### Search Practices

```sql
SELECT * FROM practices
WHERE name ILIKE '%integration%'
   OR description ILIKE '%integration%';
```

### Get Practice Summary with Counts

```sql
SELECT * FROM practice_summary
ORDER BY dependent_count DESC;
```

## 🛠️ Useful Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `get_practice_dependencies(id)` | Get direct dependencies | `SELECT * FROM get_practice_dependencies('continuous-integration')` |
| `get_practice_dependents(id)` | Get reverse dependencies | `SELECT * FROM get_practice_dependents('version-control')` |
| `get_practice_tree(id)` | Get full tree recursively | `SELECT * FROM get_practice_tree('continuous-delivery')` |
| `get_practice_ancestors(id)` | Get all ancestors | `SELECT * FROM get_practice_ancestors('version-control')` |
| `would_create_cycle(p1, p2)` | Check for circular deps | `SELECT would_create_cycle('cd', 'vc')` |
| `get_practice_depth(id)` | Get depth from root | `SELECT get_practice_depth('version-control')` |

## 💻 SvelteKit Integration

### Install Dependencies

```bash
npm install pg
npm install -D @sveltejs/adapter-netlify
```

### Database Client (`src/lib/server/db.ts`)

```typescript
import { DATABASE_URL } from '$env/static/private';
import pkg from 'pg';
const { Pool } = pkg;

export const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### API Route (`src/routes/api/practices/+server.ts`)

```typescript
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
  const result = await db.query('SELECT * FROM practices');
  return json(result.rows);
}
```

### Load Function (`src/routes/+page.server.ts`)

```typescript
import { db } from '$lib/server/db';

export async function load() {
  const result = await db.query(`
    SELECT * FROM get_practice_tree('continuous-delivery')
  `);
  return { tree: result.rows };
}
```

## 📦 File Reference

| File | Purpose |
|------|---------|
| `schema.sql` | Complete database schema (all-in-one) |
| `migrations/001_initial_schema.sql` | Tables and indexes |
| `migrations/002_add_functions.sql` | Recursive query functions |
| `migrations/003_add_views.sql` | Convenient views |
| `seed.sql` | Initial data from practices.json |
| `seed-data.js` | Script to generate seed.sql |
| `db.types.ts` | TypeScript type definitions |
| `db-client.example.ts` | Full database client implementation |
| `DATABASE.md` | Complete documentation |
| `DEPLOYMENT.md` | Netlify deployment guide |

## 🔍 Common Operations

### Add New Practice

```sql
BEGIN;

INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'new-practice',
  'New Practice',
  'practice',
  'tooling',
  'Description here',
  '["Req 1", "Req 2"]'::jsonb,
  '["Benefit 1"]'::jsonb
);

-- Add dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES ('new-practice', 'version-control');

COMMIT;
```

### Update Practice

```sql
UPDATE practices
SET description = 'Updated description',
    requirements = '["New req 1", "New req 2"]'::jsonb
WHERE id = 'continuous-integration';
```

### Delete Practice (Cascades to Dependencies)

```sql
DELETE FROM practices WHERE id = 'old-practice';
```

### Check for Circular Dependencies

```sql
-- Before adding a dependency, check if it would create a cycle
SELECT would_create_cycle('practice-a', 'practice-b');
-- Returns true if it would create a cycle
```

## 📊 Data Statistics

```sql
-- Practice counts by category
SELECT category, COUNT(*)
FROM practices
GROUP BY category;

-- Dependency statistics
SELECT
  COUNT(*) as total_dependencies,
  COUNT(DISTINCT practice_id) as practices_with_deps,
  COUNT(DISTINCT depends_on_id) as practices_depended_on
FROM practice_dependencies;

-- Most critical practices
SELECT * FROM practice_summary
ORDER BY dependent_count DESC
LIMIT 5;
```

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check SSL requirement
# Add ssl=true to connection string if needed
```

### Migration Issues

```bash
# Reset database (CAREFUL - deletes all data)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL -f schema.sql
psql $DATABASE_URL -f seed.sql
```

### Data Validation

```bash
# Check for orphaned dependencies
SELECT pd.*
FROM practice_dependencies pd
LEFT JOIN practices p1 ON pd.practice_id = p1.id
LEFT JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id IS NULL OR p2.id IS NULL;

# Should return 0 rows
```

## 🎯 Next Steps

1. ✅ Database schema created
2. ✅ Data seeded
3. ⏳ Build SvelteKit frontend
4. ⏳ Create interactive graph visualization
5. ⏳ Deploy to Netlify

## 📚 Resources

- **Full Documentation**: `DATABASE.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Type Definitions**: `db.types.ts`
- **Example Client**: `db-client.example.ts`
- **Original Data**: `practices.json`
- **Netlify Postgres**: https://docs.netlify.com/databases/overview/
