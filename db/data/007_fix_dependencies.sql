-- ============================================================================
-- DATA MIGRATION: Fix Reversed Dependencies and Add Missing Dependencies
-- File: 007_fix_dependencies.sql
-- Date: 2025-10-20
-- Description: Fixes 2 reversed dependencies and adds 2 missing dependencies
--
-- Rationale:
-- 1. build-on-commit → automated-build (REVERSED, was backwards)
--    - Behavior (committing code to trigger build) depends on tooling (build system)
--    - Cannot have build-on-commit without first having automated-build
--
-- 2. pipeline-visibility → application-pipeline (REVERSED, was backwards)
--    - Cultural practice (visibility) depends on tooling (pipeline) existing first
--    - Cannot have visibility of something that doesn't exist yet
--
-- 3. application-pipeline → automated-artifact-versioning (MISSING)
--    - Pipeline needs versioned artifacts to track and promote builds
--    - Artifact versioning is a fundamental requirement for pipeline stages
--
-- 4. continuous-integration → component-ownership (MISSING)
--    - CI requires clear component ownership for accountability
--    - Teams need to know who owns what to integrate effectively
--
-- Changes:
-- - Remove: automated-build → build-on-commit (backwards)
-- - Add: build-on-commit → automated-build (correct)
-- - Remove: application-pipeline → pipeline-visibility (backwards)
-- - Add: pipeline-visibility → application-pipeline (correct)
-- - Add: application-pipeline → automated-artifact-versioning
-- - Add: continuous-integration → component-ownership
-- - Version bump: 1.3.1 → 1.4.0 (minor - new dependencies)
-- ============================================================================

BEGIN;

-- ============================================================================
-- FIX REVERSED DEPENDENCIES
-- ============================================================================

-- Fix #1: build-on-commit depends on automated-build (not vice versa)
DELETE FROM practice_dependencies
WHERE practice_id = 'automated-build' AND depends_on_id = 'build-on-commit';

INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('build-on-commit', 'automated-build')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Fix #2: pipeline-visibility depends on application-pipeline (not vice versa)
DELETE FROM practice_dependencies
WHERE practice_id = 'application-pipeline' AND depends_on_id = 'pipeline-visibility';

INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('pipeline-visibility', 'application-pipeline')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- ADD MISSING DEPENDENCIES
-- ============================================================================

-- Missing #1: application-pipeline requires automated-artifact-versioning
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('application-pipeline', 'automated-artifact-versioning')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Missing #2: continuous-integration requires component-ownership
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('continuous-integration', 'component-ownership')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- UPDATE METADATA
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.4.0"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text)),
  ('changelog', '"Fixed 2 reversed dependencies (build-on-commit, pipeline-visibility) and added 2 missing dependencies (artifact versioning, component ownership)"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
-- - Fixed 2 reversed dependencies
-- - Added 2 new dependencies
-- - Updated version from 1.3.1 to 1.4.0
-- - Total practices: 52 (unchanged)
-- - Total dependencies: ~117 (113 existing - 2 + 2 + 2 = 117)
--
-- Fixed Dependencies:
-- 1. build-on-commit → automated-build (was backwards)
--    You need an automated build system before you can have build-on-commit
--
-- 2. pipeline-visibility → application-pipeline (was backwards)
--    You need a pipeline to exist before you can make it visible
--
-- New Dependencies:
-- 3. application-pipeline → automated-artifact-versioning
--    Pipelines need versioned artifacts to track and promote
--
-- 4. continuous-integration → component-ownership
--    CI requires clear ownership for accountability
--
-- Verification queries:
-- -- Should return 1 row (correct direction)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'build-on-commit' AND depends_on_id = 'automated-build';
--
-- -- Should return 0 rows (removed backwards dependency)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'automated-build' AND depends_on_id = 'build-on-commit';
--
-- -- Should return 1 row (correct direction)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'pipeline-visibility' AND depends_on_id = 'application-pipeline';
--
-- -- Should return 0 rows (removed backwards dependency)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'application-pipeline' AND depends_on_id = 'pipeline-visibility';
--
-- -- Should return 1 row (new dependency)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'application-pipeline' AND depends_on_id = 'automated-artifact-versioning';
--
-- -- Should return 1 row (new dependency)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'continuous-integration' AND depends_on_id = 'component-ownership';
--
-- SELECT * FROM metadata WHERE key = 'version'; -- Should be 1.4.0
-- ============================================================================
