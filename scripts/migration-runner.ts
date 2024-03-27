import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/pg-connect-config";

const { Pool } = pg;

const runMigrations = async () => {
  const poolConfig = getPoolConfig();

  // Check and wait for password if it's a function (async generator for the token)
  if (typeof poolConfig.password === "function") {
    poolConfig.password = await poolConfig.password();
  }

  const pool = new Pool(poolConfig);
  const client = await pool.connect();

  await migrate({
    // specify the client to the migrate function
    dbClient: client,
    dir: "migrations", // Your migrations directory
    direction: "up",
    migrationsTable: "pgmigrations", // Default migrations table
    count: Infinity, // Number of migrations to apply, Infinity applies all available
    log: console.log, // Log function
  });

  await client.release(); // Release the client back to the pool
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
