#!/bin/bash
# ============================================================================
# Database Migration Deployment Script for CI/CD
# ============================================================================
# This script runs database migrations during the Netlify build process.
# It's designed to be safe and idempotent.
#
# Usage (in Netlify build):
#   ./db/deploy-migrations.sh
#
# Environment Variables Required:
#   DATABASE_URL - PostgreSQL connection string
# ============================================================================

set -e  # Exit on error

echo "============================================================================"
echo "  DATABASE MIGRATIONS - CI/CD DEPLOYMENT"
echo "============================================================================"
echo ""

# Detect Netlify context
CONTEXT="${CONTEXT:-unknown}"
echo "🌐 Netlify Context: $CONTEXT"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "This script requires DATABASE_URL to be set in Netlify environment variables."
  echo "Skipping database migrations."
  echo ""
  exit 0  # Exit gracefully (don't fail the build)
fi

# Show database being used (mask password)
DB_INFO=$(echo "$DATABASE_URL" | sed -E 's/:[^:@]+@/:***@/')
echo "📊 Database: $DB_INFO"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "⚠️  WARNING: psql (PostgreSQL client) not found in build environment"
  echo ""
  echo "Migrations cannot run automatically without psql."
  echo "To fix this, either:"
  echo "  1. Run migrations manually: ./db/deploy-migrations.sh (see docs/NETLIFY-BUILD-SETUP.md)"
  echo "  2. Use a custom build image with PostgreSQL client pre-installed"
  echo ""
  echo "Skipping database migrations (build will continue)."
  echo ""
  exit 0  # Exit gracefully - don't fail the build
fi

# Check if database is reachable
echo "🔍 Checking database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "❌ ERROR: Cannot connect to database"
  echo "Skipping migrations (database may not be initialized yet)"
  echo ""
  exit 0  # Exit gracefully
fi

echo "✅ Database connection successful"
echo ""

# Check if tables exist (database initialized)
if ! psql "$DATABASE_URL" -c "\dt practices" > /dev/null 2>&1; then
  echo "⚠️  WARNING: Database tables not found"
  echo "This appears to be a fresh database. Run initial deployment first:"
  echo "  ./db/deploy-initial.sh"
  echo ""
  echo "Skipping migrations."
  exit 0  # Exit gracefully
fi

echo "============================================================================"
echo "  Current Database State"
echo "============================================================================"
echo ""

# Get current practice count (suppress header for cleaner output)
CURRENT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM practices;" | xargs)
echo "📊 Current practices: $CURRENT_COUNT"

# Get current version
CURRENT_VERSION=$(psql "$DATABASE_URL" -t -c "SELECT value FROM metadata WHERE key = 'version';" | xargs | tr -d '"')
echo "📦 Current version: $CURRENT_VERSION"

echo ""
echo "============================================================================"
echo "  Applying Data Migrations"
echo "============================================================================"
echo ""

# Track applied migrations
MIGRATION_COUNT=0
FAILED_MIGRATIONS=0

# Apply data migrations in order
for migration in db/data/[0-9][0-9][0-9]_*.sql; do
  # Skip initial data migration (001)
  if [[ "$migration" == "db/data/001_initial_data.sql" ]]; then
    continue
  fi

  # Skip example file
  if [[ "$migration" == *"example"* ]]; then
    continue
  fi

  if [ -f "$migration" ]; then
    migration_name=$(basename "$migration")
    echo "▶️  Applying: $migration_name"

    # Apply migration with error handling
    if psql "$DATABASE_URL" -f "$migration" > /dev/null 2>&1; then
      echo "   ✅ Applied successfully"
      MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
    else
      echo "   ⚠️  Skipped (likely already applied or error)"
      FAILED_MIGRATIONS=$((FAILED_MIGRATIONS + 1))
    fi
    echo ""
  fi
done

if [ $MIGRATION_COUNT -eq 0 ]; then
  echo "ℹ️  No new migrations to apply"
else
  echo "✅ Applied $MIGRATION_COUNT new migration(s)"
fi

if [ $FAILED_MIGRATIONS -gt 0 ]; then
  echo "ℹ️  Skipped $FAILED_MIGRATIONS migration(s) (already applied or errors)"
fi

echo ""
echo "============================================================================"
echo "  Updated Database State"
echo "============================================================================"
echo ""

# Get updated counts
UPDATED_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM practices;" | xargs)
DEPENDENCY_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM practice_dependencies;" | xargs)
UPDATED_VERSION=$(psql "$DATABASE_URL" -t -c "SELECT value FROM metadata WHERE key = 'version';" | xargs | tr -d '"')

echo "📊 Total practices: $UPDATED_COUNT"
echo "🔗 Total dependencies: $DEPENDENCY_COUNT"
echo "📦 Version: $UPDATED_VERSION"

# Show what changed
if [ "$UPDATED_COUNT" != "$CURRENT_COUNT" ]; then
  ADDED=$((UPDATED_COUNT - CURRENT_COUNT))
  echo ""
  echo "🆕 Added $ADDED new practice(s)"
fi

echo ""
echo "============================================================================"
echo "  ✅ DATABASE MIGRATIONS COMPLETE"
echo "============================================================================"
echo ""
