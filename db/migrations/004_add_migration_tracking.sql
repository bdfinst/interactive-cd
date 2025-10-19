-- Migration: 004_add_migration_tracking
-- Description: Add migration tracking system for automated migrations
-- Date: 2025-10-19
--
-- This migration creates the schema_migrations table to track which migrations
-- have been applied to the database. This enables automated migration detection
-- and prevents duplicate application of migrations.

BEGIN;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  migration_type VARCHAR(10) NOT NULL CHECK (migration_type IN ('schema', 'data')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Create index for fast lookups by migration name
CREATE INDEX IF NOT EXISTS idx_schema_migrations_name
  ON schema_migrations(migration_name);

-- Create index for filtering by type and date
CREATE INDEX IF NOT EXISTS idx_schema_migrations_type_applied
  ON schema_migrations(migration_type, applied_at);

-- Backfill existing migrations that were applied before tracking system existed
-- These migrations are already in the database, so we mark them as applied
INSERT INTO schema_migrations (migration_name, migration_type, applied_at) VALUES
  ('001_initial_schema.sql', 'schema', CURRENT_TIMESTAMP),
  ('002_add_functions.sql', 'schema', CURRENT_TIMESTAMP),
  ('003_add_views.sql', 'schema', CURRENT_TIMESTAMP),
  ('001_initial_data.sql', 'data', CURRENT_TIMESTAMP),
  ('003_add_deterministic_tests.sql', 'data', CURRENT_TIMESTAMP)
ON CONFLICT (migration_name) DO NOTHING;

-- Add helpful comment
COMMENT ON TABLE schema_migrations IS
  'Tracks which database migrations have been applied. Used by automated migration scripts.';

COMMENT ON COLUMN schema_migrations.migration_name IS
  'Filename of the migration (e.g., 001_initial_schema.sql)';

COMMENT ON COLUMN schema_migrations.migration_type IS
  'Type of migration: schema (DDL) or data (DML)';

COMMENT ON COLUMN schema_migrations.applied_at IS
  'Timestamp when the migration was successfully applied';

COMMENT ON COLUMN schema_migrations.success IS
  'Whether the migration completed successfully';

COMMENT ON COLUMN schema_migrations.error_message IS
  'Error message if migration failed (NULL if successful)';

COMMIT;
