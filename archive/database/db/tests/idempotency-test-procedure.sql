-- ============================================================================
-- IDEMPOTENCY TEST PROCEDURE
-- Purpose: Ensure migrations can be safely run multiple times
-- Usage: Run migration twice and verify no data corruption or duplication
-- ============================================================================

-- STEP 1: CAPTURE INITIAL STATE BEFORE FIRST MIGRATION
-- ----------------------------------------------------------------------------
-- Run this before the first migration application
CREATE TEMP TABLE IF NOT EXISTS migration_test_snapshot (
  snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_type TEXT,
  practice_count INTEGER,
  dependency_count INTEGER,
  metadata_version TEXT,
  practice_ids TEXT[],
  dependency_pairs TEXT[]
);

-- Capture current state
INSERT INTO migration_test_snapshot (
  snapshot_type,
  practice_count,
  dependency_count,
  metadata_version,
  practice_ids,
  dependency_pairs
)
SELECT
  'before_first_migration',
  (SELECT COUNT(*) FROM practices),
  (SELECT COUNT(*) FROM practice_dependencies),
  (SELECT value::text FROM metadata WHERE key = 'version'),
  (SELECT array_agg(id ORDER BY id) FROM practices),
  (SELECT array_agg(practice_id || '->' || depends_on_id ORDER BY practice_id, depends_on_id)
   FROM practice_dependencies);

-- STEP 2: APPLY MIGRATION FIRST TIME
-- ----------------------------------------------------------------------------
-- Execute your migration file here
-- Example: \i db/data/003_add_deterministic_tests.sql

-- STEP 3: CAPTURE STATE AFTER FIRST MIGRATION
-- ----------------------------------------------------------------------------
INSERT INTO migration_test_snapshot (
  snapshot_type,
  practice_count,
  dependency_count,
  metadata_version,
  practice_ids,
  dependency_pairs
)
SELECT
  'after_first_migration',
  (SELECT COUNT(*) FROM practices),
  (SELECT COUNT(*) FROM practice_dependencies),
  (SELECT value::text FROM metadata WHERE key = 'version'),
  (SELECT array_agg(id ORDER BY id) FROM practices),
  (SELECT array_agg(practice_id || '->' || depends_on_id ORDER BY practice_id, depends_on_id)
   FROM practice_dependencies);

-- STEP 4: APPLY MIGRATION SECOND TIME (IDEMPOTENCY TEST)
-- ----------------------------------------------------------------------------
-- Execute the same migration file again
-- Example: \i db/data/003_add_deterministic_tests.sql

-- STEP 5: CAPTURE STATE AFTER SECOND MIGRATION
-- ----------------------------------------------------------------------------
INSERT INTO migration_test_snapshot (
  snapshot_type,
  practice_count,
  dependency_count,
  metadata_version,
  practice_ids,
  dependency_pairs
)
SELECT
  'after_second_migration',
  (SELECT COUNT(*) FROM practices),
  (SELECT COUNT(*) FROM practice_dependencies),
  (SELECT value::text FROM metadata WHERE key = 'version'),
  (SELECT array_agg(id ORDER BY id) FROM practices),
  (SELECT array_agg(practice_id || '->' || depends_on_id ORDER BY practice_id, depends_on_id)
   FROM practice_dependencies);

