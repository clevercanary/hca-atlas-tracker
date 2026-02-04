import {
  NewUserData,
  UserEditData,
} from "app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBUserWithAssociatedResources,
  ROLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import { getAllAtlases } from "./atlases";
import { doTransaction, query } from "./database";

/**
 * Get all users.
 * @returns users.
 */
export async function getAllUsers(): Promise<
  HCAAtlasTrackerDBUserWithAssociatedResources[]
> {
  const queryResult = await query<HCAAtlasTrackerDBUserWithAssociatedResources>(
    `
      SELECT
        u.*,
        (
          CASE WHEN cardinality(u.role_associated_resource_ids) = 0 THEN '{}'::text[]
          ELSE ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version'))
          END
        ) AS role_associated_resource_names
      FROM hat.users u
      LEFT JOIN hat.atlases a ON a.id=ANY(u.role_associated_resource_ids)
      GROUP BY u.id
    `,
  );
  return queryResult.rows;
}

/**
 * Get a user by email address.
 * @param email - Email of user to get.
 * @returns user.
 */
export async function getUserByEmail(
  email: string,
): Promise<HCAAtlasTrackerDBUserWithAssociatedResources> {
  const queryResult = await query<HCAAtlasTrackerDBUserWithAssociatedResources>(
    `
      SELECT
        u.*,
        (
          CASE WHEN cardinality(u.role_associated_resource_ids) = 0 THEN '{}'::text[]
          ELSE ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version'))
          END
        ) AS role_associated_resource_names
      FROM hat.users u
      LEFT JOIN hat.atlases a ON a.id=ANY(u.role_associated_resource_ids)
      WHERE u.email=$1
      GROUP BY u.id
    `,
    [email],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`User with email ${email} doesn't exist`);
  return queryResult.rows[0];
}

/**
 * Get a user by ID.
 * @param id - ID of user to get.
 * @returns user.
 */
export async function getUserById(
  id: number,
): Promise<HCAAtlasTrackerDBUserWithAssociatedResources> {
  const queryResult = await query<HCAAtlasTrackerDBUserWithAssociatedResources>(
    `
      SELECT
        u.*,
        (
          CASE WHEN cardinality(u.role_associated_resource_ids) = 0 THEN '{}'::text[]
          ELSE ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version'))
          END
        ) AS role_associated_resource_names
      FROM hat.users u
      LEFT JOIN hat.atlases a ON a.id=ANY(u.role_associated_resource_ids)
      WHERE u.id=$1
      GROUP BY u.id
    `,
    [id],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`User with ID ${id} doesn't exist`);
  return queryResult.rows[0];
}

/**
 * Create a user.
 * @param inputData - Values used to create the new user.
 * @returns new user.
 */
export async function createUser(
  inputData: NewUserData,
): Promise<HCAAtlasTrackerDBUserWithAssociatedResources> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBUser, "id">>(
    "INSERT INTO hat.users (disabled, email, full_name, role, role_associated_resource_ids) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [
      inputData.disabled.toString(),
      inputData.email,
      inputData.fullName,
      inputData.role,
      inputData.roleAssociatedResourceIds,
    ],
  );
  return await getUserById(queryResult.rows[0].id);
}

/**
 * Update a user.
 * @param id - ID of the user to update.
 * @param inputData - Values used to update a user.
 * @returns updated user.
 */
export async function updateUser(
  id: number,
  inputData: UserEditData,
): Promise<HCAAtlasTrackerDBUserWithAssociatedResources> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBUser, "id">>(
    "UPDATE hat.users SET disabled=$1, email=$2, full_name=$3, role=$4, role_associated_resource_ids=$5 WHERE id=$6 RETURNING id",
    [
      inputData.disabled.toString(),
      inputData.email,
      inputData.fullName,
      inputData.role,
      inputData.roleAssociatedResourceIds,
      id,
    ],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`User with ID ${id} doesn't exist`);
  return await getUserById(queryResult.rows[0].id);
}

/**
 * Update the last login of the specified user to the current time.
 * @param userId - ID of user to update last login for.
 */
export async function updateLastLogin(userId: number): Promise<void> {
  const queryResult = await query(
    "UPDATE hat.users SET last_login=$1 WHERE id=$2",
    [new Date(), userId],
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
        "SELECT * FROM hat.users",
      )
    ).rows;
    const existingUserRolesByEmail = new Map(
      existingUsersInfo.map((u) => [u.email, u.role]),
    );
    const atlases = await getAllAtlases(client);
    const integrationLeadInfoFromAtlases = new Map<
      string,
      { atlasIds: string[]; name: string }
    >();
    for (const atlas of atlases) {
      for (const integrationLead of atlas.overview.integrationLead) {
        let integrationLeadInfo = integrationLeadInfoFromAtlases.get(
          integrationLead.email,
        );
        if (!integrationLeadInfo)
          integrationLeadInfoFromAtlases.set(
            integrationLead.email,
            (integrationLeadInfo = {
              atlasIds: [],
              name: integrationLead.name,
            }),
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
        [JSON.stringify(newUsersInfoFromAtlases)],
      );

    if (existingUsersInfoFromAtlases.length)
      await client.query(
        `
          UPDATE hat.users u
          SET role_associated_resource_ids = ARRAY(SELECT DISTINCT UNNEST(u.role_associated_resource_ids || d.role_associated_resource_ids))
          FROM jsonb_to_recordset($1) AS d(email text, role_associated_resource_ids uuid[])
          WHERE u.email = d.email AND NOT u.role_associated_resource_ids @> d.role_associated_resource_ids
        `,
        [JSON.stringify(existingUsersInfoFromAtlases)],
      );
  });
}
