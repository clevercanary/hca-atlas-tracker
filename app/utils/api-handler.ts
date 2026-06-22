import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { ValidationError } from "yup";
import { nextAuthOptions } from "../../site-config/hca-atlas-tracker/local/authentication/next-auth-config";
import {
  HCAAtlasTrackerDBUser,
  ROLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import { FormResponseErrors } from "../hooks/useForm/common/entities";
import {
  atlasIsPublished,
  getAtlasIdByUrlParameter,
} from "../services/atlases";
import { query } from "../services/database";
import {
  ApiError,
  ForbiddenError,
  InvalidOperationError,
  NotFoundError,
  UnauthenticatedError,
} from "./api-errors";
import { S3KeyFormatError } from "./files";

interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void,
) => Promise<void>;

export type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void>;

/**
 * Creates an API handler function that calls the provided middleware functions in order for as long as each one calls `next` function passed to it.
 * @param funcs - Middleware functions.
 * @returns API handler function.
 */
export function handler(...funcs: MiddlewareFunction[]): Handler {
  return async (req, res) => {
    try {
      for (const f of funcs) {
        let done = true;
        await f(req, res, () => (done = false));
        if (done) return;
      }
    } catch (e) {
      console.error(e);
      respondError(res, e);
    }
  };
}

/**
 * Creates an API handler function that calls different handlers depending on request method, responding with an error if none match.
 * @param handlers - Object mapping request method to handler function.
 * @returns API handler function.
 */
export function handleByMethod(
  handlers: Partial<Record<METHOD, Handler>>,
): Handler {
  const allowHeaderText = Object.keys(handlers).join(", ");
  return async (req, res) => {
    try {
      const method = req.method;
      const handler = hasHandlerForMethod(method) && handlers[method];
      if (handler) {
        return await handler(req, res);
      } else {
        res.status(405).setHeader("Allow", allowHeaderText).end();
      }
    } catch (e) {
      console.error(e);
      respondError(res, e);
    }
  };

  function hasHandlerForMethod(method: string | undefined): method is METHOD {
    return typeof method === "string" && Object.hasOwn(handlers, method);
  }
}

/**
 * Creates a middleware function that rejects requests that don't have the specified request method.
 * @param methodName - Allowed request method.
 * @returns middleware function restricting requests to the specified method.
 */
export function method(methodName: METHOD): MiddlewareFunction {
  return async (req, res, next) => {
    if (req.method !== methodName) {
      res.status(405).setHeader("Allow", methodName).end();
    } else {
      next();
    }
  };
}

/**
 * Middleware function that throws an error for requests from users who aren't registered and enabled.
 * @param req - Next API request.
 * @param res - Next API response.
 * @param next - Middleware next function.
 */
export const registeredUser: MiddlewareFunction = async (req, res, next) => {
  await confirmUserAccountIsValid(req, res);
  next();
};

/**
 * Middleware function that updates the request's `atlasId` parameter to be a resolved UUID.
 * @param req - Next API request to resolve atlas ID on.
 * @param res - Next API response (unused).
 * @param next - Middleware next function.
 */
export const resolveAtlasId: MiddlewareFunction = async (req, res, next) => {
  const atlasIdParam = req.query.atlasId as string;
  req.query.atlasId = await avoidPublicNotFoundErrors(req, res, () =>
    getAtlasIdByUrlParameter(atlasIdParam),
  );
  next();
};

/**
 * Creates a middleware function that, unless the requested atlas is published, rejects requests from users who aren't enabled with the specified role.
 * @param allowedRoles - Allowed user roles.
 * @returns middleware function restricting, by role, requests that are made to unpublished atlases.
 */
