import pg from "pg";

/**
 * Substitute connection information with information for the test database.
 */

export function getPoolConfig(): pg.PoolConfig {
  return {
    connectionTimeoutMillis: 5000,
    database: "atlas-tracker-test",
    host: "localhost",
    idleTimeoutMillis: 100,
    max: 10,
  };
}
