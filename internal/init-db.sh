#!/bin/bash
set -e

REL="node_modules/@clickup/pg-id"
LOG="db-init.log"

dir="$(pwd -P)"
while [[ ! -d "$dir/$REL" ]]; do
  dir=${dir%/*}
  if [[ "$dir" == "" ]]; then
    echo "Cannot find $REL/ in parent directories!";
    exit 1
  fi
done

dir="$dir/$REL"

if [[ ! -e $dir/pg-id-consts.sql ]]; then
  ln -s "$dir/pg-id-consts.sql.example" "$dir/pg-id-consts.sql"
fi

rm -f $LOG
trap "rm -f $LOG" EXIT

for schema in sh000{0..4}; do
  DB_ID_ENV_NO=1 psql -v ON_ERROR_STOP=on \
    -c "SET client_min_messages TO WARNING; CREATE SCHEMA IF NOT EXISTS $schema; SET search_path TO $schema" \
    -f "$dir/pg-id-up.sql" >> $LOG \
    || { cat $LOG; exit 1; }
done
