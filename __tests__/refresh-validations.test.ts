import { refreshValidations } from "app/services/validations";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBValidation,
  VALIDATION_ID,
  VALIDATION_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool, query } from "../app/services/database";
import {
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B,
  SOURCE_DATASET_PUBLISHED_WITH_HCA,
  SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestAtlas, TestSourceDataset } from "../testing/entities";

jest.mock("../app/services/hca-projects");
jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("refreshValidations", () => {
  it("updates source dataset validations and atlas task counts", async () => {
    const aExpectedSubjectTasksBefore = 5;
    const aExpectedSubjectCompletedTasksBefore = 4;
    const aExpectedSubjectTasksAfter = 3;
    const aExpectedSubjectCompletedTasksAfter = 1;

    const bExpectedSubjectTasksBefore = 1;
    const bExpectedSubjectCompletedTasksBefore = 1;
    const bExpectedSubjectTasksAfter = 1;
    const bExpectedSubjectCompletedTasksAfter = 0;

    const unpublishedWithCellxGeneInCellxGeneBefore = await getSavedValidation(
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE,
      VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE
    );
    const publishedWithHcaInHcaBefore = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY
    );
    const publishedWithHcaHcaTitleBefore = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY
    );
    const publishedWithHcaPrimaryDataBefore = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA
    );
    const publishedWithHcaTitleMismatchHcaTitleBefore =
      await getSavedValidation(
        SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
        VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY
      );

    const {
      completedTaskCount: aCompletedTaskCountBefore,
      taskCount: aTaskCountBefore,
    } = await getSavedAtlasOverview(ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A);
    const {
      completedTaskCount: bCompletedTaskCountBefore,
      taskCount: bTaskCountBefore,
    } = await getSavedAtlasOverview(ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B);

    expect(
      unpublishedWithCellxGeneInCellxGeneBefore?.validation_info
        .validationStatus
    ).toEqual(VALIDATION_STATUS.PASSED);
    expect(
      publishedWithHcaInHcaBefore?.validation_info.validationStatus
    ).toEqual(VALIDATION_STATUS.PASSED);
    expect(
      publishedWithHcaHcaTitleBefore?.validation_info.validationStatus
    ).toEqual(VALIDATION_STATUS.PASSED);
    expect(
      publishedWithHcaPrimaryDataBefore?.validation_info.validationStatus
    ).toEqual(VALIDATION_STATUS.PASSED);
    expect(
      publishedWithHcaTitleMismatchHcaTitleBefore?.validation_info
        .validationStatus
    ).toEqual(VALIDATION_STATUS.FAILED);

    await query(
      `UPDATE hat.source_datasets SET sd_info=sd_info||'{"cellxgeneCollectionId":null}' WHERE id=$1`,
      [SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE.id]
    );
    await query(
      `UPDATE hat.source_datasets SET sd_info=sd_info||'{"hcaProjectId":null}' WHERE id=$1`,
      [SOURCE_DATASET_PUBLISHED_WITH_HCA.id]
    );
    await query(
      `UPDATE hat.source_datasets SET sd_info=jsonb_set(sd_info, '{publication, title}', '"Published With HCA Title Mismatch MISMATCHED"') WHERE id=$1`,
      [SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH.id]
    );

    await refreshValidations();

    const unpublishedWithCellxGeneInCellxGeneAfter = await getSavedValidation(
      SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE,
      VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE
    );
    const publishedWithHcaInHcaAfter = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY
    );
    const publishedWithHcaHcaTitleAfter = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY
    );
    const publishedWithHcaPrimaryDataAfter = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA,
      VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA
    );
    const publishedWithHcaTitleMismatchHcaTitleAfter = await getSavedValidation(
      SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
      VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY
    );

    const {
      completedTaskCount: aCompletedTaskCountAfter,
      taskCount: aTaskCountAfter,
    } = await getSavedAtlasOverview(ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A);
    const {
      completedTaskCount: bCompletedTaskCountAfter,
      taskCount: bTaskCountAfter,
    } = await getSavedAtlasOverview(ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B);

    expect(
      unpublishedWithCellxGeneInCellxGeneAfter?.validation_info.validationStatus
    ).toEqual(VALIDATION_STATUS.FAILED);
    expect(
      publishedWithHcaInHcaAfter?.validation_info.validationStatus
    ).toEqual(VALIDATION_STATUS.FAILED);
    expect(publishedWithHcaHcaTitleAfter).toBeUndefined();
    expect(publishedWithHcaPrimaryDataAfter).toBeUndefined();
    expect(
      publishedWithHcaTitleMismatchHcaTitleAfter?.validation_info
        .validationStatus
    ).toEqual(VALIDATION_STATUS.PASSED);

    expect(aTaskCountAfter).toEqual(
      aTaskCountBefore -
        aExpectedSubjectTasksBefore +
        aExpectedSubjectTasksAfter
    );
    expect(aCompletedTaskCountAfter).toEqual(
      aCompletedTaskCountBefore -
        aExpectedSubjectCompletedTasksBefore +
        aExpectedSubjectCompletedTasksAfter
    );
    expect(bTaskCountAfter).toEqual(
      bTaskCountBefore -
        bExpectedSubjectTasksBefore +
        bExpectedSubjectTasksAfter
    );
    expect(bCompletedTaskCountAfter).toEqual(
      bCompletedTaskCountBefore -
        bExpectedSubjectCompletedTasksBefore +
        bExpectedSubjectCompletedTasksAfter
    );
  });
});

async function getSavedAtlasOverview(
  atlas: TestAtlas
): Promise<HCAAtlasTrackerDBAtlasOverview> {
  return (
    await query<Pick<HCAAtlasTrackerDBAtlas, "overview">>(
      "SELECT overview FROM hat.atlases WHERE id=$1",
      [atlas.id]
    )
  ).rows[0].overview;
}

async function getSavedValidation(
  dataset: TestSourceDataset,
  validationId: VALIDATION_ID
): Promise<HCAAtlasTrackerDBValidation | undefined> {
  return (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=$1 AND validation_id=$2",
      [dataset.id, validationId]
    )
  ).rows[0];
}