-- STEP 6: IDEMPOTENCY VALIDATION
-- ----------------------------------------------------------------------------
-- Compare states to ensure idempotency
WITH comparison AS (
  SELECT
    s1.practice_count as first_run_practices,
    s2.practice_count as second_run_practices,
    s1.dependency_count as first_run_dependencies,
    s2.dependency_count as second_run_dependencies,
    s1.metadata_version as first_run_version,
    s2.metadata_version as second_run_version,
    array_length(s1.practice_ids, 1) as first_run_practice_array_size,
    array_length(s2.practice_ids, 1) as second_run_practice_array_size,
    s1.practice_ids = s2.practice_ids as practice_ids_match,
    s1.dependency_pairs = s2.dependency_pairs as dependency_pairs_match
  FROM migration_test_snapshot s1
  CROSS JOIN migration_test_snapshot s2
  WHERE s1.snapshot_type = 'after_first_migration'
    AND s2.snapshot_type = 'after_second_migration'
)
SELECT
  'IDEMPOTENCY TEST RESULTS' as test_name,
  CASE
    WHEN first_run_practices = second_run_practices
     AND first_run_dependencies = second_run_dependencies
     AND practice_ids_match
     AND dependency_pairs_match
    THEN 'PASS: Migration is idempotent'
    ELSE 'FAIL: Migration is NOT idempotent - data changed on second run!'
  END as overall_result,
  CASE WHEN first_run_practices != second_run_practices
    THEN 'Practice count changed: ' || first_run_practices || ' → ' || second_run_practices
    ELSE 'Practice count stable: ' || first_run_practices
  END as practice_check,
  CASE WHEN first_run_dependencies != second_run_dependencies
    THEN 'Dependency count changed: ' || first_run_dependencies || ' → ' || second_run_dependencies
    ELSE 'Dependency count stable: ' || first_run_dependencies
  END as dependency_check,
  CASE WHEN NOT practice_ids_match
    THEN 'Practice IDs changed!'
    ELSE 'Practice IDs unchanged'
  END as id_check,
  CASE WHEN NOT dependency_pairs_match
    THEN 'Dependency pairs changed!'
    ELSE 'Dependency pairs unchanged'
  END as relationship_check
FROM comparison;

-- STEP 7: DETAILED IDEMPOTENCY CHECKS
-- ----------------------------------------------------------------------------

-- 7A: Check for duplicate practices (should use ON CONFLICT)
WITH duplicate_check AS (
  SELECT
    id,
    COUNT(*) as occurrence_count
  FROM practices
  GROUP BY id
  HAVING COUNT(*) > 1
)
SELECT
  'Duplicate Practices Check' as check_name,
  COUNT(*) as duplicate_count,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS: No duplicate practices'
    ELSE 'FAIL: Found ' || COUNT(*) || ' duplicate practices!'
  END as result,
  array_agg(id) as duplicate_ids
FROM duplicate_check;

-- 7B: Check for duplicate dependencies (should use ON CONFLICT)
WITH duplicate_deps AS (
  SELECT
    practice_id,
    depends_on_id,
    COUNT(*) as occurrence_count
  FROM practice_dependencies
  GROUP BY practice_id, depends_on_id
  HAVING COUNT(*) > 1
)
SELECT
  'Duplicate Dependencies Check' as check_name,
  COUNT(*) as duplicate_count,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS: No duplicate dependencies'
    ELSE 'FAIL: Found ' || COUNT(*) || ' duplicate dependencies!'
  END as result,
  array_agg(practice_id || '->' || depends_on_id) as duplicate_pairs
FROM duplicate_deps;

-- 7C: Check metadata handling (should not duplicate or corrupt)
SELECT
  'Metadata Idempotency Check' as check_name,
  key,
  COUNT(*) as value_count,
  CASE
    WHEN COUNT(*) = 1 THEN 'PASS: Single value'
    ELSE 'FAIL: Multiple values for key!'
  END as result
FROM metadata
WHERE key IN ('version', 'lastUpdated', 'changelog')
GROUP BY key;

