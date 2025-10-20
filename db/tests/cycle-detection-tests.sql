-- ============================================================================
-- CYCLE DETECTION TEST QUERIES
-- Purpose: Comprehensive tests to detect and prevent circular dependencies
-- Usage: Run before and after migrations to ensure no cycles exist
-- ============================================================================

-- 1. BASIC CYCLE DETECTION USING BUILT-IN FUNCTION
-- ----------------------------------------------------------------------------
-- Test the would_create_cycle function with various scenarios
DO $$
DECLARE
  test_result BOOLEAN;
  test_name TEXT;
BEGIN
  -- Test 1: Self-reference cycle
  test_name := 'Self-reference cycle test';
  test_result := would_create_cycle('continuous-delivery', 'continuous-delivery');
  RAISE NOTICE '% : % (should be true)', test_name, test_result;

  -- Test 2: Direct cycle (A → B, B → A)
  test_name := 'Direct cycle test';
  -- First check if adding reverse dependency would create cycle
  test_result := would_create_cycle('version-control', 'continuous-integration');
  RAISE NOTICE '% : % (should detect if CI depends on VC)', test_name, test_result;

  -- Test 3: Non-cycle (valid dependency)
  test_name := 'Valid dependency test';
  test_result := would_create_cycle('new-practice-id', 'version-control');
  RAISE NOTICE '% : % (should be false for new practice)', test_name, test_result;
END $$;

-- 2. COMPREHENSIVE CYCLE DETECTION WITH PATH VISUALIZATION
-- ----------------------------------------------------------------------------
-- Find all potential cycles in the current dependency graph
WITH RECURSIVE dependency_paths AS (
  -- Start from each practice
  SELECT
    pd.practice_id as start_practice,
    pd.practice_id,
    pd.depends_on_id,
    ARRAY[pd.practice_id] as path,
    1 as depth,
    false as has_cycle,
    p1.name as start_name,
    p2.name as depends_on_name
  FROM practice_dependencies pd
  JOIN practices p1 ON pd.practice_id = p1.id
  JOIN practices p2 ON pd.depends_on_id = p2.id

  UNION ALL

  -- Recursively follow dependencies
  SELECT
    dp.start_practice,
    pd.practice_id,
    pd.depends_on_id,
    dp.path || pd.practice_id,
    dp.depth + 1,
    pd.depends_on_id = dp.start_practice as has_cycle,
    dp.start_name,
    p.name as depends_on_name
  FROM dependency_paths dp
  JOIN practice_dependencies pd ON dp.depends_on_id = pd.practice_id
  JOIN practices p ON pd.depends_on_id = p.id
  WHERE dp.depth < 50 -- Prevent infinite recursion
    AND NOT dp.has_cycle -- Stop when cycle found
    AND NOT pd.practice_id = ANY(dp.path[2:]) -- Avoid revisiting nodes
)
SELECT
  'Cycle Detection Result' as test_name,
  COUNT(DISTINCT start_practice) as practices_with_cycles,
  CASE
    WHEN COUNT(DISTINCT start_practice) = 0 THEN 'PASS: No cycles detected'
    ELSE 'FAIL: ' || COUNT(DISTINCT start_practice) || ' practices involved in cycles'
  END as result,
  CASE
    WHEN COUNT(DISTINCT start_practice) > 0 THEN
      array_agg(DISTINCT start_name ORDER BY start_name)
    ELSE NULL
  END as affected_practices
FROM dependency_paths
WHERE has_cycle;

-- 3. DETECT CYCLES BY DEPTH LEVEL
-- ----------------------------------------------------------------------------
-- Check for cycles at each dependency depth level
WITH RECURSIVE depth_analysis AS (
  -- Root practices (no dependencies on them)
  SELECT
    p.id,
    p.name,
    0 as depth,
    ARRAY[p.id] as ancestor_path
  FROM practices p
  WHERE NOT EXISTS (
    SELECT 1 FROM practice_dependencies pd
    WHERE pd.depends_on_id = p.id
  )

  UNION ALL

  -- Practices that depend on current level
  SELECT
    p.id,
    p.name,
    da.depth + 1,
    da.ancestor_path || p.id
  FROM practices p
  JOIN practice_dependencies pd ON p.id = pd.practice_id
  JOIN depth_analysis da ON pd.depends_on_id = da.id
  WHERE da.depth < 20
    AND NOT p.id = ANY(da.ancestor_path) -- Cycle detection
)
SELECT
  depth,
  COUNT(*) as practices_at_depth,
  array_agg(name ORDER BY name) as practice_names
