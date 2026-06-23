import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/pg-migrate-connect-config";
import { assertMigrationDownAllowed } from "./migration-down-guard";

// Block destructive migration rollbacks in deployed (AWS dev/prod) environments.
// Defense-in-depth alongside removing this script from the built image (see
// Dockerfile.node).
try {
  assertMigrationDownAllowed({
    appEnv: process.env.APP_ENV,
    nodeEnv: process.env.NODE_ENV,
  });
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

const { Pool } = pg;

const green = (text: string): string => `\x1b[32m${text}\x1b[0m`;

const runMigrationsDown = async (): Promise<void> => {
  const poolConfig = getPoolConfig();
  const pool = new Pool(poolConfig);
  const client = await pool.connect();
  console.log(green(`Connected to database: ${poolConfig.database}`));

  await client.query("CREATE SCHEMA IF NOT EXISTS hat");
  console.log(green(`Schema hat created successfully`));

  await migrate({
    // specify the client to the migrate function
    count: 1, // Rollback one migration
    dbClient: client,
    dir: "migrations", // Your migrations directory
    direction: "down",
    log: console.log, // Log function
    migrationsTable: "pgmigrations", // Default migrations table
    schema: "hat",
  });

  client.release(); // Release the client back to the pool
  pool.end(); // End the pool
};

runMigrationsDown().catch((error) => {
  console.error("Migration down failed:", error);
  process.exit(1);
});
