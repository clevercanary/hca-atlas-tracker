import { endPgPool, query } from "../app/utils/api-handler";
import { INITIAL_TEST_USERS } from "./constants";

export default async function teardown(): Promise<void> {
  for (const user of INITIAL_TEST_USERS) {
    await query("DELETE FROM hat.users WHERE email=$1", [user.email]);
  }
  endPgPool();
}
