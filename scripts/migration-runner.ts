import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/pg-connect-config";

const { Pool } = pg;

const runMigrations = async (): Promise<void> => {
  const poolConfig = getPoolConfig();

  // Check and wait for password if it's a function (async generator for the token)
  if (typeof poolConfig.password === "function") {
    poolConfig.password = await poolConfig.password();
    console.log("IAM auth token generated:", poolConfig.password);
  }

  const pool = new Pool(poolConfig);
  const client = await pool.connect();

  await migrate({
    // specify the client to the migrate function
    count: Infinity, // Number of migrations to apply, Infinity applies all available
    dbClient: client,
    dir: "migrations", // Your migrations directory
    direction: "up",
    log: console.log, // Log function
    migrationsTable: "pgmigrations", // Default migrations table
  });

  client.release(); // Release the client back to the pool
  pool.end(); // End the pool
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
