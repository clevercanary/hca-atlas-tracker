import pg from "pg";
import { getPoolConfig } from "../app/utils/__mocks__/pg-app-connect-config";
import { INITIAL_TEST_ATLASES, INITIAL_TEST_USERS } from "./constants";

const { Pool } = pg;

export default async function teardown(): Promise<void> {
  const pool = new Pool(getPoolConfig());
  for (const user of INITIAL_TEST_USERS) {
    await pool.query("DELETE FROM hat.users WHERE email=$1", [user.email]);
  }
  for (const atlas of INITIAL_TEST_ATLASES) {
    await pool.query("DELETE FROM hat.atlases WHERE id=$1", [atlas.id]);
  }
  pool.end();
}
