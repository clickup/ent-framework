#!/bin/bash
set -e

eslint . --ext .ts --cache --cache-location dist/.eslintcache
