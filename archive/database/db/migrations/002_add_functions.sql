-- Migration: 002_add_functions
-- Description: Add utility functions for querying hierarchical data
-- Date: 2025-10-17

BEGIN;

-- Get all dependencies of a practice
CREATE OR REPLACE FUNCTION get_practice_dependencies(practice_id_param VARCHAR)
RETURNS TABLE (
  id VARCHAR,
  name VARCHAR,
  type VARCHAR,
  category VARCHAR,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.type,
    p.category,
    p.description
  FROM practices p
  INNER JOIN practice_dependencies pd ON p.id = pd.depends_on_id
  WHERE pd.practice_id = practice_id_param
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Get all practices that depend on a given practice
CREATE OR REPLACE FUNCTION get_practice_dependents(practice_id_param VARCHAR)
RETURNS TABLE (
  id VARCHAR,
  name VARCHAR,
  type VARCHAR,
  category VARCHAR,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.type,
    p.category,
    p.description
  FROM practices p
  INNER JOIN practice_dependencies pd ON p.id = pd.practice_id
  WHERE pd.depends_on_id = practice_id_param
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Get full practice tree (recursive)
CREATE OR REPLACE FUNCTION get_practice_tree(root_practice_id VARCHAR)
RETURNS TABLE (
  id VARCHAR,
  name VARCHAR,
  type VARCHAR,
  category VARCHAR,
  description TEXT,
  requirements JSONB,
  benefits JSONB,
  level INTEGER,
  path TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE practice_tree AS (
    SELECT
      p.id,
      p.name,
      p.type,
      p.category,
      p.description,
      p.requirements,
      p.benefits,
      0 AS level,
      p.name::TEXT AS path
    FROM practices p
    WHERE p.id = root_practice_id

    UNION ALL

    SELECT
      p.id,
      p.name,
      p.type,
      p.category,
      p.description,
      p.requirements,
      p.benefits,
      pt.level + 1,
      pt.path || ' > ' || p.name
    FROM practices p
    INNER JOIN practice_dependencies pd ON p.id = pd.depends_on_id
    INNER JOIN practice_tree pt ON pd.practice_id = pt.id
    WHERE pt.level < 100
  )
  SELECT * FROM practice_tree
  ORDER BY level, name;
END;
$$ LANGUAGE plpgsql;

-- Get ancestors of a practice
CREATE OR REPLACE FUNCTION get_practice_ancestors(leaf_practice_id VARCHAR)
RETURNS TABLE (
  id VARCHAR,
  name VARCHAR,
  type VARCHAR,
  category VARCHAR,
  level INTEGER,
  path TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE practice_ancestors AS (
    SELECT
      p.id,
      p.name,
      p.type,
      p.category,
      0 AS level,
      p.name::TEXT AS path
    FROM practices p
    WHERE p.id = leaf_practice_id

    UNION ALL

    SELECT
      p.id,
      p.name,
      p.type,
      p.category,
      pa.level + 1,
      p.name || ' > ' || pa.path
    FROM practices p
    INNER JOIN practice_dependencies pd ON p.id = pd.practice_id
    INNER JOIN practice_ancestors pa ON pd.depends_on_id = pa.id
    WHERE pa.level < 100
  )
  SELECT * FROM practice_ancestors
  ORDER BY level DESC, name;
END;
$$ LANGUAGE plpgsql;

-- Check for circular dependencies
CREATE OR REPLACE FUNCTION would_create_cycle(
  parent_id VARCHAR,
  child_id VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  cycle_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM get_practice_ancestors(parent_id)
    WHERE id = child_id
  ) INTO cycle_exists;

  RETURN cycle_exists;
END;
$$ LANGUAGE plpgsql;

-- Get practice depth from root
CREATE OR REPLACE FUNCTION get_practice_depth(practice_id_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  max_depth INTEGER;
BEGIN
  WITH RECURSIVE practice_depth AS (
    SELECT
      p.id,
      0 AS depth
    FROM practices p
    WHERE p.type = 'root'

    UNION ALL

    SELECT
      pd.depends_on_id,
      pd_rec.depth + 1
    FROM practice_dependencies pd
    INNER JOIN practice_depth pd_rec ON pd.practice_id = pd_rec.id
    WHERE pd_rec.depth < 100
  )
  SELECT COALESCE(MAX(depth), -1)
  INTO max_depth
  FROM practice_depth
  WHERE id = practice_id_param;

  RETURN max_depth;
END;
$$ LANGUAGE plpgsql;

COMMIT;
