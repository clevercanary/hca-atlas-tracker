# API Creation Guide

This document describes the best practices for creating APIs in the HCA Atlas Tracker project, including layer separation, responsibilities, validation, error handling, and authentication strategies.

## 1. Architecture Layers

### HTTP Handler Layer (`pages/api/`)

- **Location**: `pages/api/[resource]/[action].ts`
- **Purpose**: Handle HTTP-specific concerns
- **Responsibilities**:
  - Route incoming HTTP requests
  - Method validation (GET, POST, PUT, DELETE)
  - Authentication/authorization
  - Request validation using Yup schemas
  - Response formatting

### Service Layer (`app/services/`)

- **Location**: `app/services/[entity].ts`
- **Purpose**: Business logic and data operations
- **Responsibilities**:
  - Pure business logic
  - Database operations
  - Data transformations
  - Cross-service integrations
  - Domain-specific validations

#### Service Layer File Organization

**Simple Services** (single primary function):

```typescript
// app/services/atlases.ts
export async function createAtlas(
  data: NewAtlasData
): Promise<HCAAtlasTrackerDBAtlas> {
  // Single focused responsibility
}
```

**Complex Services** (multiple related functions):

```typescript
// app/services/s3-notification.ts
export async function processS3Record(s3Event, snsMessage) {
  // Main orchestration function - EXPORTED for API handler
}

async function saveFileRecord(record) {
  // Database operations - INTERNAL
}

function determineFileType(s3Key) {
  // Business rules - INTERNAL
}

function parseS3KeyPath(s3Key) {
  // Data parsing - INTERNAL
}
```

**Service Function Visibility Guidelines:**

- **Export**: Functions called by API handlers or other services
- **Internal**: Helper functions used only within the service
- **Naming**: Use descriptive names that indicate the function's responsibility

## 2. Layer Responsibilities

### HTTP Handler Responsibilities

```typescript
// Example: pages/api/atlases/create.ts
export default handler(
  method(METHOD.POST), // Method validation
  role(ROLE.CONTENT_ADMIN), // Authentication/authorization
  async (req, res) => {
    const data = await newAtlasSchema.validate(req.body); // Request validation
    res.status(201).json(dbAtlasToApiAtlas(await createAtlas(data))); // Service call + response
  }
);
```

### Service Layer Responsibilities

```typescript
// Example: app/services/atlases.ts
export async function createAtlas(
  data: NewAtlasData
): Promise<HCAAtlasTrackerDBAtlas> {
  // Pure business logic - no HTTP knowledge
  // Database operations
  // Data transformations
  return createdAtlas;
}
```

## 3. Validation and Schema Locations

### Yup Validators

- **Location**: `app/apis/catalog/hca-atlas-tracker/common/schema.ts`
- **Purpose**: Define request/response validation schemas
- **Pattern**:

```typescript
export const newAtlasSchema = object({
  shortName: string().required(),
  fullName: string().required(),
  // ... other fields
}).required();

export type NewAtlasData = InferType<typeof newAtlasSchema>;
```

### Business Entity Interfaces

- **Location**: `app/apis/catalog/hca-atlas-tracker/common/entities.ts`
- **Purpose**: Define database and domain entities
- **Pattern**:

```typescript
export interface HCAAtlasTrackerDBAtlas {
  id: string;
  shortName: string;
  fullName: string;
  // ... other fields
}
```

## 4. AWS Service Integration Patterns

### AWS Error Classes

- **Location**: `app/apis/catalog/hca-atlas-tracker/aws/errors.ts`
- **Purpose**: AWS-specific error classes that inherit from base error classes
- **Pattern**: Extend base error classes for proper HTTP status mapping

```typescript
// AWS-specific errors with proper inheritance
export class SNSSignatureValidationError extends UnauthenticatedError {
  name = "SNSSignatureValidationError";
  constructor() {
    super("SNS signature validation failed");
  }
  // Maps to HTTP 401 Unauthorized
}

export class UnauthorizedAWSResourceError extends ForbiddenError {
  name = "UnauthorizedAWSResourceError";
  constructor(resourceType: string, resourceArn: string) {
    super(`Unauthorized ${resourceType}: ${resourceArn}`);
  }
  // Maps to HTTP 403 Forbidden
}

export class InvalidS3KeyFormatError extends InvalidOperationError {
  name = "InvalidS3KeyFormatError";
  constructor(key: string) {
    super(
      `Invalid S3 key format: ${key}. Expected format: network/atlas/folder/file`
    );
  }
  // Maps to HTTP 400 Bad Request
}
```

