import {
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerValidationResult,
  SYSTEM,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
} from "app/apis/catalog/hca-atlas-tracker/common/entities";
import pg from "pg";
import { endPgPool, getPoolClient } from "../app/services/database";
import { getSourceStudyValidationResults } from "../app/services/validations";
import {
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
  SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_HCA,
  SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
  SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestSourceStudy } from "../testing/entities";

type ExpectedValidationProperties = Pick<
  HCAAtlasTrackerValidationResult,
  "system" | "validationId" | "validationStatus" | "validationType"
>;

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/services/user-profile");

const VALIDATIONS_UNPUBLISHED_WITH_CELLXGENE: ExpectedValidationProperties[] = [
  {
    system: SYSTEM.CAP,
    validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.CELLXGENE,
    validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
];

const VALIDATIONS_PUBLISHED_WITH_HCA: ExpectedValidationProperties[] = [
  {
    system: SYSTEM.CAP,
    validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
    validationStatus: VALIDATION_STATUS.BLOCKED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.CELLXGENE,
    validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
    validationStatus: VALIDATION_STATUS.FAILED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    validationId: VALIDATION_ID.SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.METADATA,
  },
  {
    system: SYSTEM.HCA_DATA_REPOSITORY,
    validationId: VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
    validationStatus: VALIDATION_STATUS.PASSED,
    validationType: VALIDATION_TYPE.INGEST,
  },
];

const VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_MISMATCH: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId:
        VALIDATION_ID.SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId:
        VALIDATION_ID.SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId:
        VALIDATION_ID.SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationStatus: VALIDATION_STATUS.BLOCKED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

const VALIDATIONS_PUBLISHED_WITH_CAP_AND_CELLXGENE: ExpectedValidationProperties[] =
  [
    {
      system: SYSTEM.CAP,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.CELLXGENE,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationStatus: VALIDATION_STATUS.PASSED,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationStatus: VALIDATION_STATUS.FAILED,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

let client: pg.PoolClient;

beforeAll(async () => {
  await resetDatabase();
  client = await getPoolClient();
});

afterAll(() => {
  client.release();
  endPgPool();
});

describe("getSourceStudyValidationResults", () => {
  it("returns validations for source study with CELLxGENE collection and multiple atlases", async () => {
    await testValidations(
      SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE,
      [
        ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
        ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
      ],
      VALIDATIONS_UNPUBLISHED_WITH_CELLXGENE
    );
  });

  it("returns validations for source study with HCA project with matching title", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_HCA,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_HCA
    );
  });

  it("returns validations for source study with HCA project with mismatched title", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_MISMATCH
    );
  });

  it("returns validations for source study with HCA project with approximately-matching title", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH
    );
  });

  it("returns validations for source study with HCA project without primary data", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A],
      VALIDATIONS_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA
    );
  });

  it("returns validations for published source study without HCA project or CELLxGENE collection", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B],
      VALIDATIONS_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE
    );
  });

  it("returns validations for published source study with CAP dataset and no CELLxGENE collection", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B],
      VALIDATIONS_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE
    );
  });

  it("returns validations for published source study with CAP dataset and CELLxGENE collection", async () => {
    await testValidations(
      SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE,
      [ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B],
      VALIDATIONS_PUBLISHED_WITH_CAP_AND_CELLXGENE
    );
  });
});

async function testValidations(
  testStudy: TestSourceStudy,
  testAtlases: TestAtlas[],
  expectedValidationProperties: ExpectedValidationProperties[]
): Promise<void> {
  const sourceStudy = (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [testStudy.id]
    )
  ).rows[0];
  const validationResults = await getSourceStudyValidationResults(
    sourceStudy,
    client
  );
  expect(validationResults).toHaveLength(expectedValidationProperties.length);
  const atlasIds = testAtlases.map((atlas) => atlas.id);
  for (const [i, validationResult] of validationResults.entries()) {
    expect(validationResult).toMatchObject(expectedValidationProperties[i]);
    expect(validationResult.atlasIds).toEqual(atlasIds);
    expect(validationResult.entityId).toEqual(testStudy.id);
    expect(validationResult.entityTitle).toEqual(
      "unpublishedInfo" in testStudy
        ? testStudy.unpublishedInfo.title
        : testStudy.publication?.title ?? testStudy.id
    );
  }
}