export function publishedOrRole(
  allowedRoles: ROLE | ROLE[],
): MiddlewareFunction {
  const roleMiddleware = role(allowedRoles);
  return async (req, res, next) => {
    const atlasId = req.query.atlasId as string;
    const isPublished = await avoidPublicNotFoundErrors(req, res, () =>
      atlasIsPublished(atlasId),
    );
    if (isPublished) {
      next();
    } else {
      await roleMiddleware(req, res, next);
    }
  };
}

/**
 * Creates a middleware function that rejects requests from users who aren't enabled with the specified role.
 * @param allowedRoles - Allowed user roles.
 * @returns middleware function restricting requests to enabled users with the specified role.
 */
export function role(allowedRoles: ROLE | ROLE[]): MiddlewareFunction {
  const allowedRolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];
  return async (req, res, next) => {
    const user = await getRegisteredActiveUser(req, res);
    if (!user || user.disabled || !allowedRolesArray.includes(user.role)) {
      const userProfile = await getProvidedUserProfile(req, res);
      res.status(userProfile ? 403 : 401).end();
    } else {
      next();
    }
  };
}

/**
 * Middleware function that throws an error for a request from an integration lead who is not associated with the atlas from the atlasId URL parameter.
 * @param req - Next API request.
 * @param res - Next API response.
 * @param next - Middleware next function.
 */
export const integrationLeadAssociatedAtlasOnly: MiddlewareFunction = async (
  req,
  res,
  next,
) => {
  const user = await getRegisteredActiveUser(req, res);
  if (user.role === ROLE.INTEGRATION_LEAD) {
    const atlasId = req.query.atlasId as string;
    if (!user.role_associated_resource_ids.includes(atlasId)) {
      res.status(403).json({ message: "Must be user's associated atlas" });
      return;
    }
  }
  next();
};

/**
 * Retrieves a string-valued query parameter from a request, throwing an error if the parameter doesn't exist or doesn't match a given regular expression.
 * @param req - Next API request.
 * @param paramName - Parameter name to get.
 * @param paramRegExp - Regular expression to match parameter against.
 * @returns parameter value.
 */
export function getRequiredParam(
  req: NextApiRequest,
  paramName: string,
  paramRegExp?: RegExp,
): string {
  const param = getOptionalParam(req, paramName, paramRegExp);
  if (param === undefined) {
    throw new InvalidOperationError(
      `Missing ${JSON.stringify(paramName)} parameter`,
    );
  }
  return param;
}

/**
 * Retrieves an optional string-valued query parameter from a request, throwing an error if the parameter is present but doesn't match a given regular expression.
 * @param req - Next API request.
 * @param paramName - Parameter name to get.
 * @param paramRegExp - Regular expression to match parameter against.
 * @returns parameter value, if present.
 */
export function getOptionalParam(
  req: NextApiRequest,
  paramName: string,
  paramRegExp?: RegExp,
): string | undefined {
  const param = getMappedOptionalParam(req, paramName, (v) => v);
  if (paramRegExp && param !== undefined && !paramRegExp.test(param)) {
    throw new InvalidOperationError(
      `${JSON.stringify(paramName)} parameter must match ${paramRegExp}`,
    );
  }
  return param;
}

/**
 * Retrieves an optional string-valued query parameter from a request and applies a mapping function to it, throwing an error if the parameter is not provided as a string.
 * @param req - Next API request.
 * @param paramName - Parameter name to get.
 * @param mapParamValue - Function to apply to the parameter value.
 * @returns mapped parameter value, if available.
 */
export function getMappedOptionalParam<T>(
  req: NextApiRequest,
  paramName: string,
  mapParamValue: (v: string, p: string) => T,
): T | undefined {
  const param = req.query[paramName];
  if (param === undefined) return;
  if (typeof param !== "string") {
    throw new InvalidOperationError(
      `${JSON.stringify(paramName)} parameter must be a string`,
    );
  }
  return mapParamValue(param, paramName);
}

/**
 * Create a query parameter parsing function that restricts the parameter value to being one of a list of allowed values, and throws an error if it's not.
 * @param allowedValues - Allowed values for the query parameter.
 * @returns function to be used to parse the query parameter.
 */
