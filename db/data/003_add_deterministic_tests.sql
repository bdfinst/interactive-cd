-- ============================================================================
-- DATA MIGRATION: Add Deterministic Tests and BDD Practices
-- File: 003_add_deterministic_tests.sql
-- Date: 2025-10-18
-- Description: Adds the critical dependency chain:
--              Trunk-based Development → Deterministic Tests → BDD
-- ============================================================================

BEGIN;

-- ============================================================================
-- NEW PRACTICES
-- ============================================================================

-- Add Behavior-Driven Development (BDD) practice
INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  (
    'behavior-driven-development',
    'Behavior-Driven Development (BDD)',
    'practice',
    'behavior',
    'Define software behavior using structured, human-readable scenarios (Gherkin) that serve as executable specifications and living documentation.',
    '[
      "Write features using Gherkin syntax (Given/When/Then)",
      "Scenarios focus on user behavior, not implementation",
      "Use specific, testable acceptance criteria",
      "Include explicit data values in scenarios",
      "Scenarios are declarative (what, not how)",
      "Features reviewed with stakeholders",
      "Scenarios converted to automated tests",
      "Features serve as living documentation"
    ]'::jsonb,
    '[
      "Shared understanding between technical and business teams",
      "Testable acceptance criteria",
      "Living documentation stays current",
      "Reduces ambiguity in requirements",
      "Foundation for deterministic tests",
      "Enables collaboration",
      "Clear definition of done"
    ]'::jsonb
  ),

-- Add Deterministic Tests practice
  (
    'deterministic-tests',
    'Deterministic Tests',
    'practice',
    'behavior',
    'Tests that produce the same result every time they run, eliminating flakiness and enabling reliable trunk-based development.',
    '[
      "Same input produces same output every time",
      "Control all inputs (time, randomness, external services)",
      "Isolate test execution (no shared state)",
      "Mock external dependencies (APIs, databases)",
      "Use test data builders for predictable data",
      "Clean up test data after each test",
      "Await all async operations properly",
      "Tests can run in parallel",
      "Tests pass 100% of the time",
      "Fix flaky tests immediately"
    ]'::jsonb,
    '[
      "Enables trunk-based development",
      "Builds trust in test suite",
      "Eliminates wasted time on false failures",
      "Reliable CI/CD pipelines",
      "Supports frequent integration",
      "Fast, confident merging to trunk",
      "Reduces investigation time",
      "Enables parallel test execution"
    ]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits;

-- ============================================================================
-- NEW DEPENDENCIES
-- ============================================================================

-- Critical dependency chain:
-- trunk-based-development → deterministic-tests → (automated-testing + test-automation-framework + behavior-driven-development)

-- Trunk-based Development depends on Deterministic Tests
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('trunk-based-development', 'deterministic-tests')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Deterministic Tests depend on Automated Testing infrastructure
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('deterministic-tests', 'automated-testing'),
  ('deterministic-tests', 'test-automation-framework'),
  ('deterministic-tests', 'test-data-management')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Deterministic Tests depend on BDD for testable acceptance criteria
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('deterministic-tests', 'behavior-driven-development')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- BDD depends on Version Control (feature files are versioned)
INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('behavior-driven-development', 'version-control')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- Update metadata
INSERT INTO metadata (key, value) VALUES
  ('lastUpdated', '"2025-10-18"'),
  ('version', '"1.1.0"'),
  ('changelog', '"Added Deterministic Tests and BDD practices with dependency chain"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Added Practices: 2 (behavior-driven-development, deterministic-tests)
-- Added Dependencies: 6
--   - trunk-based-development → deterministic-tests
--   - deterministic-tests → automated-testing
--   - deterministic-tests → test-automation-framework
--   - deterministic-tests → test-data-management
--   - deterministic-tests → behavior-driven-development
--   - behavior-driven-development → version-control
-- ============================================================================

-- Verification queries:
-- SELECT id, name, category FROM practices WHERE id IN ('behavior-driven-development', 'deterministic-tests');
-- SELECT p1.name as practice, p2.name as depends_on FROM practice_dependencies pd JOIN practices p1 ON pd.practice_id = p1.id JOIN practices p2 ON pd.depends_on_id = p2.id WHERE p1.id = 'deterministic-tests';
-- SELECT * FROM get_practice_tree('trunk-based-development');
