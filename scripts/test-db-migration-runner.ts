import migrate from "node-pg-migrate";
import pg from "pg";
import { getPoolConfig } from "../app/utils/__mocks__/pg-connect-config";

const { Pool } = pg;

const runMigrations = async (): Promise<void> => {
  const poolConfig = getPoolConfig();

  const pool = new Pool(poolConfig);
  const client = await pool.connect();

  await migrate({
    count: Infinity,
    dbClient: client,
    dir: "migrations",
    direction: "up",
    migrationsTable: "pgmigrations",
  });

  client.release();
  pool.end();
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
