#!/bin/sh

echo "🚀 Running script start-dev.sh"

pnpm run db:migrate || {
  echo "❌ Migration failed"
  exit 1
}
echo "✅ Migrations applied."
echo "Starting server..."
pnpm run start:dev