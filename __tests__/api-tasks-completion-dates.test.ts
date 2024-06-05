import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerValidationRecord,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import completionDatesHandler from "../pages/api/tasks/completion-dates";
import {
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
  SOURCE_STUDY_PUBLISHED_WITH_HCA,
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const DATE_VALID = "2024-05-20T01:16:42.761Z";

const DATE_NON_UTC = "2024-05-19T18:16:42.761-0700";

const VALIDATION_ID_NONEXISTENT = "8fb38ac8-78fe-4d47-a858-145175819dfe";

const ATLAS_NAMES_PUBLISHED_WITH_HCA = [
  `${ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A.shortName} v${ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A.version}`,
];

let validations: HCAAtlasTrackerDBValidation[];
let validationIds: string[];
let otherValidation: HCAAtlasTrackerDBValidation;

beforeAll(async () => {
  await resetDatabase();
  validations = (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=$1",
      [SOURCE_STUDY_PUBLISHED_WITH_HCA.id]
    )
  ).rows;
  if (validations.length < 2) throw new Error("Missing test validations");
  otherValidation = validations[0];
  validations.shift();
  validationIds = validations.map(({ id }) => id);
});

afterAll(async () => {
  endPgPool();
});

describe("/api/tasks/completion-dates", () => {
  it("returns error 405 for non-PATCH request", async () => {
    expect(
      (
        await doCompletionDatesRequest(
          USER_CONTENT_ADMIN,
          DATE_VALID,
          validationIds,
          false,
          METHOD.GET
        )
      )._getStatusCode()
    ).toEqual(405);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (
        await doCompletionDatesRequest(undefined, DATE_VALID, validationIds)
      )._getStatusCode()
    ).toEqual(401);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCompletionDatesRequest(
          USER_UNREGISTERED,
          DATE_VALID,
          validationIds
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 403 for logged in user with STAKEHOLDER role", async () => {
    expect(
      (
        await doCompletionDatesRequest(
          USER_STAKEHOLDER,
          DATE_VALID,
          validationIds
        )
      )._getStatusCode()
    ).toEqual(403);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 400 when date is non-UTC", async () => {
    expect(
      (
        await doCompletionDatesRequest(
          USER_CONTENT_ADMIN,
          DATE_NON_UTC,
          validationIds,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 400 when one of the IDs is not a UUID", async () => {
    expect(
      (
        await doCompletionDatesRequest(
          USER_CONTENT_ADMIN,
          DATE_NON_UTC,
          [...validationIds, "notauuid"],
          true
        )
      )._getStatusCode()
    ).toEqual(400);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 404 when one of the IDs doesn't exist", async () => {
    expect(
      (
        await doCompletionDatesRequest(
          USER_CONTENT_ADMIN,
          DATE_VALID,
          [...validationIds, VALIDATION_ID_NONEXISTENT],
          true
        )
      )._getStatusCode()
    ).toEqual(404);
    await expectValidationsToBeUnchanged();
  });

  it("returns error 400 when an empty ID array is provided", async () => {
    expect(
      (
        await doCompletionDatesRequest(USER_CONTENT_ADMIN, DATE_VALID, [], true)
      )._getStatusCode()
    ).toEqual(400);
    await expectValidationsToBeUnchanged();
  });

  it("updates target completion dates for specified validations and returns updated validations", async () => {
    const res = await doCompletionDatesRequest(
      USER_CONTENT_ADMIN,
      DATE_VALID,
      validationIds
    );
    expect(res._getStatusCode()).toEqual(200);
    const updatedValidations: HCAAtlasTrackerValidationRecord[] =
      res._getJSONData();
    expect(updatedValidations).toHaveLength(validationIds.length);
    for (const { atlasNames, id, targetCompletion } of updatedValidations) {
      expect(targetCompletion).toEqual(DATE_VALID);
      expect(validationIds).toContain(id);
      expect(atlasNames).toEqual(ATLAS_NAMES_PUBLISHED_WITH_HCA);
    }
    const updatedValidationsFromDb = (
      await query<HCAAtlasTrackerDBValidation>(
        "SELECT * FROM hat.validations WHERE id=ANY($1)",
        [validationIds]
      )
    ).rows;
    for (const validation of updatedValidationsFromDb) {
      expect(validation.target_completion?.toISOString()).toEqual(DATE_VALID);
    }
    const otherValidationFromDb = await getValidationFromDb(otherValidation.id);
    expect(otherValidationFromDb).toEqual(otherValidation);
  });

  it("sets target completion to null", async () => {
    const validationId = validationIds[0];
    const validationBefore = await getValidationFromDb(validationId);
    expect(validationBefore.target_completion).not.toBeNull();
    const res = await doCompletionDatesRequest(USER_CONTENT_ADMIN, null, [
      validationId,
    ]);
    expect(res._getStatusCode()).toEqual(200);
    const updatedValidations: HCAAtlasTrackerValidationRecord[] =
      res._getJSONData();
    expect(updatedValidations).toHaveLength(1);
    expect(updatedValidations[0].targetCompletion).toBeNull();
    const validationAfter = await getValidationFromDb(validationId);
    expect(validationAfter.target_completion).toBeNull();
  });
});

async function expectValidationsToBeUnchanged(): Promise<void> {
  const currentValidations = (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE id=ANY($1)",
      [validationIds]
    )
  ).rows;
  for (const currentValidation of currentValidations) {
    expect(currentValidation).toEqual(
      validations.find((v) => v.id === currentValidation.id)
    );
  }
}

async function getValidationFromDb(
  id: string
): Promise<HCAAtlasTrackerDBValidation> {
  return (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE id=$1",
      [id]
    )
  ).rows[0];
}

async function doCompletionDatesRequest(
  user: TestUser | undefined,
  targetCompletion: string | null,
  taskIds: string[],
  hideConsoleError = false,
  method = METHOD.PATCH
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body: {
      targetCompletion,
      taskIds,
    },
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => completionDatesHandler(req, res),
    hideConsoleError
  );
  return res;
}
