-- ============================================================================
-- DATA MIGRATION: Add Product Goals Practice
-- File: 005_add_product_goals.sql
-- Date: 2025-10-20
-- Description: Adds "Product Goals" practice as a foundation for feature prioritization
--
-- Rationale:
-- - Teams need clear, measurable product goals before they can effectively prioritize features
-- - Product goals provide the "why" that informs the "what" (prioritized features)
-- - This practice is foundational to product management and strategic alignment
--
-- Changes:
-- - Add 'product-goals' practice
-- - Update 'prioritized-features' to depend on 'product-goals'
-- - Version bump: 1.2.0 → 1.3.0
-- ============================================================================

BEGIN;

-- ============================================================================
-- ADD PRODUCT GOALS PRACTICE
-- ============================================================================

INSERT INTO practices (id, name, type, category, description, requirements, benefits) VALUES
  ('product-goals', 'Product Goals', 'practice', 'behavior',
   'Clearly defined, measurable product goals that align team effort and provide direction for feature prioritization.',
   '["Clear product vision and mission","Measurable objectives and key results (OKRs)","Stakeholder alignment on goals","Regular goal review and adjustment","Goals communicated to entire team","Success metrics defined","Time-bound goal setting"]'::jsonb,
   '["Better feature prioritization decisions","Team alignment on what matters most","Focused effort on high-impact work","Clearer communication with stakeholders","Measurable progress tracking","Reduced waste on low-value features","Strategic product direction"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- ADD DEPENDENCIES
-- ============================================================================

-- Product goals is foundational - no dependencies needed
-- But prioritized-features should now depend on product-goals

INSERT INTO practice_dependencies (practice_id, depends_on_id) VALUES
  ('prioritized-features', 'product-goals')
ON CONFLICT (practice_id, depends_on_id) DO NOTHING;

-- ============================================================================
-- UPDATE METADATA
-- ============================================================================

INSERT INTO metadata (key, value) VALUES
  ('version', '"1.3.0"'::jsonb),
  ('lastUpdated', to_jsonb(CURRENT_TIMESTAMP::text)),
  ('changelog', '"Added Product Goals practice as foundation for feature prioritization"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
-- - Added 1 new practice: product-goals
-- - Added 1 new dependency: prioritized-features → product-goals
-- - Updated version from 1.2.0 to 1.3.0
-- - Total practices: 52 (51 existing + 1 new)
-- - Total dependencies: ~114 (113 existing + 1 new)
--
-- Verification queries:
-- SELECT * FROM practices WHERE id = 'product-goals';
-- SELECT * FROM practice_dependencies WHERE practice_id = 'prioritized-features' AND depends_on_id = 'product-goals';
-- SELECT * FROM metadata WHERE key = 'version'; -- Should be 1.3.0
-- ============================================================================
