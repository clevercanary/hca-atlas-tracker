import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/pg-migrate-connect-config";

// Prevent migration-down from running in production and dev environments
if (process.env.APP_ENV === "aws-dev" || process.env.APP_ENV === "aws-prod") {
  console.error(
    "ERROR: migrate:down is disabled in production and dev environments."
  );
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
