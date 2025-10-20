-- ============================================================================
-- PRE-MIGRATION VALIDATION QUERIES
-- Purpose: Validate database state before applying new practices migration
-- Usage: Run these queries before migration to ensure system readiness
-- ============================================================================

-- 1. CHECK SCHEMA VERSION AND STRUCTURE
-- ----------------------------------------------------------------------------
-- Verify required tables exist
SELECT
  'practices' as table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'practices'
  ) as exists
UNION ALL
SELECT
  'practice_dependencies',
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'practice_dependencies'
  )
UNION ALL
SELECT
  'metadata',
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'metadata'
  )
UNION ALL
SELECT
  'schema_migrations',
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'schema_migrations'
  );

-- 2. CHECK FOR EXISTING PRACTICES (PREVENT DUPLICATES)
-- ----------------------------------------------------------------------------
-- List any practices that would conflict with new migration
-- Replace these IDs with actual IDs from your migration
WITH new_practice_ids AS (
  SELECT unnest(ARRAY[
    'behavior-driven-development',
    'deterministic-tests'
    -- Add more IDs from your migration here
  ]) as id
)
SELECT
  np.id as planned_id,
  p.id as existing_id,
  p.name as existing_name,
  CASE
    WHEN p.id IS NOT NULL THEN 'CONFLICT: Practice already exists'
    ELSE 'OK: Available for insertion'
  END as status
FROM new_practice_ids np
LEFT JOIN practices p ON np.id = p.id
ORDER BY
  CASE WHEN p.id IS NOT NULL THEN 0 ELSE 1 END,
  np.id;

-- 3. VALIDATE DEPENDENCY TARGETS EXIST
-- ----------------------------------------------------------------------------
-- Check that all practices we want to depend on actually exist
WITH required_dependencies AS (
  SELECT unnest(ARRAY[
    'version-control',
    'automated-testing',
    'test-automation-framework',
    'test-data-management',
    'trunk-based-development'
    -- Add all practices that new practices will depend on
  ]) as id
)
SELECT
  rd.id as required_id,
  p.name,
  CASE
    WHEN p.id IS NOT NULL THEN 'OK: Dependency exists'
    ELSE 'ERROR: Missing required dependency'
  END as status
FROM required_dependencies rd
LEFT JOIN practices p ON rd.id = p.id
ORDER BY
  CASE WHEN p.id IS NULL THEN 0 ELSE 1 END,
  rd.id;

-- 4. CHECK CURRENT DATABASE STATE
-- ----------------------------------------------------------------------------
-- Get current counts and metadata
SELECT
  'Current practice count' as metric,
  COUNT(*)::text as value
FROM practices
UNION ALL
SELECT
  'Current dependency count',
  COUNT(*)::text
FROM practice_dependencies
UNION ALL
SELECT
  'Current version',
  value::text
FROM metadata
WHERE key = 'version'
UNION ALL
SELECT
  'Last update date',
  value::text
FROM metadata
WHERE key = 'lastUpdated'
UNION ALL
SELECT
  'Applied migrations',
  COUNT(*)::text
FROM schema_migrations
WHERE success = true;

-- 5. CHECK FOR EXISTING CIRCULAR DEPENDENCIES
-- ----------------------------------------------------------------------------
-- Ensure no cycles exist before migration
WITH RECURSIVE dep_path AS (
  -- Start from each practice
  SELECT
    practice_id,
    depends_on_id,
    ARRAY[practice_id, depends_on_id] as path,
    1 as depth
  FROM practice_dependencies

  UNION ALL

  -- Recursively follow dependencies
  SELECT
    dp.practice_id,
    pd.depends_on_id,
    dp.path || pd.depends_on_id,
    dp.depth + 1
  FROM dep_path dp
  JOIN practice_dependencies pd ON dp.depends_on_id = pd.practice_id
  WHERE dp.depth < 20 -- Prevent infinite recursion
    AND NOT pd.depends_on_id = ANY(dp.path) -- Stop if we find a cycle
)
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN 'ERROR: Circular dependencies detected'
    ELSE 'OK: No circular dependencies found'
  END as cycle_check,
  COUNT(*) as cycle_count
FROM dep_path
WHERE path[1] = path[array_length(path, 1)];

-- 6. VALIDATE CATEGORY CONSTRAINTS
-- ----------------------------------------------------------------------------
-- Check that all existing practices have valid categories
SELECT
  'Invalid categories' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN 'OK: All categories valid'
    ELSE 'ERROR: Invalid categories found'
  END as status
FROM practices
WHERE category NOT IN ('practice', 'tooling', 'behavior', 'culture');

-- 7. CHECK MIGRATION HISTORY
-- ----------------------------------------------------------------------------
-- See what migrations have already been applied
SELECT
  migration_name,
  migration_type,
  applied_at,
  success,
  CASE
    WHEN error_message IS NOT NULL THEN error_message
    ELSE 'Success'
  END as status
FROM schema_migrations
ORDER BY applied_at DESC
LIMIT 10;

-- 8. VALIDATE FOREIGN KEY INTEGRITY
-- ----------------------------------------------------------------------------
-- Ensure no orphaned dependencies exist
SELECT
  'Orphaned dependencies (practice_id)' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN 'OK: No orphaned practice_ids'
    ELSE 'ERROR: Orphaned practice_ids found'
  END as status
FROM practice_dependencies pd
LEFT JOIN practices p ON pd.practice_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT
  'Orphaned dependencies (depends_on_id)',
  COUNT(*),
  CASE
    WHEN COUNT(*) = 0 THEN 'OK: No orphaned depends_on_ids'
    ELSE 'ERROR: Orphaned depends_on_ids found'
  END
FROM practice_dependencies pd
LEFT JOIN practices p ON pd.depends_on_id = p.id
WHERE p.id IS NULL;

-- 9. SUMMARY VALIDATION
-- ----------------------------------------------------------------------------
-- Overall pre-migration status
WITH validation_checks AS (
  SELECT
    (SELECT COUNT(*) FROM practices) as practice_count,
    (SELECT COUNT(*) FROM practice_dependencies) as dependency_count,
    (SELECT COUNT(*) FROM practices WHERE category NOT IN ('practice', 'tooling', 'behavior', 'culture')) as invalid_categories,
    (SELECT COUNT(*) FROM practice_dependencies pd LEFT JOIN practices p ON pd.practice_id = p.id WHERE p.id IS NULL) as orphaned_practice_ids,
    (SELECT COUNT(*) FROM practice_dependencies pd LEFT JOIN practices p ON pd.depends_on_id = p.id WHERE p.id IS NULL) as orphaned_depends_on_ids
)
SELECT
  CASE
    WHEN invalid_categories > 0 THEN 'NOT READY: Invalid categories exist'
    WHEN orphaned_practice_ids > 0 THEN 'NOT READY: Orphaned practice_ids exist'
    WHEN orphaned_depends_on_ids > 0 THEN 'NOT READY: Orphaned depends_on_ids exist'
    ELSE 'READY: Database is ready for migration'
  END as migration_readiness,
  practice_count,
  dependency_count,
  invalid_categories,
  orphaned_practice_ids + orphaned_depends_on_ids as total_orphaned_records
FROM validation_checks;