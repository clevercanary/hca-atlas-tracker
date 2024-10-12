import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  HCAAtlasTrackerDBValidation,
  ROLE,
  TaskStatusesUpdatedByDOIResult,
  TASK_STATUS,
  VALIDATION_ID,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import cellxgeneInProgressHandler from "../pages/api/tasks/cellxgene-in-progress";
import {
  DOI_DRAFT_OK,
  DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
  DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE,
  DOI_PUBLISHED_WITH_HCA,
  DOI_PUBLISHED_WITH_UNCHANGING_IDS,
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_PUBLIC_WITH_JOURNAL,
  SOURCE_STUDY_PUBLIC_WITH_PREPRINT,
  SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_HCA,
  SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CELLXGENE_ADMIN,
  USER_CONTENT_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

const TEST_ROUTE = "/api/tasks/cellxgene-in-progress";

const DOI_NOT_PRESENT = "10.123/no-present";

const DOI_DRAFT_OK_URL = `https://doi.org/${encodeURIComponent(DOI_DRAFT_OK)}`;

const DOIS = [
  DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE,
  DOI_PUBLISHED_WITH_UNCHANGING_IDS,
  DOI_DRAFT_OK_URL,
  DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
  DOI_PUBLISHED_WITH_HCA,
  DOI_NOT_PRESENT,
];

let validationIdDoneA: string;
let validationIdDoneB: string;
let validationIdTodoA: string;
let validationIdTodoB: string;
let validationIdTodoC: string;
let validationIdInProgress: string;

let testValidationIds: string[];
let initialStatuses: Record<string, TASK_STATUS>;

beforeAll(async () => {
  await resetDatabase();

  validationIdDoneA = await getValidationRecordId(
    SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE.id,
    VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE
  );
  validationIdDoneB = await getValidationRecordId(
    SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS.id,
    VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE
  );
  validationIdTodoA = await getValidationRecordId(
    SOURCE_STUDY_DRAFT_OK.id,
    VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE
  );
  validationIdTodoB = await getValidationRecordId(
    SOURCE_STUDY_PUBLIC_WITH_PREPRINT.id,
    VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE
  );
  validationIdTodoC = await getValidationRecordId(
    SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id,
    VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE
  );
  validationIdInProgress = await getValidationRecordId(
    SOURCE_STUDY_PUBLISHED_WITH_HCA.id,
    VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE
  );

  await query(
    `UPDATE hat.validations SET validation_info=validation_info||'{"taskStatus": "IN_PROGRESS"}' WHERE id=$1`,
    [validationIdInProgress]
  );

  testValidationIds = [
    validationIdDoneA,
    validationIdDoneB,
    validationIdTodoA,
    validationIdTodoB,
    validationIdTodoC,
    validationIdInProgress,
  ];

  initialStatuses = await getStatusesById();
});

afterAll(() => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-PATCH request", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest(
          DOIS,
          USER_CONTENT_ADMIN,
          false,
          METHOD.GET
        )
      )._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doCellxGeneInProgressRequest(DOIS))._getStatusCode()).toEqual(
      401
    );
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest(DOIS, USER_UNREGISTERED)
      )._getStatusCode()
    ).toEqual(403);
  });

  it("returns error 403 for disabled user", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest(DOIS, USER_DISABLED_CONTENT_ADMIN)
      )._getStatusCode()
    ).toEqual(403);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES.filter(
    (r) => r !== ROLE.CELLXGENE_ADMIN
  )) {
    testApiRole(
      TEST_ROUTE,
      "returns error 403",
      cellxgeneInProgressHandler,
      METHOD.PATCH,
      role,
      undefined,
      DOIS,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(403);
      }
    );
  }

  it("returns error 400 when DOIs are omitted", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest(undefined, USER_CONTENT_ADMIN, true)
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when DOIs are not an array", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest({}, USER_CONTENT_ADMIN, true)
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when DOI array is empty", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest([], USER_CONTENT_ADMIN, true)
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when DOIs contain a number", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest(
          [...DOIS, 123],
          USER_CONTENT_ADMIN,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("returns error 400 when DOIs contain a syntactically-invalid DOI", async () => {
    expect(
      (
        await doCellxGeneInProgressRequest(
          [...DOIS, "notadoi"],
          USER_CONTENT_ADMIN,
          true
        )
      )._getStatusCode()
    ).toEqual(400);
  });

  it("updates statuses and returns info about updated/non-updated DOIs when requested by user with CELLXGENE_ADMIN role", async () => {
    await resetTestStatuses();
    await expectValidationsToHaveInitialStatuses();
    const res = await doCellxGeneInProgressRequest(DOIS, USER_CELLXGENE_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const info = res._getJSONData() as TaskStatusesUpdatedByDOIResult;
    expectCorrectUpdatedInfo(info);
    await expectValidationsToHaveUpdatedStatuses();
  });

  it("updates statuses and returns info about updated/non-updated DOIs when requested by user with CONTENT_ADMIN role", async () => {
    await resetTestStatuses();
    await expectValidationsToHaveInitialStatuses();
    const res = await doCellxGeneInProgressRequest(DOIS, USER_CONTENT_ADMIN);
    expect(res._getStatusCode()).toEqual(200);
    const info = res._getJSONData() as TaskStatusesUpdatedByDOIResult;
    expectCorrectUpdatedInfo(info);
    await expectValidationsToHaveUpdatedStatuses();
  });
});

