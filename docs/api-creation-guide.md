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
  - Error handling and HTTP status code mapping

### Service Layer (`app/services/`)
- **Location**: `app/services/[entity].ts`
- **Purpose**: Business logic and data operations
- **Responsibilities**:
  - Pure business logic
  - Database operations
  - Data transformations
  - Cross-service integrations
  - Domain-specific validations

## 2. Layer Responsibilities

### HTTP Handler Responsibilities
```typescript
// Example: pages/api/atlases/create.ts
export default handler(
  method(METHOD.POST),           // Method validation
  role(ROLE.CONTENT_ADMIN),      // Authentication/authorization
  async (req, res) => {
    const data = await newAtlasSchema.validate(req.body); // Request validation
    res.status(201).json(dbAtlasToApiAtlas(await createAtlas(data))); // Service call + response
  }
);
```

### Service Layer Responsibilities
```typescript
// Example: app/services/atlases.ts
export async function createAtlas(data: NewAtlasData): Promise<HCAAtlasTrackerDBAtlas> {
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

## 4. Custom Error Locations

### Service-Specific Errors
- **Location**: Within the service file (`app/services/[entity].ts`)
- **Purpose**: Domain-specific business logic errors
- **Pattern**:
```typescript
// In app/services/atlases.ts
export class AtlasNotFoundError extends Error {
  name = "AtlasNotFoundError";
}

export class DuplicateAtlasError extends Error {
  name = "DuplicateAtlasError";
}
```

### Common API Errors
- **Location**: `app/utils/api-handler.ts`
- **Purpose**: Generic HTTP-related errors
- **Available Errors**:
  - `InvalidOperationError` → 400 Bad Request
  - `UnauthenticatedError` → 401 Unauthorized
  - `ForbiddenError` → 403 Forbidden
  - `NotFoundError` → 404 Not Found
  - `AccessError` → 403 Forbidden

## 5. Error Handling

### Error Flow
1. **Service Layer**: Throws domain-specific errors
2. **HTTP Handler**: Catches and maps to HTTP status codes
3. **API Handler Utility**: Provides automatic error mapping

### Error Mapping
```typescript
// Automatic mapping in api-handler.ts
if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
if (error instanceof UnauthenticatedError) return res.status(401).json({ error: "Unauthorized" });
if (error instanceof ForbiddenError) return res.status(403).json({ error: "Forbidden" });
if (error instanceof NotFoundError) return res.status(404).json({ error: "Not found" });
if (error instanceof InvalidOperationError) return res.status(400).json({ error: error.message });
```

### Custom Error Status Mapping
- **400 Bad Request**: `ValidationError`, `InvalidOperationError`, domain validation errors
- **401 Unauthorized**: `UnauthenticatedError`, authentication failures
- **403 Forbidden**: `ForbiddenError`, `AccessError`, authorization failures
- **404 Not Found**: `NotFoundError`, resource not found
- **500 Internal Server Error**: Unexpected errors, database errors

## 6. Service Layer Response Pattern

### Service Functions Return Data, Not HTTP Responses
```typescript
// ✅ Correct - Service returns data
export async function createAtlas(data: NewAtlasData): Promise<HCAAtlasTrackerDBAtlas> {
  // Business logic
  return createdAtlas;
}

// ❌ Incorrect - Service should not handle HTTP responses
export async function createAtlas(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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

## 10. Complete Example

### API Handler (`pages/api/files/create.ts`)
```typescript
import { METHOD } from "../../../app/common/entities";
import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { newFileSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { createFile } from "../../../app/services/files";
import { handler, method, role } from "../../../app/utils/api-handler";

export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const data = await newFileSchema.validate(req.body);
    const file = await createFile(data);
    res.status(201).json(file);
  }
);
```

### Service (`app/services/files.ts`)
```typescript
import { NewFileData } from "../apis/catalog/hca-atlas-tracker/common/schema";
import { HCAAtlasTrackerDBFile } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { query } from "./database";

export class FileAlreadyExistsError extends Error {
  name = "FileAlreadyExistsError";
}

export async function createFile(data: NewFileData): Promise<HCAAtlasTrackerDBFile> {
  // Check if file already exists
  const existing = await query("SELECT id FROM files WHERE key = $1", [data.key]);
  if (existing.rows.length > 0) {
    throw new FileAlreadyExistsError(`File with key ${data.key} already exists`);
  }
  
  // Create file
  const result = await query(
    "INSERT INTO files (key, bucket, size) VALUES ($1, $2, $3) RETURNING *",
    [data.key, data.bucket, data.size]
  );
  
  return result.rows[0];
}
```

### Schema (`app/apis/catalog/hca-atlas-tracker/common/schema.ts`)
```typescript
export const newFileSchema = object({
  key: string().required(),
  bucket: string().required(),
  size: number().positive().required(),
}).required();

export type NewFileData = InferType<typeof newFileSchema>;
```

This architecture ensures clean separation of concerns, consistent error handling, and maintainable code structure across all APIs in the project.
