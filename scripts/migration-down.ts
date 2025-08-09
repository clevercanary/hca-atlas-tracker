import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/pg-migrate-connect-config";

const { Pool } = pg;

const runMigrationsDown = async (): Promise<void> => {
  const poolConfig = getPoolConfig();
  const pool = new Pool(poolConfig);
  const client = await pool.connect();
  console.log`Connected to database: ${poolConfig.database}`;

  await client.query("CREATE SCHEMA IF NOT EXISTS hat");
  console.log`Schema hat created successfully`;

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
