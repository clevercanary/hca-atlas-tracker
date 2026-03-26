import pg from "pg";

/**
 * Add a new role-associated resource ID to all users that have another given associated entity.
 * @param newEntityId - New entity ID to add.
 * @param existingEntityId - Existing entity ID to filter users by.
 * @param client - Postgres client to use.
 */
export async function addAssociatedEntityToUsersAssociatedWith(
  newEntityId: string,
  existingEntityId: string,
  client: pg.PoolClient,
): Promise<void> {
  await client.query(
    `
      UPDATE hat.users
      SET role_associated_resource_ids = role_associated_resource_ids || $1
      WHERE $2 = ANY(role_associated_resource_ids) AND NOT $1 = ANY(role_associated_resource_ids)
    `,
    [newEntityId, existingEntityId],
  );
}
