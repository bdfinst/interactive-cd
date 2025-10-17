-- Migration: 003_add_views
-- Description: Add convenient views for common queries
-- Date: 2025-10-17

BEGIN;

-- Practice summary with dependency counts
CREATE OR REPLACE VIEW practice_summary AS
SELECT
  p.id,
  p.name,
  p.type,
  p.category,
  COUNT(DISTINCT pd_deps.depends_on_id) AS dependency_count,
  COUNT(DISTINCT pd_dependents.practice_id) AS dependent_count
FROM practices p
LEFT JOIN practice_dependencies pd_deps ON p.id = pd_deps.practice_id
LEFT JOIN practice_dependencies pd_dependents ON p.id = pd_dependents.depends_on_id
GROUP BY p.id, p.name, p.type, p.category;

-- Leaf practices (no dependencies)
CREATE OR REPLACE VIEW leaf_practices AS
SELECT
  p.id,
  p.name,
  p.type,
  p.category,
  p.description
FROM practices p
LEFT JOIN practice_dependencies pd ON p.id = pd.practice_id
WHERE pd.practice_id IS NULL
ORDER BY p.name;

-- Root practices
CREATE OR REPLACE VIEW root_practices AS
SELECT
  p.id,
  p.name,
  p.category,
  p.description
FROM practices p
WHERE p.type = 'root';

COMMIT;
