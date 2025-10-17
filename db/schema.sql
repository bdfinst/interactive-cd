-- ============================================================================
-- CD Practices Database Schema for Netlify Postgres
-- ============================================================================
-- This schema supports unlimited levels of hierarchical dependencies
-- using an adjacency list pattern with a junction table
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PRACTICES TABLE
-- ============================================================================
-- Core table storing all CD practices
-- ============================================================================

CREATE TABLE practices (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('root', 'practice')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('practice', 'tooling', 'behavior', 'culture')),
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]',
  benefits JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRACTICE_DEPENDENCIES TABLE
-- ============================================================================
-- Junction table representing dependency relationships
-- Supports unlimited depth through self-referencing relationships
-- ============================================================================

CREATE TABLE practice_dependencies (
  id SERIAL PRIMARY KEY,
  practice_id VARCHAR(255) NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  depends_on_id VARCHAR(255) NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure we don't have duplicate dependencies
  UNIQUE(practice_id, depends_on_id),

  -- Prevent self-referencing (a practice can't depend on itself)
  CHECK (practice_id != depends_on_id)
);

-- ============================================================================
-- METADATA TABLE
-- ============================================================================
-- Store metadata about the dataset
-- ============================================================================

CREATE TABLE metadata (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Optimize common queries
-- ============================================================================

-- Index for finding all dependencies of a practice
CREATE INDEX idx_practice_dependencies_practice_id
  ON practice_dependencies(practice_id);

-- Index for finding all practices that depend on a given practice (reverse lookup)
CREATE INDEX idx_practice_dependencies_depends_on_id
  ON practice_dependencies(depends_on_id);

-- Index for filtering practices by category
CREATE INDEX idx_practices_category
  ON practices(category);

-- Index for filtering practices by type
CREATE INDEX idx_practices_type
  ON practices(type);

-- GIN index for efficient JSONB queries on requirements
CREATE INDEX idx_practices_requirements
  ON practices USING GIN(requirements);

-- GIN index for efficient JSONB queries on benefits
CREATE INDEX idx_practices_benefits
  ON practices USING GIN(benefits);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Automatically update timestamps
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for practices table
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for metadata table
CREATE TRIGGER update_metadata_updated_at
  BEFORE UPDATE ON metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================
-- Utility functions for common operations
-- ============================================================================

-- Get all dependencies of a practice (direct children)
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

-- Get all practices that depend on a given practice (reverse dependencies)
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

-- Get full practice tree starting from a practice (recursive)
-- Returns all descendants with their depth level
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
    -- Base case: start with the root practice
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

    -- Recursive case: get all dependencies
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
    WHERE pt.level < 100  -- Prevent infinite loops (safety limit)
  )
  SELECT * FROM practice_tree
  ORDER BY level, name;
END;
$$ LANGUAGE plpgsql;

-- Get ancestors of a practice (all practices that lead to this one)
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
    -- Base case: start with the leaf practice
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

    -- Recursive case: get all dependents (parents)
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
    WHERE pa.level < 100  -- Prevent infinite loops (safety limit)
  )
  SELECT * FROM practice_ancestors
  ORDER BY level DESC, name;
END;
$$ LANGUAGE plpgsql;

-- Check if a dependency would create a circular reference
CREATE OR REPLACE FUNCTION would_create_cycle(
  parent_id VARCHAR,
  child_id VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  cycle_exists BOOLEAN;
BEGIN
  -- Check if child_id is an ancestor of parent_id
  SELECT EXISTS (
    SELECT 1
    FROM get_practice_ancestors(parent_id)
    WHERE id = child_id
  ) INTO cycle_exists;

  RETURN cycle_exists;
END;
$$ LANGUAGE plpgsql;

-- Get practice depth (distance from root)
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

-- ============================================================================
-- VIEWS
-- ============================================================================
-- Convenient views for common queries
-- ============================================================================

-- View showing all practices with their dependency counts
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

-- View showing leaf practices (no dependencies)
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

-- View showing root practices
CREATE OR REPLACE VIEW root_practices AS
SELECT
  p.id,
  p.name,
  p.category,
  p.description
FROM practices p
WHERE p.type = 'root';

-- ============================================================================
-- COMMENTS
-- ============================================================================
-- Add descriptions to tables and columns
-- ============================================================================

COMMENT ON TABLE practices IS 'Core table storing all Continuous Delivery practices';
COMMENT ON TABLE practice_dependencies IS 'Junction table representing dependency relationships between practices';
COMMENT ON TABLE metadata IS 'Metadata about the dataset version and source';

COMMENT ON COLUMN practices.id IS 'Unique identifier for the practice (kebab-case)';
COMMENT ON COLUMN practices.name IS 'Human-readable name of the practice';
COMMENT ON COLUMN practices.type IS 'Type of practice: root (top-level) or practice';
COMMENT ON COLUMN practices.category IS 'Category: practice, tooling, behavior, or culture';
COMMENT ON COLUMN practices.requirements IS 'JSON array of requirements to implement this practice';
COMMENT ON COLUMN practices.benefits IS 'JSON array of benefits gained from this practice';

COMMENT ON COLUMN practice_dependencies.practice_id IS 'The practice that has dependencies';
COMMENT ON COLUMN practice_dependencies.depends_on_id IS 'The practice that is depended upon';
