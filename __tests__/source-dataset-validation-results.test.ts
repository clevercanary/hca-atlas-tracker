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
import { endPgPool, getPoolClient } from "../app/services/database";
import { getSourceDatasetValidationResults } from "../app/services/validations";
import {
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B,
  SOURCE_DATASET_PUBLISHED_WITH_HCA,
  SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
  SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE,
  SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE,
} from "../testing/constants";
import { TestAtlas, TestSourceDataset } from "../testing/entities";

type ExpectedValidationProperties = Pick<
  HCAAtlasTrackerValidationResult,
  | "system"
  | "taskStatus"
  | "validationId"
  | "validationStatus"
  | "validationType"
>;

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/services/user-profile");

const VALIDATIONS_UNPUBLISHED_WITH_CELLXGENE: ExpectedValidationProperties[] = [
  {
    system: SYSTEM.CAP,
    taskStatus: TASK_STATUS.TODO,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.CELLXGENE,
    taskStatus: TASK_STATUS.DONE,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    taskStatus: TASK_STATUS.TODO,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
];

const VALIDATIONS_PUBLISHED_WITH_HCA: ExpectedValidationProperties[] = [
  {
    system: SYSTEM.CAP,
    taskStatus: TASK_STATUS.BLOCKED,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
    validationStatus: VALIDATION_STATUS.BLOCKED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.CELLXGENE,
    taskStatus: TASK_STATUS.TODO,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    taskStatus: TASK_STATUS.DONE,
    validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    taskStatus: TASK_STATUS.DONE,
    validationId:
      VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.METADATA,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    taskStatus: TASK_STATUS.DONE,
    validationId: VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
];

const VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_MISMATCH: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      taskStatus: TASK_STATUS.BLOCKED,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      taskStatus: TASK_STATUS.TODO,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.TODO,
      validationId:
        VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId: VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      taskStatus: TASK_STATUS.BLOCKED,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      taskStatus: TASK_STATUS.TODO,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId:
        VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId: VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      taskStatus: TASK_STATUS.BLOCKED,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      taskStatus: TASK_STATUS.TODO,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.DONE,
      validationId:
        VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.TODO,
      validationId: VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      taskStatus: TASK_STATUS.BLOCKED,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      taskStatus: TASK_STATUS.TODO,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      taskStatus: TASK_STATUS.TODO,
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
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
  endPgPool();
});

describe("getSourceDatasetValidationResults", () => {
  it("returns validations for source dataset with CELLxGENE collection and multiple atlases", async () => {
    await testValidations(
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE,
      [
        ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A,
        ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B,
      ],
      VALIDATIONS_UNPUBLISHED_WITH_CELLXGENE
    );
  });

  it("returns validations for source dataset with HCA project with matching title", async () => {
    await testValidations(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      [ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_HCA
    );
  });

  it("returns validations for source dataset with HCA project with mismatched title", async () => {
    await testValidations(
      SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
      [ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_MISMATCH
    );
  });

  it("returns validations for source dataset with HCA project with approximately-matching title", async () => {
    await testValidations(
      SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
      [ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH
    );
  });

  it("returns validations for source dataset with HCA project without primary data", async () => {
    await testValidations(
      SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
      [ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA
    );
  });

  it("returns validations for published source dataset without HCA project or CELLxGENE collection", async () => {
    await testValidations(
      SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE,
      [ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B],
      VALIDATIONS_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE
    );
  });
});

async function testValidations(
  testDataset: TestSourceDataset,
  testAtlases: TestAtlas[],
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
  const atlasIds = testAtlases.map((atlas) => atlas.id);
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
