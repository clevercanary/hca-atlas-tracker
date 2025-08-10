import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/pg-migrate-connect-config";

const { Pool } = pg;

const green = (text: string): string => `\x1b[32m${text}\x1b[0m`;

const runMigrations = async (): Promise<void> => {
  const poolConfig = getPoolConfig();
  const pool = new Pool(poolConfig);
  const client = await pool.connect();
  console.log(green(`Connected to database: ${poolConfig.database}`));

  await client.query("CREATE SCHEMA IF NOT EXISTS hat");
  console.log(green(`Schema hat created successfully`));

  await migrate({
    // specify the client to the migrate function
    count: Infinity, // Number of migrations to apply, Infinity applies all available
    dbClient: client,
    dir: "migrations", // Your migrations directory
    direction: "up",
    log: console.log, // Log function
    migrationsTable: "pgmigrations", // Default migrations table
    schema: "hat",
  });

  client.release(); // Release the client back to the pool
  pool.end(); // End the pool
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
