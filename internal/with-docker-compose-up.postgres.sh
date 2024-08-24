#!/bin/bash
set -e

docker compose -f docker-compose.postgres.yml up --quiet-pull -d

for _i in $(seq 1 20); do
  docker compose -f docker-compose.postgres.yml ps | grep -q healthy && break
  sleep 1
done

export PGHOST=127.0.0.1
export PGDATABASE=postgres
export PGUSER=postgres
export PGPASSWORD=postgres

# Run "$1" as a bash command (possibly with && in it) and pass $2, $3, ... as
# properly quoted arguments to it.
cmd="$1"
shift
eval "$cmd \"\$@\""
