import pg from "pg";
import { getPoolConfig } from "../utils/pg-app-connect-config";

const { Pool } = pg;

const pool = new Pool(getPoolConfig());

export function query<T extends pg.QueryResultRow>(
  queryTextOrConfig: string | pg.QueryConfig<unknown[]>,
  values?: unknown[] | undefined,
  client?: pg.PoolClient
): Promise<pg.QueryResult<T>> {
  return client
    ? client.query<T>(queryTextOrConfig, values)
    : pool.query<T>(queryTextOrConfig, values);
}

export function getPoolClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export function endPgPool(): void {
  pool.end();
}