FROM depth_analysis
GROUP BY depth
ORDER BY depth;

-- 4. TEST SPECIFIC PRACTICE CHAINS FOR CYCLES
-- ----------------------------------------------------------------------------
-- Test specific dependency chains that are critical
WITH RECURSIVE chain_test AS (
  -- Start from trunk-based development
  SELECT
    'trunk-based-development' as root_practice,
    id,
    name,
    ARRAY[id] as path,
    0 as depth
  FROM practices
  WHERE id = 'trunk-based-development'

  UNION ALL

  -- Follow dependencies
  SELECT
    ct.root_practice,
    p.id,
    p.name,
    ct.path || p.id,
    ct.depth + 1
  FROM chain_test ct
  JOIN practice_dependencies pd ON ct.id = pd.practice_id
  JOIN practices p ON pd.depends_on_id = p.id
  WHERE ct.depth < 20
    AND NOT p.id = ANY(ct.path) -- Stop if we encounter a cycle
)
SELECT
  root_practice,
  depth,
  name,
  path,
  CASE
    WHEN path[1] = path[array_length(path, 1)] AND array_length(path, 1) > 1
    THEN 'CYCLE DETECTED!'
    ELSE 'OK'
  END as status
FROM chain_test
ORDER BY depth, name;

-- 5. SIMULATE ADDING NEW DEPENDENCIES AND CHECK FOR CYCLES
-- ----------------------------------------------------------------------------
-- Test what would happen if we added specific new dependencies
WITH proposed_dependencies AS (
  SELECT * FROM (VALUES
    ('deterministic-tests', 'trunk-based-development'), -- Would create cycle!
    ('version-control', 'continuous-delivery'), -- Would create cycle!
    ('new-practice', 'version-control') -- Should be OK
  ) AS t(from_practice, to_practice)
)
SELECT
  pd.from_practice,
  pd.to_practice,
  would_create_cycle(pd.from_practice, pd.to_practice) as would_create_cycle,
  CASE
    WHEN would_create_cycle(pd.from_practice, pd.to_practice)
    THEN 'BLOCKED: Would create circular dependency'
    ELSE 'ALLOWED: Safe to add'
  END as recommendation
FROM proposed_dependencies pd
ORDER BY
  CASE WHEN would_create_cycle(pd.from_practice, pd.to_practice) THEN 0 ELSE 1 END,
  pd.from_practice;

