# ADR: Enforce required eventTime and is_latest determination by recency with idempotency

- Status: Accepted
- Date: 2025-08-31

## Context

We ingest S3 object notifications via SNS into the HCA Atlas Tracker (S3 → SNS → Next.js HTTP endpoint). The file versioning flow relies on:

- A strict event structure for S3 records (Yup schemas in `app/apis/catalog/hca-atlas-tracker/aws/schemas.ts`).
- Recency logic to set `is_latest` based on `eventTime` from the S3 record.
- Idempotent processing keyed by the SNS `MessageId` (unique on `hat.files.sns_message_id`).

Issues observed/risks:

- If `eventTime` is missing, the recency comparison may be ill-defined, risking incorrect `is_latest` updates.
- We need an explicit guarantee that such requests are rejected, with no persistence side-effects.

## Decision

1. Require `eventTime` in every S3 record.
   - Validation is enforced by Yup in `s3RecordSchema` (field `eventTime: string().required()`).
   - The API handler (`pages/api/sns.ts`) validates the entire SNS message and returns `400 Bad Request` for validation errors (via `respondValidationError()` in `app/utils/api-handler.ts`).

2. Determine `is_latest` strictly by `eventTime` recency.
   - `saveFileRecord()` in `app/services/s3-notification.ts` compares incoming `eventTime` (ISO 8601) lexicographically against the current latest record’s `eventTime`.
   - If newer, it marks previous versions `is_latest=false` and inserts the new row with `is_latest=true` atomically within a transaction.
   - If older or equal, it leaves the current latest unchanged (prevents flipping when older events arrive later/out-of-order).

3. Preserve idempotency using SNS `MessageId`.
   - Database enforces uniqueness on `hat.files.sns_message_id`.
   - `upsertFileRecord()` uses `ON CONFLICT (sns_message_id)` to ensure duplicate notifications do not create additional rows and that ETag mismatches on replays are detected and rejected.

## Rationale

- Ensuring `eventTime` is present eliminates ambiguity in recency computation for `is_latest` and removes a class of subtle ordering bugs.
- ISO 8601 timestamps sort correctly by string comparison, allowing a simple and efficient recency check without parsing.
- Idempotency at the SNS message level is robust and prevents duplicate processing in transient failure scenarios.

## Alternatives Considered

- Accept missing `eventTime` and treat as oldest (always `is_latest=false`).
  - Rejected: silently diverges from producer expectations and hides data issues.

- Accept missing `eventTime` and treat as now (always newest).
  - Rejected: would incorrectly flip `is_latest` and mask producer defects.

- Add service-level fallback (defaulting to empty string or a sentinel).
  - Rejected: validation is the appropriate boundary; fallbacks complicate reasoning and testing.

## Consequences

- Requests with missing `eventTime` get a `400 Bad Request` and do not persist any data.
- Recency and `is_latest` behavior remains predictable even with out-of-order deliveries.
- Stronger reliance on producers to provide ISO 8601 `eventTime`.

## Implementation Notes

- Schema: `app/apis/catalog/hca-atlas-tracker/aws/schemas.ts` (`s3RecordSchema` requires `eventTime`).
- API handler: `pages/api/sns.ts` → validates SNS message and signature, maps validation errors to `400` via `app/utils/api-handler.ts`.
- Service: `app/services/s3-notification.ts` → `saveFileRecord()` compares `eventTime` lexicographically and updates `is_latest` atomically.
- Idempotency: `app/data/files.ts` uses `ON CONFLICT (sns_message_id)` and enforces ETag consistency.

## Testing

- New test added: `__tests__/api-files-s3-notification.test.ts` → "rejects S3 record when eventTime is missing".
  - Expects HTTP 400 and verifies no database writes for the file key.
- Existing tests confirm:
  - Out-of-order version arrivals do not flip `is_latest`.
  - Idempotent handling via SNS `MessageId`.
  - ETag mismatch detection on replays.

## Monitoring & Ops

- Validation and operational errors are logged via `console.error` for centralized monitoring.
- No migration required; uses existing schema and idempotency column/constraint.

## References

- `app/apis/catalog/hca-atlas-tracker/aws/schemas.ts`
- `pages/api/sns.ts`
- `app/services/s3-notification.ts`
- `app/data/files.ts`
- `__tests__/api-files-s3-notification.test.ts`
