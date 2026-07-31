# React Query conventions

Shared setup for data fetching lives here: `queryClient.ts` (the client and
`DEFAULT_QUERY_OPTIONS`) and `queryFn.ts` (the generic fetch wrapper). Per-entity
hooks live next to their view/hook under `UseFetchX/query/`.

## `staleTime`

The default `staleTime` is **5 minutes** (`DEFAULT_QUERY_OPTIONS` in
`queryClient.ts`). Individual hooks override it based on how their data changes:

- **`staleTime: 0` — data that changes out-of-band.** Lists and summaries whose
  contents can change without a mutation the client made (uploads, server-side
  validation, Sync, cross-entity effects): e.g. `ATLASES`, `SOURCE_DATASETS`,
  `INTEGRATED_OBJECTS`, `ATLAS_STATUS`, `METADATA_CORRECTNESS`,
  `ENTRY_SHEET_VALIDATION(S)`. These remount on navigation, so `staleTime: 0`
  makes them refetch on mount — covering staleness from navigating away and
  back without any mutation-site invalidation. This only fires on **mount**,
  though: a mutation that changes such a list _while it stays mounted_ (an
  in-place edit / delete / archive with no navigation) must still
  `invalidateQueries` the key, because `staleTime: 0` alone won't refetch
  without a remount.

- **Default (5 min) + invalidate at mutation sites — detail hooks feeding edit
  forms.** `ATLAS`, `INTEGRATED_OBJECT`, `SOURCE_DATASET`, `SOURCE_STUDY`,
  `USER`. Their edit forms submit via `fetchResource` (bypassing React Query)
  and redirect to self, so the detail view stays mounted across the save and a
  mount-refetch never fires. The mutation site must therefore explicitly
  `setQueryData` (when the response matches the cached shape) or
  `invalidateQueries` the detail key, otherwise the view and the re-initialized
  form serve pre-edit data within the 5-minute window.

**Rule of thumb — two independent axes.** `staleTime: 0` handles staleness across
a **remount** (navigate away and back → refetch on mount). **Invalidation**
handles staleness **while a query stays mounted** — an in-place edit / delete /
archive, or a detail whose edit form redirects to self — where no remount fires
to trigger a refetch. So a `staleTime: 0` list still needs invalidation when it's
mutated in place; you just don't invalidate it merely to cover navigation (the
mount refetch already does).

## Invalidate vs. `setQueryData`

At a mutation site, prefer `setQueryData(key, response)` when the mutation
response is the same shape as the cached value (no refetch needed); otherwise
`invalidateQueries({ queryKey })` to refetch server truth.

## Query keys

Keys are atlas-scoped and must encode **every** input the request URL depends on
(e.g. `[SOURCE_DATASETS, atlasId, archived]`) so two different requests never
collide on one cache entry. Two hooks hitting the same endpoint with different
parameters (e.g. an archived-scoped list vs. an unscoped pool) correctly use
different keys.
