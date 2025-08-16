# S3 Notification System Design Decisions and Rationale

## Architecture Choices

### **Event Flow Pattern**

• **S3 → SNS → HTTP Endpoint** (not S3 → SQS or direct S3)

- Rationale: App Runner requires HTTP endpoints; SQS needs polling/Lambda; SNS supports push notifications
- Alternative rejected: SQS (adds complexity, delayed processing)

### **API Design**

• **Centralized SNS Webhook** (`/api/sns`)

- Rationale: Integrates with existing Next.js application architecture
- Single endpoint handles all SNS messages (SubscriptionConfirmation, Notification, etc.)
- Routes S3 notifications and other SNS message types to appropriate service handlers

### **Event Processing**

• **Individual S3 object events** (not processing on upload of manifest files)

- Rationale: Simpler implementation, immediate processing, easier error handling
- Alternative rejected: Manifest files (adds complexity, delayed processing)

## Security & Validation

### **SNS Authentication**

• **AWS SNS signature verification** using `sns-validator` package

- Rationale: Prevents unauthorized requests, follows AWS best practices
- Rejects invalid signatures with HTTP 401

### **SHA256 Integrity Validation**

• **Client-provided SHA256** in S3 object metadata (`source-sha256`)

- Rationale: Ensures data integrity, matches smart-sync tool expectations
- Strict 64-character hex format validation
- Rejects missing/invalid SHA256 with HTTP 400

### **AWS Resource Allowlisting**

• **SNS Topic and S3 Bucket authorization** via environment configuration

- **Configuration**: `AWS_RESOURCE_CONFIG` environment variable with JSON allowlists
- **SNS Topic Validation**: Checks `TopicArn` against authorized topics list
- **S3 Bucket Validation**: Checks bucket names against authorized buckets list
- **Strict Mode**: Rejects entire request with HTTP 403 if ANY bucket is unauthorized
- **Security Logging**: Logs unauthorized access attempts for monitoring
- **Rationale**: Prevents processing of notifications from unauthorized AWS resources
- **Reference**: See `docs/aws-resource-configuration.md` for setup details

### **Input Validation**

• **Strict event structure validation** for S3 and SNS formats

- **Yup Schema Validation**: Uses established codebase pattern for consistent validation
- **AWS-Compliant Schemas**: Matches official AWS S3 event notification structure
- **Type Safety**: Eliminates `any` types, uses proper TypeScript interfaces
- **Rationale**: Fail fast on malformed data, clear error messages, compile-time safety

## Data Integrity & Idempotency

### **Idempotency Strategy**

• **PostgreSQL ON CONFLICT** with `(bucket, key, version_id)` unique constraint

- **What ON CONFLICT means**: PostgreSQL feature that handles duplicate key violations gracefully
- **How it works**: When INSERT would violate unique constraint, execute alternative action instead of failing
- **Our implementation**: `ON CONFLICT (bucket, key, version_id) DO UPDATE SET ...`
- **Benefits**:
  - Single atomic operation (INSERT or UPDATE in one statement)
  - Handles concurrent requests safely without locks
  - Returns metadata about whether record was inserted or updated
  - Eliminates need for separate existence checks
- **Constraint logic**: Same S3 object (bucket + key + version_id) can only exist once
- **Conflict resolution**: Update existing record only if ETag matches, otherwise reject

#### **Idempotency Scenarios Summary**

Our system uses the unique constraint `(bucket, key, version_id)` to identify duplicate S3 notifications:

- **Scenario 1: Same bucket + key + version_id + ETag (True Duplicate)**

  - **Action**: Do nothing - Update record with same values, log as "duplicate notification"
  - **Rationale**: Legitimate duplicate notification from AWS (network retry, etc.)
  - **Result**: HTTP 200, no data changes, operation logged as 'updated'

- **Scenario 2: Same bucket + key + version_id + Different ETag (Data Corruption)**

  - **Action**: REJECT - Throw error, return HTTP 500
  - **Rationale**: Same S3 object version should never have different ETags - indicates corruption
  - **Result**: HTTP 500, detailed error logging, transaction rolled back

- **Scenario 3: Same bucket + key + Different version_id (New Version)**
  - **Action**: INSERT - Create new record, mark as latest version
  - **Rationale**: Legitimate new version of the file
  - **Result**: HTTP 200, new record created, operation logged as 'inserted'

**Key Insight**: ETag serves as our data integrity checkpoint. The ON CONFLICT WHERE clause `files.etag = EXCLUDED.etag` ensures we only accept updates when ETags match, protecting against data corruption while handling legitimate duplicates gracefully.

### **ETag Validation**

• **Strict ETag mismatch detection** for existing records

- Rationale: Detects potential data corruption or AWS infrastructure issues
- Logs detailed mismatch info, rejects with HTTP 500

### **File Versioning**

• **`is_latest` boolean flag** for efficient latest-version queries

- Rationale: Avoids complex MAX(version) queries, enables fast lookups
- Alternative rejected: Computed latest versions (performance impact)

## Database Design

### **Transaction Management**

• **`doTransaction` utility** for atomic `is_latest` updates

- Rationale: Consistency with existing codebase patterns
- Ensures atomicity: mark previous versions false → insert new as true

### **Schema Integration**

• **Single migration** for all SHA256 integrity fields + `is_latest`

- Rationale: Simpler migration management, related features grouped
- Fields: `sha256_client`, `sha256_server`, `integrity_status`, `integrity_checked_at`, `integrity_error`, `is_latest`

### **Indexing Strategy**

• **Indexes on integrity_status and sha256_client**

- Rationale: Fast queries for integrity validation workflows
- Supports future batch integrity checking operations

## File Classification & Entity Relationships

### **File Type Determination**

• **S3 path-based classification** using folder structure

