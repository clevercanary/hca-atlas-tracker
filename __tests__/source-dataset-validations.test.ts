import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerValidationResult,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
} from "app/apis/catalog/hca-atlas-tracker/common/entities";
import pg from "pg";
import {
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A,
  SOURCE_DATASET_UNPUBLISHED_WITH_HCA,
} from "testing/constants";
import { TestSourceDataset } from "testing/entities";
import { getPoolClient } from "../app/services/database";
import { getSourceDatasetValidationResults } from "../app/services/validations";

type ExpectedValidationProperties = Pick<
  HCAAtlasTrackerValidationResult,
  | "system"
  | "taskStatus"
  | "validationId"
  | "validationStatus"
  | "validationType"
>;

const VALIDATIONS_UNPUBLISHED_WITH_HCA: ExpectedValidationProperties[] = [
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    taskStatus: TASK_STATUS.DONE,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.CELLXGENE,
    taskStatus: TASK_STATUS.TODO,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
];

let client: pg.PoolClient;

beforeAll(async () => {
  client = await getPoolClient();
});

afterAll(() => {
  client.release();
});

describe("getSourceDatasetValidationResults", () => {
  it("", async () => {
    await testValidations(
      SOURCE_DATASET_UNPUBLISHED_WITH_HCA,
      [ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A.id],
      VALIDATIONS_UNPUBLISHED_WITH_HCA
    );
  });
});

async function testValidations(
  testDataset: TestSourceDataset,
  atlasIds: string[],
  expectedValidationProperties: ExpectedValidationProperties[]
): Promise<void> {
  const sourceDataset = (
    await client.query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE id=$1",
      [testDataset.id]
    )
  ).rows[0];
  const validationResults = await getSourceDatasetValidationResults(
    sourceDataset,
    client
  );
  expect(validationResults).toHaveLength(expectedValidationProperties.length);
  for (const [i, validationResult] of validationResults.entries()) {
    expect(validationResult).toMatchObject(expectedValidationProperties[i]);
    expect(validationResult.atlasIds).toEqual(atlasIds);
    expect(validationResult.entityId).toEqual(testDataset.id);
    expect(validationResult.entityTitle).toEqual(
      "unpublishedInfo" in testDataset
        ? testDataset.unpublishedInfo.title
        : testDataset.publication?.title ?? testDataset.id
    );
  }
}
