# CD Practices Data Structure

## Overview

This document describes the data structure for the Continuous Delivery dependency visualization application based on [MinimumCD.org](https://minimumcd.org).

**Source of Truth**: The database itself is the canonical source. Initial data is loaded from `db/seed.sql`.

## Files

| File                   | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `db/schema.sql`        | Complete database schema (tables, functions, views) |
| `db/seed.sql`          | Initial dataset (23 practices from MinimumCD.org)   |
| `db/client.example.js` | Database client implementation example              |
| `db/migrations/`       | Step-by-step migration files                        |

## Data Structure

### Practice Object (Database Row)

Each practice in the database has the following structure:

```sql
CREATE TABLE practices (
  id VARCHAR(255) PRIMARY KEY,              -- Unique identifier (kebab-case)
  name VARCHAR(255) NOT NULL,               -- Display name
  type VARCHAR(50) NOT NULL,                -- 'root' or 'practice'
  category VARCHAR(50) NOT NULL,            -- 'practice', 'tooling', 'behavior', 'culture'
  description TEXT NOT NULL,                -- Detailed explanation
  requirements JSONB NOT NULL,              -- Array of requirement strings
  benefits JSONB NOT NULL,                  -- Array of benefit strings
  created_at TIMESTAMP WITH TIME ZONE,      -- Creation timestamp
  updated_at TIMESTAMP WITH TIME ZONE       -- Last update timestamp
);
```

### Categories

Practices are classified into four categories:

- **🔄 Practice** (3) - Core development practices (CI, CD, Automated Testing)
- **🛠 Tooling** (17) - Technical infrastructure and tools
- **👥 Behavior** (2) - Team behaviors and approaches
- **🌟 Culture** (1) - Cultural and organizational practices

## Hierarchy

The data structure forms a **directed acyclic graph (DAG)** with:

- **1 Root Node**: Continuous Delivery (the ultimate goal)
- **22 Dependent Practices**: Supporting practices at various levels
- **7 Leaf Nodes**: Foundational practices with no dependencies

### Hierarchy Visualization

```
🎯 Continuous Delivery
   ├─ 🔄 Continuous Integration
   │   ├─ 👥 Trunk-based Development
   │   │   ├─ 🛠 Version Control
   │   │   └─ 🛠 Feature Flags
   │   ├─ 🔄 Automated Testing
   │   ├─ 🛠 Build Automation
   │   └─ 🛠 Version Control
   ├─ 🛠 Application Pipeline
   ├─ 🛠 Immutable Artifact
   ├─ 🛠 Production-like Test Environment
   ├─ 🛠 On-demand Rollback
   └─ 🛠 Application Configuration Management
```

## Key Metrics

### Statistics

- **Total Practices**: 23
- **Total Dependencies**: 41
- **Maximum Depth**: 4 levels (from CD to leaf practices)
- **Average Dependencies per Practice**: ~1.8
- **Most Critical Practice**: Version Control (6 dependents)

### Leaf Nodes (Foundation)

These practices have **zero dependencies** and form the foundation:

1. Version Control
2. Test Automation Framework
3. Artifact Repository
4. Secret Management
5. Test Data Management
6. Dependency Management
7. Logging Infrastructure

### Most Critical Practices

Practices with the most dependents (most other practices rely on them):

1. **Version Control** - 6 dependents
2. **Build Automation** - 5 dependents
3. **Configuration Management** - 4 dependents
4. **Automated Testing** - 3 dependents
5. **Deployment Automation** - 3 dependents

## Practice Details

### Example: Continuous Integration

Query the database to see practice details:

```sql
SELECT
  id,
  name,
  type,
  category,
  description,
  requirements,
  benefits
FROM practices
WHERE id = 'continuous-integration';
```

**Result:**

- **id**: continuous-integration
- **name**: Continuous Integration
- **type**: practice
- **category**: practice
- **description**: Integrate code changes frequently to detect integration issues early...
- **requirements**: ["Use Trunk-based Development", "Integrate work to trunk at least daily", ...]
- **benefits**: ["Early detection of integration issues", "Reduced merge conflicts", ...]

### Dependencies

```sql
SELECT p.name
FROM practices p
INNER JOIN practice_dependencies pd ON p.id = pd.depends_on_id
WHERE pd.practice_id = 'continuous-integration';
```

**Result:**

- Trunk-based Development
- Automated Testing
- Build Automation
- Version Control

## Database Schema Properties

### Graph Type

- **Directed Acyclic Graph (DAG)**
- No circular dependencies
- Single root node
- Multiple paths to same node allowed

### Validation Rules

1. ✅ All dependency IDs must reference existing practices (enforced by foreign keys)
2. ✅ No circular dependencies (enforced by `would_create_cycle()` function)
3. ✅ Exactly one root node (type: "root")
4. ✅ All practices reachable from root
5. ✅ Each practice must have at least 1 requirement
6. ✅ Each practice must have at least 1 benefit

### Querying the Database

```sql
-- View all practices
SELECT * FROM practices ORDER BY name;

-- Get practice tree
SELECT * FROM get_practice_tree('continuous-delivery');

-- Get dependencies
SELECT * FROM get_practice_dependencies('continuous-integration');

-- Get dependents (reverse lookup)
SELECT * FROM get_practice_dependents('version-control');

-- Get practice summary
SELECT * FROM practice_summary ORDER BY dependent_count DESC;
```

## Usage in Application

### Loading Data

```javascript
// src/lib/server/db.js
import { db } from './db.js'

// Get all practices
const practices = await db.getAllPractices()

// Get practice tree
const tree = await db.getPracticeTree('continuous-delivery')

// Get single practice with dependencies
const practice = await db.getPractice('continuous-integration')
const dependencies = await db.getPracticeDependencies('continuous-integration')
const dependents = await db.getPracticeDependents('continuous-integration')
```

### Building Graph Structure

```javascript
// Build tree starting from root
async function buildPracticeTree() {
	const roots = await db.getRootPractices()
	const tree = await db.getPracticeTree(roots[0].id)

	// Convert flat tree to nested structure
	const nodeMap = new Map()
	tree.forEach(node => {
		nodeMap.set(node.id, { ...node, children: [] })
	})

	tree.forEach(node => {
		if (node.level > 0) {
			const parent = tree.find(p => p.level === node.level - 1 && node.path.startsWith(p.path))
			if (parent) {
				nodeMap.get(parent.id).children.push(nodeMap.get(node.id))
			}
		}
	})

	return nodeMap.get(roots[0].id)
}
```

## Data Source

All practices and requirements are derived from:

- **MinimumCD.org** - Minimum viable continuous delivery standards
- **Source**: https://minimumcd.org
- **Version**: 1.0.0
- **Last Updated**: 2025-10-17

## Modifying Data

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

### Update Existing Practice

```sql
UPDATE practices
SET
  description = 'Updated description',
  requirements = '["New req 1", "New req 2"]'::jsonb
WHERE id = 'continuous-integration';
```

### Delete Practice (Cascades)

```sql
DELETE FROM practices WHERE id = 'old-practice';
-- Dependencies are automatically deleted due to CASCADE
```

### Check for Circular Dependencies

```sql
-- Before adding a dependency
SELECT would_create_cycle('practice-a', 'practice-b');
-- Returns true if it would create a cycle
```

## Export Data

### Export to JSON

```bash
# Export all practices to JSON
psql $DATABASE_URL -c "
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name,
      'type', p.type,
      'category', p.category,
      'description', p.description,
      'requirements', p.requirements,
      'benefits', p.benefits
    )
  )
  FROM practices p
  ORDER BY p.name;
" > practices-export.json

# Export dependencies
psql $DATABASE_URL -c "
  SELECT json_agg(pd)
  FROM practice_dependencies pd;
" > dependencies-export.json
```

### Backup Database

```bash
# Full database backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Data Statistics

Query the database for current statistics:

```sql
-- Practice counts by category
SELECT category, COUNT(*) as count
FROM practices
GROUP BY category
ORDER BY count DESC;

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

-- Leaf practices
SELECT COUNT(*) as leaf_count
FROM leaf_practices;
```

## Schema Evolution

The database schema supports future enhancements:

### Potential Additions

1. **Practice Maturity Levels** - Beginner, Intermediate, Advanced
2. **Estimated Implementation Time** - How long to adopt
3. **Team Size Considerations** - Adjustments based on team size
4. **Industry Examples** - Real-world case studies
5. **Anti-patterns** - Common mistakes to avoid
6. **Metrics** - How to measure success
7. **Related Practices** - Non-dependency relationships
8. **Prerequisites** - Skills or knowledge needed

### Example Schema Extension

```sql
-- Add maturity level
ALTER TABLE practices
ADD COLUMN maturity_level VARCHAR(50)
CHECK (maturity_level IN ('beginner', 'intermediate', 'advanced'));

-- Add implementation time estimate
ALTER TABLE practices
ADD COLUMN estimated_time VARCHAR(100);

-- Add related practices (non-dependency relationships)
CREATE TABLE practice_relationships (
  id SERIAL PRIMARY KEY,
  practice_id VARCHAR(255) REFERENCES practices(id),
  related_id VARCHAR(255) REFERENCES practices(id),
  relationship_type VARCHAR(50) -- 'similar', 'alternative', 'complements', etc.
);
```

## Maintenance

### Validate Data Integrity

```sql
-- Check for orphaned dependencies
SELECT pd.*
FROM practice_dependencies pd
LEFT JOIN practices p1 ON pd.practice_id = p1.id
LEFT JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id IS NULL OR p2.id IS NULL;
-- Should return 0 rows

-- Verify no circular dependencies
SELECT * FROM practices p
WHERE exists(
  SELECT 1 FROM get_practice_ancestors(p.id)
  WHERE id = p.id AND level > 0
);
-- Should return 0 rows

-- Check for multiple roots
SELECT COUNT(*) as root_count
FROM practices
WHERE type = 'root';
-- Should return 1
```

### Update Seed File

After making database changes, export to new seed file:

```bash
# Export schema and data
pg_dump $DATABASE_URL \
  --schema-only \
  --no-owner \
  --no-acl \
  > db/schema-new.sql

pg_dump $DATABASE_URL \
  --data-only \
  --no-owner \
  --no-acl \
  --table=practices \
  --table=practice_dependencies \
  --table=metadata \
  > db/seed-new.sql
```

## Best Practices

1. **Always use transactions** when modifying multiple related records
2. **Validate cycles** before adding dependencies
3. **Use the database functions** for tree queries instead of manual recursion
4. **Keep descriptions concise** but informative
5. **Use JSONB for arrays** to maintain type safety and enable indexing
6. **Document changes** in migration files
7. **Test queries** against practice_summary view for performance

## Resources

- **Database Schema**: `db/schema.sql`
- **Initial Data**: `db/seed.sql`
- **Client Example**: `db/client.example.js`
- **Database Docs**: `docs/DATABASE.md`
- **Quick Reference**: `docs/DATABASE-QUICKSTART.md`