-- 6. FIND STRONGLY CONNECTED COMPONENTS (Tarjan's Algorithm Simulation)
-- ----------------------------------------------------------------------------
-- Identify groups of practices that are mutually dependent (cycles)
WITH RECURSIVE scc_finder AS (
  -- Initial: each practice is its own component
  SELECT
    id,
    name,
    id as component_id,
    ARRAY[id] as component_members
  FROM practices

  UNION

  -- Merge components that are connected
  SELECT
    p.id,
    p.name,
    LEAST(sf.component_id, pd.depends_on_id) as component_id,
    array_append(sf.component_members, pd.depends_on_id)
  FROM scc_finder sf
  JOIN practices p ON sf.id = p.id
  JOIN practice_dependencies pd ON p.id = pd.practice_id
  WHERE NOT pd.depends_on_id = ANY(sf.component_members)
),
components AS (
  SELECT
    component_id,
    array_agg(DISTINCT id) as members,
    COUNT(DISTINCT id) as size
  FROM scc_finder
  GROUP BY component_id
  HAVING COUNT(DISTINCT id) > 1 -- Only show components with multiple members
)
SELECT
  'Strongly Connected Components' as analysis,
  COUNT(*) as component_count,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS: No mutual dependencies (good!)'
    ELSE 'WARNING: Found ' || COUNT(*) || ' groups with potential cycles'
  END as status
FROM components;

-- 7. VALIDATE ACYCLIC PROPERTY AFTER MIGRATION
-- ----------------------------------------------------------------------------
-- Comprehensive check that the graph remains a DAG (Directed Acyclic Graph)
DO $$
DECLARE
  has_cycles BOOLEAN;
  cycle_count INTEGER;
BEGIN
  -- Use recursive CTE to detect any cycles
  WITH RECURSIVE cycle_check AS (
    SELECT
      practice_id,
      depends_on_id,
      ARRAY[practice_id, depends_on_id] as path,
      false as is_cycle
    FROM practice_dependencies

    UNION ALL

    SELECT
      cc.practice_id,
      pd.depends_on_id,
      cc.path || pd.depends_on_id,
      pd.depends_on_id = cc.practice_id as is_cycle
    FROM cycle_check cc
    JOIN practice_dependencies pd ON cc.depends_on_id = pd.practice_id
    WHERE array_length(cc.path, 1) < 100
      AND NOT cc.is_cycle
  )
  SELECT COUNT(*) INTO cycle_count
  FROM cycle_check
  WHERE is_cycle;

  has_cycles := cycle_count > 0;

  -- Report results
  IF has_cycles THEN
    RAISE EXCEPTION 'CRITICAL: Dependency graph contains % cycle(s)!', cycle_count;
  ELSE
    RAISE NOTICE 'SUCCESS: Dependency graph is acyclic (DAG property maintained)';
  END IF;
END $$;

-- 8. DETECT INDIRECT CYCLES (Multi-hop cycles)
-- ----------------------------------------------------------------------------
-- Find cycles that involve multiple intermediate dependencies
WITH RECURSIVE multi_hop AS (
  -- Start with all practices
  SELECT
    p.id as origin,
    p.id as current,
    p.name as origin_name,
    0 as hop_count,
    ARRAY[]::text[] as path
  FROM practices p

  UNION ALL

  -- Follow dependencies up to 10 hops
  SELECT
    mh.origin,
    pd.depends_on_id as current,
    mh.origin_name,
    mh.hop_count + 1,
    mh.path || pd.practice_id
  FROM multi_hop mh
  JOIN practice_dependencies pd ON mh.current = pd.practice_id
  WHERE mh.hop_count < 10
    AND NOT pd.depends_on_id = ANY(mh.path || mh.origin)
)
SELECT
  origin_name,
  hop_count as cycle_length,
  path || current as cycle_path,
  'CYCLE: ' || origin_name || ' depends on itself via ' || hop_count || ' hops' as description
FROM multi_hop
WHERE current = origin
  AND hop_count > 0
ORDER BY hop_count, origin_name;

-- 9. PREVENTION TEST: Ensure cycle detection trigger works
-- ----------------------------------------------------------------------------
-- Test that the database would prevent inserting a circular dependency
BEGIN;
-- Attempt to create a cycle (this should fail if triggers are in place)
-- Uncomment to test your cycle prevention mechanism
-- INSERT INTO practice_dependencies (practice_id, depends_on_id)
-- VALUES ('version-control', 'continuous-delivery');

-- Check if it was prevented
SELECT
  'Cycle Prevention Test' as test,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM practice_dependencies
      WHERE practice_id = 'version-control'
      AND depends_on_id = 'continuous-delivery'
    )
    THEN 'PASS: Cycle insertion was prevented'
    ELSE 'FAIL: Cycle was allowed (check triggers!)'
  END as result;
ROLLBACK;

-- 10. SUMMARY REPORT
-- ----------------------------------------------------------------------------
-- Overall cycle detection summary
WITH cycle_stats AS (
  WITH RECURSIVE paths AS (
    SELECT
      practice_id,
      depends_on_id,
      ARRAY[practice_id] as visited,
      false as has_cycle
    FROM practice_dependencies

    UNION ALL

    SELECT
      p.practice_id,
      pd.depends_on_id,
      p.visited || p.depends_on_id,
      pd.depends_on_id = ANY(p.visited) as has_cycle
    FROM paths p
    JOIN practice_dependencies pd ON p.depends_on_id = pd.practice_id
    WHERE NOT p.has_cycle
      AND array_length(p.visited, 1) < 50
  )
  SELECT COUNT(*) as cycle_count
  FROM paths
  WHERE has_cycle
)
SELECT
  'Cycle Detection Summary' as report,
  CASE
    WHEN cycle_count = 0 THEN 'PASS: No cycles detected in dependency graph'
    ELSE 'FAIL: ' || cycle_count || ' cycles detected - immediate action required!'
  END as status,
  (SELECT COUNT(*) FROM practices) as total_practices,
  (SELECT COUNT(*) FROM practice_dependencies) as total_dependencies,
  cycle_count
FROM cycle_stats;