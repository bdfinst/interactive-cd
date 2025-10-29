-- ============================================================================
-- DATA MIGRATION: Add Unified Team Backlog Dependency on Product Goals
-- File: 006_add_backlog_product_goals_dependency.sql
-- Date: 2025-10-20
-- Description: Adds dependency from unified-team-backlog to product-goals
--
-- Rationale:
-- - A unified team backlog needs product goals to determine what work belongs in the backlog
-- - Without clear goals, teams don't know what features/stories/tasks to include
-- - Product goals provide the filter for what's in scope vs. out of scope
-- - This dependency was missing from the initial setup
--
-- Changes:
-- - Add dependency: unified-team-backlog → product-goals
-- - Version bump: 1.3.0 → 1.3.1 (patch - dependency fix)
-- ============================================================================

BEGIN;

-- ============================================================================
-- ADD DEPENDENCY
-- ============================================================================

INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('unified-team-backlog', 'product-goals')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- UPDATE METADATA
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.3.1"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text)),
  ('changelog', '"Added dependency: unified-team-backlog requires product-goals to determine backlog scope"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
-- - Added 1 new dependency: unified-team-backlog → product-goals
-- - Updated version from 1.3.0 to 1.3.1
-- - Total practices: 52 (unchanged)
-- - Total dependencies: ~115 (114 existing + 1 new)
--
-- Dependency Chain Now:
-- product-goals
--   ├── prioritized-features
--   └── unified-team-backlog (NEW)
--
-- This creates a logical flow:
-- 1. Product Goals - Define what we're trying to achieve
-- 2. Unified Team Backlog - Contains work aligned with goals
-- 3. Prioritized Features - Orders backlog by business value
--
-- Verification queries:
-- SELECT * FROM practice_dependencies
-- WHERE practice_id = 'unified-team-backlog'
--   AND depends_on_id = 'product-goals';
--
-- SELECT * FROM metadata WHERE key = 'version'; -- Should be 1.3.1
-- ============================================================================
