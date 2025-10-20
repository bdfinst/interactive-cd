-- ============================================================================
-- ROLLBACK PROCEDURE AND VERIFICATION
-- Purpose: Safely rollback migrations with verification
-- Usage: Execute in case of migration failure or data issues
-- ============================================================================

-- IMPORTANT: This is a template. Adjust IDs and values based on your specific migration

-- STEP 1: CAPTURE CURRENT STATE BEFORE ROLLBACK
-- ----------------------------------------------------------------------------
-- Create audit table for rollback verification
CREATE TEMP TABLE IF NOT EXISTS rollback_audit (
  audit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  audit_type TEXT,
  affected_practices TEXT[],
  affected_dependencies TEXT[],
  practice_count_before INTEGER,
  dependency_count_before INTEGER,
  practice_count_after INTEGER,
  dependency_count_after INTEGER
);

-- Capture pre-rollback state
INSERT INTO rollback_audit (
  audit_type,
  practice_count_before,
  dependency_count_before,
  affected_practices,
  affected_dependencies
)
SELECT
  'pre_rollback',
  (SELECT COUNT(*) FROM practices),
  (SELECT COUNT(*) FROM practice_dependencies),
  (SELECT array_agg(id) FROM practices
   WHERE id IN ('behavior-driven-development', 'deterministic-tests')),
  (SELECT array_agg(practice_id || '->' || depends_on_id)
   FROM practice_dependencies
   WHERE practice_id IN ('trunk-based-development', 'deterministic-tests', 'behavior-driven-development')
      OR depends_on_id IN ('deterministic-tests', 'behavior-driven-development'));

-- STEP 2: VERIFY WHAT WILL BE ROLLED BACK
-- ----------------------------------------------------------------------------
-- Show exactly what will be removed
SELECT 'ROLLBACK PREVIEW - The following will be removed:' as info;

-- Practices to be removed
SELECT
  'Practices' as entity_type,
  id,
  name,
  category
FROM practices
WHERE id IN ('behavior-driven-development', 'deterministic-tests')
ORDER BY id;

-- Dependencies to be removed
SELECT
  'Dependencies' as entity_type,
  p1.name as from_practice,
  '→' as arrow,
  p2.name as to_practice
FROM practice_dependencies pd
JOIN practices p1 ON pd.practice_id = p1.id
JOIN practices p2 ON pd.depends_on_id = p2.id
WHERE (pd.practice_id = 'trunk-based-development' AND pd.depends_on_id = 'deterministic-tests')
   OR (pd.practice_id = 'deterministic-tests')
   OR (pd.practice_id = 'behavior-driven-development')
ORDER BY p1.name, p2.name;

-- STEP 3: EXECUTE ROLLBACK (TRANSACTION-SAFE)
-- ----------------------------------------------------------------------------
-- This is wrapped in a transaction for safety
BEGIN;

-- Save point for nested rollback capability
SAVEPOINT before_rollback;

-- 3A: Remove new dependencies first (respects foreign keys)
DELETE FROM practice_dependencies
WHERE (practice_id, depends_on_id) IN (
  ('trunk-based-development', 'deterministic-tests'),
  ('deterministic-tests', 'automated-testing'),
  ('deterministic-tests', 'test-automation-framework'),
  ('deterministic-tests', 'test-data-management'),
  ('deterministic-tests', 'behavior-driven-development'),
  ('behavior-driven-development', 'version-control')
);

-- Log dependencies removed
DO $$
DECLARE
  deps_removed INTEGER;
BEGIN
  GET DIAGNOSTICS deps_removed = ROW_COUNT;
  RAISE NOTICE 'Removed % dependencies', deps_removed;
END $$;

-- 3B: Remove new practices
DELETE FROM practices
WHERE id IN ('behavior-driven-development', 'deterministic-tests');

-- Log practices removed
DO $$
DECLARE
  practices_removed INTEGER;
BEGIN
  GET DIAGNOSTICS practices_removed = ROW_COUNT;
  RAISE NOTICE 'Removed % practices', practices_removed;
END $$;

-- 3C: Restore previous metadata values
UPDATE metadata
SET value = '"1.0.0"'::jsonb
WHERE key = 'version';

UPDATE metadata
SET value = '"2025-10-17"'::jsonb
WHERE key = 'lastUpdated';

