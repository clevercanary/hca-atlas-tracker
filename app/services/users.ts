import { NotFoundError } from "app/utils/api-handler";
import { query } from "./database";

/**
 * Update the last login of the specified user to the current time.
 * @param userId - ID of user to update last login for.
 */
export async function updateLastLogin(userId: number): Promise<void> {
  const queryResult = await query(
    "UPDATE hat.users SET last_login=$1 WHERE id=$2",
    [new Date(), userId]
  );
  if (queryResult.rowCount === 0) throw new NotFoundError("User not found");
}
