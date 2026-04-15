# PRD: Validation Metadata via S3 Claim Check

## Overview

The batch validator currently sends validation results back to the tracker via a single SNS message (≤256 KiB). This works for validation pass/fail and basic metadata (title, assay, tissue, disease, cell/gene counts), but is insufficient for richer per-sample metadata that can easily reach megabytes for datasets with thousands of samples.

This document describes a change to the result delivery mechanism: the validator writes full metadata to S3 and sends a lightweight SNS notification with a pointer to the S3 object. The tracker fetches the full metadata from S3 on notification, saves it to the database, and deletes the S3 object.

## Problem

- SNS has a hard 256 KiB message size limit
- The validator already implements truncation logic (`to_length_limited_json`) to fit within this limit
- Per-sample metadata (e.g., cell-level annotations, sample-level metadata summaries) can be orders of magnitude larger
- There is no way to surface this richer metadata in the tracker UI without a larger transport mechanism

## Solution: S3 Claim Check Pattern

Use the existing data bucket with a dedicated prefix as an intermediary. The validator writes full results to S3, then sends a small SNS message with the S3 key. The tracker fetches the full payload from S3, writes it to the database, and deletes the S3 object.

### Current Flow

```
Batch Job → build results JSON (≤250KB, truncate if needed)
          → SNS publish to validation-results topic
          → Tracker /api/sns receives message
          → writes to hat.files (dataset_info, validation_reports, etc.)
```

### New Flow

```
Batch Job → build full results JSON (unlimited size)
          → write to S3: s3://{bucket}/validation-metadata/{file_id}/{batch_job_id}.json
          → SNS publish (small message with S3 pointer)
          → Tracker /api/sns receives message
          → fetch full JSON from S3
          → write to database
          → delete S3 object
```

## Infrastructure Changes

### S3: Reuse Existing Data Bucket

Use the existing data bucket (`hca-atlas-tracker-data-dev` / `hca-atlas-tracker-data`) with a new prefix:

```
s3://{data-bucket}/validation-metadata/{file_id}.json
```

**Why reuse the existing bucket:**

- No new bucket to create or manage
- Both Batch and the tracker app already have credentials for this bucket
- Prefix-scoped IAM policies keep permissions tight
- Versioning is already enabled on the bucket

**No lifecycle rule:** The app deletes claim check objects immediately after processing. Orphaned objects (from rare processing failures) are small JSON files with negligible storage cost and can be cleaned up manually if needed. Avoiding a lifecycle rule eliminates any risk of misconfiguration accidentally expiring real data files in the bucket.

### IAM: Batch Task Role — Add S3 Write

The Batch task role (`validator-batch/iam.tf`) currently has read-only access to the data bucket. Add write access scoped to the `validation-metadata/` prefix:

```hcl
{
  Sid    = "WriteValidationMetadata"
  Effect = "Allow"
  Action = ["s3:PutObject"]
  Resource = "arn:aws:s3:::${var.data_bucket_name}/validation-metadata/*"
}
```

### IAM: App Runner Task Role — Add S3 Read and Delete

The app runner task role (`app-runner/main.tf`) needs explicit permissions to fetch and clean up validation metadata. (Note: the app currently relies on implicit permissions for S3 presigned URLs and Batch job submission — those should also be formalized, but that is out of scope for this PRD.)

```hcl
{
  Sid    = "ReadDeleteValidationMetadata"
  Effect = "Allow"
  Action = [
    "s3:GetObject",
    "s3:DeleteObject"
  ]
  Resource = "arn:aws:s3:::${var.data_bucket_name}/validation-metadata/*"
}
```

### SNS: No Changes

The existing validation-results SNS topic and subscription are reused. Only the message content changes (smaller, with an S3 pointer).

### IAM: Local Development Role

Create a `tracker-local-dev` IAM role for local development with permissions scoped to the dev bucket's `validation-metadata/` prefix only:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LocalDevValidationMetadata",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::hca-atlas-tracker-data-dev/validation-metadata/*"
    }
  ]
}
```

This ensures local dev credentials cannot read, write, or delete files outside the `validation-metadata/` prefix and have no access to the prod bucket. Developers authenticate via SSO or `aws sts assume-role`.

## Validator Changes (hca-validation-tools)

### Updated Result Publishing

In `services/dataset-validator/main.py`, after validation completes:

1. Build the full results JSON (same structure as today, plus new per-sample metadata fields)
2. Write to S3: `s3://{bucket}/validation-metadata/{file_id}/{batch_job_id}.json`
3. Publish a lightweight SNS message containing:

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

No explicit S3 key field is needed in the SNS message. The tracker constructs the S3 key deterministically from fields already present in the message: `validation-metadata/{file_id}/{batch_job_id}.json`. All detailed data (integrity results, metadata summary, tool reports, per-sample metadata) moves to the S3 object.

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

