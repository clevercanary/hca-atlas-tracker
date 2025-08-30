import pg from "pg";
import { getPoolConfig } from "../utils/pg-app-connect-config";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig());
  }
  return pool;
}

export function query<T extends pg.QueryResultRow>(
  queryTextOrConfig: string | pg.QueryConfig<unknown[]>,
  values?: unknown[] | undefined,
  client?: pg.PoolClient
): Promise<pg.QueryResult<T>> {
  return client
    ? client.query<T>(queryTextOrConfig, values)
    : getPool().query<T>(queryTextOrConfig, values);
}

/**
 * Perform a database transaction, with automatic client management and rollback on error.
 * @param func - Function to receive a Postgres client and perform queries.
 * @param catchFunc - Function to handle thrown errors; if present, errors will not be automatically re-thrown.
 * @param finallyFunc - Function to call after the client is released, whether or not an error was thrown.
 * @returns result of evaluating the functions.
 */
export async function doTransaction<T>(
  func: (client: pg.PoolClient) => Promise<T>,
  catchFunc?: (e: unknown) => T | Promise<T>,
  finallyFunc?: () => void | Promise<void>
): Promise<T> {
  const client = await getPoolClient();
  try {
    await client.query("BEGIN");
    const result = await func(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    if (catchFunc) return await catchFunc(e);
    else throw e;
  } finally {
    client.release();
    await finallyFunc?.();
  }
}

/**
 * Call a given function using the given client if specified, or in a new transaction otherwise.
 * @param client - Postgres client or undefined.
 * @param func - Function to call.
 * @returns result of evaluating the function.
 */
export function doOrContinueTransaction<T>(
  client: pg.PoolClient | undefined,
  func: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (client) return func(client);
  else return doTransaction(func);
}

export function getPoolClient(): Promise<pg.PoolClient> {
  return getPool().connect();
}

export async function endPgPool(): Promise<void> {
  if (pool) {
    const p = pool;
    pool = null;
    await p.end();
  }
}
