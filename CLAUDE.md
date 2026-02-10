# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HCA Atlas Tracker is a Next.js application for tracking Human Cell Atlas (HCA) atlases through their lifecycle. It manages atlases, source studies, source datasets, component atlases, files, and validations with integrations to CELLxGENE, HCA Data Repository (Azul), Google Sheets, Crossref, and AWS services.

## Required Environment

- **Node.js**: `20.10.0` (specified in package.json engines)
- **Database**: PostgreSQL with schema `hat`
- **Python**: `3.12.4` (for CELLxGENE metadata scripts in `catalog/build/`)

## Common Development Commands

### Development and Build

```bash
npm run dev                  # Start development server (localhost:3000)
npm run build:local          # Build for local environment
npm run build:dev            # Build for dev environment
npm run build:prod           # Build for production environment
npm start                    # Start production server after build
```

### Database

```bash
createdb atlas-tracker       # Create main database (one-time setup)
npm run migrate              # Run all pending migrations
npm run migrate:down         # Rollback last migration
npm run dump-schema          # Export schema to schema.sql
```

### Testing

```bash
createdb atlas-tracker-test  # Create test database (one-time setup)
npm run test                 # Run all Jest tests (requires test database)
```

The test suite uses `--runInBand` to run tests sequentially, which is necessary for database state management.

### Linting and Formatting

```bash
npm run lint                 # Run ESLint
npm run check-format         # Check Prettier formatting (does not modify files)
```

### Other Commands

```bash
npm run build-catalog        # Build catalog files
npm run download-data-dictionary  # Download data dictionary
```

## Architecture Documentation

**Important:** This repository includes detailed architecture documentation in the `docs/` directory:

- **`docs/api-creation-guide.md`** - Architectural patterns for creating APIs (required reading for API work)
- **`docs/entity-relationship-model.md`** - Database schema and entity relationships (may be outdated)
- **`docs/s3-notification-design-decisions.md`** - S3 event processing architecture (may be outdated)
- **`docs/aws-resource-configuration.md`** - AWS resource setup and configuration
- **`docs/adr/`** - Architecture Decision Records

Always consult these documents when working on related features.

## High-Level Architecture

### Data Layer Pattern

**No ORM - Raw SQL with Transactions**

The application uses raw SQL queries via the `pg` library with a transaction-oriented architecture:

- **`app/services/database.ts`** - Core database utilities:
  - `query()` - Execute single queries against connection pool
  - `doTransaction()` - Wrap multiple queries in BEGIN/COMMIT/ROLLBACK
  - `doOrContinueTransaction()` - Reuse existing transaction if available, otherwise create new one

- **`app/data/`** - Low-level data access layer (SQL queries, minimal transformation)

- **`app/services/`** - Business logic layer (orchestration, multi-entity operations, validation rules)

**Layer Responsibilities:**

- **API Handlers** (`pages/api/`): HTTP routing, validation, response formatting
- **Service Layer** (`app/services/`): Business logic, database transactions, domain rules
- **Data Layer** (`app/data/`): SQL queries, minimal data transformation

**Service Layer Guidelines:**

- Contain all business logic and domain rules
- Throw domain-specific error classes (never return error objects)
- Return data objects (never HTTP responses)
- Use `doTransaction()` for multi-step operations requiring consistency
- Export only public functions; keep helpers private

**Pattern:**

```typescript
await doTransaction(async (client) => {
  await updateSourceStudy(id, data, client);
  await updateValidations(id, client);
  // All commit together or rollback on error
});
```

All queries use parameterized statements with `$1`, `$2` placeholders for SQL injection prevention.

### API Architecture

**Next.js API Routes with Middleware Pattern**

API routes in `pages/api/` use a composable middleware pattern defined in `app/utils/api-handler.ts`:

```typescript
handler(
  method(METHOD.PUT), // HTTP method guard
  role([ROLE.CONTENT_ADMIN]), // Role-based access control
  integrationLeadAssociatedAtlasOnly, // Resource-based access control
  async (req, res) => {
    /* handler */
  },
);
```

**Authentication:**

- NextAuth with Google OAuth
- Configuration in `site-config/hca-atlas-tracker/{local|dev|prod}/authentication/next-auth-config.ts`
- Session stored as JWT with 24-hour max age

**Authorization Roles:**

- `UNREGISTERED` - No account
- `STAKEHOLDER` - Basic registered user
- `INTEGRATION_LEAD` - Can edit assigned atlases only
- `CONTENT_ADMIN` - Can edit any atlas/study

**Error Handling:**
Custom exceptions in API handlers automatically map to HTTP status codes:

- `UnauthenticatedError` → 401
- `ForbiddenError` / `AccessError` → 403
- `NotFoundError` → 404
- `ConflictError` → 409 (ETag/version conflicts)
- `InvalidOperationError` → 400
- `ValidationError` (Yup) → 400 with field-level errors

**Error Flow:**

1. Service layer throws domain-specific errors
2. API handler catches nothing (centralized wrapper handles all errors)
3. `handler()` wrapper in `app/utils/api-handler.ts` automatically maps error classes to HTTP status codes
4. Error messages preserved and returned to client

