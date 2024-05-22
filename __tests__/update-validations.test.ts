import { updateValidations } from "app/services/validations";
import {
  ENTITY_TYPE,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerValidationResult,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
  VALIDATION_VARIABLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool, getPoolClient, query } from "../app/services/database";
import { resetDatabase } from "../testing/db-utils";

jest.mock("../app/services/hca-projects");
jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

const ENTITY_TYPE_TEST = "ENTITY_TYPE_TEST" as ENTITY_TYPE;

const SYSTEM_TEST = "SYSTEM_TEST" as SYSTEM;

const VARIABLE_TEST = "VARIABLE_TEST" as VALIDATION_VARIABLE;

const VALIDATION_ID_VW = "VALIDATION_ID_VW" as VALIDATION_ID;

const VALIDATION_ID_VX = "VALIDATION_ID_VX" as VALIDATION_ID;

const VALIDATION_ID_VY = "VALIDATION_ID_VY" as VALIDATION_ID;

const VALIDATION_ID_VZ = "VALIDATION_ID_VZ" as VALIDATION_ID;

const VALIDATION_TYPE_TEST = "VALIDATION_TYPE_TEST" as VALIDATION_TYPE;

const ATLAS_ID_AX = "f487e050-faaf-44d3-82ad-64f7a7dbd987";

const ATLAS_ID_AY = "6268b760-a866-4ceb-8031-9d3628ff225b";

const ENTITY_ID_EX = "e8cb5b0a-b7d4-4180-a795-7d2f7eb4873e";

const PUBLICATION_EX = "publication ex";

const VALIDATION_VW: HCAAtlasTrackerValidationResult = {
  atlasIds: [ATLAS_ID_AX],
  description: "description vw",
  differences: [],
  doi: "10.123/ex",
  entityId: ENTITY_ID_EX,
  entityTitle: "title ex",
  entityType: ENTITY_TYPE_TEST,
  publicationString: PUBLICATION_EX,
  relatedEntityUrl: null,
  system: SYSTEM_TEST,
  taskStatus: TASK_STATUS.TODO,
  validationId: VALIDATION_ID_VW,
  validationStatus: VALIDATION_STATUS.FAILED,
  validationType: VALIDATION_TYPE_TEST,
};

const VALIDATION_VX: HCAAtlasTrackerValidationResult = {
  atlasIds: [ATLAS_ID_AX],
  description: "description vx",
  differences: [
    {
      actual: "b",
      expected: "a",
      variable: VARIABLE_TEST,
    },
  ],
  doi: "10.123/ex",
  entityId: ENTITY_ID_EX,
  entityTitle: "title ex",
  entityType: ENTITY_TYPE_TEST,
  publicationString: PUBLICATION_EX,
  relatedEntityUrl: null,
  system: SYSTEM_TEST,
  taskStatus: TASK_STATUS.TODO,
  validationId: VALIDATION_ID_VX,
  validationStatus: VALIDATION_STATUS.FAILED,
  validationType: VALIDATION_TYPE_TEST,
};

const VALIDATION_VX_UPDATED_ATLASES: HCAAtlasTrackerValidationResult = {
  ...VALIDATION_VX,
  atlasIds: [ATLAS_ID_AY],
};

const VALIDATION_VX_UPDATED_DIFFERENCES: HCAAtlasTrackerValidationResult = {
  ...VALIDATION_VX,
  differences: [
    {
      actual: "c",
      expected: "a",
      variable: VARIABLE_TEST,
    },
  ],
};

const VALIDATION_VY: HCAAtlasTrackerValidationResult = {
  atlasIds: [ATLAS_ID_AX],
  description: "description vy",
  differences: [],
  doi: "10.123/ex",
  entityId: ENTITY_ID_EX,
  entityTitle: "title ex",
  entityType: ENTITY_TYPE_TEST,
  publicationString: PUBLICATION_EX,
  relatedEntityUrl: null,
  system: SYSTEM_TEST,
  taskStatus: TASK_STATUS.DONE,
  validationId: VALIDATION_ID_VY,
  validationStatus: VALIDATION_STATUS.PASSED,
  validationType: VALIDATION_TYPE_TEST,
};

const VALIDATION_VY_UPDATED_TITLE: HCAAtlasTrackerValidationResult = {
  ...VALIDATION_VY,
  entityTitle: "title ex updated",
};