- **Pattern**: `bio_network/atlas-name/folder-type/filename`
- **Mapping**:
  - `source-datasets/` → `file_type = 'source_dataset'`
  - `integrated-objects/` → `file_type = 'integrated_object'`
  - `manifests/` → `file_type = 'ingest_manifest'`
- **Rationale**: Authoritative source of truth, consistent with S3 organization
- **Error handling**: Invalid paths or unknown folder types rejected with HTTP 400

### **Foreign Key Relationships**

• **Exclusive foreign key assignment** based on file type

- **Source datasets**: `source_study_id = NULL` (staged validation), `atlas_id = NULL`
- **Integrated objects**: `atlas_id = atlas_uuid` (from database lookup), `source_study_id = NULL`
- **Ingest manifests**: `atlas_id = atlas_uuid` (from database lookup), `source_study_id = NULL`
- **Database constraint**: CHECK constraint enforces exclusive relationships at schema level

### **Atlas Lookup Strategy**

• **S3 atlas name parsing and database lookup** with version handling

- **S3 Path Format**: `bio_network/atlas-name/folder-type/filename`
- **Atlas Name Parsing**: Extracts `network` and `atlas-name` from S3 path
- **S3 Atlas Name Format**: `shortName-vX` or `shortName-vX-Y` (e.g., `gut-v1`, `retina-v1-1`)
- **Version Conversion**:
  - S3 `gut-v1` → Database lookup: `network="gut"`, `shortName="gut"`, `version="1.0"`
  - S3 `retina-v1-1` → Database lookup: `network="retina"`, `shortName="retina"`, `version="1.1"`
- **Database Query**: Multi-field lookup with case-insensitive shortName matching:
  ```sql
  SELECT id FROM hat.atlases
  WHERE overview->>'network' = $network
  AND (overview->>'version' = $dbVersion OR overview->>'version' = $versionWithoutDecimal)
  AND LOWER(overview->>'shortName') = LOWER($atlasBaseName)
  ```
- **Version Flexibility**: Handles both `"1.0"` and `"1"` formats in database
- **Error Handling**: Atlas not found → reject with detailed error including all lookup parameters
- **Rationale**: Robust parsing handles real S3 naming conventions, version flexibility accommodates database variations

### **Staged Validation Workflow**

• **Source study linkage deferred** to validation stage

- **S3 notification stage**: Create file record with `source_study_id = NULL`
- **Validation stage**: Extract DOI from `.h5ad` metadata, lookup source study, update FK
- **Rationale**: Allows immediate file ingestion, validation can happen asynchronously

## Error Handling & Monitoring

### **Error Classification**

• **HTTP status codes** by error type:

- 400: Client errors (missing SHA256, invalid format, invalid S3 key format, unknown folder type)
- 401: Authentication failures (invalid SNS signature)
- 403: Authorization failures (unauthorized SNS topic, unauthorized S3 bucket)
- 500: Server errors (ETag mismatches, database issues, atlas lookup failures)

### **Production Logging**

• **console.error for all operational events**

- Rationale: Centralized logging, easy monitoring/alerting
- Logs: file creation, duplicates, errors, validation failures

### **Test Environment**

• **`withConsoleErrorHiding`** for clean test output

- Rationale: Preserves production logs while keeping tests readable
- Applied consistently across all test scenarios

## Development Practices

### **Test-Driven Development**

• **TDD approach** with failing tests before implementation

- Rationale: Ensures requirements clarity, prevents regressions
- Comprehensive coverage: authentication, validation, idempotency, versioning

### **Error Message Strategy**

• **Detailed error messages** for debugging

- Rationale: Faster troubleshooting, clear failure reasons
- Examples: "SHA256 metadata is required", "ETag mismatch detected"

### **Code Architecture & Refactoring**

• **Functional decomposition** to reduce cognitive complexity

- **Sequential processing functions**: `extractAndValidateRequest`, `authorizeSNSTopic`, `authorizeS3Buckets`, `processRecordsAndRespond`
- **Single responsibility**: Each function handles one aspect of request processing
- **Error handling**: Centralized error responses, no nested try/catch blocks
- **Type safety**: Eliminated all `any` types, proper TypeScript interfaces throughout
- **Rationale**: Maintainable, testable, follows single responsibility principle, reduces cognitive complexity

### **Test Organization**

• **Factory pattern** for test data generation

- **S3 Event Factory**: `createS3Event()` for consistent test event generation
- **SNS Message Factory**: `createSNSMessage()` for consistent SNS wrapper generation
- **Parameterized tests**: Consolidated duplicate test cases using `test.each()`
- **Constants extraction**: Eliminated duplicate string literals for maintainability
- **Clean output**: `withConsoleErrorHiding` suppresses logs during tests
- **Rationale**: DRY principle, consistent test data, improved maintainability

## Implementation Summary

### **Key Files**

- `pages/api/sns.ts` - Centralized SNS webhook handler
- `app/services/sns-dispatcher.ts` - SNS notification routing service
- `app/services/sns-subscription.ts` - SNS subscription lifecycle handler
- `app/services/s3-notification.ts` - S3 notification processing service
- `migrations/1754790000000_files-table.ts` - Database schema
- `__tests__/api-files-s3-notification.test.ts` - Comprehensive test suite

### **Dependencies**

- `sns-validator` - SNS signature verification
- `doTransaction` utility - Database transaction management
- `withConsoleErrorHiding` - Test output management

### **Production Readiness**

✅ Secure SNS authentication  
✅ SHA256 integrity validation  
✅ Idempotent duplicate handling  
✅ File versioning with `is_latest` tracking  
✅ Comprehensive error handling and logging  
✅ Complete test coverage (8/8 tests passing)  
✅ Production monitoring capabilities