### AWS Schema Location

- **Location**: `app/apis/catalog/hca-atlas-tracker/aws/schemas.ts`
- **Purpose**: Yup schemas for AWS event validation (SNS, S3)

```typescript
export const snsMessageSchema = object({
  Type: string().required(),
  MessageId: string().required(),
  TopicArn: string().required(),
  Message: string().required(),
  Timestamp: string().required(),
  SignatureVersion: string().required(),
  Signature: string().required(),
  SigningCertURL: string().required(),
}).required();

export const s3EventSchema = object({
  Records: array().of(/* S3 record schema */).required(),
}).required();
```

### AWS Entity Interfaces

- **Location**: `app/apis/catalog/hca-atlas-tracker/aws/entities.ts`
- **Purpose**: TypeScript interfaces for AWS event structures

```typescript
export interface SNSMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
}

export interface S3Event {
  Records: S3EventRecord[];
}
```

## 5. Custom Error Locations

### Service-Specific Errors

- **Location**: Within the service file (`app/services/[entity].ts`)
- **Purpose**: Domain-specific business logic errors
- **Pattern**: Extend appropriate base error classes for automatic HTTP status mapping

```typescript
// In app/services/atlases.ts
import { NotFoundError, InvalidOperationError } from "../utils/api-handler";

export class AtlasNotFoundError extends NotFoundError {
  constructor(atlasId: string) {
    super(`Atlas with ID ${atlasId} not found`);
    this.name = "AtlasNotFoundError";
  }
}

export class DuplicateAtlasError extends InvalidOperationError {
  constructor(shortName: string) {
    super(`Atlas with shortName '${shortName}' already exists`);
    this.name = "DuplicateAtlasError";
  }
}
```

### Common API Errors (Base Classes)

- **Location**: `app/utils/api-handler.ts`
- **Purpose**: Base error classes that automatically map to HTTP status codes
- **Available Base Classes**:
  - `InvalidOperationError` → 400 Bad Request
  - `UnauthenticatedError` → 401 Unauthorized
  - `ForbiddenError` → 403 Forbidden
  - `NotFoundError` → 404 Not Found
  - `AccessError` → 403 Forbidden

### Error Inheritance Benefits

By extending base error classes instead of `Error` directly:

- **Automatic HTTP Status Mapping**: No need to manually map errors in handlers
- **Consistent Error Handling**: All `NotFoundError` subclasses automatically return 404
- **Better Error Context**: Domain-specific error names while inheriting HTTP behavior
- **Cleaner Handler Code**: Service throws `AtlasNotFoundError`, handler automatically returns 404

### Cascading Error Handling

Service functions must document ALL possible errors, including those from called functions:

```typescript
/**
 * Saves file record with idempotency handling
 * @param record - S3 event record containing bucket, object, and event metadata
 * @throws ETagMismatchError if ETags don't match (indicates potential corruption)
 * @throws InvalidS3KeyFormatError if S3 key doesn't have required path segments
 * @throws UnknownFolderTypeError if folder type is not recognized
 * @throws Error if atlas lookup fails for integrated objects/manifests
 * @note Uses PostgreSQL ON CONFLICT for atomic idempotency handling
 */
async function saveFileRecord(record: S3EventRecord): Promise<void> {
  const fileType = determineFileType(object.key); // Can throw InvalidS3KeyFormatError, UnknownFolderTypeError
  const atlasId = await determineAtlasId(object.key, fileType); // Can throw Error
  // ... database operations that can throw ETagMismatchError
}
```

**Key Principle**: Document errors from the caller's perspective, not just direct throws.

## 5. Error Handling

### Error Flow

1. **Service Layer**: Throws domain-specific errors
2. **HTTP Handler**: Catches and maps to HTTP status codes
3. **API Handler Utility**: Provides automatic error mapping

### Error Mapping

```typescript
// Automatic mapping in api-handler.ts
if (error instanceof ValidationError)
  return res.status(400).json({ error: error.message });
if (error instanceof UnauthenticatedError)
  return res.status(401).json({ error: "Unauthorized" });
if (error instanceof ForbiddenError)
  return res.status(403).json({ error: "Forbidden" });
if (error instanceof NotFoundError)
  return res.status(404).json({ error: "Not found" });
if (error instanceof InvalidOperationError)
  return res.status(400).json({ error: error.message });
```

### Custom Error Status Mapping

