import { HCAAtlasTrackerDBUser } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import integrationLeadsFromAtlasesHandler from "../pages/api/users/integration-leads-from-atlases";
import {
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_IL,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  INTEGRATION_LEAD_BAZ,
  INTEGRATION_LEAD_BAZ_BAZ,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_INTEGRATION_LEAD_WITH_NEW_ATLAS,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import {
  expectIsDefined,
  testApiRole,
  withConsoleErrorHiding,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

jest.mock("next-auth");

const TEST_ROUTE = "/api/users/integration-leads-from-atlases";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-PATCH request", async () => {
    expect(
      (
        await doIntegrationLeadsRequest(USER_CONTENT_ADMIN, false, METHOD.GET)
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doIntegrationLeadsRequest(undefined, true))._getStatusCode()
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doIntegrationLeadsRequest(USER_UNREGISTERED, true)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (
        await doIntegrationLeadsRequest(USER_DISABLED_CONTENT_ADMIN)
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      TEST_ROUTE,
      "returns error 403",
      integrationLeadsFromAtlasesHandler,
      METHOD.PATCH,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("creates and updates users when requested by user with CONTENT_ADMIN role", async () => {
    await testSuccessfulRequest();
  });
});

async function testSuccessfulRequest(): Promise<void> {
  const integrationLeadDraftBefore = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_DRAFT.email
  );
  const integrationLeadPublicBefore = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_PUBLIC.email
  );
  const integrationLeadMiscStudiesBefore = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES.email
  );
  const integrationLeadNewAtlasBefore = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_WITH_NEW_ATLAS.email
  );
  const bazBefore = await getUserFromDatabase(INTEGRATION_LEAD_BAZ.email);
  const bazBazBefore = await getUserFromDatabase(
    INTEGRATION_LEAD_BAZ_BAZ.email
  );

  if (expectIsDefined(integrationLeadDraftBefore))
    expectItemsToBe(integrationLeadDraftBefore.role_associated_resource_ids, [
      ATLAS_DRAFT.id,
    ]);
  if (expectIsDefined(integrationLeadPublicBefore))
    expectItemsToBe(integrationLeadPublicBefore.role_associated_resource_ids, [
      ATLAS_PUBLIC.id,
    ]);
  if (expectIsDefined(integrationLeadMiscStudiesBefore))
    expectItemsToBe(
      integrationLeadMiscStudiesBefore.role_associated_resource_ids,
      [ATLAS_WITH_MISC_SOURCE_STUDIES.id]
    );
  if (expectIsDefined(integrationLeadNewAtlasBefore))
    expectItemsToBe(
      integrationLeadNewAtlasBefore.role_associated_resource_ids,
      [ATLAS_DRAFT.id]
    );
  expect(bazBefore).toBeUndefined();
  expect(bazBazBefore).toBeUndefined();

  expect(
    (
      await doIntegrationLeadsRequest(USER_CONTENT_ADMIN, false, METHOD.PATCH)
    )._getStatusCode()
  ).toEqual(200);

  const integrationLeadDraftAfter = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_DRAFT.email
  );
  const integrationLeadPublicAfter = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_PUBLIC.email
  );
  const integrationLeadMiscStudiesAfter = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES.email
  );
  const integrationLeadNewAtlasAfter = await getUserFromDatabase(
    USER_INTEGRATION_LEAD_WITH_NEW_ATLAS.email
  );
  const bazAfter = await getUserFromDatabase(INTEGRATION_LEAD_BAZ.email);
  const bazBazAfter = await getUserFromDatabase(INTEGRATION_LEAD_BAZ_BAZ.email);

  if (expectIsDefined(integrationLeadDraftAfter))
    expectItemsToBe(integrationLeadDraftAfter.role_associated_resource_ids, [
      ATLAS_DRAFT.id,
    ]);
  if (expectIsDefined(integrationLeadPublicAfter))
    expectItemsToBe(integrationLeadPublicAfter.role_associated_resource_ids, [
      ATLAS_PUBLIC.id,
    ]);
  if (expectIsDefined(integrationLeadMiscStudiesAfter))
    expectItemsToBe(
      integrationLeadMiscStudiesAfter.role_associated_resource_ids,
      [ATLAS_WITH_MISC_SOURCE_STUDIES.id]
    );
  if (expectIsDefined(integrationLeadNewAtlasAfter))
    expectItemsToBe(integrationLeadNewAtlasAfter.role_associated_resource_ids, [
      ATLAS_DRAFT.id,
      ATLAS_PUBLIC.id,
    ]);
  if (expectIsDefined(bazAfter))
    expectItemsToBe(bazAfter.role_associated_resource_ids, [ATLAS_WITH_IL.id]);
  if (expectIsDefined(bazBazAfter))
    expectItemsToBe(bazBazAfter.role_associated_resource_ids, [
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    ]);
}

async function doIntegrationLeadsRequest(
  user?: TestUser,
  hideConsoleError = false,
  method = METHOD.PATCH
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => integrationLeadsFromAtlasesHandler(req, res),
    hideConsoleError
  );
  return res;
}

function expectItemsToBe(items: unknown[], expectedItems: unknown[]): void {
  expect(items).toHaveLength(expectedItems.length);
  for (const item of expectedItems) {
    expect(items).toContain(item);
  }
}

async function getUserFromDatabase(
  email: string
): Promise<HCAAtlasTrackerDBUser | undefined> {
  return (
    await query<HCAAtlasTrackerDBUser>(
      "SELECT * FROM hat.users WHERE email=$1",
      [email]
    )
  ).rows[0];
}
