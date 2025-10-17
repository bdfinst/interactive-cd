-- ============================================================================
-- Data Migration: 002_example_new_practice
-- Description: Example of adding a new practice in a future deployment
-- Date: 2025-10-17
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Copy this file to create a new numbered migration (e.g., 003_*.sql)
-- 2. Update the practice data below
-- 3. Run during deployment: psql $DATABASE_URL -f db/data/003_*.sql
-- 4. Commit to git and deploy
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- ADD NEW PRACTICE
-- ============================================================================

INSERT INTO practices (id, name, type, category, description, requirements, benefits)
VALUES (
  'example-practice',                    -- Unique ID (kebab-case)
  'Example Practice',                    -- Display name
  'practice',                            -- Type: 'root' or 'practice'
  'tooling',                             -- Category: practice, tooling, behavior, culture
  'This is an example practice showing how to add new data in future deployments.',
  '[
    "First requirement for this practice",
    "Second requirement for this practice",
    "Third requirement for this practice"
  ]'::jsonb,
  '[
    "First benefit of implementing this practice",
    "Second benefit of implementing this practice",
    "Third benefit of implementing this practice"
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
-- ADD DEPENDENCIES
-- ============================================================================

-- Link this practice to its dependencies
INSERT INTO practice_dependencies (practice_id, depends_on_id)
VALUES
  ('example-practice', 'version-control'),
  ('example-practice', 'build-automation')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- LINK OTHER PRACTICES TO THIS ONE (if this is a foundational practice)
-- ============================================================================

-- Example: If other practices should depend on this new practice
-- INSERT INTO practice_dependencies (practice_id, depends_on_id)
-- VALUES
--   ('some-other-practice', 'example-practice')
-- ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- UPDATE METADATA
-- ============================================================================

INSERT INTO metadata (key, value)
VALUES ('lastUpdated', to_jsonb(CURRENT_DATE::text))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Uncomment to verify after running:
-- SELECT * FROM practices WHERE id = 'example-practice';
-- SELECT * FROM get_practice_dependencies('example-practice');
-- SELECT * FROM get_practice_dependents('example-practice');
