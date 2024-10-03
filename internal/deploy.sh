#!/bin/bash
set -e

npm run clean
npm install
npm run test
npm run lint
npm publish --access=public
