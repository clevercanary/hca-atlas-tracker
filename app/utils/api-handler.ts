import { OAuth2Client, TokenInfo } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";
import { InferType, Schema, ValidationError } from "yup";
import { METHOD } from "../common/entities";
import { FormResponseErrors } from "../hooks/useForm/common/entities";
import { RefreshDataNotReadyError } from "../services/common/refresh-service";
import { query } from "../services/database";

export type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => Promise<void>;

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const authClient = new OAuth2Client();
const accessTokensInfo = new Map<string, TokenInfo>();

/**
 * Creates an API handler function that calls the provided middleware functions in order for as long as each one calls `next` function passed to it.
 * @param funcs - Middleware functions.
 * @returns API handler function.
 */
export function handler(...funcs: MiddlewareFunction[]): Handler {
  return async (req, res) => {
    for (const f of funcs) {
      let done = true;
      await f(req, res, () => (done = false));
      if (done) return;
    }
  };
}

/**
 * Creates an API handler function that calls different handlers depending on request method, responding with an error if none match.
 * @param handlers - Object mapping request method to handler function.
 * @returns API handler function.
 */
export function handleByMethod(
  handlers: Partial<Record<METHOD, Handler>>
): Handler {
  const allowHeaderText = Object.keys(handlers).join(", ");
  return async (req, res) => {
    const method = req.method;
    const handler = hasHandlerForMethod(method) && handlers[method];
    if (handler) {
      return await handler(req, res);
    } else {
      res.status(405).setHeader("Allow", allowHeaderText).end();
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
 * Creates a middleware function that rejects requests from users who don't have the specified role.
 * @param roleName - Allowed user role.
 * @returns middleware function restricting requests to users with the specified role.
 */
export function role(roleName: string): MiddlewareFunction {
  return async (req, res, next) => {
    const role = await getUserRoleFromAuthorization(req.headers.authorization);
    if (role !== roleName) {
      res.status(role === null ? 401 : 403).end();
    } else {
      next();
    }
  };
}

/**
 * Retrieves a string-valued query parameter from a request, sending an error response if the parameter doesn't exist or doesn't match a given regular expression.
 * @param req - Next API request.
 * @param res - Next API response.
 * @param paramName - Parameter name to get.
 * @param paramRegExp - Regular expression to match parameter against.
 * @returns parameter value, or null if an error response was sent.
 */
export function handleRequiredParam(
  req: NextApiRequest,
  res: NextApiResponse,
  paramName: string,
  paramRegExp?: RegExp
): null | string {
  const param = req.query[paramName];
  if (typeof param !== "string") {
    res.status(400).json({ message: `Missing ${paramName} parameter` });
    return null;
  }
  if (paramRegExp && !paramRegExp.test(param)) {
    res
      .status(400)
      .json({ message: `${paramName} parameter must match ${paramRegExp}` });
    return null;
  }
  return param;
}

export async function getUserRoleFromAuthorization(
  authorization: string | undefined
): Promise<string | null> {
  const accessTokenInfo = await getAccessTokenInfo(authorization);
  const email = accessTokenInfo?.email;
  if (email && accessTokenInfo.email_verified) {
    const { rows } = await query("SELECT role FROM hat.users WHERE email=$1", [
      email,
    ]);
    if (rows.length > 0) return rows[0].role;
  }
  return null;
}

async function getAccessTokenInfo(
  authorization: string | undefined
): Promise<TokenInfo | null> {
  if (!authorization) return null;
  const token = /^Bearer (.+)$/.exec(authorization)?.[1];
  if (!token) return null;
  let tokenInfo = accessTokensInfo.get(token);
  if (!tokenInfo)
    accessTokensInfo.set(
      token,
      (tokenInfo = await authClient.getTokenInfo(token))
    );
  return tokenInfo;
}

/**
 * Get data validated with a Yup schema, and send an error response if validation fails.
 * @param res - Next API response.
 * @param schema - Yup schema.
 * @param data - Data to validate.
 * @returns array of data and boolean; if an error response was sent, data is null and boolean is true.
 */
export async function handleValidation<T extends Schema>(
  res: NextApiResponse,
  schema: T,
  data: unknown
): Promise<[InferType<T>, false] | [null, true]> {
  try {
    return [await schema.validate(data), false];
  } catch (e) {
    if (e instanceof ValidationError) {
      respondValidationError(res, e);
      return [null, true];
    } else {
      throw e;
    }
  }
}

/**
 * Get value from data subject to refreshing, and send an error response if the data is not initialized yet.
 * @param res - Next API response.
 * @param getValue - Function to get the value.
 * @returns array of value and boolean; if an error response was sent, value is null and boolean is true.
 */
export function handleGetRefreshValue<T>(
  res: NextApiResponse,
  getValue: () => T
): [T, false] | [null, true] {
  try {
    return [getValue(), false];
  } catch (e) {
    if (e instanceof RefreshDataNotReadyError) {
      res
        .status(503)
        .appendHeader("Retry-After", "20")
        .json({ message: e.message });
      return [null, true];
    }
    throw e;
  }
}

/**
 * Send an error response based on a Yup validation error.
 * @param res - Next API response.
 * @param error - ValidationError.
 */
export function respondValidationError(
  res: NextApiResponse,
  error: ValidationError
): void {
  const errorInfo: FormResponseErrors = error.path
    ? {
        errors: {
          [error.path]: error.errors,
        },
      }
    : {
        message: error.message,
      };
  res.status(400).json(errorInfo);
}
