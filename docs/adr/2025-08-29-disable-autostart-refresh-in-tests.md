# ADR: Disable auto-start refresh in tests

- Status: Accepted
- Date: 2025-08-29
- Owners: Atlas Tracker Team

## Context

Background refresh logic created by `makeRefreshService()` auto-started a refresh on initialization when no cached data existed. In tests, importing services caused background HTTP requests and asynchronous logs to continue after tests finished, leading to warnings like "Cannot log after tests are done" and potential open handles.

Goals:

- Eliminate late logging and open handles in tests.
- Keep production/development behavior unchanged.
- Make refresh triggering explicit and deterministic in tests.

### Why this surfaced now

Even though external HTTP was mocked in tests, import/mocking order likely allowed the real refresh services to initialize before mocks in some cases, which triggered the auto-start background refresh. This appears to be a change in test ordering or runner behavior in this feature branch versus `main`, exposing a latent ordering dependency that wasn’t previously visible.

## Decision Drivers

- Deterministic, side-effect-free test startup (no work on import).
- Clear separation between test, dev, and prod behaviors.
- Minimal surface area change to production code.
- ESLint/TypeScript compatibility and simplicity.

## Considered Options

1. Suppress or stub logs in tests (e.g., spy on `console`).

   - Pros: Quick to implement.
   - Cons: Hides symptoms, not the cause. Background work still runs; risks open handles.

2. Disable auto-start refresh in tests via a flag on the refresh service (selected).

   - Pros: Structural fix, prevents background work on import; clean and explicit tests.
   - Cons: Tests that assumed auto-start must be updated to trigger refresh explicitly and use relative call counts.

3. Rely on stricter test import/mocking order to prevent real services from starting.
   - Pros: No production code change.
   - Cons: Fragile and implicit; easy to regress with refactors.

## Decision

Add an optional `autoStart?: boolean` to `RefreshServiceParams` and gate the initial auto-start refresh behind it. In app services, pass `autoStart: process.env.NODE_ENV !== "test"` so that tests do not auto-start, while dev/prod continue to auto-start.

## Consequences

Positive:

- No background refreshes start during tests; no late logs or open handles.
- Tests become explicit and deterministic (refreshes triggered via `force...Refresh()` functions).
- Production behavior unchanged.

Negative:

- Tests that relied on auto-start needed updates:
  - Use explicit `forceProjectsRefresh()` and `forceCellxGeneRefresh()`.
  - Assert relative call increments instead of absolute totals that assumed an initial auto-start.
  - Initial `previousOutcome` in status is `NA` until the first refresh completes.
- Accessing data getters before initialization can throw `RefreshDataNotReadyError` by design; tests should avoid this pattern and trigger refresh first.

## Implementation

Changed:

- `app/services/common/refresh-service.ts`
  - Added `autoStart?: boolean` to `RefreshServiceParams`.
  - Only auto-start the initial refresh when `autoStart !== false`.
- `app/services/cellxgene.ts`
  - Pass `autoStart: process.env.NODE_ENV !== "test"` into `makeRefreshService()`.
  - Kept object keys sorted to satisfy ESLint.
- `app/services/hca-projects.ts`
  - Pass `autoStart: process.env.NODE_ENV !== "test"` into `makeRefreshService()`.
  - Kept object keys sorted to satisfy ESLint.

Tests updated (examples):

- `__tests__/revalidate-on-refresh.test.ts`
  - Avoid getters before initialization; trigger refresh via `force...Refresh()`; expect validations only after both refreshes complete.
- `__tests__/api-refresh.test.ts`
  - Initial GET returns `previousOutcome: "NA"` for both services.
  - Start from zero call counts; assert relative increments after explicit POST or refresh calls.

Verification:

- Full test suite passes with `jest --detectOpenHandles`.
- No late logging after tests complete.

## How to use in tests

- Trigger refreshes explicitly:
  - `hcaService.forceProjectsRefresh()`
  - `cellxgeneService.forceCellxGeneRefresh()`
- Avoid accessing data getters before a refresh initializes state.
- Expect initial refresh status to have `previousOutcome: NA` until a refresh completes.

## Alternatives / Future Considerations

- If a specific test needs auto-start semantics, consider temporarily passing `autoStart: true` via a dedicated test harness or environment override, though this is discouraged for determinism.
- A small test helper could encapsulate “start both refreshes and await completion” to reduce duplication.

## References

- Updated files: `app/services/common/refresh-service.ts`, `app/services/cellxgene.ts`, `app/services/hca-projects.ts`.
- Updated tests: `__tests__/revalidate-on-refresh.test.ts`, `__tests__/api-refresh.test.ts`.
