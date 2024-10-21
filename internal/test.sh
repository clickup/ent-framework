#!/bin/bash
set -e

internal/build.sh
jest "$@"
