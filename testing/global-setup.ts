import { query } from "../app/utils/api-handler";
import { INITIAL_TEST_USERS } from "./constants";

export default async function setup(): Promise<void> {
  for (const user of INITIAL_TEST_USERS) {
    await query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [user.disabled.toString(), user.email, user.name, user.role]
    );
  }
}
