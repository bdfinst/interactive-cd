# Database Schema Documentation

## Overview

This database schema is designed for **Netlify Postgres** (free tier) to support **unlimited levels of hierarchical dependencies** between Continuous Delivery practices.

The schema uses an **adjacency list pattern** with a junction table to represent a directed acyclic graph (DAG) of practice dependencies.

## Architecture

### Pattern: Adjacency List with Junction Table

```
practices                    practice_dependencies
┌──────────────┐            ┌──────────────────┐
│ id (PK)      │◄───────────┤ practice_id (FK) │
│ name         │            │ depends_on_id(FK)│
│ type         │            └──────────────────┘
│ category     │
│ description  │
│ requirements │
│ benefits     │
└──────────────┘
```

This pattern allows:

- ✅ **Unlimited depth** of dependencies
- ✅ **Multiple parents** (a practice can be a dependency of many practices)
- ✅ **Multiple children** (a practice can depend on many practices)
- ✅ **Efficient queries** via recursive CTEs
- ✅ **Prevents circular dependencies** via database functions

## Tables

### `practices`

Core table storing all CD practices.

| Column       | Type         | Constraints | Description                                  |
| ------------ | ------------ | ----------- | -------------------------------------------- |
| id           | VARCHAR(255) | PRIMARY KEY | Unique identifier (kebab-case)               |
| name         | VARCHAR(255) | NOT NULL    | Human-readable name                          |
| type         | VARCHAR(50)  | NOT NULL    | 'root' or 'practice'                         |
| category     | VARCHAR(50)  | NOT NULL    | 'practice', 'tooling', 'behavior', 'culture' |
| description  | TEXT         | NOT NULL    | Detailed explanation                         |
| requirements | JSONB        | NOT NULL    | Array of requirement strings                 |
| benefits     | JSONB        | NOT NULL    | Array of benefit strings                     |
| created_at   | TIMESTAMPTZ  | DEFAULT NOW | Creation timestamp                           |
| updated_at   | TIMESTAMPTZ  | DEFAULT NOW | Last update timestamp                        |

**Constraints:**

- `type` must be 'root' or 'practice'
- `category` must be 'practice', 'tooling', 'behavior', or 'culture'

**Indexes:**

- `idx_practices_category` - Filter by category
- `idx_practices_type` - Filter by type
- `idx_practices_requirements` - GIN index for JSONB queries
- `idx_practices_benefits` - GIN index for JSONB queries

### `practice_dependencies`

Junction table representing dependency relationships.

| Column        | Type         | Constraints  | Description                        |
| ------------- | ------------ | ------------ | ---------------------------------- |
| id            | SERIAL       | PRIMARY KEY  | Auto-increment ID                  |
| practice_id   | VARCHAR(255) | FK, NOT NULL | The practice that has dependencies |
| depends_on_id | VARCHAR(255) | FK, NOT NULL | The practice being depended on     |
| created_at    | TIMESTAMPTZ  | DEFAULT NOW  | Creation timestamp                 |

**Constraints:**

- FOREIGN KEY to `practices(id)` with CASCADE delete
- UNIQUE constraint on `(practice_id, depends_on_id)` - no duplicate edges
- CHECK constraint: `practice_id != depends_on_id` - no self-loops

**Indexes:**

- `idx_practice_dependencies_practice_id` - Find all dependencies of a practice
- `idx_practice_dependencies_depends_on_id` - Find all dependents of a practice

### `metadata`

Store dataset metadata.

| Column     | Type         | Constraints | Description           |
| ---------- | ------------ | ----------- | --------------------- |
| key        | VARCHAR(255) | PRIMARY KEY | Metadata key          |
| value      | JSONB        | NOT NULL    | Metadata value        |
| updated_at | TIMESTAMPTZ  | DEFAULT NOW | Last update timestamp |

## Database Functions

### 1. `get_practice_dependencies(practice_id)`

Get all direct dependencies of a practice.

```sql
SELECT * FROM get_practice_dependencies('continuous-integration');
```

**Returns:**

```
id                          | name                      | type     | category
----------------------------|---------------------------|----------|----------
trunk-based-development     | Trunk-based Development   | practice | behavior
automated-testing           | Automated Testing         | practice | practice
build-automation            | Build Automation          | practice | tooling
version-control             | Version Control           | practice | tooling
```

