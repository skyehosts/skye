#!/bin/bash
set -e

# Create the test database alongside the main database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "skye-hosts-test";
    GRANT ALL PRIVILEGES ON DATABASE "skye-hosts-test" TO "$POSTGRES_USER";
EOSQL
