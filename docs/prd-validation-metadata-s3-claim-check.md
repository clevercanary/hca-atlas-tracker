# PRD: Validation Metadata via S3 Claim Check

## Overview

The batch validator currently sends validation results back to the tracker via a single SNS message (≤256 KiB). This works for validation pass/fail and basic metadata (title, assay, tissue, disease, cell/gene counts), but is insufficient for richer per-sample metadata that can easily reach megabytes for datasets with thousands of samples.

This document describes a change to the result delivery mechanism: the validator writes full metadata to S3 and sends an SNS notification. The tracker derives the S3 key from fields already in the SNS message (`file_id` + `batch_job_id`), fetches the full metadata from S3, saves it to the database, and deletes the S3 object. The transition is incremental — see [Rollout Phases](#rollout-phases).

## Problem

- SNS has a hard 256 KiB message size limit
- The validator already implements truncation logic (`to_length_limited_json`) to fit within this limit
- Per-sample metadata (e.g., cell-level annotations, sample-level metadata summaries) can be orders of magnitude larger
- There is no way to surface this richer metadata in the tracker UI without a larger transport mechanism

## Solution: S3 Claim Check Pattern

Use a dedicated validation-results bucket as the S3 claim-check store. The data bucket remains versioned and stores protected source data. The validation-results bucket is non-versioned and stores transient validation result payloads that are deleted after successful database persistence and can be regenerated if lost.

The validator writes full results to S3 at a deterministic key (`validation-metadata/{file_id}/{batch_job_id}.json`) in the validation-results bucket, then sends an SNS message. The tracker derives the S3 key from `file_id` + `batch_job_id` in the message, fetches the full payload from S3, writes it to the database, commits, and then deletes the S3 object.

### Current Flow

```
Batch Job → build results JSON (≤250KB, truncate if needed)
          → SNS publish to validation-results topic
          → Tracker /api/sns receives message
          → writes to hat.files (dataset_info, validation_reports, etc.)
```

### New Flow (final state after all rollout phases)

```
Batch Job → build full results JSON (unlimited size)
          → write to S3: s3://{validation-results-bucket}/validation-metadata/{file_id}/{batch_job_id}.json
          → SNS publish (lightweight pointer message: file_id, batch_job_id, status, timestamp, source bucket/key)
          → Tracker /api/sns receives message
          → derive validation-results bucket from AWS_VALIDATION_RESULTS_BUCKET env var
          → derive S3 key from file_id + batch_job_id
          → fetch object
          → parse JSON
          → validate schema
          → write results to DB
          → commit
          → delete S3 object
```

## Infrastructure Changes

### S3: Dedicated Validation-Results Bucket

Create a new bucket per environment, separate from the data bucket:

- `hca-atlas-tracker-validation-results-dev`
- `hca-atlas-tracker-validation-results`

Object key layout:

```
s3://{validation-results-bucket}/validation-metadata/{file_id}/{batch_job_id}.json
```

**Bucket properties:**

- **Non-versioned** — payloads are transient and regenerable
- **Private** — block all public access
- **Encrypted** — SSE-S3 (or SSE-KMS) at rest
- **Lifecycle-managed** — expire any object older than 7 days as a backstop against orphans (primary cleanup is the tracker delete after DB commit)
- **Tightly scoped IAM** — only the Batch task role (write) and tracker app role (read+delete) have access

**Why a separate bucket (not the data bucket):**

- The data bucket is versioned and holds protected source data; mixing in transient claim-check payloads complicates retention, cost, and blast radius.
- A dedicated bucket lets us safely apply a lifecycle rule without any risk of expiring real data files.
- Clear separation of concerns: data bucket = durable source data; validation-results bucket = transient handoff payloads.

### IAM: Batch Task Role — Add S3 Write

The Batch task role (`validator-batch/iam.tf`) currently has read-only access to the data bucket. Add write access scoped to the `validation-metadata/` prefix on the **validation-results bucket**:

```hcl
{
  Sid    = "WriteValidationMetadata"
  Effect = "Allow"
  Action = ["s3:PutObject"]
  Resource = "arn:aws:s3:::${var.validation_results_bucket_name}/validation-metadata/*"
}
```

### IAM: App Runner Task Role — Add S3 Read and Delete

The app runner task role (`app-runner/main.tf`) needs permissions to fetch and clean up validation metadata on the validation-results bucket. (Note: the app currently relies on implicit permissions for S3 presigned URLs and Batch job submission — those should also be formalized, but that is out of scope for this PRD.)

```hcl
{
  Sid    = "ReadDeleteValidationMetadata"
  Effect = "Allow"
  Action = [
    "s3:GetObject",
    "s3:DeleteObject"
  ]
  Resource = "arn:aws:s3:::${var.validation_results_bucket_name}/validation-metadata/*"
}
```

The data bucket IAM policy is unchanged — no new permissions there.

### Environment Variables

Both the validator and the tracker need the validation-results bucket name in addition to the data bucket name. Following the existing repo convention, tracker/app env vars use the `AWS_*` prefix; the names forwarded into the validator container are unprefixed.

Tracker / App Runner environment (read by `app/services/validator-batch.ts` and `app/services/validation-results-notification.ts`):

```
AWS_DATA_BUCKET=hca-atlas-tracker-data-dev
AWS_VALIDATION_RESULTS_BUCKET=hca-atlas-tracker-validation-results-dev
```

Validator container environment (set by the tracker when submitting the Batch job; matches the names the validator already reads):

```
S3_BUCKET=hca-atlas-tracker-data-dev
VALIDATION_RESULTS_BUCKET=hca-atlas-tracker-validation-results-dev
```

The validator reads the source file from `S3_BUCKET` and writes the claim-check payload to `VALIDATION_RESULTS_BUCKET`. The tracker resolves the claim-check bucket from `AWS_VALIDATION_RESULTS_BUCKET` (it does **not** read the bucket from the SNS message — the SNS `bucket` field still refers to the original data bucket).

### SNS: No Changes

The existing validation-results SNS topic and subscription are reused. The SNS message format is unchanged during the initial rollout phases; it only slims down in Phase 5.

The claim-check bucket is **not** carried in the SNS message. The `bucket` field already refers to the original data bucket (where the source file lives). The tracker resolves the claim-check bucket from the `AWS_VALIDATION_RESULTS_BUCKET` env var.

## Validator Changes (hca-validation-tools)

### Updated Result Publishing

In `services/dataset-validator/main.py`, after validation completes:

1. Build the full results JSON (same structure as today, plus new per-sample metadata fields)
2. Try: write to S3: `s3://{validation-results-bucket}/validation-metadata/{file_id}/{batch_job_id}.json` (log success/failure)
3. Always: publish the full inline SNS message as today (unchanged during Phases 2-4)

In Phase 5, the SNS message slims down to a lightweight notification:

```json
{
  "file_id": "uuid",
  "status": "success",
  "timestamp": "2025-01-01T00:00:00Z",
  "bucket": "hca-atlas-tracker-data-dev",
  "key": "s3-key-of-original-file",
  "batch_job_id": "abc123"
}
```

No explicit S3 bucket or key field is needed for the claim check. The `bucket` field still refers to the original data bucket (where the source file lives). The tracker resolves the claim-check bucket from the `AWS_VALIDATION_RESULTS_BUCKET` env var, and constructs the S3 key deterministically from fields already present in the message: `validation-metadata/{file_id}/{batch_job_id}.json`.

### S3 Object Structure

The JSON written to S3 contains the full validation results. This is the same structure as the current SNS message body, extended with additional metadata fields:

```json
{
  "file_id": "uuid",
  "status": "success",
  "timestamp": "2025-01-01T00:00:00Z",
  "bucket": "hca-atlas-tracker-data-dev",
  "key": "network/atlas/source-datasets/file.h5ad",
  "batch_job_id": "abc123",
  "batch_job_name": "job-name",

  "downloaded_sha256": "abc...",
  "source_sha256": "def...",
  "integrity_status": "valid",

  "metadata_summary": {
    "title": "My Dataset",
    "assay": ["10x 3' v3"],
    "suspension_type": ["cell"],
    "tissue": ["lung"],
    "disease": ["normal"],
    "cell_count": 50000,
    "gene_count": 33000
  },

  "tool_reports": {
    "cap": {
      "valid": true,
      "errors": [],
      "warnings": [],
      "started_at": "...",
      "finished_at": "..."
    },
    "cellxgene": {
      "valid": false,
      "errors": ["..."],
      "warnings": ["..."],
      "started_at": "...",
      "finished_at": "..."
    },
    "hcaSchema": {
      "valid": true,
      "errors": [],
      "warnings": [],
      "started_at": "...",
      "finished_at": "..."
    }
  },

  "sample_metadata": [
    {
      "sample_id": "sample_1",
      "donor_id": "donor_1",
      "tissue": "lung",
      "disease": "normal",
      "assay": "10x 3' v3",
      "suspension_type": "cell",
      "cell_count": 5000
    }
  ]
}
```

The `sample_metadata` field is new — its exact schema will be determined during implementation based on what metadata is available in H5AD obs and what is useful to display in the tracker UI.

### Truncation Logic

The existing `to_length_limited_json()` truncation logic remains in place during rollout (the full SNS message is still sent). It can be removed in Phase 5 when the validator stops sending inline results.

### Environment Variables

The validator already receives the data bucket as `S3_BUCKET` in the Batch container environment (forwarded by the tracker from its own `AWS_DATA_BUCKET`). Add a new container variable `VALIDATION_RESULTS_BUCKET` for the claim-check bucket (forwarded from the tracker's `AWS_VALIDATION_RESULTS_BUCKET`). The validator reads the source file from `S3_BUCKET` and writes the claim-check payload to `VALIDATION_RESULTS_BUCKET`.

### Backward Compatibility

During rollout, the validator sends **both** the full inline SNS message (as today) and writes to S3. The tracker is updated incrementally to prefer and eventually require the S3 version. See [Rollout Phases](#rollout-phases) for the full sequence.

## Tracker Changes (hca-atlas-tracker)

### SNS Message Processing

In `app/services/validation-results-notification.ts`:

1. Parse the SNS message (extract `file_id`, `batch_job_id`)
2. Resolve the claim-check bucket from `AWS_VALIDATION_RESULTS_BUCKET` env var (the SNS `bucket` field still refers to the original data bucket — do not use it here)
3. Construct the S3 key: `validation-metadata/{file_id}/{batch_job_id}.json`
4. Attempt to fetch full results from S3
   - On success: parse → schema-validate → write to DB → commit → delete S3 object
   - On failure: fall back to inline SNS data (Phase 3) or hard error (Phase 4+)

See [Rollout Phases](#rollout-phases) for how this evolves across phases.

### S3 Fetch, Persist, then Delete

The S3 object must only be deleted **after** the database write has committed. Deleting earlier (e.g., after JSON parse) would lose the payload if the DB write fails, and SNS retry would no longer be able to recover.

Sequence:

```
SNS received
→ derive validation result S3 key (from AWS_VALIDATION_RESULTS_BUCKET + file_id + batch_job_id)
→ fetch object
→ parse JSON
→ validate schema
→ write results to DB
→ commit
→ delete S3 object
```

Sketch (in `app/services/s3-operations.ts` or similar):

```typescript
async function fetchValidationMetadata(
  bucket: string,
  key: string,
): Promise<DatasetValidatorResults> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  const body = await response.Body.transformToString();
  return JSON.parse(body);
}

async function deleteValidationMetadata(
  bucket: string,
  key: string,
): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
```

The notification handler orchestrates fetch → parse → schema-validate → DB write → commit → delete in that order. A failure at any step before commit propagates so SNS can retry; a failure on delete is logged but does not fail the request (the lifecycle rule and/or manual cleanup will sweep orphans).

### Error Handling

- If the S3 object doesn't exist (404): treat the path as **idempotent** rather than a hard failure. Check whether the file already has results persisted for this `batch_job_id` (or a same-or-newer validation timestamp); if so, log and return success — the message has already been processed and the object has been deleted (or lifecycle-expired). Only fail when no corresponding results are present in the DB.
- If the S3 fetch fails (transient error): Let the error propagate. SNS will retry delivery, and the next attempt will try fetching again. The S3 object persists until explicitly deleted.
- If the DB write/commit fails: Do **not** delete the S3 object. Let the error propagate so SNS retries; the next delivery refetches the same object and tries again.
- If the S3 delete fails after successful DB commit: Log a warning but don't fail the request. Orphans are swept by the bucket's lifecycle rule and can also be cleaned up manually.

### Database Schema

During Phases 1-5, the database schema is unchanged. The S3 payload has the same shape as the current inline SNS message, and results are written to the existing `dataset_info` JSONB column on `hat.files` exactly as today.

Schema changes are deferred to Phase 6 when the payload is extended with per-sample metadata. Options at that point:

1. **Expand `dataset_info` JSONB** — simplest, keeps everything together, but JSONB columns with large arrays can be slow to query
2. **New `hat.file_sample_metadata` table** — normalized, queryable, but more complex to manage
3. **New JSONB column `sample_metadata`** on `hat.files` — separates concerns while keeping it simple

## Validation Schema Update

Update the Yup schema in the tracker (`datasetValidatorResultsSchema`) to:

1. Make the existing detailed fields optional (they move to S3 in later phases)
2. Create a separate schema for the full S3 payload validation
3. No new fields needed on the SNS message — the S3 key is derived from `file_id` + `batch_job_id` already present

## S3 Key Structure

```
validation-metadata/{file_id}/{batch_job_id}.json
```

- `file_id` — the tracker's UUID for the file record. Visible in the key for debugging and correlation (e.g., browsing S3 to find all validation results for a specific file)
- `batch_job_id` — the AWS Batch job ID, unique per validation run. Prevents overwrites when a file is re-validated (e.g., after a validator bug fix) before the previous result is fetched

This structure ensures:

- Each validation run produces a distinct S3 object — no race conditions between re-validations
- Easy to find all results for a file by listing the `validation-metadata/{file_id}/` prefix
- The tracker's existing timestamp ordering logic (`newValidationTime < lastValidationTime`) still governs which result is accepted, independent of S3 key ordering
- The tracker deletes each object after processing; orphans are small and harmless

## Cleanup Strategy

**Primary:** The tracker deletes the S3 object immediately after the database write commits successfully.

**Backstop:** A lifecycle rule on the validation-results bucket expires any object older than 7 days. Because the bucket only ever contains transient claim-check payloads (no source data), the lifecycle rule is safe to apply broadly and protects against orphans from rare processing failures.

## Rollout Phases

Each phase is independently deployable. No phase requires coordinated deployment between the validator and tracker.

### Phase 1: [Infra] Provision validation-results bucket and add S3 permissions

**Terraform changes:**

- New module (or addition to an existing one) to create `hca-atlas-tracker-validation-results-{env}` per environment, configured as: non-versioned, block-public-access, SSE encryption, lifecycle rule expiring objects older than 7 days
- `validator-batch/iam.tf`: Add `s3:PutObject` for `validation-metadata/*` on the validation-results bucket to the Batch task role; pass `VALIDATION_RESULTS_BUCKET` to the Batch job environment
- `app-runner/main.tf`: Add `s3:GetObject` and `s3:DeleteObject` for `validation-metadata/*` on the validation-results bucket to the app runner task role; pass `AWS_VALIDATION_RESULTS_BUCKET` to the App Runner service environment

**Tracker config changes:**

- Add the validation-results bucket to the `s3_buckets` array in the tracker's `AWS_RESOURCE_CONFIG` env var (per environment). The tracker's existing `validateS3BucketAuthorization` (`app/config/aws-resources.ts`) gates which buckets the SNS handler is allowed to interact with; the env-derived claim-check bucket must be validated through this same allowlist before any S3 read/delete, mirroring how `AWS_DATA_BUCKET` is validated today.

**Acceptance Criteria:**

- [ ] Validation-results bucket exists per environment with the properties listed above
- [ ] Batch job can write to `s3://{validation-results-bucket}/validation-metadata/*`
- [ ] Batch job cannot write to any other prefix or to the data bucket's claim-check prefix
- [ ] App runner can read and delete from `s3://{validation-results-bucket}/validation-metadata/*`
- [ ] `VALIDATION_RESULTS_BUCKET` is set in the Batch container environment; `AWS_VALIDATION_RESULTS_BUCKET` is set in the App Runner service environment
- [ ] Lifecycle rule on the validation-results bucket is active
- [ ] Validation-results bucket is included in the tracker's `AWS_RESOURCE_CONFIG.s3_buckets` allowlist in dev and prod
- [ ] Tracker validates the env-derived claim-check bucket via `validateS3BucketAuthorization` before fetching or deleting

No functional impact. Existing behavior unchanged.

---

### Phase 2: [Validator] Try S3 write, always send full SNS message

The validator attempts to write results to S3 first, wrapped in a try/catch. Regardless of whether the S3 write succeeds or fails, it always proceeds to send the full inline SNS message as today. This ensures the existing pipeline is never disrupted.

**Changes to `hca-validation-tools`:**

- Try: write full JSON to `s3://{validation-results-bucket}/validation-metadata/{file_id}/{batch_job_id}.json`
  - On success: log `"S3 claim check write succeeded for file {file_id}"`
  - On failure: log `"S3 claim check write failed for file {file_id}: {error}"`
- Always: send the full inline SNS message as today (no changes to SNS message shape, truncation logic stays)

The tracker can derive the S3 key from `file_id` + `batch_job_id` already present in the SNS message — no new fields needed.

**Acceptance Criteria:**

- [ ] S3 write failure does not prevent SNS message from being sent
- [ ] SNS message is unchanged from current format (no new fields)
- [ ] Success and failure of S3 write are logged

---

### Phase 3: [Tracker] Prefer S3, fall back to inline SNS

The tracker attempts to read from S3 first. If the S3 object exists, use it; otherwise fall back to the inline SNS message content. Log which source was used.

**Changes to `hca-atlas-tracker`:**

- Update `validation-results-notification.ts`:
  - Resolve the claim-check bucket from `AWS_VALIDATION_RESULTS_BUCKET` env var (do not use `validationResults.bucket` — that's the data bucket)
  - Construct the S3 key from `file_id` + `batch_job_id`: `validation-metadata/{file_id}/{batch_job_id}.json`
  - Rely on the AWS SDK's default retry behavior for transient S3 errors (no application-level retry loop)
  - Confirm that the S3 payload is consistent with the inline SNS metadata by checking that `file_id`, `status`, `timestamp`, `bucket`, `key`, and `batch_job_id` match between the two. A mismatch falls back to inline SNS data (treated the same as a fetch failure).
  - On success: parse → schema-validate → consistency-check → write to DB → commit → delete S3 object; log `"Using S3 claim check for file {fileId}"`
  - On failure (404, persistent S3 error, schema-invalid payload, or consistency mismatch): fall back to inline SNS data, log `"Falling back to inline SNS for file {fileId}: {reason}"`

**Acceptance Criteria:**

- [ ] Tracker reads the claim-check bucket from `AWS_VALIDATION_RESULTS_BUCKET`, not from the SNS message
- [ ] Tracker prefers S3 data when available
- [ ] S3 payload is checked for metadata consistency with the inline SNS message before being used; a mismatch falls back to inline data
- [ ] Tracker falls back to inline SNS data gracefully on S3 fetch failure, schema-invalid payload, or consistency mismatch
- [ ] Logs clearly indicate which source was used
- [ ] S3 object deleted only after the DB write commits successfully
- [ ] DB write/commit failure leaves the S3 object in place (so SNS retry can recover)
- [ ] All existing tests still pass (inline path unchanged)

---

### Phase 4: [Tracker] Require S3, remove inline fallback

Once Phase 3 is verified in production — specifically, a full corpus revalidation completes with zero fallbacks to inline SNS — remove the inline fallback.

**Changes to `hca-atlas-tracker`:**

- Remove inline SNS data processing path
- S3 fetch is now required — failure is a hard error (SNS will retry)
- Inline results in the SNS message are ignored

**Acceptance Criteria:**

- [ ] Tracker only reads from S3
- [ ] S3 fetch failure propagates for SNS retry
- [ ] Inline SNS data is not used

---

### Phase 5: [Validator] Stop sending full inline SNS message

Once the tracker requires S3, the validator can stop sending the full inline results in the SNS message.

**Changes to `hca-validation-tools`:**

- SNS message becomes a lightweight notification only (`file_id`, `batch_job_id`, `status`, `timestamp`, etc.)
- Remove `to_length_limited_json()` truncation logic

**Companion change in `hca-atlas-tracker`:**

- The Phase 3 metadata-consistency check (Phase 3 / `confirmValidationResultsMatchMetadata`) compares `file_id`, `status`, `timestamp`, `bucket`, `key`, and `batch_job_id` between the SNS message and the S3 payload. After Phase 4 removes the inline fallback, that check is no longer load-bearing; it can be narrowed to the fields the slim SNS message still carries (at minimum `file_id` + `batch_job_id`) or removed entirely. Decide as part of this phase.

**Acceptance Criteria:**

- [ ] SNS message is small (pointer only)
- [ ] Truncation logic removed
- [ ] S3 object contains the full results
- [ ] Tracker's metadata-consistency check is updated (narrowed or removed) to reflect the slim SNS shape

---

### Phase 6: [Validator + Tracker] Extend S3 payload with new metadata

With the claim check pipeline proven, extend the S3 payload with per-sample metadata and other fields that wouldn't have fit in the 256 KiB SNS limit.

**Changes:**

- Validator: Extract per-sample metadata from H5AD obs (exact fields TBD)
- Validator: Include `sample_metadata` array in the S3 results JSON
- Tracker: Store per-sample metadata in database (schema TBD — JSONB column or normalized table)
- Tracker: Expose per-sample metadata via API

**Acceptance Criteria:**

- [ ] Per-sample metadata extracted from H5AD during validation
- [ ] Metadata stored in tracker database
- [ ] Metadata accessible via API
- [ ] Large datasets (10k+ samples) handled without timeouts

## Risks and Mitigations

| Risk                                                  | Mitigation                                                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S3 object expires (lifecycle) before tracker reads it | Lifecycle retention (7 days) is long enough to absorb SNS retry windows; tracker delete is gated on DB commit, so premature deletion by the tracker itself cannot happen |
| DB write fails after S3 fetch                         | Delete is gated on DB commit, so the object remains in S3 and SNS retry refetches it                                                                                     |
| S3 write fails in validator                           | Fall back to inline SNS message (degraded but functional)                                                                                                                |
| Misuse of `bucket` field in SNS message               | Tracker resolves the claim-check bucket from `AWS_VALIDATION_RESULTS_BUCKET` env var; the SNS `bucket` field is only the data bucket                                     |
| Large metadata causes slow DB writes                  | Use JSONB for now; normalize to separate table if queries are slow                                                                                                       |
| Concurrent re-validation overwrites S3 object         | Tracker uses timestamp ordering to reject stale results (existing behavior)                                                                                              |
| Cost of S3 storage                                    | Objects are transient (deleted after DB commit); lifecycle rule on the validation-results bucket sweeps any orphans                                                      |
| Lifecycle rule accidentally expires real data         | Validation-results bucket holds only transient claim-check payloads — no source data — so a lifecycle rule cannot affect data files                                      |
