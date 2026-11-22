#!/bin/bash
# Changed-line coverage: fails when the lines changed against origin/$BASE
# (main if unset) are less than 80% covered. CI calls this too. diff-cover and
# its dependencies are pinned in pyproject.toml and uv.lock.
#
# It reads whatever coverage/cobertura-coverage.xml the last
# `npm run test:coverage` wrote, so a run of only some tests
# (`npm run test:coverage -- <file>`) gives partial data. A local run counts
# staged, unstaged and untracked changes as well as commits.
set -euo pipefail

# --isolated keeps uv from creating a .venv in the checkout.
uv run --locked --isolated diff-cover coverage/cobertura-coverage.xml \
  --compare-branch "origin/${BASE:-main}" --include-untracked --fail-under 80 \
  --format "markdown:${GITHUB_STEP_SUMMARY:-/dev/null}"
