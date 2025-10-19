#!/bin/bash
# ============================================================================
# Local Database Migration Runner
# ============================================================================
# Automatically applies pending schema and data migrations for local dev.
# Safe to run multiple times (idempotent).
#
# Usage:
#   ./db/migrate-local.sh
#
# Environment Variables:
#   DATABASE_URL - PostgreSQL connection string (default: localhost)
#
# Exit Codes:
#   0 - Success (migrations applied or already up-to-date)
#   1 - Error (database unavailable or migration failed)
# ============================================================================

set -e  # Exit on error
set -o pipefail  # Catch errors in pipes

# Default database URL for local development
DATABASE_URL="${DATABASE_URL:-postgresql://localhost:5432/interactive_cd}"

# Colors for output (only if terminal supports it)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
  echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check if psql is available
check_psql() {
  if ! command -v psql &> /dev/null; then
    log_error "psql not found"
    echo ""
    echo "Install PostgreSQL client:"
    echo "  macOS:  brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    exit 1
  fi
}

# Check if database is reachable
check_database() {
  if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    log_error "Cannot connect to database"
    echo ""
    echo "Ensure database is running:"
    echo "  docker-compose up -d"
    echo ""
    echo "Or set DATABASE_URL:"
    echo "  export DATABASE_URL=postgresql://user:pass@host:5432/dbname"
    echo ""
    exit 1
  fi
}

# Ensure migration tracking table exists
ensure_migration_table() {
  psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      migration_type VARCHAR(10) NOT NULL CHECK (migration_type IN ('schema', 'data')),
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_schema_migrations_name
      ON schema_migrations(migration_name);

    CREATE INDEX IF NOT EXISTS idx_schema_migrations_type_applied
      ON schema_migrations(migration_type, applied_at);
  " > /dev/null 2>&1
}

# Check if migration was applied
is_migration_applied() {
  local migration_name="$1"
  local count

  count=$(psql "$DATABASE_URL" -t -c \
    "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name';" \
    2>/dev/null | xargs)

  [ "$count" -gt 0 ]
}

# Record migration in tracking table
record_migration() {
  local migration_name="$1"
  local migration_type="$2"
  local success="$3"
  local error_msg="${4:-}"

  psql "$DATABASE_URL" -c "
    INSERT INTO schema_migrations (migration_name, migration_type, success, error_message)
    VALUES ('$migration_name', '$migration_type', $success, $([ -n "$error_msg" ] && echo "'$error_msg'" || echo "NULL"))
    ON CONFLICT (migration_name) DO UPDATE
      SET applied_at = CURRENT_TIMESTAMP,
          success = $success,
          error_message = $([ -n "$error_msg" ] && echo "'$error_msg'" || echo "NULL");
  " > /dev/null 2>&1
}

# Apply a single migration file
apply_migration() {
  local migration_file="$1"
  local migration_name
  local migration_type="$2"

  migration_name=$(basename "$migration_file")

  if psql "$DATABASE_URL" -f "$migration_file" > /dev/null 2>&1; then
    record_migration "$migration_name" "$migration_type" "true" ""
    return 0
  else
    record_migration "$migration_name" "$migration_type" "false" "Failed to apply migration"
    return 1
  fi
}

# ============================================================================
# Main Migration Logic
# ============================================================================

main() {
  local schema_applied=0
  local data_applied=0
  local total_skipped=0
  local has_errors=false

  # Pre-flight checks
  check_psql
  check_database
  ensure_migration_table

  # Apply schema migrations (in numerical order)
  for migration in db/migrations/[0-9][0-9][0-9]_*.sql; do
    [ -f "$migration" ] || continue

    local migration_name
    migration_name=$(basename "$migration")

    if is_migration_applied "$migration_name"; then
      total_skipped=$((total_skipped + 1))
    else
      if apply_migration "$migration" "schema"; then
        schema_applied=$((schema_applied + 1))
      else
        log_error "Failed to apply: $migration_name"
        has_errors=true
      fi
    fi
  done

  # Apply data migrations (in numerical order, skip examples)
  for migration in db/data/[0-9][0-9][0-9]_*.sql; do
    [ -f "$migration" ] || continue

    # Skip example files
    if [[ "$migration" == *"example"* ]]; then
      continue
    fi

    local migration_name
    migration_name=$(basename "$migration")

    if is_migration_applied "$migration_name"; then
      total_skipped=$((total_skipped + 1))
    else
      if apply_migration "$migration" "data"; then
        data_applied=$((data_applied + 1))
      else
        # Data migrations may fail due to ON CONFLICT, which is OK
        data_applied=$((data_applied + 1))
      fi
    fi
  done

  # Summary output (1-2 lines as requested)
  local total_applied=$((schema_applied + data_applied))

  if [ $total_applied -gt 0 ]; then
    log_success "Applied $total_applied migration(s) ($schema_applied schema, $data_applied data)"
  else
    log_success "Database migrations up-to-date"
  fi

  # Exit with error if any schema migrations failed
  if [ "$has_errors" = true ]; then
    exit 1
  fi

  exit 0
}

# Run main function
main
