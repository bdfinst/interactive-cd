#!/bin/bash
# ============================================================================
# Initial Deployment Script - First Release
# ============================================================================
# This script sets up the database for the FIRST deployment only.
# Run this once to initialize your Netlify Postgres database.
#
# Usage:
#   export DATABASE_URL="postgresql://..."
#   ./db/deploy-initial.sh
# ============================================================================

set -e  # Exit on error

echo "============================================================================"
echo "  CD PRACTICES - INITIAL DEPLOYMENT"
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

# Confirm before proceeding
echo "⚠️  This will create tables and load initial data."
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "============================================================================"
echo "  STEP 1: Creating Schema"
echo "============================================================================"
echo ""

# Run schema (all-in-one)
psql "$DATABASE_URL" -f db/schema.sql

echo ""
echo "✅ Schema created successfully"
echo ""

echo "============================================================================"
echo "  STEP 2: Loading Initial Data"
echo "============================================================================"
echo ""

# Load initial data
psql "$DATABASE_URL" -f db/data/001_initial_data.sql

echo ""
echo "✅ Initial data loaded successfully"
echo ""

echo "============================================================================"
echo "  STEP 3: Verification"
echo "============================================================================"
echo ""

# Verify installation
echo "📊 Practice count:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as practice_count FROM practices;"

echo ""
echo "📊 Dependency count:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as dependency_count FROM practice_dependencies;"

echo ""
echo "📊 Root practice:"
psql "$DATABASE_URL" -c "SELECT id, name FROM root_practices;"

echo ""
echo "============================================================================"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "============================================================================"
echo ""
echo "Next steps:"
echo "  1. Test your API endpoints"
echo "  2. Deploy your SvelteKit application"
echo "  3. For future updates, use: ./db/deploy-updates.sh"
echo ""
