# Ticket: Strip `-edit-` Suffix from Uploaded Filenames

## Summary

Extend `getFileBaseName` to strip `-edit-*` suffixes from uploaded filenames so that edited re-uploads resolve to the correct concept and receive the next WIP number.

## Motivation

Atlas developers download files like `pizza-r2-wip-1.h5ad`, edit them locally, and re-upload. Some tools append edit annotations to the filename (e.g., `pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad`). Currently the tracker treats this as a new concept instead of recognizing it as a new version of `pizza.h5ad`.

The ingest bucket should preserve the exact uploaded filename. The tracker strips suffixes to resolve concept identity, and the egress bucket receives clean names on copy.

See `docs/prd-edit-suffix-stripping.md` for full design rationale.

## Implementation Plan

### 1. Update `getFileBaseName` regex

**File:** `app/utils/files.ts` (line 118-120)

Current regex:

```
/-r\d+(?:-wip-\d+)?(?=\..+$)/
```

New regex must handle all combinations:

- `-r1` (existing)
- `-r1-wip-2` (existing)
- `-r1-edit-*` (new)
- `-r1-wip-2-edit-*` (new)
- `-edit-*` standalone (new)

Use alternation to require at least one group matches:

```
/(?:-r\d+(?:-wip-\d+)?(?:-edit-[^.]+)?|-edit-[^.]+)(?=\..+$)/
```

Note: `-edit-` content is not validated — `[^.]+` captures everything up to the file extension.

### 2. Add test cases

**File:** `__tests__/api-sns-with-s3-event.test.ts` (or a new unit test file for `getFileBaseName`)

Add cases:
| Input | Expected |
|---|---|
| `pizza-r2-wip-1-edit-2026-03-15-22-12-01.h5ad` | `pizza.h5ad` |
| `pizza-r2-edit-2026-03-15-22-12-01.h5ad` | `pizza.h5ad` |
| `pizza-edit-2026-03-15-22-12-01.h5ad` | `pizza.h5ad` |
| `pizza-edit-whatever.h5ad` | `pizza.h5ad` |
| `pizza-r1-wip-3-edit-fixed-normalization.h5ad` | `pizza.h5ad` |
| `pizza-r2-wip-1.h5ad` | `pizza.h5ad` (existing, unchanged) |
| `pizza-r1.h5ad` | `pizza.h5ad` (existing, unchanged) |
| `pizza.h5ad` | `pizza.h5ad` (existing, unchanged) |

### 3. Run tests

```bash
npm run test
npm run lint
npm run check-format
```

## Files Affected

- `app/utils/files.ts` — regex change in `getFileBaseName`
- Test file(s) — new test cases

No database changes, no migration, no API changes, no sync tool changes.