### 2. `get_practice_dependents(practice_id)`

Get all practices that depend on a given practice (reverse dependencies).

```sql
SELECT * FROM get_practice_dependents('version-control');
```

**Returns:** All practices that have `version-control` as a dependency.

### 3. `get_practice_tree(root_practice_id)`

Get the entire dependency tree starting from a practice (recursive, all descendants).

```sql
SELECT * FROM get_practice_tree('continuous-delivery');
```

**Returns:**

```
id          | name        | level | path
------------|-------------|-------|---------------------------
cd          | CD          | 0     | CD
ci          | CI          | 1     | CD > CI
tbd         | TBD         | 2     | CD > CI > TBD
vc          | VC          | 3     | CD > CI > TBD > VC
```

**Use case:** Load entire graph for client-side visualization.

### 4. `get_practice_ancestors(practice_id)`

Get all ancestors of a practice (reverse tree - who leads to this practice).

```sql
SELECT * FROM get_practice_ancestors('version-control');
```

**Returns:** All practices that eventually depend on this practice (up the tree).

**Use case:** Breadcrumb navigation, impact analysis.

### 5. `would_create_cycle(parent_id, child_id)`

Check if adding a dependency would create a circular reference.

```sql
SELECT would_create_cycle('version-control', 'continuous-delivery');
-- Returns: true (would create cycle)
```

**Use case:** Validate dependencies before inserting.

### 6. `get_practice_depth(practice_id)`

Get the depth of a practice from the root (distance).

```sql
SELECT get_practice_depth('version-control');
-- Returns: 3 (if VC is 3 levels deep from CD)
```

**Use case:** UI layout positioning, max depth calculation.

## Views

### `practice_summary`

Summary of all practices with dependency counts.

```sql
SELECT * FROM practice_summary ORDER BY dependent_count DESC;
```

**Returns:**

```
id              | name            | dependency_count | dependent_count
----------------|-----------------|------------------|----------------
version-control | Version Control | 0                | 6
build-automation| Build Automation| 2                | 5
```

**Use case:** Dashboard, analytics, identifying critical practices.

### `leaf_practices`

Practices with no dependencies (foundation practices).

```sql
SELECT * FROM leaf_practices;
```

**Use case:** Identify starting points for learning paths.

### `root_practices`

Root-level practices (entry points).

```sql
SELECT * FROM root_practices;
```

**Use case:** Initialize tree visualization.

## Common Query Patterns

### 1. Get Practice with Dependencies

```sql
SELECT
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', dep.id,
        'name', dep.name,
        'category', dep.category
      )
    ) FILTER (WHERE dep.id IS NOT NULL),
    '[]'
  ) AS dependencies
FROM practices p
LEFT JOIN practice_dependencies pd ON p.id = pd.practice_id
LEFT JOIN practices dep ON pd.depends_on_id = dep.id
WHERE p.id = 'continuous-integration'
GROUP BY p.id;
```

### 2. Search Practices

```sql
SELECT *
FROM practices
WHERE
  name ILIKE '%integration%'
  OR description ILIKE '%integration%'
  OR requirements::text ILIKE '%integration%';
```

### 3. Filter by Category

```sql
SELECT * FROM practices WHERE category = 'tooling';
```

### 4. Get Full Graph (All Practices with Dependencies)

```sql
SELECT
  p.id,
  p.name,
  p.category,
  json_agg(pd.depends_on_id) FILTER (WHERE pd.depends_on_id IS NOT NULL) AS dependency_ids
FROM practices p
LEFT JOIN practice_dependencies pd ON p.id = pd.practice_id
GROUP BY p.id, p.name, p.category
ORDER BY p.name;
```

### 5. Add New Practice with Dependencies

```sql
BEGIN;

-- Insert practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'new-practice',
  'New Practice',
  'practice',
  'tooling',
  'Description here',
  '["Requirement 1", "Requirement 2"]'::jsonb,
  '["Benefit 1", "Benefit 2"]'::jsonb
);

-- Add dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('new-practice', 'version-control'),
  ('new-practice', 'build-automation');

COMMIT;
```

### 6. Check for Cycles Before Adding Dependency

```sql
SELECT would_create_cycle('practice-a', 'practice-b');
-- If false, safe to add:
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES ('practice-a', 'practice-b');
```