-- STEP 8: CHECK MIGRATION TRACKING IDEMPOTENCY
-- ----------------------------------------------------------------------------
-- Verify that migration tracking system handles repeated runs correctly
WITH migration_runs AS (
  SELECT
    migration_name,
    COUNT(*) as run_count,
    array_agg(applied_at ORDER BY applied_at) as run_times,
    array_agg(success) as success_flags
  FROM schema_migrations
  WHERE migration_name LIKE '%003%' OR migration_name LIKE '%deterministic%'
  GROUP BY migration_name
)
SELECT
  'Migration Tracking Idempotency' as check_name,
  migration_name,
  run_count,
  CASE
    WHEN run_count = 1 THEN 'PASS: Single record (using ON CONFLICT)'
    WHEN run_count = 2 AND success_flags[2] = true THEN 'OK: Two successful runs recorded'
    WHEN run_count > 2 THEN 'WARNING: Multiple runs recorded'
    ELSE 'INFO: Check migration tracking logic'
  END as result
FROM migration_runs;

-- STEP 9: PERFORMANCE COMPARISON
-- ----------------------------------------------------------------------------
-- Compare execution times between first and second run
WITH execution_times AS (
  SELECT
    migration_name,
    ROW_NUMBER() OVER (PARTITION BY migration_name ORDER BY applied_at) as run_number,
    applied_at,
    LAG(applied_at) OVER (PARTITION BY migration_name ORDER BY applied_at) as previous_run
  FROM schema_migrations
  WHERE success = true
    AND migration_name LIKE '%003%'
)
SELECT
  'Performance Comparison' as analysis,
  migration_name,
  run_number,
  CASE
    WHEN run_number = 2 THEN
      'Second run should be faster (ON CONFLICT): ' ||
      EXTRACT(EPOCH FROM (applied_at - previous_run)) || ' seconds between runs'
    ELSE 'First run baseline'
  END as performance_note
FROM execution_times
WHERE run_number <= 2;

-- STEP 10: COMPREHENSIVE IDEMPOTENCY REPORT
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  first_snapshot RECORD;
  second_snapshot RECORD;
  is_idempotent BOOLEAN := true;
  failure_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get snapshots
  SELECT * INTO first_snapshot
  FROM migration_test_snapshot
  WHERE snapshot_type = 'after_first_migration';

  SELECT * INTO second_snapshot
  FROM migration_test_snapshot
  WHERE snapshot_type = 'after_second_migration';

  -- Check each aspect
  IF first_snapshot.practice_count != second_snapshot.practice_count THEN
    is_idempotent := false;
    failure_reasons := array_append(failure_reasons,
      'Practice count changed: ' || first_snapshot.practice_count ||
      ' -> ' || second_snapshot.practice_count);
  END IF;

  IF first_snapshot.dependency_count != second_snapshot.dependency_count THEN
    is_idempotent := false;
    failure_reasons := array_append(failure_reasons,
      'Dependency count changed: ' || first_snapshot.dependency_count ||
      ' -> ' || second_snapshot.dependency_count);
  END IF;

  IF first_snapshot.metadata_version != second_snapshot.metadata_version THEN
    is_idempotent := false;
    failure_reasons := array_append(failure_reasons,
      'Metadata version changed unexpectedly');
  END IF;

  -- Report results
  RAISE NOTICE '========================================';
  RAISE NOTICE 'IDEMPOTENCY TEST FINAL REPORT';
  RAISE NOTICE '========================================';

  IF is_idempotent THEN
    RAISE NOTICE 'RESULT: PASS ✓';
    RAISE NOTICE 'The migration is fully idempotent.';
    RAISE NOTICE 'It can be safely run multiple times without side effects.';
  ELSE
    RAISE NOTICE 'RESULT: FAIL ✗';
    RAISE NOTICE 'The migration is NOT idempotent!';
    RAISE NOTICE 'Failures:';
    FOR i IN 1..array_length(failure_reasons, 1) LOOP
      RAISE NOTICE '  - %', failure_reasons[i];
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE 'RECOMMENDATION: Add proper ON CONFLICT clauses to your migration.';
  END IF;

  RAISE NOTICE '========================================';
END $$;

-- CLEANUP: Drop temporary table after testing
-- DROP TABLE IF EXISTS migration_test_snapshot;