import {
  IngestionTaskCounts,
  SYSTEM,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { updateTaskCounts } from "../app/services/atlases";
import { endPgPool } from "../app/services/database";
import {
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
} from "../testing/constants";
import {
  getExistingAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestAtlas } from "../testing/entities";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("updateTaskCounts", () => {
  it("Sets completed and total counts for HCA ingest, CELLxGENE ingest, CAP ingest, and all tasks", async () => {
    await updateTaskCounts();

    await testAtlasCounts(ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A, 28, 12, {
      [SYSTEM.CAP]: {
        completedCount: 0,
        count: 5,
      },
      [SYSTEM.CELLXGENE]: {
        completedCount: 1,
        count: 5,
      },
      [SYSTEM.HCA_DATA_REPOSITORY]: {
        completedCount: 4,
        count: 5,
      },
    });

    await testAtlasCounts(ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B, 14, 3, {
      [SYSTEM.CAP]: {
        completedCount: 1,
        count: 4,
      },
      [SYSTEM.CELLXGENE]: {
        completedCount: 2,
        count: 4,
      },
      [SYSTEM.HCA_DATA_REPOSITORY]: {
        completedCount: 0,
        count: 4,
      },
    });
  });
});

async function testAtlasCounts(
  atlas: TestAtlas,
  expectedCount: number,
  expectedCompletedCount: number,
  expectedIngestionCounts: IngestionTaskCounts
): Promise<void> {
  const { overview } = await getExistingAtlasFromDatabase(atlas.id);
  expect(overview.taskCount).toEqual(expectedCount);
  expect(overview.completedTaskCount).toEqual(expectedCompletedCount);
  expect(overview.ingestionTaskCounts).toEqual(expectedIngestionCounts);
}
