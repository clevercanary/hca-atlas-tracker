# ADR: ETag mismatch includes existing ETag via data-layer propagation

- Status: Accepted
- Date: 2025-09-01

## Context

S3 notifications can arrive out-of-order or be replayed. We persist file records keyed by `(bucket, key, version_id)` and rely on ETag to ensure integrity. When a notification arrives with the samem notification ID buta different ETag than the stored record, we must:

- Return HTTP 409 Conflict (to trigger SNS retry/ DLQ depending on delivery policy).
- Provide an actionable error that includes both the existing and the new ETag.
- Avoid extra database reads in the service layer for performance and simplicity.

Relevant code paths:

- `app/data/files.ts` → `upsertFileRecord()`
- `app/services/s3-notification.ts` → `saveFileRecord()` (propagates error)
- `app/apis/catalog/hca-atlas-tracker/aws/errors.ts` → `ETagMismatchError`

## Decision

- Detect ETag mismatches in the data layer and throw `ETagMismatchError(existingETag, newETag)` directly.
- Service layer propagates the error; keep centralized mapping of `ETagMismatchError` to HTTP 409.

## Details

- `upsertFileRecord()` throws `ETagMismatchError(bucket, key, versionId, existingETag, newETag)` when a different ETag is detected for the same `(bucket, key, version_id)`.
  - The error includes both the existing and new ETags for actionability.
  - No additional service-layer database reads are required.
- `saveFileRecord()` does not construct the error; it allows the data-layer error to bubble up to the API layer where it is mapped to HTTP 409.

## Consequences

- Pros:
  - No extra read in service layer; data layer provides the needed `existingETag`.
  - Clear, actionable 409 errors including both ETag values.
  - Maintains idempotency behavior for duplicate notifications.
- Cons / Risks:
  - No broader input type introduced; only `isLatest?` remains optional (defaults to true).
  - Error surface area is more detailed; ensure logs don’t leak sensitive data (ETag is safe).

## Alternatives Considered

- Service-layer re-read to obtain existing ETag on mismatch: rejected due to extra DB round-trip and potential race.
- Returning a null/signal from the data layer and having the service throw: rejected. Throwing in the data layer is clearer, more atomic, and avoids divergent handling paths.

## Testing & Linting

- `__tests__/data-files.test.ts` asserts that `upsertFileRecord()` throws `ETagMismatchError` including both ETags.
- `__tests__/api-files-s3-notification.test.ts` asserts HTTP 409 and error message content from the API path.
- Type & lint fixes applied across the touched modules.

## Rollout & Backwards Compatibility

- Callers of `upsertFileRecord()` must handle `ETagMismatchError`. Internally, service and tests have been updated accordingly.
- Error messages are more descriptive; HTTP status unchanged (409 for mismatches).
