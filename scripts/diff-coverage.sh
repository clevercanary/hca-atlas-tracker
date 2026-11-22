#!/bin/bash
# Changed-line coverage, run after `npm run test:coverage`: fails when the lines
# changed against origin/$BASE (main if unset) are less than 80% covered. CI
# calls this too. diff-cover's version is always the DIFF_COVER_VERSION pin in
# the CI workflow, so local runs and CI use the same one.
set -euo pipefail

workflow=.github/workflows/run-checks.yml
version=$(sed -nE 's/^  DIFF_COVER_VERSION: "([^"]+)"$/\1/p' "$workflow")
if [ -z "$version" ]; then
  echo "error: no DIFF_COVER_VERSION pin found in $workflow" >&2
  exit 1
fi
if [ -n "${DIFF_COVER_VERSION:-}" ] && [ "$DIFF_COVER_VERSION" != "$version" ]; then
  echo "error: DIFF_COVER_VERSION=$DIFF_COVER_VERSION differs from the pin $version in $workflow" >&2
  exit 1
fi

uvx "diff-cover@$version" coverage/cobertura-coverage.xml \
  --compare-branch "origin/${BASE:-main}" --include-untracked --fail-under 80 \
  --format "markdown:${GITHUB_STEP_SUMMARY:-/dev/null}"
