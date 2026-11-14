#!/usr/bin/env bash
set -e
test -f turbo.json || cd ..
npm install && npm run build
cd dashboard && npm install && VITE_BASE_PATH=/dashboard/ npm run build
cd ..
mkdir -p dist dashboard_dist
cp -r frontend/dist/* dist/
cp -r dashboard/dist/* dashboard_dist/
cp -r dashboard_dist/* dist/dashboard/