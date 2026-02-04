# ADR: Standardize Jest PostgreSQL pool lifecycle (lazy singleton, explicit release, orderly shutdown)

- Status: Accepted
- Date: 2025-08-29
- Owners: Atlas Tracker Team

## Context

Intermittent test instability arose from PostgreSQL connections not being closed predictably:

- Multiple code paths implicitly created `pg.Pool` instances during imports.
- Some tests left clients checked out or created work during teardown, leading to open handles and port exhaustion.
- Jest occasionally reported lingering handles and late logs.

We need a deterministic, centralized lifecycle for the database pool during tests.

## Decision Drivers

- Deterministic test setup/teardown with no open handles.
- Minimal changes to production code path.
- Simple usage for tests (helpers + clear patterns).

## Considered Options

1. Ad-hoc: keep creating pools in tests and rely on higher Jest timeouts/`--detectOpenHandles` to identify leaks

- Pros: No refactor.
- Cons: Flaky, hard to maintain; leaks persist.

2. Pool-per-test or pool-per-suite

- Pros: Isolation.
- Cons: Heavyweight, slower test runs; more moving parts to close correctly.

3. Single lazy-initialized pool with explicit client release and orderly shutdown (selected)

- Pros: Predictable; minimal overhead; easy to reason about.
- Cons: Requires test discipline to avoid holding long-lived clients.

## Decision

Adopt a lazy singleton `pg.Pool` in application code and standardize Jest setup/teardown to ensure:

- Clients are explicitly released after use.
- We wait for all clients to release before closing the pool.
- The global pool is properly ended once per test session.

## Implementation

- `app/services/database.ts`
  - Lazy singleton pool in `getPool()`.
  - `getPoolClient()` to acquire a client.
  - `doTransaction()` wrapper to automatically `BEGIN`/`COMMIT`/`ROLLBACK` and `client.release()` in `finally`.
  - `endPgPool()` sets the module-level `pool` to `null` first, then awaits `p.end()` to finish closing connections.

- `testing/setup.ts`
  - Registered via Jest `setupFilesAfterEnv`.
  - `afterAll(async () => { const { endPgPool } = await import("../app/services/database"); await endPgPool(); });`
  - Ensures the pool is closed exactly once after the entire test run.

- `testing/db-utils.ts`
  - `resetDatabase()` calls `await endPgPool()` up front to guarantee a clean slate before acquiring a fresh client for migrations/seeding.
  - All direct client usage calls `client.release()` in `finally`.

## Consequences

Positive:

- Eliminates lingering DB handles after tests; fewer Jest hangs and late logs.
- Centralized pattern for DB access in tests (either `doTransaction()` or `getPoolClient()` with explicit `release()`).
- Production behavior remains unchanged; app still uses one pool.

Negative:

- Tests must avoid holding onto a client across tests/suites.
- If a test spawns async DB work that outlives the test, it must be awaited or canceled.

## Usage Guidance (Tests)

- Prefer `doTransaction(async client => { ... })` for sequences of queries.
- If calling `getPoolClient()`, always `client.release()` in a `finally` block.
- Use `resetDatabase()` to reinitialize schema/fixtures; it will safely end any existing pool beforehand.
- Do not instantiate `pg.Pool` directly in tests.

## Verification

- Test runs with `jest --runInBand` and `--detectOpenHandles` complete cleanly.
- No open-handle warnings; DB connections are closed at the end of the run.

## Future Considerations

- If we introduce parallel test workers with heavy DB usage, reassess whether a shared pool remains optimal.
- For containerized DBs, the same lifecycle applies; ensure container teardown happens after pool shutdown.
