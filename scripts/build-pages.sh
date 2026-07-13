#!/bin/sh
set -e

if [ -d src/app/api ]; then
  mv src/app/api .api-stash
fi

cleanup() {
  if [ -d .api-stash ]; then
    mv .api-stash src/app/api
  fi
}
trap cleanup EXIT

export GITHUB_PAGES=true
export NEXT_PUBLIC_GITHUB_PAGES=true

npx prisma generate
npx prisma migrate deploy
npm run seed:demo
next build
