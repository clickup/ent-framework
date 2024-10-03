#!/bin/bash
set -e

# Inject current directory name to the 1st argument of command line (useful for
# "yarn pstree" output in a monorepo).
if [[ "${1:0:1}" == "{" ]]; then
  shift
else
  exec ${BASH_SOURCE[0]} "{$(basename "$PWD")}" "$@"
fi

tsc --watch --preserveWatchOutput
