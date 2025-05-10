#!/bin/bash
set -e

if [[ -d ../../packages ]]; then
  tsc --build
else
  cat tsconfig.json | sed 's/"references"/"references-off"/'> tsconfig.json.tmp
  trap 'rm -f tsconfig.json.tmp' EXIT
  tsc -p tsconfig.json.tmp
fi
