import { TokenInfo } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";
import pg from "pg";
import { getAuthClient } from "./auth-client-service";

const { Pool } = pg;

export type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => Promise<void>;

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const authClient = getAuthClient();
const accessTokensInfo = new Map<string, TokenInfo>();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export function handler(...funcs: MiddlewareFunction[]): Handler {
  return async (req, res) => {
    for (const f of funcs) {
      let done = true;
      await f(req, res, () => (done = false));
      if (done) return;
    }
  };
}

export function method(methodName: "GET" | "POST"): MiddlewareFunction {
  return async (req, res, next) => {
    if (req.method !== methodName) {
      res.status(405).setHeader("Allow", methodName).end();
    } else {
      next();
    }
  };
}

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
