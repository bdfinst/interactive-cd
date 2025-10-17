#!/bin/bash
# ============================================================================
# Update Deployment Script - Ongoing Deployments
# ============================================================================
# This script applies new data migrations for ongoing deployments.
# Use this after the initial deployment to add new practices.
#
# Usage:
#   export DATABASE_URL="postgresql://..."
#   ./db/deploy-updates.sh
# ============================================================================

set -e  # Exit on error

echo "============================================================================"
echo "  CD PRACTICES - DEPLOYMENT UPDATES"
echo "============================================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "Set it with:"
  echo "  export DATABASE_URL='postgresql://user:pass@host:port/database'"
  echo ""
  exit 1
fi

echo "📊 Database: ${DATABASE_URL%%@*}@***"
echo ""

# Check if tables exist
if ! psql "$DATABASE_URL" -c "\dt practices" > /dev/null 2>&1; then
  echo "❌ ERROR: Database not initialized"
  echo ""
  echo "Run initial deployment first:"
  echo "  ./db/deploy-initial.sh"
  echo ""
  exit 1
fi

echo "============================================================================"
echo "  Current State"
echo "============================================================================"
echo ""

echo "📊 Current practice count:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as practice_count FROM practices;"

echo ""
echo "📊 Last updated:"
psql "$DATABASE_URL" -c "SELECT value FROM metadata WHERE key = 'lastUpdated';"

echo ""
echo "============================================================================"
echo "  Applying Data Migrations"
echo "============================================================================"
echo ""

# Track applied migrations (simple approach - could be enhanced with migration table)
MIGRATION_COUNT=0

# Apply data migrations in order (skip 001 as it's the initial data)
for migration in db/data/[0-9][0-9][0-9]_*.sql; do
  # Skip initial data migration
  if [[ "$migration" == "db/data/001_initial_data.sql" ]]; then
    continue
  fi

  # Skip example file
  if [[ "$migration" == *"example"* ]]; then
    continue
  fi

  if [ -f "$migration" ]; then
    echo "▶️  Applying: $(basename "$migration")"
    psql "$DATABASE_URL" -f "$migration"
    echo "   ✅ Applied successfully"
    echo ""
    MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
  fi
done

if [ $MIGRATION_COUNT -eq 0 ]; then
  echo "ℹ️  No new data migrations to apply"
else
  echo "✅ Applied $MIGRATION_COUNT migration(s)"
fi

echo ""
echo "============================================================================"
echo "  Updated State"
echo "============================================================================"
echo ""

echo "📊 Practice count:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as practice_count FROM practices;"

echo ""
echo "📊 Dependency count:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as dependency_count FROM practice_dependencies;"

echo ""
echo "📊 Category breakdown:"
psql "$DATABASE_URL" -c "SELECT category, COUNT(*) as count FROM practices GROUP BY category ORDER BY count DESC;"

echo ""
echo "============================================================================"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "============================================================================"
echo ""
