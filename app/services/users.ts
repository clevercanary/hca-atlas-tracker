import {
  HCAAtlasTrackerDBUser,
  ROLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import { getAllAtlases } from "./atlases";
import { doTransaction, query } from "./database";

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

/**
 * Add new INTEGRATION_LEAD users and update existing users' associated atlases, based on integration leads specified on atlases.
 */
export async function addIntegrationLeadsFromAtlases(): Promise<void> {
  await doTransaction(async (client) => {
    const existingUsersInfo = (
      await client.query<Pick<HCAAtlasTrackerDBUser, "email" | "role">>(
        "SELECT * FROM hat.users"
      )
    ).rows;
    const existingUserRolesByEmail = new Map(
      existingUsersInfo.map((u) => [u.email, u.role])
    );
    const atlases = await getAllAtlases(client);
    const integrationLeadInfoFromAtlases = new Map<
      string,
      { atlasIds: string[]; name: string }
    >();
    for (const atlas of atlases) {
      for (const integrationLead of atlas.overview.integrationLead) {
        let integrationLeadInfo = integrationLeadInfoFromAtlases.get(
          integrationLead.email
        );
        if (!integrationLeadInfo)
          integrationLeadInfoFromAtlases.set(
            integrationLead.email,
            (integrationLeadInfo = {
              atlasIds: [],
              name: integrationLead.name,
            })
          );
        integrationLeadInfo.atlasIds.push(atlas.id);
      }
    }

    const newUsersInfoFromAtlases: Pick<
      HCAAtlasTrackerDBUser,
      "email" | "full_name" | "role_associated_resource_ids"
    >[] = [];
    const existingUsersInfoFromAtlases: Pick<
      HCAAtlasTrackerDBUser,
      "email" | "role_associated_resource_ids"
    >[] = [];
    for (const [
      email,
      { atlasIds, name },
    ] of integrationLeadInfoFromAtlases.entries()) {
      const existingRole = existingUserRolesByEmail.get(email);
      if (existingRole === undefined) {
        newUsersInfoFromAtlases.push({
          email,
          full_name: name,
          role_associated_resource_ids: atlasIds,
        });
      } else if (existingRole === ROLE.INTEGRATION_LEAD) {
        existingUsersInfoFromAtlases.push({
          email,
          role_associated_resource_ids: atlasIds,
        });
      }
    }

    if (newUsersInfoFromAtlases.length)
      await client.query(
        `
          INSERT INTO hat.users (disabled, email, full_name, role, role_associated_resource_ids)
          SELECT FALSE, email, full_name, 'INTEGRATION_LEAD', role_associated_resource_ids
          FROM jsonb_to_recordset($1) AS d(email text, full_name text, role_associated_resource_ids uuid[])
        `,
        [JSON.stringify(newUsersInfoFromAtlases)]
      );

    if (existingUsersInfoFromAtlases.length)
      await client.query(
        `
          UPDATE hat.users u
          SET role_associated_resource_ids = ARRAY(SELECT DISTINCT UNNEST(u.role_associated_resource_ids || d.role_associated_resource_ids))
          FROM jsonb_to_recordset($1) AS d(email text, role_associated_resource_ids uuid[])
          WHERE u.email = d.email AND NOT u.role_associated_resource_ids @> d.role_associated_resource_ids
        `,
        [JSON.stringify(existingUsersInfoFromAtlases)]
      );
  });
}
