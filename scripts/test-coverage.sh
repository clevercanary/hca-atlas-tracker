#!/bin/bash
# Runs the Jest suite with coverage, as CI does, and exits non-zero on a failed
# test or on coverage below the floors in jest.config.js. Prints the coverage
# table and totals, and appends them to the CI step summary when there is one
# and every test passed. Extra arguments go to Jest; the floors are global, so
# a run of only some tests fails them.
set -uo pipefail

results=coverage/jest-results.json
xml=coverage/cobertura-coverage.xml
table=coverage/coverage-table.txt
totals=coverage/coverage-summary.txt

# Jest never empties coverage/, so a run that dies early must not leave the
# previous run's reports looking current.
rm -f "$results" "$xml" "$table" "$totals"

npm test -- --coverage --json --outputFile="$results" "$@"
status=$?

cat "$table" "$totals"

# A failed test leaves partial coverage: drop the XML, so diff-cover skips, and
# keep the numbers out of the step summary. A missing or unreadable results
# file counts as a failure.
failed=$(node -p "require('./$results').numFailedTestSuites")
if [ "$failed" != 0 ]; then
  rm -f "$xml"
  exit $((status == 0 ? 1 : status))
fi

{
  echo "### Unit test coverage"
  echo
  echo '```'
  cat "$totals"
  echo '```'
  echo
  echo "<details><summary>Per-file coverage</summary>"
  echo
  echo '```'
  cat "$table"
  echo '```'
  echo
  echo "</details>"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

exit $status
