#!/bin/bash
set -e

LOG="db-init.log"

rm -f $LOG
trap "rm -f $LOG" EXIT

for schema in sh000{0..4}; do
  DB_ID_ENV_NO=1 psql -v ON_ERROR_STOP=on \
    -c "SET client_min_messages TO WARNING; CREATE SCHEMA IF NOT EXISTS $schema; SET search_path TO $schema" \
    -f "$(npm root)/@clickup/pg-id/pg-id-up.sql" >> $LOG 2>&1 \
    || { cat $LOG; exit 1; }
done