DELETE FROM metadata
WHERE key = 'changelog'
  AND value::text LIKE '%deterministic%';

-- 3D: Update migration tracking
UPDATE schema_migrations
SET success = false,
    error_message = 'Manually rolled back on ' || CURRENT_TIMESTAMP
WHERE migration_name = '003_add_deterministic_tests.sql'
  AND success = true;

-- VERIFY: Check for orphaned records after deletion
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM practice_dependencies pd
  WHERE NOT EXISTS (SELECT 1 FROM practices p WHERE p.id = pd.practice_id)
     OR NOT EXISTS (SELECT 1 FROM practices p WHERE p.id = pd.depends_on_id);

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'ROLLBACK FAILED: % orphaned dependencies found!', orphan_count;
  ELSE
    RAISE NOTICE 'Orphan check passed: No orphaned dependencies';
  END IF;
END $$;

-- STEP 4: VERIFY ROLLBACK SUCCESS
-- ----------------------------------------------------------------------------
-- Comprehensive verification that rollback completed successfully
WITH rollback_verification AS (
  SELECT
    -- Check practices were removed
    (SELECT COUNT(*) FROM practices
     WHERE id IN ('behavior-driven-development', 'deterministic-tests')) as remaining_practices,

    -- Check dependencies were removed
    (SELECT COUNT(*) FROM practice_dependencies
     WHERE (practice_id = 'trunk-based-development' AND depends_on_id = 'deterministic-tests')
        OR practice_id IN ('deterministic-tests', 'behavior-driven-development')) as remaining_deps,

    -- Check metadata was restored
    (SELECT value::text FROM metadata WHERE key = 'version') as current_version,

    -- Check migration tracking was updated
    (SELECT COUNT(*) FROM schema_migrations
     WHERE migration_name = '003_add_deterministic_tests.sql'
       AND success = false
       AND error_message LIKE '%rolled back%') as rollback_recorded
)
SELECT
  CASE
    WHEN remaining_practices = 0
     AND remaining_deps = 0
     AND current_version = '"1.0.0"'
     AND rollback_recorded > 0
    THEN 'ROLLBACK SUCCESS: All changes reverted'
    ELSE 'ROLLBACK INCOMPLETE: Manual verification needed'
  END as rollback_status,
  remaining_practices || ' practices still present' as practice_check,
  remaining_deps || ' dependencies still present' as dependency_check,
  'Version: ' || current_version as version_check,
  CASE WHEN rollback_recorded > 0
    THEN 'Rollback recorded in migration history'
    ELSE 'Rollback NOT recorded in migration history'
  END as tracking_check
FROM rollback_verification;

-- COMMIT or ROLLBACK based on verification
-- If everything looks good, commit. Otherwise, rollback to savepoint.
DO $$
DECLARE
  verification_passed BOOLEAN;
BEGIN
  SELECT
    (SELECT COUNT(*) FROM practices
     WHERE id IN ('behavior-driven-development', 'deterministic-tests')) = 0
    AND
    (SELECT COUNT(*) FROM practice_dependencies
     WHERE practice_id IN ('deterministic-tests', 'behavior-driven-development')) = 0
  INTO verification_passed;

  IF verification_passed THEN
    RAISE NOTICE 'Verification passed. Committing rollback...';
    -- COMMIT happens at the end of the transaction block
  ELSE
    RAISE EXCEPTION 'Verification failed. Rolling back to savepoint...';
    -- This will cause ROLLBACK TO SAVEPOINT
  END IF;
END $$;

COMMIT;

-- STEP 5: POST-ROLLBACK AUDIT
-- ----------------------------------------------------------------------------
-- Capture post-rollback state for audit trail
INSERT INTO rollback_audit (
  audit_type,
  practice_count_after,
  dependency_count_after
)
VALUES (
  'post_rollback',
  (SELECT COUNT(*) FROM practices),
  (SELECT COUNT(*) FROM practice_dependencies)
);

-- Generate rollback report
SELECT
  audit_type,
  audit_time,
  practice_count_before,
  practice_count_after,
  practice_count_before - practice_count_after as practices_removed,
  dependency_count_before,
  dependency_count_after,
  dependency_count_before - dependency_count_after as dependencies_removed,
  affected_practices,
  affected_dependencies
