-- Migration: 001_initial_schema
-- Description: Create initial database schema for CD practices
-- Date: 2025-10-17

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create practices table
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

-- Create practice_dependencies junction table
CREATE TABLE practice_dependencies (
  id SERIAL PRIMARY KEY,
  practice_id VARCHAR(255) NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  depends_on_id VARCHAR(255) NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(practice_id, depends_on_id),
  CHECK (practice_id != depends_on_id)
);

-- Create metadata table
CREATE TABLE metadata (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_practice_dependencies_practice_id ON practice_dependencies(practice_id);
CREATE INDEX idx_practice_dependencies_depends_on_id ON practice_dependencies(depends_on_id);
CREATE INDEX idx_practices_category ON practices(category);
CREATE INDEX idx_practices_type ON practices(type);
CREATE INDEX idx_practices_requirements ON practices USING GIN(requirements);
CREATE INDEX idx_practices_benefits ON practices USING GIN(benefits);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metadata_updated_at
  BEFORE UPDATE ON metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