async function doCellxGeneInProgressRequest(
  body: object | undefined,
  user?: TestUser,
  hideConsoleError = false,
  method = METHOD.PATCH
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    body,
    headers: { authorization: user?.authorization },
    method,
  });
  await withConsoleErrorHiding(
    () => cellxgeneInProgressHandler(req, res),
    hideConsoleError
  );
  return res;
}

function expectCorrectUpdatedInfo(info: TaskStatusesUpdatedByDOIResult): void {
  expect(info.notFound).toHaveLength(1);
  expect(info.notFound).toContain(DOI_NOT_PRESENT);
  expect(info.notUpdated.BLOCKED).toHaveLength(0);
  expect(info.notUpdated.DONE).toHaveLength(2);
  expect(info.notUpdated.DONE).toContain(DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE);
  expect(info.notUpdated.DONE).toContain(DOI_PUBLISHED_WITH_UNCHANGING_IDS);
  expect(info.notUpdated.IN_PROGRESS).toHaveLength(1);
  expect(info.notUpdated.IN_PROGRESS).toContain(DOI_PUBLISHED_WITH_HCA);
  expect(info.notUpdated.TODO).toHaveLength(0);
  expect(info.updated).toHaveLength(2);
  expect(info.updated).toContain(DOI_DRAFT_OK);
  expect(info.updated).toContain(DOI_PUBLIC_WITH_PREPRINT_PREPRINT);
}

async function expectValidationsToHaveUpdatedStatuses(): Promise<void> {
  const currentStatuses = await getStatusesById();
  expect(currentStatuses[validationIdDoneA]).toEqual(TASK_STATUS.DONE);
  expect(currentStatuses[validationIdDoneB]).toEqual(TASK_STATUS.DONE);
  expect(currentStatuses[validationIdTodoA]).toEqual(TASK_STATUS.IN_PROGRESS);
  expect(currentStatuses[validationIdTodoB]).toEqual(TASK_STATUS.IN_PROGRESS);
  expect(currentStatuses[validationIdTodoC]).toEqual(TASK_STATUS.TODO);
  expect(currentStatuses[validationIdInProgress]).toEqual(
    TASK_STATUS.IN_PROGRESS
  );
}

async function expectValidationsToHaveInitialStatuses(): Promise<void> {
  const currentStatuses = await getStatusesById();
  expect(currentStatuses[validationIdDoneA]).toEqual(TASK_STATUS.DONE);
  expect(currentStatuses[validationIdDoneB]).toEqual(TASK_STATUS.DONE);
  expect(currentStatuses[validationIdTodoA]).toEqual(TASK_STATUS.TODO);
  expect(currentStatuses[validationIdTodoB]).toEqual(TASK_STATUS.TODO);
  expect(currentStatuses[validationIdTodoC]).toEqual(TASK_STATUS.TODO);
  expect(currentStatuses[validationIdInProgress]).toEqual(
    TASK_STATUS.IN_PROGRESS
  );
}

async function resetTestStatuses(): Promise<void> {
  for (const id of testValidationIds) {
    await query(
      "UPDATE hat.validations SET validation_info=validation_info||jsonb_build_object('taskStatus', $1::text) WHERE id=$2",
      [initialStatuses[id], id]
    );
  }
}

async function getStatusesById(): Promise<Record<string, TASK_STATUS>> {
  const validations = (
    await query<{ id: string; task_status: TASK_STATUS }>(
      "SELECT id, validation_info->>'taskStatus' AS task_status FROM hat.validations WHERE id=ANY($1)",
      [testValidationIds]
    )
  ).rows;
  return Object.fromEntries(validations.map((v) => [v.id, v.task_status]));
}

async function getValidationRecordId(
  entityId: string,
  validationId: VALIDATION_ID
): Promise<string> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBValidation, "id">>(
    "SELECT id FROM hat.validations WHERE entity_id=$1 AND validation_id=$2",
    [entityId, validationId]
  );
  if (queryResult.rows.length === 0)
    throw new Error(`Missing ${validationId} validation for ${entityId}`);
  return queryResult.rows[0].id;
}
