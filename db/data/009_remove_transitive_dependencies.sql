-- ============================================================================
-- DATA MIGRATION: Remove Redundant Transitive Dependencies
-- File: 009_remove_transitive_dependencies.sql
-- Date: 2025-10-20
-- Description: Removes direct dependencies that are already implied transitively
--
-- Rationale:
-- If practice A depends on B, and B depends on C, then A should not also
-- directly depend on C. The dependency is already implied through B.
--
-- Benefits:
-- - Cleaner dependency graph
-- - Easier to maintain and update dependencies
-- - Reduces visual complexity in the tree view
-- - Makes the graph more hierarchical and understandable
--
-- Example:
-- Before: continuous-integration → trunk-based-development → version-control
--         continuous-integration → version-control (redundant!)
-- After:  continuous-integration → trunk-based-development → version-control
--
-- Changes:
-- - Remove 28 redundant transitive dependencies
-- - Version bump: 1.4.1 → 1.5.0 (minor - significant refactoring)
-- ============================================================================

BEGIN;

-- ============================================================================
-- REMOVE REDUNDANT TRANSITIVE DEPENDENCIES
-- ============================================================================

-- Application Pipeline
DELETE FROM practice_dependencies WHERE practice_id = 'application-pipeline' AND depends_on_id = 'build-automation';
  -- Already implied via: automated-artifact-versioning, automated-testing

-- Automated Artifact Versioning
DELETE FROM practice_dependencies WHERE practice_id = 'automated-artifact-versioning' AND depends_on_id = 'version-control';
  -- Already implied via: build-automation

-- Automated Build
DELETE FROM practice_dependencies WHERE practice_id = 'automated-build' AND depends_on_id = 'version-control';
  -- Already implied via: build-automation

-- Automated Environment Provisioning
DELETE FROM practice_dependencies WHERE practice_id = 'automated-environment-provisioning' AND depends_on_id = 'version-control';
  -- Already implied via: infrastructure-automation

-- Build on Commit
DELETE FROM practice_dependencies WHERE practice_id = 'build-on-commit' AND depends_on_id = 'build-automation';
  -- Already implied via: automated-build
DELETE FROM practice_dependencies WHERE practice_id = 'build-on-commit' AND depends_on_id = 'version-control';
  -- Already implied via: automated-build, build-automation

-- Continuous Delivery
DELETE FROM practice_dependencies WHERE practice_id = 'continuous-delivery' AND depends_on_id = 'configuration-management';
  -- Already implied via: immutable-artifact
DELETE FROM practice_dependencies WHERE practice_id = 'continuous-delivery' AND depends_on_id = 'automated-artifact-versioning';
  -- Already implied via: application-pipeline
DELETE FROM practice_dependencies WHERE practice_id = 'continuous-delivery' AND depends_on_id = 'component-ownership';
  -- Already implied via: continuous-integration

-- Continuous Integration
DELETE FROM practice_dependencies WHERE practice_id = 'continuous-integration' AND depends_on_id = 'build-automation';
  -- Already implied via: automated-build, automated-testing
DELETE FROM practice_dependencies WHERE practice_id = 'continuous-integration' AND depends_on_id = 'version-control';
  -- Already implied via: automated-build, trunk-based-development, component-ownership

-- Continuous Testing
DELETE FROM practice_dependencies WHERE practice_id = 'continuous-testing' AND depends_on_id = 'automated-testing';
  -- Already implied via: functional-testing, integration-testing

-- Contract Testing
DELETE FROM practice_dependencies WHERE practice_id = 'contract-testing' AND depends_on_id = 'automated-testing';
  -- Already implied via: pre-commit-test-automation
DELETE FROM practice_dependencies WHERE practice_id = 'contract-testing' AND depends_on_id = 'test-automation-framework';
  -- Already implied via: automated-testing

-- Deterministic Tests
DELETE FROM practice_dependencies WHERE practice_id = 'deterministic-tests' AND depends_on_id = 'test-automation-framework';
  -- Already implied via: automated-testing
DELETE FROM practice_dependencies WHERE practice_id = 'deterministic-tests' AND depends_on_id = 'test-data-management';
  -- Already implied via: automated-testing

-- Developer Driven Support
DELETE FROM practice_dependencies WHERE practice_id = 'developer-driven-support' AND depends_on_id = 'logging-infrastructure';
  -- Already implied via: monitoring

