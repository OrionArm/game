#!/bin/sh

echo "🚀 Running script start.sh"
pnpm exec drizzle-kit migrate || {
  echo "❌ Migration failed"
  exit 1
}
echo "✅ Migrations applied."
echo "Starting server..."
node /app/backend/dist/src/main.js