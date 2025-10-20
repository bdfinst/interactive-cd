#!/bin/bash
# ============================================================================
# Migration Status Checker
# ============================================================================
# Quickly checks if there are pending migrations without applying them.
# Useful for CI checks and status updates.
#
# Usage:
#   ./db/check-migrations.sh
#
# Environment Variables:
#   DATABASE_URL - PostgreSQL connection string (default: localhost)
#   QUIET        - Set to 'true' to suppress output (default: false)
#
# Exit Codes:
#   0 - No pending migrations
#   1 - Pending migrations found
#   2 - Database error
# ============================================================================

set -e
set -o pipefail

DATABASE_URL="${DATABASE_URL:-postgresql://localhost:5432/interactive_cd}"
QUIET="${QUIET:-false}"

# Colors (only if not quiet and terminal supports it)
if [ "$QUIET" = "false" ] && [ -t 1 ]; then
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  NC='\033[0m'
else
  GREEN=''
  YELLOW=''
  RED=''
  NC=''
fi

log() {
  if [ "$QUIET" = "false" ]; then
    echo -e "$1"
  fi
}

# Check database connectivity
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  log "${RED}❌ Cannot connect to database${NC}"
  exit 2
fi

# Check if migration table exists
if ! psql "$DATABASE_URL" -c "\dt schema_migrations" > /dev/null 2>&1; then
  log "${YELLOW}⚠️  Migration tracking table not found${NC}"
  log "Run: npm run db:migrate:local"
  exit 1
fi

# Count pending migrations
pending_count=0

# Check schema migrations
for migration in db/migrations/[0-9][0-9][0-9]_*.sql; do
  [ -f "$migration" ] || continue

  migration_name=$(basename "$migration")
  count=$(psql "$DATABASE_URL" -t -c \
    "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name';" \
    2>/dev/null | xargs)

  if [ "$count" -eq 0 ]; then
    ((pending_count++))
    log "${YELLOW}Pending: $migration_name${NC}"
  fi
done

# Check data migrations (skip examples)
for migration in db/data/[0-9][0-9][0-9]_*.sql; do
  [ -f "$migration" ] || continue

  if [[ "$migration" == *"example"* ]]; then
    continue
  fi

  migration_name=$(basename "$migration")
  count=$(psql "$DATABASE_URL" -t -c \
    "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name';" \
    2>/dev/null | xargs)

  if [ "$count" -eq 0 ]; then
    ((pending_count++))
    log "${YELLOW}Pending: $migration_name${NC}"
  fi
done

# Output result
if [ $pending_count -gt 0 ]; then
  log ""
  log "${YELLOW}⚠️  $pending_count pending migration(s) found${NC}"
  log "Run: npm run db:migrate:local"
  exit 1
else
  log "${GREEN}✅ No pending migrations${NC}"
  exit 0
fi
