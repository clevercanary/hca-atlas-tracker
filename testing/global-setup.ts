import pg from "pg";
import { getPoolConfig } from "../app/utils/__mocks__/pg-connect-config";
import { INITIAL_TEST_USERS } from "./constants";

const { Pool } = pg;

export default async function setup(): Promise<void> {
  const pool = new Pool(getPoolConfig());
  for (const user of INITIAL_TEST_USERS) {
    await pool.query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [user.disabled.toString(), user.email, user.name, user.role]
    );
  }
  pool.end();
}
