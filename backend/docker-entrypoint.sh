#!/bin/sh
set -e

echo "Waiting for database..."
sleep 2

echo "Pushing Prisma schema..."
i=0
until npx prisma db push --accept-data-loss; do
  i=$((i + 1))
  if [ "$i" -ge 15 ]; then
    echo "Failed to push Prisma schema after retries."
    exit 1
  fi
  echo "Schema push failed, retrying ($i/15)..."
  sleep 2
done

echo "Seeding database..."
npx tsx prisma/seed.ts || true

echo "Starting server..."
exec node dist/index.js
