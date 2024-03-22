import { TokenInfo } from "google-auth-library";
import pg from "pg";
import { getAuthClient } from "./auth-client-service";

const { Pool } = pg;

const authClient = getAuthClient();
const accessTokensInfo = new Map<string, TokenInfo>();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