- **400 Bad Request**: `ValidationError`, `InvalidOperationError`, domain validation errors
- **401 Unauthorized**: `UnauthenticatedError`, authentication failures
- **403 Forbidden**: `ForbiddenError`, `AccessError`, authorization failures
- **404 Not Found**: `NotFoundError`, resource not found
- **500 Internal Server Error**: Unexpected errors, database errors

## 7. JSDoc Documentation Standards

### Complete Function Documentation

All service functions must have comprehensive JSDoc documentation:

```typescript
/**
 * Parses S3 key path into standardized components
 * @param s3Key - The S3 object key to parse
 * @returns Parsed components including network, atlas name, folder type, and filename
 * @throws InvalidS3KeyFormatError if the S3 key doesn't have at least 4 path segments
 * @example
 * parseS3KeyPath('bio_network/gut-v1/integrated-objects/file.h5ad')
 * // Returns: { network: 'bio_network', atlasName: 'gut-v1', folderType: 'integrated-objects', filename: 'file.h5ad' }
 */
function parseS3KeyPath(s3Key: string): S3KeyPathComponents {
  // Implementation
}
```

### Required JSDoc Elements

- **@param**: All parameters with clear descriptions and types
- **@returns**: Return type and meaning
- **@throws**: ALL possible error types (direct + cascading)
- **@note**: Important implementation details or design decisions
- **@example**: For complex parsing/validation functions
- **Function description**: Clear, concise explanation of purpose

### JSDoc Error Documentation Rules

1. **Document ALL errors**: Include errors from called functions
2. **Specify error types**: Use exact error class names
3. **Explain conditions**: When each error occurs
4. **HTTP mapping**: Note which errors map to which status codes (for AWS errors)

```typescript
/**
 * Validates SNS message signature and extracts S3 event
 * @param message - The SNS message to validate
 * @returns Promise resolving to the extracted and parsed S3 event
 * @throws SNSSignatureValidationError if the SNS signature is invalid (401)
 * @throws InvalidOperationError if the message is malformed or JSON is unparseable (400)
 */
async function validateSNSMessage(message: SNSMessage): Promise<S3Event> {
  // Implementation
}
```

## 8. Database Transaction Patterns

### Atomic Operations with doTransaction

For operations requiring data consistency across multiple queries:

```typescript
await doTransaction(async (transaction) => {
  // Step 1: Update related records
  await transaction.query(
    `UPDATE hat.files SET is_latest = FALSE WHERE bucket = $1 AND key = $2`,
    [bucket.name, object.key]
  );

  // Step 2: Insert/update with conflict handling
  const result = await transaction.query(
    `
    INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, status, is_latest, file_type, source_study_id, atlas_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, NULL, $11)
    
    ON CONFLICT (bucket, key, version_id) 
    DO UPDATE SET 
      etag = files.etag,
      is_latest = TRUE,
      updated_at = CURRENT_TIMESTAMP
    WHERE files.etag = EXCLUDED.etag
    
    RETURNING (CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END) as operation
  `,
    [
      /* parameters */
    ]
  );

  // Step 3: Handle outcomes
  if (result.rows.length === 0) {
    throw new DataIntegrityError("Conflict resolution failed");
  }
});
```

### Idempotency with ON CONFLICT

Use PostgreSQL's ON CONFLICT for atomic idempotency handling:

```typescript
// Benefits:
// - ATOMIC: Single operation, no race conditions
// - EFFICIENT: No separate existence checks needed
// - SAFE: Database constraint enforcement prevents corruption
// - INFORMATIVE: Returns metadata about operation type

const result = await transaction.query(
  `
  INSERT INTO table (unique_fields, data_fields)
  VALUES ($1, $2, $3)
  ON CONFLICT (unique_constraint)
  DO UPDATE SET 
    data_field = EXCLUDED.data_field,
    updated_at = CURRENT_TIMESTAMP
  WHERE existing_condition = expected_value
  RETURNING operation_metadata
`,
  [values]
);
```

### Transaction Error Handling

```typescript
await doTransaction(async (transaction) => {
  try {
    // Database operations
  } catch (error) {
    // Transaction automatically rolls back
    throw new DatabaseOperationError("Operation failed", error);
  }
});
```

## 9. Custom Authentication Patterns

### Beyond Role-Based Authentication

For services requiring custom validation beyond standard role checks:

