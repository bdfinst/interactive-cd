-- ============================================================================
-- POST-MIGRATION VALIDATION QUERIES
-- Purpose: Validate database state after applying new practices migration
-- Usage: Run these queries after migration to ensure success
-- ============================================================================

-- 1. VERIFY NEW PRACTICES WERE INSERTED
-- ----------------------------------------------------------------------------
-- Check that all expected practices exist with correct data
-- Update these IDs based on your specific migration
WITH expected_practices AS (
  SELECT * FROM (VALUES
    ('behavior-driven-development', 'Behavior-Driven Development (BDD)', 'practice', 'behavior'),
    ('deterministic-tests', 'Deterministic Tests', 'practice', 'behavior')
    -- Add more expected practices here
  ) AS t(id, name, type, category)
)
SELECT
  ep.id as expected_id,
  ep.name as expected_name,
  p.id as actual_id,
  p.name as actual_name,
  p.type as actual_type,
  p.category as actual_category,
  CASE
    WHEN p.id IS NULL THEN 'FAILED: Practice not inserted'
    WHEN p.name != ep.name THEN 'WARNING: Name mismatch'
    WHEN p.type != ep.type THEN 'WARNING: Type mismatch'
    WHEN p.category != ep.category THEN 'WARNING: Category mismatch'
    ELSE 'SUCCESS: Practice inserted correctly'
  END as status
FROM expected_practices ep
LEFT JOIN practices p ON ep.id = p.id
ORDER BY ep.id;

-- 2. VERIFY NEW DEPENDENCIES WERE CREATED
-- ----------------------------------------------------------------------------
-- Check that all expected dependencies exist
-- Update these based on your specific migration
WITH expected_dependencies AS (
  SELECT * FROM (VALUES
    ('trunk-based-development', 'deterministic-tests'),
    ('deterministic-tests', 'automated-testing'),
    ('deterministic-tests', 'test-automation-framework'),
    ('deterministic-tests', 'test-data-management'),
    ('deterministic-tests', 'behavior-driven-development'),
    ('behavior-driven-development', 'version-control')
    -- Add more expected dependencies here
  ) AS t(practice_id, depends_on_id)
)
SELECT
  ed.practice_id,
  p1.name as practice_name,
  ed.depends_on_id,
  p2.name as depends_on_name,
  CASE
    WHEN pd.id IS NULL THEN 'FAILED: Dependency not created'
    ELSE 'SUCCESS: Dependency exists'
  END as status
FROM expected_dependencies ed
LEFT JOIN practice_dependencies pd
  ON ed.practice_id = pd.practice_id
  AND ed.depends_on_id = pd.depends_on_id
LEFT JOIN practices p1 ON ed.practice_id = p1.id
LEFT JOIN practices p2 ON ed.depends_on_id = p2.id
ORDER BY ed.practice_id, ed.depends_on_id;

-- 3. VERIFY PRACTICE REQUIREMENTS AND BENEFITS
-- ----------------------------------------------------------------------------
-- Check that JSONB fields contain expected data
SELECT
  id,
  name,
  jsonb_array_length(requirements) as requirement_count,
  jsonb_array_length(benefits) as benefit_count,
  CASE
    WHEN requirements IS NULL OR requirements = '[]'::jsonb THEN 'WARNING: No requirements'
    WHEN jsonb_array_length(requirements) < 3 THEN 'WARNING: Few requirements'
    ELSE 'OK: Requirements present'
  END as requirements_status,
  CASE
    WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN 'WARNING: No benefits'
    WHEN jsonb_array_length(benefits) < 3 THEN 'WARNING: Few benefits'
    ELSE 'OK: Benefits present'
  END as benefits_status
FROM practices
WHERE id IN (
  'behavior-driven-development',
  'deterministic-tests'
  -- Add your new practice IDs here
)
ORDER BY id;