const VALIDATION_VY_FAILED: HCAAtlasTrackerValidationResult = {
  ...VALIDATION_VY,
  taskStatus: TASK_STATUS.TODO,
  validationStatus: VALIDATION_STATUS.FAILED,
};

const VALIDATION_VZ: HCAAtlasTrackerValidationResult = {
  atlasIds: [ATLAS_ID_AX],
  description: "description vz",
  differences: [],
  doi: "10.123/ex",
  entityId: ENTITY_ID_EX,
  entityTitle: "title ex",
  entityType: ENTITY_TYPE_TEST,
  publicationString: PUBLICATION_EX,
  relatedEntityUrl: null,
  system: SYSTEM_TEST,
  taskStatus: TASK_STATUS.TODO,
  validationId: VALIDATION_ID_VZ,
  validationStatus: VALIDATION_STATUS.FAILED,
  validationType: VALIDATION_TYPE_TEST,
};

const VALIDATION_VZ_PASSED: HCAAtlasTrackerValidationResult = {
  ...VALIDATION_VZ,
  taskStatus: TASK_STATUS.DONE,
  validationStatus: VALIDATION_STATUS.PASSED,
};

const INITIAL_TEST_VALIDATIONS = [VALIDATION_VX, VALIDATION_VY, VALIDATION_VZ];

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("updateValidations", () => {
  it("adds new validation and leaves others unchanged", async () => {
    await resetTestValidations();
    const othersBefore = await getDbTestValidationsById();
    expect(othersBefore[VALIDATION_ID_VW]).toBeUndefined();
    await testUpdateValidations([
      VALIDATION_VW,
      VALIDATION_VX,
      VALIDATION_VY,
      VALIDATION_VZ,
    ]);
    expect(await getDbTestValidation(VALIDATION_ID_VW)).toBeDefined();
    const othersAfter = await getDbTestValidationsById(
      Object.keys(othersBefore)
    );
    expect(othersAfter).toEqual(othersBefore);
  });

  it("deletes newly-absent validation and leaves others unchanged", async () => {
    await resetTestValidations();
    const othersBefore = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VY,
    ]);
    expect(await getDbTestValidation(VALIDATION_ID_VZ)).toBeDefined();
    await testUpdateValidations([VALIDATION_VX, VALIDATION_VY]);
    const othersAfter = await getDbTestValidationsById();
    expect(othersAfter[VALIDATION_ID_VZ]).toBeUndefined();
    expect(othersAfter).toEqual(othersBefore);
  });

  it("updates validation when atlas IDs have changed and leaves others unchanged", async () => {
    await resetTestValidations();
    const vxBefore = await getDbTestValidation(VALIDATION_ID_VX);
    expect(vxBefore?.atlas_ids).toEqual([ATLAS_ID_AX]);
    const othersBefore = await getDbTestValidationsById([
      VALIDATION_ID_VY,
      VALIDATION_ID_VZ,
    ]);
    await testUpdateValidations([
      VALIDATION_VX_UPDATED_ATLASES,
      VALIDATION_VY,
      VALIDATION_VZ,
    ]);
    const vxAfter = await getDbTestValidation(VALIDATION_ID_VX);
    expect(vxAfter?.atlas_ids).toEqual([ATLAS_ID_AY]);
    expect(vxAfter?.updated_at).not.toEqual(vxBefore?.updated_at);
    const othersAfter = await getDbTestValidationsById([
      VALIDATION_ID_VY,
      VALIDATION_ID_VZ,
    ]);
    expect(othersAfter).toEqual(othersBefore);
  });

  it("updates resolved validation when entity title has changed and leaves resolved_at and other validations unchanged", async () => {
    await resetTestValidations();
    const vyBefore = await getDbTestValidation(VALIDATION_ID_VY);
    expect(vyBefore?.validation_info.entityTitle).toEqual(
      VALIDATION_VY.entityTitle
    );
    const othersBefore = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VZ,
    ]);
    await testUpdateValidations([
      VALIDATION_VX,
      VALIDATION_VY_UPDATED_TITLE,
      VALIDATION_VZ,
    ]);
    const vyAfter = await getDbTestValidation(VALIDATION_ID_VY);
    expect(vyAfter?.validation_info.entityTitle).toEqual(
      VALIDATION_VY_UPDATED_TITLE.entityTitle
    );
    expect(vyAfter?.updated_at).not.toEqual(vyBefore?.updated_at);
    const othersAfter = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VZ,
    ]);
    expect(vyAfter?.resolved_at).toEqual(vyBefore?.resolved_at);
    expect(othersAfter).toEqual(othersBefore);
  });

  it("updates validation when differences have changed and leaves others unchanged", async () => {
    await resetTestValidations();
    const vxBefore = await getDbTestValidation(VALIDATION_ID_VX);
    expect(vxBefore?.validation_info.differences[0].actual).toEqual("b");
    const othersBefore = await getDbTestValidationsById([
      VALIDATION_ID_VY,
      VALIDATION_ID_VZ,
    ]);
    await testUpdateValidations([
      VALIDATION_VX_UPDATED_DIFFERENCES,
      VALIDATION_VY,
      VALIDATION_VZ,
    ]);
    const vxAfter = await getDbTestValidation(VALIDATION_ID_VX);
    expect(vxAfter?.validation_info.differences[0].actual).toEqual("c");
    expect(vxAfter?.updated_at).not.toEqual(vxBefore?.updated_at);
    const othersAfter = await getDbTestValidationsById([
      VALIDATION_ID_VY,
      VALIDATION_ID_VZ,
    ]);
    expect(othersAfter).toEqual(othersBefore);
  });

  it("updates resolved_at when validation is newly resolved", async () => {
    await resetTestValidations();
    const vzBefore = await getDbTestValidation(VALIDATION_ID_VZ);
    expect(vzBefore?.resolved_at).toEqual(null);
    const othersBefore = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VY,
    ]);
    await testUpdateValidations([
      VALIDATION_VX,
      VALIDATION_VY,
      VALIDATION_VZ_PASSED,
    ]);
    const vzAfter = await getDbTestValidation(VALIDATION_ID_VZ);
    expect(vzAfter?.resolved_at).not.toEqual(null);
    expect(vzAfter?.updated_at).not.toEqual(vzBefore?.updated_at);
    const othersAfter = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VY,
    ]);
    expect(othersAfter).toEqual(othersBefore);
  });

  it("removes resolved_at when validation is no longer resolved", async () => {
    await resetTestValidations();
    const vyBefore = await getDbTestValidation(VALIDATION_ID_VY);
    expect(vyBefore?.resolved_at).not.toEqual(null);
    const othersBefore = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VZ,
    ]);
    await testUpdateValidations([
      VALIDATION_VX,
      VALIDATION_VY_FAILED,
      VALIDATION_VZ,
    ]);
    const vyAfter = await getDbTestValidation(VALIDATION_ID_VY);
    expect(vyAfter?.resolved_at).toEqual(null);
    expect(vyAfter?.updated_at).not.toEqual(vyBefore?.updated_at);
    const othersAfter = await getDbTestValidationsById([
      VALIDATION_ID_VX,
      VALIDATION_ID_VZ,
    ]);
    expect(othersAfter).toEqual(othersBefore);
  });
});