```typescript
// Custom SNS signature validation
function validateSNSTopicAuthorization(topicArn: string): void {
  if (!AUTHORIZED_SNS_TOPICS.includes(topicArn)) {
    throw new UnauthorizedAWSResourceError("SNS topic", topicArn);
  }
}

// Custom S3 bucket authorization
function validateS3BucketAuthorization(bucketName: string): void {
  if (!AUTHORIZED_S3_BUCKETS.includes(bucketName)) {
    throw new UnauthorizedAWSResourceError("S3 bucket", bucketName);
  }
}

// Custom cryptographic validation
async function validateSNSMessage(message: SNSMessage): Promise<S3Event> {
  return new Promise((resolve, reject) => {
    const validator = new MessageValidator();
    validator.validate(message, (err, validatedMessage) => {
      if (err) {
        reject(new SNSSignatureValidationError());
        return;
      }
      // Process validated message
    });
  });
}
```

### Authorization Error Patterns

```typescript
// Error-throwing pattern (recommended)
function validateResource(resourceArn: string): void {
  if (!isAuthorized(resourceArn)) {
    throw new UnauthorizedAWSResourceError("resource", resourceArn);
  }
  // Continues if authorized
}

// Usage in service functions
export async function processEvent(event: AWSEvent): Promise<void> {
  validateResource(event.resourceArn); // Throws on failure
  // Process event - only executes if authorized
}
```

## 10. Clean Handler Delegation Patterns

### Minimal Handler Implementation

```typescript
// ✅ Correct - Handler focuses on HTTP concerns only
export default handler(method(METHOD.POST), async (req, res) => {
  // Step 1: Extract and validate request
  const { s3Event, snsMessage } = await validateRequest(req);

  // Step 2: Delegate to service layer
  await processS3Record(s3Event, snsMessage);

  // Step 3: Return success response
  res.status(200).end();
});
```

### Handler JSDoc Documentation

```typescript
/**
 * S3 Notification API Handler
 *
 * Processes AWS S3 object creation notifications sent via SNS.
 * This endpoint receives SNS messages containing S3 event data when files are uploaded
 * to authorized S3 buckets, validates the request, and creates database records.
 *
 * The handler delegates to validateRequest() and processS3Record() from the service layer.
 * All error handling is managed by the centralized handler wrapper which maps errors
 * to appropriate HTTP status codes based on error type inheritance.
 *
 * @route POST /api/files/s3-notification
 * @param req - Next.js API request containing SNS message in body
 * @param res - Next.js API response object
 * @returns 200 on successful processing
 * @note Error responses are handled by centralized error handler based on thrown error types
 */
```

### Service Layer Orchestration

```typescript
// Service layer handles all business logic
export async function processS3Record(
  s3Event: S3Event,
  snsMessage: SNSMessage
): Promise<void> {
  // Step 1: Authorization
  validateSNSTopicAuthorization(snsMessage.TopicArn);

  // Step 2: Validation
  s3EventSchema.validateSync(s3Event);

  // Step 3: Business rules
  if (s3Event.Records.length !== 1) {
    throw new InvalidOperationError("Expected exactly 1 S3 record");
  }

  // Step 4: Authorization
  authorizeS3Buckets(s3Event);

  // Step 5: Data processing
  await saveFileRecord(s3Event.Records[0]);
}
```

## 6. Service Layer Response Pattern

### Service Functions Return Data, Not HTTP Responses

```typescript
// ✅ Correct - Service returns data
export async function createAtlas(
  data: NewAtlasData
): Promise<HCAAtlasTrackerDBAtlas> {
  // Business logic
  return createdAtlas;
}

// ❌ Incorrect - Service should not handle HTTP responses
export async function createAtlas(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Don't do this
}
```

### HTTP Handler Formats Response

```typescript
// HTTP handler formats the response
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const data = await newAtlasSchema.validate(req.body);
    const atlas = await createAtlas(data);
    res.status(201).json(dbAtlasToApiAtlas(atlas)); // Transform for API response
  }
);
```

## 7. HTTP Method Handling

### Method Declaration

- **Pattern**: Only declare methods you support
- **Unsupported methods**: Automatically return 405 Method Not Allowed

```typescript
// Only support POST
export default handler(
  method(METHOD.POST), // Only POST is allowed
  async (req, res) => {
    // Handler logic
  }
);

// Support multiple methods
export default handler(
  method([METHOD.GET, METHOD.POST]), // Support both GET and POST
  async (req, res) => {
    if (req.method === "GET") {
      // GET logic
    } else if (req.method === "POST") {
      // POST logic
    }
  }
);
```

### Method Constants

```typescript
// Available in app/common/entities.ts
export enum METHOD {
  DELETE = "DELETE",
  GET = "GET",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
}
```