-- 4. CHECK FOR CIRCULAR DEPENDENCIES
-- ----------------------------------------------------------------------------
-- Ensure no cycles were introduced by the migration
WITH RECURSIVE cycle_check AS (
  -- Start from each practice
  SELECT
    practice_id as start_id,
    practice_id,
    depends_on_id,
    ARRAY[practice_id] as path,
    false as has_cycle
  FROM practice_dependencies

  UNION ALL

  -- Follow the dependency chain
  SELECT
    cc.start_id,
    pd.practice_id,
    pd.depends_on_id,
    cc.path || pd.practice_id,
    pd.depends_on_id = cc.start_id as has_cycle
  FROM cycle_check cc
  JOIN practice_dependencies pd ON cc.depends_on_id = pd.practice_id
  WHERE NOT cc.has_cycle
    AND NOT pd.practice_id = ANY(cc.path)
    AND array_length(cc.path, 1) < 50 -- Prevent runaway recursion
)
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN 'SUCCESS: No circular dependencies'
    ELSE 'CRITICAL: Circular dependencies detected!'
  END as cycle_status,
  COUNT(*) as cycle_count,
  array_agg(DISTINCT start_id) as practices_with_cycles
FROM cycle_check
WHERE has_cycle;

-- 5. VERIFY METADATA WAS UPDATED
-- ----------------------------------------------------------------------------
-- Check that version and timestamps were updated
SELECT
  key,
  value,
  CASE
    WHEN key = 'version' THEN
      CASE
        WHEN value::text > '"1.0.0"' THEN 'SUCCESS: Version incremented'
        ELSE 'WARNING: Version not updated'
      END
    WHEN key = 'lastUpdated' THEN
      CASE
        WHEN value::text >= to_jsonb(CURRENT_DATE - INTERVAL '1 day')::text THEN 'SUCCESS: Recently updated'
        ELSE 'WARNING: Update date is old'
      END
    ELSE 'INFO: Metadata present'
  END as status
FROM metadata
WHERE key IN ('version', 'lastUpdated', 'changelog')
ORDER BY key;

-- 6. VERIFY MIGRATION WAS RECORDED
-- ----------------------------------------------------------------------------
-- Check schema_migrations table for the migration record
SELECT
  migration_name,
  migration_type,
  applied_at,
  success,
  CASE
    WHEN success = true THEN 'SUCCESS: Migration recorded'
    ELSE 'FAILED: Migration failed - ' || COALESCE(error_message, 'Unknown error')
  END as status
FROM schema_migrations
WHERE migration_name LIKE '%add_%test%'
   OR migration_name LIKE '%deterministic%'
   OR migration_name = '003_add_deterministic_tests.sql'
ORDER BY applied_at DESC
LIMIT 1;

-- 7. VALIDATE DEPENDENCY GRAPH DEPTH
-- ----------------------------------------------------------------------------
-- Check that dependency chains aren't too deep (performance concern)
WITH RECURSIVE depth_calc AS (
  -- Start with root practice
  SELECT
    id,
    name,
    0 as depth
  FROM practices
  WHERE id = 'continuous-delivery'

  UNION ALL

  -- Recursively calculate depth
  SELECT
    p.id,
    p.name,
    dc.depth + 1
  FROM practices p
  JOIN practice_dependencies pd ON p.id = pd.depends_on_id
  JOIN depth_calc dc ON pd.practice_id = dc.id
  WHERE dc.depth < 20
)
SELECT
  MAX(depth) as max_depth,
  CASE
    WHEN MAX(depth) > 10 THEN 'WARNING: Very deep dependency tree'
    WHEN MAX(depth) > 7 THEN 'INFO: Deep dependency tree'
    ELSE 'OK: Reasonable dependency depth'
  END as depth_status,
  COUNT(DISTINCT id) as total_practices_in_tree
FROM depth_calc;

-- 8. VERIFY NO ORPHANED RECORDS
-- ----------------------------------------------------------------------------
-- Ensure all foreign keys are valid after migration
SELECT
  'Orphaned practice_dependencies (practice_id)' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN 'SUCCESS: No orphaned records'
    ELSE 'CRITICAL: Orphaned dependencies found!'
  END as status
FROM practice_dependencies pd
WHERE NOT EXISTS (
  SELECT 1 FROM practices p WHERE p.id = pd.practice_id
)
UNION ALL
SELECT
  'Orphaned practice_dependencies (depends_on_id)',
  COUNT(*),
  CASE
    WHEN COUNT(*) = 0 THEN 'SUCCESS: No orphaned records'
    ELSE 'CRITICAL: Orphaned dependencies found!'
  END