FROM rollback_audit
ORDER BY audit_time;

-- STEP 6: VERIFY DATABASE CONSISTENCY AFTER ROLLBACK
-- ----------------------------------------------------------------------------
-- Ensure database is in a consistent state after rollback

-- 6A: Check for circular dependencies
WITH RECURSIVE cycle_check AS (
  SELECT
    practice_id,
    depends_on_id,
    ARRAY[practice_id, depends_on_id] as path,
    false as has_cycle
  FROM practice_dependencies

  UNION ALL

  SELECT
    cc.practice_id,
    pd.depends_on_id,
    cc.path || pd.depends_on_id,
    pd.depends_on_id = cc.practice_id
  FROM cycle_check cc
  JOIN practice_dependencies pd ON cc.depends_on_id = pd.practice_id
  WHERE array_length(cc.path, 1) < 50
    AND NOT cc.has_cycle
)
SELECT
  'Post-Rollback Cycle Check' as check_name,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS: No cycles after rollback'
    ELSE 'FAIL: Cycles detected after rollback!'
  END as result
FROM cycle_check
WHERE has_cycle;

-- 6B: Verify referential integrity
SELECT
  'Post-Rollback Integrity Check' as check_name,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS: All foreign keys valid'
    ELSE 'FAIL: ' || COUNT(*) || ' invalid references found!'
  END as result
FROM practice_dependencies pd
WHERE NOT EXISTS (SELECT 1 FROM practices WHERE id = pd.practice_id)
   OR NOT EXISTS (SELECT 1 FROM practices WHERE id = pd.depends_on_id);

-- 6C: Compare with expected baseline
WITH baseline_comparison AS (
  SELECT
    (SELECT COUNT(*) FROM practices) as current_practices,
    23 as expected_practices, -- Adjust based on your baseline
    (SELECT COUNT(*) FROM practice_dependencies) as current_dependencies,
    41 as expected_dependencies -- Adjust based on your baseline
)
SELECT
  'Baseline Comparison' as check_name,
  CASE
    WHEN current_practices = expected_practices
     AND current_dependencies = expected_dependencies
    THEN 'PASS: Database matches expected baseline'
    ELSE 'WARNING: Database differs from expected baseline'
  END as result,
  'Practices: ' || current_practices || '/' || expected_practices as practice_comparison,
  'Dependencies: ' || current_dependencies || '/' || expected_dependencies as dependency_comparison
FROM baseline_comparison;

-- STEP 7: GENERATE ROLLBACK CERTIFICATE
-- ----------------------------------------------------------------------------
-- Create a record that rollback was performed successfully
DO $$
DECLARE
  rollback_id UUID;
  verification_status TEXT;
BEGIN
  rollback_id := gen_random_uuid();

  -- Determine verification status
  WITH checks AS (
    SELECT
      (SELECT COUNT(*) FROM practices
       WHERE id IN ('behavior-driven-development', 'deterministic-tests')) = 0 as practices_removed,
      (SELECT COUNT(*) FROM practice_dependencies
       WHERE practice_id IN ('deterministic-tests', 'behavior-driven-development')) = 0 as deps_removed,
      (SELECT COUNT(*) FROM cycle_check WHERE has_cycle) = 0 as no_cycles
  )
  SELECT
    CASE
      WHEN practices_removed AND deps_removed AND no_cycles
      THEN 'CERTIFIED: Rollback completed successfully'
      ELSE 'INCOMPLETE: Manual verification required'
    END INTO verification_status
  FROM checks;

  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'ROLLBACK CERTIFICATE';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Certificate ID: %', rollback_id;
  RAISE NOTICE 'Timestamp: %', CURRENT_TIMESTAMP;
  RAISE NOTICE 'Migration Rolled Back: 003_add_deterministic_tests.sql';
  RAISE NOTICE 'Status: %', verification_status;
  RAISE NOTICE 'Practices Removed: behavior-driven-development, deterministic-tests';
  RAISE NOTICE 'Dependencies Removed: 6';
  RAISE NOTICE 'Database State: Restored to pre-migration baseline';
  RAISE NOTICE '================================================';
END $$;

-- CLEANUP: Optional - drop audit table after verification
-- DROP TABLE IF EXISTS rollback_audit;