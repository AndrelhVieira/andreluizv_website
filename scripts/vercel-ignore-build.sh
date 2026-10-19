#!/usr/bin/env bash
# Vercel "Ignored Build Step" for both projects in this repo.
# Exit 0 = skip the build, exit 1 = build.
#
# The working directory is the project's Root Directory: the repo root for the site,
# apps/api for the content API. Each project only rebuilds when its own inputs change.
set -u

# Changes are verified locally, so pushes to PR branches don't build previews. For one on
# demand: vercel deploy --build-env FORCE_PREVIEW=1 (add --cwd apps/api for the API).
if [ "${VERCEL_ENV:-}" = "preview" ] && [ "${FORCE_PREVIEW:-}" != "1" ]; then
  echo "Preview builds are off (set FORCE_PREVIEW=1 to build one), skipping."
  exit 0
fi

prefix=$(git rev-parse --show-prefix)
cd "$(git rev-parse --show-toplevel)" || exit 1

base=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
if ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  echo "Base commit ${base} not available, building."
  exit 1
fi

# A redeploy reuses the same commit, usually to apply new environment variables,
# which never show up in a git diff. Always build in that case.
if [ "$(git rev-parse "${base}^{commit}")" = "$(git rev-parse HEAD)" ]; then
  echo "Same commit as the previous deployment (redeploy), building."
  exit 1
fi

if [ "$prefix" = "apps/api/" ]; then
  project="content API"
  paths=(apps/api packages/shared package.json yarn.lock .yarnrc.yml)
else
  project="site"
  paths=(. ':(exclude)apps/api')
fi

# Every push to main gets a "chore(release): vX.Y.Z" commit from .github/workflows/release.yml.
# The site deploys that commit to production, so the footer shows the released version;
# the merge commit before it would only ship the old version and be replaced seconds later.
is_release=false
case "$(git log -1 --format=%s HEAD)" in
  "chore(release):"*) is_release=true ;;
esac

if [ "$project" = "site" ] && [ "${VERCEL_ENV:-}" = "production" ] && [ "$is_release" = false ]; then
  echo "Production site builds wait for the release commit, skipping."
  exit 0
fi

# The API doesn't show the version: skip a release whose only change is the version line
if [ "$project" = "content API" ] && [ "$is_release" = true ]; then
  other_changes=$(git diff -U0 "$base" HEAD -- "${paths[@]}" | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) ' | grep -vE '^[+-]  "version": ')
  if [ -z "$other_changes" ]; then
    echo "Release commit only bumps the version, skipping the content API."
    exit 0
  fi
fi

if git diff --quiet "$base" HEAD -- "${paths[@]}"; then
  echo "No ${project} changes since ${base}, skipping build."
  exit 0
fi
echo "${project} changed since ${base}, building."
exit 1
