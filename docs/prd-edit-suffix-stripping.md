# PRD: Strip `-edit-` Suffix from Uploaded Filenames

## Overview

When atlas developers download a file (e.g., `pizza-r2-wip-1.h5ad`), edit it locally, and re-upload it, their tools may append an edit timestamp or annotation to the filename (e.g., `pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad`). The tracker needs to recognize this as the same concept (`pizza.h5ad`) and assign it the next WIP number (`pizza-r2-wip-2.h5ad`).

## Problem

The tracker's `getFileBaseName` function (`app/utils/files.ts`) strips `-r{N}` and `-r{N}-wip-{N}` suffixes to resolve concept identity. It does not handle `-edit-*` suffixes, so a file uploaded as `pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad` would be treated as a new concept rather than a new version of `pizza.h5ad`.

## Design Decisions

### Strip in tracker, not in sync tool

We considered stripping the `-edit-` suffix in the sync tool before upload (so S3 only ever has clean names). We chose to strip in the tracker instead because:

- **Ingest bucket preserves exactly what was uploaded** — no renaming, no ambiguity about what the user actually provided
- **Egress bucket gets clean names anyway** — files are copied to the egress bucket for distribution and can be renamed to the concept name at that point
- **No sync tool changes required** — the fix is a single regex change in the tracker
- **No user workflow changes** — users upload whatever they have; the tracker handles it

### Convention: `-edit-` as the marker

The `-edit-` substring marks the boundary between the meaningful filename and the disposable annotation. Everything from `-edit-` to the file extension is stripped. What follows `-edit-` is not validated — it could be a timestamp, a description, or nothing meaningful.

Examples:

- `pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad` → concept: `pizza.h5ad`
- `pizza-r2-wip-1-edit-fixed-normalization.h5ad` → concept: `pizza.h5ad`
- `pizza-edit-v2.h5ad` → concept: `pizza.h5ad`

## Solution

Extend the regex in `getFileBaseName` to also strip `-edit-*` suffixes.

### Current behavior

```
getFileBaseName("pizza-r2-wip-1.h5ad")        → "pizza.h5ad"
getFileBaseName("pizza-r2.h5ad")               → "pizza.h5ad"
```

### New behavior

All existing behavior preserved, plus:

```
getFileBaseName("pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad") → "pizza.h5ad"
getFileBaseName("pizza-r2-edit-2026-03-15-22-12-01.h5ad")        → "pizza.h5ad"
getFileBaseName("pizza-edit-2026-03-15-22-12-01.h5ad")           → "pizza.h5ad"
getFileBaseName("pizza-edit-whatever.h5ad")                       → "pizza.h5ad"
```

### Scope of change

- **`app/utils/files.ts`** — update `getFileBaseName` regex
- **Tests** — add test cases for `-edit-*` variants

No database changes, no migration, no API changes, no sync tool changes.

## User-Facing Workflow

1. Developer downloads `pizza-r2-wip-1.h5ad`
2. Edits it locally (tool may rename to `pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad`)
3. Uploads via sync tool — file lands in S3 with the edited name
4. Tracker receives SNS notification, strips `-r2-wip-1-edit-2026-03-15-22-12-01`, resolves concept as `pizza.h5ad`
5. Assigns `pizza-r2-wip-2.h5ad` as the new version
6. When published to egress bucket, file is copied with the clean concept-based name
