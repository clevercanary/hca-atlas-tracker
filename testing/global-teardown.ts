import pg from "pg";
import { getPoolConfig } from "../app/utils/__mocks__/pg-connect-config";
import { INITIAL_TEST_USERS } from "./constants";

const { Pool } = pg;

export default async function teardown(): Promise<void> {
  const pool = new Pool(getPoolConfig());
  for (const user of INITIAL_TEST_USERS) {
    await pool.query("DELETE FROM hat.users WHERE email=$1", [user.email]);
  }
  pool.end();
}
