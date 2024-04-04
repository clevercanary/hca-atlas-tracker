import pg from "pg";

/**
 * Substitute connection information with information for the test database.
 */

export function getPoolConfig(): pg.PoolConfig {
  return {
    database: "atlas-tracker-test",
    host: "localhost",
  };
}
