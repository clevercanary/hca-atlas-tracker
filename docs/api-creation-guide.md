# API Creation Guide

This guide defines the architectural patterns and guidelines for creating APIs in the HCA Atlas Tracker project.

## HTTP Controllers (`pages/api/`)

**Guidelines:**

- Use `handler()` wrapper from `utils/api-handler.ts`
- Single method: `method(METHOD.POST)` | Multiple methods: `handleByMethod({[METHOD.GET]: getHandler, [METHOD.PUT]: putHandler})`
- Use `role(ROLE.CONTENT_ADMIN)` for standard authentication OR handle custom auth in service layer
- Validate request body with Yup schemas before calling service layer
- Delegate all business logic to service layer functions
- Avoid containing database queries, business rules, or complex validation logic
- Format responses using appropriate HTTP status codes (200, 201, etc.)
- Let centralized error handler map thrown errors to HTTP responses

**File Location:** `pages/api/[resource]/[action].ts`
**Key Dependencies:** `utils/api-handler.ts`, `app/common/entities.ts` (METHOD, ROLE enums)

## Service Layer (`app/services/`)

**Guidelines:**

- Contain all business logic and domain rules
- Perform all database operations and transactions
- Throw domain-specific error classes (never return error objects)
- Return data objects (never HTTP responses)
- Have comprehensive JSDoc documentation with @throws for all possible errors
- Export only functions called by API handlers or other services
- Keep helper functions private within the service file
- Use `doTransaction()` for multi-step database operations requiring consistency

**File Location:** `app/services/[entity].ts`
**Key Dependencies:** `./database.ts` (doTransaction, query), custom error classes

## Custom Errors

**Guidelines:**

- Inherit from base error classes in `utils/api-handler.ts`
- Use appropriate base class: `ValidationError` (400), `UnauthenticatedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409)
- Set descriptive error messages in constructor
- Should be thrown by service layer, never by HTTP handlers
- Should be documented in service function JSDoc with @throws

**AWS-Specific Errors:** `app/apis/catalog/hca-atlas-tracker/aws/errors.ts`
  - `ETagMismatchError` extends `ConflictError` and maps to HTTP 409 (used in S3/SNS notification processing to signal conflicts)
**Service-Specific Errors:** Within respective service files
**Base Classes:** `utils/api-handler.ts`

## Authentication & Authorization

**Guidelines:**

- Use `role(ROLE.CONTENT_ADMIN)` middleware for standard role-based auth
- Skip `role()` middleware for custom authentication (SNS signatures, etc.)
- Handle custom auth validation in service layer, not HTTP handler
- Throw `UnauthenticatedError` for invalid credentials (401)
- Throw `ForbiddenError` for insufficient permissions (403)
- Validate AWS resources using functions in `app/config/aws-resources.ts`

**Role Definitions:** `app/apis/catalog/hca-atlas-tracker/common/entities.ts`
**AWS Resource Validation:** `app/config/aws-resources.ts`

## Database Operations & Transactions

**Guidelines:**

- Use `doTransaction()` for operations requiring consistency across multiple queries
- Use PostgreSQL `ON CONFLICT` for idempotency handling
- Let database errors bubble up naturally (no try/catch wrapping in custom errors)
- Use parameterized queries to prevent SQL injection
- Return operation metadata when useful (inserted vs updated)
- Document transaction behavior in JSDoc

**Transaction Utility:** `app/services/database.ts`
**Pattern:** Atomic operations with automatic rollback on any thrown error

## Validation & Schemas

**Guidelines:**

- Define Yup schemas in `app/apis/catalog/hca-atlas-tracker/common/schema.ts`
- Define AWS-specific schemas in `app/apis/catalog/hca-atlas-tracker/aws/schemas.ts`
- Export both schema and inferred TypeScript type
- Validate request bodies in HTTP handlers before calling service layer
- Use schema validation in service layer for complex business rules

**Business Entities:** `app/apis/catalog/hca-atlas-tracker/common/entities.ts`
**AWS Entities:** `app/apis/catalog/hca-atlas-tracker/aws/entities.ts`

## Error Handling Flow

**Guidelines:**

- Service layer throws domain-specific errors
- HTTP handler catches nothing (centralized wrapper handles all errors)
- `handler()` wrapper automatically maps error classes to HTTP status codes
- Error inheritance determines HTTP status: `ValidationError` → 400, `UnauthenticatedError` → 401, `ForbiddenError` → 403, `NotFoundError` → 404, `ConflictError` → 409
- Error messages are preserved and returned to client for debugging

**Implementation:** `utils/api-handler.ts` contains centralized error mapping logic

## SNS/S3 ETag Mismatch Handling

When processing S3 notifications (SNS → `/api/sns`):

- The data layer (`app/data/files.ts`) performs a pre-check on ETag. If a record exists with the same bucket/key/version but a different ETag, `upsertFileRecord()` throws `ETagMismatchError` directly. It also throws `ETagMismatchError` when the `ON CONFLICT (sns_message_id) ... WHERE files.etag = EXCLUDED.etag` condition fails (idempotent re-delivery with a different ETag).
- The service layer (`app/services/s3-notification.ts`) no longer checks for `null` from `upsertFileRecord()`; it simply calls it and propagates `ETagMismatchError`.
- `respondError()` maps `ConflictError` to HTTP 409, causing SNS to retry and eventually route to the DLQ after max retries.
- Rationale: treat ETag mismatches as server-side conflicts to ensure reliable DLQ capture rather than a 400/500 ambiguity.