**Special Case - ETag Mismatch:**
When processing S3 notifications, `ETagMismatchError` (extends `ConflictError`) is thrown when:

- A file record exists with same bucket/key/version but different ETag
- Idempotent re-delivery has a different ETag
  This maps to HTTP 409, causing SNS to retry and eventually route to DLQ after max retries.

### Component and View Architecture

**Separation of Concerns:**

- **`pages/`** - Next.js routing layer (pages and API routes)
- **`app/views/`** - Container components (data fetching, form management, access control)
- **`app/components/`** - Presentational components (UI rendering, organized by concern)

**View Pattern:**
Views use hooks for data fetching and form management:

- `useFetchAtlas()`, `useFetchData()` - Data fetching with auth, loading, and error states
- `useFormManager()` - Form lifecycle (`onSave`, `onCancel`, `onDelete`, access control)
- Forms use `react-hook-form` with Yup validation

**State Management:**

- Primarily local component state and React hooks
- Context API for cross-cutting concerns (auth, entity info, fetch state)
- No Redux/Zustand

### External Service Integrations

**CELLxGENE API** (`app/services/cellxgene.ts`):

- Auto-refresh cache periodically
- Maps DOIs to CELLxGENE collection IDs
- Retries on failure

**HCA Data Repository (Azul)** (`app/utils/hca-api.ts`):

- Query HCA projects by ID for source study validation
- Paginated project listing (75 per page)

**Google Sheets** (`app/utils/google-sheets-api.ts`):

- Service account authentication via `GOOGLE_SERVICE_ACCOUNT` env var
- Validate spreadsheet URLs and retrieve sheet metadata
- Error handling for 404 (not found) and 403 (permission denied)

**Crossref** (`app/utils/crossref/crossref-api.ts`):

- Resolve publication DOIs to metadata

**AWS S3** (`app/services/s3-operations.ts`):

- Generate presigned URLs (48-hour expiration)
- Bucket configured via `AWS_DATA_BUCKET` env var

**AWS SNS/S3 Event Processing** (`app/services/s3-notification.ts`):

- S3 events → SNS → API endpoint
- Parse S3 key, create file records, trigger validation
- Validates SNS topic and S3 bucket against `AWS_RESOURCE_CONFIG` whitelist

**AWS Batch** (`app/services/validator-batch.ts`):

- Submit asynchronous validation jobs

### Database Schema and Entity Relationships

The database uses schema `hat` (Human Atlas Tracker). See `docs/entity-relationship-model.md` for detailed documentation.

**Key Tables:**

- `hat.atlases` - Main atlas entities (top-level research projects)
- `hat.source_studies` - Scientific studies that publish datasets (associated with publications via DOI)
- `hat.source_datasets` - Individual datasets from scientific studies
- `hat.component_atlases` - Integrated objects (business term) that combine source datasets
- `hat.files` - File metadata with versioning, integrity validation, and S3 location
- `hat.validations` - Validation records for source studies
- `hat.users` - User accounts with roles
- `hat.comments` - Comment threads and replies

**Important Business Rules:**

1. **Files ARE the datasets/integrated objects**, not containers for them
   - File type determined by S3 path structure: `bio_network/atlas-name/folder-type/filename`

2. **File Type Determination:**
   - `source-datasets/` folder → `file_type = 'source_dataset'`
   - `integrated-objects/` folder → `file_type = 'integrated_object'`
   - `manifests/` folder → `file_type = 'ingest_manifest'`

3. **Entity Relationships:**
   - Atlas → Source Dataset: One-to-Many (determined by S3 path)
   - Atlas → Integrated Object: One-to-Many
   - Integrated Object ↔ Source Dataset: Many-to-Many (via array in component_atlases table)
   - Source Study → Source Dataset: One-to-Many

4. **File Processing Workflow:**
   - S3 upload → SNS notification → API endpoint (`/api/sns`)
   - Parse S3 key to extract atlas, file type, network
   - Create file record with appropriate foreign keys
   - Trigger validation and integrity checks
   - Update validation status based on results

5. **Integrity Validation:**
   - Files have `sha256_client` and `sha256_server` for integrity checks
   - `integrity_status`: 'pending', 'valid', 'invalid'
   - `is_latest` flag for version management

**Migrations:**

- Location: `migrations/` directory
- Tool: `node-pg-migrate`
- TypeScript files with timestamp prefix: `{timestamp}_{description}.ts`

## Testing Patterns

**Jest Configuration:**

- Test environment: `jsdom` (for React component testing)
- Setup file: `testing/setup.ts`
- Tests run sequentially (`--runInBand`) for database consistency
- Test database: `atlas-tracker-test`

**Test Structure:**

- Tests in `__tests__/` directory
- API route tests use `node-mocks-http` to mock Next.js request/response
- Database reset between tests via `resetDatabase()` helper
- External services mocked (NextAuth, Google APIs, Crossref, CELLxGENE, AWS)

**Common Test Utilities** (`testing/utils.ts`):