-- Evolutionary Coding
DELETE FROM practice_dependencies WHERE practice_id = 'evolutionary-coding' AND depends_on_id = 'version-control';
  -- Already implied via: trunk-based-development

-- Functional Testing
DELETE FROM practice_dependencies WHERE practice_id = 'functional-testing' AND depends_on_id = 'automated-testing';
  -- Already implied via: pre-commit-test-automation

-- Integration Testing
DELETE FROM practice_dependencies WHERE practice_id = 'integration-testing' AND depends_on_id = 'test-data-management';
  -- Already implied via: automated-testing, test-environment

-- Modular System
DELETE FROM practice_dependencies WHERE practice_id = 'modular-system' AND depends_on_id = 'version-control';
  -- Already implied via: api-management

-- Monitoring and Alerting
DELETE FROM practice_dependencies WHERE practice_id = 'monitoring-and-alerting' AND depends_on_id = 'logging-infrastructure';
  -- Already implied via: monitoring

-- On-demand Rollback
DELETE FROM practice_dependencies WHERE practice_id = 'rollback-capability' AND depends_on_id = 'monitoring';
  -- Already implied via: deployment-automation

-- Pipeline Visibility
DELETE FROM practice_dependencies WHERE practice_id = 'pipeline-visibility' AND depends_on_id = 'build-automation';
  -- Already implied via: application-pipeline

-- Prioritized Features
DELETE FROM practice_dependencies WHERE practice_id = 'prioritized-features' AND depends_on_id = 'product-goals';
  -- Already implied via: unified-team-backlog

-- Static Analysis
DELETE FROM practice_dependencies WHERE practice_id = 'static-analysis' AND depends_on_id = 'version-control';
  -- Already implied via: build-automation, pre-commit-test-automation

-- Trunk-based Development
DELETE FROM practice_dependencies WHERE practice_id = 'trunk-based-development' AND depends_on_id = 'version-control';
  -- Already implied via: pre-commit-test-automation

-- Versioned Database
DELETE FROM practice_dependencies WHERE practice_id = 'versioned-database' AND depends_on_id = 'version-control';
  -- Already implied via: database-migration-strategy

-- ============================================================================
-- UPDATE METADATA
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.5.0"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text)),
  ('changelog', '"Removed 28 redundant transitive dependencies to simplify the dependency graph"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
-- - Removed 28 redundant transitive dependencies
-- - Updated version from 1.4.1 to 1.5.0
-- - Total practices: 51 (unchanged)
-- - Total dependencies: 117 → 89 (24% reduction!)
--
-- Principle Applied:
-- If A → B → C exists, then remove A → C
-- The dependency is already implied through B
--
-- Benefits:
-- ✅ Cleaner, more maintainable dependency graph
-- ✅ Easier to understand hierarchical relationships
-- ✅ Simpler visual representation in tree view
-- ✅ Easier to update dependencies (only one place to change)
--
-- Examples of removed redundancies:
-- 1. continuous-integration → version-control
--    (already via trunk-based-development, automated-build)
--
-- 2. continuous-delivery → configuration-management
--    (already via immutable-artifact)
--
-- 3. application-pipeline → build-automation
--    (already via automated-artifact-versioning, automated-testing)
--
-- Verification queries:
-- -- Count remaining dependencies
-- SELECT COUNT(*) FROM practice_dependencies; -- Should be 89
--
-- -- Verify no redundant transitive dependencies remain
-- WITH RECURSIVE transitive_deps AS (
--   SELECT practice_id, depends_on_id, 1 as depth,
--          ARRAY[practice_id::text, depends_on_id::text] as path
--   FROM practice_dependencies
--   UNION
--   SELECT td.practice_id, pd.depends_on_id, td.depth + 1,
--          td.path || pd.depends_on_id::text
--   FROM transitive_deps td
--   JOIN practice_dependencies pd ON td.depends_on_id = pd.practice_id
--   WHERE td.depth < 10
--     AND NOT pd.depends_on_id::text = ANY(td.path)
-- )
-- SELECT COUNT(*) as redundant_count
-- FROM transitive_deps td
-- WHERE td.depth = 2
--   AND EXISTS (
--     SELECT 1 FROM practice_dependencies pd
--     WHERE pd.practice_id = td.practice_id
--       AND pd.depends_on_id = td.depends_on_id
--   );
-- -- Should return 0
--
-- SELECT * FROM metadata WHERE key = 'version'; -- Should be 1.5.0
-- ============================================================================
