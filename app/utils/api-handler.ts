import { OAuth2Client, TokenInfo } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";
import pg from "pg";

import { Signer } from "@aws-sdk/rds-signer";

// Function to generate AWS RDS IAM authentication token
const generateAuthToken = async () => {
  const signer = new Signer({
    /**
     * Required. The hostname of the database to connect to.
     */
    hostname:
      "hca-atlas-tracker.cluster-cpaohu0f2w38.us-east-1.rds.amazonaws.com",
    /**
     * Required. The port number the database is listening on.
     */
    port: 5432,
    /**
     * Required. The username to login as.
     */
    username: "hca_atlas_tracker",
  });

  const token = await signer.getAuthToken();
  // Use this token as the password for connecting to your RDS instance
  return token;
};

const getPoolConfig = () => {
  console.log("NODE_ENV: ", process.env.NODE_ENV);

  if (process.env.APP_ENV === "aws-dev") {
    // Production config with IAM authentication
    return {
      user: "hca_atlas_tracker",
      host: " hca-atlas-tracker.cluster-cpaohu0f2w38.us-east-1.rds.amazonaws.com",
      database: "hcaatlastracker",
      port: 5432,
      password: generateAuthToken, // IAM auth token for production
      ssl: true,
      connectionTimeoutMillis: 5,
      idleTimeoutMillis: 10000,
    };
  } else {
    // Development config for local database
    return {
      user: "",
      host: "localhost",
      database: "atlas-tracker",
      port: 5432,
      password: "", // Local DB password
      ssl: false,
      connectionTimeoutMillis: 5,
      idleTimeoutMillis: 10000,
    };
  }
};

const { Pool } = pg;

export type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => Promise<void>;

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const authClient = new OAuth2Client();
const accessTokensInfo = new Map<string, TokenInfo>();

const pool = new Pool(getPoolConfig());

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
 * Creates a middleware function that rejects requests that don't have the specified request method.
 * @param methodName - Allowed request method.
 * @returns middleware function restricting requests to the specified method.
 */
export function method(methodName: "GET" | "POST"): MiddlewareFunction {
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
    const { rows } = await pool.query(
      "SELECT role FROM hat.users WHERE email=$1",
      [email]
    );
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

export function query(
  queryTextOrConfig: string | pg.QueryConfig<string[]>,
  values?: string[] | undefined
): Promise<pg.QueryResult> {
  return pool.query(queryTextOrConfig, values);
}

export function endPgPool(): void {
  pool.end();
}