export function paramParserForOneOf<T extends string>(
  allowedValues: readonly T[],
): (v: string, p: string) => T {
  return (value, paramName) => {
    if (allowedValues.includes(value as T)) return value as T;
    throw new InvalidOperationError(
      `Parameter ${JSON.stringify(paramName)} must be one of: ${allowedValues.join(", ")}`,
    );
  };
}

/**
 * Parse a query parameter value representing a comma-separated list, trimming whitespace from each item and dropping empty items.
 * @param value - Query parameter value to parse.
 * @returns array of strings representing the parsed list.
 */
export function parseListParam(value: string): string[] {
  return value
    .split(",")
    .map((tier) => tier.trim())
    .filter(Boolean);
}

/**
 * Call a given function, and if it throws a `NotFoundError` and the request was made publicly, throw an authentication error instead.
 * @param req - Next API request.
 * @param res - Next API response.
 * @param f - Function to call.
 * @returns result of calling the given function.
 */
async function avoidPublicNotFoundErrors<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  f: () => Promise<T>,
): Promise<T> {
  try {
    return await f();
  } catch (err) {
    if (err instanceof NotFoundError) await confirmUserAccountIsValid(req, res);
    throw err;
  }
}

/**
 * Throw an error if a request was not made by a registered user with an enabled account.
 * @param req - Next API request.
 * @param res - Next API response.
 */
async function confirmUserAccountIsValid(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const user = await getRegisteredActiveUser(req, res);
  if (user.disabled) throw new ForbiddenError();
}

export async function getActiveUserRole(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<ROLE> {
  return (await getActiveUser(req, res))?.role ?? ROLE.UNREGISTERED;
}

export async function getActiveUser(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<HCAAtlasTrackerDBUser | null> {
  const userProfile = await getProvidedUserProfile(req, res);
  const email = userProfile?.email;
  if (email) {
    const { rows } = await query<HCAAtlasTrackerDBUser>(
      "SELECT * FROM hat.users WHERE email=$1",
      [email],
    );
    if (rows.length > 0) return rows[0];
  }
  return null;
}

export async function getRegisteredActiveUser(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<HCAAtlasTrackerDBUser> {
  const user = await getActiveUser(req, res);
  if (!user) {
    const userProfile = await getProvidedUserProfile(req, res);
    throw new (userProfile ? ForbiddenError : UnauthenticatedError)(
      "User must be registered",
    );
  }
  return user;
}

/**
 * Send an error response, setting status and message based on error type.
 * @param res - Next API response.
 * @param error - Error or other thrown value.
 */
function respondError(res: NextApiResponse, error: unknown): void {
  let status = 500;
  let errorInfo: FormResponseErrors;
  if (error instanceof ApiError) {
    status = error.statusCode;
    errorInfo =
      error.fieldPath === null
        ? { message: error.message }
        : { errors: { [error.fieldPath]: [error.message] } };
  } else if (error instanceof ValidationError) {
    status = 400;
    errorInfo = error.path
      ? {
          errors: {
            [error.path]: error.errors,
          },
        }
      : {
          message: error.message,
        };
  } else if (error instanceof S3KeyFormatError) {
    status = 400;
    errorInfo = { message: error.message };
  } else if (error instanceof Error && typeof error.stack === "string") {
    errorInfo = { message: error.stack };
  } else {
    errorInfo = { message: String(error) };
  }
  res.status(status).json(errorInfo);
}

export async function getProvidedUserProfile(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<UserProfile | null> {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session) return null;
  // TODO: Should `expires` be checked?
  if (!session.user?.email)
    throw new UnauthenticatedError("Email not provided by authentication");
  // TODO: different handling of missing values?
  return {
    email: session.user.email,
    name: session.user.name ?? "",
    picture: session.user.image ?? "",
  };
}