## 8. Custom Error Status Code Mapping

### Service Layer Error Design

```typescript
// Design errors to indicate their HTTP status
export class ValidationFailureError extends Error {
  name = "ValidationFailureError"; // Maps to 400
}

export class ResourceNotFoundError extends Error {
  name = "ResourceNotFoundError"; // Maps to 404
}

export class DatabaseConnectionError extends Error {
  name = "DatabaseConnectionError"; // Maps to 500
}
```

### Handler Error Mapping

```typescript
// In your handler, map specific errors to status codes
try {
  const result = await serviceFunction(data);
  res.status(200).json(result);
} catch (error) {
  if (error instanceof ValidationFailureError) {
    return res.status(400).json({ error: error.message });
  }
  if (error instanceof ResourceNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  // Let api-handler handle other common errors
  throw error;
}
```

## 9. Authentication and Authorization

### Role-Based Authentication

```typescript
// Standard role-based auth
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN), // Require specific role
  async (req, res) => {
    // Handler logic
  }
);
```

### Available Roles

```typescript
// Available in app/apis/catalog/hca-atlas-tracker/common/entities.ts
export enum ROLE {
  CONTENT_ADMIN = "CONTENT_ADMIN",
  DISABLED = "DISABLED",
  INTEGRATION_LEAD = "INTEGRATION_LEAD",
  STAKEHOLDER = "STAKEHOLDER",
  UNREGISTERED = "UNREGISTERED",
}
```

### Custom Authentication (e.g., SNS Validation)

```typescript
// For custom auth like SNS signature validation
export default handler(
  method(METHOD.POST),
  // No role() middleware - handle auth manually
  async (req, res) => {
    // Custom authentication logic
    const isValidSNS = await validateSNSSignature(req.body);
    if (!isValidSNS) {
      return res.status(401).json({ error: "Invalid SNS signature" });
    }

    // Handler logic
  }
);
```

### No Authentication Required

```typescript
// Public endpoints
export default handler(
  method(METHOD.GET),
  // No role() middleware
  async (req, res) => {
    // Public handler logic
  }
);
```

## 11. Complete Example: S3 Notification API

This example demonstrates all the enterprise patterns described above:

### API Handler (`pages/api/files/s3-notification.ts`)

```typescript
import { NextApiRequest } from "next";
import MessageValidator from "sns-validator";
import { SNSSignatureValidationError } from "../../../app/apis/catalog/hca-atlas-tracker/aws/errors";
import {
  S3Event,
  SNSMessage,
  snsMessageSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { METHOD } from "../../../app/common/entities";
import { processS3Record } from "../../../app/services/s3-notification";
import {
  handler,
  InvalidOperationError,
  method,
} from "../../../app/utils/api-handler";

/**
 * S3 Notification API Handler
 *
 * Processes AWS S3 object creation notifications sent via SNS.
 * The handler delegates to validateRequest() and processS3Record() from the service layer.
 * All error handling is managed by the centralized handler wrapper.
 *
 * @route POST /api/files/s3-notification
 */
export default handler(method(METHOD.POST), async (req, res) => {
  const { s3Event, snsMessage } = await validateRequest(req);
  await processS3Record(s3Event, snsMessage);
  res.status(200).end();
});

async function validateRequest(req: NextApiRequest): Promise<{
  s3Event: S3Event;
  snsMessage: SNSMessage;
}> {
  const snsMessage = await snsMessageSchema.validate(req.body);
  const s3Event = await validateSNSMessage(snsMessage);
  return { s3Event, snsMessage };
}

async function validateSNSMessage(message: SNSMessage): Promise<S3Event> {
  return new Promise((resolve, reject) => {
    const validator = new MessageValidator();
    validator.validate(message, (err, validatedMessage) => {
      if (err) {
        reject(new SNSSignatureValidationError());
        return;
      }
      if (!validatedMessage) {
        reject(new InvalidOperationError("SNS validation returned no message"));
        return;
      }
      try {
        const s3Event = JSON.parse(validatedMessage.Message as string);
        resolve(s3Event);
      } catch (parseError) {
        reject(
          new InvalidOperationError("Failed to parse S3 event from SNS message")
        );
      }
    });
  });
}
```

### Service (`app/services/s3-notification.ts`)

