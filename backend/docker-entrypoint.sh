#!/bin/sh
set -e

echo "Applying Prisma schema to database..."
npx prisma db push

# Hotfix: align compiled backend with AI route (/recommend, not /api/recommand)
if [ -f /app/dist/modules/orientation/orientation.controller.js ]; then
  sed -i 's|/api/recommand|/recommend|g' /app/dist/modules/orientation/orientation.controller.js 2>/dev/null || true
fi

echo "Starting Bideya backend..."
exec node dist/server.js
