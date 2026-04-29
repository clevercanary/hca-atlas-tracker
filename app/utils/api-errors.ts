export abstract class ApiError extends Error {
  abstract statusCode: number;
  fieldPath: string | null;
  constructor(message?: string, fieldPath: string | null = null) {
    super(message);
    this.fieldPath = fieldPath;
  }
}

export class InvalidOperationError extends ApiError {
  name = "InvalidOperationError";
  statusCode = 400;
}

// Represents a request conflict (e.g., ETag mismatch/version conflicts)
// Maps to HTTP 409 Conflict
export class ConflictError extends ApiError {
  name = "ConflictError";
  statusCode = 409;
}

export class UnauthenticatedError extends ApiError {
  name = "UnauthenticatedError";
  statusCode = 401;
}

export class ForbiddenError extends ApiError {
  name = "ForbiddenError";
  statusCode = 403;
}

export class AccessError extends ApiError {
  name = "AccessError";
  statusCode = 400;
}

export class NotFoundError extends ApiError {
  name = "NotFoundError";
  statusCode = 404;
}