The validator already receives `S3_BUCKET` from the Batch job environment. No new environment variables needed — the validator uses the same bucket for reading the file and writing the results.

### Backward Compatibility

During rollout, the validator sends **both** the full inline SNS message (as today) and writes to S3. The tracker is updated incrementally to prefer and eventually require the S3 version. See [Rollout Phases](#rollout-phases) for the full sequence.

## Tracker Changes (hca-atlas-tracker)

### SNS Message Processing

In `app/services/validation-results-notification.ts`:

1. Parse the SNS message
2. If `metadata_s3_key` is present:
   - Fetch the full JSON from S3 using `GetObjectCommand`
   - Parse and validate against the results schema
   - Process as normal
   - Delete the S3 object using `DeleteObjectCommand`
3. If `metadata_s3_key` is absent:
   - Process inline results as today (backward compatibility)

### S3 Fetch and Delete

Add an S3 operations function (in `app/services/s3-operations.ts` or similar):

```typescript
async function fetchAndDeleteValidationMetadata(
  bucket: string,
  key: string,
): Promise<DatasetValidatorResults> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  const body = await response.Body.transformToString();
  const results = JSON.parse(body);

  // Delete after successful parse
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

  return results;
}
```

### Error Handling

- If the S3 object doesn't exist (404): Log error, treat as job failure. It may have already been processed (idempotency). Check if file already has newer results by timestamp.
- If the S3 fetch fails (transient error): Let the error propagate. SNS will retry delivery, and the next attempt will try fetching again. The S3 object persists until explicitly deleted.
- If the S3 delete fails after successful DB write: Log warning but don't fail. Orphaned objects are small and can be cleaned up manually if they accumulate.

### Database Schema

The per-sample metadata will be stored in the existing `dataset_info` JSONB column on `hat.files`, or in a new dedicated column/table depending on the data volume and query patterns. This decision can be deferred to implementation — the S3 claim check mechanism works regardless of the database schema choice.

Options:

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

**Primary:** The tracker deletes the S3 object immediately after successfully writing to the database.

No lifecycle rule is used. Orphaned objects from rare processing failures are small JSON files with negligible cost and can be cleaned up manually if needed.

## Rollout Phases

Each phase is independently deployable. No phase requires coordinated deployment between the validator and tracker.

### Phase 1: [Infra] Add S3 permissions

**Terraform changes:**

- `validator-batch/iam.tf`: Add `s3:PutObject` for `validation-metadata/*` to Batch task role
- `app-runner/main.tf`: Add `s3:GetObject` and `s3:DeleteObject` for `validation-metadata/*` to app runner task role

**Acceptance Criteria:**

- [ ] Batch job can write to `s3://{bucket}/validation-metadata/*`
- [ ] Batch job cannot write to any other prefix
- [ ] App runner can read and delete from `s3://{bucket}/validation-metadata/*`

No functional impact. Existing behavior unchanged.

---

### Phase 2: [Validator] Try S3 write, always send full SNS message

The validator attempts to write results to S3 first, wrapped in a try/catch. Regardless of whether the S3 write succeeds or fails, it always proceeds to send the full inline SNS message as today. This ensures the existing pipeline is never disrupted.

**Changes to `hca-validation-tools`:**

- Try: write full JSON to `s3://{bucket}/validation-metadata/{file_id}/{batch_job_id}.json`
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
  - Construct the S3 key from `file_id` + `batch_job_id`: `validation-metadata/{file_id}/{batch_job_id}.json`
  - Attempt to fetch from S3
  - On success: use S3 data, delete S3 object, log `"Using S3 claim check for file {fileId}"`
  - On failure (404, fetch error): fall back to inline SNS data, log `"Falling back to inline SNS for file {fileId}: {reason}"`

**Acceptance Criteria:**

- [ ] Tracker prefers S3 data when available
- [ ] Tracker falls back to inline SNS data gracefully
- [ ] Logs clearly indicate which source was used
- [ ] S3 object deleted after successful processing
- [ ] All existing tests still pass (inline path unchanged)

---

### Phase 4: [Tracker] Require S3, remove inline fallback

Once Phase 3 is verified in production and logs confirm S3 is consistently used, remove the inline fallback.

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

**Acceptance Criteria:**

- [ ] SNS message is small (pointer only)
- [ ] Truncation logic removed
- [ ] S3 object contains the full results

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

| Risk                                          | Mitigation                                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| S3 object deleted before tracker reads it     | SNS retries cover transient failures; each validation run has a unique S3 key (batch_job_id)        |
| S3 write fails in validator                   | Fall back to inline SNS message (degraded but functional)                                           |
| Large metadata causes slow DB writes          | Use JSONB for now; normalize to separate table if queries are slow                                  |
| Concurrent re-validation overwrites S3 object | Tracker uses timestamp ordering to reject stale results (existing behavior)                         |
| Cost of S3 storage                            | Objects are transient (deleted after processing); orphans are small JSON files with negligible cost |