```typescript
import {
  ETagMismatchError,
  InvalidS3KeyFormatError,
  UnknownFolderTypeError,
} from "../apis/catalog/hca-atlas-tracker/aws/errors";
import {
  S3Event,
  S3EventRecord,
  s3EventSchema,
  SNSMessage,
} from "../apis/catalog/hca-atlas-tracker/aws/schemas";
import {
  validateS3BucketAuthorization,
  validateSNSTopicAuthorization,
} from "../config/aws-resources";
import { InvalidOperationError } from "../utils/api-handler";
import { doTransaction, query } from "./database";

/**
 * Processes the S3 record from the event
 * @param s3Event - The validated S3 event containing a single record
 * @param snsMessage - The validated SNS message containing the S3 event
 * @throws InvalidOperationError if multiple records are present
 */
export async function processS3Record(
  s3Event: S3Event,
  snsMessage: SNSMessage
): Promise<void> {
  validateSNSTopicAuthorization(snsMessage.TopicArn);

  if (s3Event.Records.length !== 1) {
    throw new InvalidOperationError(
      `Expected exactly 1 S3 record, but received ${s3Event.Records.length} records`
    );
  }

  s3EventSchema.validateSync(s3Event);
  authorizeS3Buckets(s3Event);

  const record = s3Event.Records[0];
  await saveFileRecord(record);
}

/**
 * Saves or updates a file record in the database with idempotency handling
 * @param record - The S3 event record containing bucket, object, and event metadata
 * @throws ETagMismatchError if ETags don't match (indicates potential corruption)
 * @throws InvalidS3KeyFormatError if S3 key doesn't have required path segments
 * @throws UnknownFolderTypeError if folder type is not recognized
 * @throws Error if atlas lookup fails for integrated objects/manifests
 */
async function saveFileRecord(record: S3EventRecord): Promise<void> {
  const { bucket, object } = record.s3;

  const sha256 = extractSHA256FromS3Object(object);
  const fileType = determineFileType(object.key);
  const atlasId = await determineAtlasId(object.key, fileType);

  await doTransaction(async (transaction) => {
    await transaction.query(
      `UPDATE hat.files SET is_latest = FALSE WHERE bucket = $1 AND key = $2`,
      [bucket.name, object.key]
    );

    const result = await transaction.query(
      `
      INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, sha256_client, is_latest, file_type, atlas_id)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8)
      ON CONFLICT (bucket, key, version_id) 
      DO UPDATE SET is_latest = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE files.etag = EXCLUDED.etag
      RETURNING (CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END) as operation
    `,
      [
        bucket.name,
        object.key,
        object.versionId,
        object.eTag,
        object.size,
        sha256,
        fileType,
        atlasId,
      ]
    );

    if (result.rows.length === 0) {
      throw new ETagMismatchError(
        bucket.name,
        object.key,
        object.versionId,
        "existing",
        object.eTag
      );
    }
  });
}
```

### AWS Schemas (`app/apis/catalog/hca-atlas-tracker/aws/schemas.ts`)

```typescript
import { object, string, array } from "yup";

export const snsMessageSchema = object({
  Type: string().required(),
  MessageId: string().required(),
  TopicArn: string().required(),
  Message: string().required(),
  Timestamp: string().required(),
  SignatureVersion: string().required(),
  Signature: string().required(),
  SigningCertURL: string().required(),
}).required();

export const s3EventSchema = object({
  Records: array().of(/* S3EventRecord schema */).required(),
}).required();
```

### AWS Errors (`app/apis/catalog/hca-atlas-tracker/aws/errors.ts`)

```typescript
import {
  ForbiddenError,
  InvalidOperationError,
  UnauthenticatedError,
} from "../../../../utils/api-handler";

export class SNSSignatureValidationError extends UnauthenticatedError {
  name = "SNSSignatureValidationError";
  constructor() {
    super("SNS signature validation failed");
  }
}

export class UnauthorizedAWSResourceError extends ForbiddenError {
  name = "UnauthorizedAWSResourceError";
  constructor(resourceType: string, resourceArn: string) {
    super(`Unauthorized ${resourceType}: ${resourceArn}`);
  }
}

export class InvalidS3KeyFormatError extends InvalidOperationError {
  name = "InvalidS3KeyFormatError";
  constructor(key: string) {
    super(
      `Invalid S3 key format: ${key}. Expected format: network/atlas/folder/file`
    );
  }
}
```

This architecture demonstrates enterprise-grade patterns including:

- Clean handler delegation to service layer
- Comprehensive error handling with proper HTTP status mapping
- Database transactions for data consistency
- Custom authentication for AWS resources
- Complete JSDoc documentation
- AWS-specific error classes and schemas
