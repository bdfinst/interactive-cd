-- ============================================================================
-- DATA MIGRATION: Remove Self-Healing Services Practice
-- File: 008_remove_self_healing_services.sql
-- Date: 2025-10-20
-- Description: Removes the self-healing-services practice and its dependencies
--
-- Rationale:
-- - Self-healing services is not a core CD practice
-- - It's an advanced operational pattern that's not a prerequisite for CD
-- - Removing to simplify the dependency graph and focus on essential practices
--
-- Impact:
-- - Removes dependency: continuous-delivery → self-healing-services
-- - Removes dependency: self-healing-services → developer-driven-support
-- - Removes dependency: self-healing-services → monitoring-and-alerting
-- - Removes dependency: self-healing-services → infrastructure-automation
-- - Removes the self-healing-services practice itself
--
-- Changes:
-- - Remove all dependencies involving self-healing-services
-- - Remove self-healing-services practice
-- - Version bump: 1.4.0 → 1.4.1 (patch - practice removal)
-- ============================================================================

BEGIN;

-- ============================================================================
-- REMOVE DEPENDENCIES
-- ============================================================================

-- Remove all dependencies where self-healing-services is the practice_id
DELETE FROM practice_dependencies
WHERE practice_id = 'self-healing-services';

-- Remove all dependencies where self-healing-services is the depends_on_id
DELETE FROM practice_dependencies
WHERE depends_on_id = 'self-healing-services';

-- ============================================================================
-- REMOVE PRACTICE
-- ============================================================================

DELETE FROM practices
WHERE id = 'self-healing-services';

-- ============================================================================
-- UPDATE METADATA
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.4.1"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text)),
  ('changelog', '"Removed self-healing-services practice as it is not a core CD prerequisite"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
-- - Removed 4 dependencies involving self-healing-services
-- - Removed 1 practice (self-healing-services)
-- - Updated version from 1.4.0 to 1.4.1
-- - Total practices: 51 (was 52)
-- - Total dependencies: ~113 (was ~117)
--
-- Removed Dependencies:
-- 1. continuous-delivery → self-healing-services
-- 2. self-healing-services → developer-driven-support
-- 3. self-healing-services → monitoring-and-alerting
-- 4. self-healing-services → infrastructure-automation
--
-- Removed Practice:
-- - self-healing-services (practice category)
--
-- Verification queries:
-- -- Should return 0 rows (practice removed)
-- SELECT * FROM practices WHERE id = 'self-healing-services';
--
-- -- Should return 0 rows (all dependencies removed)
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'self-healing-services'
--    OR depends_on_id = 'self-healing-services';
--
-- SELECT * FROM metadata WHERE key = 'version'; -- Should be 1.4.1
-- ============================================================================