FROM practice_dependencies pd
WHERE NOT EXISTS (
  SELECT 1 FROM practices p WHERE p.id = pd.depends_on_id
);

-- 9. COMPARE BEFORE/AFTER COUNTS
-- ----------------------------------------------------------------------------
-- Show the changes in record counts
WITH current_counts AS (
  SELECT
    (SELECT COUNT(*) FROM practices) as practice_count,
    (SELECT COUNT(*) FROM practice_dependencies) as dependency_count,
    (SELECT COUNT(*) FROM schema_migrations WHERE success = true) as migration_count
)
SELECT
  'Practices' as entity,
  practice_count as current_count,
  practice_count - 23 as change, -- Adjust baseline based on your initial count
  CASE
    WHEN practice_count > 23 THEN 'SUCCESS: New practices added'
    WHEN practice_count = 23 THEN 'WARNING: No new practices'
    ELSE 'ERROR: Practices missing!'
  END as status
FROM current_counts
UNION ALL
SELECT
  'Dependencies',
  dependency_count,
  dependency_count - 41, -- Adjust baseline based on your initial count
  CASE
    WHEN dependency_count > 41 THEN 'SUCCESS: New dependencies added'
    WHEN dependency_count = 41 THEN 'WARNING: No new dependencies'
    ELSE 'ERROR: Dependencies missing!'
  END
FROM current_counts
UNION ALL
SELECT
  'Migrations',
  migration_count,
  1, -- Expected to increase by 1
  CASE
    WHEN migration_count > 0 THEN 'SUCCESS: Migration tracked'
    ELSE 'ERROR: Migration not tracked!'
  END
FROM current_counts;

-- 10. COMPREHENSIVE VALIDATION SUMMARY
-- ----------------------------------------------------------------------------
-- Overall migration success assessment
WITH validation_results AS (
  SELECT
    -- Check new practices
    (SELECT COUNT(*) FROM practices
     WHERE id IN ('behavior-driven-development', 'deterministic-tests')) as new_practices,

    -- Check new dependencies
    (SELECT COUNT(*) FROM practice_dependencies pd
     WHERE (practice_id = 'trunk-based-development' AND depends_on_id = 'deterministic-tests')
        OR (practice_id = 'deterministic-tests' AND depends_on_id IN (
          'automated-testing', 'test-automation-framework',
          'test-data-management', 'behavior-driven-development'
        ))
        OR (practice_id = 'behavior-driven-development' AND depends_on_id = 'version-control')
    ) as new_dependencies,

    -- Check for cycles
    (SELECT COUNT(*) FROM would_create_cycle('continuous-delivery', 'continuous-delivery')) as has_cycles,

    -- Check migration tracking
    (SELECT COUNT(*) FROM schema_migrations
     WHERE migration_name = '003_add_deterministic_tests.sql'
       AND success = true) as migration_tracked
)
SELECT
  CASE
    WHEN new_practices < 2 THEN 'FAILED: Not all practices inserted'
    WHEN new_dependencies < 6 THEN 'FAILED: Not all dependencies created'
    WHEN has_cycles > 0 THEN 'FAILED: Circular dependencies detected'
    WHEN migration_tracked = 0 THEN 'WARNING: Migration not tracked'
    ELSE 'SUCCESS: Migration completed successfully'
  END as overall_status,
  new_practices || ' of 2' as practices_added,
  new_dependencies || ' of 6' as dependencies_added,
  CASE WHEN has_cycles > 0 THEN 'Yes' ELSE 'No' END as circular_deps,
  CASE WHEN migration_tracked > 0 THEN 'Yes' ELSE 'No' END as tracked
FROM validation_results;

-- 11. SHOW DEPENDENCY TREE FOR NEW PRACTICES
-- ----------------------------------------------------------------------------
-- Visualize the dependency structure of newly added practices
SELECT
  p1.name as practice,
  '→' as arrow,
  p2.name as depends_on
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE p1.id IN ('deterministic-tests', 'behavior-driven-development', 'trunk-based-development')
ORDER BY p1.name, p2.name;