import {
  HCAAtlasTrackerDBUser,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool, query } from "../app/services/database";
import { registerUser } from "../app/services/users";
import { USER_CONTENT_ADMIN, USER_UNREGISTERED } from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { expectIsDefined } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("registerUser", () => {
  it("registers a previously-unregistered user as STAKEHOLDER", async () => {
    expect(await getDbUserByEmail(USER_UNREGISTERED.email)).toBeUndefined();

    const role = await registerUser(
      USER_UNREGISTERED.email,
      USER_UNREGISTERED.name,
    );
    expect(role).toEqual(ROLE.STAKEHOLDER);

    const dbUser = await getDbUserByEmail(USER_UNREGISTERED.email);
    if (!expectIsDefined(dbUser)) return;
    expect(dbUser.disabled).toEqual(false);
    expect(dbUser.full_name).toEqual(USER_UNREGISTERED.name);
    expect(dbUser.role).toEqual(ROLE.STAKEHOLDER);
    expect(dbUser.role_associated_resource_ids).toEqual([]);

    await query("DELETE FROM hat.users WHERE email=$1", [
      USER_UNREGISTERED.email,
    ]);
  });

  it("is idempotent: an existing user's record and role are left untouched", async () => {
    const before = await getDbUserByEmail(USER_CONTENT_ADMIN.email);
    if (!expectIsDefined(before)) return;

    // A repeat sign-in with a different name must not overwrite the record.
    const role = await registerUser(USER_CONTENT_ADMIN.email, "Different Name");
    expect(role).toEqual(USER_CONTENT_ADMIN.role);

    const after = await getDbUserByEmail(USER_CONTENT_ADMIN.email);
    expect(after).toEqual(before);
  });
});

async function getDbUserByEmail(
  email: string,
): Promise<HCAAtlasTrackerDBUser | undefined> {
  return (
    await query<HCAAtlasTrackerDBUser>(
      "SELECT * FROM hat.users WHERE email=$1",
      [email],
    )
  ).rows[0];
}