async function getDbTestValidationsById(
  validationIds?: string[]
): Promise<Record<string, HCAAtlasTrackerDBValidation>> {
  const queryResult = validationIds
    ? await query<HCAAtlasTrackerDBValidation>(
        "SELECT * FROM hat.validations WHERE entity_id=$1 AND validation_id=ANY($2)",
        [ENTITY_ID_EX, validationIds]
      )
    : await query<HCAAtlasTrackerDBValidation>(
        "SELECT * FROM hat.validations WHERE entity_id=$1",
        [ENTITY_ID_EX]
      );
  return Object.fromEntries(queryResult.rows.map((v) => [v.validation_id, v]));
}

async function getDbTestValidation(
  validationId: string
): Promise<HCAAtlasTrackerDBValidation | undefined> {
  return (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=$1 AND validation_id=$2",
      [ENTITY_ID_EX, validationId]
    )
  ).rows[0];
}

async function resetTestValidations(): Promise<void> {
  await query("DELETE FROM hat.validations WHERE entity_id=$1", [ENTITY_ID_EX]);
  await testUpdateValidations(INITIAL_TEST_VALIDATIONS);
}

async function testUpdateValidations(
  validationResults: HCAAtlasTrackerValidationResult[]
): Promise<void> {
  const client = await getPoolClient();
  await updateValidations(ENTITY_ID_EX, validationResults, client);
  client.release();
}
