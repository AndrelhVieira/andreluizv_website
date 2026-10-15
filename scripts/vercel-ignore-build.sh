#!/usr/bin/env bash
# Vercel "Ignored Build Step" for both projects in this repo.
# Exit 0 = skip the build, exit 1 = build.
#
# The working directory is the project's Root Directory: the repo root for the site,
# apps/api for the content API. Each project only rebuilds when its own inputs change.
set -u

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

if git diff --quiet "$base" HEAD -- "${paths[@]}"; then
  echo "No ${project} changes since ${base}, skipping build."
  exit 0
fi
echo "${project} changed since ${base}, building."
exit 1