### 7. Delete Practice (Cascade)

```sql
-- This will automatically delete all dependencies
DELETE FROM practices WHERE id = 'old-practice';
```

## Setup Instructions

### 1. Create Database

On Netlify, create a Postgres database instance (free tier).

### 2. Run Migrations

Execute migrations in order:

```bash
# 1. Create schema
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# 2. Add functions
psql $DATABASE_URL -f migrations/002_add_functions.sql

# 3. Add views
psql $DATABASE_URL -f migrations/003_add_views.sql
```

Or use the combined schema:

```bash
psql $DATABASE_URL -f schema.sql
```

### 3. Seed Data

```bash
# Generate seed SQL from JSON
node seed-data.js > seed.sql

# Load seed data
psql $DATABASE_URL -f seed.sql
```

### 4. Verify

```sql
-- Check practice count
SELECT COUNT(*) FROM practices;  -- Should return 23

-- Check dependency count
SELECT COUNT(*) FROM practice_dependencies;

-- View tree
SELECT * FROM get_practice_tree('continuous-delivery') LIMIT 10;
```

## Netlify Integration

### Environment Variables

Add to Netlify environment variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### SvelteKit Database Client

```typescript
// src/lib/server/db.ts
import { DATABASE_URL } from '$env/static/private'
import pkg from 'pg'
const { Pool } = pkg

export const db = new Pool({
	connectionString: DATABASE_URL,
	ssl: { rejectUnauthorized: false }
})
```

### Example API Route

```typescript
// src/routes/api/practices/+server.ts
import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	const result = await db.query('SELECT * FROM practices ORDER BY name')
	return json(result.rows)
}
```

### Example Tree Query

```typescript
// src/routes/api/tree/[id]/+server.ts
import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	const result = await db.query('SELECT * FROM get_practice_tree($1)', [params.id])
	return json(result.rows)
}
```

## Performance Considerations

### For Free Tier

Netlify Postgres free tier limits:

- **1 GB storage**
- **60 hours/month runtime**
- **1,000 rows** (our dataset: ~23 practices, ~50 dependencies = well within limits)

### Optimization Tips

1. **Limit recursion depth** in queries (already set to 100 in functions)
2. **Use views** for frequently accessed aggregations
3. **Index properly** (already configured)
4. **Cache API responses** in SvelteKit load functions
5. **Use connection pooling** (configured in example above)

### Scaling Strategy

If you outgrow free tier:

1. Upgrade to Netlify paid plan
2. Or migrate to external Postgres (Supabase, Neon, etc.)
3. Schema remains the same - just update connection string

## Backup and Recovery

### Export Data

```bash
# Export to JSON (for backup)
psql $DATABASE_URL -c "SELECT row_to_json(p) FROM practices p" > backup.json
```

### Restore from JSON

```bash
# Regenerate seed.sql and reload
node seed-data.js > seed.sql
psql $DATABASE_URL -f seed.sql
```

## Testing

### Run Validation Queries

```sql
-- Ensure no circular dependencies
SELECT * FROM practices p
WHERE exists(
  SELECT 1 FROM get_practice_ancestors(p.id)
  WHERE id = p.id AND level > 0
);
-- Should return 0 rows

-- Verify all dependencies exist
SELECT pd.practice_id, pd.depends_on_id
FROM practice_dependencies pd
LEFT JOIN practices p1 ON pd.practice_id = p1.id
LEFT JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id IS NULL OR p2.id IS NULL;
-- Should return 0 rows
```

## Schema Advantages

✅ **Unlimited depth** - No hard-coded levels, tree can grow infinitely
✅ **Flexible relationships** - Many-to-many supported naturally
✅ **Prevents cycles** - Built-in validation function
✅ **Efficient queries** - Recursive CTEs with proper indexing
✅ **Normalized** - No data duplication
✅ **Auditable** - Timestamps on all changes
✅ **Type-safe** - CHECK constraints enforce valid values
✅ **JSONB support** - Flexible for arrays of requirements/benefits
✅ **Netlify compatible** - Works on free tier

## Next Steps

1. ✅ Schema created
2. ✅ Migrations ready
3. ✅ Seed data generated
4. ⏳ Create SvelteKit database client
5. ⏳ Build API routes
6. ⏳ Connect to UI components
