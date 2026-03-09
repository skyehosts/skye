#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")"

# Load e2e environment
set -a
source "$API_DIR/.env.e2e"
set +a

DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-25433}"
DB_USER="${DATABASE_USERNAME:-skye-hosts}"
DB_NAME="${DATABASE_NAME:-skye-hosts-test}"

# Drop and recreate the test database for a clean migration
echo "Resetting test database: $DB_NAME"
PGPASSWORD="$DATABASE_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
  DROP DATABASE IF EXISTS \"$DB_NAME\";
  CREATE DATABASE \"$DB_NAME\";
" 2>/dev/null || true
echo "Test database reset complete"

# Start the API server on port 3003 (migrations run automatically on startup)
cd "$API_DIR"
exec npx nest start --port 3003