- `testApiRole()` - Test role-based access control
- `expectDbAtlasToMatchApi()` - Compare database and API representations
- `withConsoleErrorHiding()` - Suppress expected console errors

**Test Constants** (`testing/constants.ts`):

- Test users for each role (CONTENT_ADMIN, STAKEHOLDER, UNREGISTERED, etc.)
- Sample DOIs, publications, and entity data

## Code Style Enforcement

**ESLint Rules:**

- **JSDoc**: JSDoc comments are encouraged for functions
- **Explicit return types**: Functions generally require return types (with some exceptions for typed function expressions)
- **Sorted keys**: Object keys, destructuring, interfaces, and string enums must be alphabetically sorted
- **SonarJS**: Code quality and complexity checks
- **React hooks**: Exhaustive dependencies required

**Prettier:**

- Formatting enforced via `prettier` with `organize-imports` plugin
- Check with `npm run check-format`

## Environment Configuration

**Multi-Environment Setup:**

- Environments: `local`, `dev`, `prod`
- Configuration directory: `site-config/hca-atlas-tracker/{env}/`
- Selected via `NEXT_PUBLIC_SITE_CONFIG` environment variable
- Build scripts (`scripts/build.sh`, `scripts/set-version.sh`) generate config files

**Required Environment Variables:**

- `GOOGLE_SERVICE_ACCOUNT` - Service account JSON for Google Sheets API
- `GOOGLE_AUTH` - OAuth credentials JSON
- `AWS_DATA_BUCKET` - S3 bucket name for file storage
- `AWS_RESOURCE_CONFIG` - JSON with allowed SNS topics and S3 buckets

## Development Tips

### Running Single Tests

```bash
npm test -- <test-file-name>
# Example: npm test -- api-atlases-create.test
```

### Database Workflow

1. Make schema changes by creating a migration:

   ```bash
   # Migrations are TypeScript files in migrations/
   # Name pattern: {timestamp}_{description}.ts
   # Use node-pg-migrate API (see existing migrations for examples)
   ```

2. Run migration:

   ```bash
   npm run migrate
   ```

3. Export updated schema:
   ```bash
   npm run dump-schema
   ```

### Working with Validations

The validation framework is event-driven:

- Validations defined as objects with `validate()` function and `validationId`
- Validations are grouped by system (CELLxGENE, CAP, HCA)
- Status updated automatically when entities change
- See `app/services/validations.ts` and related files

### Docker Development

Build and run locally:

```bash
docker build --build-arg ENVIRONMENT=local -t tracker-node -f Dockerfile.node .
docker run -p 3000:3000 tracker-node
```

Replace `local` with `dev` or `prod` for other environments.

## Creating New APIs

When creating new API endpoints, follow the patterns in `docs/api-creation-guide.md`:

**1. API Handler Pattern** (`pages/api/[resource]/[action].ts`):

```typescript
// Single method
export default handler(
  method(METHOD.POST),
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  async (req, res) => {
    const validated = await schema.validate(req.body);
    const result = await serviceFunction(validated);
    res.status(201).json(result);
  },
);

// Multiple methods
export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.PUT]: putHandler,
  [METHOD.DELETE]: deleteHandler,
});
```

**2. Service Layer Function** (`app/services/[entity].ts`):

```typescript
/**
 * Description of what this function does.
 * @param param1 - Description.
 * @param client - Optional database client for transaction support.
 * @returns Description of return value.
 * @throws NotFoundError - When entity not found.
 * @throws ConflictError - When validation fails.
 */
export async function serviceFunction(
  param1: Type,
  client?: PoolClient,
): Promise<ReturnType> {
  return doOrContinueTransaction(client, async (txClient) => {
    // Business logic here
    // Use parameterized queries
    const result = await query(
      "SELECT * FROM hat.table WHERE id = $1",
      [param1],
      txClient,
    );

    if (!result.rows.length) {
      throw new NotFoundError("Entity not found");
    }

    return transformData(result.rows[0]);
  });
}
```

**3. Validation Schemas** (`app/apis/catalog/hca-atlas-tracker/common/schema.ts`):

```typescript
export const myEntitySchema = yup.object({
  field1: yup.string().required(),
  field2: yup.number().optional(),
});

export type MyEntityData = yup.InferType<typeof myEntitySchema>;
```

**Key Points:**

- API handlers should only route, validate, and format responses
- All business logic belongs in the service layer
- Service layer throws errors; never returns error objects
- Use `doTransaction()` for multi-step operations
- Document all possible errors with `@throws` in JSDoc
- Use PostgreSQL `ON CONFLICT` for idempotency

## Key Architectural Patterns

**Transaction Pattern:**
Services wrap multi-step operations in `doTransaction()` for atomicity.

**Middleware Composition:**
API routes compose cross-cutting concerns (auth, role checks, method guards) as middleware functions.

**Refresh Service Pattern:**
External data caches (CELLxGENE collections) auto-refresh based on timestamps with background updates.

**Event-Driven Workflow:**
S3 file uploads trigger SNS → API → Database Transaction → Validation cascade.

**Validation Framework:**
Validation rules defined declaratively with automatic status updates on entity changes.
