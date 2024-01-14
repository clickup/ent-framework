#!/bin/bash
set -e

npm run build
npm run lint
npm run test
npm publish --access=public
